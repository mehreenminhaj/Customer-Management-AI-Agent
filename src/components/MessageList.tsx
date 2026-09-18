import React from 'react';
import { CustomerMessage, MessageCategory, MessagePriority } from '../types';
import { Clock, CheckCircle2, AlertCircle, Sparkles, MessageSquare, ChevronRight } from 'lucide-react';

interface MessageListProps {
  messages: CustomerMessage[];
  selectedId: string | null;
  onSelectMessage: (id: string) => void;
  selectedCategory: string;
  onCategoryChange: (cat: string) => void;
  onOpenNewModal: () => void;
}

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedId,
  onSelectMessage,
  selectedCategory,
  onCategoryChange,
  onOpenNewModal,
}) => {
  const categories: string[] = [
    'All',
    'Technical Support',
    'Billing & Refunds',
    'Feature Request',
    'Sales Inquiry',
  ];

  const filteredMessages = selectedCategory === 'All'
    ? messages
    : messages.filter((m) => m.category === selectedCategory);

  const getPriorityBadge = (priority?: MessagePriority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'High':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Medium':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-stone-50 text-stone-600 border-stone-200';
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs flex flex-col h-full">
      {/* Top action & Filters */}
      <div className="p-3.5 border-b border-stone-100 bg-stone-50/50 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-stone-700" />
            <h2 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              Customer Inbox ({messages.length})
            </h2>
          </div>
          <button
            id="receive-new-msg-btn"
            onClick={onOpenNewModal}
            className="text-xs font-semibold px-2.5 py-1 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors inline-flex items-center gap-1 shadow-2xs"
          >
            + New Message
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Message List Items */}
      <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-400">
            No messages found in category "{selectedCategory}".
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isSelected = msg.id === selectedId;
            return (
              <div
                key={msg.id}
                id={`message-row-${msg.id}`}
                onClick={() => onSelectMessage(msg.id)}
                className={`p-3 sm:p-3.5 cursor-pointer transition-colors text-left flex items-start justify-between gap-2.5 ${
                  isSelected ? 'bg-amber-50/60 border-l-4 border-l-amber-500' : 'hover:bg-stone-50'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-xs text-stone-900 truncate">
                      {msg.customerName}
                    </span>
                    <span className="text-[10px] text-stone-400 font-mono">
                      {msg.id}
                    </span>
                    {msg.priority && (
                      <span className={`text-[10px] font-medium px-1.5 py-0.2 rounded border ${getPriorityBadge(msg.priority)}`}>
                        {msg.priority}
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-medium text-stone-800 truncate mb-1">
                    {msg.subject || '(No subject)'}
                  </p>

                  <p className="text-[11px] text-stone-500 line-clamp-2 leading-relaxed">
                    {msg.content}
                  </p>

                  <div className="flex items-center gap-2 mt-2 text-[11px] flex-wrap">
                    {msg.category && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {msg.category}
                      </span>
                    )}

                    {msg.syncedToSheets ? (
                      <span className="text-[10px] font-medium text-emerald-700 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Synced
                      </span>
                    ) : (
                      <span className="text-[10px] text-stone-400">
                        Pending sync
                      </span>
                    )}

                    <span className="text-stone-300 ml-auto">•</span>
                    <span className="text-[10px] text-stone-400">
                      {new Date(msg.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                <ChevronRight className={`w-4 h-4 text-stone-300 shrink-0 mt-2 ${isSelected ? 'text-amber-600' : ''}`} />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
