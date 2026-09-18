import React, { useState } from 'react';
import { Sparkles, Send, Mail, User, Tag, PlusCircle, RefreshCw } from 'lucide-react';
import { CustomerMessage } from '../types';

interface NewMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMessage: (msg: Partial<CustomerMessage>, runClassificationImmediately: boolean) => Promise<void>;
}

export const NewMessageModal: React.FC<NewMessageModalProps> = ({
  isOpen,
  onClose,
  onSubmitMessage,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [channel, setChannel] = useState<'Email' | 'Web Chat' | 'Support Portal' | 'Social'>('Email');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmitMessage(
        {
          id: `MSG-${Math.floor(1000 + Math.random() * 9000)}`,
          customerName: customerName.trim() || 'Anonymous Customer',
          customerEmail: customerEmail.trim() || 'customer@example.com',
          channel,
          subject: subject.trim() || 'Customer Inquiry',
          content: content.trim(),
          receivedAt: new Date().toISOString(),
          status: 'pending',
          syncedToSheets: false,
        },
        true // Process AI classification and auto-response immediately
      );
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setSubject('');
      setContent('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadPreset = (type: 'billing' | 'tech' | 'feature' | 'praise') => {
    if (type === 'billing') {
      setCustomerName('Jordan Taylor');
      setCustomerEmail('j.taylor@northwind.io');
      setChannel('Email');
      setSubject('Unexpected subscription charge after trial ended');
      setContent('Hello, I was under the impression our trial automatically canceled if not upgraded. My card was charged $89 yesterday. We do not intend to use the service at this time. Could you please cancel our workspace and issue a full refund to my card?');
    } else if (type === 'tech') {
      setCustomerName('Claire Zhang');
      setCustomerEmail('claire@fintechsys.com');
      setChannel('Support Portal');
      setSubject('Crash on large CSV export with 50,000+ records');
      setContent('We are running an audit and need to export last quarter transaction logs. Whenever we select "All Fields" and click Export CSV, the page freezes and returns a 504 Gateway Timeout error. Is there an asynchronous export link or batch endpoint we can use?');
    } else if (type === 'feature') {
      setCustomerName('Liam O\'Connor');
      setCustomerEmail('liam@acmecreative.org');
      setChannel('Web Chat');
      setSubject('Dark mode support and custom brand color palette');
      setContent('Hi! Our design team works late nights and the bright white interface is straining our eyes. Are you planning dark mode? Also, being able to upload our company hex color palette for custom client dashboards would be amazing.');
    } else {
      setCustomerName('Priya Patel');
      setCustomerEmail('priya@biotech-global.com');
      setChannel('Email');
      setSubject('Kudos to your customer engineering team');
      setContent('Just wanted to drop a quick note to say the automated sync workflow has saved our team 12 hours every week. Your recent update to the reporting tables is fantastic. Keep up the great work!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-stone-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 flex items-center justify-center">
              <PlusCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">Simulate Incoming Customer Message</h3>
              <p className="text-xs text-stone-500">The AI Agent will classify, generate an auto-response, and sync to Sheets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        {/* Quick presets */}
        <div className="px-6 py-2.5 bg-stone-100/60 border-b border-stone-200/60 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-stone-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => loadPreset('tech')}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-700 text-[11px]"
          >
            Critical 504 Bug
          </button>
          <button
            type="button"
            onClick={() => loadPreset('billing')}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-700 text-[11px]"
          >
            Refund Request
          </button>
          <button
            type="button"
            onClick={() => loadPreset('feature')}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-700 text-[11px]"
          >
            Feature Request
          </button>
          <button
            type="button"
            onClick={() => loadPreset('praise')}
            className="px-2 py-0.5 bg-white hover:bg-stone-50 border border-stone-300 rounded text-stone-700 text-[11px]"
          >
            User Feedback
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Name</label>
              <input
                type="text"
                id="modal-customer-name"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Customer Email</label>
              <input
                type="email"
                id="modal-customer-email"
                required
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="e.g. rachel@domain.com"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Channel</label>
              <select
                id="modal-channel-select"
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
              >
                <option value="Email">Email</option>
                <option value="Web Chat">Web Chat</option>
                <option value="Support Portal">Support Portal</option>
                <option value="Social">Social</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1">Subject / Summary</label>
              <input
                type="text"
                id="modal-subject-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Problem with recent invoice"
                className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Message Content</label>
            <textarea
              id="modal-content-textarea"
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste raw customer message text here..."
              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:ring-1 focus:ring-stone-900 bg-white resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-new-message-btn"
              disabled={isSubmitting || !content.trim()}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-2xs inline-flex items-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              {isSubmitting ? 'Processing with AI...' : 'Receive & Auto-Process Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
