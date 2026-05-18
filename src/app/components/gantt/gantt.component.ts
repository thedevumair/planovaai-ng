import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  ViewChild,
} from '@angular/core';
import { GanttService } from '../../services/gantt.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import Gantt from 'frappe-gantt';
@Component({
  selector: 'app-gantt',
  imports: [CommonModule],
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.scss',
})
export class GanttComponent implements OnInit {
  @ViewChild('ganttContainer', { static: true }) ganttContainer!: ElementRef;

  tasks: any[] = [];
  gantt: any;

  constructor(
    private ganttService: GanttService,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  ngOnInit(): void {
    const raw = this.ganttService.getTasks();

    if (!raw?.length) {
      console.warn('⚠️ No tasks found');
      return;
    }

    // ✅ Sort by start date before mapping
    const sorted = [...raw].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

    this.tasks = sorted.map((t: any, index: number) => ({
      id: t.id || `task_${index}`,
      name: this.cleanTitle(t.title),
      start: t.startDate,
      end: t.endDate,
      progress: t.progress || 0,
      dependencies: t.dependsOn ?? '',
    }));

    setTimeout(() => this.renderGantt(), 100);
  }

  cleanTitle(title: string): string {
    return (title || 'Task')
      .replace(/[\t\n\r]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50);
  }

  renderGantt(): void {
    if (!isPlatformBrowser(this.platformId) || !this.tasks.length) return;

    const container = this.ganttContainer.nativeElement;
    container.innerHTML = '';

    try {
      this.gantt = new Gantt(container, this.tasks, {
        view_mode: 'Week',
        date_format: 'YYYY-MM-DD',
        bar_height: 30,
        bar_corner_radius: 3,
        arrow_curve: 5,
        padding: 18,
        on_click: (task: any) => console.log('Clicked:', task),
        on_date_change: (task: any, start: any, end: any) =>
          console.log('Date changed:', task, start, end),
        on_progress_change: (task: any, progress: any) =>
          console.log('Progress:', progress),
        on_view_change: (mode: any) => console.log('View:', mode),
      });
    } catch (e) {
      console.error('❌ Gantt failed:', e);
    }
  }
}
