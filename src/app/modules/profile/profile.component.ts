import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  template: `
    <app-page-header title="Admin Profile"></app-page-header>
    <section class="enterprise-card profile-wrap">
      <div class="form-grid">
        <div class="field">
          <label>Name</label>
          <input pInputText [value]="auth.currentUser?.name || 'Admin User'" readonly />
        </div>
        <div class="field">
          <label>Email</label>
          <input pInputText [value]="auth.currentUser?.email || 'admin@example.com'" readonly />
        </div>
      </div>
      <p-divider></p-divider>
      <form [formGroup]="form" (ngSubmit)="save()" class="form-grid">
        <div class="field">
          <label><app-required-label label="Old Password"></app-required-label></label>
          <p-password formControlName="oldPassword" [feedback]="false" [toggleMask]="true"></p-password>
        </div>
        <div class="field">
          <label><app-required-label label="New Password"></app-required-label></label>
          <p-password formControlName="newPassword" [toggleMask]="true"></p-password>
        </div>
        <div class="field">
          <label><app-required-label label="Confirm Password"></app-required-label></label>
          <p-password formControlName="confirmPassword" [feedback]="false" [toggleMask]="true"></p-password>
        </div>
        <div>
          <button pButton icon="pi pi-save" label="Change Password" [disabled]="form.invalid"></button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .profile-wrap {
        padding: 14px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  form = this.fb.nonNullable.group({
    oldPassword: ['', Validators.required],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required]
  });

  constructor(public auth: AuthService, private fb: FormBuilder, private messages: MessageService) {}

  save(): void {
    const value = this.form.getRawValue();
    if (value.newPassword !== value.confirmPassword) {
      this.messages.add({ severity: 'warn', summary: 'Password mismatch', detail: 'Confirm password must match.' });
      return;
    }
    this.auth.changePassword(value.oldPassword, value.newPassword).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Password changed successfully.' });
      this.form.reset();
    });
  }
}
