import { Injectable } from '@angular/core';
import { ApiClientService } from '../../shared/api/httpclient';
import { Observable } from 'rxjs';  // Importación de Observable
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/auth';
  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }): Observable<string> {
    return this.http.post(`${this.apiUrl}/login`, credentials, {
      responseType: 'text' as const
    });
  }
  
  register(userData: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
}
