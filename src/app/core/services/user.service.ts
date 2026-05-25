import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppUser } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private api: ApiService) {}

  list(query: Record<string, string | number>): Observable<AppUser[]> {
    return this.api.get<AppUser[]>('/auth/getalluser', query);
  }

  register(email: string, password: string): Observable<AppUser> {
    return this.api.post<AppUser>('/auth/register', { email, password });
  }

  changePassword(userId: string, password: string): Observable<unknown> {
    return this.api.post('/users/change-password', { userId, password });
  }

  setStatus(userId: string, isActive: boolean): Observable<unknown> {
    return this.api.patch('/users/status', { userId, is_active: isActive });
  }
}
