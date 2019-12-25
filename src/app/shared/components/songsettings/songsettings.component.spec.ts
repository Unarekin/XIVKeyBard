import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SongSettingsComponent } from './songsettings.component';

describe('SongSettingsComponent', () => {
  let component: SongSettingsComponent;
  let fixture: ComponentFixture<SongSettingsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SongSettingsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SongSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
