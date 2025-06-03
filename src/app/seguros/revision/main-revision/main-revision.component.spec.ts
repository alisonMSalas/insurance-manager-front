import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainRevisionComponent } from './main-revision.component';

describe('MainRevisionComponent', () => {
  let component: MainRevisionComponent;
  let fixture: ComponentFixture<MainRevisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainRevisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainRevisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
