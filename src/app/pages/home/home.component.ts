import { Component, OnInit, ViewChild, NgZone, OnDestroy, ViewContainerRef } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { PianoRollComponent } from '../../shared/components';
import { MidiFileService, ColorsService, SongplayerService } from '../../shared/services';
import { TrackSettings, ColorSet } from '../../shared/interfaces';

@Component({
  selector: 'keybard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  public SelectedSong: Midi = null;
  public CurrentTick: number = 0;
  public IsPlaying: boolean = false;

  public TrackSettings: TrackSettings[] = [];

  private updateTimer: any = null;

  private _ticksPerMillisecond: number = 0;
  private _lastUpdate: number = 0;

  private _playAudio: boolean = false;
  private _scrollTickEnd: number = 0;
  private _scrollTickStart: number = 0;
  private _scrollTickPercentage: number = 0;
  private _scrollTickDistance: number = 0;
  private _scrollInterval: any = null;


  // @ViewChild(PianoRollComponent, { static: true })
  // private pianoRoll: PianoRollComponent = null;

  constructor(
    private zone: NgZone,
    private midifile: MidiFileService,
    private colors: ColorsService,
    private songplayer: SongplayerService
  ) {
    this.SetSelectedSong = this.SetSelectedSong.bind(this);

    this.ScrollStart = this.ScrollStart.bind(this);
    this.ScrollStop = this.ScrollStop.bind(this);
    this.ScrollSeek = this.ScrollSeek.bind(this);
    this.ScrollPause = this.ScrollPause.bind(this);
    this.TickChange = this.TickChange.bind(this);

    this.tick = this.tick.bind(this);
    this.onScrollToTick = this.onScrollToTick.bind(this);
  }

  ngOnInit(): void {
    this._lastUpdate = Date.now();
    // this.updateTimer = setInterval(this.tick, 1);
    this.tick();
  }

  ngOnDestroy(): void {
    if (this.updateTimer)
      clearInterval(this.updateTimer);
    if (this._scrollInterval)
      clearInterval(this._scrollInterval);
  }

  public SetSelectedSong($event) {
    this.SelectedSong = $event;
    this._ticksPerMillisecond = 1 / (this.midifile.GetTimeFromTicks($event, 1));

    let colorSets: ColorSet[] = this.colors.GenerateColorSets(this.SelectedSong.tracks.length);
    colorSets.forEach((set: ColorSet) => {
      this.TrackSettings.push({
        display: true,
        octave: 0,
        colors: set
      });
    });
  }


  public ScrollStart() {
    this._lastUpdate = Date.now();
    this.IsPlaying = true;

    if (this._playAudio) {
      let startTime: number = this.midifile.GetTimeFromTicks(this.SelectedSong, this.CurrentTick) / 1000;
      this.songplayer.Play(this.SelectedSong, this.TrackSettings, this.CurrentTick);
    }
  }
  public ScrollStop() {
    this.IsPlaying = false;
    this.CurrentTick = 0;
    if (this._playAudio)
      this.songplayer.Stop();
  }
  public ScrollPause() {
    this.IsPlaying = false;
    this.songplayer.Stop();
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

  public onScrollToTick(tick: number) {
    this.CurrentTick = tick;
  }

  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4*t*t*t : (t-1) * (2*t-2) * (2*t-2)+1;
  }

  public ToggleAudio(value: boolean) {
    // console.log("Audio toggle: ", value);
    this._playAudio = value;
  }

}
