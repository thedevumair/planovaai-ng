import { Component } from '@angular/core';
import { TimeDebtService } from '../../services/time-debt.service';
import { CommonModule } from '@angular/common';
import { GanttService } from '../../services/gantt.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-time-debt',
  imports: [CommonModule],
  templateUrl: './time-debt.component.html',
  styleUrl: './time-debt.component.scss'
})
export class TimeDebtComponent {

  tasks: any[] = [];
  result: any = null;
  loading = false;

  constructor(
    private ganttService: GanttService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tasks = this.ganttService.getTasks();

    if (!this.tasks.length) {
      console.warn('No tasks found');
      this.router.navigate(['/dashboard']);
      return;
    }

    this.calculate();
  }

  calculate() {
    this.loading = true;
    this.http.post('http://localhost:8080/api/time-debt', this.tasks)
      .subscribe({
        next: (res: any) => {
          this.result = res;
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          this.loading = false;
        }
      });
  }

  getRiskClass(risk: string): string {
    switch (risk?.toLowerCase()) {
      case 'high':   return 'risk-high';
      case 'medium': return 'risk-medium';
      case 'low':    return 'risk-low';
      default:       return 'risk-none';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
