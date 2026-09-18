import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Check, 
  Edit3, 
  FileSpreadsheet, 
  Clock, 
  User, 
  Mail, 
  AlertTriangle, 
  Tag, 
  CheckCircle2, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { CustomerMessage, MessageCategory, MessagePriority, SentimentType } from '../types';

interface MessageDetailPanelProps {
  message: CustomerMessage | null;
  spreadsheetId: string;
  spreadsheetUrl: string;
  accessToken: string | null;
  onClassifyMessage: (id: string) => Promise<void>;
  onSyncMessageToSheets: (id: string) => Promise<void>;
  onUpdateResponse: (id: string, newResponse: string, newStatus: 'draft' | 'approved' | 'sent') => void;
  isProcessing: boolean;
  onSignInRequired: () => void;
}

export const MessageDetailPanel: React.FC<MessageDetailPanelProps> = ({
  message,
  spreadsheetId,
  spreadsheetUrl,
  accessToken,
  onClassifyMessage,
  onSyncMessageToSheets,
  onUpdateResponse,
  isProcessing,
  onSignInRequired,
}) => {
  const [isEditingResponse, setIsEditingResponse] = useState(false);
  const [editedResponse, setEditedResponse] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white border border-stone-200 rounded-xl">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-stone-800 mb-1">No Message Selected</h3>
        <p className="text-xs text-stone-500 max-w-xs">
          Select a customer message from the left to view its AI classification, auto-response draft, and Google Sheets sync logs.
        </p>
      </div>
    );
  }

  const handleStartEdit = () => {
    setEditedResponse(message.autoResponse || '');
    setIsEditingResponse(true);
  };

  const handleSaveEdit = () => {
    onUpdateResponse(message.id, editedResponse, 'approved');
    setIsEditingResponse(false);
  };

  const handleSendResponse = () => {
    onUpdateResponse(message.id, message.autoResponse || editedResponse, 'sent');
  };

  const handleSyncToSheets = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    setIsSyncing(true);
    try {
      await onSyncMessageToSheets(message.id);
    } finally {
      setIsSyncing(false);
    }
  };

  // Priority color styling
  const getPriorityBadge = (priority?: MessagePriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'High':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Medium':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Low':
        return 'bg-stone-100 text-stone-700 border-stone-200';
      default:
        return 'bg-stone-100 text-stone-600 border-stone-200';
    }
  };

  const getSentimentBadge = (sentiment?: SentimentType) => {
    switch (sentiment) {
      case 'Positive':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Urgent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Negative':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Detail Header */}
      <div className="p-4 sm:p-5 border-b border-stone-100 bg-stone-50/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                {message.id}
              </span>
              <span className="text-xs text-stone-500 font-medium">via {message.channel}</span>
              <span className="text-stone-300">•</span>
              <span className="text-xs text-stone-400">{new Date(message.receivedAt).toLocaleString()}</span>
            </div>
            <h2 className="text-base font-bold text-stone-900 tracking-tight">
              {message.subject || '(No Subject Provided)'}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-stone-600">
              <User className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-medium text-stone-900">{message.customerName}</span>
              <span className="text-stone-400">&lt;{message.customerEmail}&gt;</span>
            </div>
          </div>

          {/* Sync status & Actions */}
          <div className="flex items-center gap-2">
            <button
              id="reclassify-button"
              onClick={() => onClassifyMessage(message.id)}
              disabled={isProcessing}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
              Re-Analyze AI
            </button>

            {message.syncedToSheets ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Synced to Sheets
              </span>
            ) : (
              <button
                id="sync-to-sheets-button"
                onClick={handleSyncToSheets}
                disabled={isSyncing || !spreadsheetId}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                )}
                Sync to Google Sheets
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-5 overflow-y-auto space-y-5 flex-1">
        {/* Customer Original Content */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
            Incoming Customer Message
          </h3>
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-800 leading-relaxed whitespace-pre-wrap font-sans">
            {message.content}
          </div>
        </div>

        {/* AI Classification & Intelligence */}
        <div className="border border-stone-200 rounded-xl p-4 bg-stone-50/60">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 text-stone-900 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Classification Insights</span>
            </div>
            {message.category && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-stone-900 text-white">
                {message.category}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block mb-0.5">Sentiment</span>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${getSentimentBadge(message.sentiment)}`}>
                {message.sentiment || 'Analyzing...'}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-stone-200">
              <span className="text-[11px] text-stone-500 block mb-0.5">Priority</span>
              <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${getPriorityBadge(message.priority)}`}>
                {message.priority || 'Analyzing...'}
              </span>
            </div>

            <div className="bg-white p-2.5 rounded-lg border border-stone-200 col-span-2 sm:col-span-1">
              <span className="text-[11px] text-stone-500 block mb-0.5">Recommended Action</span>
              <span className="text-xs font-medium text-stone-800 truncate block">
                {message.suggestedAction || 'Review and respond'}
              </span>
            </div>
          </div>

          {message.summary && (
            <div className="bg-white p-3 rounded-lg border border-stone-200 mb-3 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">Executive Summary:</span>
              <p className="text-stone-600 leading-relaxed">{message.summary}</p>
            </div>
          )}

          {message.keyIssues && message.keyIssues.length > 0 && (
            <div className="bg-white p-3 rounded-lg border border-stone-200 text-xs">
              <span className="font-semibold text-stone-900 block mb-1">Key Issues Identified:</span>
              <div className="flex flex-wrap gap-1.5">
                {message.keyIssues.map((issue, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] border border-stone-200"
                  >
                    • {issue}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Auto-Response Section */}
        <div className="border border-stone-200 rounded-xl p-4 bg-white">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                Automated Customer Response
              </h3>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                message.responseStatus === 'sent'
                  ? 'bg-emerald-100 text-emerald-800'
                  : message.responseStatus === 'approved'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-stone-100 text-stone-700'
              }`}>
                {message.responseStatus || 'draft'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {!isEditingResponse ? (
                <button
                  id="edit-response-button"
                  onClick={handleStartEdit}
                  className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Draft
                </button>
              ) : (
                <button
                  id="save-response-button"
                  onClick={handleSaveEdit}
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 px-2.5 py-1 bg-emerald-50 rounded font-semibold border border-emerald-200"
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Edits
                </button>
              )}
            </div>
          </div>

          {isEditingResponse ? (
            <div className="space-y-2">
              <textarea
                id="response-editor-textarea"
                rows={7}
                value={editedResponse}
                onChange={(e) => setEditedResponse(e.target.value)}
                className="w-full p-3 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 font-sans leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setIsEditingResponse(false)}
                  className="px-3 py-1 text-xs text-stone-500 hover:text-stone-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 bg-stone-900 text-white rounded text-xs font-medium"
                >
                  Save as Approved
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-200 text-xs text-stone-800 whitespace-pre-wrap leading-relaxed">
              {message.autoResponse || 'Generating tailored auto-response with Gemini 3.8 Flash...'}
            </div>
          )}

          {/* Action Row */}
          <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between flex-wrap gap-2 text-xs">
            <span className="text-stone-500">
              {message.responseStatus === 'sent' ? (
                <span className="text-emerald-700 font-medium">✓ Response marked as sent to customer</span>
              ) : (
                'Review the draft or send directly to the customer'
              )}
            </span>

            {message.responseStatus !== 'sent' && (
              <button
                id="send-response-button"
                onClick={handleSendResponse}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
              >
                <Send className="w-3.5 h-3.5 text-amber-300" />
                Approve & Mark Sent
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
