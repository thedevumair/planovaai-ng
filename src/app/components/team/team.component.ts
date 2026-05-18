import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team/team.service';
import { GanttService } from '../../services/gantt.service';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-team',
  imports: [CommonModule, FormsModule],
  templateUrl: './team.component.html',
  styleUrl: './team.component.scss',
})
export class TeamComponent {
  projectId: string = '';
  members: any[] = [];
  tasks: any[] = [];
  noProject: boolean = false;

  newEmail = '';
  newName = '';
  addMode: 'email' | 'manual' = 'email';
  addError = '';
  addSuccess = '';

  selectedTaskId = '';
  selectedMember: any = null;
  showAssignModal = false;
  assignSuccess = '';

  loading = false;
  devStats: any[] = [];

  constructor(
    private teamService: TeamService,
    private ganttService: GanttService,
    private router: Router,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    // ✅ Step 1 — try memory first (fastest)
    const memoryProjectId = this.ganttService.getProjectId();
    if (memoryProjectId) {
      this.projectId = memoryProjectId;
      this.loadMembers();
      this.loadTasks();
      this.loadGitHubStats();
      return;
    }

    // ✅ Step 2 — always load from DB (auth via JWT)
    this.loadGitHubStats();
  }

  loadProjectFromDb() {
    this.loading = true;
    this.http
      .get<any>('http://localhost:8080/api/progress/my-tasks')
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res.projectId) {
            this.projectId = res.projectId;
            this.ganttService.setProjectId(res.projectId); // cache in memory
            this.loadMembers();
            this.loadTasks();
          } else {
            this.noProject = true;
          }
        },
        error: (e) => {
          this.loading = false;
          console.error('Failed to load project:', e);
          this.noProject = true;
        },
      });
  }

  loadMembers() {
    this.teamService.getMembers(this.projectId).subscribe({
      next: (res: any) => (this.members = res),
      error: (e) => console.error(e),
    });
  }

  loadTasks() {
    this.teamService.getProjectTasksWithAssignments(this.projectId).subscribe({
      next: (res: any) => (this.tasks = res),
      error: (e) => console.error(e),
    });
  }

  addMember() {
    this.addError = '';
    this.addSuccess = '';

    if (this.addMode === 'email') {
      if (!this.newEmail) {
        this.addError = 'Enter email';
        return;
      }
      this.teamService
        .addMemberByEmail(this.projectId, this.newEmail)
        .subscribe({
          next: () => {
            this.addSuccess = 'Member added successfully';
            this.newEmail = '';
            this.loadMembers();
          },
          error: (e) =>
            (this.addError = e.error?.error || 'Failed to add member'),
        });
    } else {
      if (!this.newName || !this.newEmail) {
        this.addError = 'Enter name and email';
        return;
      }
      this.teamService
        .addMemberManually(this.projectId, this.newName, this.newEmail)
        .subscribe({
          next: () => {
            this.addSuccess = 'Member added successfully';
            this.newName = '';
            this.newEmail = '';
            this.loadMembers();
          },
          error: (e) =>
            (this.addError = e.error?.error || 'Failed to add member'),
        });
    }
  }

  openAssignModal(task: any) {
    this.selectedTaskId = task.id;
    this.selectedMember = null;
    this.assignSuccess = '';
    this.showAssignModal = true;
  }

  selectMember(member: any) {
    this.selectedMember = member;
  }

  assignTask() {
    if (!this.selectedMember) return;

    this.teamService
      .assignTask(
        this.selectedTaskId,
        this.selectedMember.userId || '', // ✅ updated field name
        this.selectedMember.developerName,
        this.selectedMember.developerEmail,
      )
      .subscribe({
        next: () => {
          this.assignSuccess = 'Task assigned successfully!';
          this.loadTasks();
          setTimeout(() => {
            this.showAssignModal = false;
            this.assignSuccess = '';
          }, 1500);
        },
        error: (e) => console.error(e),
      });
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'done':
        return 'badge-done';
      case 'in progress':
        return 'badge-progress';
      default:
        return 'badge-planned';
    }
  }

  getMemberName(member: any): string {
    if (member.developerName && member.developerName.trim()) {
      return member.developerName;
    }
    if (member.userName && member.userName.trim()) {
      return member.userName;
    }
    if (member.developerEmail) {
      const prefix = member.developerEmail.split('@')[0];
      return prefix.charAt(0).toUpperCase() + prefix.slice(1);
    }
    return 'Unknown';
  }

  getMemberInitial(member: any): string {
    return this.getMemberName(member).charAt(0).toUpperCase();
  }

  unassignTask(assignmentId: string, event: Event) {
    event.stopPropagation();

    if (!confirm('Remove this assignment?')) return;

    this.teamService.unassignTask(assignmentId).subscribe({
      next: () => this.loadTasks(),
      error: (e) => console.error(e),
    });
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  loadGitHubStats() {
    console.log('🔍 Loading GitHub stats for projectId:', this.projectId);

    if (!this.projectId) {
      console.warn('❌ No projectId — skipping GitHub stats');
      return;
    }

    this.teamService.getGitHubStats(this.projectId).subscribe({
      next: (res: any) => {
        console.log('✅ GitHub stats response:', res);
        this.devStats = res;
      },
      error: (e) => {
        console.error('❌ GitHub stats error:', e);
      },
    });
  }

  getRiskClass(risk: string): string {
    switch (risk) {
      case 'ACTIVE':
        return 'risk-active';
      case 'MODERATE':
        return 'risk-moderate';
      case 'AT_RISK':
        return 'risk-high';
      case 'NO_ACTIVITY':
        return 'risk-none';
      default:
        return '';
    }
  }

  getRiskLabel(risk: string): string {
    switch (risk) {
      case 'ACTIVE':
        return '🟢 Active';
      case 'MODERATE':
        return '🟡 Moderate';
      case 'AT_RISK':
        return '🔴 At Risk';
      case 'NO_ACTIVITY':
        return '⚫ No Activity';
      default:
        return '---';
    }
  }

  getLastPushLabel(days: number): string {
    if (days < 0) return 'Never pushed';
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    return days + ' days ago';
  }
}
