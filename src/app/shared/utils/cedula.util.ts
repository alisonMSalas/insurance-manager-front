import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validarCedulaEcuatoriana(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const cedula = control.value;

    if (!cedula || cedula.length !== 10) return { cedulaInvalida: true };

    const digitos = cedula.split('').map(Number);
    const provincia = parseInt(cedula.substring(0, 2), 10);
    const tercerDigito = digitos[2];

    if (isNaN(provincia) || provincia < 1 || provincia > 24 || tercerDigito >= 6) {
      return { cedulaInvalida: true };
    }

    let suma = 0;
    for (let i = 0; i < 9; i++) {
      let valor = digitos[i];
      if (i % 2 === 0) {
        valor *= 2;
        if (valor > 9) valor -= 9;
      }
      suma += valor;
    }

    const digitoVerificador = (10 - (suma % 10)) % 10;
    if (digitoVerificador !== digitos[9]) {
      return { cedulaInvalida: true };
    }

    return null;
  };
}
