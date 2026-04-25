import { Routes } from '@angular/router';
import { UploadComponent } from './components/upload/upload.component';
import { GanttComponent } from './components/gantt/gantt.component';
import { TimeDebtComponent } from './components/time-debt/time-debt.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'gantt', component: GanttComponent },
  { path: 'time-debt', component: TimeDebtComponent },
];
