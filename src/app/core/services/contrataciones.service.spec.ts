import { TestBed } from '@angular/core/testing';
import { ContratacionesService } from './contrataciones.service';
import { ApiClientService } from '../api/httpclient';
import { Contract } from '../../shared/interfaces/contract';
import { Observable, of } from 'rxjs';

describe('ContratacionesService', () => {
  let service: ContratacionesService;
  let apiServiceSpy: jasmine.SpyObj<ApiClientService>;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  const mockContract: Contract = {
    id: '1',
    clientId: '123',
    status: 'PENDING',
    startDate: new Date().toISOString(),
    totalPaymentAmount: 1000,
    insuranceId: '456',
    active: true
  };

  beforeEach(() => {
    const apiSpy = jasmine.createSpyObj('ApiClientService', ['post', 'get']);
    apiServiceSpy = apiSpy;

    const storageSpy = jasmine.createSpyObj('localStorage', ['getItem', 'setItem', 'removeItem']);
    localStorageSpy = storageSpy;

    Object.defineProperty(window, 'localStorage', { value: storageSpy });

    TestBed.configureTestingModule({
      providers: [
        ContratacionesService,
        { provide: ApiClientService, useValue: apiSpy }
      ]
    });

    service = TestBed.inject(ContratacionesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('create', () => {
    it('should call api.post with correct parameters', () => {
      apiServiceSpy.post.and.returnValue(of(mockContract));

      service.create(mockContract);

      expect(apiServiceSpy.post).toHaveBeenCalledWith('contract', mockContract);
    });

    it('should return Observable with contract data', () => {
      apiServiceSpy.post.and.returnValue(of(mockContract));

      service.create(mockContract).subscribe(result => {
        expect(result).toEqual(mockContract);
      });
    });
  });

  describe('getAll', () => {
    it('should call api.get with correct endpoint', () => {
      const mockContracts = [mockContract];
      apiServiceSpy.get.and.returnValue(of(mockContracts));

      service.getAll();

      expect(apiServiceSpy.get).toHaveBeenCalledWith('contract');
    });

    it('should return Observable with array of contracts', () => {
      const mockContracts = [mockContract];
      apiServiceSpy.get.and.returnValue(of(mockContracts));

      service.getAll().subscribe(result => {
        expect(result).toEqual(mockContracts);
      });
    });
  });

  describe('getById', () => {
    it('should call api.get with correct endpoint and id', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockContract));

      service.getById(id);

      expect(apiServiceSpy.get).toHaveBeenCalledWith(`contract/data/${id}`);
    });

    it('should return Observable with contract data', () => {
      const id = '123';
      apiServiceSpy.get.and.returnValue(of(mockContract));

      service.getById(id).subscribe(result => {
        expect(result).toEqual(mockContract);
      });
    });
  });

  describe('contratoId management', () => {
    it('should initialize with stored contratoId', () => {
      const storedId = '123';
      localStorageSpy.getItem.and.returnValue(storedId);

      const newService = new ContratacionesService(apiServiceSpy);
      expect(newService.getContratoId()).toBe(storedId);
    });

    it('should set contratoId in localStorage and subject', () => {
      const id = '123';
      service.setContratoId(id);

      expect(localStorageSpy.setItem).toHaveBeenCalledWith('contratoId', id);
      expect(service.getContratoId()).toBe(id);
    });

    it('should clear contratoId from localStorage and subject', () => {
      service.clearContratoId();

      expect(localStorageSpy.removeItem).toHaveBeenCalledWith('contratoId');
      expect(service.getContratoId()).toBe('');
    });

    it('should emit contratoId changes through observable', (done) => {
      const id = '123';
      service.contratoId$.subscribe(value => {
        expect(value).toBe(id);
        done();
      });

      service.setContratoId(id);
    });
  });

  describe('aprobarContrato', () => {
    it('should call api.post with correct endpoint and id', () => {
      const id = '123';
      apiServiceSpy.post.and.returnValue(of(mockContract));

      service.aprobarContrato(id);

      expect(apiServiceSpy.post).toHaveBeenCalledWith(`contract/approve-contract/${id}`, {});
    });

    it('should return Observable with updated contract', () => {
      const id = '123';
      const updatedContract = { ...mockContract, status: 'APPROVED' };
      apiServiceSpy.post.and.returnValue(of(updatedContract));

      service.aprobarContrato(id).subscribe(result => {
        expect(result).toEqual(updatedContract);
      });
    });
  });

  describe('aprobarDocumentos', () => {
    it('should call api.post with correct endpoint and contractId', () => {
      const contractId = '123';
      apiServiceSpy.post.and.returnValue(of(mockContract));

      service.aprobarDocumentos(contractId);

      expect(apiServiceSpy.post).toHaveBeenCalledWith(`contract/approve-attachments/${contractId}`, {});
    });

    it('should return Observable with updated contract', () => {
      const contractId = '123';
      const updatedContract = { ...mockContract, status: 'DOCUMENTS_APPROVED' };
      apiServiceSpy.post.and.returnValue(of(updatedContract));

      service.aprobarDocumentos(contractId).subscribe(result => {
        expect(result).toEqual(updatedContract);
      });
    });
  });
});
