export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  name: string;
  email: string;
}

export interface AdminUser {
  name: string;
  email: string;
}

export interface AppUser {
  id: string;
  name?: string;
  email: string;
  is_active: boolean;
  created_at: string;
}

export interface ManagedFile {
  id: string;
  filename: string;
  file_size: number;
  file_type: string;
  is_embedded: boolean;
  created_at: string;
}

export interface ChatConversation {
  conversation_id: string;
  user?: string;
  last_question: string;
  last_answer: string;
  model: string;
  created_at: string;
  last_activity?: string;
}

export interface ChatSource {
  filename: string;
  file_id: string;
  chunk_index: number;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  question: string;
  answer: string;
  sources: ChatSource[];
  model: string;
  created_at: string;
}
