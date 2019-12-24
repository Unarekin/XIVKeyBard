import { Component, OnInit, Input, Output, EventEmitter, NgZone } from '@angular/core';
import { Midi } from '@tonejs/midi';
import { MidiFileService } from '../../services/midifile/midifile.service';
import { TimeDurationPipe } from '../../pipes';

import {
  faPlay,
  faStop,
  faPause
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'keybard-songcontrol',
  templateUrl: './songcontrol.component.html',
  styleUrls: ['./songcontrol.component.scss'],
  providers: [ TimeDurationPipe ]
})
export class SongControlComponent implements OnInit {
  @Output()
  public onStart = new EventEmitter();
  @Output()
  public onStop = new EventEmitter();
  @Output()
  public onPause = new EventEmitter();
  @Output()
  public onTickChange = new EventEmitter();

  @Input()
  public SelectedSong: Midi = null;

  public CurrentTime: number = 0;

  public DisableAnimation: boolean = false;

  private _currentTick: number = 0;
  @Input()
  public set CurrentTick(value: number) {
    this.DisableAnimation = true;
    this.onSliderChanged({value});
    this.DisableAnimation = false;
  }
  public get CurrentTick(): number { return this._currentTick; }
  // public set CurrentTick(value: number) {
  //   // this.zone.run(() => { this._currentTick = value; });
  //   this._currentTick = value;
  // }
  // public get CurrentTick(): number { return this._currentTick; }

  public IsPlaying: boolean = false;
  public IsPaused: boolean = false;


  public Icons: any = {
    play: faPlay,
    stop: faStop,
    pause: faPause
  };

  constructor(private midifile: MidiFileService, private zone: NgZone, private timeduration: TimeDurationPipe) {
    this.onSliderChanged = this.onSliderChanged.bind(this);
    this.StopPressed = this.StopPressed.bind(this);
    this.StartPressed = this.StartPressed.bind(this);
    this.PausePressed = this.PausePressed.bind(this);
    this.formatLabel = this.formatLabel.bind(this);
  }

  ngOnInit() { }

  public onSliderChanged($event) {
    if ($event.value > this.SelectedSong.durationTicks) {
      this.StopPressed();
    } else {
      this._currentTick = $event.value;
      this.CurrentTime = this.midifile.GetTimeFromTicks(this.SelectedSong, this.CurrentTick)/1000;
      this.onTickChange.emit(this.CurrentTick);
    }
  }


  public StopPressed() {
    this.IsPlaying = false;
    this.IsPaused = false;
    this.onStop.emit();
  }
  public StartPressed() {
    this.IsPlaying=true;
    this.IsPaused = false;
    this.onStart.emit();
  }
  public PausePressed() {
    this.IsPlaying=false;
    this.IsPaused = true;
    this.onPause.emit();
  }

  public formatLabel(value: number) {
    let ms: number = this.midifile.GetTimeFromTicks(this.SelectedSong, value);
    let duration: string = this.timeduration.transform(ms/1000);
    return duration;
  }

}
