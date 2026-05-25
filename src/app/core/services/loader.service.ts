import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private activeRequests = 0;
  private loadingSubject = new BehaviorSubject(false);
  loading$ = this.loadingSubject.asObservable();

  show(): void {
    this.activeRequests++;
    this.loadingSubject.next(true);
  }

  hide(): void {
    this.activeRequests = Math.max(0, this.activeRequests - 1);
    this.loadingSubject.next(this.activeRequests > 0);
  }
}
