import { Input, Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Midi } from '@tonejs/midi';
import * as Phaser from 'phaser';

import { PianoRollScene } from './pianoroll.scene';

@Component({
  selector: 'keybard-pianoroll',
  templateUrl: './pianoroll.component.html',
  styleUrls: ['./pianoroll.component.scss']
})
export class PianoRollComponent implements OnInit {

  private _currentTick: number = 0;
  private _selectedSong: Midi = null;

  private phaserGame: Phaser.Game = null;
  private phaserConfig: Phaser.Types.Core.GameConfig = null;

  public IsPlaying: boolean = false;

  public get SelectedSong(): Midi { return this._selectedSong; }
  @Input()
  public set SelectedSong(value: Midi) {
    this._selectedSong = value;

    if (this.phaserGame && this.phaserGame.scene)
      this.phaserGame.scene.start('pianoroll', {song: value});
  }


  public get CurrentTick(): number { return this._currentTick; }

  @Input()
  public set CurrentTick(value: number) {
    let oldValue: number = this._currentTick;
    this._currentTick = value;
    // console.log("Roll tick: ", value);

    if (this.phaserGame)
      this.phaserGame.scene.keys['pianoroll'].CurrentTick = value;
  }






  constructor() {
    this.phaserConfig = {
      type: Phaser.AUTO,
      backgroundColor: '#000000',
      scene: [ PianoRollScene ],
      scale: {
        parent: 'canvasContainer',
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
      }
    };
  }

  ngOnInit() {
    this.phaserGame = new Phaser.Game(this.phaserConfig);
    this.phaserGame.scene.start('pianoroll', {song: this.SelectedSong});
  }

  ngAfterViewInit() {
  }

  public ScrollStart() {
    this.IsPlaying = true;
  }

  public ScrollStop() {
    this.IsPlaying = false;
    this.CurrentTick = 0;
  }
  public ScrollPause() {
    this.IsPlaying = false;
  }

}
