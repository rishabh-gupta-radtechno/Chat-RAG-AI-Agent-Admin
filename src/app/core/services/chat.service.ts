import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatConversation, ChatMessage } from '../models/api.models';
import { ApiService } from './api.service';
 
@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private readonly api: ApiService) { }
 
  conversations(query: Record<string, string | number>): Observable<ChatConversation[]> {
    return this.api.get<ChatConversation[]>('/chat/conversations', query);
  }
 
  getChatHistory(query: Record<string, string | number>): Observable<ChatConversation[]> {
    return this.api.get<ChatConversation[]>('/chat/chatall', query);
  }
 
  details(conversationId: string): Observable<ChatMessage[]> {
    return this.api.get<ChatMessage[]>(`/chat/conversations_history/${conversationId}`);
  }
}