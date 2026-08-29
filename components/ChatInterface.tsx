/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Sparkles, FileText, Globe, RefreshCw, X, ArrowUp } from 'lucide-react';
import { ChatMessage, KnowledgeDocument } from '../types';
import MessageItem from './MessageItem';
import { getTranslation, isRTL } from '../utils/rtlUtils';
import { playIosClick, playIosSendSound, triggerHaptic } from '../utils/iosFeedback';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  urls: string[];
  documents: KnowledgeDocument[];
  suggestions: string[];
  onSelectSuggestion: (s: string) => void;
  onRefreshSuggestions: () => void;
  onUploadFile: (files: FileList | null) => void;
  language: string;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onOpenDocsTab: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  urls,
  documents,
  suggestions,
  onSelectSuggestion,
  onRefreshSuggestions,
  onUploadFile,
  language,
  soundEnabled,
  hapticsEnabled,
  onOpenDocsTab,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Adjust textarea height dynamically
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'ar' ? 'ar-SA' : language === 'he' ? 'he-IL' : language === 'fa' ? 'fa-IR' : language === 'ur' ? 'ur-PK' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const handleToggleVoice = () => {
    playIosClick(soundEnabled);
    triggerHaptic('medium', hapticsEnabled);
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const handleSend = () => {
    if (!inputText.trim() || isLoading) return;
    playIosSendSound(soundEnabled);
    triggerHaptic('medium', hapticsEnabled);
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const inputIsRTL = isRTL(inputText);

  return (
    <div className="flex flex-col h-full relative max-w-4xl mx-auto w-full">
      
      {/* Knowledge Context Bar */}
      <div className="px-3 sm:px-4 py-2 border-b border-white/5 bg-white/[0.02] flex items-center justify-between gap-2 text-xs text-[#8E8E93]">
        <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar whitespace-nowrap">
          <button
            onClick={onOpenDocsTab}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <FileText size={13} className="text-[#5AC8FA]" />
            <span>
              <strong className="text-white">{documents.length}</strong> Docs
            </span>
          </button>

          <span className="text-white/20">•</span>

          <button
            onClick={onOpenDocsTab}
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Globe size={13} className="text-[#AF52DE]" />
            <span>
              <strong className="text-white">{urls.length}</strong> URLs
            </span>
          </button>
        </div>

        {suggestions.length > 0 && (
          <button
            onClick={onRefreshSuggestions}
            className="flex items-center gap-1 text-[11px] text-[#8E8E93] hover:text-white transition-colors"
            title="Refresh question suggestions"
          >
            <RefreshCw size={11} />
            <span className="hidden sm:inline">Refresh prompts</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-grow p-3 sm:p-5 overflow-y-auto chat-container flex flex-col">
        {messages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto my-auto animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white shadow-xl mb-4">
              <Sparkles size={28} />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 tracking-tight">
              {getTranslation('appTitle', language)}
            </h2>
            <p className="text-xs sm:text-sm text-[#8E8E93] mb-6 leading-relaxed">
              {documents.length === 0 && urls.length === 0
                ? getTranslation('noDocsYet', language)
                : 'Ask questions, extract summaries, compare sections, or synthesize findings across your PDFs, Word documents, and web URLs.'}
            </p>

            {/* Quick Actions if No Documents */}
            {documents.length === 0 && (
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-2.5 px-4 rounded-2xl bg-[#007AFF] text-white text-xs font-semibold hover:bg-[#007AFF]/90 flex items-center justify-center gap-2 shadow-lg ios-press"
                >
                  <Paperclip size={15} />
                  <span>{getTranslation('uploadDocs', language)}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              soundEnabled={soundEnabled}
              hapticsEnabled={hapticsEnabled}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions Strip */}
      {suggestions.length > 0 && (
        <div className="px-3 sm:px-4 py-2 bg-black/40 border-t border-white/5">
          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
            <Sparkles size={13} className="text-[#5AC8FA] flex-shrink-0" />
            {suggestions.map((suggestion, index) => {
              const sugIsRTL = isRTL(suggestion);
              return (
                <button
                  key={index}
                  onClick={() => {
                    playIosClick(soundEnabled);
                    triggerHaptic('light', hapticsEnabled);
                    onSelectSuggestion(suggestion);
                  }}
                  className={`px-3 py-1.5 rounded-2xl bg-[#1C1C1E] hover:bg-[#2C2C2E] text-xs text-[#E5E5EA] border border-white/10 hover:border-white/20 whitespace-nowrap transition-all flex-shrink-0 flex items-center gap-1.5 ios-press ${
                    sugIsRTL ? 'font-arabic' : ''
                  }`}
                  dir={sugIsRTL ? 'rtl' : 'ltr'}
                >
                  <span>{suggestion}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Input Bar (iOS iMessage Frosted Style) */}
      <div className="p-3 sm:p-4 bg-[#121214]/90 ios-blur border-t border-white/10 pb-safe">
        <div className="relative flex items-end gap-2 bg-[#1C1C1E] border border-white/15 rounded-3xl p-1.5 shadow-lg focus-within:border-[#007AFF] transition-all">
          
          {/* File Attachment Button */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.md"
            onChange={(e) => onUploadFile(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-full text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
            title="Attach PDF or Word file"
            aria-label="Upload document"
          >
            <Paperclip size={18} />
          </button>

          {/* Auto-Expanding Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getTranslation('searchPlaceholder', language)}
            className={`w-full py-2 bg-transparent text-white placeholder-[#636366] text-xs sm:text-sm focus:outline-none resize-none max-h-32 ${
              inputIsRTL ? 'text-right font-arabic' : 'text-left'
            }`}
            dir={inputIsRTL ? 'rtl' : 'ltr'}
          />

          {/* Voice Input Button */}
          <button
            onClick={handleToggleVoice}
            className={`p-2 rounded-full transition-all flex-shrink-0 ${
              isListening
                ? 'bg-[#FF3B30] text-white animate-pulse'
                : 'text-[#8E8E93] hover:text-white hover:bg-white/10'
            }`}
            title={isListening ? 'Listening...' : 'Voice Dictation'}
            aria-label="Dictate message"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isLoading}
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-[#007AFF] text-white shadow-md hover:scale-105 active:scale-95'
                : 'bg-white/10 text-white/30 cursor-not-allowed'
            }`}
            title="Send message"
            aria-label="Send message"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <ArrowUp size={18} />
            )}
          </button>

        </div>
      </div>

    </div>
  );
};

export default ChatInterface;
