import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ContratacionSegurosComponent } from './contratacion-seguros.component';
import { FormBuilder } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MessageService } from 'primeng/api';
import { SegurosService } from '../service/seguros.service';
import { ClientsService } from '../../core/services/clients.service';
import { ContratacionesService } from '../../core/services/contrataciones.service';
import { RouterModule } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Insurance, InsuranceType, PaymentPeriod } from '../../shared/interfaces/insurance';
import { FormGroup, FormControl } from '@angular/forms';


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
  describe('Beneficiarios', () => {
    beforeEach(() => {
      component.beneficiarios = [];
    });

    it('debe agregar un beneficiario vacío al arreglo beneficiarios', () => {
      component.agregarBeneficiario();
      expect(component.beneficiarios.length).toBe(1);
      expect(component.beneficiarios[0]).toEqual({ nombre: '', parentesco: '', porcentaje: 0 });
    });

    it('debe eliminar un beneficiario del arreglo beneficiarios', () => {
      const beneficiario = { nombre: 'Juan', parentesco: 'Hermano', porcentaje: 50 };
      component.beneficiarios = [
        beneficiario,
        { nombre: 'Ana', parentesco: 'Madre', porcentaje: 50 }
      ];

      component.eliminarBeneficiario(beneficiario);

      expect(component.beneficiarios.length).toBe(1);
      expect(component.beneficiarios).not.toContain(beneficiario);
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
  describe('validarBeneficiarios', () => {

    it('debería retornar false si algún beneficiario tiene nombre vacío, parentesco vacío o porcentaje nulo/indefinido', () => {
      component.beneficiarios = [
        { nombre: 'Juan', parentesco: 'Hermano', porcentaje: 50 },
        { nombre: ' ', parentesco: 'Padre', porcentaje: 50 }  // nombre vacío (solo espacios)
      ];
      expect(component.validarBeneficiarios()).toBeFalse();

      component.beneficiarios = [
        { nombre: 'Ana', parentesco: '', porcentaje: 100 }  // parentesco vacío
      ];
      expect(component.validarBeneficiarios()).toBeFalse();

      component.beneficiarios = [
        { nombre: 'Luis', parentesco: 'Tío', porcentaje: 100 }  // porcentaje nulo
      ];
      expect(component.validarBeneficiarios()).toBeFalse();

      component.beneficiarios = [
        { nombre: 'Maria', parentesco: 'Prima', porcentaje: 100 }  // porcentaje indefinido
      ];
      expect(component.validarBeneficiarios()).toBeFalse();
    });

    it('debería retornar true si todos los beneficiarios tienen datos válidos', () => {
      component.beneficiarios = [
        { nombre: 'Juan', parentesco: 'Hermano', porcentaje: 50 },
        { nombre: 'Ana', parentesco: 'Madre', porcentaje: 50 }
      ];
      expect(component.validarBeneficiarios()).toBeTrue();
    });

    it('debería retornar true si la lista de beneficiarios está vacía', () => {
      component.beneficiarios = [];
      expect(component.validarBeneficiarios()).toBeTrue();
    });

  });

  describe('onFileSelected', () => {
    it('debería leer el archivo y llamar a FileReader.readAsDataURL', () => {
      const file = new File(['contenido'], 'archivo.txt', { type: 'text/plain' });
      const event = {
        target: {
          files: [file]
        }
      };

      const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL']);
      fileReaderSpy.onload = null;

      spyOn(window as any, 'FileReader').and.returnValue(fileReaderSpy);

      component.onFileSelected(event);

      expect(fileReaderSpy.readAsDataURL).toHaveBeenCalledWith(file);

      // Simulamos evento onload para verificar el console.log
      const fakeEvent = { target: { result: 'data:fake' } };
      fileReaderSpy.onload(fakeEvent);
    });

    it('no debería hacer nada si no hay archivo', () => {
      const event = {
        target: {
          files: []
        }
      };

      const fileReaderSpy = jasmine.createSpyObj('FileReader', ['readAsDataURL']);
      spyOn(window as any, 'FileReader').and.returnValue(fileReaderSpy);

      component.onFileSelected(event);

      expect(fileReaderSpy.readAsDataURL).not.toHaveBeenCalled();
    });
  });

  describe('onUpload', () => {
    it('debería actualizar uploadedFiles, mostrarError y llamar a messageService.add', () => {
      const archivo = new File(['contenido'], 'documento.pdf', { type: 'application/pdf' });
      const event = {
        files: [archivo]
      };

      const messageService = TestBed.inject(MessageService);
      spyOn(messageService, 'add');

      component.onUpload(event);

      expect(component.uploadedFiles).toEqual([archivo]);
      expect(component.mostrarError).toBeFalse();
      expect(messageService.add).toHaveBeenCalledWith({
        severity: 'info',
        summary: 'Archivo subido',
        detail: archivo.name
      });
    });

    it('no debería hacer nada si no hay archivo en event.files', () => {
      const event = { files: [] };

      const messageService = TestBed.inject(MessageService);
      spyOn(messageService, 'add');

      component.onUpload(event);

      expect(component.uploadedFiles).toBeUndefined();
      expect(component.mostrarError).toBeUndefined();
      expect(messageService.add).not.toHaveBeenCalled();
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

  describe('validarDocumento', () => {
    it('debería marcar error si algún documento no tiene archivo', () => {
      const documentosMock = [
        { archivo: null, error: '' },
        { archivo: new File(['contenido'], 'doc.pdf'), error: '' }
      ];

      component.documentosForm.get('documentos')?.setValue(documentosMock);

      component.validarDocumento();

      const documentos = component.documentosForm.get('documentos')?.value;
      expect(documentos[0].error).toBe('El archivo es requerido');
      expect(documentos[1].error).toBe('');
      expect(component.mostrarError).toBeTrue();
    });

    it('no debería marcar error si todos los documentos tienen archivo', () => {
      const documentosMock = [
        { archivo: new File(['contenido'], 'doc1.pdf'), error: '' },
        { archivo: new File(['contenido'], 'doc2.pdf'), error: '' }
      ];

      component.documentosForm.get('documentos')?.setValue(documentosMock);

      component.validarDocumento();

      const documentos = component.documentosForm.get('documentos')?.value;
      expect(documentos[0].error).toBe('');
      expect(documentos[1].error).toBe('');
      expect(component.mostrarError).toBeFalse();
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

  describe('resetForms', () => {
    it('debería resetear todos los formularios, limpiar archivos y beneficiarios, y reiniciar activeIndex', () => {
      // Llenamos algunos datos para asegurarnos que se resetean
      component.clienteForm.patchValue({ cedula: '123' });
      component.coberturasForm.patchValue({ fechaInicio: '2025-01-01' });
      component.pagoForm.patchValue({ monto: 100 });
      component.documentosForm.patchValue({ documentos: [{ archivo: null }] });
      component.uploadedFiles = [new File([''], 'archivo.txt')];
      component.beneficiarios = [{ nombre: 'Juan', parentesco: 'Hermano', porcentaje: 50 }];
      component.activeIndex = 2;

      component.resetForms();

      expect(component.clienteForm.pristine).toBeTrue();
      expect(component.coberturasForm.pristine).toBeTrue();
      expect(component.pagoForm.pristine).toBeTrue();
      expect(component.documentosForm.pristine).toBeTrue();
      expect(component.uploadedFiles).toEqual([]);
      expect(component.beneficiarios).toEqual([{ nombre: '', parentesco: '', porcentaje: 100 }]);
      expect(component.activeIndex).toBe(0);
    });
  });
  describe('esCedulaInvalida', () => {
    it('debería retornar true cuando el control cedula está tocado y tiene error cedulaInvalida', () => {
      const cedulaControl = component.clienteForm.get('cedula');

      cedulaControl?.setErrors({ cedulaInvalida: true });
      cedulaControl?.markAsTouched();

      const resultado = component.esCedulaInvalida();

      expect(resultado).toBeTrue();
    });

    it('debería retornar false cuando el control cedula no está tocado', () => {
      const cedulaControl = component.clienteForm.get('cedula');

      cedulaControl?.setErrors({ cedulaInvalida: true });
      cedulaControl?.markAsUntouched();

      const resultado = component.esCedulaInvalida();

      expect(resultado).toBeFalse();
    });

    it('debería retornar false cuando el control cedula no tiene error cedulaInvalida', () => {
      const cedulaControl = component.clienteForm.get('cedula');

      cedulaControl?.setErrors(null);
      cedulaControl?.markAsTouched();

      const resultado = component.esCedulaInvalida();

      expect(resultado).toBeFalse();
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

  it('debería mostrar advertencia y resetear si cliente no encontrado', () => {
    const cedula = '1234567890';
    component.clienteForm.get('buscar')?.setValue(cedula);

    spyOn(window as any, 'validarCedulaEcuatoriana').and.returnValue(() => null); // válido

    clientServiceSpy.getByIdentificationNumber.and.returnValue(of(null));

    component.buscarCliente();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'warn',
      summary: 'Cliente no encontrado'
    }));
    expect(component.clienteEncontrado).toBeFalse();
    expect(component.resetCampos).toHaveBeenCalledWith(cedula);
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


});