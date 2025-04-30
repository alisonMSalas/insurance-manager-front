import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Insurance } from '../../shared/interfaces/insurance';
import { ApiClientService } from '../../core/api/httpclient';

@Injectable({
  providedIn: 'root'
})
export class SegurosService {
  private endpoint = 'insurance';

  constructor(private apiClient: ApiClientService) { }

  getAll(): Observable<Insurance[]> {
    return this.apiClient.get<Insurance[]>(this.endpoint);
  }

  getById(id: string): Observable<Insurance> {
    return this.apiClient.get<Insurance>(`${this.endpoint}/${id}`);
  }

  save(insurance: Insurance): Observable<Insurance> {
    return this.apiClient.post<Insurance>(this.endpoint, insurance);
  }

  update(id: string, insurance: Insurance): Observable<Insurance> {
    return this.apiClient.put<Insurance>(`${this.endpoint}/${id}`, insurance);
  }

  updateStatus(id: string, status: boolean): Observable<Insurance> {
    return this.apiClient.put<Insurance>(`${this.endpoint}/status/${id}?status=${status}`, null);
  }

  delete(id: string): Observable<void> {
    return this.apiClient.delete<void>(`${this.endpoint}/${id}`);
  }
}
