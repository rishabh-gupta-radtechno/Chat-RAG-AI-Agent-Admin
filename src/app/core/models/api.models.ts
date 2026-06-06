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
  mobile?: number;
  department?: string;
  designation?: string;
}

export interface ManagedFile {
  id: string;
  filename: string;
  filepath: string;
  file_size: number;
  file_type: string;
  is_active: boolean;
  is_embedded: boolean;
  created_at: string;
}

export interface ChatConversation {
  conversation_id: string;
  user: {
    id: string;
    email: string;
  };
  conversation_title?: string;
  last_question: string;
  last_answer: string;
  model: string;
  startdate: string;
  created_at: string;
  last_activity?: string;
}

export interface ChatSource {
  filename: string;
  filepath: string;
  file_id: string;
  chunk_index: number;
  page_number: number;
  relevance_score: number;
}

export interface ChatDiagram {
  filename: string;
  file_id: string;
  page_number: number;
  image_index: number;
  description: string;
  image_url: string;
  relevance_score: number;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  question: string;
  answer: string;
  sources: ChatSource[];
  diagrams?: ChatDiagram[];
  model: string;
  created_at: string;
}
