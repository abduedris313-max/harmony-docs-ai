/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// @ts-ignore
import * as pdfParseModule from 'pdf-parse';
// @ts-ignore
import * as mammothModule from 'mammoth';

const pdfParse = (pdfParseModule as any).default || pdfParseModule;
const mammoth = (mammothModule as any).default || mammothModule;

// Unicode Regex ranges for RTL scripts:
// Arabic (\u0600-\u06FF, \u0750-\u077F, \u08A0-\u08FF, \uFB50-\uFDFF, \uFE70-\uFEFF)
// Hebrew (\u0590-\u05FF, \uFB1D-\uFB4F)
// Syriac, Thaana, Samaritan, Mandaic, etc.
const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detects if the given text is predominantly Right-to-Left (RTL).
 */
export function isRTLText(text: string): boolean {
  if (!text) return false;
  // Clean whitespace and punctuation
  const clean = text.replace(/[\s\d\p{P}]/gu, '');
  if (!clean) return false;

  let rtlChars = 0;
  for (let i = 0; i < Math.min(clean.length, 1000); i++) {
    if (RTL_REGEX.test(clean[i])) {
      rtlChars++;
    }
  }
  const sampleLength = Math.min(clean.length, 1000);
  return (rtlChars / sampleLength) > 0.25; // 25%+ RTL characters indicates RTL document/message
}

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  pageCount?: number;
  isRTL: boolean;
  type: 'pdf' | 'docx' | 'doc' | 'text';
  base64Data?: string;
}

/**
 * Parses a PDF buffer into plain text and metadata.
 */
export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedDocumentResult> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text ? data.text.trim() : '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const pageCount = data.numpages || 1;
    const isRTL = isRTLText(text);
    const base64Data = buffer.toString('base64');

    return {
      text,
      wordCount,
      pageCount,
      isRTL,
      type: 'pdf',
      base64Data,
    };
  } catch (error: any) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error(`Failed to parse PDF file: ${error.message || 'Corrupted or password-protected PDF'}`);
  }
}

/**
 * Parses a Word (.docx / .doc) buffer into plain text and metadata.
 */
export async function parseWordBuffer(buffer: Buffer, originalname: string): Promise<ParsedDocumentResult> {
  try {
    // Mammoth parses DOCX natively
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value ? result.value.trim() : '';
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    // Estimate page count (~350 words per page)
    const pageCount = Math.max(1, Math.ceil(wordCount / 350));
    const isRTL = isRTLText(text);

    return {
      text,
      wordCount,
      pageCount,
      isRTL,
      type: 'docx',
    };
  } catch (error: any) {
    console.error('Error parsing Word document buffer:', error);
    throw new Error(`Failed to parse Word document: ${error.message || 'Invalid or older binary DOC format'}`);
  }
}

/**
 * Parses plain text / Markdown buffer.
 */
export function parseTextBuffer(buffer: Buffer): ParsedDocumentResult {
  const text = buffer.toString('utf-8').trim();
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const pageCount = Math.max(1, Math.ceil(wordCount / 350));
  const isRTL = isRTLText(text);

  return {
    text,
    wordCount,
    pageCount,
    isRTL,
    type: 'text',
  };
}
