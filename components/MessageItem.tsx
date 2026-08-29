/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';
import { Volume2, VolumeX, Copy, Check, FileText, Globe, Sparkles, Smile, X } from 'lucide-react';
import { ChatMessage, MessageSender } from '../types';
import { isRTL } from '../utils/rtlUtils';
import { speakText, stopSpeaking, triggerHaptic, playIosClick } from '../utils/iosFeedback';

marked.setOptions({
  highlight: function (code, lang) {
    const language = hljs.getLanguage(lang) ? lang : 'plaintext';
    return hljs.highlight(code, { language }).value;
  },
  langPrefix: 'hljs language-',
} as any);

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '👏', '⭐', '💡', '😂'];

interface MessageItemProps {
  message: ChatMessage;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  onReact?: (emoji: string) => void;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, soundEnabled, hapticsEnabled, onReact }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showReactionMenu, setShowReactionMenu] = useState(false);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isUser = message.sender === MessageSender.USER;
  const isModel = message.sender === MessageSender.MODEL;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const messageIsRTL = message.isRTL ?? isRTL(message.text);

  const startLongPress = () => {
    if (message.isLoading) return;
    longPressTimerRef.current = setTimeout(() => {
      triggerHaptic('medium', hapticsEnabled);
      playIosClick(soundEnabled);
      setShowReactionMenu(true);
    }, 450);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleSelectEmoji = (emoji: string) => {
    if (onReact) {
      onReact(emoji);
    }
    setShowReactionMenu(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setIsCopied(true);
    playIosClick(soundEnabled);
    triggerHaptic('light', hapticsEnabled);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleToggleSpeech = () => {
    playIosClick(soundEnabled);
    triggerHaptic('light', hapticsEnabled);
    if (isPlayingAudio) {
      stopSpeaking();
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      speakText(message.text, messageIsRTL, () => setIsPlayingAudio(false));
    }
  };

  const renderContent = () => {
    if (message.isLoading) {
      return (
        <div className="flex items-center space-x-2 py-1">
          <div className="w-2 h-2 rounded-full bg-[#5AC8FA] animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#5AC8FA] animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 rounded-full bg-[#5AC8FA] animate-bounce"></div>
          <span className="text-xs text-[#8E8E93] ml-2">Thinking & Analyzing Documents...</span>
        </div>
      );
    }

    if (isModel) {
      const rawMarkup = marked.parse(message.text || '') as string;
      return (
        <div
          className={`prose prose-sm w-full max-w-none text-[#F2F2F7] ${messageIsRTL ? 'font-arabic text-right' : 'text-left'}`}
          dir={messageIsRTL ? 'rtl' : 'ltr'}
          dangerouslySetInnerHTML={{ __html: rawMarkup }}
        />
      );
    }

    return (
      <div
        className={`whitespace-pre-wrap text-sm leading-relaxed ${messageIsRTL ? 'font-arabic text-right' : 'text-left'}`}
        dir={messageIsRTL ? 'rtl' : 'ltr'}
      >
        {message.text}
      </div>
    );
  };

  return (
    <div className={`flex w-full mb-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[92%] sm:max-w-[80%] flex flex-col relative ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* Sender Name / AI Tag */}
        {!isSystem && (
          <div className="flex items-center gap-1.5 px-2 mb-1 text-[11px] text-[#8E8E93]">
            {isModel ? (
              <>
                <Sparkles size={11} className="text-[#5AC8FA]" />
                <span className="font-semibold text-[#5AC8FA]">Harmony DocAI</span>
                {messageIsRTL && <span className="text-[10px] text-[#34C759] font-medium">• RTL</span>}
              </>
            ) : (
              <span className="font-medium">You</span>
            )}
          </div>
        )}

        {/* Emoji Reaction Popover Menu */}
        {showReactionMenu && (
          <div className={`absolute z-30 -top-10 ${isUser ? 'right-0' : 'left-0'} flex items-center gap-1 p-1.5 rounded-full bg-[#1C1C1E] border border-white/20 shadow-2xl animate-in fade-in zoom-in-95 duration-150`}>
            {EMOJI_OPTIONS.map((emoji) => {
              const isSelected = message.reactions?.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleSelectEmoji(emoji)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm hover:scale-125 transition-transform ${
                    isSelected ? 'bg-white/25 scale-110' : 'hover:bg-white/10'
                  }`}
                  title={`React ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
            <button
              onClick={() => setShowReactionMenu(false)}
              className="p-1 rounded-full hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors"
              title="Close menu"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Message Bubble */}
        <div
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
          onTouchMove={cancelLongPress}
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowReactionMenu(true);
          }}
          className={`relative p-3.5 sm:p-4 rounded-3xl transition-all shadow-md select-none ${
            isUser
              ? 'bg-[#007AFF] text-white rounded-br-md font-medium'
              : isModel
              ? 'ios-card text-[#F2F2F7] rounded-bl-md border border-white/10'
              : 'bg-[#1C1C1E] text-[#8E8E93] border border-white/5 rounded-2xl text-xs'
          }`}
        >
          {renderContent()}

          {/* Model Citations & URLs */}
          {isModel && !message.isLoading && message.urlContext && message.urlContext.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-white/10">
              <p className="text-[11px] font-bold text-[#8E8E93] mb-1.5 flex items-center gap-1">
                <Globe size={12} />
                Grounding Sources ({message.urlContext.length}):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {message.urlContext.map((meta, i) => (
                  <a
                    key={i}
                    href={meta.retrievedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] text-[#5AC8FA] hover:underline max-w-xs truncate border border-white/5"
                    title={meta.retrievedUrl}
                  >
                    <span className="truncate">{meta.retrievedUrl.replace(/^https?:\/\//, '')}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Reaction Pill Badges on Message */}
          {message.reactions && message.reactions.length > 0 && (
            <div className={`flex flex-wrap gap-1 mt-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {message.reactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact && onReact(emoji)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 text-xs text-white border border-white/10 transition-all shadow-sm"
                  title="Toggle reaction"
                >
                  <span>{emoji}</span>
                </button>
              ))}
            </div>
          )}

          {/* Action Bar for AI Message */}
          {isModel && !message.isLoading && (
            <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[#8E8E93]">
              <span className="text-[10px]">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReactionMenu((prev) => !prev)}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors"
                  title="Add reaction"
                  aria-label="Add emoji reaction"
                >
                  <Smile size={14} />
                </button>

                <button
                  onClick={handleToggleSpeech}
                  className={`p-1 rounded-lg hover:bg-white/10 transition-colors ${
                    isPlayingAudio ? 'text-[#34C759] bg-[#34C759]/20' : 'text-[#8E8E93] hover:text-white'
                  }`}
                  title={isPlayingAudio ? 'Stop reading' : 'Read aloud'}
                  aria-label="Toggle speech synthesis"
                >
                  {isPlayingAudio ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>

                <button
                  onClick={handleCopy}
                  className="p-1 rounded-lg hover:bg-white/10 text-[#8E8E93] hover:text-white transition-colors"
                  title="Copy answer"
                  aria-label="Copy message"
                >
                  {isCopied ? <Check size={14} className="text-[#34C759]" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default MessageItem;
