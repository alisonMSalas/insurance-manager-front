import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { handleError } from './error.utils';

describe('Error Utils', () => {
  let messageService: jasmine.SpyObj<MessageService>;

  beforeEach(() => {
    messageService = jasmine.createSpyObj('MessageService', ['add']);
  });

  it('should handle error with message from error response', () => {
    const errorResponse = {
      error: {
        message: 'Error específico del servidor'
      }
    } as HttpErrorResponse;

    handleError(errorResponse, messageService);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error específico del servidor'
    });
  });

  it('should handle error with default message when no specific message is provided', () => {
    const errorResponse = {
      error: {}
    } as HttpErrorResponse;

    handleError(errorResponse, messageService);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  });

  it('should handle error with default message when error is not an object', () => {
    const errorResponse = {
      error: 'string error'
    } as HttpErrorResponse;

    handleError(errorResponse, messageService);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  });

  it('should handle error with default message when error is null', () => {
    const errorResponse = {
      error: null
    } as HttpErrorResponse;

    handleError(errorResponse, messageService);

    expect(messageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Error en el servidor'
    });
  });
}); 