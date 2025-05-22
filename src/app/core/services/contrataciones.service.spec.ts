import { TestBed } from '@angular/core/testing';

import { ContratacionesService } from './contrataciones.service';
import { ApiClientService } from '../api/httpclient';
import { Observable, of, throwError } from 'rxjs';
import { Contract } from '../../shared/interfaces/contract';

describe('ContratacionesService', () => {
  let service: ContratacionesService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['post', 'get', 'put', 'delete']);
    TestBed.configureTestingModule({
      providers: [
        ContratacionesService,
        { provide: ApiClientService, useValue: spy }
      ]
    });
    service = TestBed.inject(ContratacionesService);
    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call api.post on create', () => {
    const contract = { id: '1', name: 'Test' } as Contract;
    apiClientSpy.post.and.returnValue(of(contract));
    service.create(contract).subscribe(result => {
      expect(result).toEqual(contract);
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('contract', contract);
  });

  it('should call api.get on getAll', () => {
    const contracts = [{ id: '1', name: 'Test' }] as unknown as Contract[];
    apiClientSpy.get.and.returnValue(of(contracts));
    service.getAll().subscribe(result => {
      expect(result).toEqual(contracts);
    });
    expect(apiClientSpy.get).toHaveBeenCalledWith('contract');
  });

  it('should call api.get on getById', () => {
    const contract = { id: '1', name: 'Test' } as Contract;
    apiClientSpy.get.and.returnValue(of(contract));
    service.getById('1').subscribe(result => {
      expect(result).toEqual(contract);
    });
    expect(apiClientSpy.get).toHaveBeenCalledWith('contract/1');
  });

  it('should call api.put on update', () => {
    const contract = { id: '1', name: 'Updated' } as Contract;
    apiClientSpy.put.and.returnValue(of(contract));
    service.update(contract).subscribe(result => {
      expect(result).toEqual(contract);
    });
    expect(apiClientSpy.put).toHaveBeenCalledWith('contract', contract);
  });

  it('should call api.delete on delete', () => {
    apiClientSpy.delete.and.returnValue(of(undefined));
    service.delete('1').subscribe(result => {
      expect(result).toBeUndefined();
    });
    expect(apiClientSpy.delete).toHaveBeenCalledWith('contract/1');
  });

  // === TESTS PARA uploadDocuments ===

  it('should read files as base64, call api.post for each document and return all responses', (done) => {
    const contractId = '123';
    const fileContent = 'dummy content';
    const base64String = btoa(fileContent); // base64 real del contenido
    const dataUrl = `data:application/pdf;base64,${base64String}`;

    const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' });
    const documents = [{ fileName: 'test.pdf', fileData: file }];

    // Mock para FileReader
    spyOn(window as any, 'FileReader').and.callFake(() => {
      const reader: any = {
        onload: null,
        onerror: null,
        result: null,
        readAsDataURL: function () {
          // Simula lectura exitosa y dispara onload con dataUrl
          this.result = dataUrl;
          if (typeof this.onload === 'function') {
            this.onload({ target: { result: this.result } });
          }
        }
      };
      return reader;
    });

    // ApiClient mock - verifica url y payload
    apiClientSpy.post.and.callFake(<T>(url: string, payload: any): Observable<T> => {
      expect(url).toBe(`contract/${contractId}/attachment`);
      expect(payload.fileName).toBe('test.pdf');
      expect(payload.fileData).toBe(base64String);
      return of({ success: true } as unknown as T);
    });

    service.uploadDocuments(documents, contractId).subscribe({
      next: results => {
        expect(results.length).toBe(1);
        expect(results[0]).toEqual({ success: true });
        done();
      },
      error: () => fail('Expected successful uploadDocuments call')
    });
  });

  it('should call observer.error if FileReader fails', (done) => {
    const contractId = '123';
    const file = new File(['dummy'], 'fail.pdf');
    const documents = [{ fileName: 'fail.pdf', fileData: file }];

    spyOn(window as any, 'FileReader').and.callFake(() => {
      const reader: any = {
        onload: null,
        onerror: null,
        readAsDataURL: function () {
          if (typeof this.onerror === 'function') {
            this.onerror(new Error('FileReader error'));
          }
        }
      };
      return reader;
    });

    service.uploadDocuments(documents, contractId).subscribe({
      next: () => fail('Expected error due to FileReader failure'),
      error: err => {
        expect(err).toBeTruthy();
        done();
      }
    });
  });

  it('should call observer.error if api.post returns error', (done) => {
    const contractId = '123';
    const fileContent = 'dummy content';
    const base64String = btoa(fileContent);
    const dataUrl = `data:application/pdf;base64,${base64String}`;
    const file = new File([fileContent], 'test.pdf', { type: 'application/pdf' });
    const documents = [{ fileName: 'test.pdf', fileData: file }];

    spyOn(window as any, 'FileReader').and.callFake(() => {
      const reader: any = {
        onload: null,
        onerror: null,
        result: null,
        readAsDataURL: function () {
          this.result = dataUrl;
          if (typeof this.onload === 'function') {
            this.onload({ target: { result: this.result } });
          }
        }
      };
      return reader;
    });

    const errorResponse = new Error('API post error');
    apiClientSpy.post.and.returnValue(throwError(() => errorResponse));

    service.uploadDocuments(documents, contractId).subscribe({
      next: () => fail('Expected error from api.post'),
      error: err => {
        expect(err).toBe(errorResponse);
        done();
      }
    });
  });
  it('should emit error if FileReader triggers onerror', (done) => {
    const contractId = '123';
    const fileContent = 'dummy content';
    const fileName = 'error.pdf';
    const file = new File([fileContent], fileName, { type: 'application/pdf' });
    const documents = [{ fileName, fileData: file }];

    spyOn(window as any, 'FileReader').and.callFake(() => {
      const reader = {
        onload: null as ((e: any) => void) | null,
        onerror: null as ((error: any) => void) | null,
        readAsDataURL: function () {
          // Simula un error llamando a onerror
          if (this.onerror) {
            this.onerror(new Error('FileReader error'));
          }
        }
      };
      return reader;
    });

    service.uploadDocuments(documents, contractId).subscribe({
      next: () => fail('Expected error due to FileReader onerror'),
      error: err => {
        expect(err).toBeTruthy();
        expect(err.message).toBe('FileReader error');
        done();
      }
    });
  });
  

});
