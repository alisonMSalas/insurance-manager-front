import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';  
import { MenuService } from '../../services/menu.service';
import { MenubarModule } from 'primeng/menubar';
import { CommonModule } from '@angular/common';

describe('MenuComponent', () => {
  let component: MenuComponent;
  let fixture: ComponentFixture<MenuComponent>;
  let menuService: MenuService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuComponent, MenubarModule, CommonModule],  
      providers: [
        {
          provide: MenuService,  
          useValue: { getMenu: () => [{ title: 'Test Item', url: '/test', icon: 'test-icon', items: [] }] }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();  
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  
});
