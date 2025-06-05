import { Injectable } from '@angular/core';
import { ApiClientService } from '../../core/api/httpclient';
import { Observable } from 'rxjs';
import { PaymentUrl } from '../../shared/interfaces/payment-url-dto';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private readonly endpoint = 'payment';
  constructor(private readonly apiClient: ApiClientService) { }

  createCheckoutSession(contractId: string): Observable<PaymentUrl> {
    return this.apiClient.post<PaymentUrl>(`${this.endpoint}/create-session/${contractId}`, {});
  }
}
