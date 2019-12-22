import * as Phaser from 'phaser';
import { Midi } from '@tonejs/midi';

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

interface LabeledNote {
  label: Phaser.GameObjects.Text,
  note: any,
  track: any
}

export class PianoRollScene extends Phaser.Scene {
  // Private members

  /** Black keys only */
  private _blackKeys: Key[] = [];
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
  private _noteLabels: LabeledNote[] = [];
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
  /** White keys only **/
  private _whiteKeys: Key[] = [];

  // Public members
  /** Our current tick */
  public CurrentTick: number = 0;


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
    
    // this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}});
    this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}, fillStyle: {color: 0x55CDFC, alpha: 1}});

    this._keyWidth = this.game.scale.gameSize.width / this._whiteKeys.length;

    this.game.scale.on('resize', this.resize);

    this.createKeyboardSprite();
    this.createGridLines();
    this.createKeyLabels();

    this._info = this.add.text(0, 0, "FPS: 0", { font: '12px Arial' });
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
    if (this._selectedSong)
      this._selectedSong.tracks.forEach(this.drawTrack);
  }

  /**
   * Draws a given track
   */
  private drawTrack(track: any): void {

    // TODO: Determine notes actually within our viewable area.
    let visibleNotes: any[] = track.notes
      .filter((note) => {
        // Note starts in visible area
        if (note.ticks >= this.CurrentTick && note.ticks <= (this.CurrentTick + this.game.scale.gameSize.height))
          return true;

        // Note's duration falls within visible area
        if (note.ticks <= this.CurrentTick && (note.ticks + note.durationTicks >= (this.CurrentTick)))
          return true;

        return false;
      })
      ;


    visibleNotes.forEach((note) => { this.drawNote(note, track); });

    // Remove defunct labels
    let removedLabels: LabeledNote[] = this._noteLabels
      .filter((note: LabeledNote) => (visibleNotes.indexOf(note.note) === -1 && note.track === track));
    this._noteLabels = this._noteLabels.filter((label: LabeledNote) => !removedLabels.includes(label));
    removedLabels.forEach((label: LabeledNote) => { label.label.destroy(); });
  }

  /**
   * Draws a given note
   */ 
  private drawNote(note: any, track: any): void {
    let translatedNote: TranslatedNote = this.translateNote(note.pitch, note.octave);

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


      this._graphics.fillRoundedRect(x, y, width, height, 8);
      this._graphics.strokeRoundedRect(x, y, width, height, 8);

      // Adjust label.
      let label: LabeledNote = this._noteLabels.find((labeled: LabeledNote) => labeled.note == note);
      if (!label) {
        label = {
          note,
          track,
          label: this.add.text(0, 0, note.pitch, {color: '#000000', font: 'Arial 12px'})
        }
        this._noteLabels.push(label);
      }

      label.label.setX(x + (width / 2) - (label.label.displayWidth / 2));
      label.label.setY(y + height - (label.label.displayHeight * 2));
    }
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


// import * as Phaser from 'phaser';
// import { Midi } from '@tonejs/midi';

// export class PianoRollScene extends Phaser.Scene {
//   private info: Phaser.GameObjects.Text = null;
//   // private gridLines: Phaser.Geom.Line[] = [];
//   private verticalLines: Phaser.Geom.Line[] = [];
//   private horizontalLines: Phaser.Geom.Line[] = [];
//   private whiteKeyLabels: Phaser.GameObjects.Text[] = [];
//   private blackKeyLabels: Phaser.GameObjects.Text[] = [];
//   private blackKeyLabelOffsets: number[] = [0, 4, 0, -4, 0, 6, 0, 0, 4, 0, -4, 0, 6, 0, 0, 4, 0, -4, 0, 6, 0];
//   private noteLabels: Phaser.GameObjects.text[] = [];

//   private graphics;
//   private whiteKeyCount: number = 22;

//   private noteGroup: Phaser.GameObjects.Group = null;

//   private SelectedSong: Midi = null;


//   private loadedSprites: any = {};
//   private CurrentTick: number = 0;

//   private get WhiteKeyWidth(): number {
//     return (this.game.scale.gameSize.width) / this.whiteKeyCount;
//   }

//   constructor() {
//     super({key: 'pianoroll'});

//     this.create = this.create.bind(this);
//     this.preload = this.preload.bind(this);
//     this.update = this.update.bind(this);
//     this.resize = this.resize.bind(this);

//     this.drawGrid = this.drawGrid.bind(this);
//     this.createVerticalGridLines = this.createVerticalGridLines.bind(this);
//     this.createHorizontalLines = this.createHorizontalLines.bind(this);
//     this.updateKeyLabels = this.updateKeyLabels.bind(this);
//     this.createKeyLabels = this.createKeyLabels.bind(this);
//     this.createWhiteKeyLabels = this.createWhiteKeyLabels.bind(this);
//     this.createBlackKeyLabels = this.createBlackKeyLabels.bind(this);
//     this.drawNotes = this.drawNotes.bind(this);
//   }

//   init(data: any) {}

//   create(data: any) {
//     this.SelectedSong = data.song;
    
//     // this.bgtile = this.add.tileSprite(0, 0, 1440, 900, 'bgtile');
//     this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x3b3b3b}});
    
    
    
//     this.createVerticalGridLines();
//     // this.createHorizontalLines();

//     this.loadedSprites['keys'] = this.add.sprite(0,0,'keys');
//     this.loadedSprites['keys'].displayWidth = this.game.scale.gameSize.width;
//     this.loadedSprites['keys'].displayHeight = 100;
//     this.loadedSprites['keys'].x = this.game.scale.gameSize.width/2;
//     this.loadedSprites['keys'].y = this.game.scale.gameSize.height - (this.loadedSprites['keys'].displayHeight/2);


//     this.info = this.add.text(10, 10, '', { font: '12px Arial', fill: '#FFFFFF'});
//     this.createKeyLabels();
//     this.game.scale.on('resize', this.resize);


//   }

//   preload() {
//     this.load.setBaseURL('');
//     this.load.image('bgtile', 'assets/images/pianoGrid.png');
//     this.load.image('keys', 'assets/images/PianoKeys.png');
//   }

//   update(time: number, delta: number) {
//     this.info.setText(
//       'FPS: ' + this.game.loop.actualFps.toFixed(2) + '\n'
//       + 'Tick: ' + this.CurrentTick + '\n'
//       + 'Labels: ' + this.noteLabels.length
//       //+ 'Size: ' + this.game.scale.gameSize.width + 'x' + this.game.scale.gameSize.height + '\n'
//       //+ 'Step: ' + this.game.scale.gameSize.width / this.whiteKeyCount
//     );
//     // this.bgtile.tilePositionY -= 1;

//     // console.log(this.game.scale.gameSize);

//     // Draw lines!
//     this.drawGrid();
//     this.drawNotes();
//   }

//   private createKeyLabels() {
//     this.createWhiteKeyLabels();
//     this.createBlackKeyLabels();
//   }

//   private createBlackKeyLabels() {
//     // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
//     let y: number = this.game.scale.gameSize.height - 100;

//     let notes: string[] = ["C#", "E♭", "", "F#", "G#", "B♭", ""];
//     let octaves: number[] = [3, 4, 5];

//     let labelStyle: any = {
//       fill: '#FFFFFF',
//       font: '12px Arial',
//       align: 'center'
//     };

//     octaves.forEach((octave: number, octaveIndex: number) => {
//       notes.forEach((note: string, noteIndex: number) => {
//         // if (note) {
//           // let pitch: string = note + octave;
//           let pitch: string = note;
//           let x: number = (((octaveIndex * notes.length) + noteIndex) * this.WhiteKeyWidth) + this.WhiteKeyWidth;
//           this.blackKeyLabels.push(this.add.text(x, y, pitch, labelStyle));
//         // }
//       });
//     });
//   }


//   private createWhiteKeyLabels() {
//     // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
//     let notes: string[] = ["C", "D", "E", "F", "G", "A", "B"];
//     let octaves: number[] = [3, 4, 5];

//     let y: number = this.game.scale.gameSize.height - 25;

//     let labelStyle: any = {
//       fill: '#000000',
//       font: '12px Arial',
//       align: 'center'
//     };

//     octaves.forEach((octave: number, octaveIndex: number) => {
//       notes.forEach((note: string, noteIndex: number) => {
//         // let pitch: string = note + octave;
//         let pitch: string = note;
//         let x: number = (((octaveIndex * notes.length) + noteIndex) * this.WhiteKeyWidth) + (this.WhiteKeyWidth/2);

//         this.whiteKeyLabels.push(this.add.text(x, y, pitch, labelStyle));
//       });
//     });

//     this.whiteKeyLabels.push(this.add.text(this.game.scale.gameSize.width - (this.WhiteKeyWidth/2), y, "C6", labelStyle));
//   }

//   private createVerticalGridLines() {
//     // let keyStep: number = 800 / this.whiteKeyCount;
//     // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;

//     for (let i=1;i<this.whiteKeyCount;i++) {
//       let x = this.WhiteKeyWidth * i;
//       this.verticalLines.push(new Phaser.Geom.Line(x, 0, x, 900));
//     }
//   }

//   private createHorizontalLines() {
//     for (let i=1;i<10000;i++) {
//       let y = this.game.scale.gameSize.height - (i * 100);
//       this.horizontalLines.push(new Phaser.Geom.Line(0, y, this.game.scale.gameSize.width, y));
//       // this.horizontalLines.push(new Phaser.Geom.Line(0, i * 100, this.game.scale.gameSize.width, i * 100));
//     }
//   }



//   private drawGrid() {
//     // Move existing lines down.
//     // this.gridLines.forEach((line: Phaser.Geom.Line) => { line.})

//     // let vertStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;


//     this.graphics.clear();
//     this.verticalLines.forEach((line: Phaser.Geom.Line, index: number) => {
//       let step: number = this.WhiteKeyWidth * (index + 1);
//       line.x1 = step;
//       line.x2 = step;

//       this.graphics.strokeLineShape(line);
//     });

//     // this.horizontalLines.forEach((line: Phaser.Geom.Line, index: number) => {
//     //   line.y1 += 1;
//     //   line.y2 += 1;

//     //   this.graphics.strokeLineShape(line);
//     // });
//   }



//   private resize(gameSize, baseSize, displaySize, resolution) {
//     // let width = gameSize.width;
//     // let height = gameSize.height;
//     // // Resize cameras
//     // this.cameras.resize(width, height);
    
//     this.loadedSprites['keys'].x = this.game.scale.gameSize.width/2;
//     this.loadedSprites['keys'].y = this.game.scale.gameSize.height - (this.loadedSprites['keys'].displayHeight/2);
//     this.loadedSprites['keys'].displayWidth = this.game.scale.gameSize.width;



//     this.updateKeyLabels(this.whiteKeyLabels, -25);
//     this.updateKeyLabels(this.blackKeyLabels, -75, (this.WhiteKeyWidth / 2), this.blackKeyLabelOffsets);
//   }

//   private updateKeyLabels(labels: Phaser.GameObjects.Text[], yOffset: number = 0, xGlobalOffset: number = 0, xOctaveOffset: number[] = []) {

//     // let keyStep: number = (this.game.scale.gameSize.width) / this.whiteKeyCount;
//     let y: number = this.game.scale.gameSize.height + yOffset;

//     for (let i=0;i<labels.length;i++) {
//       let text: Phaser.GameObjects.Text = labels[i];
//       // let offset: number = (typeof xOffset == 'number' ? xOffset : xOffset[i]);
//       let offset: number = xGlobalOffset;
//       if (xOctaveOffset && xOctaveOffset.length && xOctaveOffset[i])
//         offset += xOctaveOffset[i];

//       text.setX(((i * this.WhiteKeyWidth) + (this.WhiteKeyWidth/2) - (text.width/2)) + offset);

//       text.setY(y);
//     }
//   }

//   private drawNotes() {
//     // this.noteGroup = this.add.group();

//     let color = 0x55CDFC;

//     let pitches: string[] = ["C", "C#", "D", "E♭", "", "F", "F#", "G", "G#", "A", "B♭", "B", ""]
//     let width: number = this.WhiteKeyWidth / 2;

//     let minTick: number = (this.CurrentTick);
//     let maxTick: number = 0;

//     let labelStyle: any = {
//       fill: '#FFFFFF',
//       font: '12px Arial',
//       align: 'center'
//     };


//     this.graphics.fillStyle(color, 1);
//     this.SelectedSong.tracks.forEach((track) => {

//       let notes = track.notes
//         .filter(note => ((note.ticks >= (this.CurrentTick - this.game.scale.gameSize.height) || note.ticks + note.durationTicks >= this.CurrentTick) && (note.ticks <= this.CurrentTick + this.game.scale.gameSize.height)) );

//       // Remove and destroy any note labels for notes not being drawn.
//       let toRemove: any[] = this.noteLabels.filter((label) => notes.findIndex((note) => label.note == note));
//       this.noteLabels


//       // console.log("Notes: ", notes.length);
//       notes.forEach((note) => {
//         let pitchIndex = pitches.indexOf(note.pitch);
//         if (pitchIndex != -1) {
//           let x: number = 0;
//           let y: number = 0;

//           let height: number = note.durationTicks;

//           // x = ((pitches.indexOf[note.pitch]))
//           x = pitchIndex * this.WhiteKeyWidth
//           x += width/2;

//           // Determine relative value of the note's tick vs. our current
//           let relativeTick: number = note.ticks - this.CurrentTick;



//           // Invert
//           y = this.game.scale.gameSize.height - relativeTick;

//           // Shift for height
//           y -= height;
          
//           // Adjust for key display
//           // y += this.loadedSprites['keys'].height;

          

//           this.graphics.fillRoundedRect(x, y, width, height, 8);

//           // Do we have a label?
//           let noteLabel: any = this.noteLabels.find((label: any) => label.note = note);

//           if (!noteLabel) {
//             noteLabel = {
//               note: note,
//               label: this.add.text(0, 0, note.pitch + note.octave, labelStyle)
//             };
//             this.noteLabels.push(noteLabel);
//           }

//           noteLabel.label.x = (x + width/2) - 6;
//           noteLabel.label.y = (y - 24) + height;
//         }
//       });
      
//       // track.notes.forEach((note) => {
//       //   this.graphics.fillRoundedRect(0, note.ticks, 22, note.durationTicks, 8);
//       // })
//     })

//     // this.SelectedSong.tracks.forEachlet t
//     // let track = this.SelectedSong.tracks[0];

//     // track.notes.forEach((note) => {
//     //   this.graphics.fillRoundedRect(0, note.ticks, 22, note.durationTicks);
//     // });



    
//   }

  
// }