import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private messages: MessageService, private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        const isLoginRequest = req.url.includes('/admin/login') || req.url.includes('/login');

        if (error.status === 401 && !isLoginRequest) {
          this.auth.logout();
          this.messages.add({ severity: 'warn', summary: 'Session expired', detail: 'Please login again.' });
        } else if (error.status === 401) {
          const detail = error.error?.detail || error.error?.message || 'Invalid email or password.';
          this.messages.add({ severity: 'error', summary: 'Login failed', detail });
        } else {
          const detail = error.error?.detail || error.error?.message || 'Request could not be completed.';
          this.messages.add({ severity: 'error', summary: 'API Error', detail });
        }

        return throwError(() => error);
      })
    );
  }
}
