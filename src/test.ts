import 'zone.js/testing';
import { getTestBed, TestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

// Inicializar el entorno de pruebas de Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Configurar animaciones para las pruebas
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [
      provideNoopAnimations()
    ]
  });
});

// Nota: La limpieza de localStorage/sessionStorage y los spies debe hacerse en cada suite o prueba según sea necesario. 