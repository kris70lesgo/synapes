// Database Types

export interface Document {
  id: number;
  source: string;
  content: string;
  created_at?: Date;
}

export interface PlaybookStep {
  step: number;
  action: string;
  description: string;
}

export interface CommonFailure {
  issue: string;
  fix: string;
}

export interface Playbook {
  id: number;
  task_name: string;
  steps: PlaybookStep[];
  common_failures: CommonFailure[];
  embedding?: number[];
  created_at?: Date;
}

export interface Feedback {
  id: number;
  playbook_id: number;
  user_query: string;
  was_helpful: boolean;
  comment?: string;
  created_at?: Date;
}

// API Response Types

export interface ExtractionResponse {
  success: boolean;
  message: string;
  extracted: number;
  failed: number;
  playbooks?: Array<{ id: number; task_name: string }>;
}

export interface PlaybookSearchResponse {
  playbooks: Playbook[];
  total: number;
}

export interface FeedbackResponse {
  success: boolean;
  message: string;
  feedback_id?: number;
}
