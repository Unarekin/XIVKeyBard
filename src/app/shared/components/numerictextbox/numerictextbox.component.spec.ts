import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NumericTextBoxComponent } from './numerictextbox.component';

describe('NumerictextboxComponent', () => {
  let component: NumericTextBoxComponent;
  let fixture: ComponentFixture<NumericTextBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NumericTextBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumericTextBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
