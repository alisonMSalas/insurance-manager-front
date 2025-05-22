import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/httpclient';
import { Contract } from '../../shared/interfaces/contract';
import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {
  constructor(private readonly api: ApiClientService) { }

  create(contract: Contract): Observable<Contract> {
    return this.api.post('contract', contract);
  }

  getAll(): Observable<Contract[]> {
    return this.api.get('contract');
  }

  getById(id: string): Observable<Contract> {
    return this.api.get(`contract/${id}`);
  }

  update(contract: Contract): Observable<Contract> {
    return this.api.put('contract', contract);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`contract/${id}`);
  }


  uploadDocuments(documents: { fileName: string; fileData: File }[], contractId: string): Observable<any[]> {
    const uploads = documents.map(doc => {
      const formData = new FormData();
      formData.append('file', doc.fileData, doc.fileName);
      return this.api.post(`contracts/${contractId}/attachment`, formData);
    });
    return forkJoin(uploads);
  }



}