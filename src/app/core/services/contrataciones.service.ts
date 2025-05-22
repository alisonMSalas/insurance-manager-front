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
    return new Observable(observer => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];

        const payload = {
          fileName: doc.fileName,
          fileData: base64
        };

        this.api.post(`contract/${contractId}/attachment`, payload).subscribe({
          next: res => {
            observer.next(res);
            observer.complete();
          },
          error: err => observer.error(err)
        });
      };

      reader.onerror = error => observer.error(error);
      reader.readAsDataURL(doc.fileData);
    });
  });

  return forkJoin(uploads);
}



}