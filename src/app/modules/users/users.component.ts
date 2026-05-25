import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AppUser } from '../../core/models/api.models';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-users',
  template: `
    <app-page-header title="User Management" subtitle="Search, manage status, and reset user passwords">
      <button pButton icon="pi pi-user-plus" label="Create User" routerLink="/users/create"></button>
    </app-page-header>

    <section class="enterprise-card table-wrap">
      <div class="toolbar">
        <span class="p-input-icon-left">
          <i class="pi pi-search"></i>
          <input pInputText placeholder="Search user" [(ngModel)]="search" (keyup.enter)="load()" />
        </span>
        <button pButton icon="pi pi-refresh" label="Refresh" (click)="load()"></button>
      </div>

      <p-table [value]="users" [paginator]="true" [rows]="20" [rowsPerPageOptions]="[10,20,50]" [scrollable]="true" scrollHeight="520px" styleClass="p-datatable-sm">
        <ng-template pTemplate="header">
          <tr>
            <th pSortableColumn="name">Name <p-sortIcon field="name"></p-sortIcon></th>
            <th pSortableColumn="email">Email <p-sortIcon field="email"></p-sortIcon></th>
            <th pSortableColumn="created_at">Creation Date <p-sortIcon field="created_at"></p-sortIcon></th>
            <th>Status</th>
            <th>Operations</th>
          </tr>
        </ng-template>
        <ng-template pTemplate="body" let-user>
          <tr>
            <td>{{ user.name || '-' }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.created_at | istDate }}</td>
            <td><p-tag [severity]="user.is_active ? 'success' : 'danger'" [value]="user.is_active ? 'Active' : 'Disabled'"></p-tag></td>
            <td class="actions">
              <button pButton icon="pi pi-key" class="p-button-sm p-button-info" pTooltip="Change password" (click)="openPassword(user)"></button>
              <button pButton [icon]="user.is_active ? 'pi pi-ban' : 'pi pi-check'" class="p-button-sm" [class.p-button-danger]="user.is_active" [class.p-button-success]="!user.is_active" pTooltip="Enable/Disable user" (click)="toggle(user)"></button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </section>

    <p-dialog header="Change User Password" [(visible)]="passwordDialog" [modal]="true" [style]="{ width: '420px' }">
      <div class="field">
        <label><app-required-label label="New Password"></app-required-label></label>
        <p-password [(ngModel)]="newPassword" [toggleMask]="true"></p-password>
      </div>
      <ng-template pTemplate="footer">
        <button pButton label="Cancel" class="p-button-text" (click)="passwordDialog = false"></button>
        <button pButton icon="pi pi-save" label="Update" (click)="changePassword()"></button>
      </ng-template>
    </p-dialog>
  `,
  styles: [
    `
      .table-wrap {
        padding: 14px;
      }
      .toolbar {
        display: flex;
        gap: 10px;
        justify-content: space-between;
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
export class UsersComponent implements OnInit {
  users: AppUser[] = [];
  search = '';
  passwordDialog = false;
  selectedUser?: AppUser;
  newPassword = '';

  constructor(
    private usersApi: UserService,
    private confirmation: ConfirmationService,
    private messages: MessageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.usersApi.list({ skip: 0, limit: 100, search: this.search, orderBy: 'created_at', orderType: 'desc' }).subscribe((users) => {
      this.users = users;
      this.cdr.markForCheck();
    });
  }

  openPassword(user: AppUser): void {
    this.selectedUser = user;
    this.newPassword = '';
    this.passwordDialog = true;
  }

  changePassword(): void {
    if (!this.selectedUser || !this.newPassword) {
      return;
    }
    this.usersApi.changePassword(this.selectedUser.id, this.newPassword).subscribe(() => {
      this.messages.add({ severity: 'success', summary: 'Updated', detail: 'Password changed.' });
      this.passwordDialog = false;
      this.cdr.markForCheck();
    });
  }

  toggle(user: AppUser): void {
    this.confirmation.confirm({
      message: `Do you want to ${user.is_active ? 'disable' : 'enable'} ${user.email}?`,
      accept: () => {
        this.usersApi.setStatus(user.id, !user.is_active).subscribe(() => {
          this.messages.add({ severity: 'success', summary: 'Status updated', detail: user.email });
          this.load();
        });
      }
    });
  }
}
