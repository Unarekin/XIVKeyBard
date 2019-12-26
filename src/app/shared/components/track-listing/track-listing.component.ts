import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TrackSettings, ColorSet } from '../../interfaces';
import { Midi } from '@tonejs/midi';

import {
  faRedo,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'keybard-track-listing',
  templateUrl: './track-listing.component.html',
  styleUrls: ['./track-listing.component.scss']
})
export class TrackListingComponent implements OnInit {

  public Icons: any = {
    jump: faRedo,
    visible: faEye,
    invisible: faEyeSlash
  }

  @Input()
  public Track: any = null;
  @Input()
  public Settings: TrackSettings = null;

  public PresetColors: string[] = ["#ffffff", "000000"];

  public ShowBGPicker: boolean = false;
  public ShowFGPicker: boolean = false;

  @Output()
  public onScrollToTick = new EventEmitter();

  constructor() {

    this.ChangeColorBG = this.ChangeColorBG.bind(this);
    this.ChangeColorFG = this.ChangeColorFG.bind(this);
    this.JumpToTrack = this.JumpToTrack.bind(this);
    this.OctaveShiftChange = this.OctaveShiftChange.bind(this);
  }

  ngOnInit() {
  }

  public ChangeColorBG(color) {
    this.Settings.colors.background=color;
  }

  public ChangeColorFG(color) {
    this.Settings.colors.foreground=color;
  }

  public JumpToTrack(): void {
    // Get first tick.
    let firstTick: number = this.Track.notes.reduce((curr, prev) => curr.ticks < prev.ticks ? curr : prev).ticks;
    // console.log("First: ", firstTick);
    this.onScrollToTick.emit(firstTick);
  }

  public OctaveShiftChange($event) {
    console.log("Octave shift: ", $event);
    console.log(this.Settings.octave);
  }
}
