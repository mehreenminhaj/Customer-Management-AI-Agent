import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Header } from './components/Header';
import { SheetsSyncCard } from './components/SheetsSyncCard';
import { MessageList } from './components/MessageList';
import { MessageDetailPanel } from './components/MessageDetailPanel';
import { NewMessageModal } from './components/NewMessageModal';
import { AgentSettingsModal } from './components/AgentSettingsModal';
import { SheetsSyncLogModal } from './components/SheetsSyncLogModal';
import { CustomerMessage, AgentSettings, ClassificationResponse } from './types';
import { INITIAL_MESSAGES } from './sampleData';
import { initAuth, googleSignIn, logoutGoogle, getAccessToken, setCachedAccessToken } from './lib/auth';
import { appendMessageToSheet } from './lib/sheets';
import { Sparkles, Sliders, Play, CheckCircle, RefreshCw, AlertCircle, Database } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<CustomerMessage[]>(() => {
    const saved = localStorage.getItem('agent_messages_cache');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_MESSAGES;
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => messages[0]?.id || null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Spreadsheet configuration state
  const [spreadsheetId, setSpreadsheetId] = useState<string>(() => {
    return localStorage.getItem('agent_active_sheet_id') || '';
  });
  const [spreadsheetTitle, setSpreadsheetTitle] = useState<string>(() => {
    return localStorage.getItem('agent_active_sheet_title') || '';
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string>(() => {
    return localStorage.getItem('agent_active_sheet_url') || '';
  });

  // Modals state
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSyncLogOpen, setIsSyncLogOpen] = useState(false);

  // Processing state
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [batchSyncing, setBatchSyncing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<AgentSettings>(() => {
    const saved = localStorage.getItem('agent_workflow_settings');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      autoRespond: true,
      autoSyncSheets: true,
      tone: 'professional',
      requireApprovalForNegative: true,
      supportSignature: 'Customer Success & Support Operations',
      companyName: 'Unified Platform Support',
    };
  });

  // Save messages to local cache
  useEffect(() => {
    localStorage.setItem('agent_messages_cache', JSON.stringify(messages));
  }, [messages]);

  // Save settings to local cache
  useEffect(() => {
    localStorage.setItem('agent_workflow_settings', JSON.stringify(settings));
  }, [settings]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = initAuth(
      (authenticatedUser, token) => {
        setUser(authenticatedUser);
        setAccessToken(token);
      },
      () => {
        // Not authenticated
      }
    );
    return () => unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setAccessToken(result.accessToken);
        showToast('Connected to Google Account successfully!');
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      showToast(`Sign in error: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleSignOut = async () => {
    await logoutGoogle();
    setUser(null);
    setAccessToken(null);
    showToast('Signed out of Google account.');
  };

  const handleSpreadsheetConfigured = (id: string, title: string, url: string) => {
    setSpreadsheetId(id);
    setSpreadsheetTitle(title);
    setSpreadsheetUrl(url);
    localStorage.setItem('agent_active_sheet_id', id);
    localStorage.setItem('agent_active_sheet_title', title);
    localStorage.setItem('agent_active_sheet_url', url);
    showToast(`Google Sheet linked: "${title}"`);
  };

  /**
   * Run Gemini 3.8 Flash classification and response drafting
   */
  const classifySingleMessage = async (msg: CustomerMessage): Promise<CustomerMessage> => {
    const response = await fetch('/api/classify-and-respond', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: msg.customerName,
        customerEmail: msg.customerEmail,
        channel: msg.channel,
        subject: msg.subject,
        content: msg.content,
        tone: settings.tone,
        companyName: settings.companyName,
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Classification failed');
    }

    const resJson = await response.json();
    const data: ClassificationResponse = resJson.data;

    const initialResponseStatus = 
      settings.requireApprovalForNegative && (data.sentiment === 'Negative' || data.sentiment === 'Urgent')
        ? 'draft'
        : 'draft';

    const updated: CustomerMessage = {
      ...msg,
      category: data.category,
      sentiment: data.sentiment,
      priority: data.priority,
      summary: data.summary,
      keyIssues: data.keyIssues,
      suggestedAction: data.suggestedAction,
      autoResponse: data.autoResponse,
      responseStatus: initialResponseStatus,
      status: 'responded',
    };

    return updated;
  };

  /**
   * Handle receiving a new message (or simulating incoming webhooks)
   */
  const handleReceiveMessage = async (msgData: Partial<CustomerMessage>, runImmediate: boolean) => {
    const newMsg: CustomerMessage = {
      id: msgData.id || `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: msgData.customerName || 'Anonymous Customer',
      customerEmail: msgData.customerEmail || 'customer@example.com',
      channel: msgData.channel || 'Email',
      subject: msgData.subject || '(No Subject)',
      content: msgData.content || '',
      receivedAt: msgData.receivedAt || new Date().toISOString(),
      status: 'pending',
      syncedToSheets: false,
    };

    // Prepend to list
    setMessages((prev) => [newMsg, ...prev]);
    setSelectedId(newMsg.id);

    if (runImmediate) {
      setIsProcessingAI(true);
      try {
        const classified = await classifySingleMessage(newMsg);
        
        let finalMessage = classified;

        // If auto-sync to sheets is on and sheet configured and auth token present
        if (settings.autoSyncSheets && spreadsheetId && accessToken) {
          try {
            await appendMessageToSheet(accessToken, spreadsheetId, classified);
            finalMessage = {
              ...classified,
              syncedToSheets: true,
              syncedAt: new Date().toISOString(),
            };
            showToast(`Classified and synced ${newMsg.id} to Google Sheets`);
          } catch (sheetErr: any) {
            console.error('Auto sync to sheet failed:', sheetErr);
            showToast(`Classified, but Sheets sync failed: ${sheetErr.message}`);
          }
        } else {
          showToast(`Classified ${newMsg.id} as ${classified.category}`);
        }

        setMessages((prev) => prev.map((m) => (m.id === newMsg.id ? finalMessage : m)));
      } catch (err: any) {
        console.error('Classification error:', err);
        showToast(`AI analysis error: ${err.message}`);
      } finally {
        setIsProcessingAI(false);
      }
    }
  };

  /**
   * Trigger AI Classification for a specific message
   */
  const handleClassifyMessage = async (id: string) => {
    const target = messages.find((m) => m.id === id);
    if (!target) return;

    setIsProcessingAI(true);
    try {
      const updated = await classifySingleMessage(target);
      setMessages((prev) => prev.map((m) => (m.id === id ? updated : m)));
      showToast(`Analyzed ${id}: ${updated.category} (${updated.sentiment})`);
    } catch (err: any) {
      console.error(err);
      showToast(`Error: ${err.message}`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  /**
   * Update message auto-response draft or status
   */
  const handleUpdateResponse = (id: string, newResponse: string, newStatus: 'draft' | 'approved' | 'sent') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          return {
            ...m,
            autoResponse: newResponse,
            responseStatus: newStatus,
          };
        }
        return m;
      })
    );
    showToast(`Updated response status to: ${newStatus}`);
  };

  /**
   * Sync a specific message to Google Sheets
   */
  const handleSyncMessageToSheets = async (id: string) => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    if (!spreadsheetId) {
      showToast('Please create or select a Google Sheet first.');
      return;
    }

    const target = messages.find((m) => m.id === id);
    if (!target) return;

    try {
      await appendMessageToSheet(accessToken, spreadsheetId, target);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === id) {
            return {
              ...m,
              syncedToSheets: true,
              syncedAt: new Date().toISOString(),
            };
          }
          return m;
        })
      );
      showToast(`Synced ${id} to Google Sheets row!`);
    } catch (err: any) {
      console.error(err);
      showToast(`Sync failed: ${err.message}`);
    }
  };

  /**
   * Batch Sync All Unsynced Messages to Google Sheets
   */
  const handleSyncAllToSheets = async () => {
    if (!accessToken) {
      handleSignIn();
      return;
    }
    if (!spreadsheetId) {
      showToast('Please connect or create a Google Sheet first.');
      return;
    }

    const unsynced = messages.filter((m) => !m.syncedToSheets);
    if (unsynced.length === 0) {
      showToast('All messages are already synced to Google Sheets.');
      return;
    }

    setBatchSyncing(true);
    let count = 0;
    try {
      for (const msg of unsynced) {
        await appendMessageToSheet(accessToken, spreadsheetId, msg);
        count++;
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, syncedToSheets: true, syncedAt: new Date().toISOString() } : m))
        );
      }
      showToast(`Successfully synced ${count} messages to Google Sheets.`);
    } catch (err: any) {
      console.error(err);
      showToast(`Batch sync paused after ${count} items: ${err.message}`);
    } finally {
      setBatchSyncing(false);
    }
  };

  const selectedMessage = messages.find((m) => m.id === selectedId) || null;
  const syncedCount = messages.filter((m) => m.syncedToSheets).length;

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Top Application Header */}
      <Header
        user={user}
        accessToken={accessToken}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        spreadsheetTitle={spreadsheetTitle}
        spreadsheetUrl={spreadsheetUrl}
        activeCount={messages.length}
        syncedCount={syncedCount}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        {/* Google Sheets Sync Card */}
        <SheetsSyncCard
          accessToken={accessToken}
          currentSpreadsheetId={spreadsheetId}
          spreadsheetTitle={spreadsheetTitle}
          spreadsheetUrl={spreadsheetUrl}
          onSpreadsheetConfigured={handleSpreadsheetConfigured}
          onSignInRequired={handleSignIn}
        />

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-700">Agent Operations:</span>
            <button
              id="batch-sync-sheets-btn"
              onClick={handleSyncAllToSheets}
              disabled={batchSyncing || !spreadsheetId}
              className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors disabled:opacity-50"
            >
              {batchSyncing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Database className="w-3.5 h-3.5" />
              )}
              Sync All Unsynced ({messages.filter(m => !m.syncedToSheets).length})
            </button>

            <button
              id="open-sync-logs-btn"
              onClick={() => setIsSyncLogOpen(true)}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors"
            >
              Inspect Sheet Rows
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="agent-settings-btn"
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-700 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              Workflow Rules
            </button>

            <button
              id="new-incoming-message-btn"
              onClick={() => setIsNewModalOpen(true)}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Simulate Incoming Message
            </button>
          </div>
        </div>

        {/* 2-Column Split: Message List & Detail Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-[580px]">
          {/* Left Column: Inbox List (5 cols) */}
          <div className="lg:col-span-5 h-[620px]">
            <MessageList
              messages={messages}
              selectedId={selectedId}
              onSelectMessage={(id) => setSelectedId(id)}
              selectedCategory={selectedCategory}
              onCategoryChange={(cat) => setSelectedCategory(cat)}
              onOpenNewModal={() => setIsNewModalOpen(true)}
            />
          </div>

          {/* Right Column: AI Detail & Auto-Response Panel (7 cols) */}
          <div className="lg:col-span-7 h-[620px]">
            <MessageDetailPanel
              message={selectedMessage}
              spreadsheetId={spreadsheetId}
              spreadsheetUrl={spreadsheetUrl}
              accessToken={accessToken}
              onClassifyMessage={handleClassifyMessage}
              onSyncMessageToSheets={handleSyncMessageToSheets}
              onUpdateResponse={handleUpdateResponse}
              isProcessing={isProcessingAI}
              onSignInRequired={handleSignIn}
            />
          </div>
        </div>
      </main>

      {/* Floating notification toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-stone-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <NewMessageModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmitMessage={handleReceiveMessage}
      />

      <AgentSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newSettings) => {
          setSettings(newSettings);
          showToast('Updated workflow settings');
        }}
      />

      <SheetsSyncLogModal
        isOpen={isSyncLogOpen}
        onClose={() => setIsSyncLogOpen(false)}
        spreadsheetTitle={spreadsheetTitle}
        spreadsheetUrl={spreadsheetUrl}
        spreadsheetId={spreadsheetId}
        messages={messages}
        onManualSyncRow={handleSyncMessageToSheets}
      />
    </div>
  );
}
