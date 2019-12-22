import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongControlComponent } from './songcontrol.component';

describe('SongControlComponent', () => {
  let component: SongControlComponent;
  let fixture: ComponentFixture<SongControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
