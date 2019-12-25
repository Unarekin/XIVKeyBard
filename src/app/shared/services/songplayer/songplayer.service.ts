import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';
import { Midi } from '@tonejs/midi';
import * as Tone from 'tone';
import { TrackSettings } from '../../interfaces';

@Injectable({
  providedIn: 'root'
})
export class SongplayerService extends EventEmitter {
  private _playingSong: Midi = null;
  private _synths: Tone.PolySynth[] = [];

  constructor() {
    super();
  }

  public Play(midi: Midi, settings: TrackSettings[], startingTime: number = 0): Promise<void> {
    this._playingSong = midi;
    this.emit('play', midi);
    return new Promise((resolve, reject) => {
      const now = Tone.now();

      let lastNote: any = {time: 0, duration: 0};

      midi.tracks.forEach((track, index) => {
        if (!settings[index].display)
          return;

        let synth = new Tone.PolySynth(4, Tone.Synth, {
          envelope: {
            attack: 0.02,
            decay: 0.1,
            sustain: 0.3,
            release: 1
          }
        }).toMaster();

        this._synths.push(synth);

        let notes = track
          .notes
          .filter((note) => (note.octave >= 3 && note.octave <= 6) || note.name=="C6")
          .filter((note) => note.time >= startingTime)
          ;


        notes.forEach((note) => {
          synth.triggerAttackRelease(note.name, note.duration, note.time + now - startingTime, note.velocity);
        });

        let trackLast = track.notes.reduce((prev, curr) => curr.time + curr.duration > prev.time + prev.duration ? curr : prev);
        if (trackLast.time + trackLast.duration > lastNote.time + lastNote.duration)
          lastNote = trackLast;
      });

      setTimeout(() => {
        if (this._playingSong) {
          this.Stop();
          resolve();
        }
      }, (lastNote.time + lastNote.duration) * 1000);
    });
  }

  public Pause() {
    this.emit('pause', this._playingSong);
    Tone.Transport.toggle();
  }

  public Stop() {
    this.emit('stop', this._playingSong);
    this._playingSong = null;
    while (this._synths.length) {
      let synth = this._synths.shift();
      synth.dispose();
    }
  }
}
