import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Midi } from '@tonejs/midi';
import { MidiFileService } from '../../services/midifile/midifile.service';

import {
  faPlay,
  faStop,
  faPause
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'keybard-songcontrol',
  templateUrl: './songcontrol.component.html',
  styleUrls: ['./songcontrol.component.scss']
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
  public CurrentTick: number = 0;
  public IsPlaying: boolean = false;
  public IsPaused: boolean = false;


  public Icons: any = {
    play: faPlay,
    stop: faStop,
    pause: faPause
  };

  constructor(private midifile: MidiFileService) {
    this.onSliderChanged = this.onSliderChanged.bind(this);
  }

  ngOnInit() {
  }

  public onSliderChanged($event) {
    console.log("Slide: ", $event);
    this.CurrentTick = $event.value;
    this.CurrentTime = this.midifile.GetTimeFromTicks(this.SelectedSong, this.CurrentTick)/1000;
    this.onTickChange.emit(this.CurrentTick);
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

}
