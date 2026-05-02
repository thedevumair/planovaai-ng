import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class GanttService {
  private baseUrl = 'http://localhost:8080/api';
  private tasks: any[] = [];
  private model: string = '';

  private readonly TASKS_KEY = 'planova_tasks';
  private readonly MODEL_KEY = 'planova_model';

  constructor(private http: HttpClient) {}

  // Tasks
  setTasks(tasks: any[]): void {
    this.tasks = tasks;
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  getTasks(): any[] {
    if (this.tasks.length > 0) return this.tasks;
    const stored = localStorage.getItem(this.TASKS_KEY);
    if (stored) {
      try {
        this.tasks = JSON.parse(stored);
      } catch {
        this.tasks = [];
      }
    }
    return this.tasks;
  }

  // Model
  setModel(model: string): void {
    this.model = model;
    localStorage.setItem(this.MODEL_KEY, model);
  }

  getModel(): string {
    if (this.model) return this.model;
    return localStorage.getItem(this.MODEL_KEY) || '';
  }

  // Clear everything on logout or new analysis
  clearAll(): void {
    this.tasks = [];
    this.model = '';
    localStorage.removeItem(this.TASKS_KEY);
    localStorage.removeItem(this.MODEL_KEY);
  }

  // HTTP calls
  uploadSrs(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.baseUrl}/model/full-analysis`, formData);
  }

  getGantt(projectId: string) {
    // String UUID now
    return this.http.get(`${this.baseUrl}/gantt/smart/project/${projectId}`);
  }
}
