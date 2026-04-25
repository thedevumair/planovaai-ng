import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UploadService {

  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  uploadSRS(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post(`${this.baseUrl}/model/full-analysis`, formData);
  }
}
