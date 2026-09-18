import React, { useState } from 'react';
import { Settings, Sliders, ToggleLeft, ToggleRight, Sparkles, Check, HelpCircle } from 'lucide-react';
import { AgentSettings } from '../types';

interface AgentSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AgentSettings;
  onSaveSettings: (newSettings: AgentSettings) => void;
}

export const AgentSettingsModal: React.FC<AgentSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [form, setForm] = useState<AgentSettings>({ ...settings });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">AI Agent Workflow Rules</h3>
              <p className="text-xs text-stone-500">Configure automated response policies & spreadsheet triggers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Company / Brand Name</label>
            <input
              type="text"
              id="settings-company-name"
              value={form.companyName}
              onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">AI Response Tone</label>
            <select
              id="settings-tone-select"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value as any })}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
            >
              <option value="professional">Professional & Thorough</option>
              <option value="empathetic">Empathetic & Warm</option>
              <option value="concise">Concise & Action-Oriented</option>
              <option value="technical">Technical & Detailed</option>
            </select>
          </div>

          <div className="pt-2 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-stone-800 block">Auto-Sync to Google Sheets</label>
                <span className="text-[11px] text-stone-500">Automatically stream classified records directly to the connected sheet</span>
              </div>
              <input
                type="checkbox"
                id="toggle-auto-sync"
                checked={form.autoSyncSheets}
                onChange={(e) => setForm({ ...form, autoSyncSheets: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-stone-800 block">Human Review for Negative/Critical Sentiment</label>
                <span className="text-[11px] text-stone-500">Hold draft for manual agent approval if customer is angry or critical</span>
              </div>
              <input
                type="checkbox"
                id="toggle-review-negative"
                checked={form.requireApprovalForNegative}
                onChange={(e) => setForm({ ...form, requireApprovalForNegative: e.target.checked })}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>
          </div>

          <div className="pt-2">
            <label className="block text-xs font-semibold text-stone-700 mb-1">Default Email Signature</label>
            <textarea
              id="settings-signature"
              rows={2}
              value={form.supportSignature}
              onChange={(e) => setForm({ ...form, supportSignature: e.target.value })}
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white resize-none"
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-settings-btn"
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
            >
              Save Workflow Rules
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
