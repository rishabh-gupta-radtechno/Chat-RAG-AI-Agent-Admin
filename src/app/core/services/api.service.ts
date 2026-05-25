import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, retry } from 'rxjs';
import { environment } from '../../../environments/environment';

type QueryValue = string | number | boolean | undefined | null;

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string, query?: Record<string, QueryValue>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${url}`, { params: this.toParams(query) }).pipe(retry(1));
  }

  post<T>(url: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${url}`, body).pipe(retry(1));
  }

  patch<T>(url: string, body: unknown): Observable<T> {
    return this.http.patch<T>(`${this.baseUrl}${url}`, body).pipe(retry(1));
  }

  delete<T>(url: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${url}`).pipe(retry(1));
  }

  private toParams(query?: Record<string, QueryValue>): HttpParams {
    let params = new HttpParams();
    Object.entries(query ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }
}
