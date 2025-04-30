import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../api/httpclient';

export interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(private api: ApiClientService) {}

  create(user: any) {
    return this.api.post('auth/register', user);
  }

  getAll(): Observable<User[]> {
    return this.api.get('user');
  }

  getById(id: string) {
    return this.api.get(`user/${id}`);
  }

  update(user: any) {
    return this.api.put(`user/${user.id}`, user);
  }

  delete(id: string) {
    return this.api.delete(`user/${id}`);
  }
}