import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { PasswordModule } from 'primeng/password';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RequiredLabelComponent } from './components/required-label/required-label.component';
import { IstDatePipe } from './pipes/ist-date.pipe';

const PRIME_MODULES = [
  ButtonModule,
  CalendarModule,
  CardModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  FileUploadModule,
  InputSwitchModule,
  InputTextModule,
  InputTextareaModule,
  PasswordModule,
  PanelModule,
  TableModule,
  TagModule,
  TabViewModule,
  TooltipModule
];

@NgModule({
  declarations: [PageHeaderComponent, RequiredLabelComponent, IstDatePipe],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ...PRIME_MODULES],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    RequiredLabelComponent,
    IstDatePipe,
    ...PRIME_MODULES
  ],
  providers: [DatePipe]
})
export class SharedModule {}
