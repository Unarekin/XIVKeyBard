import { Component, OnInit, ViewChild, NgZone, OnDestroy } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { PianoRollComponent } from '../../shared/components';
import { MidiFileService } from '../../shared/services';

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

  private _ticksPerMillisecond: number = 0;
  private _lastUpdate: number = 0;

  // @ViewChild(PianoRollComponent, { static: true })
  // private pianoRoll: PianoRollComponent = null;

  constructor(private zone: NgZone, private midifile: MidiFileService) {
    this.SetSelectedSong = this.SetSelectedSong.bind(this);

    this.ScrollStart = this.ScrollStart.bind(this);
    this.ScrollStop = this.ScrollStop.bind(this);
    this.ScrollSeek = this.ScrollSeek.bind(this);
    this.ScrollPause = this.ScrollPause.bind(this);
    this.TickChange = this.TickChange.bind(this);

    this.tick = this.tick.bind(this);
  }

  ngOnInit(): void {
    this._lastUpdate = Date.now();
    // this.updateTimer = setInterval(this.tick, 1);
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.updateTimer)
      clearInterval(this.updateTimer);
  }

  public SetSelectedSong($event) {
    this.SelectedSong = $event;
    this._ticksPerMillisecond = 1 / (this.midifile.GetTimeFromTicks($event, 1));
    console.log("Ticks per ms: ", this._ticksPerMillisecond);
  }


  public ScrollStart() {
    this._lastUpdate = Date.now();
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
    window.requestAnimationFrame(() => {
      if (this.IsPlaying) {
        // this.zone.run(() => { this.CurrentTick++; })
        this.zone.run(() => {
          // Get current tempo
          let delta: number = Date.now() - this._lastUpdate;
          this._lastUpdate = Date.now();
          this.CurrentTick += (delta * this._ticksPerMillisecond);
        });
      }
    });

    setImmediate(this.tick);
  }

}
