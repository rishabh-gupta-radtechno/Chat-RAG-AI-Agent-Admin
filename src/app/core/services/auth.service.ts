import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AdminUser, LoginRequest, LoginResponse } from '../models/api.models';
import { ApiService } from './api.service';

const TOKEN_KEY = 'rag_admin_token';
const USER_KEY = 'rag_admin_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private currentUserSubject = new BehaviorSubject<AdminUser | null>(this.getStoredUser());
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private api: ApiService, private router: Router) {}

  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.api.post<LoginResponse>('/admin/login', payload).pipe(
      tap((response) => {
        sessionStorage.setItem(TOKEN_KEY, response.token);
        const user = { name: response.name, email: response.email };
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string): Observable<unknown> {
    return this.api.post('/admin/change-password', { oldPassword, newPassword });
  }

  getToken(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  get currentUser(): AdminUser | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigateByUrl('/login');
  }

  private getStoredUser(): AdminUser | null {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  }
}
