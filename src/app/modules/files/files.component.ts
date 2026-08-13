import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { ManagedFile } from "../../core/models/api.models";
import { FileService } from "../../core/services/file.service";

@Component({
  selector: "app-files",
  template: `
    <app-page-header
      title="File Management"
      subtitle="PDF knowledge base and embedding operations"
    >
      <button
        pButton
        icon="pi pi-upload"
        label="Upload PDF"
        routerLink="/files/upload"
      ></button>
    </app-page-header>
    <section class="enterprise-card table-wrap">
      <div class="toolbar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            placeholder="Search file name"
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
        [value]="files"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[10, 20, 50, 100]"
        [scrollable]="true"
        scrollHeight="520px"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="filename">
              File Name <p-sortIcon field="filename"></p-sortIcon>
            </th>
            <th pSortableColumn="created_at">
              Upload Date <p-sortIcon field="created_at"></p-sortIcon>
            </th>
            <th pSortableColumn="file_size">
              File Size <p-sortIcon field="file_size"></p-sortIcon>
            </th>
            <th>File Type</th>
            <th>Embedding Status</th>
            <th>File Status</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-file>
          <tr>
            <td>{{ file.filename }}</td>
            <td>{{ file.created_at | istDate }}</td>
            <td>
              <ng-container *ngIf="file.file_size < 1048576; else mbSize">
                {{ file.file_size / 1024 | number: "1.2-2" }} KB
              </ng-container>

              <ng-template #mbSize>
                {{ file.file_size / 1048576 | number: "1.2-2" }} MB
              </ng-template>
            </td>
            <td>{{ file.file_type }}</td>
            <td>
              <p-tag
                [severity]="file.is_embedded ? 'success' : 'warning'"
                [value]="file.is_embedded ? 'Embedded' : 'Pending'"
              ></p-tag>
            </td>
            <td>
              <p-tag
                [severity]="getFileStatus(file) ? 'success' : 'danger'"
                [value]="getFileStatus(file) ? 'Active' : 'Disabled'"
              ></p-tag>
            </td>
            <td class="actions">
              <button
                pButton
                [icon]="getFileStatus(file) ? 'pi pi-ban' : 'pi pi-check'"
                class="p-button-sm"
                [class.p-button-danger]="getFileStatus(file)"
                [class.p-button-success]="!getFileStatus(file)"
                pTooltip="Enable/Disable file"
                (click)="toggleStatus(file)"
              ></button>

              <button
                pButton
                icon="pi pi-cog"
                class="p-button-sm p-button-info"
                pTooltip="Generate/Re-generate embeddings"
                (click)="embed(file)"
              ></button>

              <button
                pButton
                icon="pi pi-trash"
                class="p-button-sm p-button-danger"
                pTooltip="Delete file and metadata"
                (click)="remove(file)"
              ></button>
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
        grid-template-columns: 1fr 160px 160px auto;
        margin-bottom: 10px;
      }
      .actions {
        display: flex;
        gap: 6px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilesComponent implements OnInit {
  files: ManagedFile[] = [];
  search = "";
  fromDate?: Date;
  toDate?: Date;

  constructor(
    private filesApi: FileService,
    private confirmation: ConfirmationService,
    private messages: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    const params: any = {
      skip: 0,
      limit: 100,
    };

    if (this.search) {
      params.filename = this.search;
    }

    if (this.fromDate) {
      params.start_date = this.formatDate(this.fromDate);
    }

    if (this.toDate) {
      params.end_date = this.formatDate(this.toDate);
    }

    this.filesApi
      .list(params)
      .subscribe((files) => {
        this.files = files;
        this.cdr.markForCheck();
      });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  getFileStatus(file: ManagedFile): boolean {
    return file.file_status ?? file.is_active;
  }

  embed(file: ManagedFile): void {
    if (file.is_embedded) {
      this.messages.add({
        severity: "warn",
        summary: "Already Embedded",
        detail: `${file.filename} is already embedded.`,
      });
      return;
    }
    this.filesApi.generateEmbedding(file.id).subscribe(() => {
      this.messages.add({
        severity: "success",
        summary: "Embedding started",
        detail: file.filename,
      });
      this.load();
    });
  }

  apiFileUrl(file: ManagedFile): string {
    return `/files/${file.id}`;
  }

  toggleStatus(file: ManagedFile): void {
    const isActive = this.getFileStatus(file);

    this.confirmation.confirm({
      message: `Do you want to ${isActive ? "disable" : "enable"} ${file.filename}?`,
      accept: () => {
        this.filesApi.setStatus(file.id, !isActive).subscribe({
          next: () => {
            this.messages.add({
              severity: "success",
              summary: "Status updated",
              detail: file.filename,
            });
            this.load();
          },
        });
      },
    });
  }

  remove(file: ManagedFile): void {
    this.confirmation.confirm({
      message: `Delete ${file.filename}, vector embeddings, and metadata?`,
      accept: () => {
        this.filesApi.delete(file.id).subscribe(() => {
          this.messages.add({
            severity: "success",
            summary: "Deleted",
            detail: file.filename,
          });
          this.load();
        });
      },
    });
  }
}
