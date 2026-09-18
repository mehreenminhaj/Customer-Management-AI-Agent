import React, { useState } from 'react';
import { FileSpreadsheet, ExternalLink, RefreshCw, CheckCircle2 } from 'lucide-react';
import { CustomerMessage } from '../types';

interface SheetsSyncLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  spreadsheetTitle: string;
  spreadsheetUrl: string;
  spreadsheetId: string;
  messages: CustomerMessage[];
  onManualSyncRow: (msgId: string) => Promise<void>;
}

export const SheetsSyncLogModal: React.FC<SheetsSyncLogModalProps> = ({
  isOpen,
  onClose,
  spreadsheetTitle,
  spreadsheetUrl,
  spreadsheetId,
  messages,
  onManualSyncRow,
}) => {
  const [syncingId, setSyncingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await onManualSyncRow(id);
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Spreadsheet Row Synchronization Status</h3>
              <p className="text-xs text-stone-500">Live inspection of records mapped to Google Sheets</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {spreadsheetUrl && (
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs inline-flex items-center gap-1 font-medium text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Live Sheet
              </a>
            )}
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-700 text-sm font-semibold p-1"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-semibold bg-stone-50/70">
                <th className="py-2 px-3">Message ID</th>
                <th className="py-2 px-3">Customer</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Priority</th>
                <th className="py-2 px-3">Response Status</th>
                <th className="py-2 px-3">Sheets Sync</th>
                <th className="py-2 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {messages.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50">
                  <td className="py-2.5 px-3 font-mono font-medium text-stone-800">{m.id}</td>
                  <td className="py-2.5 px-3">
                    <div className="font-medium text-stone-900">{m.customerName}</div>
                    <div className="text-[11px] text-stone-400">{m.customerEmail}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[11px]">
                      {m.category || 'Pending'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-medium text-stone-700 text-[11px]">{m.priority || 'Normal'}</span>
                  </td>
                  <td className="py-2.5 px-3 capitalize text-stone-600">{m.responseStatus || 'draft'}</td>
                  <td className="py-2.5 px-3">
                    {m.syncedToSheets ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Synced
                      </span>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Unsynced</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {!m.syncedToSheets && (
                      <button
                        onClick={() => handleSync(m.id)}
                        disabled={syncingId === m.id || !spreadsheetId}
                        className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-white rounded text-[11px] font-medium disabled:opacity-50"
                      >
                        {syncingId === m.id ? 'Syncing...' : 'Sync Now'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 bg-stone-50 border-t border-stone-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
