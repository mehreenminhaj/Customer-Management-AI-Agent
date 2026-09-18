export type MessageCategory = 
  | 'Technical Support'
  | 'Billing & Refunds'
  | 'Feature Request'
  | 'Sales Inquiry'
  | 'Account Access'
  | 'General Feedback';

export type SentimentType = 'Positive' | 'Neutral' | 'Negative' | 'Urgent';

export type MessagePriority = 'High' | 'Medium' | 'Low' | 'Critical';

export type ProcessingStatus = 'pending' | 'analyzing' | 'responded' | 'synced' | 'failed';

export interface CustomerMessage {
  id: string;
  customerName: string;
  customerEmail: string;
  receivedAt: string; // ISO string
  channel: 'Email' | 'Web Chat' | 'Support Portal' | 'Social';
  subject?: string;
  content: string;
  // Analysis results
  category?: MessageCategory;
  sentiment?: SentimentType;
  priority?: MessagePriority;
  summary?: string;
  keyIssues?: string[];
  suggestedAction?: string;
  // Auto-response
  autoResponse?: string;
  responseStatus?: 'draft' | 'approved' | 'sent' | 'skipped';
  // Google Sheets sync
  syncedToSheets?: boolean;
  syncedAt?: string;
  sheetRowIndex?: number;
  status: ProcessingStatus;
}

export interface SpreadsheetConfig {
  id: string;
  title: string;
  url: string;
  sheetName: string;
  headerRow: string[];
}

export interface AgentSettings {
  autoRespond: boolean;
  autoSyncSheets: boolean;
  tone: 'professional' | 'empathetic' | 'concise' | 'technical';
  requireApprovalForNegative: boolean;
  supportSignature: string;
  companyName: string;
}

export interface ClassificationResponse {
  category: MessageCategory;
  sentiment: SentimentType;
  priority: MessagePriority;
  summary: string;
  keyIssues: string[];
  suggestedAction: string;
  autoResponse: string;
}
