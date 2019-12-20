import { Component, OnInit, ViewChild } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { PianoRollComponent } from '../../shared/components';

@Component({
  selector: 'keybard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public SelectedSong: Midi = null;
  public CurrentTick: number = 0;

  // @ViewChild(PianoRollComponent, { static: true })
  // private pianoRoll: PianoRollComponent = null;

  constructor() {
    this.SetSelectedSong = this.SetSelectedSong.bind(this);

    this.ScrollStart = this.ScrollStart.bind(this);
    this.ScrollStop = this.ScrollStop.bind(this);
    this.ScrollSeek = this.ScrollSeek.bind(this);
    this.ScrollPause = this.ScrollPause.bind(this);
    this.TickChange = this.TickChange.bind(this);
  }

  ngOnInit(): void { }

  public SetSelectedSong($event) { this.SelectedSong = $event; }

  public ScrollStart() { }
  public ScrollStop() { }
  public ScrollPause() { }
  public ScrollSeek(time: number) { }
  public TickChange(tick: number) { this.CurrentTick = tick; }

}
