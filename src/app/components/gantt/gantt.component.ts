import { AfterViewInit, Component } from '@angular/core';
import { GanttService } from '../../services/gantt.service';
import { CommonModule } from '@angular/common';
import mermaid from 'mermaid';

@Component({
  selector: 'app-gantt',
  imports: [CommonModule],
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.scss'
})
export class GanttComponent implements AfterViewInit{

  tasks: any[] = [];
  chart: string = '';

  constructor(private ganttService: GanttService) {}

  ngOnInit() {
    this.ganttService.getGantt(1).subscribe((res: any) => {
      this.tasks = res;
      this.generateMermaidChart();
    });
  }

  ngAfterViewInit() {
    mermaid.initialize({ startOnLoad: false });
  }

  generateMermaidChart() {
    let gantt = `gantt
    title PlanovaAI Project Timeline
    dateFormat  YYYY-MM-DD
    section Tasks
    `;

    let currentDate = new Date(2024, 0, 1); // base date

    this.tasks.forEach(task => {
      let start = new Date(currentDate);
      let end = new Date(currentDate);
      end.setDate(start.getDate() + (task.endDay - task.startDay));

      const format = (d: Date) => d.toISOString().split('T')[0];

      gantt += `${task.title} : ${format(start)}, ${format(end)}\n`;

      currentDate = end;
    });

    this.chart = gantt;

    setTimeout(() => {
      mermaid.contentLoaded();
    }, 100);
  }
}
