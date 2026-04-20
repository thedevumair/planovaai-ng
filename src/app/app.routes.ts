import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { GanttComponent } from './components/gantt/gantt.component';

export const routes: Routes = [
  { path: '', component: UploadComponent },
  { path: 'gantt', component: GanttComponent },
];
