// contrataciones.service.ts
import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/httpclient';
import { Contract } from '../../shared/interfaces/contract';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {
  private contratoIdSubject: BehaviorSubject<string>;
  contratoId$: Observable<string>;

  constructor(private readonly api: ApiClientService) {
    const storedId = localStorage.getItem('contratoId') || '';
    this.contratoIdSubject = new BehaviorSubject<string>(storedId);
    this.contratoId$ = this.contratoIdSubject.asObservable();
  }

  create(contract: Contract): Observable<Contract> {
    return this.api.post('contract', contract);
  }

  getAll(): Observable<Contract[]> {
    return this.api.get('contract');
  }

  getById(id: string): Observable<Contract> {
    return this.api.get(`contract/data/${id}`);
  }

  setContratoId(id: string): void {
    localStorage.setItem('contratoId', id);
    this.contratoIdSubject.next(id);
  }

  getContratoId(): string {
    return this.contratoIdSubject.getValue();
  }

  clearContratoId(): void {
    localStorage.removeItem('contratoId');
    this.contratoIdSubject.next('');
  }

  aprobarContrato(id: string): Observable<Contract> {
    return this.api.post(`contract/approve-contract/${id}`,{});
  }

}