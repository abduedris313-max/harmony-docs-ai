/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse, Tool, HarmCategory, HarmBlockThreshold } from '@google/genai';
import { isRTLText } from './docParser.js';

// Primary and fallback models for high availability
const PRIMARY_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODEL = 'gemini-3.7-flash';

let aiInstance: GoogleGenAI | null = null;

function getAi(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing.');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

/**
 * Helper to execute an async API call with exponential backoff and multi-model fallback.
 */
async function callWithModelFallback<T>(
  apiCall: (model: string) => Promise<T>,
  models: string[] = [PRIMARY_MODEL, FALLBACK_MODEL],
  maxRetriesPerModel: number = 2
): Promise<T> {
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetriesPerModel; attempt++) {
      try {
        return await apiCall(model);
      } catch (err: any) {
        lastError = err;
        const errMsg = String(err?.message || err || '');
        const is503orTransient =
          errMsg.includes('503') ||
          errMsg.includes('UNAVAILABLE') ||
          errMsg.includes('high demand') ||
          errMsg.includes('429') ||
          errMsg.includes('RESOURCE_EXHAUSTED') ||
          errMsg.includes('overloaded');

        if (is503orTransient && attempt < maxRetriesPerModel) {
          const delayMs = 300 * Math.pow(2, attempt) + Math.random() * 200;
          console.log(`[Gemini API] Retry attempt ${attempt + 1}/${maxRetriesPerModel + 1} for ${model} after ${Math.round(delayMs)}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        // If it's a 503 / 429 on this model and we have another model candidate, break to next model
        if (is503orTransient && models.indexOf(model) < models.length - 1) {
          console.log(`[Gemini API] Model ${model} unavailable. Trying fallback model...`);
          break;
        }

        // Non-transient error or no more models to try
        if (!is503orTransient) {
          throw err;
        }
      }
    }
  }

  throw lastError;
}

export interface GenerateOptions {
  prompt: string;
  urls?: string[];
  documents?: Array<{
    name: string;
    type: string;
    content: string;
    base64Data?: string;
    isRTL?: boolean;
  }>;
  history?: Array<{
    sender: 'user' | 'model' | 'system';
    text: string;
  }>;
  language?: string;
  isRTL?: boolean;
}

export async function generateContent(options: GenerateOptions) {
  const ai = getAi();
  const { prompt, urls = [], documents = [], history = [], language = 'auto', isRTL } = options;

  // Build context parts
  const parts: Array<any> = [];

  // Determine if query or context is RTL
  const promptIsRTL = isRTL ?? isRTLText(prompt);

  // System instruction for formatting, citations, and RTL handling
  let systemInstruction = `You are Harmony DocAI, an intelligent knowledge assistant capable of deep document analysis across PDF, Microsoft Word (.docx), web URLs, and plain text.
Always provide accurate, clear, and comprehensive answers based on the provided documents and URLs.
Formatting Rules:
1. Cite specific documents or URLs when referencing facts or sections.
2. Structure output cleanly with markdown headers, bullet points, and code blocks where applicable.
3. Multilingual & RTL Support: If the user queries in an RTL language (such as Arabic, Hebrew, Persian, Urdu) or requests RTL responses, format the response naturally in that language with proper punctuation and natural right-to-left reading flow.
4. If documents are provided, synthesize findings across multiple files if relevant.`;

  if (promptIsRTL || language === 'ar' || language === 'he' || language === 'fa' || language === 'ur') {
    systemInstruction += `\nNote: The user prefers Right-to-Left (RTL) output. Structure your Arabic/Hebrew/Persian/Urdu phrasing smoothly and accurately.`;
  }

  // Include previous conversation history context if available
  if (history.length > 0) {
    const recentHistory = history.slice(-6);
    let convoContext = "Previous conversation:\n";
    for (const msg of recentHistory) {
      convoContext += `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}\n`;
    }
    parts.push({ text: convoContext + '\n---\n' });
  }

  // Add document texts into context
  if (documents.length > 0) {
    let docContext = "KNOWLEDGE BASE DOCUMENTS:\n";
    for (let i = 0; i < documents.length; i++) {
      const doc = documents[i];
      docContext += `\n--- Document [${i + 1}]: "${doc.name}" (Type: ${doc.type.toUpperCase()}) ---\n`;
      // Truncate document text if excessively large to protect context limits
      const docText = doc.content.length > 40000 ? doc.content.slice(0, 40000) + '... [truncated]' : doc.content;
      docContext += docText + '\n';
    }
    parts.push({ text: docContext + '\n---\n' });
  }

  // Add URL context prompt
  let promptText = prompt;
  if (urls.length > 0) {
    const urlList = urls.join('\n');
    promptText = `${promptText}\n\nRelevant Web Documentation URLs:\n${urlList}`;
  }

  parts.push({ text: promptText });

  const tools: Tool[] = [];
  if (urls.length > 0) {
    tools.push({ urlContext: {} });
  }

  try {
    const response: GenerateContentResponse = await callWithModelFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts }],
        config: {
          systemInstruction,
          safetySettings,
          tools: tools.length > 0 ? tools : undefined,
        },
      });
    });

    const text = response.text || '';
    const candidate = response.candidates?.[0];
    let extractedUrlContextMetadata = undefined;

    if (candidate?.urlContextMetadata?.urlMetadata) {
      extractedUrlContextMetadata = candidate.urlContextMetadata.urlMetadata;
    }

    const detectedResponseRTL = isRTLText(text);

    return {
      text,
      urlContextMetadata: extractedUrlContextMetadata,
      isRTL: detectedResponseRTL,
    };
  } catch (error: any) {
    console.error('All model attempts failed in generateContent:', error);
    
    // Provide a helpful fallback response if upstream servers are under extreme temporary load
    const is503 = String(error?.message || '').includes('503') || String(error?.message || '').includes('UNAVAILABLE');
    if (is503) {
      const isArabic = promptIsRTL || language === 'ar';
      if (isArabic) {
        return {
          text: `⚠️ **الخدمة تحت ضغط مؤقت مرتفع**\n\nالنموذج يواجه ضغطاً كبيراً في الوقت الحالي. لقد تم حفظ استفسارك ومستنداتك بنجاح. يرجى إعادة المحاولة بعد بضع لحظات.\n\n**المستندات المحملة:** ${documents.map(d => d.name).join(', ') || 'لا توجد مستندات'}`,
          isRTL: true,
        };
      } else {
        return {
          text: `⚠️ **Service Temporarily Under High Demand**\n\nThe Gemini model is currently experiencing a temporary surge in traffic. Your knowledge base and query remain safely loaded. Please press the send button again in a few seconds.\n\n**Loaded Documents:** ${documents.map(d => d.name).join(', ') || 'None'}`,
          isRTL: false,
        };
      }
    }

    throw error;
  }
}

/**
 * Generates context-aware smart fallback suggestions deterministically.
 */
function buildDeterministicSuggestions(options: {
  urls?: string[];
  documents?: Array<{ name: string; type: string; content: string }>;
  language?: string;
  isRTL?: boolean;
}): string[] {
  const { urls = [], documents = [], language = 'auto', isRTL } = options;
  const isRTLRequest = isRTL || language === 'ar' || language === 'he' || language === 'fa' || language === 'ur' ||
    documents.some(d => isRTLText(d.name) || isRTLText(d.content.slice(0, 100)));

  if (isRTLRequest) {
    if (documents.length > 0) {
      const docName = documents[0].name.replace(/\.[^/.]+$/, '');
      return [
        `لخص لي أهم محاور مستند "${docName}"`,
        `ما هي النقاط والمتطلبات الرئيسية المذكورة؟`,
        `اشرح الهيكلية والمفاهيم الأساسية بالتفصيل`,
        `قارن بين الأقسام والنتائج الواردة في الملف`,
      ];
    }
    return [
      'ما هي أبرز المفاهيم في هذه الوثائق؟',
      'لخص المحتوى التقني في نقاط واضحة',
      'كيف يمكن تطبيق هذه التعليمات خطوة بخطوة؟',
      'ما هي المتطلبات والشروط المذكورة؟',
    ];
  }

  if (documents.length > 0) {
    const docName = documents[0].name.replace(/\.[^/.]+$/, '');
    return [
      `Summarize key takeaways from "${docName}"`,
      `What are the core technical requirements?`,
      `Explain the architecture and main concepts`,
      `Compare findings across the uploaded sections`,
    ];
  }

  if (urls.length > 0) {
    return [
      'What are the main endpoints or APIs covered?',
      'How do I authenticate and get started?',
      'Summarize the primary features and code examples',
      'What are the rate limits and best practices?',
    ];
  }

  return [
    'Summarize the uploaded documents',
    'What are the key architectural takeaways?',
    'Highlight critical requirements and steps',
    'Compare the primary sections',
  ];
}

export async function getSmartSuggestions(options: {
  urls?: string[];
  documents?: Array<{ name: string; type: string; content: string }>;
  language?: string;
  isRTL?: boolean;
}) {
  const { urls = [], documents = [], language = 'auto', isRTL } = options;

  let knowledgeSummary = '';
  if (documents.length > 0) {
    knowledgeSummary += 'Document Titles & Excerpts:\n';
    for (const doc of documents.slice(0, 5)) {
      knowledgeSummary += `- ${doc.name} (${doc.type}): ${doc.content.slice(0, 300)}...\n`;
    }
  }
  if (urls.length > 0) {
    knowledgeSummary += `Documentation URLs:\n${urls.slice(0, 8).join('\n')}\n`;
  }

  if (!knowledgeSummary) {
    knowledgeSummary = 'General tech, API documentation, PDF and Word document review.';
  }

  const isRTLRequest = isRTL || language === 'ar' || language === 'he' || language === 'fa' || language === 'ur';

  const promptText = `You are an AI analyzing the following documentation sources and uploaded PDF/Word knowledge base:
${knowledgeSummary}

Generate 4 short, distinct, and actionable question prompts that a user or developer might ask to explore these documents.
Language / Script: ${isRTLRequest ? 'Generate questions in the detected RTL language (e.g., Arabic if Arabic docs, Hebrew if Hebrew, etc.) or in Arabic/English according to context.' : 'Generate in English or the document language.'}

Return ONLY a valid JSON object matching this schema:
{"suggestions": ["Question 1", "Question 2", "Question 3", "Question 4"]}`;

  try {
    const ai = getAi();
    const response: GenerateContentResponse = await callWithModelFallback(async (modelName) => {
      return await ai.models.generateContent({
        model: modelName,
        contents: [{ role: 'user', parts: [{ text: promptText }] }],
        config: {
          safetySettings,
          responseMimeType: 'application/json',
        },
      });
    });

    let suggestions: string[] = [];
    try {
      const raw = response.text?.trim() || '{}';
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
        suggestions = parsed.suggestions.filter((s: any) => typeof s === 'string' && s.trim().length > 0);
      }
    } catch (parseErr) {
      console.warn('Failed to parse suggestions JSON, falling back:', parseErr);
    }

    if (suggestions.length > 0) {
      return { suggestions };
    }
  } catch (err) {
    console.warn('[Gemini Suggestions] Error or high demand encountered, using contextual fallback suggestions:', err);
  }

  // Graceful contextual fallback
  return {
    suggestions: buildDeterministicSuggestions(options),
  };
}
