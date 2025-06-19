import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Inicializar el entorno de pruebas de Angular
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting(),
);

// Nota: La configuración de animaciones debe hacerse en cada archivo de prueba que use componentes con animaciones.
// La limpieza de localStorage/sessionStorage y los spies debe hacerse en cada suite o prueba según sea necesario. 