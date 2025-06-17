import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/httpclient';
import { Observable } from 'rxjs';
import { Refund } from '../../shared/interfaces/refund';
import { Attachment } from '../../shared/interfaces/attachment';

@Injectable({
  providedIn: 'root'
})
export class RefundService {
  constructor(private readonly api: ApiClientService) {}

  getAll(): Observable<Refund[]> {
    return this.api.get('refund-request');
  }

  getById(id: string): Observable<Refund> {
    return this.api.get(`refund-request/${id}`);
  }

  create(refund: Refund): Observable<Refund> {
    return this.api.post('refund-request', refund);
  }

  approve(id: string): Observable<void> {
    return this.api.post(`refund-request/approve/${id}`, {});
  }

  reject(id: string, reason: string): Observable<void> {
    return this.api.post('refund-request/reject', { id, reason });
  }

  updateAttachments(id: string, attachments: Attachment[]): Observable<void> {
    return this.api.post(`refund-request/attachments/${id}`, attachments);
  }
}