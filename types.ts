/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum MessageSender {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export type DocumentType = 'pdf' | 'docx' | 'doc' | 'url' | 'text';

export interface KnowledgeDocument {
  id: string;
  name: string;
  type: DocumentType;
  content: string; // Extracted plain text or URL
  url?: string;
  fileSize?: number;
  wordCount?: number;
  pageCount?: number;
  isRTL?: boolean;
  mimeType?: string;
  base64Data?: string; // For inline multimodal PDF
  uploadedAt: number;
}

export interface UrlContextMetadataItem {
  retrievedUrl: string;
  urlRetrievalStatus: string;
}

export interface DocumentCitationItem {
  documentId: string;
  documentName: string;
  type: DocumentType;
  snippet?: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: MessageSender;
  timestamp: Date;
  isLoading?: boolean;
  isRTL?: boolean;
  urlContext?: UrlContextMetadataItem[];
  documentCitations?: DocumentCitationItem[];
  audioBase64?: string;
  reactions?: string[];
}

export interface URLGroup {
  id: string;
  name: string;
  urls: string[];
}

export type AppDirection = 'auto' | 'rtl' | 'ltr';
export type AppTheme = 'dark' | 'light' | 'system';

export interface AppLanguage {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
  flagEmoji: string;
}

export interface AppSettings {
  language: string; // 'auto', 'ar', 'he', 'fa', 'ur', 'en', 'es', 'fr', 'zh'
  direction: AppDirection;
  theme: AppTheme;
  haptics: boolean;
  soundEffects: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  autoSummarizeOnUpload: boolean;
}
