import React, { useState } from 'react';
import { FileSpreadsheet, Plus, Link2, Check, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { createCustomerSupportSpreadsheet, verifySpreadsheetAccess } from '../lib/sheets';

interface SheetsSyncCardProps {
  accessToken: string | null;
  currentSpreadsheetId: string;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  onSpreadsheetConfigured: (id: string, title: string, url: string) => void;
  onSignInRequired: () => void;
}

export const SheetsSyncCard: React.FC<SheetsSyncCardProps> = ({
  accessToken,
  currentSpreadsheetId,
  spreadsheetTitle,
  spreadsheetUrl,
  onSpreadsheetConfigured,
  onSignInRequired,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [existingIdInput, setExistingIdInput] = useState('');
  const [isConnectingExisting, setIsConnectingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConnectExisting, setShowConnectExisting] = useState(false);

  const handleCreateNewSheet = async () => {
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    setError(null);
    setIsCreating(true);
    try {
      const sheetName = `Customer Messages AI Log (${new Date().toLocaleDateString()})`;
      const result = await createCustomerSupportSpreadsheet(accessToken, sheetName);
      onSpreadsheetConfigured(result.id, sheetName, result.url);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create Google Sheet. Please re-authenticate.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectExisting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessToken) {
      onSignInRequired();
      return;
    }
    if (!existingIdInput.trim()) return;

    // Extract sheet ID if full URL pasted
    let cleanId = existingIdInput.trim();
    const match = cleanId.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      cleanId = match[1];
    }

    setError(null);
    setIsConnectingExisting(true);
    try {
      const verified = await verifySpreadsheetAccess(accessToken, cleanId);
      const url = `https://docs.google.com/spreadsheets/d/${cleanId}/edit`;
      onSpreadsheetConfigured(cleanId, verified.title, url);
      setShowConnectExisting(false);
      setExistingIdInput('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not access spreadsheet. Ensure you have edit access.');
    } finally {
      setIsConnectingExisting(false);
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Google Sheets Sync Target</h2>
            <p className="text-xs text-stone-500">
              Categorized incoming tickets, AI sentiment, and responses stream directly into this spreadsheet.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!currentSpreadsheetId ? (
            <button
              id="create-sheet-button"
              onClick={handleCreateNewSheet}
              disabled={isCreating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors disabled:opacity-60"
            >
              {isCreating ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              {isCreating ? 'Creating Sheet...' : 'Create New Spreadsheet'}
            </button>
          ) : (
            <a
              id="open-sheet-button"
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-medium shadow-2xs transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Sheets
            </a>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Connected State Info */}
      {currentSpreadsheetId ? (
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 text-xs bg-stone-50 p-3 rounded-lg border border-stone-200">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-stone-600">Active Document:</span>
            <span className="font-semibold text-stone-900 truncate max-w-[280px]">
              {spreadsheetTitle || 'Customer Messages AI Log'}
            </span>
            <span className="text-stone-400 font-mono text-[11px] truncate max-w-[140px]">
              ({currentSpreadsheetId})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="change-sheet-button"
              onClick={() => setShowConnectExisting(!showConnectExisting)}
              className="text-stone-600 hover:text-stone-900 underline text-xs"
            >
              {showConnectExisting ? 'Cancel' : 'Change spreadsheet'}
            </button>
            <span className="text-stone-300">•</span>
            <button
              id="create-another-sheet-button"
              onClick={handleCreateNewSheet}
              disabled={isCreating}
              className="text-emerald-700 hover:text-emerald-800 font-medium"
            >
              + New Sheet
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 text-xs text-stone-600 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-stone-400">Status:</span>
            <span className="font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              No spreadsheet linked yet
            </span>
          </div>
          <button
            id="toggle-connect-existing"
            onClick={() => setShowConnectExisting(!showConnectExisting)}
            className="text-stone-600 hover:text-stone-900 underline text-xs"
          >
            {showConnectExisting ? 'Hide connect form' : 'Or connect an existing Google Sheet ID'}
          </button>
        </div>
      )}

      {/* Connect Existing Form */}
      {showConnectExisting && (
        <form onSubmit={handleConnectExisting} className="mt-3 pt-3 border-t border-stone-100 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            id="existing-sheet-id-input"
            value={existingIdInput}
            onChange={(e) => setExistingIdInput(e.target.value)}
            placeholder="Paste Google Sheet URL or ID (e.g., 1BxiMVs0XR...)"
            className="flex-1 px-3 py-1.5 text-xs border border-stone-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 bg-white"
          />
          <button
            type="submit"
            id="submit-connect-existing"
            disabled={isConnectingExisting || !existingIdInput.trim()}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1 shrink-0"
          >
            {isConnectingExisting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Link2 className="w-3 h-3" />}
            Connect Sheet
          </button>
        </form>
      )}
    </div>
  );
};
