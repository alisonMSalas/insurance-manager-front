import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiClientService {
  private baseUrl = 'http://localhost:8080';
  private token = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjoiQURNSU4iLCJzdWIiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNzQ1OTg5NjU4LCJleHAiOjE3NDYwMjU2NTh9.T8aNgjT_Ys9OgK1431fKLoYv81OPvSk4JZB-WF2Mavc';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    });
  }

  get<T>(endpoint: string): Observable<T> {
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
}