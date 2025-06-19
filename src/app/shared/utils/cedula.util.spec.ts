import { validarCedulaEcuatoriana } from './cedula.util';
import { FormControl } from '@angular/forms';

describe('validarCedulaEcuatoriana', () => {
  const validatorFn = validarCedulaEcuatoriana();

  it('debería retornar null para una cédula válida', () => {
    const control = new FormControl('1710034065');
    expect(validatorFn(control)).toBeNull();
  });

  it('debería retornar error para cédula con longitud incorrecta', () => {
    const control = new FormControl('171003406');  // 9 dígitos
    expect(validatorFn(control)).toEqual({ cedulaInvalida: true });

    const control2 = new FormControl('17100340656');  // 11 dígitos
    expect(validatorFn(control2)).toEqual({ cedulaInvalida: true });
  });

  it('debería retornar error para cédula con provincia inválida', () => {
    const control = new FormControl('2510034065'); // provincia > 24
    expect(validatorFn(control)).toEqual({ cedulaInvalida: true });

    const control2 = new FormControl('0010034065'); // provincia < 1
    expect(validatorFn(control2)).toEqual({ cedulaInvalida: true });
  });

  it('debería retornar error para cédula con tercer dígito >= 6', () => {
    const control = new FormControl('1760034065'); // tercer dígito = 6
    expect(validatorFn(control)).toEqual({ cedulaInvalida: true });
  });

  it('debería retornar error para cédula con dígito verificador inválido', () => {
    const control = new FormControl('1710034064'); // último dígito incorrecto
    expect(validatorFn(control)).toEqual({ cedulaInvalida: true });
  });

  it('debería retornar error para cédula vacía o nula', () => {
    expect(validatorFn(new FormControl(''))).toEqual({ cedulaInvalida: true });
    expect(validatorFn(new FormControl(null))).toEqual({ cedulaInvalida: true });
  });
});
