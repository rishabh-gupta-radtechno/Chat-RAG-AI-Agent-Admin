import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChatConversation, ChatMessage } from '../../core/models/api.models';
import { ChatService } from '../../core/services/chat.service';

@Component({
  selector: 'app-chat-history',
  template: `
    <app-page-header title="Chat History" subtitle="Review AI answers, sources, models, and relevance"></app-page-header>

    <section class="enterprise-card table-wrap">
      <!-- <div class="toolbar">
        <input pInputText placeholder="Keyword search" [(ngModel)]="keyword" />
        <input pInputText placeholder="User filter" [(ngModel)]="user" />
        <p-calendar [(ngModel)]="date" dateFormat="dd-M-yy" placeholder="Date"></p-calendar>
        <button pButton icon="pi pi-filter" label="Apply" (click)="load()"></button>
      </div> -->

      <p-table [value]="conversations" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10,20,50]" [scrollable]="true" scrollHeight="430px" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th>User</th>
            <th>Conversation Title</th>
            <th>Last Question</th>
            <th>Last Answer</th>
            <th>Model</th>
            <th pSortableColumn="created_at">Start Date <p-sortIcon field="created_at"></p-sortIcon></th>
            <th>Last Activity</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-row>
          <tr>
            <td>{{ row.user.name || '-' }}</td>
            <td>{{ row.conversation_title }}</td>
            <td>{{ row.last_question }}</td>
            <td>{{ row.last_answer }}</td>
            <td><p-tag severity="info" [value]="row.model"></p-tag></td>
            <td>{{ row.startdate | istDate }}</td>
            <td>{{ (row.last_activity || row.created_at) | istDate }}</td>
            <td><button pButton icon="pi pi-eye" class="p-button-sm" label="View" (click)="open(row)"></button></td>
          </tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog [(visible)]="dialog" [modal]="true" [style]="{ width: '78vw' }" [breakpoints]="{ '900px': '95vw' }" header="Conversation Detail">
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
              <div class="sources" *ngIf="message.sources?.length">
                <span *ngFor="let source of message.sources">
                  {{ source.filename }} · Chunk {{ source.chunk_index }} · Score {{ source.relevance_score | number: '1.2-2' }}
                </span>
              </div>
            </div>
          </div>
        </ng-container>
      </div>
      <ng-template #empty>No messages found.</ng-template>
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
        grid-template-columns: minmax(220px, 1fr) 180px 170px auto;
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
        gap: 6px;
      }
      .sources span {
        background: #dceeff;
        border: 1px solid #9ec2e8;
        color: #062b63;
        padding: 3px 6px;
      }
      @media (max-width: 900px) {
        .toolbar {
          grid-template-columns: 1fr;
        }
        .bubble {
          max-width: 92%;
        }
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatHistoryComponent implements OnInit {
  conversations: ChatConversation[] = [];
  messages: ChatMessage[] = [];
  keyword = '';
  user = '';
  date?: Date;
  dialog = false;

  constructor(private readonly chat: ChatService, private readonly cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.chat.getChatHistory({ limit: 100 }).subscribe((rows) => {
      this.conversations = rows;
      this.cdr.markForCheck();
    });
  }

  open(row: ChatConversation): void {
    this.dialog = true;
    this.chat.details(row.conversation_id).subscribe((messages) => {
      this.messages = messages;
      this.cdr.markForCheck();
    });
  }
}
 