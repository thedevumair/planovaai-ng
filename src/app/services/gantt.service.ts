import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GanttService {

  private baseUrl = 'http://localhost:8080/api';
  private tasks: any[] = [];
  constructor(private http: HttpClient) {}

  getGantt(projectId: number) {
  return this.http.get(`${this.baseUrl}/gantt/smart/project/${projectId}`);
}

setTasks(tasks: any[]) { this.tasks = tasks; }

getTasks() { return this.tasks; }

uploadSrs(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/model/full-analysis`, formData);
  }
}
