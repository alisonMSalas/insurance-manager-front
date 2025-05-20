import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;

  constructor(private readonly http: HttpClient) { }

  login(credentials: { email: string; password: string }): Observable<string> {
    return this.http.post<string>(`${this.apiUrl}/login`, credentials, { responseType: 'text' as 'json' });
  }
}
