import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private api = 'http://localhost:8080/api/model';

  constructor(private http: HttpClient) {}

  uploadSRS(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    // ✅ JWT interceptor adds Authorization header automatically
    return this.http.post(`${this.api}/full-analysis`, formData);
  }
}
