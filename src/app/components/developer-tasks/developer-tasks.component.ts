import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TeamService } from '../../services/team/team.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-developer-tasks',
  imports: [CommonModule, FormsModule],
  templateUrl: './developer-tasks.component.html',
  styleUrl: './developer-tasks.component.scss',
})
export class DeveloperTasksComponent {
  project: any = null;
  assignments: any[] = [];
  loading = false;
  saving: string = '';

  constructor(
    private teamService: TeamService,
    private router: Router,
  ) {
    const nav = this.router.getCurrentNavigation();
    this.project = nav?.extras?.state?.['project'];
  }

  ngOnInit(): void {
    this.loadMyAssignments();
  }

  loadMyAssignments() {
    this.loading = true;
    this.teamService.getMyAssignments().subscribe({
      next: (res: any) => {
        this.assignments = res;
        this.loading = false;
        console.log('Assignments:', res);
      },
      error: (e) => {
        console.error(e);
        this.loading = false;
      },
    });
  }

  // Update progress and status
  onProgressChange(assignment: any) {
    const progress = assignment.progress;
    const status =
      progress === 100 ? 'DONE' : progress > 0 ? 'IN_PROGRESS' : 'TODO';

    assignment.status = status;
    this.saving = assignment.assignmentId;

    this.teamService
      .updateAssignment(assignment.assignmentId, progress, status)
      .subscribe({
        next: () => {
          this.saving = '';
          console.log('✅ Progress saved');
        },
        error: (e) => {
          this.saving = '';
          console.error('Save failed', e);
        },
      });
  }

  // Update status directly from dropdown
  onStatusChange(assignment: any) {
    const status = assignment.status;
    const progress =
      status === 'DONE'
        ? 100
        : status === 'IN_PROGRESS'
          ? assignment.progress || 50
          : 0;

    assignment.progress = progress;

    this.saving = assignment.assignmentId;

    this.teamService
      .updateAssignment(assignment.assignmentId, progress, status)
      .subscribe({
        next: () => {
          this.saving = '';
        },
        error: (e) => {
          this.saving = '';
          console.error(e);
        },
      });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'DONE':
        return 'badge-done';
      case 'IN_PROGRESS':
        return 'badge-progress';
      default:
        return 'badge-todo';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'DONE':
        return '✅ Done';
      case 'IN_PROGRESS':
        return '🔄 In Progress';
      default:
        return '📋 To Do';
    }
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
