import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UploadService } from '../../services/upload.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GanttService } from '../../services/gantt.service';
import { ProgressService } from '../../services/progress.service';
import { AuthServiceService } from '../../services/auth-service.service';
import { TeamService } from '../../services/team/team.service';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  selectedFile!: File;
  model: string = '';
  tasks: any[] = [];
  totalDuration: number = 0;
  loading: boolean = false;
  showModal: boolean = false;
  selectedTask: any = null;
  expandedTasks: Set<string> = new Set();
  subTaskProgress: Map<
    string,
    Map<number, { progress: number; status: string }>
  > = new Map();
  userName: string = '';

  timelineSummary = {
    start: '',
    end: '',
    totalDays: 0,
    weeks: 0,
  };

  isTeamLead: boolean = false;
  developerProjects: any[] = [];
  private readonly SUB_PROGRESS_KEY = 'planova_sub_progress';
  projectSummary: any = null;

  constructor(
    private uploadService: UploadService,
    private router: Router,
    private ganttService: GanttService,
    private progressService: ProgressService,
    private authService: AuthServiceService,
    private teamService: TeamService,
  ) {}

  ngOnInit(): void {
    this.userName = this.authService.getUserName();
    const role = this.authService.getRole();
    this.isTeamLead = role === 'TEAM_LEAD';

    if (this.isTeamLead) {
      this.loadTeamLeadDashboard();
    } else {
      this.loadDeveloperDashboard();
    }
  }

  loadTeamLeadDashboard() {
    const savedTasks = this.ganttService.getTasks();
    const savedModel = this.ganttService.getModel();

    if (savedTasks.length > 0 && this.ganttService.getProjectId()) {
      this.tasks = this.sortTasksByDate(savedTasks);
      this.tasks = savedTasks;
      this.model = savedModel;
      this.totalDuration = this.tasks.reduce(
        (sum, t) => sum + (t.duration || 0),
        0,
      );
      this.calculateTimeline();
      this.restoreSubProgress();
      this.loadProjectSummary();
      return;
    }

    // ✅ Always load projectId from DB
    this.progressService.getMyTasks().subscribe({
      next: (res: any) => {
        if (res.projectId) {
          this.ganttService.setProjectId(res.projectId); // ✅ from DB
        }
        if (res.tasks?.length > 0) {
          this.tasks = this.sortTasksByDate(savedTasks);
          this.tasks = res.tasks;
          this.model = res.model || '';
          this.totalDuration = this.tasks.reduce(
            (sum: number, t: any) => sum + (t.duration || 0),
            0,
          );
          this.calculateTimeline();
          this.ganttService.setTasks(this.tasks);
          this.ganttService.setModel(this.model);
          this.restoreSubProgress();
          this.loadProjectSummary();
        }
      },
      error: (e) => console.warn('Could not load from DB:', e),
    });
  }

  loadDeveloperDashboard() {
    this.teamService.getMyProjects().subscribe({
      next: (res: any) => {
        this.developerProjects = res;
        console.log('✅ Developer projects:', res);
      },
      error: (e) => console.warn('Could not load developer projects:', e),
    });
  }

  openDeveloperProject(project: any) {
    localStorage.setItem('planova_project_id', project.projectId);
    this.router.navigate(['/developer-tasks'], {
      state: { project },
    });
  }

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
        this.model = res.model;

        // ✅ Sort tasks by start date
        this.tasks = this.sortTasksByDate(res.ganttTask || []);

        if (res.projectId) {
          this.ganttService.setProjectId(res.projectId);
        }

        if (res.role === 'TEAM_LEAD') {
          localStorage.setItem('userRole', 'TEAM_LEAD');
          this.isTeamLead = true;
        }

        this.totalDuration = this.tasks.reduce(
          (sum, t) => sum + (t.duration || 0),
          0,
        );

        this.calculateTimeline();
        this.loading = false;
        this.ganttService.setTasks(this.tasks);
        this.ganttService.setModel(this.model);
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('AI processing failed');
      },
    });
  }

  logout() {
    this.ganttService.clearAll();
    this.authService.logout();
  }

  clearAnalysis() {
    this.tasks = [];
    this.model = '';
    this.totalDuration = 0;
    this.timelineSummary = { start: '', end: '', totalDays: 0, weeks: 0 };
    this.expandedTasks.clear();
    this.subTaskProgress.clear();
    this.ganttService.clearAll();
    localStorage.removeItem(this.SUB_PROGRESS_KEY);
  }

  goToGantt() {
    this.router.navigate(['/gantt']);
  }
  goToTimeDebt() {
    this.router.navigate(['/time-debt']);
  }
  goToTeam() {
    this.router.navigate(['/team']);
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
    html2canvas(data).then((canvas) => {
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
    return description.split(' | ').filter((d) => d.trim().length > 0);
  }

  onProgressChange(task: any) {
    if (task.progress == 100) task.status = 'Done';
    else if (task.progress > 0) task.status = 'In Progress';
    else task.status = 'Planned';

    this.progressService
      .updateTask(task.id, task.progress, task.status)
      .subscribe({
        next: () => console.log('✅ Progress saved'),
        error: (e) => console.error('❌ Save failed', e),
      });

    this.ganttService.setTasks(this.tasks);
  }

  getSubProgress(task: any, index: number): number {
    return this.subTaskProgress.get(task.title)?.get(index)?.progress || 0;
  }

  getSubStatus(task: any, index: number): string {
    return (
      this.subTaskProgress.get(task.title)?.get(index)?.status || 'Planned'
    );
  }

  onSubProgressChange(task: any, index: number, event: any) {
    const progress = +event.target.value;
    const status =
      progress === 100 ? 'Done' : progress > 0 ? 'In Progress' : 'Planned';

    if (!this.subTaskProgress.has(task.title)) {
      this.subTaskProgress.set(task.title, new Map());
    }
    this.subTaskProgress.get(task.title)!.set(index, { progress, status });

    this.updateParentProgress(task);

    this.progressService
      .updateTask(task.id, this.getParentProgress(task), task.status)
      .subscribe({ error: (e) => console.error('Save failed', e) });

    this.ganttService.setTasks(this.tasks);
    this.saveSubProgress();
  }

  getParentProgress(task: any): number {
    const subs = this.subTaskProgress.get(task.title);
    if (!subs || subs.size === 0) return task.progress || 0;
    const total = Array.from(subs.values()).reduce(
      (sum, s) => sum + s.progress,
      0,
    );
    return Math.round(total / subs.size);
  }

  updateParentProgress(task: any) {
    const avg = this.getParentProgress(task);
    task.progress = avg;
    task.status = avg === 100 ? 'Done' : avg > 0 ? 'In Progress' : 'Planned';
  }

  openSubModal(task: any, index: number) {
    const subs = this.getSubtasks(task.description);
    this.selectedTask = {
      id: task.id,
      title: task.title,
      subTitle: subs[index],
      subIndex: index,
      progress: this.getSubProgress(task, index),
      status: this.getSubStatus(task, index),
      parentTask: task,
    };
    this.showModal = true;
  }

  saveModal() {
    if (!this.selectedTask) return;

    const { parentTask, subIndex, progress, status } = this.selectedTask;

    if (!this.subTaskProgress.has(parentTask.title)) {
      this.subTaskProgress.set(parentTask.title, new Map());
    }
    this.subTaskProgress
      .get(parentTask.title)!
      .set(subIndex, { progress, status });

    this.updateParentProgress(parentTask);

    this.progressService
      .updateTask(
        parentTask.id,
        this.getParentProgress(parentTask),
        parentTask.status,
      )
      .subscribe({ error: (e) => console.error('Save failed', e) });

    this.ganttService.setTasks(this.tasks);
    this.saveSubProgress();
    this.closeModal();
  }

  saveSubProgress(): void {
    const obj: any = {};
    this.subTaskProgress.forEach((innerMap, title) => {
      obj[title] = {};
      innerMap.forEach((val, index) => {
        obj[title][index] = val;
      });
    });
    localStorage.setItem(this.SUB_PROGRESS_KEY, JSON.stringify(obj));
  }

  restoreSubProgress(): void {
    const stored = localStorage.getItem(this.SUB_PROGRESS_KEY);
    if (!stored) return;

    try {
      const obj = JSON.parse(stored);
      this.subTaskProgress.clear();
      Object.keys(obj).forEach((title) => {
        const innerMap = new Map<
          number,
          { progress: number; status: string }
        >();
        Object.keys(obj[title]).forEach((index) => {
          innerMap.set(Number(index), obj[title][index]);
        });
        this.subTaskProgress.set(title, innerMap);
      });

      this.tasks.forEach((task) => {
        if (this.subTaskProgress.has(task.title)) {
          this.updateParentProgress(task);
        }
      });
    } catch (e) {
      console.error('Failed to restore sub progress', e);
    }
  }

  // Add this method
  sortTasksByDate(tasks: any[]): any[] {
    return [...tasks].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );
  }

  loadProjectSummary() {
    const projectId = this.ganttService.getProjectId();
    if (!projectId) return;

    this.progressService.getProjectSummary(projectId).subscribe({
      next: (res: any) => {
        this.projectSummary = res;
        console.log('✅ Project summary:', res);
      },
      error: (e) => console.warn('Could not load summary:', e),
    });
  }

  getHealthClass(health: string): string {
    switch (health) {
      case 'ON_TRACK':
        return 'health-good';
      case 'AT_RISK':
        return 'health-risk';
      case 'BEHIND':
        return 'health-bad';
      default:
        return '';
    }
  }

  getHealthLabel(health: string): string {
    switch (health) {
      case 'ON_TRACK':
        return '✅ On Track';
      case 'AT_RISK':
        return '⚠️ At Risk';
      case 'BEHIND':
        return '🔴 Behind Schedule';
      default:
        return '---';
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedTask = null;
  }
}
