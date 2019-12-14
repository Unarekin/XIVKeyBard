import { TestBed } from '@angular/core/testing';

import { MidiControllerService } from './midicontroller.service';

describe('MidiControllerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MidiControllerService = TestBed.get(MidiControllerService);
    expect(service).toBeTruthy();
  });
});
