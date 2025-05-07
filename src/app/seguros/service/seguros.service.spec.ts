import { TestBed } from '@angular/core/testing';
import { ApiClientService } from '../../core/api/httpclient';
import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';
import { of } from 'rxjs';
import { SegurosService } from './seguros.service';

describe('SegurosService', () => {
  let service: SegurosService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockInsurance: Insurance = {
    id: '1',
    name: 'Test Insurance',
    type: InsuranceType.LIFE,
    description: 'Test Description',
    coverage: 1000,
    deductible: 100,
    paymentAmount: 50,
    paymentPeriod: PaymentPeriod.MONTHLY,
    active: true
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      providers: [
        SegurosService,
        { provide: ApiClientService, useValue: spy }
      ]
    });

    service = TestBed.inject(SegurosService);
    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all insurances', () => {
    const mockInsurances: Insurance[] = [mockInsurance];
    apiClientSpy.get.and.returnValue(of(mockInsurances));

    service.getAll().subscribe(insurances => {
      expect(insurances).toEqual(mockInsurances);
      expect(apiClientSpy.get).toHaveBeenCalledWith('insurance');
    });
  });

  it('should get insurance by id', () => {
    apiClientSpy.get.and.returnValue(of(mockInsurance));

    service.getById('1').subscribe(insurance => {
      expect(insurance).toEqual(mockInsurance);
      expect(apiClientSpy.get).toHaveBeenCalledWith('insurance/1');
    });
  });

  it('should save insurance', () => {
    const newInsurance: Insurance = { ...mockInsurance, id: undefined };
    apiClientSpy.post.and.returnValue(of(mockInsurance));

    service.save(newInsurance).subscribe(insurance => {
      expect(insurance).toEqual(mockInsurance);
      expect(apiClientSpy.post).toHaveBeenCalledWith('insurance', newInsurance);
    });
  });

  it('should update insurance', () => {
    apiClientSpy.put.and.returnValue(of(mockInsurance));

    service.update('1', mockInsurance).subscribe(insurance => {
      expect(insurance).toEqual(mockInsurance);
      expect(apiClientSpy.put).toHaveBeenCalledWith('insurance/1', mockInsurance);
    });
  });

  it('should update insurance status', () => {
    apiClientSpy.put.and.returnValue(of(mockInsurance));

    service.updateStatus('1', true).subscribe(insurance => {
      expect(insurance).toEqual(mockInsurance);
      expect(apiClientSpy.put).toHaveBeenCalledWith('insurance/status/1?status=true', null);
    });
  });

  it('should delete insurance', () => {
    apiClientSpy.delete.and.returnValue(of(void 0));

    service.delete('1').subscribe(() => {
      expect(apiClientSpy.delete).toHaveBeenCalledWith('insurance/1');
    });
  });
});
