import { Injectable } from '@angular/core';
import { ApiClientService } from '../api/httpclient';
import { Client } from '../../shared/interfaces/client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientsService {
 constructor(private readonly api: ApiClientService) {}

  create(client: Client): Observable<Client> {
    return this.api.post('client', client);
  }

  getAll(): Observable<Client[]> {
    return this.api.get('client');
  }

  getById(id: string): Observable<Client> {
    return this.api.get(`client/${id}`);
  }

  update(client: Client): Observable<Client> {
    return this.api.put('client', client);
  }

  delete(id: string): Observable<void> {
    return this.api.delete(`client/${id}`);
  }

  getByIdentificationNumber(identificationNumber: string): Observable<Client> {
    return this.api.get(`client/identification/${identificationNumber}`);
  }
}