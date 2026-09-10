/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Globe, Volume2, Smartphone, Download, Trash2, Shield, Info, Sparkles, Moon, Sun, Database, User as UserIcon, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { AppDirection, AppTheme } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../utils/rtlUtils';
import { playIosClick, triggerHaptic } from '../utils/iosFeedback';
import { getFirebaseStatus, signInWithGoogle, logoutUser } from '../services/firebaseService';
import type { User } from 'firebase/auth';

interface SettingsSheetProps {
  language: string;
  onLanguageChange: (lang: string) => void;
  direction: AppDirection;
  onDirectionChange: (dir: AppDirection) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  hapticsEnabled: boolean;
  onToggleHaptics: () => void;
  onClearHistory: () => void;
  onExportChat: () => void;
  currentUser?: User | null;
}

const SettingsSheet: React.FC<SettingsSheetProps> = ({
  language,
  onLanguageChange,
  direction,
  onDirectionChange,
  soundEnabled,
  onToggleSound,
  hapticsEnabled,
  onToggleHaptics,
  onClearHistory,
  onExportChat,
  currentUser = null,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const fbStatus = getFirebaseStatus();

  const handleSignIn = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      playIosClick(soundEnabled);
      triggerHaptic('light', hapticsEnabled);
      await signInWithGoogle();
    } catch (err: any) {
      console.error('Sign in failed:', err);
      setAuthError(err?.message || 'Authentication failed. Please check popup permissions.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthLoading(true);
      playIosClick(soundEnabled);
      triggerHaptic('medium', hapticsEnabled);
      await logoutUser();
    } catch (err: any) {
      console.error('Sign out failed:', err);
    } finally {
      setAuthLoading(false);
    }
  };
  return (
    <div className="h-full max-w-2xl mx-auto p-3 sm:p-5 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
      
      {/* Group 1: Localization & RTL Direction */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1">
          Language & Layout (BiDi / RTL)
        </h3>

        {/* Language Selector */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#007AFF]/20 text-[#5AC8FA] flex items-center justify-center">
              <Globe size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">App Language</p>
              <p className="text-[11px] text-[#8E8E93]">Select preferred language for AI responses</p>
            </div>
          </div>

          <select
            value={language}
            onChange={(e) => {
              playIosClick(soundEnabled);
              onLanguageChange(e.target.value);
            }}
            className="bg-[#2C2C2E] text-xs font-semibold text-white border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#007AFF] cursor-pointer"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flagEmoji} {l.nativeName}
              </option>
            ))}
          </select>
        </div>

        <div className="h-px bg-white/5" />

        {/* RTL Layout Direction */}
        <div className="flex items-center justify-between py-1">
          <div>
            <p className="text-sm font-semibold text-white">{getTranslation('rtlMode', language)}</p>
            <p className="text-[11px] text-[#8E8E93]">Force right-to-left layout for Arabic, Hebrew, Urdu</p>
          </div>

          <div className="bg-[#2C2C2E] p-1 rounded-xl flex items-center border border-white/10">
            <button
              onClick={() => {
                playIosClick(soundEnabled);
                triggerHaptic('light', hapticsEnabled);
                onDirectionChange('auto');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                direction === 'auto' ? 'bg-[#007AFF] text-white shadow' : 'text-[#8E8E93]'
              }`}
            >
              Auto
            </button>
            <button
              onClick={() => {
                playIosClick(soundEnabled);
                triggerHaptic('light', hapticsEnabled);
                onDirectionChange('rtl');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                direction === 'rtl' ? 'bg-[#007AFF] text-white shadow' : 'text-[#8E8E93]'
              }`}
            >
              RTL
            </button>
            <button
              onClick={() => {
                playIosClick(soundEnabled);
                triggerHaptic('light', hapticsEnabled);
                onDirectionChange('ltr');
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                direction === 'ltr' ? 'bg-[#007AFF] text-white shadow' : 'text-[#8E8E93]'
              }`}
            >
              LTR
            </button>
          </div>
        </div>
      </div>

      {/* Group 2: Sensory Feedback & iOS Features */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-4">
        <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1">
          iOS Sound & Haptics
        </h3>

        {/* Sound Effects Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#34C759]/20 text-[#34C759] flex items-center justify-center">
              <Volume2 size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{getTranslation('soundEffects', language)}</p>
              <p className="text-[11px] text-[#8E8E93]">Play subtle iOS tap and receive audio feedback</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={() => {
                playIosClick(!soundEnabled);
                triggerHaptic('light', hapticsEnabled);
                onToggleSound();
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#3A3A3C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
          </label>
        </div>

        <div className="h-px bg-white/5" />

        {/* Haptics Toggle */}
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#AF52DE]/20 text-[#BF5AF2] flex items-center justify-center">
              <Smartphone size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{getTranslation('haptics', language)}</p>
              <p className="text-[11px] text-[#8E8E93]">Vibrations on mobile touch events</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={hapticsEnabled}
              onChange={() => {
                triggerHaptic('light', !hapticsEnabled);
                onToggleHaptics();
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-[#3A3A3C] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#34C759]"></div>
          </label>
        </div>
      </div>

      {/* Group: Firebase Cloud Ecosystem */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1">
            Firebase Cloud Backend
          </h3>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#34C759]/15 text-[#30D158] border border-[#34C759]/30">
            <CheckCircle2 size={11} />
            Connected
          </span>
        </div>

        <div className="bg-[#2C2C2E]/60 rounded-2xl p-3 border border-white/5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8E8E93]">Cloud Project</span>
            <span className="text-white font-mono font-medium">{fbStatus.projectId}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8E8E93]">Auth Domain</span>
            <span className="text-white font-mono font-medium truncate max-w-[180px] sm:max-w-none">{fbStatus.authDomain}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8E8E93]">Persistence</span>
            <span className="text-[#5AC8FA] font-medium">Cloud Firestore + Local Mirror</span>
          </div>
        </div>

        {/* User Account / Auth Status */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'User'}
                className="w-10 h-10 rounded-full border border-white/20"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#007AFF]/20 text-[#5AC8FA] flex items-center justify-center border border-[#007AFF]/30">
                <UserIcon size={18} />
              </div>
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {currentUser?.displayName || (currentUser ? 'Firebase User' : 'Guest Mode')}
              </p>
              <p className="text-[11px] text-[#8E8E93]">
                {currentUser?.email || 'Cloud syncing active for current session'}
              </p>
            </div>
          </div>

          {currentUser ? (
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold flex items-center gap-1.5 transition-all ios-press"
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleSignIn}
              disabled={authLoading}
              className="px-3.5 py-1.5 rounded-xl bg-[#007AFF] hover:bg-[#007AFF]/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ios-press disabled:opacity-50"
            >
              <LogIn size={13} />
              <span>{authLoading ? 'Signing In...' : 'Sign In'}</span>
            </button>
          )}
        </div>

        {authError && (
          <div className="p-2.5 rounded-xl bg-[#FF3B30]/10 border border-[#FF3B30]/20 text-[#FF453A] text-xs">
            {authError}
          </div>
        )}
      </div>

      {/* Group 3: Data Management & Actions */}
      <div className="ios-card rounded-3xl p-4 sm:p-5 shadow-xl border border-white/10 flex flex-col gap-3">
        <h3 className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider px-1">
          Data & Management
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => {
              playIosClick(soundEnabled);
              triggerHaptic('light', hapticsEnabled);
              onExportChat();
            }}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-white flex items-center gap-2.5 transition-all text-xs font-semibold ios-press"
          >
            <Download size={16} className="text-[#5AC8FA]" />
            <span>{getTranslation('exportChat', language)}</span>
          </button>

          <button
            onClick={() => {
              playIosClick(soundEnabled);
              triggerHaptic('error', hapticsEnabled);
              onClearHistory();
            }}
            className="p-3 rounded-2xl bg-[#FF3B30]/10 hover:bg-[#FF3B30]/20 border border-[#FF3B30]/20 text-[#FF453A] flex items-center gap-2.5 transition-all text-xs font-semibold ios-press"
          >
            <Trash2 size={16} />
            <span>{getTranslation('clearChat', language)}</span>
          </button>
        </div>
      </div>

      {/* Group 4: About & AI Model Information */}
      <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#007AFF] to-[#5856D6] flex items-center justify-center text-white flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Harmony DocAI v2.0</p>
          <p className="text-[11px] text-[#8E8E93]">
            Powered by Google DeepMind Gemini 3.7 Flash with Multimodal PDF & Word Engine
          </p>
        </div>
      </div>

    </div>
  );
};

export default SettingsSheet;
