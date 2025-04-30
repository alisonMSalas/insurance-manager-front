import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        {
          provide: 'environment',
          useValue: {
            apiUrl: 'http://localhost:8080'
          }
        }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should make a POST request to login endpoint', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };
      const mockResponse = 'jwt-token';

      service.login(credentials).subscribe(response => {
        expect(response).toBe(mockResponse);
      });

      const req = httpMock.expectOne('http://localhost:8080/auth/login');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(credentials);
      req.flush(mockResponse, { status: 200, statusText: 'OK' });
    });
  });
});
