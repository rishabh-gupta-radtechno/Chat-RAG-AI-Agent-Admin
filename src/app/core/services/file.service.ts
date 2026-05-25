import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ManagedFile } from '../models/api.models';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class FileService {
  constructor(private api: ApiService) {}

  list(query: Record<string, string | number>): Observable<ManagedFile[]> {
    return this.api.get<ManagedFile[]>('/files/list', query);
  }

  upload(file: File): Observable<unknown> {
    const data = new FormData();
    data.append('file', file);
    return this.api.post('/files/upload', data);
  }

  generateEmbedding(fileId: string): Observable<unknown> {
    return this.api.post(`/files/generate-embedding/${fileId}`, {});
  }

  delete(fileId: string): Observable<unknown> {
    return this.api.delete(`/files/${fileId}`);
  }
}
