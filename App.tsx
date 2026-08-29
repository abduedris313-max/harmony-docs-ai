/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ChatMessage, KnowledgeDocument, MessageSender, URLGroup, AppDirection } from './types';
import Header from './components/Header';
import ChatInterface from './components/ChatInterface';
import KnowledgeBaseManager from './components/KnowledgeBaseManager';
import SettingsSheet from './components/SettingsSheet';
import { sendChatMessage, fetchSmartSuggestions, parseUploadedFiles } from './services/apiService';
import { loadPersistedDocuments, persistDocuments, loadPersistedMessages, persistMessages } from './services/firebaseService';
import { SAMPLE_DOCUMENTS } from './utils/sampleDocuments';
import { isRTL, resolveDirection, SUPPORTED_LANGUAGES } from './utils/rtlUtils';
import { playIosReceiveSound, triggerHaptic } from './utils/iosFeedback';

const INITIAL_URL_GROUPS: URLGroup[] = [
  {
    id: 'gemini-docs',
    name: 'Gemini API Reference',
    urls: [
      'https://ai.google.dev/gemini-api/docs',
      'https://ai.google.dev/gemini-api/docs/models/gemini',
      'https://ai.google.dev/gemini-api/docs/document-processing',
    ],
  },
  {
    id: 'multimodal-ai',
    name: 'Multimodal Vision & PDF AI',
    urls: [
      'https://cloud.google.com/vertex-ai/docs/generative-ai/multimodal/overview',
    ],
  },
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'docs' | 'settings'>('chat');
  const [urlGroups, setUrlGroups] = useState<URLGroup[]>(INITIAL_URL_GROUPS);
  const [activeUrlGroupId, setActiveUrlGroupId] = useState<string>('gemini-docs');
  
  // Documents & Chat State
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() => {
    const loaded = loadPersistedDocuments('guest');
    return loaded.length > 0 ? loaded : SAMPLE_DOCUMENTS.slice(0, 2);
  });
  
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const loaded = loadPersistedMessages('guest');
    return loaded.length > 0 ? loaded : [];
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // App Settings
  const [language, setLanguage] = useState<string>(() => localStorage.getItem('harmony_lang') || 'auto');
  const [direction, setDirection] = useState<AppDirection>(() => (localStorage.getItem('harmony_dir') as AppDirection) || 'auto');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => localStorage.getItem('harmony_sound') !== 'false');
  const [hapticsEnabled, setHapticsEnabled] = useState<boolean>(() => localStorage.getItem('harmony_haptics') !== 'false');

  const activeGroup = urlGroups.find((g) => g.id === activeUrlGroupId);
  const currentUrls = activeGroup ? activeGroup.urls : [];

  // Update HTML document direction and language attribute dynamically
  useEffect(() => {
    const effectiveDir = resolveDirection(direction, language === 'ar' || language === 'he' || language === 'fa' || language === 'ur' ? 'عربي' : '');
    document.documentElement.setAttribute('dir', effectiveDir);
    document.documentElement.setAttribute('lang', language === 'auto' ? 'en' : language);
    localStorage.setItem('harmony_lang', language);
    localStorage.setItem('harmony_dir', direction);
  }, [direction, language]);

  // Persist documents & messages
  useEffect(() => {
    persistDocuments('guest', documents);
  }, [documents]);

  useEffect(() => {
    persistMessages('guest', messages);
  }, [messages]);

  // Load Smart Suggestions
  const loadSuggestions = useCallback(async () => {
    try {
      const isRtlPreferred = direction === 'rtl' || language === 'ar' || language === 'he' || language === 'fa' || language === 'ur';
      const data = await fetchSmartSuggestions(currentUrls, documents, language, isRtlPreferred);
      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.warn('Failed to load suggestions:', e);
    }
  }, [currentUrls, documents, language, direction]);

  useEffect(() => {
    loadSuggestions();
  }, [documents.length, activeUrlGroupId]);

  // Handle URL changes
  const handleAddUrl = (newUrl: string) => {
    setUrlGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeUrlGroupId) {
          return { ...group, urls: [...group.urls, newUrl] };
        }
        return group;
      })
    );
  };

  const handleRemoveUrl = (urlToRemove: string) => {
    setUrlGroups((prev) =>
      prev.map((group) => {
        if (group.id === activeUrlGroupId) {
          return { ...group, urls: group.urls.filter((u) => u !== urlToRemove) };
        }
        return group;
      })
    );
  };

  // Handle Document uploads
  const handleAddDocuments = (newDocs: KnowledgeDocument[]) => {
    setDocuments((prev) => [...newDocs, ...prev]);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
  };

  const handleUploadFromChat = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsLoading(true);
      const parsed = await parseUploadedFiles(Array.from(files));
      handleAddDocuments(parsed);
    } catch (err) {
      console.error('Upload from chat failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Sending a Message
  const handleSendMessage = async (userPrompt: string) => {
    const isPromptRTL = isRTL(userPrompt);
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      text: userPrompt,
      sender: MessageSender.USER,
      timestamp: new Date(),
      isRTL: isPromptRTL,
    };

    const loadingMessageId = `msg-${Date.now()}-model`;
    const placeholderMessage: ChatMessage = {
      id: loadingMessageId,
      text: '',
      sender: MessageSender.MODEL,
      timestamp: new Date(),
      isLoading: true,
      isRTL: isPromptRTL,
    };

    setMessages((prev) => [...prev, userMessage, placeholderMessage]);
    setIsLoading(true);

    try {
      const isRtlPreferred = direction === 'rtl' || (direction === 'auto' && isPromptRTL) || language === 'ar' || language === 'he' || language === 'fa' || language === 'ur';
      
      const response = await sendChatMessage(
        userPrompt,
        currentUrls,
        documents,
        messages,
        language,
        isRtlPreferred
      );

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === loadingMessageId) {
            return {
              ...msg,
              text: response.text,
              isLoading: false,
              isRTL: response.isRTL ?? isRTL(response.text),
              urlContext: response.urlContextMetadata,
            };
          }
          return msg;
        })
      );

      playIosReceiveSound(soundEnabled);
      triggerHaptic('success', hapticsEnabled);
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === loadingMessageId) {
            return {
              ...msg,
              text: `⚠️ **Error Processing Request**: ${error.message || 'Could not communicate with the AI engine.'}`,
              isLoading: false,
              isRTL: false,
            };
          }
          return msg;
        })
      );
      triggerHaptic('error', hapticsEnabled);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDirection = () => {
    const nextDir = direction === 'rtl' ? 'ltr' : 'rtl';
    setDirection(nextDir);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('harmony_sound', String(next));
  };

  const handleToggleHaptics = () => {
    const next = !hapticsEnabled;
    setHapticsEnabled(next);
    localStorage.setItem('harmony_haptics', String(next));
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat messages?')) {
      setMessages([]);
      localStorage.removeItem('harmony_messages_guest');
    }
  };

  const handleExportChat = () => {
    if (messages.length === 0) {
      alert('No messages to export.');
      return;
    }

    let exportContent = '# Harmony DocAI - Chat Export\n\n';
    exportContent += `Date: ${new Date().toLocaleString()}\n`;
    exportContent += `Active Documents: ${documents.map((d) => d.name).join(', ') || 'None'}\n\n---\n\n`;

    for (const msg of messages) {
      const senderName = msg.sender === MessageSender.USER ? '👤 User' : '✨ Harmony DocAI';
      exportContent += `### ${senderName} (${msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ''})\n\n${msg.text}\n\n---\n\n`;
    }

    const blob = new Blob([exportContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Harmony_DocAI_Chat_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-black text-[#F2F2F7] overflow-hidden">
      
      {/* iOS Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        documentCount={documents.length}
        urlCount={currentUrls.length}
        currentLanguage={language}
        onLanguageChange={setLanguage}
        direction={direction}
        onToggleDirection={handleToggleDirection}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        hapticsEnabled={hapticsEnabled}
      />

      {/* Main View Container */}
      <main className="flex-grow overflow-hidden relative">
        {activeTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            urls={currentUrls}
            documents={documents}
            suggestions={suggestions}
            onSelectSuggestion={handleSendMessage}
            onRefreshSuggestions={loadSuggestions}
            onUploadFile={handleUploadFromChat}
            language={language}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
            onOpenDocsTab={() => setActiveTab('docs')}
          />
        )}

        {activeTab === 'docs' && (
          <KnowledgeBaseManager
            urls={currentUrls}
            onAddUrl={handleAddUrl}
            onRemoveUrl={handleRemoveUrl}
            urlGroups={urlGroups}
            activeUrlGroupId={activeUrlGroupId}
            onSetGroupId={setActiveUrlGroupId}
            documents={documents}
            onAddDocuments={handleAddDocuments}
            onRemoveDocument={handleRemoveDocument}
            language={language}
            soundEnabled={soundEnabled}
            hapticsEnabled={hapticsEnabled}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsSheet
            language={language}
            onLanguageChange={setLanguage}
            direction={direction}
            onDirectionChange={setDirection}
            soundEnabled={soundEnabled}
            onToggleSound={handleToggleSound}
            hapticsEnabled={hapticsEnabled}
            onToggleHaptics={handleToggleHaptics}
            onClearHistory={handleClearHistory}
            onExportChat={handleExportChat}
          />
        )}
      </main>

    </div>
  );
};

export default App;
