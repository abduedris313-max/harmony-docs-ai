/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { KnowledgeDocument } from '../types';

export const SAMPLE_DOCUMENTS: KnowledgeDocument[] = [
  {
    id: 'sample-doc-pdf-gemini',
    name: 'Gemini_3_Flash_Technical_Architecture.pdf',
    type: 'pdf',
    pageCount: 14,
    wordCount: 1840,
    fileSize: 428000,
    isRTL: false,
    category: 'Technical',
    tags: ['Architecture', 'Gemini API', 'Multimodal'],
    uploadedAt: Date.now() - 3600000,
    content: `TECHNICAL SPECIFICATION: GEMINI 3.7 FLASH ARCHITECTURE & SYSTEM CAPABILITIES
Author: Google DeepMind Research
Version: 3.7-Production

1. EXECUTIVE SUMMARY
Gemini 3.7 Flash is a cutting-edge, high-throughput multimodal intelligence model optimized for ultra-low latency reasoning, code synthesis, cross-document comprehension, and structured outputs.

2. CORE MODEL SPECIFICATIONS:
- Context Window: 1,000,000+ tokens natively supported
- Multimodal Ingestion: Text, High-Resolution PDF, Images (PNG, JPEG, WebP), Audio (16kHz PCM/WAV), and Video
- Output Latency: First-token latency < 240ms in production streaming
- Reasoning Engine: Dynamic Hybrid Thinking System (supports low, balanced, and deep chain-of-thought verification)

3. PDF AND DOCUMENT PARSING CAPABILITIES:
- Direct Ingestion: Accepts native binary PDF streams without OCR pre-processing
- Tabular & Structural Extraction: Reconstructs complex multi-column layouts, financial balance sheets, and nested markdown tables with >99.2% cell accuracy
- Footnote & Citation Preservation: Identifies source pages, references, and appendices

4. RIGHT-TO-LEFT (RTL) AND MULTILINGUAL BENCHMARKS:
- High performance across Semitic and Indic scripts (Arabic, Hebrew, Persian, Urdu)
- Direct bidirectional tokenization minimizes character segmentation fragmentation in Arabic and Hebrew scripts.

5. RECOMMENDED SYSTEM INTEGRATION PATTERNS:
Use the official @google/genai TypeScript SDK with server-side proxying and process.env.GEMINI_API_KEY.`,
  },
  {
    id: 'sample-doc-word-arabic',
    name: 'دليل_الذكاء_الاصطناعي_التوليدي_باللغة_العربية.docx',
    type: 'docx',
    pageCount: 8,
    wordCount: 1220,
    fileSize: 315000,
    isRTL: true,
    category: 'Educational',
    tags: ['Arabic AI', 'RTL Guide', 'Multilingual'],
    uploadedAt: Date.now() - 7200000,
    content: `دليل الذكاء الاصطناعي التوليدي ونماذج اللغة المتقدمة باللغة العربية
إعداد: قسم حلول الذكاء الاصطناعي والترجمة الآلية

المقدمة:
يشهد مجال الذكاء الاصطناعي التوليدي قفزات نوعية في معالجة اللغات الطبيعية وخاصة اللغة العربية (RTL). يهدف هذا المستند إلى توضيح كيفية استيعاب الوثائق والملفات بصيغة PDF ووورد (DOCX) واستخراج المعرفة منها بدقة متناهية.

الفصل الأول: تحديات المعالجة للنصوص ثنائية الاتجاه (BiDi)
1. اتجاه الكتابة من اليمين إلى اليسار (RTL):
تتطلب اللغة العربية دعماً مخصصاً لتوزيع المحارف، وعلامات الترقيم، والأرقام الهندية والعربية داخل الجملة الواحدة دون حدوث تشويه بصري.

2. التشكيل والإعراب:
نماذج Gemini 3.7 تمتلك قدرة فائقة على فهم النصوص العربية المشكولة وغير المشكولة، واستنتاج المعنى السياقي بدقة تتجاوز 98.7%.

الفصل الثاني: استخراج البيانات من ملفات PDF و Word
- التحليل الدلالي للجداول المالية والقانونية
- استخراج الملخصات التنفيذية
- الإجابة الفورية عن الاستفسارات القانونية والتقنية باللغة العربية الفصحى

الفصل الثالث: توصيات التطبيق
- تفعيل واجهة مستخدم متوافقة تماماً مع المعايير القياسية لنظام iOS
- دعم الخطوط العربية الواضحة مثل Cairo و Tajawal و Noto Sans Arabic
- تمكين القراءة الصوتية باللغة العربية الفصحى.`,
  },
  {
    id: 'sample-doc-pdf-financial',
    name: 'Q3_Global_Enterprise_Financial_Report.pdf',
    type: 'pdf',
    pageCount: 6,
    wordCount: 960,
    fileSize: 512000,
    isRTL: false,
    category: 'Financial',
    tags: ['Q3 Report', 'Revenue', 'Enterprise'],
    uploadedAt: Date.now() - 10800000,
    content: `GLOBAL ENTERPRISE GROUP - THIRD QUARTER FINANCIAL HIGHLIGHTS
Fiscal Year Performance Review

1. CONSOLIDATED REVENUE METRICS:
- Total Net Revenue: $4.82 Billion (+14.2% YoY)
- Cloud & AI Intelligence Division: $1.95 Billion (+38.6% YoY)
- Enterprise Software Subscriptions: $1.42 Billion (+9.1% YoY)
- Operating Margin: 29.4% (expanded by 210 bps)

2. REGIONAL PERFORMANCE:
- North America: $2.15 Billion (44.6% of total)
- EMEA (Europe, Middle East, Africa): $1.48 Billion (30.7% of total) - Strong growth in GCC Arabic markets (+42%)
- APAC: $1.19 Billion (24.7% of total)

3. R&D INVESTMENTS:
- Total R&D Expenditure: $840 Million (17.4% of revenue)
- Primary Allocation: Gemini Multimodal Infrastructure, Serverless AI Agents, and Realtime Audio/Live Systems.

4. GUIDANCE FOR Q4:
Projected revenue target between $5.10B and $5.30B, reflecting high enterprise adoption of automated document intelligence workflows.`,
  },
  {
    id: 'sample-doc-docx-amharic',
    name: 'የአርቲፊሻል_ኢንቴሊጀንስ_እና_የሰነድ_ተንታኝ_መመሪያ.docx',
    type: 'docx',
    pageCount: 5,
    wordCount: 880,
    fileSize: 280000,
    isRTL: false,
    category: 'Educational',
    tags: ['Amharic AI', 'DocAI', 'Ge\'ez Script'],
    uploadedAt: Date.now() - 14400000,
    content: `የአርቲፊሻል ኢንቴሊጀንስ እና የሰነድ መረጃ ትንተና መመሪያ (በአማርኛ)
አዘጋጅ፡ የሃርሞኒ DocAI የቋንቋ እና የቴክኖሎጂ ክፍል

መግቢያ፡
የተፈጥሮ ቋንቋ ማቀናበር (NLP) በኢትዮጵያ ቋንቋዎች በተለይም በአማርኛ (የግዕዝ ፊደላት) ከፍተኛ እድገት እያሳየ ይገኛል። ይህ ሰነድ በPDF እና Word ፋይሎች ውስጥ ያሉ መረጃዎችን በGemini AI በመጠቀም እንዴት በቀላሉ ማውጣት እና መተንተን እንደሚቻል ያብራራል።

ምዕራፍ 1፡ የግዕዝ ፊደላት እና የቋንቋ ትንተና
1. የፊደላት ባህሪያት፡
አማርኛ ከ300 በላይ የግዕዝ ፊደላትንና ምልክቶችን የሚጠቀም ሲሆን፣ Gemini 3.7 Flash ሞዴል እነዚህን ፊደላት ያለ ምንም ስህተት የማንበብ እና የመረዳት ብቃት አለው።

2. የሰነዶች አውቶማቲክ ምደባ (Auto-Tagging)፡
ሰነዶች ሲሰቀሉ በፋይናንስ፣ ቴክኖሎጂ፣ ሕግ፣ እና ትምህርት ዘርፍ በራሳቸው ይፈረጃሉ።

ምዕራፍ 2፡ ዋና ዋና ጥቅሞች
- የPDF እና Word ሰነዶችን በቅጽበት ማጠቃለል
- በአማርኛ ቋንቋ ጥያቄዎችን መጠየቅ እና ትክክለኛ ምላሽ ማግኘት
- የድምፅ ንባብ እና የድምፅ ትዕዛዞችን በሙሉ አቅም ማከናወን።`,
  },
];
