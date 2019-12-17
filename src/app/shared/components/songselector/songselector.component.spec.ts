import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongSelectorComponent } from './songselector.component';

describe('SongSelectorComponent', () => {
  let component: SongSelectorComponent;
  let fixture: ComponentFixture<SongSelectorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongSelectorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
