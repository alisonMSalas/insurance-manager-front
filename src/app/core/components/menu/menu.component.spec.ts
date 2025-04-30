import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';  // Asegúrate de importarlo correctamente
import { MenuService } from '../../services/menu.service';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';
import { of } from 'rxjs';  // Para devolver observables si es necesario

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let menuService: MenuService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent, MenubarModule, CommonModule],  // Importa el componente aquí
      providers: [
        {
          provide: MenuService,  // Mock del servicio
          useValue: { getMenu: () => [{ title: 'Test Item', url: '/test', icon: 'test-icon', items: [] }] }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  // Detectar cambios para llamar ngOnInit()
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with menu items from MenuService', () => {
    const mockMenuItems = [
      { title: 'Test Item', url: '/test', icon: 'test-icon', items: [] }
    ];

    // Verificamos que el menú es igual al mock
    expect(component.listMenu).toEqual(mockMenuItems);
  });
});
