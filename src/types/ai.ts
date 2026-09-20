import type { Severity } from './common';

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatCitation {
  id: string;
  label: string;
  type: 'event' | 'incident' | 'indicator' | 'asset' | 'log';
  href?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: string;
  /** Terminal-flavoured output blocks rendered inside the message. */
  blocks?: { kind: 'timeline' | 'table' | 'metrics'; rows: string[][] | Record<string, string> }[];
  citations?: ChatCitation[];
  confidence?: number;
  status?: 'streaming' | 'complete' | 'error';
  error?: string;
}

export interface InvestigationContext {
  incidentId?: string;
  incidentTitle?: string;
  severity?: Severity;
  threatId?: string;
  source?: string;
  target?: string;
  attachedEventIds: string[];
  timeWindow: string;
}

export interface AiSession {
  id: string;
  title: string;
  createdAt: string;
  context: InvestigationContext;
  messages: ChatMessage[];
}

export interface SuggestedPrompt {
  id: string;
  label: string;
  prompt: string;
}
