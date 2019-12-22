import { Component, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { PianoRollComponent } from '../../shared/components';

@Component({
  selector: 'keybard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public SelectedSong: Midi = null;
  public CurrentTick: number = 0;
  public IsPlaying: boolean = false;

  private updateTimer: any = null;

  // @ViewChild(PianoRollComponent, { static: true })
  // private pianoRoll: PianoRollComponent = null;

  constructor(private zone: NgZone) {
    this.SetSelectedSong = this.SetSelectedSong.bind(this);

    this.ScrollStart = this.ScrollStart.bind(this);
    this.ScrollStop = this.ScrollStop.bind(this);
    this.ScrollSeek = this.ScrollSeek.bind(this);
    this.ScrollPause = this.ScrollPause.bind(this);
    this.TickChange = this.TickChange.bind(this);

    this.tick = this.tick.bind(this);
  }

  ngOnInit(): void {
    this.updateTimer = setInterval(this.tick, 1);
  }

  ngOnDestroy(): void {
    if (this.updateTimer)
      clearInterval(this.updateTimer);
  }

  public SetSelectedSong($event) { this.SelectedSong = $event; }

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
  public ScrollSeek(time: number) { }
  public TickChange(tick: number) {
    this.zone.run(() => {
      this.CurrentTick = tick;
    });
  }

  private tick() {
    if (this.IsPlaying) {
      this.zone.run(() => { this.CurrentTick++; })
    }
  }

}
