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
  @Input()
  public SelectedSong: Midi = null;
  @Input()
  public CurrentTick: number = 0;

  private phaserGame: Phaser.Game = null;
  private phaserConfig: Phaser.Types.Core.GameConfig = null;




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
  }

  ngAfterViewInit() {
  }

  public ScrollStart() { }
  public ScrollStop() { }
  public ScrollPause() { }
  public ScrollSeek(time: number) { }

}
