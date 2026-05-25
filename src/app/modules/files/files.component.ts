import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ManagedFile } from '../../core/models/api.models';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-files',
  template: `
    <app-page-header title="File Management" subtitle="PDF knowledge base and embedding operations">
      <button pButton icon="pi pi-upload" label="Upload PDF" routerLink="/files/upload"></button>
    </app-page-header>
    <section class="enterprise-card table-wrap">
      <div class="toolbar">
        <input pInputText placeholder="Search file name" [(ngModel)]="search" />
        <p-dropdown [options]="types" [(ngModel)]="fileType" placeholder="File type"></p-dropdown>
        <p-calendar [(ngModel)]="fromDate" dateFormat="dd-M-yy" placeholder="From date"></p-calendar>
        <button pButton icon="pi pi-filter" label="Apply" (click)="load()"></button>
      </div>
      <p-table [value]="files" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10,20,50,100]" [scrollable]="true" scrollHeight="520px" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="filename">File Name <p-sortIcon field="filename"></p-sortIcon></th>
            <th pSortableColumn="created_at">Upload Date <p-sortIcon field="created_at"></p-sortIcon></th>
            <th pSortableColumn="file_size">File Size <p-sortIcon field="file_size"></p-sortIcon></th>
            <th>File Type</th>
            <th>Embedding Status</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-file>
          <tr>
            <td>{{ file.filename }}</td>
            <td>{{ file.created_at | istDate }}</td>
            <td>{{ file.file_size / 1048576 | number: '1.2-2' }} MB</td>
            <td>{{ file.file_type }}</td>
            <td><p-tag [severity]="file.is_embedded ? 'success' : 'warning'" [value]="file.is_embedded ? 'Embedded' : 'Pending'"></p-tag></td>
            <td class="actions">
              <button pButton icon="pi pi-cog" class="p-button-sm p-button-info" pTooltip="Generate/Re-generate embeddings" (click)="embed(file)"></button>
              <a pButton icon="pi pi-external-link" class="p-button-sm p-button-secondary" [href]="apiFileUrl(file)" target="_blank" pTooltip="Open file"></a>
              <button pButton icon="pi pi-trash" class="p-button-sm p-button-danger" pTooltip="Delete file and metadata" (click)="remove(file)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </section>
  `,
  styles: [
    `
      .table-wrap {
        padding: 14px;
      }
      .toolbar {
        display: grid;
        gap: 10px;
        grid-template-columns: minmax(220px, 1fr) 160px 170px auto;
        margin-bottom: 10px;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilesComponent implements OnInit {
  files: ManagedFile[] = [];
  search = '';
  fileType = '';
  fromDate?: Date;
  types = [
    { label: 'PDF', value: 'application/pdf' },
    { label: 'All', value: '' }
  ];

  constructor(
    private filesApi: FileService,
    private confirmation: ConfirmationService,
    private messages: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.filesApi.list({ skip: 0, limit: 100, search: this.search, file_type: this.fileType }).subscribe((files) => {
      this.files = files;
      this.cdr.markForCheck();
    });
  }

  embed(file: ManagedFile): void {
    this.filesApi.generateEmbedding(file.id).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Embedding started', detail: file.filename });
      this.load();
    });
  }

  apiFileUrl(file: ManagedFile): string {
    return `/files/${file.id}`;
  }

  remove(file: ManagedFile): void {
    this.confirmation.confirm({
      message: `Delete ${file.filename}, vector embeddings, and metadata?`,
      accept: () => {
        this.filesApi.delete(file.id).subscribe(() => {
          this.messages.add({ severity: 'success', summary: 'Deleted', detail: file.filename });
          this.load();
        });
      }
    });
  }
}
