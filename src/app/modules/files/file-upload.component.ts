import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
} from "@angular/core";
import { MessageService } from "primeng/api";
import { FileService } from "../../core/services/file.service";
import { ManagedFile } from "../../core/models/api.models";

@Component({
  selector: "app-file-upload",
  template: `
    <app-page-header title="Upload File">
      <button
        pButton
        icon="pi pi-arrow-left"
        label="Back"
        class="p-button-secondary"
        routerLink="/files"
        [disabled]="isUploading"
      ></button>
    </app-page-header>
    <section class="enterprise-card upload-wrap">
      <p class="rule">* Allowed file types: PDF Maximum upload size: 300 MB</p>
      <p-fileUpload
        name="file"
        accept=".pdf,application/pdf"
        [maxFileSize]="314572800"
        [customUpload]="true"
        [multiple]="false"
        [disabled]="isUploading"
        (uploadHandler)="upload($event)"
        chooseLabel="Choose File"
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
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadComponent {
  isUploading = false;
  private readonly ALLOWED_FILE_TYPES = {
    ".pdf": "application/pdf",
    // ".txt": "text/plain",
    // ".docx":
    //   "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };
  private readonly MAX_FILE_SIZE = 314572800; // 300 MB

  constructor(
    private files: FileService,
    private messages: MessageService,
    private cdr: ChangeDetectorRef,
  ) {}

  upload(event: { files: File[] }): void {
    const file = event.files[0];

    // Validation
    if (!file) {
      this.messages.add({
        severity: "warn",
        summary: "No File",
        detail: "Please select a file to upload.",
      });
      return;
    }

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const isValidType = Object.keys(this.ALLOWED_FILE_TYPES).includes(
      fileExtension,
    );
    const isValidSize = file.size <= this.MAX_FILE_SIZE;

    if (!isValidType) {
      this.messages.add({
        severity: "error",
        summary: "Invalid File Type",
        detail: "Allowed types: PDF",
      });
      return;
    }

    if (!isValidSize) {
      this.messages.add({
        severity: "error",
        summary: "File Too Large",
        detail: "Maximum file size is 300 MB.",
      });
      return;
    }

    this.isUploading = true;
    this.cdr.markForCheck();

    this.files.upload(file).subscribe({
      next: (response: ManagedFile) => {
        this.isUploading = false;
        this.cdr.markForCheck();
        this.messages.add({
          severity: "success",
          summary: "File Uploaded",
          detail: `${response.filename} (${this.formatFileSize(response.file_size)}) uploaded successfully.`,
        });
      },
      error: (err) => {
        this.isUploading = false;
        this.cdr.markForCheck();
        this.handleUploadError(err);
      },
    });
  }

  private handleUploadError(error: any): void {
    let errorMessage = "An error occurred during upload.";

    if (error.status === 413) {
      errorMessage = "File size exceeds maximum allowed (300 MB).";
    } else if (error.status === 400) {
      errorMessage = error.error?.detail || "Invalid file type or format.";
    } else if (error.status === 401 || error.status === 403) {
      errorMessage = "You do not have permission to upload files.";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    this.messages.add({
      severity: "error",
      summary: "Upload Failed",
      detail: errorMessage,
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}
