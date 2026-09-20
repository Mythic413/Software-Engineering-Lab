
export enum DocCategory {
  ADVERTISEMENT = 'advertisement',
  CORRESPONDENCE = 'correspondence',
  EMAIL = 'email',
  FILE_FOLDER = 'file_folder',
  FINANCIAL = 'financial',
  FORM = 'form',
  HANDWRITTEN = 'handwritten',
  NEWS_ARTICLE = 'news_article',
  PRESENTATION = 'presentation',
  QUESTIONNAIRE = 'questionnaire',
  RESUME = 'resume',
  SCIENTIFIC = 'scientific',
  SPECIFICATION = 'specification',
  // Legacy UI values retained for existing history/demo records.
  INVOICE = 'Invoice',
  LEGAL = 'Legal Contract',
  IDENTIFICATION = 'ID/Passport',
  RECEIPT = 'Receipt',
  TECHNICAL = 'Technical Doc',
  SUPPORT = 'Customer Support',
  OPERATIONS = 'Operations Order',
  GENERAL = 'General',
  OTHER = 'Other'
}

export type DepartmentType = 'Finance' | 'HR' | 'Legal' | 'Support' | 'Operations' | 'General';

export enum RoutingStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  QUARANTINED = 'Quarantined',
  ROUTED = 'Routed',
  FAILED = 'Failed'
}

export interface ExtractedField {
  key: string;
  value: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: 'Administrator' | 'Operator' | 'Auditor';
  lastLogin: number;
  token?: string;
}

export interface DocumentRecord {
  id: string;
  name: string;
  timestamp: number;
  category: DocCategory;
  department?: DepartmentType;
  confidence: number;
  status: RoutingStatus;
  extractedFields?: ExtractedField[];
  destination: string;
  summary: string;
  fileSize?: string;
  ocrText?: string;
  engineStatus?: string;
  classifierAction?: string;
  thumbnail?: string;
  user_id?: string;
  flaggedForRetraining?: boolean;
  origin: 'Upload' | 'Email';
}

export interface ClassificationResult {
  category: DocCategory;
  department?: DepartmentType;
  confidence: number;
  extractedFields: ExtractedField[];
  summary: string;
  routingDestination: string;
  engineStatus: string;
  classifierAction: string;
  ocrText?: string;
}

export interface SystemSettings {
  confidenceThreshold: number;
  autoRoutingEnabled: boolean;
  defaultDestination: string;
  modelName: string;
  modelSource: 'gemini' | 'custom';
}

export interface EmailMessage {
  id: string;
  from: string;
  subject: string;
  body: string;
  receivedAt: string;
  attachmentName: string | null;
  attachmentId?: string | null;
  isProcessed: boolean;
}

export interface OutboundEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface MySQL_LogRecord {
  log_id: string;
  user_id: string;
  timestamp: string;
  event_name: string;
  log_level: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  payload_json: string;
}
