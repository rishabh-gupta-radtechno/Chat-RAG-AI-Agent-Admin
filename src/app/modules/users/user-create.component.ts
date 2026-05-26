import { ChangeDetectionStrategy, Component } from "@angular/core";
import {
  FormBuilder,
  Validators,
  AbstractControl,
  ValidationErrors,
} from "@angular/forms";
import { Router } from "@angular/router";
import { MessageService } from "primeng/api";
import { UserService } from "../../core/services/user.service";

@Component({
  selector: "app-user-create",
  template: `
    <app-page-header title="Create User">
      <button
        pButton
        icon="pi pi-arrow-left"
        label="Back"
        class="p-button-secondary"
        routerLink="/users"
      ></button>
    </app-page-header>
    <section class="enterprise-card create-wrap">
      <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <div class="field">
          <label
            ><app-required-label
              label="Name"
              [required]="false"
            ></app-required-label
          ></label>
          <input pInputText formControlName="name" />
        </div>
        <div class="field">
          <label><app-required-label label="Email"></app-required-label></label>
          <input pInputText type="email" formControlName="email" />
        </div>
        <div class="field">
          <label
            ><app-required-label label="Password"></app-required-label
          ></label>
          <p-password
            formControlName="password"
            [toggleMask]="true"
            [feedback]="false"
          ></p-password>
          <small class="helper-text">
            Password must contain at least 8 characters.
          </small>
        </div>
        <div class="field">
          <label
            ><app-required-label label="Confirm Password"></app-required-label
          ></label>
          <p-password
            formControlName="confirmPassword"
            [toggleMask]="true"
            [feedback]="false"
          ></p-password>
        </div>
        <div class="field">
          <label>Enable/Disable</label>
          <p-inputSwitch formControlName="enabled"></p-inputSwitch>
        </div>
        <div>
          <button pButton icon="pi pi-save" label="Register User"></button>
        </div>
      </form>
    </section>
  `,
  styles: [
    `
      .create-wrap {
        padding: 14px;
      }
      .helper-text {
        display: block;
        margin-top: 4px;
        color: #6b7280;
        font-size: 12px;
      }

      .p-error {
        display: block;
        margin-top: 4px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCreateComponent {
  form = this.fb.nonNullable.group(
    {
      name: [""],
      // email: ["", [Validators.required, Validators.email]],
      email: [
        "",
        [
          Validators.required,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[A-Za-z]{2,}$/,
          ),
        ],
      ],
      password: ["", [Validators.required, Validators.minLength(8)]],
      confirmPassword: ["", [Validators.required, Validators.minLength(8)]],
      enabled: [true],
    },
    { validators: this.passwordMatchValidator },
  );

  constructor(
    private fb: FormBuilder,
    private users: UserService,
    private messages: MessageService,
    private router: Router,
  ) {}

  private passwordMatchValidator(
    control: AbstractControl,
  ): ValidationErrors | null {
    const password = control.get("password")?.value;
    const confirmPassword = control.get("confirmPassword")?.value;

    if (!password || !confirmPassword) {
      return null;
    }

    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  submit(): void {
    if (this.form.get("email")?.hasError("required")) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Email is required",
      });
      return;
    }

    if (this.form.get("email")?.hasError("pattern")) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Please enter a valid email",
      });
      return;
    }

    if (this.form.get("password")?.hasError("required")) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Password is required",
      });
      return;
    }

    if (this.form.get("password")?.hasError("minlength")) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Password must be at least 8 characters",
      });
      return;
    }

    if (this.form.hasError("passwordMismatch")) {
      this.messages.add({
        severity: "error",
        summary: "Password Mismatch",
        detail: "Passwords should be the same.",
      });

      return;
    }

    const value = this.form.getRawValue();

    this.users
      .register(value.name, value.email, value.password, value.enabled)
      .subscribe({
        next: () => {
          this.messages.add({
            severity: "success",
            summary: "User created",
            detail: value.email,
          });

          this.router.navigateByUrl("/users");
        },

        error: (err) => {
          let message = "Something went wrong";

          if (err?.error?.detail) {
            // FastAPI array validation errors
            if (Array.isArray(err.error.detail)) {
              message = err.error.detail
                .map((x: any) => x.msg || x.message || JSON.stringify(x))
                .join(", ");
            }

            // String error
            else if (typeof err.error.detail === "string") {
              message = err.error.detail;
            }

            // Object error
            else if (typeof err.error.detail === "object") {
              message =
                err.error.detail.msg ||
                err.error.detail.message ||
                JSON.stringify(err.error.detail);
            }
          }

          this.messages.add({
            severity: "error",
            summary: "Registration Failed",
            detail: message,
          });
        },
      });
  }
}
