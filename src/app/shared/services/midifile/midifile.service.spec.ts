import { TestBed } from '@angular/core/testing';

import { MidiFileService } from './midifile.service';

describe('MidiFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MidiFileService = TestBed.get(MidiFileService);
    expect(service).toBeTruthy();
  });
});
