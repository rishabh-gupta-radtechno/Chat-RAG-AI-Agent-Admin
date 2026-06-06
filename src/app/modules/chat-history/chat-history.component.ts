import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ChatConversation, ChatMessage } from "../../core/models/api.models";
import { ChatService } from "../../core/services/chat.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-chat-history",
  template: `
    <app-page-header
      title="Chat History"
      subtitle="Review AI answers, sources, models, and relevance"
    ></app-page-header>

    <section class="enterprise-card table-wrap">
      <div class="toolbar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            placeholder="Search by user"
            [(ngModel)]="search"
            (keyup.enter)="load()"
          />
        </span>
        <p-calendar
          [(ngModel)]="fromDate"
          dateFormat="dd-M-yy"
          placeholder="From date"
        ></p-calendar>
        <p-calendar
          [(ngModel)]="toDate"
          dateFormat="dd-M-yy"
          placeholder="To date"
        ></p-calendar>
        <button
          pButton
          icon="pi pi-filter"
          label="Apply"
          (click)="load()"
        ></button>
      </div>

      <p-table
        [value]="conversations"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[10, 20, 50]"
        [scrollable]="true"
        scrollHeight="430px"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th>User</th>
            <th>Conversation Title</th>
            <th>Last Question</th>
            <th>Last Answer</th>
            <th>Model</th>
            <th pSortableColumn="created_at">
              Start Date <p-sortIcon field="created_at"></p-sortIcon>
            </th>
            <th>Last Activity</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.user.name || "-" }}</td>
            <td>{{ row.conversation_title }}</td>
            <td>{{ row.last_question }}</td>
            <td>{{ row.last_answer }}</td>
            <td><p-tag severity="info" [value]="row.model"></p-tag></td>
            <td>{{ row.startdate | istDate }}</td>
            <td>{{ row.last_activity || row.created_at | istDate }}</td>
            <td>
              <button
                pButton
                icon="pi pi-eye"
                class="p-button-sm"
                label="View"
                (click)="open(row)"
              ></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog
      [(visible)]="dialog"
      [modal]="true"
      [style]="{ width: '78vw' }"
      [breakpoints]="{ '900px': '95vw' }"
      header="Conversation Detail"
    >
      <div class="chat-window" *ngIf="messages.length; else empty">
        <ng-container *ngFor="let message of messages">
          <div class="bubble-row user">
            <div class="bubble">
              <p>{{ message.question }}</p>
              <small>{{ message.created_at | istDate }}</small>
            </div>
          </div>
          <div class="bubble-row ai">
            <div class="bubble">
              <b>AI/System · {{ message.model }}</b>
              <p>{{ message.answer }}</p>
              <h4 class="source-title">Sources</h4>
              <div class="sources" *ngIf="message.sources?.length">
                <button
                  *ngFor="let source of message.sources"
                  pButton
                  type="button"
                  class="p-button-sm p-button-outlined pdf-btn"
                  [label]="source.filename + ' - Page ' + source.page_number"
                  (click)="openPdf(source.filepath , source.page_number)"
                  pTooltip="Click to open PDF"
                ></button>
              </div>
              <div class="diagrams-section" *ngIf="message.diagrams?.length">
                <h4>Diagrams</h4>
                <div class="diagrams">
                  <button
                    *ngFor="let diagram of message.diagrams"
                    pButton
                    type="button"
                    class="p-button-sm p-button-outlined diagram-btn"
                    [label]="
                      diagram.filename + ' - Page ' + diagram.page_number
                    "
                    (click)="viewDiagram(diagram.image_url)"
                    pTooltip="Click to view diagram"
                  ></button>
                </div>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
      <ng-template #empty>No messages found.</ng-template>
    </p-dialog>

    <p-dialog
      [(visible)]="diagramDialog"
      [modal]="true"
      [style]="{ width: '85vw', height: '85vh' }"
      [breakpoints]="{ '900px': '95vw' }"
      header="Diagram Viewer"
      [closable]="true"
    >
      <img
        [src]="selectedDiagramUrl"
        alt="Diagram"
        style="width: 100%; height: 100%; object-fit: contain;"
      />
    </p-dialog>
  `,
  styles: [
    `
      .table-wrap {
        padding: 14px;
      }
      .toolbar {
        display: grid;
        gap: 10px;
        grid-template-columns: 1fr 160px 160px auto;
        margin-bottom: 10px;
      }
      .chat-window {
        background: #edf5fd;
        border: 1px solid #b7cce5;
        display: grid;
        gap: 12px;
        max-height: 65vh;
        overflow-y: auto;
        padding: 14px;
      }
      .bubble-row {
        display: flex;
      }
      .bubble-row.user {
        justify-content: flex-end;
      }
      .bubble {
        border: 1px solid #b7cce5;
        max-width: 74%;
        padding: 10px 12px;
      }
      .user .bubble {
        background: #0b3d91;
        color: #fff;
      }
      .ai .bubble {
        background: #fff;
      }
      .bubble p {
        margin: 7px 0;
        white-space: pre-wrap;
      }
      .sources {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-top: 10px;
      }
      .sources :deep(.p-button) {
        padding: 6px 12px !important;
        font-size: 12px !important;
        border: 2px solid #0b3d91 !important;
        color: #0b3d91 !important;
        background: #e7f1f9 !important;
        border-radius: 4px !important;
      }
      .sources :deep(.p-button:hover) {
        background: #cfe4f1 !important;
        border-color: #062b63 !important;
      }
      .pdf-btn {
        border-radius: 20px !important;
      }
      .diagrams-section {
        margin-top: 15px;
        padding-top: 10px;
        border-top: 1px solid #e0e0e0;
      }
      .diagrams-section h4 {
        margin: 0 0 10px 0;
        font-size: 13px;
        color: #333;
        font-weight: 600;
      }
      .source-title {
        margin: 0 0 10px 0;
        font-size: 13px;
        color: #333;
        font-weight: 600;
      }
      .diagrams {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .diagram-btn {
        background: #f0f7ff !important;
        border: 2px solid #4a90e2 !important;
        color: #4a90e2 !important;
        border-radius: 20px !important;
      }
      .diagram-btn:hover {
        background: #e6f0ff !important;
        border-color: #2563eb !important;
      }
      @media (max-width: 900px) {
        .toolbar {
          grid-template-columns: 1fr;
        }
        .bubble {
          max-width: 92%;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHistoryComponent implements OnInit {
  conversations: ChatConversation[] = [];
  messages: ChatMessage[] = [];
  search = "";
  fromDate?: Date;
  toDate?: Date;
  dialog = false;
  diagramDialog = false;
  selectedDiagramUrl = "";

  constructor(
    private readonly chat: ChatService,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const params: any = {
      limit: 100,
    };

    if (this.search) {
      params.user_name = this.search;
    }

    if (this.fromDate) {
      params.start_date = this.formatDate(this.fromDate);
    }

    if (this.toDate) {
      params.end_date = this.formatDate(this.toDate);
    }

    this.chat.getChatHistory(params).subscribe((rows) => {
      this.conversations = rows;
      this.cdr.markForCheck();
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  open(row: ChatConversation): void {
    this.dialog = true;
    this.chat.details(row.conversation_id).subscribe((messages) => {
      this.messages = messages;
      this.cdr.markForCheck();
    });
  }

  openPdf(filepath: string , pageNumber: number): void {
    let  pdfUrl = `${environment.apiBaseUrl}/${filepath}`;
    if (pageNumber) {
      pdfUrl += `#page=${pageNumber}`;
    }
    window.open(pdfUrl, "_blank");
  }

  viewDiagram(imageUrl: string): void {
    const diagramUrl = `${environment.apiBaseUrl}${imageUrl}`;
    window.open(diagramUrl, "_blank");
  }
}
