import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiClientService } from './httpclient';
import { PLATFORM_ID } from '@angular/core';

describe('ApiClientService', () => {
  let service: ApiClientService;
  let httpMock: HttpTestingController;
  let getItemSpy: jasmine.Spy;
  const mockToken = 'mock.token.here';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ApiClientService,
        { provide: PLATFORM_ID, useValue: 'browser' }
      ]
    });

    service = TestBed.inject(ApiClientService);
    httpMock = TestBed.inject(HttpTestingController);

    getItemSpy = spyOn(localStorage, 'getItem').and.returnValue(mockToken);
  });

  afterEach(() => {
    httpMock.verify();
    getItemSpy.and.callThrough();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('HTTP Methods', () => {
    it('should make GET request with correct headers', () => {
      const testEndpoint = 'test';
      const mockResponse = { data: 'test' };

      service.get(testEndpoint).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockResponse);
    });

    it('should make POST request with correct headers and body', () => {
      const testEndpoint = 'test';
      const testBody = { name: 'test' };
      const mockResponse = { success: true };

      service.post(testEndpoint, testBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(testBody);

      req.flush(mockResponse);
    });

    it('should make PUT request with correct headers and body', () => {
      const testEndpoint = 'test';
      const testBody = { name: 'test' };
      const mockResponse = { success: true };

      service.put(testEndpoint, testBody).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');
      expect(req.request.body).toEqual(testBody);

      req.flush(mockResponse);
    });

    it('should make DELETE request with correct headers', () => {
      const testEndpoint = 'test';
      const mockResponse = { success: true };

      service.delete(testEndpoint).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.headers.get('Content-Type')).toBe('application/json');

      req.flush(mockResponse);
    });
  });

  describe('postForm', () => {
    it('should make POST request with FormData and correct headers', () => {
      const testEndpoint = 'upload';
      const formData = new FormData();
      formData.append('file', new Blob(['test content'], { type: 'text/plain' }));
      const mockResponse = { success: true };

      service.postForm(testEndpoint, formData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
      expect(req.request.body instanceof FormData).toBeTruthy();

      req.flush(mockResponse);
    });

    it('should make POST request without Authorization header when token is null', () => {
      getItemSpy.and.returnValue(null);
      const testEndpoint = 'upload';
      const formData = new FormData();
      const mockResponse = { success: true };

      service.postForm(testEndpoint, formData).subscribe(response => {
        expect(response).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`http://localhost:8080/${testEndpoint}`);
      expect(req.request.method).toBe('POST');
      expect(req.request.headers.get('Authorization')).toBeNull();
      expect(req.request.body instanceof FormData).toBeTruthy();

      req.flush(mockResponse);
    });
  });

  describe('getCurrentUserEmail', () => {
    it('should return email from token', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIn0.signature';
      getItemSpy.and.returnValue(validToken);

      const email = service.getCurrentUserEmail();
      expect(email).toBe('test@example.com');
    });

    it('should return null when token is invalid', () => {
      getItemSpy.and.returnValue('invalid-token');

      const email = service.getCurrentUserEmail();
      expect(email).toBeNull();
    });

    it('should return null when token is missing', () => {
      getItemSpy.and.returnValue(null);

      const email = service.getCurrentUserEmail();
      expect(email).toBeNull();
    });

    it('should return null when token payload is invalid', () => {
      const invalidPayloadToken = 'header.invalid-payload.signature';
      getItemSpy.and.returnValue(invalidPayloadToken);

      const email = service.getCurrentUserEmail();
      expect(email).toBeNull();
    });

    it('should return null when token payload is not JSON', () => {
      const nonJsonPayloadToken = 'header.' + btoa('not-json') + '.signature';
      getItemSpy.and.returnValue(nonJsonPayloadToken);

      const email = service.getCurrentUserEmail();
      expect(email).toBeNull();
    });
  });
});