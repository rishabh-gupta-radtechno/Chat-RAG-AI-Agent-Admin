import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <div class="page-header">
      <div>
        <h1>{{ title }}</h1>
        <p *ngIf="subtitle">{{ subtitle }}</p>
      </div>
      <ng-content></ng-content>
    </div>
  `,
  styles: [
    `
      .page-header {
        align-items: center;
        background: linear-gradient(180deg, #68a4d4, #2c6fb7);
        border: 1px solid #2a6fae;
        color: white;
        display: flex;
        justify-content: space-between;
        margin-bottom: 12px;
        min-height: 47px;
        padding: 8px 12px;
      }
      h1 {
        font-size: 21px;
        line-height: 1.1;
        margin: 0;
      }
      p {
        margin: 3px 0 0;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent {
  @Input({ required: true }) title = '';
  @Input() subtitle = '';
}
