/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { parsePdfBuffer, parseWordBuffer, parseTextBuffer } from './server/docParser.js';
import { generateContent, getSmartSuggestions } from './server/gemini.js';

const app = express();
const PORT = 3000;

// Configure Multer for memory storage (max 25MB file upload)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Harmony DocAI & RTL Knowledge Studio',
    timestamp: new Date().toISOString(),
  });
});

// Document parsing endpoint for PDF, Word (.docx/.doc), TXT, Markdown
app.post('/api/documents/parse', upload.array('files', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    const parsedResults = [];

    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const originalname = file.originalname;
      let parsed;

      if (ext === '.pdf') {
        parsed = await parsePdfBuffer(file.buffer);
      } else if (ext === '.docx' || ext === '.doc') {
        parsed = await parseWordBuffer(file.buffer, originalname);
      } else if (ext === '.txt' || ext === '.md' || ext === '.json' || ext === '.csv') {
        parsed = parseTextBuffer(file.buffer);
      } else {
        // Attempt text fallback
        parsed = parseTextBuffer(file.buffer);
      }

      parsedResults.push({
        id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        name: originalname,
        type: parsed.type,
        content: parsed.text,
        fileSize: file.size,
        wordCount: parsed.wordCount,
        pageCount: parsed.pageCount,
        isRTL: parsed.isRTL,
        base64Data: parsed.base64Data,
        uploadedAt: Date.now(),
      });
    }

    return res.json({ documents: parsedResults });
  } catch (error: any) {
    console.error('Error parsing documents:', error);
    return res.status(500).json({ error: error.message || 'Failed to parse uploaded document.' });
  }
});

// Gemini generation endpoint
app.post('/api/gemini/generate', async (req, res) => {
  try {
    const { prompt, urls, documents, history, language, isRTL } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required.' });
    }

    const result = await generateContent({
      prompt,
      urls: urls || [],
      documents: documents || [],
      history: history || [],
      language: language || 'auto',
      isRTL,
    });

    return res.json(result);
  } catch (error: any) {
    console.error('Gemini Generate Error:', error);
    const message = error.message || 'Error communicating with Gemini model.';
    return res.status(500).json({ error: message });
  }
});

// Smart suggestions endpoint
app.post('/api/gemini/suggestions', async (req, res) => {
  try {
    const { urls, documents, language, isRTL } = req.body;
    const result = await getSmartSuggestions({
      urls: urls || [],
      documents: documents || [],
      language: language || 'auto',
      isRTL,
    });
    return res.json(result);
  } catch (error: any) {
    console.error('Gemini Suggestions Error:', error);
    return res.json({
      suggestions: [
        'Summarize the uploaded documents',
        'What are the key points covered?',
        'Are there any specific requirements or steps?',
        'Compare the main concepts',
      ],
    });
  }
});

// Start Express server and connect Vite in development or serve dist in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harmony DocAI server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
