import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TeamService } from '../../services/team/team.service';
import { GanttService } from '../../services/gantt.service';
import { Router } from '@angular/router';

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

  // Add member
  newEmail = '';
  newName = '';
  addMode: 'email' | 'manual' = 'email';
  addError = '';
  addSuccess = '';

  // Assign task
  selectedTaskId = '';
  selectedMember: any = null;
  showAssignModal = false;
  assignSuccess = '';

  loading = false;

  constructor(
    private teamService: TeamService,
    private ganttService: GanttService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const stored = localStorage.getItem('planova_project_id');
    if (stored) {
      this.projectId = stored;
      this.loadMembers();
      this.loadTasks();
    }
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
}
