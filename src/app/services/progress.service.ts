import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProgressService {
  private api = 'http://localhost:8080/api/progress';

  constructor(private http: HttpClient) {}

  updateTask(id: string, progress: number, status: string): Observable<any> {
    return this.http.put(`${this.api}/update`, { id, progress, status });
  }

  getMyTasks(): Observable<any> {
    // JWT interceptor handles auth header
    return this.http.get(`${this.api}/my-tasks`);
  }

  getProjectSummary(projectId: string): Observable<any> {
    return this.http.get(`${this.api}/project-summary/${projectId}`);
  }
}
