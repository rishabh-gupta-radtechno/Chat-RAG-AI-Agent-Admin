import { MenuItem } from 'primeng/api';

export const ADMIN_MENU: MenuItem[] = [
  { label: 'Dashboard', icon: 'pi pi-th-large', routerLink: '/dashboard' },
  // { label: 'Admin Profile', icon: 'pi pi-id-card', routerLink: '/profile' },
  {
    label: 'User Management',
    icon: 'pi pi-users',
    items: [
      { label: 'Users', icon: 'pi pi-list', routerLink: '/users' },
      { label: 'Create User', icon: 'pi pi-user-plus', routerLink: '/users/create' }
    ]
  },
  {
    label: 'File Management',
    icon: 'pi pi-file-pdf',
    items: [
      { label: 'Files', icon: 'pi pi-folder-open', routerLink: '/files' },
      { label: 'Upload PDF', icon: 'pi pi-upload', routerLink: '/files/upload' }
    ]
  },
  { label: 'Chat History', icon: 'pi pi-comments', routerLink: '/chat-history' }
];
