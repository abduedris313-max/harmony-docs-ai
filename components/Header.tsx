/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MessageSquare, Files, Settings, Volume2, VolumeX, Sparkles, Globe } from 'lucide-react';
import { AppDirection, AppLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/rtlUtils';
import { playIosClick, triggerHaptic } from '../utils/iosFeedback';

interface HeaderProps {
  activeTab: 'chat' | 'docs' | 'settings';
  onTabChange: (tab: 'chat' | 'docs' | 'settings') => void;
  documentCount: number;
  urlCount: number;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  direction: AppDirection;
  onToggleDirection: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
}

const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  documentCount,
  urlCount,
  currentLanguage,
  onLanguageChange,
  direction,
  onToggleDirection,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
}) => {
  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];
  const isRtlLayout = direction === 'rtl' || (direction === 'auto' && currentLangObj.isRTL);

  const handleTabClick = (tab: 'chat' | 'docs' | 'settings') => {
    playIosClick(soundEnabled);
    triggerHaptic('light', hapticsEnabled);
    onTabChange(tab);
  };

  return (
    <header className="sticky top-0 z-40 w-full ios-blur bg-black/75 border-b border-white/10 pt-safe px-3 sm:px-6 pb-2.5 transition-all">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Brand & Dynamic Badge */}
        <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] p-0.5 shadow-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg" role="img" aria-label="Book">📖</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                  {getTranslation('appTitle', currentLanguage)}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#007AFF]/20 text-[#5AC8FA] border border-[#007AFF]/30">
                    PDF & Word
                  </span>
                </h1>
              </div>
              <p className="text-[11px] text-[#8E8E93] hidden sm:block truncate max-w-xs">
                {getTranslation('appSubtitle', currentLanguage)}
              </p>
            </div>
          </div>

          {/* Quick Controls on Mobile */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={onToggleDirection}
              className={`px-2 py-1 rounded-lg text-xs font-medium border transition-all ${
                direction === 'rtl'
                  ? 'bg-[#007AFF] text-white border-[#007AFF]'
                  : 'bg-white/10 text-[#AEAEB2] border-white/10'
              }`}
              title="Toggle RTL / LTR layout"
              aria-label="Toggle RTL layout"
            >
              {direction === 'rtl' ? 'RTL' : 'LTR'}
            </button>
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-lg bg-white/10 text-[#AEAEB2] hover:text-white transition-colors"
              title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
              aria-label="Toggle sound"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
          </div>
        </div>

        {/* iOS Segmented Navigation Bar */}
        <div className="w-full sm:w-auto flex items-center justify-center">
          <div className="bg-[#1C1C1E] p-1 rounded-2xl border border-white/10 flex items-center w-full sm:w-auto shadow-inner">
            <button
              onClick={() => handleTabClick('chat')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ios-press ${
                activeTab === 'chat'
                  ? 'bg-[#007AFF] text-white shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <MessageSquare size={15} />
              <span>{getTranslation('chatTab', currentLanguage)}</span>
            </button>

            <button
              onClick={() => handleTabClick('docs')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ios-press ${
                activeTab === 'docs'
                  ? 'bg-[#007AFF] text-white shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Files size={15} />
              <span>{getTranslation('docsTab', currentLanguage)}</span>
              {(documentCount > 0 || urlCount > 0) && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'docs' ? 'bg-white/25 text-white' : 'bg-[#2C2C2E] text-[#5AC8FA]'
                }`}>
                  {documentCount + urlCount}
                </span>
              )}
            </button>

            <button
              onClick={() => handleTabClick('settings')}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ios-press ${
                activeTab === 'settings'
                  ? 'bg-[#007AFF] text-white shadow-md'
                  : 'text-[#8E8E93] hover:text-white'
              }`}
            >
              <Settings size={15} />
              <span>{getTranslation('settingsTab', currentLanguage)}</span>
            </button>
          </div>
        </div>

        {/* Desktop Quick Header Utilities */}
        <div className="hidden sm:flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <select
              value={currentLanguage}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-[#1C1C1E] text-xs font-medium text-white border border-white/10 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#007AFF] cursor-pointer appearance-none pr-7"
              aria-label="Select Language"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-[#1C1C1E] text-white">
                  {lang.flagEmoji} {lang.nativeName}
                </option>
              ))}
            </select>
            <Globe size={13} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8E8E93] pointer-events-none" />
          </div>

          {/* Direction Toggle */}
          <button
            onClick={onToggleDirection}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ios-press ${
              direction === 'rtl'
                ? 'bg-[#007AFF] text-white border-[#007AFF]'
                : 'bg-[#1C1C1E] text-[#AEAEB2] hover:text-white border-white/10'
            }`}
            title="Toggle Right-to-Left (RTL) mode"
          >
            {direction === 'rtl' ? '🇸🇦 RTL' : '🇺🇸 LTR'}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 rounded-xl bg-[#1C1C1E] border border-white/10 text-[#AEAEB2] hover:text-white transition-colors ios-press"
            title={soundEnabled ? 'Mute sound effects' : 'Enable iOS sound effects'}
            aria-label="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
