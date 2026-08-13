import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
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
      <div class="table-container">
        <p-table
          [value]="conversations"
          [paginator]="true"
          [rows]="20"
          [rowsPerPageOptions]="[10, 20, 50]"
          [paginatorDropdownAppendTo]="'body'"
          sortField="last_activity"
          [sortOrder]="-1"
          [scrollable]="true"
          scrollHeight="520px"
          styleClass="p-datatable-sm"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>User</th>
              <th [ngStyle]="{ 'min-width': '150px', 'max-width': '200px' }">Conversation Title</th>
              <th [ngStyle]="{ 'min-width': '150px', 'max-width': '200px' }">Last Question</th>
              <th >Last Answer</th>
              <th
              [ngStyle]="{ 'min-width': '150px', 'max-width': '200px' }"
                pSortableColumn="startdate"
              >
                Start Date <p-sortIcon field="startdate"></p-sortIcon>
              </th>
              <th
                [ngStyle]="{ 'min-width': '150px', 'max-width': '200px' }"
                pSortableColumn="last_activity"
              >
                Last Activity <p-sortIcon field="last_activity"></p-sortIcon>
              </th>
              <th>Operations</th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-row>
            <tr>
              <td>{{ row.user.name || "-" }}</td>
              <td>
                {{
                  row.conversation_title?.length > titleQuestionLimit
                    ? (row.conversation_title | slice: 0 : titleQuestionLimit) +
                      "..."
                    : row.conversation_title
                }}
              </td>
              <td>
                {{
                  row.last_question?.length > titleQuestionLimit
                    ? (row.last_question | slice: 0 : titleQuestionLimit) +
                      "..."
                    : row.last_question
                }}
              </td>
              <td>
                {{
                  row.last_answer?.length > answerLimit
                    ? (row.last_answer | slice: 0 : answerLimit) + "..."
                    : row.last_answer
                }}
              </td>
              <td>{{ row.startdate | istDate }}</td>
              <td>{{ row.last_activity | istDate }}</td>
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
      </div>
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
              <div class="answer-content" [innerHTML]="renderAnswer(message.answer)"></div>
              <h4 class="source-title">Sources</h4>
              <div class="sources" *ngIf="message.sources?.length">
                <button
                  *ngFor="let source of message.sources"
                  pButton
                  type="button"
                  class="p-button-sm p-button-outlined pdf-btn"
                  [label]="source.filename + ' - Page ' + source.page_number"
                  (click)="openPdf(source.filepath, source.page_number)"
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
      .table-container {
        width: 100%;
        overflow-x: auto;
      }
      .table-wrap {
        padding: 14px;
        overflow: hidden;
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
      .answer-content {
        display: grid;
        gap: 8px;
      }
      .answer-paragraph {
        margin: 0;
        white-space: pre-wrap;
      }
      .answer-table-wrap {
        margin-top: 6px;
        overflow-x: auto;
      }
      .answer-table {
        border-collapse: collapse;
        width: 100%;
        font-size: 13px;
        border: 1px solid #b7cce5;
      }
      .answer-table th,
      .answer-table td {
        border: 1px solid #b7cce5;
        padding: 7px 9px;
        text-align: left;
      }
      .answer-table th {
        background: #eef5fc;
        font-weight: 700;
      }
      .answer-table tr:nth-child(even) td {
        background: #fafcff;
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
  titleQuestionLimit = 50;
  answerLimit = 200;
  fromDate?: Date;
  toDate?: Date;
  dialog = false;
  diagramDialog = false;
  selectedDiagramUrl = "";

  constructor(
    private readonly chat: ChatService,
    private readonly cdr: ChangeDetectorRef,
    private readonly sanitizer: DomSanitizer,
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
      this.conversations = rows.map((c) => ({
        ...c,
        last_activity: c.last_activity || c.created_at,
      }));
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

  openPdf(filepath: string, pageNumber: number): void {
    let pdfUrl = `${environment.apiBaseUrl}/${filepath}`;
    if (pageNumber) {
      pdfUrl += `#page=${pageNumber}`;
    }
    window.open(pdfUrl, "_blank");
  }

  viewDiagram(imageUrl: string): void {
    const diagramUrl = `${environment.apiBaseUrl}${imageUrl}`;
    window.open(diagramUrl, "_blank");
  }

  renderAnswer(answer: string): SafeHtml {
    if (!answer) {
      return this.sanitizer.bypassSecurityTrustHtml("");
    }

    const lines = answer.replace(/\r\n/g, "\n").split("\n");
    const chunks: string[] = [];
    let tableLines: string[] = [];
    let inTable = false;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith("|")) {
        inTable = true;
        tableLines.push(trimmed);
        continue;
      }

      if (inTable) {
        if (tableLines.length) {
          chunks.push(this.renderMarkdownTable(tableLines));
        }
        tableLines = [];
        inTable = false;
      }

      chunks.push(this.renderTextLine(line));
    }

    if (tableLines.length) {
      chunks.push(this.renderMarkdownTable(tableLines));
    }

    return this.sanitizer.bypassSecurityTrustHtml(chunks.join(""));
  }

  private renderTextLine(line: string): string {
    const trimmed = line.trim();
    if (!trimmed) {
      return '<p class="answer-paragraph">&nbsp;</p>';
    }

    const escaped = this.escapeHtml(trimmed);
    const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    return `<p class="answer-paragraph">${withBold}</p>`;
  }

  private renderMarkdownTable(lines: string[]): string {
    const rows = lines
      .filter((line) => line.trim())
      .map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim()));

    if (rows.length < 2) {
      return "";
    }

    const header = rows[0];
    const bodyRows = rows.slice(2);

    const headerHtml = `<tr>${header
      .map((cell) => `<th style="border:1px solid #b7cce5;padding:7px 9px;background:#eef5fc;font-weight:700;">${this.escapeHtml(cell)}</th>`)
      .join("")}</tr>`;
    const bodyHtml = bodyRows
      .map((row) => `<tr>${row.map((cell) => `<td style="border:1px solid #b7cce5;padding:7px 9px;">${this.escapeHtml(cell)}</td>`).join("")}</tr>`)
      .join("");

    return `<div style="margin-top:6px;overflow-x:auto;"><table style="border-collapse:collapse;width:100%;font-size:13px;border:1px solid #b7cce5;">${headerHtml}${bodyHtml}</table></div>`;
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }
}
