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

  register(name: string, email: string, password: string, enabled: boolean, department?: string, mobile?: number): Observable<AppUser> {
    return this.api.post<AppUser>('/auth/register', { name, email, password, is_enabled: enabled, department, mobile });
  }

  changePassword(userId: string, password: string): Observable<unknown> {
    return this.api.post('/users/change-password', { userId, password });
  }

  setStatus(userId: string, isActive: boolean): Observable<AppUser> {
    return this.api.put<AppUser>(`/auth/updateUser/${userId}`, { is_active: isActive });
  }

  updateUser(userId: string, data: Partial<AppUser>): Observable<AppUser> {
    return this.api.put<AppUser>(`/auth/updateUser/${userId}`, data);
  }

  deleteUser(userId: string): Observable<{ message: string; id: string }> {
    return this.api.delete<{ message: string; id: string }>(`/auth/deleteUser/${userId}`);
  }
}
