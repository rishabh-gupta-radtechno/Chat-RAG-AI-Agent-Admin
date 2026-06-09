import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  template: `
    <app-page-header title="Dashboard" subtitle="Operational overview for ABS Chat Agent"></app-page-header>
    <section class="stats">
      <p-card *ngFor="let card of cards" styleClass="metric-card">
        <div class="metric">
          <i [class]="card.icon"></i>
          <div>
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </div>
        </div>
      </p-card>
    </section>
  `,
  styles: [
    `
      .stats {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(4, minmax(170px, 1fr));
        margin-bottom: 14px;
      }
      .metric {
        align-items: center;
        display: flex;
        gap: 12px;
      }
      .metric i {
        color: #0b3d91;
        font-size: 26px;
      }
      .metric span,
      .metric strong {
        display: block;
      }
      .metric strong {
        color: #062b63;
        font-size: 24px;
      }
      .readiness {
        display: grid;
        gap: 12px;
        grid-template-columns: repeat(3, minmax(180px, 1fr));
      }
      .readiness span {
        display: block;
        margin-top: 4px;
      }
      @media (max-width: 900px) {
        .stats,
        .readiness {
          grid-template-columns: 1fr 1fr;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  cards = [
    { label: 'Registered Users', value: '128', icon: 'pi pi-users' },
    { label: 'Knowledge Files', value: '342', icon: 'pi pi-file-pdf' },
    { label: 'Embedded Files', value: '319', icon: 'pi pi-database' },
    { label: 'Conversations', value: '4,812', icon: 'pi pi-comments' }
  ];
}
