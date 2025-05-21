import { TestBed } from '@angular/core/testing';
import { ClientsService } from './clients.service';
import { ApiClientService } from '../api/httpclient';
import { of } from 'rxjs';
import { Client } from '../../shared/interfaces/client';
import { User } from '../../core/services/users.service';

describe('ClientsService', () => {
  let service: ClientsService;
  let apiClientSpy: jasmine.SpyObj<ApiClientService>;

  const mockUser: User = {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@example.com',
    rol: 'ADMIN',
    active: true
  };

  const mockClient: Client = {
    id: 'c1',
    name: 'Juan',
    lastName: 'Pérez',
    identificationNumber: '1234567890',
    birthDate: '1990-01-01',
    phoneNumber: '987654321',
    address: 'Calle Falsa 123',
    gender: 'Masculino',
    occupation: 'Ingeniero',
    active: true,
    user: mockUser
  };

  beforeEach(() => {
    const spy = jasmine.createSpyObj('ApiClientService', ['get', 'post', 'put', 'delete']);

    TestBed.configureTestingModule({
      providers: [
        ClientsService,
        { provide: ApiClientService, useValue: spy }
      ]
    });

    service = TestBed.inject(ClientsService);
    apiClientSpy = TestBed.inject(ApiClientService) as jasmine.SpyObj<ApiClientService>;
  });

  it('debería crear un cliente', () => {
    apiClientSpy.post.and.returnValue(of(mockClient));

    service.create(mockClient).subscribe(result => {
      expect(result).toEqual(mockClient);
    });

    expect(apiClientSpy.post).toHaveBeenCalledWith('client', mockClient);
  });

  it('debería obtener todos los clientes', () => {
    const mockClients: Client[] = [mockClient];
    apiClientSpy.get.and.returnValue(of(mockClients));

    service.getAll().subscribe(result => {
      expect(result).toEqual(mockClients);
    });

    expect(apiClientSpy.get).toHaveBeenCalledWith('client');
  });

  it('debería obtener un cliente por ID', () => {
    apiClientSpy.get.and.returnValue(of(mockClient));

    service.getById('c1').subscribe(result => {
      expect(result).toEqual(mockClient);
    });

    expect(apiClientSpy.get).toHaveBeenCalledWith('client/c1');
  });

  it('debería actualizar un cliente', () => {
    apiClientSpy.put.and.returnValue(of(mockClient));

    service.update(mockClient).subscribe(result => {
      expect(result).toEqual(mockClient);
    });

    expect(apiClientSpy.put).toHaveBeenCalledWith('client', mockClient);
  });

  it('debería eliminar un cliente por ID', () => {
    apiClientSpy.delete.and.returnValue(of(undefined));

    service.delete('c1').subscribe(result => {
      expect(result).toBeUndefined();
    });

    expect(apiClientSpy.delete).toHaveBeenCalledWith('client/c1');
  });
});
