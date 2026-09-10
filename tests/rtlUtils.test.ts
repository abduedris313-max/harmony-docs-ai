/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect } from 'vitest';
import { isRTL, resolveDirection, t, SUPPORTED_LANGUAGES } from '../utils/rtlUtils';

describe('RTL and Multilingual Utilities', () => {
  it('detects standard English text as LTR', () => {
    expect(isRTL('Hello, this is a financial report.')).toBe(false);
    expect(isRTL('Gemini 2.5 Flash multimodality.')).toBe(false);
  });

  it('detects Arabic text as RTL', () => {
    expect(isRTL('مرحبا بك في نظام تحليل المستندات الذكي')).toBe(true);
    expect(isRTL('تقرير الربع الثالث المالي لعام 2026')).toBe(true);
  });

  it('detects Hebrew text as RTL', () => {
    expect(isRTL('שלום עולם, דוח פיננסי לרבעון השלישי')).toBe(true);
  });

  it('resolves direction based on explicit setting or auto detection', () => {
    expect(resolveDirection('rtl')).toBe('rtl');
    expect(resolveDirection('ltr')).toBe('ltr');
    expect(resolveDirection('auto', 'مرحبا')).toBe('rtl');
    expect(resolveDirection('auto', 'Hello')).toBe('ltr');
    expect(resolveDirection('auto')).toBe('ltr');
  });

  it('returns appropriate translation strings for supported languages', () => {
    const enTitle = t('en', 'chatTab');
    const arTitle = t('ar', 'chatTab');
    const amTitle = t('am', 'chatTab');

    expect(enTitle).toBe('Chat');
    expect(arTitle).toBe('المحادثة');
    expect(amTitle).toBe('ውይይት');
  });

  it('falls back gracefully to English when key is missing in target language', () => {
    const fallback = t('fr', 'nonExistentKey');
    expect(fallback).toBe('nonExistentKey');
  });

  it('verifies all supported languages have valid configuration', () => {
    expect(SUPPORTED_LANGUAGES.length).toBeGreaterThan(5);
    const arabic = SUPPORTED_LANGUAGES.find((l) => l.code === 'ar');
    expect(arabic?.isRTL).toBe(true);
    const amharic = SUPPORTED_LANGUAGES.find((l) => l.code === 'am');
    expect(amharic?.code).toBe('am');
  });
});
