/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppDirection, AppLanguage } from '../types';

// Supported App Languages
export const SUPPORTED_LANGUAGES: AppLanguage[] = [
  { code: 'auto', name: 'Auto Detect', nativeName: 'تلقائي / Auto', isRTL: false, flagEmoji: '🌐' },
  { code: 'am', name: 'Amharic', nativeName: 'አማርኛ', isRTL: false, flagEmoji: '🇪🇹' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', isRTL: true, flagEmoji: '🇸🇦' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', isRTL: true, flagEmoji: '🇮🇱' },
  { code: 'fa', name: 'Persian (Farsi)', nativeName: 'فارسی', isRTL: true, flagEmoji: '🇮🇷' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', isRTL: true, flagEmoji: '🇵🇰' },
  { code: 'en', name: 'English', nativeName: 'English (US)', isRTL: false, flagEmoji: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', isRTL: false, flagEmoji: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', isRTL: false, flagEmoji: '🇫🇷' },
];

// RTL Unicode character matcher (Arabic, Hebrew, Persian, Urdu)
const RTL_REGEX = /[\u0590-\u05FF\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB1D-\uFB4F\uFB50-\uFDFF\uFE70-\uFEFF]/;

/**
 * Detects whether a string is primarily RTL.
 */
export function isRTL(text: string): boolean {
  if (!text) return false;
  const clean = text.replace(/[\s\d\p{P}]/gu, '');
  if (!clean) return false;

  let rtlChars = 0;
  for (let i = 0; i < Math.min(clean.length, 500); i++) {
    if (RTL_REGEX.test(clean[i])) {
      rtlChars++;
    }
  }
  return (rtlChars / Math.min(clean.length, 500)) > 0.2;
}

/**
 * Resolves effective direction ('rtl' | 'ltr') based on user settings and text content.
 */
export function resolveDirection(directionSetting: AppDirection, text?: string): 'rtl' | 'ltr' {
  if (directionSetting === 'rtl') return 'rtl';
  if (directionSetting === 'ltr') return 'ltr';
  // If auto, evaluate the text or system language
  if (text) {
    return isRTL(text) ? 'rtl' : 'ltr';
  }
  return 'ltr';
}

/**
 * Multi-language UI translations
 */
export const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    appTitle: 'Harmony DocAI',
    appSubtitle: 'iOS Knowledge Assistant for PDF, Word & URLs',
    chatTab: 'Chat',
    docsTab: 'Documents & URLs',
    settingsTab: 'Settings',
    searchPlaceholder: 'Ask anything about your PDF, Word or web docs...',
    uploadDocs: 'Upload PDF / Word',
    addUrl: 'Add URL',
    activeGroup: 'Active Source Collection',
    suggestionsTitle: 'Suggested Questions',
    noDocsYet: 'No documents uploaded yet. Upload a PDF or Word file to chat!',
    noUrlsYet: 'No URLs added to this group.',
    readingDocument: 'Analyzing document content...',
    thinking: 'Synthesizing knowledge...',
    copySuccess: 'Copied to clipboard',
    listen: 'Read aloud',
    stopAudio: 'Stop reading',
    wordCount: 'words',
    pages: 'pages',
    detectedRtl: 'RTL Script',
    detectedLtr: 'LTR Script',
    rtlMode: 'Right-to-Left (RTL) Layout',
    language: 'Language',
    soundEffects: 'iOS Sound Effects',
    haptics: 'Haptic Feedback',
    sampleDocs: 'Load Sample Documents',
    exportChat: 'Export Chat',
    clearChat: 'Clear Messages',
    addSamplePdf: 'Sample PDF (Gemini API Guide)',
    addSampleDocx: 'Sample Word (Arabic AI Overview)',
  },
  am: {
    appTitle: 'ሃርሞኒ DocAI',
    appSubtitle: 'ለPDF፣ Word እና ድረ-ገጾች የiOS እውቀት ረዳት',
    chatTab: 'ውይይት',
    docsTab: 'ሰነዶች እና ሊንኮች',
    settingsTab: 'ቅንብሮች',
    searchPlaceholder: 'ስለ PDF፣ Word ወይም ድረ-ገጽ ሰነዶችዎ ማንኛውንም ጥያቄ ይጠይቁ...',
    uploadDocs: 'PDF / Word ስቀል',
    addUrl: 'ሊንክ ጨምር',
    activeGroup: 'ንቁ ምንጭ ስብስብ',
    suggestionsTitle: 'የተጠቆሙ ጥያቄዎች',
    noDocsYet: 'እስካሁን ምንም ሰነድ አልተሰቀለም። ለመወያየት PDF ወይም Word ፋይል ይሰቅሉ!',
    noUrlsYet: 'በዚህ ቡድን ውስጥ ምንም ሊንክ አልተጨመረም።',
    readingDocument: 'የሰነዱን ይዘት በመተንተን ላይ...',
    thinking: 'እውቀትን በማቀናጀት ላይ...',
    copySuccess: 'ወደ ቅንጥብ ሰሌዳ ተቀድቷል',
    listen: 'በድምፅ አንብብ',
    stopAudio: 'ንባብ አቁም',
    wordCount: 'ቃላት',
    pages: 'ገጾች',
    detectedRtl: 'RTL ጽሑፍ',
    detectedLtr: 'LTR ጽሑፍ',
    rtlMode: 'ከቀኝ-ወደ-ግራ (RTL) አቀማመጥ',
    language: 'ቋንቋ',
    soundEffects: 'የiOS ድምፅ ውጤቶች',
    haptics: 'የንክኪ ምላሽ (Haptics)',
    sampleDocs: 'ናሙና ሰነዶችን ጫን',
    exportChat: 'ውይይቱን ላክ',
    clearChat: 'መልዕክቶችን አጽዳ',
    addSamplePdf: 'ናሙና PDF (የGemini መመሪያ)',
    addSampleDocx: 'ናሙና Word (የአማርኛ መግለጫ)',
  },
  ar: {
    appTitle: 'هارموني دوك الذكي',
    appSubtitle: 'مساعد المعرفة الذكي لملفات PDF والوورد والروابط',
    chatTab: 'المحادثة',
    docsTab: 'المستندات والروابط',
    settingsTab: 'الإعدادات',
    searchPlaceholder: 'اسأل أي شيء عن ملفات PDF أو Word أو الروابط...',
    uploadDocs: 'رفع ملف PDF / Word',
    addUrl: 'إضافة رابط',
    activeGroup: 'مجموعة المصادر النشطة',
    suggestionsTitle: 'أسئلة مقترحة',
    noDocsYet: 'لم يتم رفع مستندات بعد. ارفع ملف PDF أو Word لبدء التحليل!',
    noUrlsYet: 'لا توجد روابط مضافة لهذه المجموعة.',
    readingDocument: 'جاري قراءة واستخراج محتوى المستند...',
    thinking: 'جاري التفكير وتوليد الإجابة...',
    copySuccess: 'تم النسخ إلى الحافظة',
    listen: 'قراءة صوتية',
    stopAudio: 'إيقاف الصوت',
    wordCount: 'كلمة',
    pages: 'صفحات',
    detectedRtl: 'نص عربي / يميني (RTL)',
    detectedLtr: 'نص يساري (LTR)',
    rtlMode: 'واجهة من اليمين إلى اليسار (RTL)',
    language: 'اللغة',
    soundEffects: 'المؤثرات الصوتية بنمط iOS',
    haptics: 'الاستجابة اللمسية (Haptics)',
    sampleDocs: 'تحميل مستندات تجريبية',
    exportChat: 'تصدير المحادثة',
    clearChat: 'مسح الرسائل',
    addSamplePdf: 'نموذج PDF (دليل واجهة Gemini)',
    addSampleDocx: 'نموذج Word (نظرة عامة باللغة العربية)',
  },
  he: {
    appTitle: 'הרמוני DocAI',
    appSubtitle: 'עוזר ידע חכם למסמכי PDF, וורד וקישורים',
    chatTab: 'צ׳אט',
    docsTab: 'מסמכים וקישורים',
    settingsTab: 'הגדרות',
    searchPlaceholder: 'שאל כל שאלה על מסמכי ה-PDF, Word או הקישורים...',
    uploadDocs: 'העלאת PDF / Word',
    addUrl: 'הוסף קישור',
    activeGroup: 'קבוצת מקורות פעילה',
    suggestionsTitle: 'שאלות מוצעות',
    noDocsYet: 'טרם הועלו מסמכים. העלה קובץ PDF או Word כדי להתחיל!',
    noUrlsYet: 'אין קישורים בקבוצה זו.',
    readingDocument: 'מנתח את תוכן המסמך...',
    thinking: 'מעבד תשובה חכמה...',
    copySuccess: 'הועתק ללוח',
    listen: 'הקרא בקול',
    stopAudio: 'עצור הקראה',
    wordCount: 'מילים',
    pages: 'עמודים',
    detectedRtl: 'טקסט RTL',
    detectedLtr: 'טקסט LTR',
    rtlMode: 'כיוון מימין לשמאל (RTL)',
    language: 'שפה',
    soundEffects: 'צלילי ממשק iOS',
    haptics: 'משוב רטט (Haptics)',
    sampleDocs: 'טען מסמכי דוגמה',
    exportChat: 'ייצוא שיחה',
    clearChat: 'נקה הודעות',
    addSamplePdf: 'דוגמת PDF (מדריך Gemini)',
    addSampleDocx: 'דוגמת Word (מסמך דוגמה בעברית)',
  },
  fa: {
    appTitle: 'هارمونی DocAI',
    appSubtitle: 'دستیار هوشمند دانش برای فایل‌های PDF، ورد و لینک‌ها',
    chatTab: 'گفتگو',
    docsTab: 'اسناد و لینک‌ها',
    settingsTab: 'تنظیمات',
    searchPlaceholder: 'هر سوالی درباره اسناد PDF، Word یا وب‌سایت‌ها دارید بپرسید...',
    uploadDocs: 'بارگذاری PDF / Word',
    addUrl: 'افزودن پیوند',
    activeGroup: 'مجموعه فعال',
    suggestionsTitle: 'پرسش‌های پیشنهادی',
    noDocsYet: 'هنوز سندی بارگذاری نشده است. یک فایل PDF یا Word اضافه کنید!',
    noUrlsYet: 'هیچ لینکی اضافه نشده است.',
    readingDocument: 'در حال خواندن و استخراج سند...',
    thinking: 'در حال پردازش پاسخ...',
    copySuccess: 'کپی شد',
    listen: 'خواندن صوتی',
    stopAudio: 'توقف صوت',
    wordCount: 'کلمه',
    pages: 'صفحه',
    detectedRtl: 'متن راست‌به‌چپ (RTL)',
    detectedLtr: 'متن چپ‌به‌راست (LTR)',
    rtlMode: 'چیدمان راست به چپ (RTL)',
    language: 'زبان',
    soundEffects: 'افکت‌های صوتی iOS',
    haptics: 'بازخورد لمسی (Haptics)',
    sampleDocs: 'بارگذاری اسناد نمونه',
    exportChat: 'خروجی گفتگو',
    clearChat: 'پاک کردن پیام‌ها',
    addSamplePdf: 'نمونه PDF (راهنمای Gemini)',
    addSampleDocx: 'نمونه Word (متن فارسی)',
  },
  ur: {
    appTitle: 'ہارمونی ڈاک اے آئی',
    appSubtitle: 'پی ڈی ایف، ورڈ اور لنکس کے لیے ذہین علمی معاون',
    chatTab: 'چیٹ',
    docsTab: 'دستاویزات اور لنکس',
    settingsTab: 'ترتیبات',
    searchPlaceholder: 'پی ڈی ایف یا ورڈ دستاویزات کے بارے میں کوئی بھی سوال پوچھیں...',
    uploadDocs: 'پی ڈی ایف / ورڈ اپ لوڈ کریں',
    addUrl: 'لنک شامل کریں',
    activeGroup: 'فعال علمی گروپ',
    suggestionsTitle: 'تجویز کردہ سوالات',
    noDocsYet: 'ابھی تک کوئی دستاویز اپ لوڈ نہیں ہوئی۔ شروع کرنے کے لیے فائل اپ لوڈ کریں!',
    noUrlsYet: 'کوئی لنک شامل نہیں ہے۔',
    readingDocument: 'دستاویز کا تجزیہ کیا جا رہا ہے...',
    thinking: 'جواب تیار کیا جا رہا ہے...',
    copySuccess: 'کاپی ہو گیا',
    listen: 'آواز میں سنیں',
    stopAudio: 'آواز بند کریں',
    wordCount: 'الفاظ',
    pages: 'صفحات',
    detectedRtl: 'دائیں سے بائیں تحریر (RTL)',
    detectedLtr: 'بائیں سے دائیں تحریر (LTR)',
    rtlMode: 'دائیں سے بائیں لے آؤٹ (RTL)',
    language: 'زبان',
    soundEffects: 'آئی او ایس ساؤنڈ ایفیکٹس',
    haptics: 'لمسی فیڈ بیک (Haptics)',
    sampleDocs: 'نمونہ دستاویزات لوڈ کریں',
    exportChat: 'چیٹ ایکسپورٹ کریں',
    clearChat: 'پیغامات صاف کریں',
    addSamplePdf: 'نمونہ پی ڈی ایف',
    addSampleDocx: 'نمونہ ورڈ دستاویز',
  },
  es: {
    appTitle: 'Harmony DocAI',
    appSubtitle: 'Asistente de conocimiento iOS para PDF, Word y URLs',
    chatTab: 'Chat',
    docsTab: 'Documentos y URLs',
    settingsTab: 'Ajustes',
    searchPlaceholder: 'Pregunta cualquier cosa sobre tus PDFs, Word o URLs...',
    uploadDocs: 'Subir PDF / Word',
    addUrl: 'Añadir URL',
    activeGroup: 'Colección Activa',
    suggestionsTitle: 'Preguntas Sugeridas',
    noDocsYet: 'No hay documentos cargados. ¡Sube un archivo PDF o Word!',
    noUrlsYet: 'No hay URLs en este grupo.',
    readingDocument: 'Analizando contenido del documento...',
    thinking: 'Generando respuesta...',
    copySuccess: 'Copiado al portapapeles',
    listen: 'Leer en voz alta',
    stopAudio: 'Detener audio',
    wordCount: 'palabras',
    pages: 'páginas',
    detectedRtl: 'Texto RTL',
    detectedLtr: 'Texto LTR',
    rtlMode: 'Diseño de derecha a izquierda (RTL)',
    language: 'Idioma',
    soundEffects: 'Sonidos estilo iOS',
    haptics: 'Respuesta háptica',
    sampleDocs: 'Cargar documentos de ejemplo',
    exportChat: 'Exportar chat',
    clearChat: 'Borrar mensajes',
    addSamplePdf: 'PDF de ejemplo (Guía Gemini API)',
    addSampleDocx: 'Word de ejemplo (Resumen IA)',
  },
  fr: {
    appTitle: 'Harmony DocAI',
    appSubtitle: 'Assistant de connaissances iOS pour PDF, Word et URLs',
    chatTab: 'Discussion',
    docsTab: 'Documents et URLs',
    settingsTab: 'Réglages',
    searchPlaceholder: 'Posez une question sur vos PDF, Word ou URLs...',
    uploadDocs: 'Importer PDF / Word',
    addUrl: 'Ajouter une URL',
    activeGroup: 'Collection Active',
    suggestionsTitle: 'Questions Suggérées',
    noDocsYet: 'Aucun document importé. Importez un fichier PDF ou Word !',
    noUrlsYet: 'Aucune URL dans ce groupe.',
    readingDocument: 'Analyse du document en cours...',
    thinking: 'Génération de la réponse...',
    copySuccess: 'Copié dans le presse-papiers',
    listen: 'Lire à voix haute',
    stopAudio: 'Arrêter la lecture',
    wordCount: 'mots',
    pages: 'pages',
    detectedRtl: 'Texte RTL',
    detectedLtr: 'Texte LTR',
    rtlMode: 'Disposition de droite à gauche (RTL)',
    language: 'Langue',
    soundEffects: 'Effets sonores iOS',
    haptics: 'Retour haptique',
    sampleDocs: 'Charger des exemples',
    exportChat: 'Exporter le chat',
    clearChat: 'Effacer les messages',
    addSamplePdf: 'Exemple PDF (Guide Gemini)',
    addSampleDocx: 'Exemple Word (Résumé IA)',
  },
};

export function getTranslation(key: string, langCode: string = 'en'): string {
  const dict = TRANSLATIONS[langCode] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

/**
 * Convenient translation helper: t(lang, key)
 */
export function t(langCode: string, key: string): string {
  return getTranslation(key, langCode);
}

