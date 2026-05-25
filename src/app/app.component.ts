import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LoaderService } from './core/services/loader.service';

@Component({
  selector: 'app-root',
  template: `
    <p-toast position="top-right"></p-toast>
    <p-confirmDialog></p-confirmDialog>
    <router-outlet></router-outlet>
    <div class="global-loader" *ngIf="loader.loading$ | async">
      <p-progressSpinner strokeWidth="4"></p-progressSpinner>
    </div>
  `,
  styles: [
    `
      .global-loader {
        align-items: center;
        background: rgba(244, 247, 251, 0.58);
        display: flex;
        inset: 0;
        justify-content: center;
        position: fixed;
        z-index: 3000;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  constructor(public loader: LoaderService) {}
}
