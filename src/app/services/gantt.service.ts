import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GanttService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getGantt(projectId: number) {
  return this.http.get(`${this.baseUrl}/gantt/smart/project/${projectId}`);
}
}
