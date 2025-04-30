import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import { ApiClientService } from '../../shared/api/httpclient';


@Injectable({
  providedIn: 'root'
})
export class SegurosService {


  constructor(private api:ApiClientService) { 
    
  }

  create(insurance: any) {
    return this.api.post('insurance',insurance);
  }
  getAll() {
    return this.api.get('insurance');
  }
  update(insurance: any) {
    return this.api.put('insurance',insurance);
  }

  delete(id: number) {
    return this.api.delete(`insurance?insuranceId=${id}`)
  }

}
