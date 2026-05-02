import { Routes } from '@angular/router';
import { GanttComponent } from './components/gantt/gantt.component';
import { TimeDebtComponent } from './components/time-debt/time-debt.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { authGuard } from './guards/auth.guard';
import { TeamComponent } from './components/team/team.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'gantt', component: GanttComponent, canActivate: [authGuard] },
  { path: 'time-debt', component: TimeDebtComponent, canActivate: [authGuard] },
  { path: 'team', component: TeamComponent, canActivate: [authGuard] },
];
