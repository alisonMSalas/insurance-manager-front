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







}