/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Plus, Trash2, ChevronDown, Upload, FileText, Globe, Eye, Sparkles, AlertCircle, Tag, Filter } from 'lucide-react';
import { KnowledgeDocument, URLGroup } from '../types';
import { parseUploadedFiles, autoTagDocumentApi } from '../services/apiService';
import { SAMPLE_DOCUMENTS } from '../utils/sampleDocuments';
import { getTranslation, isRTL } from '../utils/rtlUtils';
import { playIosClick, triggerHaptic } from '../utils/iosFeedback';
import DocumentPreviewModal from './DocumentPreviewModal';

interface KnowledgeBaseManagerProps {
  urls: string[];
  onAddUrl: (url: string) => void;
  onRemoveUrl: (url: string) => void;
  maxUrls?: number;
  urlGroups: URLGroup[];
  activeUrlGroupId: string;
  onSetGroupId: (id: string) => void;
  documents: KnowledgeDocument[];
  onAddDocuments: (newDocs: KnowledgeDocument[]) => void;
  onRemoveDocument: (docId: string) => void;
  onUpdateDocument?: (doc: KnowledgeDocument) => void;
  language: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

const CATEGORY_LIST = ['All', 'Financial', 'Technical', 'Legal', 'Educational', 'Medical', 'Research', 'General'];

const getCategoryBadgeClass = (category?: string) => {
  switch (category) {
    case 'Financial':
      return 'bg-[#34C759]/20 text-[#30D158] border-[#34C759]/40';
    case 'Technical':
      return 'bg-[#007AFF]/20 text-[#5AC8FA] border-[#007AFF]/40';
    case 'Legal':
      return 'bg-[#AF52DE]/20 text-[#BF5AF2] border-[#AF52DE]/40';
    case 'Educational':
      return 'bg-[#FF9500]/20 text-[#FF9F0A] border-[#FF9500]/40';
    case 'Medical':
      return 'bg-[#FF2D55]/20 text-[#FF375F] border-[#FF2D55]/40';
    case 'Research':
      return 'bg-[#64D2FF]/20 text-[#64D2FF] border-[#64D2FF]/40';
    default:
      return 'bg-white/10 text-[#AEAEB2] border-white/20';
  }
};

const KnowledgeBaseManager: React.FC<KnowledgeBaseManagerProps> = ({
  urls,
  onAddUrl,
  onRemoveUrl,
  maxUrls = 20,
  urlGroups,
  activeUrlGroupId,
  onSetGroupId,
  documents,
  onAddDocuments,
  onRemoveDocument,
  onUpdateDocument,
  language,
  soundEnabled,
  hapticsEnabled,
}) => {
  const [currentUrlInput, setCurrentUrlInput] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDocument | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [taggingDocId, setTaggingDocId] = useState<string | null>(null);
  const [isBatchTagging, setIsBatchTagging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddUrl = () => {
    playIosClick(soundEnabled);
    if (!currentUrlInput.trim()) {
      setUrlError('Please enter a URL.');
      return;
    }
    if (!isValidUrl(currentUrlInput)) {
      setUrlError('Invalid URL format. Include http:// or https://');
      return;
    }
    if (urls.length >= maxUrls) {
      setUrlError(`Maximum limit of ${maxUrls} URLs reached.`);
      return;
    }
    if (urls.includes(currentUrlInput)) {
      setUrlError('This URL already exists in this group.');
      return;
    }
    onAddUrl(currentUrlInput.trim());
    setCurrentUrlInput('');
    setUrlError(null);
    triggerHaptic('success', hapticsEnabled);
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    setUploadError(null);
    playIosClick(soundEnabled);
    triggerHaptic('medium', hapticsEnabled);

    try {
      const fileArray = Array.from(files);
      const parsedDocs = await parseUploadedFiles(fileArray);
      onAddDocuments(parsedDocs);
      triggerHaptic('success', hapticsEnabled);
    } catch (err: any) {
      console.error('Upload Error:', err);
      setUploadError(err.message || 'Failed to parse uploaded document(s).');
      triggerHaptic('error', hapticsEnabled);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadSampleDocuments = () => {
    playIosClick(soundEnabled);
    triggerHaptic('success', hapticsEnabled);
    onAddDocuments(SAMPLE_DOCUMENTS);
  };

  const handleAutoTagSingleDoc = async (doc: KnowledgeDocument) => {
    playIosClick(soundEnabled);
    triggerHaptic('medium', hapticsEnabled);
    setTaggingDocId(doc.id);

    try {
      const result = await autoTagDocumentApi({
        name: doc.name,
        content: doc.content,
        type: doc.type,
      });

      const updatedDoc: KnowledgeDocument = {
        ...doc,
        category: result.category,
        tags: result.tags,
      };

      if (onUpdateDocument) {
        onUpdateDocument(updatedDoc);
      }
      triggerHaptic('success', hapticsEnabled);
    } catch (err) {
      console.error('Failed to auto-tag document:', err);
      triggerHaptic('error', hapticsEnabled);
    } finally {
      setTaggingDocId(null);
    }
  };

  const handleBatchAutoTag = async () => {
    if (documents.length === 0) return;
    playIosClick(soundEnabled);
    triggerHaptic('medium', hapticsEnabled);
    setIsBatchTagging(true);

    try {
      for (const doc of documents) {
        if (!doc.category || doc.category === 'General') {
          const result = await autoTagDocumentApi({
            name: doc.name,
            content: doc.content,
            type: doc.type,
          });
          if (onUpdateDocument) {
            onUpdateDocument({
              ...doc,
              category: result.category,
              tags: result.tags,
            });
          }
        }
      }
      triggerHaptic('success', hapticsEnabled);
    } catch (err) {
      console.error('Batch tag error:', err);
    } finally {
      setIsBatchTagging(false);
    }
  };

  const filteredDocuments = selectedCategory === 'All'
    ? documents
    : documents.filter((d) => (d.category || 'General') === selectedCategory);

  return (
    <div className="h-full flex flex-col gap-4 p-3 sm:p-5 max-w-4xl mx-auto overflow-y-auto custom-scrollbar">
      
      {/* Upload Document Card (iOS Frosted Inset Card) */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/20 text-[#5AC8FA] flex items-center justify-center">
              <FileText size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                {getTranslation('uploadDocs', language)}
              </h2>
              <p className="text-[11px] text-[#8E8E93]">
                Supports PDF (.pdf), Word (.docx, .doc), TXT & Markdown with Gemini Auto-Tagging
              </p>
            </div>
          </div>

          <button
            onClick={handleLoadSampleDocuments}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#5AC8FA] text-xs font-semibold flex items-center gap-1.5 transition-all ios-press"
            title="Load sample PDF and Arabic Word documents"
          >
            <Sparkles size={13} />
            <span className="hidden sm:inline">{getTranslation('sampleDocs', language)}</span>
            <span className="sm:hidden">Samples</span>
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            handleFileUpload(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? 'border-[#007AFF] bg-[#007AFF]/10 scale-[1.01]'
              : 'border-white/15 bg-white/[0.02] hover:border-white/30 hover:bg-white/[0.04]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md,.json"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />

          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white">
            {isUploading ? (
              <div className="w-5 h-5 border-2 border-[#5AC8FA] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Upload size={20} className="text-[#5AC8FA]" />
            )}
          </div>

          <div>
            <p className="text-xs sm:text-sm font-semibold text-white">
              {isUploading ? getTranslation('readingDocument', language) : 'Tap to browse or drop PDF / Word files'}
            </p>
            <p className="text-[11px] text-[#8E8E93] mt-0.5">
              Automatic Gemini AI classification (Financial, Technical, Legal, etc.)
            </p>
          </div>
        </div>

        {uploadError && (
          <div className="p-2.5 rounded-xl bg-[#FF3B30]/15 border border-[#FF3B30]/30 text-xs text-[#FF453A] flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Category Filter Pills & Auto-Tag Control Bar */}
        {documents.length > 0 && (
          <div className="space-y-2 mt-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#8E8E93]">
                <Filter size={13} />
                <span>Categories:</span>
              </div>

              <button
                onClick={handleBatchAutoTag}
                disabled={isBatchTagging}
                className="px-2.5 py-1 rounded-xl bg-[#AF52DE]/20 hover:bg-[#AF52DE]/30 text-[#BF5AF2] border border-[#AF52DE]/40 text-xs font-semibold flex items-center gap-1 transition-all disabled:opacity-50"
                title="Auto-classify untagged documents using Gemini"
              >
                {isBatchTagging ? (
                  <div className="w-3 h-3 border-2 border-[#BF5AF2] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Sparkles size={12} />
                )}
                <span>Auto-Tag All with Gemini</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
              {CATEGORY_LIST.map((cat) => {
                const count = cat === 'All'
                  ? documents.length
                  : documents.filter((d) => (d.category || 'General') === cat).length;

                if (cat !== 'All' && count === 0) return null;

                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      playIosClick(soundEnabled);
                      setSelectedCategory(cat);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                      isSelected
                        ? 'bg-[#007AFF] text-white border-[#007AFF] shadow-md'
                        : 'bg-[#2C2C2E] text-[#8E8E93] hover:text-white border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{cat}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/25 text-white' : 'bg-white/10 text-[#8E8E93]'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Uploaded Documents List */}
            <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar pt-1">
              {filteredDocuments.length === 0 ? (
                <p className="text-xs text-[#8E8E93] text-center py-4">
                  No documents found under '{selectedCategory}' category.
                </p>
              ) : (
                filteredDocuments.map((doc) => {
                  const docIsRTL = doc.isRTL ?? isRTL(doc.content);
                  const isPdf = doc.type === 'pdf';
                  const docCategory = doc.category || 'General';
                  const isTaggingThis = taggingDocId === doc.id;

                  return (
                    <div
                      key={doc.id}
                      className="p-2.5 bg-[#2C2C2E]/70 border border-white/5 rounded-2xl flex items-center justify-between gap-3 hover:bg-[#3A3A3C]/70 transition-all"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                            isPdf
                              ? 'bg-[#FF3B30]/20 text-[#FF453A] border-[#FF3B30]/40'
                              : 'bg-[#007AFF]/20 text-[#5AC8FA] border-[#007AFF]/40'
                          }`}
                        >
                          {doc.type}
                        </span>

                        <div className="min-w-0 flex flex-col gap-0.5">
                          <p className="text-xs font-semibold text-white truncate" title={doc.name}>
                            {doc.name}
                          </p>

                          <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-[#8E8E93]">
                            {/* Gemini Category Badge */}
                            <span className={`px-2 py-0.2 rounded-full font-bold border ${getCategoryBadgeClass(docCategory)}`}>
                              {docCategory}
                            </span>

                            {/* Tags */}
                            {doc.tags && doc.tags.length > 0 && (
                              <div className="hidden sm:flex items-center gap-1">
                                {doc.tags.map((tag) => (
                                  <span key={tag} className="px-1.5 py-0.2 rounded-md bg-white/5 text-[#AEAEB2] border border-white/5">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            {doc.pageCount && <span>{doc.pageCount} pgs</span>}
                            {doc.wordCount && <span>{doc.wordCount.toLocaleString()} {getTranslation('wordCount', language)}</span>}
                            {docIsRTL && <span className="text-[#34C759] font-medium">🇸🇦 RTL</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Auto-tag single document button */}
                        <button
                          onClick={() => handleAutoTagSingleDoc(doc)}
                          disabled={isTaggingThis}
                          className="p-1.5 text-[#BF5AF2] hover:text-white rounded-xl hover:bg-[#AF52DE]/20 transition-colors"
                          title="Auto-Tag with Gemini AI"
                          aria-label="Auto-tag document"
                        >
                          {isTaggingThis ? (
                            <div className="w-3.5 h-3.5 border-2 border-[#BF5AF2] border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Tag size={15} />
                          )}
                        </button>

                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="p-1.5 text-[#AEAEB2] hover:text-white rounded-xl hover:bg-white/10 transition-colors"
                          title="Preview extracted text"
                          aria-label="Preview document text"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => onRemoveDocument(doc.id)}
                          className="p-1.5 text-[#AEAEB2] hover:text-[#FF453A] rounded-xl hover:bg-[#FF3B30]/10 transition-colors"
                          title="Remove document"
                          aria-label="Remove document"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* URL Knowledge Base Card */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#5856D6]/20 text-[#AF52DE] flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white">
                Web Documentation URLs
              </h2>
              <p className="text-[11px] text-[#8E8E93]">
                Ground responses using Gemini URL Context tool
              </p>
            </div>
          </div>
        </div>

        {/* URL Group Selector */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="url-group-select" className="text-xs font-semibold text-[#8E8E93]">
            {getTranslation('activeGroup', language)}
          </label>
          <div className="relative">
            <select
              id="url-group-select"
              value={activeUrlGroupId}
              onChange={(e) => onSetGroupId(e.target.value)}
              className="w-full py-2 pl-3 pr-9 appearance-none bg-[#2C2C2E] border border-white/10 text-white text-xs font-medium rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
            >
              {urlGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.urls.length} URLs)
                </option>
              ))}
            </select>
            <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
          </div>
        </div>

        {/* Add URL Input */}
        <div className="flex items-center gap-2">
          <input
            type="url"
            value={currentUrlInput}
            onChange={(e) => setCurrentUrlInput(e.target.value)}
            placeholder="https://ai.google.dev/gemini-api/docs"
            onKeyDown={(e) => e.key === 'Enter' && handleAddUrl()}
            className="flex-grow py-2 px-3 bg-[#2C2C2E] border border-white/10 text-white placeholder-[#636366] text-xs rounded-2xl focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
          />
          <button
            onClick={handleAddUrl}
            disabled={urls.length >= maxUrls}
            className="px-3.5 py-2 bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-semibold rounded-2xl transition-all disabled:opacity-50 flex items-center gap-1 ios-press"
          >
            <Plus size={15} />
            <span>{getTranslation('addUrl', language)}</span>
          </button>
        </div>

        {urlError && <p className="text-xs text-[#FF453A]">{urlError}</p>}

        {/* URL List */}
        <div className="space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar mt-1">
          {urls.length === 0 ? (
            <p className="text-xs text-[#636366] text-center py-4">
              {getTranslation('noUrlsYet', language)}
            </p>
          ) : (
            urls.map((url) => (
              <div
                key={url}
                className="p-2.5 bg-[#2C2C2E]/70 border border-white/5 rounded-2xl flex items-center justify-between gap-3 hover:bg-[#3A3A3C]/70 transition-all"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#5AC8FA] hover:underline truncate"
                  title={url}
                >
                  {url}
                </a>
                <button
                  onClick={() => onRemoveUrl(url)}
                  className="p-1.5 text-[#AEAEB2] hover:text-[#FF453A] rounded-xl hover:bg-[#FF3B30]/10 transition-colors flex-shrink-0"
                  aria-label={`Remove URL ${url}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        document={previewDoc}
        onClose={() => setPreviewDoc(null)}
        language={language}
      />
    </div>
  );
};

export default KnowledgeBaseManager;
