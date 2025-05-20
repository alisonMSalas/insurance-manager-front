import { inject, Injectable,PLATFORM_ID  } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private  readonly baseUrl = 'http://localhost:8080';
  private readonly token = '';
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly  http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = isPlatformBrowser(this.platformId)
      ? localStorage.getItem('token')
      : null;

    const headersConfig: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headersConfig['Authorization'] = `Bearer ${token}`;
    }

    const headers = new HttpHeaders(headersConfig);

    console.log('→ Authorization header:', headers.get('Authorization'));
    console.log('→ All header keys:', headers.keys());

    return headers;
  }

  get<T>(endpoint: string): Observable<T> {
    console.log(this.getHeaders());
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body, { headers: this.getHeaders() });
  }

  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body, { headers: this.getHeaders() });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`, { headers: this.getHeaders() });
  }

  getCurrentUserEmail(): string | null {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return null; // Devuelve null si no hay token en localStorage
      }
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const parsedPayload = JSON.parse(decodedPayload);
      return parsedPayload.sub || null;
    } catch (error) {
      console.error('Error al decodificar el token:', error);
      return null;
    }
  }
}