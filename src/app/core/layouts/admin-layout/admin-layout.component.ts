import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { ADMIN_MENU } from '../../constants/menu.constants';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdminLayoutComponent {
  menu: MenuItem[] = ADMIN_MENU;
  collapsed = false;

  constructor(public auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
