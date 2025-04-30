import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSegurosComponent } from './list-seguros.component';

describe('ListSegurosComponent', () => {
  let component: ListSegurosComponent;
  let fixture: ComponentFixture<ListSegurosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListSegurosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSegurosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
