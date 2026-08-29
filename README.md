# Harmony DocAI & RTL Knowledge Studio 📖✨

> An iOS-styled, mobile-first Progressive Web App (PWA) and document intelligence system built with **React 19**, **Express.js**, **Google DeepMind Gemini 3.7 Flash**, and **Firebase**.

---

## 🌟 Highlights & Capabilities

### 1. 📄 Multi-Format Document Intelligence (PDF & Word DOCX/DOC)
- **PDF Extraction**: Ingests multi-page PDFs using server-side buffer parsing, preserving tables, headers, and section hierarchies.
- **Word (.docx/.doc) Extraction**: Reads Microsoft Word documents via `mammoth` text extraction.
- **Document Previews**: In-app sheet to inspect extracted text, word counts, page statistics, and RTL metrics.
- **Sample Document Library**: One-tap loader providing instant sample documents (Gemini technical specification PDF, Arabic AI ecosystem overview DOCX, and financial report).

### 2. 🌍 First-Class Right-to-Left (RTL) & Multilingual Support
- **Automatic Script Detection**: Identifies Arabic, Hebrew, Persian (Farsi), and Urdu Unicode character ranges.
- **Bidirectional UI Layout**: Smooth dynamic toggle between `RTL` and `LTR` modes (`dir="rtl"`).
- **Native Typography**: Pre-configured with Cairo and Tajawal fonts for Arabic text rendering.
- **Multilingual UI Dictionary**: Localized interface strings across English, Arabic, Hebrew, Persian, Urdu, Spanish, and French.

### 3. 📱 Mobile-First iOS Look and Feel
- **Cupertino Design**: Frosted glass materials (`backdrop-blur-xl`), Inset Grouped cards, and iOS segmented controllers.
- **Sensory Audio & Haptic Feedback**: Synthetic Apple-like tap, message send, and notification chimes generated via Web Audio API, accompanied by tactile device vibration.
- **Voice Dictation & Text-to-Speech (TTS)**: Built-in voice input via Web Speech API and read-aloud playback in Arabic or English.

### 4. ⚡ Progressive Web App (PWA) & Offline Caching
- Configured with `manifest.json`, iOS standalone display tags, Apple touch icons, and a dedicated `sw.js` Service Worker.

### 5. 🚀 Full-Stack Architecture & Cloud Ready
- **Backend**: Express 5 on port 3000 handling file parsing (`multer`, `pdf-parse`, `mammoth`) and proxying Gemini requests.
- **AI Engine**: Modern `@google/genai` TypeScript SDK with `gemini-3.7-flash` model.
- **CI/CD**: Pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated building, typechecking, and deployment.

---

## 🛠️ Project Structure

```
├── .github/workflows/
│   └── deploy.yml            # Automated CI/CD GitHub Actions workflow
├── server/
│   ├── docParser.ts          # PDF, Word (.docx) & RTL text parsing engine
│   └── gemini.ts             # Google GenAI server client with model gemini-3.7-flash
├── services/
│   ├── apiService.ts         # Client API service (document parsing & chat)
│   └── firebaseService.ts    # Firebase Firestore and Auth client service
├── components/
│   ├── Header.tsx            # iOS Navigation bar & segmented tab controller
│   ├── ChatInterface.tsx     # iMessage style conversation view with voice & suggestions
│   ├── MessageItem.tsx       # Rendered markdown bubble with TTS & citations
│   ├── KnowledgeBaseManager.tsx # PDF / Word / URL library & dropzone
│   ├── DocumentPreviewModal.tsx # Document inspection & export modal
│   └── SettingsSheet.tsx     # iOS grouped settings table
├── utils/
│   ├── rtlUtils.ts           # RTL detection, BiDi resolvers & translation dictionary
│   ├── iosFeedback.ts        # iOS sound synthesis, haptics & Web Speech TTS
│   └── sampleDocuments.ts    # Demo PDF and Arabic Word documents
├── public/
│   ├── manifest.json         # PWA Manifest configuration
│   └── sw.js                 # Service Worker caching layer
├── server.ts                 # Main full-stack Express server with Vite middleware
├── firestore.rules           # Secure Firebase Firestore database rules
├── firebase-blueprint.json   # Firestore document & user schema definitions
├── package.json              # Dependencies & build scripts
└── metadata.json             # Applet metadata
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and specify your Gemini API key:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 🏃 Getting Started

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```
