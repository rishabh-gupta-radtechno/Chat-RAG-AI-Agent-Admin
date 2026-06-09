import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  template: `
    <main class="login-page">
      <section class="login-panel enterprise-card">
        <div class="brand">
          <img src="assets/images/indian-railways-logo.png" alt="Indian Railways" />
          <div>
            <h1>ABS Chat Agent</h1>
            <span>Indian Railways Admin Portal</span>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form">
          <div class="field">
            <label><app-required-label label="Email"></app-required-label></label>
            <input pInputText type="email" formControlName="email" />
            <small class="required" *ngIf="form.controls.email.invalid && form.controls.email.touched">Valid email is required.</small>
          </div>
          <div class="field">
            <label><app-required-label label="Password"></app-required-label></label>
            <p-password formControlName="password" [feedback]="false" [toggleMask]="true"></p-password>
            <small class="required" *ngIf="form.controls.password.invalid && form.controls.password.touched">Password is required.</small>
          </div>
          <button pButton type="submit" icon="pi pi-sign-in" label="Login" [disabled]="form.invalid"></button>
        </form>
      </section>
    </main>
  `,
  styles: [
    `
      .login-page {
        align-items: center;
        background: linear-gradient(145deg, #eaf3fc, #b7cce5);
        display: flex;
        min-height: 100vh;
        justify-content: center;
        padding: 18px;
      }
      .login-panel {
        max-width: 430px;
        padding: 22px;
        width: 100%;
      }
      .brand {
        align-items: center;
        display: flex;
        gap: 14px;
        margin-bottom: 22px;
      }
      .brand img {
        height: 70px;
        width: 70px;
      }
      h1 {
        color: #0b3d91;
        font-size: 24px;
        margin: 0;
      }
      .brand span {
        color: #355f8d;
        font-weight: 700;
      }
      .login-form {
        display: grid;
        gap: 15px;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private messages: MessageService
  ) {}

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
       console.log("not worked");
      return;
    }
    console.log("worked");
    // this.router.navigateByUrl('/dashboard');
    this.auth.login(this.form.getRawValue()).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Login successful', detail: 'Welcome to admin portal.' });
      this.router.navigateByUrl('/dashboard');
    });
  }
}
