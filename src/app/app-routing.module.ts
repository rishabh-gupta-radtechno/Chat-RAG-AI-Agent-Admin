import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminLayoutComponent } from './core/layouts/admin-layout/admin-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { loginGuard } from './core/guards/login.guard';

const routes: Routes = [
  {
    path: 'login',
    canActivate: [loginGuard],
    loadChildren: () => import('./modules/auth/auth.module').then((m) => m.AuthModule)
  },
  {
    path: '',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadChildren: () => import('./modules/dashboard/dashboard.module').then((m) => m.DashboardModule)
      },
      {
        path: 'profile',
        loadChildren: () => import('./modules/profile/profile.module').then((m) => m.ProfileModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./modules/users/users.module').then((m) => m.UsersModule)
      },
      {
        path: 'files',
        loadChildren: () => import('./modules/files/files.module').then((m) => m.FilesModule)
      },
      {
        path: 'chat-history',
        loadChildren: () => import('./modules/chat-history/chat-history.module').then((m) => m.ChatHistoryModule)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { bindToComponentInputs: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}
