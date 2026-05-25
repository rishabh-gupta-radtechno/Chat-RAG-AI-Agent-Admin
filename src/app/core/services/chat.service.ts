import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChatConversation, ChatMessage } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private api: ApiService) {}

  conversations(query: Record<string, string | number>): Observable<ChatConversation[]> {
    return this.api.get<ChatConversation[]>('/chat/conversations', query);
  }

  details(conversationId: string, limit = 100): Observable<ChatMessage[]> {
    return this.api.get<ChatMessage[]>(`/chat/conversations/${conversationId}`, { limit });
  }
}
