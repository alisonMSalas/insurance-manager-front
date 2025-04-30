import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../api/httpclient';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  rol: string;
  active: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  
  constructor(private api:ApiClientService) { }
  
  create(user: any) {
    return this.api.post('user',user)
  }

  getAll(): Observable<User[]> {
    return this.api.get('user')
  }

  getCurrentUser(): Observable<User> {
    return this.api.get('user/current')
  }

  getById(id: string) {
    return this.api.get(`user/${id}`)
  }

  update(user: any) {
    return this.api.put(`user/${user.id}`, user)
  }

  delete(id: string) {
    return this.api.delete(`user/${id}`)
  }
}