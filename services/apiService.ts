/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ChatMessage, KnowledgeDocument, UrlContextMetadataItem } from '../types';

export interface GenerateResponse {
  text: string;
  urlContextMetadata?: UrlContextMetadataItem[];
  isRTL?: boolean;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

/**
 * Sends a chat query to the server-side Gemini API with attached URLs and parsed documents.
 */
export async function sendChatMessage(
  prompt: string,
  urls: string[],
  documents: KnowledgeDocument[],
  history: ChatMessage[],
  language: string = 'auto',
  isRTL?: boolean
): Promise<GenerateResponse> {
  const payload = {
    prompt,
    urls,
    documents: documents.map((doc) => ({
      name: doc.name,
      type: doc.type,
      content: doc.content,
      base64Data: doc.base64Data,
      isRTL: doc.isRTL,
    })),
    history: history.slice(-6).map((msg) => ({
      sender: msg.sender,
      text: msg.text,
    })),
    language,
    isRTL,
  };

  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errData.error || `Server responded with status ${response.status}`);
  }

  return await response.json();
}

/**
 * Fetches dynamic smart suggestions based on current document and URL knowledge base.
 */
export async function fetchSmartSuggestions(
  urls: string[],
  documents: KnowledgeDocument[],
  language: string = 'auto',
  isRTL?: boolean
): Promise<SuggestionsResponse> {
  const payload = {
    urls,
    documents: documents.map((doc) => ({
      name: doc.name,
      type: doc.type,
      content: doc.content.slice(0, 1000),
    })),
    language,
    isRTL,
  };

  const response = await fetch('/api/gemini/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    return {
      suggestions: [
        'Summarize the uploaded documents',
        'What are the key points covered?',
        'Highlight critical requirements',
        'Compare the main concepts',
      ],
    };
  }

  return await response.json();
}

/**
 * Uploads and parses PDF, Word (.docx/.doc), and text files on the backend.
 */
export async function parseUploadedFiles(files: File[]): Promise<KnowledgeDocument[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const response = await fetch('/api/documents/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errData.error || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.documents as KnowledgeDocument[];
}

/**
 * Requests auto-tagging for a document via Gemini.
 */
export async function autoTagDocumentApi(doc: { name: string; content: string; type: string }): Promise<{ category: string; tags: string[] }> {
  const response = await fetch('/api/documents/tag', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: doc.name,
      content: doc.content,
      type: doc.type,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Auto-tag failed' }));
    throw new Error(errData.error || 'Failed to auto-tag document');
  }

  return await response.json();
}
