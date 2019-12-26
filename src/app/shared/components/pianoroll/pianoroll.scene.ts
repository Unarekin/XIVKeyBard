import * as Phaser from 'phaser';
import { Midi } from '@tonejs/midi';
import { TrackSettings, ColorSet } from '../../interfaces';

interface Key {
  note: string,
  octave: number,
  pitch: string,
  sharp: boolean,
  flat: boolean,
  natural: string,
  label?: Phaser.GameObjects.Text
}

interface TranslatedNote {
  note: string,
  octave: number,
  pitch: string
}

// interface LabeledNote {
//   label: Phaser.GameObjects.Text,
//   note: any,
//   track: any
// }

export class PianoRollScene extends Phaser.Scene {
  // Private members

  /** Black keys only */
  private _blackKeys: Key[] = [];
  /** Default TrackSettings */
  private _defaultSettings: TrackSettings = {
    display: true,
    octave: 0,
    colors: {
      foreground: '#FFFFFF',
      background: '#000000',
      blackorwhite: '#FFFFFF'
    }
  };
  /** Keys with flat versions */
  private _flats: string[] = ["E", "B"];
  /** Phaser graphics object */
  private _graphics: Phaser.GameObjects.Graphics = null;
  /** The lines in our note grid */
  private _gridLines: Phaser.Geom.Line[] = [];
  /** Info to draw */
  private _info: Phaser.GameObjects.Text = null;
  /** Text objects to label keys in game view */
  private _keyLabels: Phaser.GameObjects.Text[] = [];
  /** Custom position shifts for key labels */
  private _keyLabelShifts: any[] = [
    { pitch: 'C#3', x: -2, y: 0},
    { pitch: 'E♭3', x: 4, y: 0 },
    { pitch: 'F#3', x: -6, y: 0 },
    { pitch: 'B♭3', x: 6, y: 0 },
    { pitch: 'C#4', x: -2, y: 0 },
    { pitch: 'E♭4', x: 4, y: 0},
    { pitch: 'F#4', x: -6, y: 0 },
    { pitch: 'B♭4', x: 6, y: 0 },
    { pitch: 'C#5', x: -2, y: 0 },
    { pitch: 'E♭5', x: 4, y: 0 },
    { pitch: 'F#5', x: -6, y: 0},
    { pitch: 'B♭5', x: 6, y: 0}
  ]
  /** Known key elements.  C3 - C6*/
  private _keys: Key[] = [];
  /** Drawn width of keys */
  private _keyWidth: number = 0;
  /** Keys to display.  C, D, etc */
  private _notes: string[] = ["C", "D", "E", "F", "G", "A", "B"];
  /** Text objects to label individual notes */
  private _noteLabels: Phaser.GameObjects.Text[] = [];
  /** Octaves represented. 3-5 (C6 isn't a full octave) */
  private _octaves: number[] = [3,4,5];
  /** The song we are currently playing. */
  private _selectedSong: Midi = null;
  /** Keys that have sharp versions */
  private _sharps: string[] = ["C", "F", "G"];  
  /** Sprites that we have loaded (Probably just the keyboard) */
  private _sprites: any = {};
  /** Number of ticks displayed */
  private _ticksDisplayed: number = 0;
  /** Visible notes */
  private _visibleNotes: any[] = [];
  /** White keys only **/
  private _whiteKeys: Key[] = [];

  // Public members
  /** Our current tick */
  public CurrentTick: number = 0;

  /** Settings for individual tracks */
  public TrackSettings: TrackSettings[] = [];


  // Constructor
  constructor() {
    super({key: 'pianoroll'});

    // Since we use the modulo operator, and javascript has a bug in regards to negative numbers,
    // let's overload the Number.prototype.mod function and fix it.


    // Create known notes
    this._octaves.forEach((octave: number) => {
      this._notes.forEach((note: string) => {
        this._keys.push(this.createKey(note, octave));
        if (this._sharps.includes(note))
          this._keys.push(this.createKey(note, octave, true));
        if (this._flats.includes(note))
          this._keys.push(this.createKey(note, octave, false, true));
      });
    });
    // Add C6
    this._keys.push(this.createKey("C", 6));

    this._whiteKeys = this._keys.filter((key: Key) => !key.sharp && !key.flat);
    this._blackKeys = this._keys.filter((key: Key) => key.sharp || key.flat);



    // Explicitly bind functions to self to ensure context is retained

    // Don't bind the Phaser specific functions, they already have their own context.
    let unbound: string[] = ["create", "update", "preload"];
    for (let prop in this) {
      if (typeof this[prop] == 'function' && !unbound.includes(prop))
        this[prop] = (<any>this[prop]).bind(this);
    }
  }
  // Phaser methods

  /** Create */
  create(data: any) {
    this._selectedSong = data.song;
    this.TrackSettings = data.settings || {};
    
    // this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}});
    this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}, fillStyle: {color: 0x55CDFC, alpha: 1}});

    this._keyWidth = this.game.scale.gameSize.width / this._whiteKeys.length;

    this.cameras.main.setBackgroundColor('#333333');
    this.game.scale.on('resize', this.resize);

    this.createKeyboardSprite();
    this.createGridLines();
    this.createKeyLabels();

    this._info = this.add.text(5, 5, "FPS: 0", { font: '12px Arial' });
  }

  /** Preload */
  preload() {
    this.load.setBaseURL('');
    this.load.image('keyboard', 'assets/images/PianoKeys.png');
  }

  /**
   * Update
   * @param {number} time - Current time
   * @param {number} delta - Change in time from previous update.
   */
  update(time: number, delta: number) {
    this._info.setText("FPS: " + Math.floor(this.game.loop.actualFps));

    // Graphics draw calls
    this._graphics.clear();
    this.drawGrid();
    this.drawSong();
  }

  /** Called with the game space is resized */
  private resize() {
    this._keyWidth = this.game.scale.gameSize.width / (this._keys.filter((key: Key) => !key.flat && !key.sharp).length);
    this._ticksDisplayed = this.game.scale.gameSize.height;
    this.resizeKeyboardSprite();
    this.resizeGridLines();
    this.resizeKeyLabels();
  }


  // Private methods


  /**
   * Calculates the displayed boundaries of a given note.
   * @param {object} note
   * @returns {Phaser.Geom.Rectangle}
   */
  private calculateNoteBounds(note): Phaser.Geom.Rectangle {
    let x: number = 0;
    let y: number = 0;

    let width: number = this._keyWidth;
    let height: number = note.durationTicks;

    if (this.isSharp(note.pitch) || this.isFlat(note.pitch))
      width /= 4;
    else
      width /= 2;

    // Determine y
    // Shift down so y=0 is along bottom line
    y += this.game.scale.gameSize.height;
    // Shift up so y=0 is along top of keyboard sprite
    y -= this._sprites['keyboard'].displayHeight;
    // Shift up by height of note, so y=h is along bottom line
    y -= height;
    // Shift up by difference between current tick and note tick
    y -= (note.ticks - this.CurrentTick);

    // Determine x
    // Find the natural note position
    // x = this._whiteKeys.findIndex((key: Key) => 
    let natural: string = this.natural(note.pitch);
    x = this._whiteKeys.findIndex((key: Key) => key.pitch == natural + note.octave);
    if (x !== -1) {

      x *= this._keyWidth;
      // if (this.isSharp(note.pitch)) {

      // } else if (this.isFlat(note.pitch)) {

      // } else {
      //   x += this._keyWidth;
      // }

      // x -= width / 2;

      x += (this._keyWidth / 2) - (width / 2);

      if (this.isSharp(note.pitch))
        x += this._keyWidth/2;
      if (this.isFlat(note.pitch))
        x -= this._keyWidth/2;
    }

    return new Phaser.Geom.Rectangle(x, y, width, height);
  }


  /**
   * Performs a shallow comparison of two objects for equivalence.
   * @param {any} first
   * @param {any} second
   * @returns {boolean}
   */
  private compareObjects(first: any, second: any): boolean {
    for (let key in first) {
      if (!(key in first) || first[key] !== second[key])
        return false;
    }

    for (let key in second) {
      if (!(key in first) || first[key] !== second[key])
        return false;
    }

    return true;
  }

  /** Creates our grid lines */
  private createGridLines() {
    this._keys
      .filter((key: Key) => !key.flat && !key.sharp)
      .forEach((key: Key, index: number) => {
        let x: number = (this._keyWidth * (index+1));
        this._gridLines.push(new Phaser.Geom.Line(x, 0, x, this.game.scale.gameSize.height));
      });
  }

  /**
   * Creates a Key representation
   * @param {note} string
   * @param {octave} number
   * @param {sharp} boolean
   * @param {flat} boolean
   * @returns {Key}
     */
  private createKey(note: string, octave: number, sharp: boolean = false, flat: boolean = false): Key {
    return {
      note,
      octave,
      pitch: note + (sharp ? '#' : (flat ? '♭' : '')) + octave,
      sharp,
      flat,
      natural: this.natural(note)
    };
  }

  /** Creates keyboard sprite */
  private createKeyboardSprite() {
    let sprite: Phaser.GameObjects.Sprite = this.add.sprite(0, 0, 'keyboard');
    sprite.displayWidth = this.game.scale.gameSize.width;
    sprite.displayHeight = 100;
    sprite.x = this.game.scale.gameSize.width / 2;
    sprite.y = this.game.scale.gameSize.height - (sprite.displayHeight/2);
    sprite.setDepth(5);

    this._sprites['keyboard'] = sprite;
  }

  /** Creates key labels */
  private createKeyLabels() {
    this._keys.forEach((key: Key) => {
      key.label = this.add.text(0, 0, key.note + (key.sharp ? '#' : (key.flat ? '♭' : '')), {
        fill: (key.sharp || key.flat ? '#FFFFFF' : '#000000'),
        font: '12px Arial'
      });

      key.label.setDepth(10);
    });
  }

  // Drawing methods

  /** Draw the note fall grid */
  private drawGrid(): void {
    // this._gridLines.forEach(this._graphics.strokeLineShape);
    this._gridLines.forEach((line: Phaser.Geom.Line) => { this._graphics.strokeLineShape(line); });
  }


  /**
   * Draws the selected song to screen
   */
  private drawSong(): void {
    if (this._selectedSong) {
      this._visibleNotes=[];

      this._selectedSong
        .tracks
        .forEach((track: any, index: number) => {
          this._visibleNotes.push([]);

          if (this.TrackSettings[index] && this.TrackSettings[index].display)
            this.drawTrack(track, index);
        });

      this.drawNoteLabels();
    }
  }


  /**
  * Draws a given track
  */
  private drawTrack(track: any, index: number): void {
    let settings: TrackSettings = (this.TrackSettings[index] ? this.TrackSettings[index] : this._defaultSettings);

    let visible: any[] = track.notes
      .filter((note) => {
        return (
             note.ticks >= this.CurrentTick && note.ticks <= (this.CurrentTick + this.scale.gameSize.height)
          || note.ticks < this.CurrentTick && (note.durationTicks + note.ticks) >= this.CurrentTick
        );
      })
      .map((note) => {
        let translated: TranslatedNote = this.translateNote(note.pitch, note.octave);

        let shifted: any = {};
        // Shallow copy
        for (let prop in note)
          shifted[prop] = note[prop];

        if (settings.octave !== 0)
          shifted = this.shiftOctave(shifted, settings.octave);

        return shifted;
      })
      .filter((note) => {
        return ((note.octave >= 3 && note.octave <= 6) || note.name === "C6");
      })
      ;

    this._visibleNotes[index] = visible;
    // Shift and translate notes.


    visible.forEach((note) => { this.drawNote(note, track, settings); });
  }


  /**
   * Draws a given note
   */ 
  private drawNote(note: any, track: any, settings: TrackSettings): void {
    // let octaveNote = (settings.octave !== 0 ? this.shiftOctave(note, settings.octave) : note);
    // let translatedNote: TranslatedNote = this.translateNote(octaveNote.pitch, octaveNote.octave);

    // octaveNote.name = translatedNote.pitch;
    // octaveNote.octave = translatedNote.octave;
    // octaveNote.pitch = translatedNote.note;

    let bounds: Phaser.Geom.Rectangle = this.calculateNoteBounds(note);
    let fillColor: number = parseInt(settings.colors.background.replace(/^#/, ''), 16);
    this._graphics.fillStyle(fillColor);
    this._graphics.fillRoundedRect(bounds.x, bounds.y, bounds.width, bounds.height, 8);
  }

  private drawNoteLabels() {
    let labelIndex: number = 0;
    // Hide all
    this._noteLabels.forEach((label: Phaser.GameObjects.Text) => {
      label.setActive(false);
      label.setVisible(false);
    });

    this._visibleNotes.forEach((notes: any, trackIndex: number) => {
      let settings: TrackSettings = this.TrackSettings[trackIndex] || this._defaultSettings;
      notes.forEach((note, noteIndex) => {
        let label: Phaser.GameObjects.Text;
        if (!this._noteLabels[labelIndex]) {
          // Create
          label = this.add.text(0, 0, note.pitch, {color: settings.colors.foreground, font: 'Arial 12px'});
          this._noteLabels.push(label);
        } else {
          label = this._noteLabels[labelIndex];
        }

        label.setActive(true);
        label.setVisible(true);
        label.setText(note.pitch);
        label.setColor(settings.colors.foreground);
        let bounds: Phaser.Geom.Rectangle = this.calculateNoteBounds(note);
        label.setX(bounds.x + (bounds.width/2) - (label.displayWidth / 2));
        label.setY(bounds.y + bounds.height - (label.displayHeight * 2));
        labelIndex++;
      });
    });

  }

  /**
   * Returns if the given key is a flat.
   * @param {string} note
   * @returns {boolean}
   */
  private isFlat(note: string): boolean {
    return note.substr(-1) === '♭';
  }

  /**
   * Returns if the given key is a sharp
   * @param {string} note
   * @returns {boolean}
   */ 
  private isSharp(note: string): boolean {
    return note.substr(-1) === '#';
  }

  /**
   * Javascript has a bug in regards to the % operator and negative numbers.
   * To circument this, we provide a custom function to calculate modulus.
   * @param {number} value
   * @param {number} mod
   * @returns {number}
   */
  private mod(value: number, mod: number): number {
    return ((value % mod) + mod) % mod;
  }

  /**
   * Determines the natural note of a given value.
   * (IE:  C# = C)
   * @param {note} note
   * @returns {string}
   */
  private natural(note: string): string {
    let right: string = note.substr(-1);

    if (right == '#' || right == '♭')
      return note.substr(0, note.length-1);
    else
      return note;
  }

  /** Moving grid lines on resize event */
  private resizeGridLines() {
    this._gridLines.forEach((line: Phaser.Geom.Line, index: number) => {
      let x: number = this._keyWidth * (index + 1);
      line.setTo(x, 0, x, this.game.scale.gameSize.height);
    });
  }

  /** Resizes keyboard sprite on resize event */
  private resizeKeyboardSprite() {
    let sprite: Phaser.GameObjects.Sprite = this._sprites['keyboard'];
    if (sprite) {
      sprite.x = this.game.scale.gameSize.width / 2;
      sprite.y = this.game.scale.gameSize.height - (sprite.displayHeight / 2);
      sprite.displayWidth = this.game.scale.gameSize.width;
    }
  }

  /** Repositions key labels on resize event */
  private resizeKeyLabels() {
    let skips: number = 0;

    this._whiteKeys.forEach((key: Key, index: number) => {
      if (key.label) {
        let y: number = this.game.scale.gameSize.height - 24;
        let x: number = (this._keyWidth * index) + (this._keyWidth / 2) - (key.label.displayWidth / 2);

        let offset: any = this._keyLabelShifts.find((shift: any) => shift.pitch === key.pitch);
        if (offset) {
          y += offset.y;
          x += offset.x;
        }

        key.label.setX(x);
        key.label.setY(y);
      }
    });

    this._blackKeys.forEach((key: Key, index: number) => {
      if (key.label) {
        let sprite: Phaser.GameObjects.Sprite = this._sprites['keyboard'];
        let y: number = this.game.scale.gameSize.height - 24 - (sprite ? sprite.displayHeight/2 : 0);
        let x: number = (this._keyWidth * (index + skips + 1) - (key.label.displayWidth / 2));

        let offset: any = this._keyLabelShifts.find((shift: any) => shift.pitch === key.pitch);
        if (offset) {
          y += offset.y;
          x += offset.x;
        }

        key.label.setX(x);
        key.label.setY(y);
      }

      if (key.pitch == 'E♭3' || key.pitch == 'B♭3' || key.pitch == 'E♭4' || key.pitch == 'B♭4' || key.pitch == 'E♭5' || key.pitch == 'B♭5')
        skips++;
    });
  }

  /**
   * Shifts a note by a specified amount.
   * @example
   * // Returns C
   * shiftNote('D', -1);
   * @example
   * // Returns G
   * shiftNote('C', -1);
   * @param {string} note
   * @param {number} amount
   * @returns {string}
   */
  private shiftNote(note: string, amount: number, octave:number = 1): TranslatedNote {
    let noteIndex: number = this._notes.indexOf(note);

    // If the note is not A-G, throw error.
    if (noteIndex == -1)
      throw new Error(`Attempted to shift invalid note: ${note}`);

    // let octaveShift: number = 

    let shiftedIndex = this.mod(amount, this._notes.length);
    let shiftedNote: string = this._notes[shiftedIndex];

    let shiftedOctave = octave + this.wrapCount(shiftedIndex, this._notes.length);
    
    return {
      note: shiftedNote,
      octave: shiftedOctave,
      pitch: shiftedNote + shiftedOctave
    };
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


  /**
   * Translates a note to a note displayed in the Performance UI
   * @param {string} note - The pitch to shift, excluding octave.
   * @param {octave} number
   * @returns {string}
   */
  private translateNote(note: string, octave: number): TranslatedNote {
    // let isSharp = this.isSharp(note);
    // let isFlat = this.isFlat(note);

    let natural: string = this.natural(note);
    
    if (this._notes.includes(natural)) {
      // If it is a displayed note, no need to do anything.
      return {
        note,
        octave,
        pitch: (note + octave)
      };

    } else if (this.isSharp(note)) {
      // Shift to flat equivalent
      return this.shiftNote(note, 1, octave);
    } else if (this.isFlat(note)) {
      // Shift to sharp equivalent
      return this.shiftNote(note, -1, octave);
    } else {
      // We've provided an invalid note value.  IE: J
      throw new Error(`Attempting to translate invalid note: ${note}.`);
    }
  }

  /**
   * Calculates the number of times a value would 'wrap' around a particular modulus
   * @param {number} value
   * @param {number} mod
   * @returns {number}
   */
  private wrapCount(value: number, mod: number): number {
    return Math.floor(value / mod);
  }

  // Public methods


}