import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalClientsComponent } from './modal-clients.component';

describe('ModalClientsComponent', () => {
  let component: ModalClientsComponent;
  let fixture: ComponentFixture<ModalClientsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalClientsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
