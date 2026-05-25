import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-file-upload',
  template: `
    <app-page-header title="Upload File">
      <button pButton icon="pi pi-arrow-left" label="Back" class="p-button-secondary" routerLink="/files"></button>
    </app-page-header>
    <section class="enterprise-card upload-wrap">
      <p class="rule">* Only PDF files are allowed. Maximum upload size: 100 MB</p>
      <p-fileUpload
        name="file"
        accept="application/pdf"
        [maxFileSize]="104857600"
        [customUpload]="true"
        [multiple]="false"
        (uploadHandler)="upload($event)"
        chooseLabel="Choose PDF"
        uploadLabel="Upload"
        cancelLabel="Clear"
      ></p-fileUpload>
    </section>
  `,
  styles: [
    `
      .upload-wrap {
        padding: 14px;
      }
      .rule {
        color: #d32f2f;
        font-weight: 700;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileUploadComponent {
  constructor(private files: FileService, private messages: MessageService) {}

  upload(event: { files: File[] }): void {
    const file = event.files[0];
    if (!file || file.type !== 'application/pdf' || file.size > 104857600) {
      this.messages.add({ severity: 'warn', summary: 'Invalid file', detail: 'Upload PDF files up to 100 MB only.' });
      return;
    }
    this.files.upload(file).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Uploaded', detail: file.name });
    });
  }
}
