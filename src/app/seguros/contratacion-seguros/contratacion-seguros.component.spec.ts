import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContratacionSegurosComponent } from './contratacion-seguros.component';

describe('ContratacionSegurosComponent', () => {
  let component: ContratacionSegurosComponent;
  let fixture: ComponentFixture<ContratacionSegurosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContratacionSegurosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContratacionSegurosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
