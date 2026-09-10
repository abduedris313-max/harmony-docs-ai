# Harmony DocAI & RTL Knowledge Studio

[![CI/CD Pipeline](https://img.shields.io/badge/CI%2FCD-Passing-brightgreen?style=flat-square&logo=githubactions)](https://github.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%205.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.1-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-3.7%20Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple?style=flat-square)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue?style=flat-square)](LICENSE)

> An Apple iOS-styled, mobile-first Progressive Web App (PWA) and document intelligence system built with **React 19**, **Express 5**, **Google DeepMind Gemini 3.7 Flash**, and **Firebase**.

- **Live Application URL**: [https://ais-dev-yktqicmjfw2hgjhellsmxu-331824392248.europe-west1.run.app](https://ais-dev-yktqicmjfw2hgjhellsmxu-331824392248.europe-west1.run.app)
- **Shared Preview URL**: [https://ais-pre-yktqicmjfw2hgjhellsmxu-331824392248.europe-west1.run.app](https://ais-pre-yktqicmjfw2hgjhellsmxu-331824392248.europe-west1.run.app)

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        iOS CLIENT (React 19 + PWA)                     │
│  - Cupertino HIG Design System (Materials, Haptics, Web Audio Tones)   │
│  - Bidirectional RTL Engine (Arabic, Hebrew, Persian, Urdu, Amharic)   │
│  - Safe Offline Storage (Indexed LocalStorage + Firebase Firestore)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP REST /api/*
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   EXPRESS BACKEND (Node.js 22 Server)                  │
│  - Document Parsing Engine (pdf-parse for PDF, mammoth for DOCX/DOC)   │
│  - Multimodal Buffer Ingestion & Unicode RTL Token Analysis            │
│  - Secure Proxy Layer (Keeps GEMINI_API_KEY server-side)               │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │                                 │
                   ▼                                 ▼
┌──────────────────────────────────┐ ┌───────────────────────────────────┐
│     GOOGLE DEEPMIND GEMINI       │ │           FIREBASE BaaS           │
│  - Model: gemini-3.7-flash       │ │  - Cloud Firestore (RBAC Rules)   │
│  - Cross-Doc Reasoning & Citations│ │  - Firebase Authentication       │
│  - Multilingual Auto-Categorize  │ │  - Cloud Storage for Binaries     │
└──────────────────────────────────┘ └───────────────────────────────────┘
```

---

## 🌟 Highlights & Capabilities

### 1. 📄 Multi-Format Document Intelligence (PDF & Word DOCX/DOC)
- **PDF Extraction**: Ingests multi-page PDFs using server-side buffer parsing, preserving tables, headers, and section hierarchies.
- **Word (.docx/.doc) Extraction**: Reads Microsoft Word documents via `mammoth` text extraction.
- **Document Previews**: In-app sheet to inspect extracted text, word counts, page statistics, and RTL metrics.
- **Sample Document Library**: One-tap loader providing instant sample documents (Gemini technical specification PDF, Arabic AI ecosystem overview DOCX, Amharic AI guide, and global financial report).

### 2. 🌍 First-Class Right-to-Left (RTL) & Multilingual Support
- **Automatic Script Detection**: Identifies Arabic, Hebrew, Persian (Farsi), Urdu, and Amharic Unicode character ranges.
- **Bidirectional UI Layout**: Smooth dynamic toggle between `RTL` and `LTR` modes (`dir="rtl"`).
- **Native Typography**: Pre-configured with Cairo, Tajawal, and Plus Jakarta Sans fonts.
- **Multilingual UI Dictionary**: Localized interface strings across English, Arabic, Amharic, Hebrew, Persian, Urdu, Spanish, and French.

### 3. 📱 Mobile-First iOS Look and Feel
- **Cupertino Design**: Frosted glass materials (`backdrop-blur-xl`), Inset Grouped cards, and iOS segmented controllers.
- **Sensory Audio & Haptic Feedback**: Synthetic Apple-like tap, message send, and notification chimes generated via Web Audio API, accompanied by tactile device vibration.
- **Voice Dictation & Text-to-Speech (TTS)**: Built-in voice input via Web Speech API and read-aloud playback in Arabic, Amharic, or English.

### 4. ⚡ Progressive Web App (PWA) & Offline Caching
- Configured with `manifest.json`, iOS standalone display tags, Apple touch icons, and a dedicated `sw.js` Service Worker.

### 5. 🚀 Full-Stack Architecture & Cloud Ready
- **Backend**: Express 5 on port 3000 handling file parsing (`multer`, `pdf-parse`, `mammoth`) and proxying Gemini requests.
- **AI Engine**: Modern `@google/genai` TypeScript SDK with `gemini-3.7-flash` model.
- **CI/CD**: Pre-configured GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated building, typechecking, testing, and deployment.

---

## 🛠️ Project Structure

```
├── .github/workflows/
│   └── deploy.yml            # Automated CI/CD GitHub Actions workflow (Lint + Test + Build + Deploy)
├── components/
│   ├── Header.tsx            # iOS Navigation bar & segmented tab controller
│   ├── ChatInterface.tsx     # iMessage style conversation view with voice & suggestions
│   ├── MessageItem.tsx       # Rendered markdown bubble with TTS & citations
│   ├── KnowledgeBaseManager.tsx # PDF / Word / URL library & dropzone
│   ├── DocumentPreviewModal.tsx # Document inspection & export modal
│   ├── ErrorBoundary.tsx     # iOS-styled failure isolation screen
│   └── SettingsSheet.tsx     # iOS grouped settings table
├── server/
│   ├── docParser.ts          # PDF, Word (.docx) & RTL text parsing engine
│   └── gemini.ts             # Google GenAI server client with model gemini-3.7-flash
├── services/
│   ├── apiService.ts         # Client API service (document parsing & chat)
│   └── firebaseService.ts    # Firebase Firestore and Auth client service with fallback
├── tests/
│   ├── rtlUtils.test.ts      # Unit tests for RTL detection & translations
│   └── sampleDocuments.test.ts # Unit tests for document schema integrity
├── utils/
│   ├── rtlUtils.ts           # RTL detection, BiDi resolvers & translation dictionary
│   ├── iosFeedback.ts        # iOS sound synthesis, haptics & Web Speech TTS
│   └── sampleDocuments.ts    # Demo PDF, Arabic Word, and Amharic documents
├── public/
│   ├── manifest.json         # PWA Manifest configuration
│   └── sw.js                 # Service Worker caching layer
├── server.ts                 # Main full-stack Express server with Vite middleware
├── firestore.rules           # Secure Firebase Firestore database rules
├── firebase-blueprint.json   # Firestore document & user schema definitions
├── tsconfig.json             # Strict TypeScript configuration
├── package.json              # Dependencies, Vitest & build scripts
└── metadata.json             # Applet metadata
```

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` to customize environment configuration:

| Variable | Required | Context | Description |
|---|---|---|---|
| `GEMINI_API_KEY` | **Yes** | Server | Google DeepMind Gemini API key for server-side reasoning |
| `VITE_FIREBASE_API_KEY` | Optional | Client | Firebase project API key for Firestore & Auth |
| `VITE_FIREBASE_AUTH_DOMAIN` | Optional | Client | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Optional | Client | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET`| Optional | Client | Firebase storage bucket |
| `VITE_FIREBASE_APP_ID` | Optional | Client | Firebase Web App ID |

*Note: If Firebase keys are omitted, Harmony DocAI functions automatically in local-first storage mode with zero setup required.*

---

## 🏃 Getting Started

### Development
```bash
npm run dev
```

### Unit Testing
```bash
npm run test
```

### Production Build & Launch
```bash
npm run build
npm start
```

