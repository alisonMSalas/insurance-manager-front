import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/httpclient';
import { Attachment } from '../../shared/interfaces/attachment';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AttachmentService {

  constructor(private readonly api: ApiClientService) { }

  uploadDocument(clientId: string, attachments: Attachment[]): Observable<void> {
    return this.api.post<void>(`client/attachments/${clientId}`, attachments);
  }
}