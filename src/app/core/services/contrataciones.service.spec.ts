import { TestBed } from '@angular/core/testing';

import { ContratacionesService } from './contrataciones.service';
import { ApiClientService } from '../api/httpclient';
import { of } from 'rxjs';
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

  it('should call api.post on savePayment', () => {
    const payment = { amount: 100 };
    apiClientSpy.post.and.returnValue(of(payment));
    service.savePayment(payment).subscribe(result => {
      expect(result).toEqual(payment);
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('payment', payment);
  });

  it('should call api.post on uploadDocuments', () => {
    const file = new File([''], 'test.pdf');
    const documents = [{ fileName: 'test.pdf', fileData: file }];
    const contractId = '123';
    const response = { success: true };
    apiClientSpy.post.and.returnValue(of(response));
    service.uploadDocuments(documents, contractId).subscribe(result => {
      expect(result).toEqual(response);
    });
    expect(apiClientSpy.post).toHaveBeenCalled();
    const formDataArg = apiClientSpy.post.calls.mostRecent().args[1] as FormData;
    expect(formDataArg.has('files')).toBeTrue();
    expect(formDataArg.get('contractId')).toBe(contractId);
  });

  it('should call api.post on saveBeneficiaries', () => {
    const beneficiaries = [{ name: 'John', relationship: 'Son', percentage: 50 }];
    const contractId = '123';
    const response = { success: true };
    apiClientSpy.post.and.returnValue(of(response));
    service.saveBeneficiaries(beneficiaries, contractId).subscribe(result => {
      expect(result).toEqual(response);
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith(`beneficiaries/${contractId}`, beneficiaries);
  });

  it('should call api.post on saveSignature and convert signature', () => {
    const signatureArray = new Uint8Array([1, 2, 3]).buffer;
    const signatureData = {
      signature: signatureArray,
      expirationDate: '2024-12-31',
      clientId: 'abc'
    };
    const response = { success: true };
    apiClientSpy.post.and.returnValue(of(response));
    service.saveSignature(signatureData).subscribe(result => {
      expect(result).toEqual(response);
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('signature', {
      ...signatureData,
      signature: [1, 2, 3]
    });
  });
});
