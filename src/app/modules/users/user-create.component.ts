import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-user-create',
  template: `
    <app-page-header title="Create User">
      <button pButton icon="pi pi-arrow-left" label="Back" class="p-button-secondary" routerLink="/users"></button>
    </app-page-header>
    <section class="enterprise-card create-wrap">
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <div class="field">
          <label><app-required-label label="Name" [required]="false"></app-required-label></label>
          <input pInputText formControlName="name" />
        </div>
        <div class="field">
          <label><app-required-label label="Email"></app-required-label></label>
          <input pInputText type="email" formControlName="email" />
        </div>
        <div class="field">
          <label><app-required-label label="Password"></app-required-label></label>
          <p-password formControlName="password" [toggleMask]="true"></p-password>
        </div>
        <div class="field">
          <label>Enable/Disable</label>
          <p-inputSwitch formControlName="enabled"></p-inputSwitch>
        </div>
        <div>
          <button pButton icon="pi pi-save" label="Register User" [disabled]="form.invalid"></button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .create-wrap {
        padding: 14px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserCreateComponent {
  form = this.fb.nonNullable.group({
    name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    enabled: [true]
  });

  constructor(private fb: FormBuilder, private users: UserService, private messages: MessageService, private router: Router) {}

  submit(): void {
    const value = this.form.getRawValue();
    this.users.register(value.email, value.password).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'User created', detail: value.email });
      this.router.navigateByUrl('/users');
    });
  }
}
