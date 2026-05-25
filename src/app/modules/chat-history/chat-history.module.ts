import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ChatHistoryComponent } from './chat-history.component';

const routes: Routes = [{ path: '', component: ChatHistoryComponent }];

@NgModule({
  declarations: [ChatHistoryComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class ChatHistoryModule {}
