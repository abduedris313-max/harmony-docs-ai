/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { SAMPLE_DOCUMENTS } from '../utils/sampleDocuments';

describe('Sample Documents Integrity', () => {
  it('contains valid multilingual sample documents', () => {
    expect(SAMPLE_DOCUMENTS.length).toBeGreaterThanOrEqual(4);
  });

  it('contains valid Arabic, English, and Amharic documents', () => {
    const arabicDoc = SAMPLE_DOCUMENTS.find((d) => d.name.includes('العربية') || d.isRTL);
    expect(arabicDoc).toBeDefined();
    expect(arabicDoc?.isRTL).toBe(true);

    const amharicDoc = SAMPLE_DOCUMENTS.find((d) => d.id === 'sample-doc-docx-amharic');
    expect(amharicDoc).toBeDefined();
    expect(amharicDoc?.type).toBe('docx');

    const englishDoc = SAMPLE_DOCUMENTS.find((d) => d.id === 'sample-doc-pdf-gemini');
    expect(englishDoc).toBeDefined();
    expect(englishDoc?.category).toBe('Technical');
  });

  it('ensures each document has valid required attributes', () => {
    SAMPLE_DOCUMENTS.forEach((doc) => {
      expect(doc.id).toBeTruthy();
      expect(doc.name).toBeTruthy();
      expect(['pdf', 'docx', 'doc', 'txt']).toContain(doc.type);
      expect(doc.content.length).toBeGreaterThan(50);
      expect(doc.pageCount).toBeGreaterThanOrEqual(1);
      expect(doc.wordCount).toBeGreaterThanOrEqual(1);
      expect(doc.fileSize).toBeGreaterThan(0);
      expect(Array.isArray(doc.tags)).toBe(true);
    });
  });
});
