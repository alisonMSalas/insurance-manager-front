import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ContratacionSegurosComponent } from './contratacion-seguros.component';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { SegurosService } from '../service/seguros.service';
import { ClientsService } from '../../core/services/clients.service';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';
import { FormGroup, FormControl } from '@angular/forms';
import { Client } from '../../shared/interfaces/client';
import { Contract } from '../../shared/interfaces/contract';


describe('ContratacionSegurosComponent', () => {
  let component: ContratacionSegurosComponent;
  let fixture: ComponentFixture<ContratacionSegurosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ContratacionSegurosComponent,
        HttpClientTestingModule,
        RouterModule.forRoot([])
      ],
      providers: [
        FormBuilder,
        MessageService,
        SegurosService,
        ClientsService,
        ContratacionesService
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ContratacionSegurosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debería crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debería tener formularios definidos', () => {
    expect(component.clienteForm).toBeDefined();
    expect(component.coberturasForm).toBeDefined();
    expect(component.pagoForm).toBeDefined();
    expect(component.documentosForm).toBeDefined();
  });

  it('debería tener instancias de los servicios con inject()', () => {
    const segurosService = (component as any).segurosService;
    const messageService = (component as any).messageService;
    const clientService = (component as any).clientService;
    const contractService = (component as any).contractService;

    expect(segurosService).toBeTruthy();
    expect(messageService).toBeTruthy();
    expect(clientService).toBeTruthy();
    expect(contractService).toBeTruthy();
  });

  it('debe actualizar fechaPago en pagoForm cuando cambia fechaInicio en coberturasForm', () => {
    // Simulamos la inicialización del componente
    component.ngOnInit();

    // Valor de prueba para fechaInicio
    const fechaInicio = '2025-05-21';

    // Asignamos el valor al control fechaInicio
    component.coberturasForm.get('fechaInicio')?.setValue(fechaInicio);

    // Obtenemos el valor actualizado de fechaPago en pagoForm
    const fechaPago = component.pagoForm.get('fechaPago')?.value;

    // Verificamos que fechaPago se haya actualizado correctamente
    expect(fechaPago).toBe(fechaInicio);
  });

  it('debe retornar la fecha en formato YYYY-MM-DD cuando se proporciona una fecha válida', () => {
    const fecha = new Date('2025-05-21T10:00:00Z');
    const resultado = component.formatoFecha(fecha);
    expect(resultado).toBe('2025-05-21');
  });

  it('debe retornar null cuando la fecha es null', () => {
    const resultado = component.formatoFecha(null);
    expect(resultado).toBeNull();
  });

  it('debe cargar los tipos de seguro correctamente desde el servicio', () => {
    // Mock con la forma correcta según interfaz Insurance
    const tiposMock: Insurance[] = [
      {
        id: '1',
        name: 'Seguro Vida',
        type: InsuranceType.LIFE,
        description: 'Cobertura para vida',
        coverage: 100000,
        deductible: 500,
        paymentAmount: 50,
        paymentPeriod: PaymentPeriod.MONTHLY,
        active: true
      },
      {
        id: '2',
        name: 'Seguro Auto',
        type: InsuranceType.HEALTH,
        description: 'Cobertura para auto',
        coverage: 50000,
        deductible: 200,
        paymentAmount: 30,
        paymentPeriod: PaymentPeriod.YEARLY,
        active: true
      }
    ];

    const segurosService = TestBed.inject(SegurosService);
    spyOn(segurosService, 'getAll').and.returnValue(of(tiposMock));

    component.cargarTiposSeguro();

    expect(component.tiposSeguro).toEqual(tiposMock);
  });
  it('debe manejar error al cargar tipos de seguro y llamar a console.error', () => {
    const errorResponse = new Error('Error de red');

    const segurosService = TestBed.inject(SegurosService);
    spyOn(segurosService, 'getAll').and.returnValue(throwError(() => errorResponse));

    // Espiar console.error para verificar que se llamó
    spyOn(console, 'error');

    component.cargarTiposSeguro();

    expect(console.error).toHaveBeenCalledWith('Error al cargar tipos de seguro', errorResponse);
  });

  it('debe actualizar formularios correctamente cuando se selecciona un seguro con paymentPeriod', () => {
    // Mock del seguro seleccionado
    const seguroSeleccionado = {
      paymentPeriod: PaymentPeriod.MONTHLY,
      paymentAmount: 100
    };

    // Establecemos un valor para fechaInicio en coberturasForm
    component.coberturasForm.patchValue({ fechaInicio: '2025-05-21' });

    // Espiamos el método traducirPeriodo para que retorne un valor controlado
    spyOn(component, 'traducirPeriodo').and.returnValue('Mensual');

    // Ejecutamos el método a probar
    component.onTipoSeguroSeleccionado(seguroSeleccionado);

    // Verificamos que traducirPeriodo fue llamado con paymentPeriod correcto
    expect(component.traducirPeriodo).toHaveBeenCalledWith(PaymentPeriod.MONTHLY);

    // Verificamos que coberturasForm se actualizó con periodicidad
    expect(component.coberturasForm.get('periodicidad')?.value).toBe('Mensual');

    // Verificamos que pagoForm se actualizó con tipoPago, monto y fechaPago
    expect(component.pagoForm.get('tipoPago')?.value).toBe('Mensual');
    expect(component.pagoForm.get('monto')?.value).toBe(100);
    expect(component.pagoForm.get('fechaPago')?.value).toBe('2025-05-21');
  });
  describe('traducirPeriodo', () => {
    it('debe retornar "Mensual" cuando el periodo es "MONTHLY"', () => {
      expect(component.traducirPeriodo('MONTHLY')).toBe('Mensual');
    });

    it('debe retornar "Anual" cuando el periodo es "YEARLY"', () => {
      expect(component.traducirPeriodo('YEARLY')).toBe('Anual');
    });

    it('debe retornar el valor original cuando el periodo es otro valor', () => {
      expect(component.traducirPeriodo('WEEKLY')).toBe('WEEKLY');
    });
  });

  describe('siguientePaso', () => {
    beforeEach(() => {
      // Aseguramos que messageService es espiado para los add()
      spyOn(component.messageService, 'add');
    });

    it('si activeIndex es 1, clienteForm válido y clienteEncontrado es true, mantiene activeIndex en 1', () => {
      component.activeIndex = 1;
      component.clienteEncontrado = true;
      component.clienteForm.setValue({
        // Asume que todos los campos obligatorios están completos
        nombre: 'Juan',
        apellido: 'Perez',
        email: 'juan@example.com'
      });
      component.clienteForm.markAsDirty();
      component.clienteForm.markAsTouched();

      // Forzar que clienteForm sea válido
      component.clienteForm.updateValueAndValidity();

      component.siguientePaso();

      expect(component.activeIndex).toBe(1);
      expect(component.messageService.add).not.toHaveBeenCalled();
    });
    it('si activeIndex es 1 y clienteForm inválido (sin tocar), muestra mensaje específico de datos del cliente', () => {
      component.activeIndex = 1;
      component.clienteEncontrado = true;
      component.clienteForm = new FormGroup({
        nombre: new FormControl('', Validators.required),
        apellido: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email])
      }); // todos vacíos e inválidos

      component.siguientePaso();

      expect(component.activeIndex).toBe(1);
      expect(component.messageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Error',
        detail: 'Complete los datos del cliente'
      });
    });
    it('si activeIndex es 3 y pagoForm inválido, muestra mensaje específico de datos de pago', () => {
      component.activeIndex = 3;
      component.pagoForm = new FormGroup({
        monto: new FormControl(null, Validators.required)
      }); // inválido

      component.siguientePaso();

      expect(component.activeIndex).toBe(3);
      expect(component.messageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Error',
        detail: 'Complete los datos de pago'
      });
    });
it('si activeIndex es 0 y clienteForm inválido, muestra mensaje para completar datos del cliente y no avanza', () => {
  component.activeIndex = 0;

  // Definimos clienteForm inválido (vacío o con errores)
  component.clienteForm = new FormGroup({
    nombre: new FormControl('', Validators.required),
    apellido: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email])
  });

  component.siguientePaso();

  expect(component.messageService.add).toHaveBeenCalledWith({
    severity: 'warn',
    summary: 'Error',
    detail: 'Complete los datos del cliente'
  });

  // Verificamos que activeIndex no cambió (sigue en 0)
  expect(component.activeIndex).toBe(0);
});


    it('si activeIndex es 1, clienteForm inválido o clienteEncontrado false, muestra mensaje y setea activeIndex en 0', () => {
      component.activeIndex = 1;
      component.clienteEncontrado = false; // cliente no encontrado
      component.clienteForm.setErrors({ required: true }); // marcar inválido

      component.siguientePaso();

      expect(component.activeIndex).toBe(0);
      expect(component.messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Debe llenar todos los campos obligatorios y buscar el cliente antes de continuar.'
      }));
    });

    it('si activeIndex es 2 y coberturasForm válido, mantiene activeIndex en 2', () => {
      component.activeIndex = 2;
      component.coberturasForm.setValue({
        fechaInicio: '2025-05-21',
        periodicidad: 'Mensual'
      });
      component.coberturasForm.markAsDirty();
      component.coberturasForm.markAsTouched();
      component.coberturasForm.updateValueAndValidity();

      component.siguientePaso();

      expect(component.activeIndex).toBe(2);
      expect(component.messageService.add).not.toHaveBeenCalled();
    });

    it('si activeIndex es 2 y coberturasForm inválido, muestra mensaje y mantiene activeIndex en 2', () => {
      component.activeIndex = 2;
      component.coberturasForm.setErrors({ required: true }); // marcar inválido

      component.siguientePaso();

      expect(component.activeIndex).toBe(2);
      expect(component.messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'Datos incompletos',
        detail: 'Debe llenar todos los campos obligatorios antes de continuar.'
      }));
    });
  });

  describe('removeFile', () => {
    it('debería eliminar un archivo de uploadedFiles y mostrar mensaje', () => {
      const file1 = new File(['contenido1'], 'archivo1.txt');
      const file2 = new File(['contenido2'], 'archivo2.txt');
      component.uploadedFiles = [file1, file2];

      const messageService = TestBed.inject(MessageService);
      spyOn(messageService, 'add');

      component.removeFile(file1);

      expect(component.uploadedFiles).toEqual([file2]);
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'warn',
        summary: 'Archivo eliminado',
        detail: file1.name
      });
    });
  });


  describe('resetCampos', () => {
    it('debería resetear clienteForm con la cédula proporcionada y campos vacíos', () => {
      const cedula = '1234567890';

      component.resetCampos(cedula);

      const formValue = component.clienteForm.value;
      expect(formValue.buscar).toBe(cedula);
      expect(formValue.cedula).toBe('');
      expect(formValue.nombres).toBe('');
      expect(formValue.apellidos).toBe('');
      expect(formValue.fechaNacimiento).toBeNull();
      expect(formValue.genero).toBe('');
      expect(formValue.telefono).toBe('');
      expect(formValue.correo).toBe('');
      expect(formValue.ocupacion).toBe('');
      expect(formValue.direccion).toBe('');
    });
  });


  describe('buscarCliente', () => {
    let messageServiceSpy: jasmine.SpyObj<any>;
    let clientServiceSpy: jasmine.SpyObj<any>;

    beforeEach(() => {
      messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);
      clientServiceSpy = jasmine.createSpyObj('ClientService', ['getByIdentificationNumber']);

      component.messageService = messageServiceSpy;
      component.clientService = clientServiceSpy;

      component.clienteForm = new FormGroup({
        buscar: new FormControl(''),
        cedula: new FormControl(''),
        nombres: new FormControl(''),
        apellidos: new FormControl(''),
        fechaNacimiento: new FormControl(null),
        genero: new FormControl(''),
        telefono: new FormControl(''),
        correo: new FormControl(''),
        direccion: new FormControl(''),
        ocupacion: new FormControl('')
      });

      spyOn(component, 'resetCampos');
    });

    it('debería mostrar error y resetear si la cédula tiene menos de 10 caracteres', () => {
      component.clienteForm.get('buscar')?.setValue('12345');

      component.buscarCliente();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'La cédula debe tener al menos 10 dígitos'
      }));
      expect(component.resetCampos).toHaveBeenCalledWith('12345');
    });

    it('debería mostrar advertencia y resetear si la cédula es inválida según validarCedulaEcuatoriana', () => {
      const cedulaValida = '1234567890';
      component.clienteForm.get('buscar')?.setValue(cedulaValida);

      // Mock de validarCedulaEcuatoriana para devolver un validador que indica inválido
      spyOn(window as any, 'validarCedulaEcuatoriana').and.returnValue(() => ({ cedulaInvalida: true }));

      component.buscarCliente();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'Cédula inválida',
        detail: 'La cédula ingresada no es válida'
      }));
      expect(component.resetCampos).toHaveBeenCalledWith(cedulaValida);
    });
    it('debería mostrar error si no se ingresa cédula', () => {
      // Asegurarse que el campo 'buscar' esté vacío o nulo
      component.clienteForm.get('buscar')?.setValue('');

      // Ejecutar el método buscarCliente
      component.buscarCliente();

      // Verificar que messageService.add fue llamado con el mensaje esperado
      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Error',
        detail: 'Ingrese una cédula'
      }));
    });
    it('debería actualizar el formulario, marcar clienteEncontrado y mostrar mensaje de éxito si se encuentra el cliente', async () => {
      const cedulaValida = '1728394056';
      component.clienteForm.get('buscar')?.setValue(cedulaValida);

      // Mock del cliente que devuelve el servicio
      const clienteMock = {
        identificationNumber: cedulaValida,
        name: 'Juan',
        lastName: 'Pérez',
        birthDate: '1990-01-01T00:00:00.000Z',
        gender: 'M',
        phoneNumber: '0999999999',
        user: { email: 'juan@example.com' },
        occupation: 'Ingeniero',
        address: 'Calle Falsa 123'
      };

      // Simular que getByIdentificationNumber devuelve un observable con clienteMock
      clientServiceSpy.getByIdentificationNumber.and.returnValue(of(clienteMock));

      // Llamar al método async y esperar a que termine
      await component.buscarCliente();

      // Verificar que patchValue haya actualizado los campos del formulario
      expect(component.clienteForm.get('cedula')?.value).toBe(clienteMock.identificationNumber);
      expect(component.clienteForm.get('nombres')?.value).toBe(clienteMock.name);
      expect(component.clienteForm.get('apellidos')?.value).toBe(clienteMock.lastName);
      expect(component.clienteForm.get('fechaNacimiento')?.value).toEqual(new Date(clienteMock.birthDate));
      expect(component.clienteForm.get('genero')?.value).toBe(clienteMock.gender);
      expect(component.clienteForm.get('telefono')?.value).toBe(clienteMock.phoneNumber);
      expect(component.clienteForm.get('correo')?.value).toBe(clienteMock.user.email);
      expect(component.clienteForm.get('ocupacion')?.value).toBe(clienteMock.occupation);
      expect(component.clienteForm.get('direccion')?.value).toBe(clienteMock.address);

      // Verificar que clienteEncontrado sea true
      expect(component.clienteEncontrado).toBeTrue();

      // Verificar que se haya llamado a messageService.add con mensaje de éxito
      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'Éxito',
        detail: 'Cliente encontrado'
      }));
    });


    it('debería actualizar el formulario y mostrar éxito si cliente encontrado', () => {
      const cedula = '1234567890';
      component.clienteForm.get('buscar')?.setValue(cedula);

      spyOn(window as any, 'validarCedulaEcuatoriana').and.returnValue(() => null); // válido

      const clienteMock = {
        identificationNumber: '1234567890',
        name: 'Juan',
        lastName: 'Perez',
        birthDate: '1990-01-01',
        gender: 'M',
        phoneNumber: '0999999999',
        user: { email: 'juan@mail.com' },
        address: 'Calle Falsa 123',
        occupation: 'Ingeniero'
      };

      clientServiceSpy.getByIdentificationNumber.and.returnValue(of(clienteMock));

      component.buscarCliente();

      expect(component.clienteForm.get('cedula')?.value).toBe(clienteMock.identificationNumber);
      expect(component.clienteForm.get('nombres')?.value).toBe(clienteMock.name);
      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'Cliente encontrado'
      }));
      expect(component.clienteEncontrado).toBeTrue();
    });
    it('debería llamar a resetCampos y mostrar mensaje de advertencia si no se encuentra el cliente', async () => {
      const cedulaValida = '1728394056';
      component.clienteForm.get('buscar')?.setValue(cedulaValida);

      // Simular que el servicio devuelve null (cliente no encontrado)
      clientServiceSpy.getByIdentificationNumber.and.returnValue(of(null));

      // Llamar a la función async
      await component.buscarCliente();

      // Verificar que resetCampos se haya llamado con la cédula
      expect(component.resetCampos).toHaveBeenCalledWith(cedulaValida);

      // Verificar que se haya mostrado mensaje de advertencia
      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'warn',
        summary: 'No encontrado',
        detail: 'Cliente no encontrado'
      }));
    });
    it('debería mostrar error y resetear si hay error en el servicio', () => {
      const cedula = '1234567890';
      component.clienteForm.get('buscar')?.setValue(cedula);

      spyOn(window as any, 'validarCedulaEcuatoriana').and.returnValue(() => null); // válido

      clientServiceSpy.getByIdentificationNumber.and.returnValue(throwError(() => new Error('error')));

      component.buscarCliente();

      expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'Error'
      }));
      expect(component.clienteEncontrado).toBeFalse();
      expect(component.resetCampos).toHaveBeenCalledWith(cedula);
    });
  });

  it('debería mostrar advertencia y no continuar si algún formulario es inválido', async () => {
    // Crear formularios con controles, y poner al menos un control inválido para simular formulario inválido
    component.clienteForm = new FormGroup({
      cedula: new FormControl('', Validators.required)  // vacío => inválido
    });
    component.coberturasForm = new FormGroup({
      fechaInicio: new FormControl('2024-05-22', Validators.required)
    });
    component.pagoForm = new FormGroup({
      monto: new FormControl(100, Validators.required)
    });

    // Ejecutamos la función
    await component.finalizarProceso();

    // Debe mostrar el mensaje de advertencia porque clienteForm es inválido
    expect(component.messageService.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      summary: 'Error',
      detail: 'Complete todos los campos obligatorios'
    }));

    // No debe llamar al servicio porque la validación falló
    expect(component.clientService.getByIdentificationNumber).not.toHaveBeenCalled();
  });

  it('debería establecer estado como "PENDING" si hay archivos suficientes', async () => {
    // Simular clienteForm con cédula válida
    component.clienteForm = new FormGroup({
      cedula: new FormControl('1234567890', Validators.required)
    });

    // Simular coberturasForm y pagoForm válidos
    component.coberturasForm = new FormGroup({
      fechaInicio: new FormControl(new Date(), Validators.required),
      beneficiario: new FormControl('Juan Pérez', Validators.required),
      tipoSeguro: new FormControl({ id: 1 }, Validators.required)
    });

    component.pagoForm = new FormGroup({
      monto: new FormControl(100, Validators.required)
    });

    // Simular archivos subidos
    component.uploadedFiles = [{ name: 'documento.pdf' } as File];

    // Mock del cliente retornado por el servicio
    const mockClient: Client = {
      id: '123',
      identificationNumber: '1805035548',
      name: 'Test',
      lastName: 'User',
      birthDate: '2000-01-01',
      gender: 'M',
      phoneNumber: '123456789',
      user: {
        id: 'u001',
        name: 'Test User',
        email: 'test@example.com',
        rol: 'user',
        active: true
      },
      address: 'Test Address',
      occupation: 'Tester',
      active: true
    };

    spyOn(component.clientService, 'getByIdentificationNumber')
      .and.returnValue(of(mockClient));

    // Mock del contractService.create
    spyOn(component.contractService, 'create').and.returnValue(of({
      id: '99',
      client: mockClient,
      date: '2025-05-22',
      amount: 100,
      status: 'PENDING',
      insuranceType: { id: 1, name: 'Seguro de Vida' },
      documents: [],
      active: true
    } as Contract));

    // ✅ Mock corregido: uploadDocuments debe retornar un arreglo (array)
    spyOn(component.contractService, 'uploadDocuments')
      .and.returnValue(of([])); // o puedes simular documentos si quieres

    // Mock del método formatoFecha
    spyOn(component, 'formatoFecha').and.returnValue('2025-05-22');

    // Ejecutar método
    await component.finalizarProceso();

    // Verificar que se llamó al servicio con status 'PENDING'
    expect(component.contractService.create).toHaveBeenCalledWith(jasmine.objectContaining({
      status: 'PENDING'
    }));
  });

  it('debería lanzar un error si no se recibe el ID del contrato', async () => {
    // Simular clienteForm con cédula válida
    component.clienteForm = new FormGroup({
      cedula: new FormControl('1234567890', Validators.required)
    });

    component.coberturasForm = new FormGroup({
      fechaInicio: new FormControl(new Date(), Validators.required),
      beneficiario: new FormControl('Juan Pérez', Validators.required),
      tipoSeguro: new FormControl({ id: 1 }, Validators.required)
    });

    component.pagoForm = new FormGroup({
      monto: new FormControl(100, Validators.required)
    });

    component.uploadedFiles = [{ name: 'documento.pdf' } as File];

    const mockClient: Client = {
      id: '123',
      identificationNumber: '1805035548',
      name: 'Test',
      lastName: 'User',
      birthDate: '2000-01-01',
      gender: 'M',
      phoneNumber: '123456789',
      user: {
        id: 'u001',
        name: 'Test User',
        email: 'test@example.com',
        rol: 'user',
        active: true
      },
      address: 'Test Address',
      occupation: 'Tester',
      active: true
    };

    spyOn(component.clientService, 'getByIdentificationNumber')
      .and.returnValue(of(mockClient));

    // 🔴 Simular respuesta sin ID
    spyOn(component.contractService, 'create').and.returnValue(of({
      // sin campo `id`
      client: mockClient,
      date: '2025-05-22',
      amount: 100,
      status: 'PENDING',
      insuranceType: { id: 1, name: 'Seguro de Vida' },
      documents: [],
      active: true
    } as any)); // uso `as any` para evitar error de tipado

    spyOn(component.contractService, 'uploadDocuments')
      .and.returnValue(of([]));

    spyOn(component, 'formatoFecha').and.returnValue('2025-05-22');

    // Ejecutar y verificar que lanza error
    await expectAsync(component.finalizarProceso()).toBeRejectedWithError('ID de contrato no recibido');
  });

  it('debería añadir archivos, limpiar opciones y mostrar mensaje al subir archivos', () => {
    // Crear archivos reales usando File API
    const file1 = new File(['contenido de prueba 1'], 'archivo1.pdf', { type: 'application/pdf' });
    const file2 = new File(['contenido de prueba 2'], 'archivo2.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const mockFiles: File[] = [file1, file2];

    // Espía de `clear()` simulado
    const clearSpy = jasmine.createSpy('clear');

    // Crear evento simulado
    const mockEvent = {
      files: mockFiles,
      options: {
        clear: clearSpy
      }
    };

    // Inicializar el formulario si no está
    component.documentosForm = new FormGroup({
      documentos: new FormControl([])
    });

    // Espiar messageService
    const messageSpy = spyOn(component.messageService, 'add');

    // Ejecutar
    component.onUpload(mockEvent);

    // Verificar que los archivos fueron agregados
    expect(component.uploadedFiles).toEqual(mockFiles);

    // Verificar que se actualizó el valor del formulario
    expect(component.documentosForm.value.documentos).toEqual(mockFiles);

    // Verificar que se llamó a clear()
    expect(clearSpy).toHaveBeenCalled();

    // Verificar que se mostró el mensaje
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Archivo(s) añadido(s)',
      detail: '2 archivo(s) listo(s)'
    });
  });




});