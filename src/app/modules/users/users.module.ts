import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { UserCreateComponent } from './user-create.component';
import { UsersComponent } from './users.component';

const routes: Routes = [
  { path: '', component: UsersComponent },
  { path: 'create', component: UserCreateComponent }
];

@NgModule({
  declarations: [UsersComponent, UserCreateComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class UsersModule {}
