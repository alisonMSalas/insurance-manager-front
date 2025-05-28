import { HttpErrorResponse } from '@angular/common/http';
import { ErrorResponse } from '../interfaces/error-response';
import { MessageService } from 'primeng/api';

export const handleError = (error: HttpErrorResponse, messageService: MessageService): void => {
  if (error.error && typeof error.error === 'object') {
    const errorResponse = error.error as ErrorResponse;
    if (errorResponse.message) {
      (error.error);

      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: errorResponse.message
      });
      return;
    }
  }

  messageService.add({
    severity: 'error',
    summary: 'Error',
    detail: 'Error en el servidor'
  });
}; 