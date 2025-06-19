import { TestBed } from '@angular/core/testing';
import { RefundService } from './refund.service';
import { ApiClientService } from '../api/httpclient';
import { of } from 'rxjs';
import { Refund } from '../../shared/interfaces/refund';
import { Attachment } from '../../shared/interfaces/attachment';

describe('RefundService', () => {
  let service: RefundService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['get', 'post']);
    TestBed.configureTestingModule({
      providers: [
        RefundService,
        { provide: ApiClientService, useValue: spy }
      ]
    });
    service = TestBed.inject(RefundService);
    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener todos los reembolsos', () => {
    const mockRefunds: Refund[] = [{ id: '1' } as Refund];
    apiClientSpy.get.and.returnValue(of(mockRefunds));
    service.getAll().subscribe(result => {
      expect(result).toEqual(mockRefunds);
    });
    expect(apiClientSpy.get).toHaveBeenCalledWith('refund-request');
  });

  it('debe obtener un reembolso por id', () => {
    const mockRefund: Refund = { id: '1' } as Refund;
    apiClientSpy.get.and.returnValue(of(mockRefund));
    service.getById('1').subscribe(result => {
      expect(result).toEqual(mockRefund);
    });
    expect(apiClientSpy.get).toHaveBeenCalledWith('refund-request/1');
  });

  it('debe crear un reembolso', () => {
    const mockRefund: Refund = { id: '1' } as Refund;
    apiClientSpy.post.and.returnValue(of(mockRefund));
    service.create(mockRefund).subscribe(result => {
      expect(result).toEqual(mockRefund);
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('refund-request', mockRefund);
  });

  it('debe aprobar un reembolso', () => {
    apiClientSpy.post.and.returnValue(of(void 0));
    service.approve('1').subscribe(result => {
      expect(result).toBeUndefined();
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('refund-request/approve/1', {});
  });

  it('debe rechazar un reembolso', () => {
    apiClientSpy.post.and.returnValue(of(void 0));
    service.reject('1', 'motivo').subscribe(result => {
      expect(result).toBeUndefined();
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('refund-request/reject', { id: '1', reason: 'motivo' });
  });

  it('debe actualizar los attachments', () => {
    const attachments: Attachment[] = [{ id: 'a1' } as Attachment];
    apiClientSpy.post.and.returnValue(of(void 0));
    service.updateAttachments('1', attachments).subscribe(result => {
      expect(result).toBeUndefined();
    });
    expect(apiClientSpy.post).toHaveBeenCalledWith('refund-request/attachments/1', attachments);
  });
}); 