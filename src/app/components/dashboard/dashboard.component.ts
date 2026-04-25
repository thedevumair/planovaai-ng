import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GanttService } from '../../services/gantt.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  selectedFile!: File;

  model: string = '';
  tasks: any[] = [];
  totalDuration: number = 0;

  loading: boolean = false;

  timelineSummary = {
    start: '',
    end: '',
    totalDays: 0,
    weeks: 0,
  };
  expandedTasks: Set<string> = new Set();

  constructor(
    private uploadService: UploadService,
    private router: Router,
    private ganttService: GanttService
  ) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
  if (!this.selectedFile) {
    alert('Please select SRS file');
    return;
  }

  this.loading = true;

  this.uploadService.uploadSRS(this.selectedFile).subscribe({
    next: (res: any) => {
      console.log('AI RESPONSE:', res);

      // FIXED
      this.model = res.model;
      this.tasks = res.ganttTask || [];

      // SAFE CALC
      this.totalDuration = this.tasks.reduce(
        (sum, t) => sum + (t.duration || 0),
        0
      );

      this.calculateTimeline();

      this.loading = false;
      this.ganttService.setTasks(this.tasks);
    },

    error: (err) => {
      console.error(err);
      this.loading = false;
      alert('AI processing failed');
    },
  });
  }

  goToGantt() {
    this.router.navigate(['/gantt'], {
      state: { tasks: this.tasks },
    });
  }

  goToTimeDebt() {
    this.router.navigate(['/time-debt'], {
      state: { tasks: this.tasks },
    });
  }

  calculateTimeline() {
    if (!this.tasks?.length) return;

    const dates = this.tasks.flatMap((t) => [
      new Date(t.startDate),
      new Date(t.endDate),
    ]);

    const min = new Date(Math.min(...dates.map((d) => d.getTime())));
    const max = new Date(Math.max(...dates.map((d) => d.getTime())));

    const diffDays = Math.ceil(
      (max.getTime() - min.getTime()) / (1000 * 60 * 60 * 24),
    );

    this.timelineSummary = {
      start: min.toDateString(),
      end: max.toDateString(),
      totalDays: diffDays,
      weeks: Math.ceil(diffDays / 7),
    };
  }

  exportPDF() {
  const data = document.getElementById('dashboard');

  if (!data) return;

  html2canvas(data).then(canvas => {
    const img = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    pdf.addImage(img, 'PNG', 10, 10, 190, 0);

    pdf.save('planova-report.pdf');
  });
}

toggleTask(title: string) {
  if (this.expandedTasks.has(title)) {
    this.expandedTasks.delete(title);
  } else {
    this.expandedTasks.add(title);
  }
}

isExpanded(title: string): boolean {
  return this.expandedTasks.has(title);
}

getSubtasks(description: string): string[] {
  if (!description) return [];
  return description.split(' | ').filter(d => d.trim().length > 0);
}
}
