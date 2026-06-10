import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";

interface DashboardStats {
  total_registered_users: number;
  total_active_users: number;
  total_knowledge_files: number;
  total_synced_files: number;
  total_conversations: number;
  total_active_conversations_today: number;
}

@Component({
  selector: "app-dashboard",
  template: `
    <app-page-header
      title="Dashboard"
      subtitle="Operational overview for ABS Chat Agent"
    ></app-page-header>
    <section class="stats">
      <p-card *ngFor="let card of cards" styleClass="metric-card">
        <div class="metric-card-content">
          <div class="metric-time">{{ card.value }}</div>

          <div class="metric-title">
            {{ card.label }}
          </div>

          <i [class]="card.icon" class="metric-icon"></i>
        </div>
      </p-card>
    </section>
  `,
  styles: [
    `
      .stats {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(3, minmax(200px, 1fr));
        margin-bottom: 16px;
      }

      :host ::ng-deep .metric-card {
        background: linear-gradient(
          135deg,
          #0b3d91 0%,
          #1565c0 50%,
          #1e88e5 100%
        );
        color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        min-height: 130px;
        border: none;
        box-shadow: 0 4px 12px rgba(11, 61, 145, 0.25);
        transition: all 0.3s ease;
      }

      :host ::ng-deep .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 24px rgba(11, 61, 145, 0.35);
      }

      :host ::ng-deep .metric-card .p-card-body {
        padding: 0;
      }
      .metric-card {
        transition: all 0.3s ease;
      }

      .metric-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 20px rgba(11, 61, 145, 0.3);
      }
      .metric-card-content {
        position: relative;
        height: 120px;
        padding: 16px 16px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
      }

      /* Large number */
      .metric-time {
        font-size: 34px;
        font-weight: 700;
        line-height: 1;
        color: #ffffff;
        margin-bottom: 12px;
      }

      /* Label */
      .metric-title {
        font-size: 15px;
        font-weight: 600;
        text-transform: uppercase;
        line-height: 1.2;
        color: rgba(255, 255, 255, 0.95);
        max-width: 180px;
      }

      /* Icon */
      .metric-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 24px;
        color: rgba(255, 255, 255, 0.18);
      }

      /* Bottom Accent Strip */
      .metric-card-content::after {
        content: "";
        position: absolute;
        left: 0;
        bottom: 0;
        width: 100%;
        height: 8px;
        background: #29b6f6;
      }

      /* Optional top glow */
      .metric-card-content::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 4px;
        background: rgba(255, 255, 255, 0.25);
      }

      @media (max-width: 900px) {
        .stats {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 600px) {
        .stats {
          grid-template-columns: 1fr;
        }

        .metric-time {
          font-size: 42px;
        }

        .metric-title {
          font-size: 16px;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  cards: any[] = [];

  constructor(
    private readonly http: HttpClient,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  private loadStats(): void {
    this.http
      .get<DashboardStats>(`${environment.apiBaseUrl}/dashboardcount`)
      .subscribe({
        next: (stats) => {
          this.cards = [
            {
              label: "Registered Users",
              value: (stats.total_registered_users ?? 0).toLocaleString(),
              icon: "pi pi-user-plus",
            },
            {
              label: "Active Users",
              value: (stats.total_active_users ?? 0).toLocaleString(),
              icon: "pi pi-user",
            },
            {
              label: "Knowledge Files",
              value: (stats.total_knowledge_files ?? 0).toLocaleString(),
              icon: "pi pi-file-pdf",
            },
            {
              label: "Synced Files",
              value: (stats.total_synced_files ?? 0).toLocaleString(),
              icon: "pi pi-database",
            },
            {
              label: "Total Conversations",
              value: (stats.total_conversations ?? 0).toLocaleString(),
              icon: "pi pi-comments",
            },
            {
              label: "Active Today",
              value: (
                stats.total_active_conversations_today ?? 0
              ).toLocaleString(),
              icon: "pi pi-chart-line",
            },
          ];
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error("Failed to load dashboard statistics", err);
        },
      });
  }
}
