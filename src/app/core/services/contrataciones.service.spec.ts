import { TestBed } from '@angular/core/testing';

import { ContratacionesService } from './contrataciones.service';

describe('ContratacionesService', () => {
  let service: ContratacionesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContratacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
