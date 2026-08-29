/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, FileText, Download, Globe } from 'lucide-react';
import { KnowledgeDocument } from '../types';
import { isRTL } from '../utils/rtlUtils';

interface DocumentPreviewModalProps {
  document: KnowledgeDocument | null;
  onClose: () => void;
  language: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({ document, onClose, language }) => {
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(document.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    const blob = new Blob([document.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.name.replace(/\.[^/.]+$/, '')}_extracted.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const docIsRTL = document.isRTL ?? isRTL(document.content);

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'bg-[#FF3B30]/20 text-[#FF453A] border-[#FF3B30]/40';
      case 'docx':
      case 'doc':
        return 'bg-[#007AFF]/20 text-[#5AC8FA] border-[#007AFF]/40';
      default:
        return 'bg-[#AF52DE]/20 text-[#BF5AF2] border-[#AF52DE]/40';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 ios-blur">
      <div className="bg-[#1C1C1E] border border-white/15 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* iOS Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.03]">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`px-2 py-0.5 rounded-lg text-xs font-bold uppercase border ${getBadgeColor(document.type)}`}>
              {document.type}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white truncate" title={document.name}>
              {document.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 text-[#8E8E93] hover:text-white hover:bg-white/20 transition-all"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5 flex flex-wrap items-center gap-3 text-xs text-[#8E8E93]">
          {document.pageCount && (
            <span>📄 {document.pageCount} Pages</span>
          )}
          {document.wordCount && (
            <span>📝 {document.wordCount.toLocaleString()} Words</span>
          )}
          {document.fileSize && (
            <span>💾 {(document.fileSize / 1024).toFixed(1)} KB</span>
          )}
          <span className="flex items-center gap-1">
            <Globe size={12} />
            {docIsRTL ? '🇸🇦 RTL Detected' : '🇺🇸 LTR Content'}
          </span>
        </div>

        {/* Extracted Content Body */}
        <div
          className={`flex-grow p-4 overflow-y-auto custom-scrollbar text-sm leading-relaxed text-[#E5E5EA] bg-[#121214] select-text font-sans ${
            docIsRTL ? 'text-right font-arabic' : 'text-left'
          }`}
          dir={docIsRTL ? 'rtl' : 'ltr'}
        >
          <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
            {document.content || 'No text extracted from this document.'}
          </pre>
        </div>

        {/* iOS Modal Footer Actions */}
        <div className="p-3 border-t border-white/10 bg-white/[0.02] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check size={14} className="text-[#34C759]" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>
            <button
              onClick={handleDownloadText}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white flex items-center gap-1.5 transition-all"
            >
              <Download size={14} />
              Export .TXT
            </button>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#007AFF]/90 transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

export default DocumentPreviewModal;
