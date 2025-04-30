import { TestBed } from '@angular/core/testing';
import { UsersService, User } from './users.service';
import { ApiClientService } from '../api/httpclient';
import { of } from 'rxjs';

describe('UsersService', () => {
  let service: UsersService;
  let apiServiceSpy: jasmine.SpyObj<ApiClientService>;

  const mockUser: User = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    rol: 'admin',
    active: true
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['post', 'get', 'put', 'delete']);
    
    TestBed.configureTestingModule({
      providers: [
        UsersService,
        { provide: ApiClientService, useValue: spy }
      ]
    });

    service = TestBed.inject(UsersService);
    apiServiceSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create a new user', () => {
    apiServiceSpy.post.and.returnValue(of(mockUser));
    
    service.create(mockUser).subscribe(response => {
      expect(response).toEqual(mockUser);
      expect(apiServiceSpy.post).toHaveBeenCalledWith('auth/register', mockUser);
    });
  });

  it('should get all users', () => {
    const mockUsers: User[] = [mockUser];
    apiServiceSpy.get.and.returnValue(of(mockUsers));
    
    service.getAll().subscribe(users => {
      expect(users).toEqual(mockUsers);
      expect(apiServiceSpy.get).toHaveBeenCalledWith('user');
    });
  });

  it('should get user by id', () => {
    apiServiceSpy.get.and.returnValue(of(mockUser));
    
    service.getById('1').subscribe(user => {
      expect(user).toEqual(mockUser);
      expect(apiServiceSpy.get).toHaveBeenCalledWith('user/1');
    });
  });

  it('should update user', () => {
    apiServiceSpy.put.and.returnValue(of(mockUser));
    
    service.update(mockUser).subscribe(response => {
      expect(response).toEqual(mockUser);
      expect(apiServiceSpy.put).toHaveBeenCalledWith(`user/${mockUser.id}`, mockUser);
    });
  });

  it('should delete user', () => {
    apiServiceSpy.delete.and.returnValue(of({}));
    
    service.delete('1').subscribe(response => {
      expect(apiServiceSpy.delete).toHaveBeenCalledWith('user/1');
    });
  });
});