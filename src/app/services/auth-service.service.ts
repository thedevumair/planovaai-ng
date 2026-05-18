import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthServiceService {
  private api = 'http://localhost:8080/api/auth';

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {}

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.api}/login`, { email, password });
  }

  saveSession(data: any) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);
    localStorage.setItem('userName', data.name);
    localStorage.setItem('userRole', data.role || 'DEVELOPER');
  }

  getRole(): string {
    return localStorage.getItem('userRole') || 'DEVELOPER';
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserName(): string {
    return localStorage.getItem('userName') || 'User';
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    this.router.navigate(['/login']);
  }
}
