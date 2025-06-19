import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { PaymentsService } from './payments.service';
import { ApiClientService } from '../../core/api/httpclient';
import { PaymentUrl } from '../../shared/interfaces/payment-url-dto';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let mockApiClientService: jasmine.SpyObj<ApiClientService>;

  const mockPaymentUrl: PaymentUrl = {
    url: 'https://checkout.stripe.com/pay/cs_test_1234567890'
  };

  beforeEach(() => {
    mockApiClientService = jasmine.createSpyObj('ApiClientService', ['post']);

    TestBed.configureTestingModule({
      providers: [
        PaymentsService,
        { provide: ApiClientService, useValue: mockApiClientService }
      ]
    });
    
    service = TestBed.inject(PaymentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createCheckoutSession', () => {
    it('debe crear sesión de checkout exitosamente', () => {
      const contractId = 'contract-123';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId).subscribe(result => {
        expect(result).toEqual(mockPaymentUrl);
        expect(result.url).toBe('https://checkout.stripe.com/pay/cs_test_1234567890');
      });

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/contract-123',
        {}
      );
    });

    it('debe llamar al endpoint correcto con el contractId', () => {
      const contractId = 'test-contract-id';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId);

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/test-contract-id',
        {}
      );
    });

    it('debe manejar error del API client', () => {
      const contractId = 'contract-123';
      const error = new Error('Error de pago');
      mockApiClientService.post.and.returnValue(throwError(() => error));

      service.createCheckoutSession(contractId).subscribe({
        next: () => fail('Debería haber fallado'),
        error: (err) => {
          expect(err).toBe(error);
        }
      });

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/contract-123',
        {}
      );
    });

    it('debe manejar contractId vacío', () => {
      const contractId = '';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId);

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/',
        {}
      );
    });

    it('debe manejar contractId con caracteres especiales', () => {
      const contractId = 'contract-123_456@test';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId);

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/contract-123_456@test',
        {}
      );
    });

    it('debe manejar contractId muy largo', () => {
      const contractId = 'a'.repeat(1000);
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId);

      expect(mockApiClientService.post).toHaveBeenCalledWith(
        `payment/create-session/${contractId}`,
        {}
      );
    });

    it('debe retornar Observable con PaymentUrl', () => {
      const contractId = 'contract-123';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      const result = service.createCheckoutSession(contractId);

      expect(result).toBeDefined();
      result.subscribe(paymentUrl => {
        expect(paymentUrl).toEqual(mockPaymentUrl);
        expect(paymentUrl.url).toBeDefined();
        expect(typeof paymentUrl.url).toBe('string');
      });
    });

    it('debe manejar diferentes URLs de pago', () => {
      const contractId = 'contract-123';
      const differentPaymentUrl: PaymentUrl = {
        url: 'https://paypal.com/checkout/abc123'
      };
      mockApiClientService.post.and.returnValue(of(differentPaymentUrl));

      service.createCheckoutSession(contractId).subscribe(result => {
        expect(result).toEqual(differentPaymentUrl);
        expect(result.url).toBe('https://paypal.com/checkout/abc123');
      });
    });

    it('debe manejar URL de pago vacía', () => {
      const contractId = 'contract-123';
      const emptyPaymentUrl: PaymentUrl = {
        url: ''
      };
      mockApiClientService.post.and.returnValue(of(emptyPaymentUrl));

      service.createCheckoutSession(contractId).subscribe(result => {
        expect(result).toEqual(emptyPaymentUrl);
        expect(result.url).toBe('');
      });
    });

    it('debe llamar al API client solo una vez por llamada', () => {
      const contractId = 'contract-123';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId);

      expect(mockApiClientService.post).toHaveBeenCalledTimes(1);
    });

    it('debe manejar múltiples llamadas consecutivas', () => {
      const contractId1 = 'contract-1';
      const contractId2 = 'contract-2';
      mockApiClientService.post.and.returnValue(of(mockPaymentUrl));

      service.createCheckoutSession(contractId1);
      service.createCheckoutSession(contractId2);

      expect(mockApiClientService.post).toHaveBeenCalledTimes(2);
      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/contract-1',
        {}
      );
      expect(mockApiClientService.post).toHaveBeenCalledWith(
        'payment/create-session/contract-2',
        {}
      );
    });
  });
});
