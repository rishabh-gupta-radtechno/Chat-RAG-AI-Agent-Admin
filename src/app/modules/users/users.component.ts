import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from "@angular/core";
import { ConfirmationService, MessageService } from "primeng/api";
import { AppUser } from "../../core/models/api.models";
import { UserService } from "../../core/services/user.service";

@Component({
  selector: "app-users",
  template: `
    <app-page-header
      title="User Management"
      subtitle="Search, manage status, and reset user passwords"
    >
      <button
        pButton
        icon="pi pi-user-plus"
        label="Create User"
        routerLink="/users/create"
      ></button>
    </app-page-header>

    <section class="enterprise-card table-wrap">
      <div class="toolbar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input
            pInputText
            placeholder="Search user"
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
        [value]="users"
        [paginator]="true"
        [rows]="20"
        [rowsPerPageOptions]="[10, 20, 50]"
        [scrollable]="true"
        scrollHeight="520px"
        styleClass="p-datatable-sm"
      >
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">
              Name <p-sortIcon field="name"></p-sortIcon>
            </th>
            <th pSortableColumn="email">
              Email <p-sortIcon field="email"></p-sortIcon>
            </th>
            <th pSortableColumn="created_at">
              Creation Date <p-sortIcon field="created_at"></p-sortIcon>
            </th>
            <th pSortableColumn="mobile">
              Mobile <p-sortIcon field="mobile"></p-sortIcon>
            </th>
            <th pSortableColumn="department">
              Department <p-sortIcon field="department"></p-sortIcon>
            </th>
            <th pSortableColumn="designation">
              Designation <p-sortIcon field="designation"></p-sortIcon>
            </th>
            <th>Status</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.name || "-" }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.created_at | istDate }}</td>
            <td>{{ user.mobile || "-" }}</td>
            <td>{{ user.department || "-" }}</td>
            <td>{{ user.designation || "-" }}</td>
            <td>
              <p-tag
                [severity]="user.is_active ? 'success' : 'danger'"
                [value]="user.is_active ? 'Active' : 'Disabled'"
              ></p-tag>
            </td>
            <td class="actions">
              <button
                pButton
                icon="pi pi-pencil"
                class="p-button-sm p-button-info"
                pTooltip="Edit user"
                (click)="openEdit(user)"
              ></button>
              <button
                pButton
                [icon]="user.is_active ? 'pi pi-ban' : 'pi pi-check'"
                class="p-button-sm"
                [class.p-button-danger]="user.is_active"
                [class.p-button-success]="!user.is_active"
                pTooltip="Enable/Disable user"
                (click)="toggle(user)"
              ></button>

            </td>
          </tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog
      header="Change User Password"
      [(visible)]="passwordDialog"
      [modal]="true"
      [style]="{ width: '420px' }"
    >
      <div class="field">
        <label
          ><app-required-label label="New Password"></app-required-label
        ></label>
        <p-password [(ngModel)]="newPassword" [toggleMask]="true"></p-password>
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancel"
          class="p-button-text"
          (click)="passwordDialog = false"
        ></button>
        <button
          pButton
          icon="pi pi-save"
          label="Update"
          (click)="changePassword()"
        ></button>
      </ng-template>
    </p-dialog>

    <p-dialog
      header="Edit User"
      [(visible)]="editDialog"
      [modal]="true"
      [style]="{ width: '500px' }"
    >
      <div class="field">
        <label><app-required-label label="Name" [required]="false"></app-required-label></label>
        <input pInputText [(ngModel)]="editUser.name" />
      </div>
      <div class="field">
        <label><app-required-label label="Email"></app-required-label></label>
        <input pInputText type="email" [(ngModel)]="editUser.email" />
      </div>
      <div class="field">
        <label><app-required-label label="Department" [required]="false"></app-required-label></label>
        <input pInputText [(ngModel)]="editUser.department" />
      </div>
      <div class="field">
        <label><app-required-label label="Designation" [required]="false"></app-required-label></label>
        <input pInputText [(ngModel)]="editUser.designation" />
      </div>
      <div class="field">
        <label><app-required-label label="Mobile Number"></app-required-label></label>
        <input pInputText [(ngModel)]="editUser.mobile" />
      </div>
      <ng-template pTemplate="footer">
        <button
          pButton
          label="Cancel"
          class="p-button-text"
          (click)="editDialog = false"
        ></button>
        <button
          pButton
          icon="pi pi-save"
          label="Update"
          (click)="updateUser()"
        ></button>
      </ng-template>
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
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  search = "";
  fromDate?: Date;
  toDate?: Date;
  passwordDialog = false;
  editDialog = false;
  selectedUser?: AppUser;
  editUser: Partial<AppUser> = {};
  newPassword = "";

  constructor(
    private usersApi: UserService,
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
      orderBy: "created_at",
      orderType: "desc",
    };

    if (this.search) {
      params.name = this.search;
    }

    if (this.fromDate) {
      params.start_date = this.formatDate(this.fromDate);
    }

    if (this.toDate) {
      params.end_date = this.formatDate(this.toDate);
    }

    this.usersApi.list(params).subscribe((users) => {
      this.users = users;
      this.cdr.markForCheck();
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openPassword(user: AppUser): void {
    this.selectedUser = user;
    this.newPassword = "";
    this.passwordDialog = true;
  }

  changePassword(): void {
    if (!this.selectedUser || !this.newPassword) {
      return;
    }
    this.usersApi
      .changePassword(this.selectedUser.id, this.newPassword)
      .subscribe(() => {
        this.messages.add({
          severity: "success",
          summary: "Updated", 
          detail: "Password changed.",
        });
        this.passwordDialog = false;
        this.cdr.markForCheck();
      });
  }

  openEdit(user: AppUser): void {
    this.editUser = { ...user };
    this.editDialog = true;
  }

  updateUser(): void {
    if (!this.editUser.id) {
      return;
    }

    // Validation
    if (!this.editUser.email) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Email is required",
      });
      return;
    }

    if (this.editUser.mobile && String(this.editUser.mobile).length !== 10) {
      this.messages.add({
        severity: "error",
        summary: "Validation Error",
        detail: "Mobile number must be exactly 10 digits",
      });
      return;
    }

    this.usersApi.updateUser(this.editUser.id, {
      name: this.editUser.name,
      email: this.editUser.email,
      department: this.editUser.department,
      designation: this.editUser.designation,
      mobile: this.editUser.mobile ? parseInt(String(this.editUser.mobile)) : undefined,
    }).subscribe({
      next: () => {
        this.messages.add({
          severity: "success",
          summary: "Updated",
          detail: "User updated successfully.",
        });
        this.editDialog = false;
        this.load();
        this.cdr.markForCheck();
      },
      error: (err) => {
        let message = "Failed to update user";
        if (err?.error?.detail) {
          message = err.error.detail;
        }
        this.messages.add({
          severity: "error",
          summary: "Update Failed",
          detail: message,
        });
      },
    });
  }

  toggle(user: AppUser): void {
    this.confirmation.confirm({
      message: `Do you want to ${user.is_active ? "disable" : "enable"} ${user.email}?`,
      accept: () => {
        this.usersApi.setStatus(user.id, !user.is_active).subscribe(() => {
          this.messages.add({
            severity: "success",
            summary: "Status updated",
            detail: user.email,
          });
          this.load();
        });
      },
    });
  }

  onDeleteUser(user: AppUser): void {
    this.confirmation.confirm({
      message: `Are you sure you want to delete user ${user.email}? This action cannot be undone.`,
      header: "Delete Confirmation",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.usersApi.deleteUser(user.id).subscribe({
          next: () => {
            this.users = this.users.filter((u) => u.id !== user.id);
            this.messages.add({
              severity: "success",
              summary: "Deleted",
              detail: "User has been removed successfully.",
            });
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error("Failed to delete user:", err);
            this.messages.add({
              severity: "error",
              summary: "Error",
              detail: "Failed to delete user. Please try again.",
            });
          },
        });
      },
    });
  }
}
