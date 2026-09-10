/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Sparkles, FileText, Globe, RefreshCw, X, ArrowUp, Search } from 'lucide-react';
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
  onReactToMessage?: (messageId: string, emoji: string) => void;
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
  onReactToMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom when messages update or incoming response arrives
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom(true);
    const timer1 = setTimeout(() => scrollToBottom(true), 100);
    const timer2 = setTimeout(() => scrollToBottom(true), 350);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [messages, isLoading, messages.length, messages[messages.length - 1]?.text]);

  const handleScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 120;
    setShowScrollButton(!isNearBottom);
  };

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
      recognition.interimResults = true;
      recognition.lang =
        language === 'am'
          ? 'am-ET'
          : language === 'ar'
          ? 'ar-SA'
          : language === 'he'
          ? 'he-IL'
          : language === 'fa'
          ? 'fa-IR'
          : language === 'ur'
          ? 'ur-PK'
          : language === 'es'
          ? 'es-ES'
          : language === 'fr'
          ? 'fr-FR'
          : 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (err.error !== 'no-speech') {
          setSpeechError('Microphone access unavailable or quiet.');
          setTimeout(() => setSpeechError(null), 3000);
        }
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
    setSpeechError(null);

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech recognition is not supported in this browser.');
      setTimeout(() => setSpeechError(null), 3500);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        if (recognitionRef.current) {
          recognitionRef.current.start();
          setIsListening(true);
        }
      } catch (e) {
        console.warn('Speech recognition restart issue:', e);
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

  const filteredMessages = searchQuery.trim()
    ? messages.filter((msg) => msg.text.toLowerCase().includes(searchQuery.trim().toLowerCase()))
    : messages;

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

        <div className="flex items-center gap-2">
          {/* Search Toggle Button */}
          <button
            onClick={() => {
              playIosClick(soundEnabled);
              triggerHaptic('light', hapticsEnabled);
              setIsSearchOpen((prev) => !prev);
            }}
            className={`px-2 py-1 rounded-xl text-xs flex items-center gap-1 transition-all ${
              isSearchOpen || searchQuery
                ? 'bg-[#007AFF] text-white font-semibold shadow-md'
                : 'text-[#8E8E93] hover:text-white hover:bg-white/10'
            }`}
            title="Search message history"
          >
            <Search size={13} />
            <span className="hidden sm:inline">Search</span>
          </button>

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
      </div>

      {/* Floating Interactive Search Bar */}
      {(isSearchOpen || searchQuery) && (
        <div className="px-3 py-2 bg-[#1C1C1E] border-b border-white/10 flex flex-col gap-1.5 animate-in slide-in-from-top duration-200 z-10 shadow-lg">
          <div className="flex items-center gap-2">
            <div className="relative flex-grow flex items-center">
              <Search size={14} className="absolute left-3 text-[#8E8E93] pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter chat history by keyword..."
                className="w-full py-1.5 pl-8 pr-8 bg-[#2C2C2E] border border-white/15 text-white text-xs rounded-xl focus:outline-none focus:border-[#007AFF] placeholder-[#8E8E93]"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#8E8E93] hover:text-white p-0.5"
                  title="Clear search query"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="px-2.5 py-1.5 text-xs text-[#8E8E93] hover:text-white transition-colors font-medium"
            >
              Cancel
            </button>
          </div>

          {searchQuery.trim() && (
            <div className="flex items-center justify-between text-[11px] text-[#5AC8FA] px-1 font-medium">
              <span>
                Found {filteredMessages.length} {filteredMessages.length === 1 ? 'match' : 'matches'} for "{searchQuery}"
              </span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-[#8E8E93] hover:text-white underline text-[10px]"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Messages Scroll Area */}
      <div
        ref={chatContainerRef}
        onScroll={handleScroll}
        className="flex-grow p-3 sm:p-5 overflow-y-auto chat-container flex flex-col relative"
      >
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
        ) : filteredMessages.length === 0 ? (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-[#8E8E93] my-auto">
            <Search size={32} className="text-[#636366] mb-3" />
            <p className="text-sm font-semibold text-white">No matching messages found</p>
            <p className="text-xs text-[#8E8E93] mt-1 mb-4">
              No message contains the keyword "{searchQuery}". Try searching for another term or clear the filter.
            </p>
            <button
              onClick={() => setSearchQuery('')}
              className="px-3.5 py-1.5 bg-[#007AFF] text-white text-xs font-semibold rounded-xl hover:bg-[#007AFF]/90 transition-all"
            >
              Clear Search Filter
            </button>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              soundEnabled={soundEnabled}
              hapticsEnabled={hapticsEnabled}
              onReact={onReactToMessage ? (emoji) => onReactToMessage(message.id, emoji) : undefined}
            />
          ))
        )}
        <div ref={messagesEndRef} />

        {/* Scroll to Bottom Floating Button */}
        {showScrollButton && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-4 z-20 w-9 h-9 rounded-full bg-[#007AFF] text-white shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all border border-white/20 animate-in fade-in duration-200"
            title="Scroll to latest message"
            aria-label="Scroll to latest message"
          >
            <ArrowUp size={16} className="rotate-180" />
          </button>
        )}
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

      {/* Speech Dictation / Error Status Banner */}
      {(isListening || speechError) && (
        <div className="px-4 py-1.5 bg-[#1C1C1E] border-t border-white/10 flex items-center justify-between text-xs transition-all">
          {isListening ? (
            <div className="flex items-center gap-2 text-[#FF3B30] font-medium animate-pulse">
              <Mic size={14} className="animate-bounce" />
              <span>Voice dictation active... Listening to speech</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-[#FF9500]">
              <span>⚠️ {speechError}</span>
            </div>
          )}
          {isListening && (
            <button
              onClick={handleToggleVoice}
              className="text-[11px] text-[#8E8E93] hover:text-white underline"
            >
              Stop
            </button>
          )}
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
