import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeDebtService {

  private baseUrl = 'http://localhost:8080/api';

  constructor( private http: HttpClient ) { }

  getTimeDebt(projectId: number) {
  return this.http.get(`${this.baseUrl}/time-debt/project/${projectId}`);
}
}
