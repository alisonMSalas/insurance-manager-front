import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/httpclient';

export interface LoginRequest {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly endpoint = 'auth';

  constructor(private apiClient: ApiClientService) { }

  login(creds: LoginRequest): Observable<string> {
    return this.apiClient.post<string>(`${this.endpoint}/login`, creds);
  }
}
