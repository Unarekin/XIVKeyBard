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

  private _instruments: any = {
    'bass-electric': {}
  }

  constructor() {
    super();

    this.shiftOctave = this.shiftOctave.bind(this);
    this.Play = this.Play.bind(this);
    this.Pause = this.Pause.bind(this);
    this.Stop = this.Stop.bind(this);
  }

  /**
   * Shifts a note by a given octave amount.
   * @param {object} note
   * @param {number} amount
   * @returns {object}
   */
  private shiftOctave(note: any, amount: number): any {
    let shifted: any = {};
    for (let prop in note)
      shifted[prop] = note[prop];

    if (shifted.pitch && shifted.octave) {
      shifted.octave += amount;
      shifted.name = shifted.pitch + shifted.octave;
    } else {
      let pitch: string = note.name.match(/\D+/gi)[0];
      let octave: number = (note.name.match(/\d+/gi)[0] ? parseInt(note.name.match(/\d+/gi)[0]) : 0);
      shifted.name = pitch + (octave+1);
    }
    return shifted;
  }

  public Play(midi: Midi, settings: TrackSettings[], startingTime: number = 0): Promise<void> {
    this._playingSong = midi;
    this.emit('play', midi);
    return new Promise((resolve, reject) => {
      const now = Tone.now();

      let lastNote: any = {time: 0, duration: 0};

      midi.tracks.forEach((track, index) => {
        if (settings[index] && !settings[index].display)
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
          .map((note) => {
            if (settings[index] && settings[index].octave !== 0)
              return this.shiftOctave(note, settings[index].octave);
            else
              return note;
          })
          .filter((note) => (note.octave >= 3 && note.octave <= 6) || note.name=="C6")
          .filter((note) => note.time >= startingTime)
          ;


        notes.forEach((note) => {
          synth.triggerAttackRelease(note.name, note.duration, note.time + now - startingTime, note.velocity);
        });

        if (track.notes.length) {
          let trackLast = track.notes.reduce((prev, curr) => curr.time + curr.duration > prev.time + prev.duration ? curr : prev);
          if (trackLast.time + trackLast.duration > lastNote.time + lastNote.duration)
            lastNote = trackLast;
        }
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
