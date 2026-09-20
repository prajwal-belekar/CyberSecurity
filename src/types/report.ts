export type ReportType =
  | 'security_summary'
  | 'incident'
  | 'threat'
  | 'network'
  | 'authentication';

export type ReportStatus = 'ready' | 'generating' | 'queued' | 'failed' | 'draft';

export interface ReportSection {
  heading: string;
  body: string;
  metrics?: { label: string; value: string }[];
}

export interface Report {
  id: string;
  title: string;
  type: ReportType;
  status: ReportStatus;
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  generatedBy: string;
  format: 'PDF' | 'CSV' | 'JSON';
  sizeKb?: number;
  classification: 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  summary: string;
  sections: ReportSection[];
  relatedIncidentIds: string[];
}

export interface ReportGenerationRequest {
  type: ReportType;
  periodStart: string;
  periodEnd: string;
  format: Report['format'];
  classification: Report['classification'];
  includeIncidents?: boolean;
}
