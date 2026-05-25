import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { FileUploadComponent } from './file-upload.component';
import { FilesComponent } from './files.component';

const routes: Routes = [
  { path: '', component: FilesComponent },
  { path: 'upload', component: FileUploadComponent }
];

@NgModule({
  declarations: [FilesComponent, FileUploadComponent],
  imports: [SharedModule, RouterModule.forChild(routes)]
})
export class FilesModule {}
