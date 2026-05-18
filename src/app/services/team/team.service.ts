import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TeamService {
  private api = 'http://localhost:8080/api/team';

  constructor(private http: HttpClient) {}

  addMemberByEmail(projectId: string, email: string): Observable<any> {
    return this.http.post(`${this.api}/members/email`, { projectId, email });
  }

  addMemberManually(
    projectId: string,
    name: string,
    email: string,
  ): Observable<any> {
    return this.http.post(`${this.api}/members/manual`, {
      projectId,
      name,
      email,
    });
  }

  getMembers(projectId: string): Observable<any> {
    return this.http.get(`${this.api}/members/${projectId}`);
  }

  assignTask(
    taskId: string,
    assignedToId: string,
    assignedToName: string,
    assignedToEmail: string,
  ): Observable<any> {
    return this.http.post(`${this.api}/assign`, {
      taskId,
      assignedToId,
      assignedToName,
      assignedToEmail,
    });
  }

  getTaskAssignments(taskId: string): Observable<any> {
    return this.http.get(`${this.api}/assignments/task/${taskId}`);
  }

  getMyAssignments(): Observable<any> {
    return this.http.get(`${this.api}/assignments/my`);
  }

  getProjectTasksWithAssignments(projectId: string): Observable<any> {
    return this.http.get(`${this.api}/project/${projectId}/tasks`);
  }

  unassignTask(assignmentId: string): Observable<any> {
    return this.http.delete(`${this.api}/assign/${assignmentId}`);
  }

  getMyProjects(): Observable<any> {
    return this.http.get(`${this.api}/my-projects`);
  }

  getMyAssignedTasks(): Observable<any> {
    return this.http.get(`${this.api}/assignments/my`);
  }

  updateAssignment(
    assignmentId: string,
    progress: number,
    status: string,
  ): Observable<any> {
    return this.http.put(`${this.api}/assignments/${assignmentId}`, {
      progress,
      status,
    });
  }

  getGitHubStats(projectId: string): Observable<any> {
    return this.http.get(
      `http://localhost:8080/api/github/stats/project/${projectId}`,
    );
  }
}
