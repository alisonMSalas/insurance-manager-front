import { TestBed } from '@angular/core/testing';
import { ApiClientService } from './httpclient';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpClientSpy: jasmine.SpyObj<HttpClient>;
  let platformId: string;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    platformId = 'browser';

    TestBed.configureTestingModule({
      providers: [
        ApiClientService,
        { provide: HttpClient, useValue: spy },
        { provide: PLATFORM_ID, useValue: platformId }
      ]
    });
    service = TestBed.inject(ApiClientService);
    httpClientSpy = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('debe hacer GET request con headers correctos', () => {
      const mockResponse = { data: 'test' };
      httpClientSpy.get.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.get('test-endpoint').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        { headers: jasmine.any(Object) }
      );
    });

    it('debe hacer GET request sin token cuando no hay token en localStorage', () => {
      const mockResponse = { data: 'test' };
      httpClientSpy.get.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue(null);

      service.get('test-endpoint').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.get).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        { headers: jasmine.any(Object) }
      );
    });
  });

  describe('post', () => {
    it('debe hacer POST request con body y headers correctos', () => {
      const mockResponse = { success: true };
      const mockBody = { name: 'test' };
      httpClientSpy.post.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.post('test-endpoint', mockBody).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        mockBody,
        { headers: jasmine.any(Object) }
      );
    });
  });

  describe('put', () => {
    it('debe hacer PUT request con body y headers correctos', () => {
      const mockResponse = { success: true };
      const mockBody = { id: 1, name: 'test' };
      httpClientSpy.put.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.put('test-endpoint', mockBody).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.put).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        mockBody,
        { headers: jasmine.any(Object) }
      );
    });
  });

  describe('delete', () => {
    it('debe hacer DELETE request con headers correctos', () => {
      const mockResponse = { success: true };
      httpClientSpy.delete.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.delete('test-endpoint').subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.delete).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        { headers: jasmine.any(Object) }
      );
    });
  });

  describe('postForm', () => {
    it('debe hacer POST request con FormData y token', () => {
      const mockResponse = { success: true };
      const formData = new FormData();
      formData.append('file', new Blob(['test']));
      httpClientSpy.post.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');

      service.postForm('test-endpoint', formData).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        formData,
        { headers: jasmine.any(Object) }
      );
    });

    it('debe hacer POST request con FormData sin token', () => {
      const mockResponse = { success: true };
      const formData = new FormData();
      formData.append('file', new Blob(['test']));
      httpClientSpy.post.and.returnValue(of(mockResponse));
      spyOn(localStorage, 'getItem').and.returnValue(null);

      service.postForm('test-endpoint', formData).subscribe(result => {
        expect(result).toEqual(mockResponse);
      });

      expect(httpClientSpy.post).toHaveBeenCalledWith(
        'http://localhost:8080/test-endpoint',
        formData,
        { headers: jasmine.any(Object) }
      );
    });
  });

  describe('getCurrentUserEmail', () => {
    it('debe retornar email del usuario desde token válido', () => {
      const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      spyOn(localStorage, 'getItem').and.returnValue(mockToken);

      const result = service.getCurrentUserEmail();
      expect(result).toBe('test@example.com');
    });

    it('debe retornar null cuando no hay token', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);

      const result = service.getCurrentUserEmail();
      expect(result).toBeNull();
    });

    it('debe retornar null cuando el token no tiene payload', () => {
      const invalidToken = 'invalid.token';
      spyOn(localStorage, 'getItem').and.returnValue(invalidToken);

      const result = service.getCurrentUserEmail();
      expect(result).toBeNull();
    });

    it('debe retornar null cuando el payload no es JSON válido', () => {
      const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aW52YWxpZC5wYXlsb2Fk.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      spyOn(localStorage, 'getItem').and.returnValue(invalidToken);

      const result = service.getCurrentUserEmail();
      expect(result).toBeNull();
    });

    it('debe retornar null cuando el payload no tiene sub', () => {
      const tokenWithoutSub = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJpYXQiOjE1MTYyMzkwMjJ9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
      spyOn(localStorage, 'getItem').and.returnValue(tokenWithoutSub);

      const result = service.getCurrentUserEmail();
      expect(result).toBeNull();
    });

    it('debe manejar error al decodificar token', () => {
      const invalidToken = 'invalid-token';
      spyOn(localStorage, 'getItem').and.returnValue(invalidToken);
      spyOn(console, 'error');

      const result = service.getCurrentUserEmail();
      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith('Error al decodificar el token:', jasmine.any(Error));
    });
  });

  describe('headers', () => {
    it('debe incluir Authorization header cuando hay token', () => {
      spyOn(localStorage, 'getItem').and.returnValue('mock-token');
      const mockResponse = { data: 'test' };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.get('test').subscribe();

      const callArgs = httpClientSpy.get.calls.mostRecent().args;
      const headers = callArgs[1].headers;
      expect(headers.get('Authorization')).toBe('Bearer mock-token');
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('no debe incluir Authorization header cuando no hay token', () => {
      spyOn(localStorage, 'getItem').and.returnValue(null);
      const mockResponse = { data: 'test' };
      httpClientSpy.get.and.returnValue(of(mockResponse));

      service.get('test').subscribe();

      const callArgs = httpClientSpy.get.calls.mostRecent().args;
      const headers = callArgs[1].headers;
      expect(headers.get('Authorization')).toBeNull();
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('server-side rendering', () => {
    it('debe manejar SSR correctamente cuando no es browser', () => {
      // Cambiar a platform server
      TestBed.resetTestingModule();
      const spy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
      
      TestBed.configureTestingModule({
        providers: [
          ApiClientService,
          { provide: HttpClient, useValue: spy },
          { provide: PLATFORM_ID, useValue: 'server' }
        ]
      });
      
      const serverService = TestBed.inject(ApiClientService);
      const serverHttpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
      const mockResponse = { data: 'test' };
      serverHttpClient.get.and.returnValue(of(mockResponse));

      serverService.get('test').subscribe();

      const callArgs = serverHttpClient.get.calls.mostRecent().args;
      const headers = callArgs[1].headers;
      expect(headers.get('Authorization')).toBeNull();
    });
  });
}); 