import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../api/httpclient';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private api:ApiClientService) { }
  
  create(user: any) {
   
    return this.api.post('user',user)
 }
  getAll() {
    return this.api.get('user')
  }

  getById(id: number) {
    return this.api.get(`user/${id}`)
  }

  update(user: any) {
    return this.api.put(`user/${user.id}`, user)
  }

  delete(id: number) {
    return this.api.delete(`user/${id}`)
  }
}
