import { Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, Validator } from '@angular/forms';
import { validarCedulaEcuatoriana } from '../utils/cedula.util';

@Directive({
  selector: '[cedulaEcuatoriana]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: CedulaEcuatorianaDirective,
      multi: true
    }
  ]
})
export class CedulaEcuatorianaDirective implements Validator {
  validate(control: AbstractControl): ValidationErrors | null {
    return validarCedulaEcuatoriana()(control);
  }
}
