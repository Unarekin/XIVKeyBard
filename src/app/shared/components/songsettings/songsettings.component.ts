import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { TrackSettings, ColorSet } from '../../interfaces';

@Component({
  selector: 'keybard-songsettings',
  templateUrl: './songsettings.component.html',
  styleUrls: ['./songsettings.component.scss']
})
export class SongSettingsComponent implements OnInit {

  @Input()
  public SelectedSong: Midi = null;
  @Input()
  public TrackSettings: TrackSettings[] = [];

  public PlayAudio: boolean = false;
  @Output()
  public onToggleAudio = new EventEmitter();

  @Output()
  public onScrollToTick = new EventEmitter();


  constructor() {
    this.ToggleAll = this.ToggleAll.bind(this);
    this.ScrollToTick = this.ScrollToTick.bind(this);
    this.ToggleAudio = this.ToggleAudio.bind(this);
  }

  ngOnInit() {
  }

  public ToggleAll($event) {
    this.TrackSettings.forEach((setting: TrackSettings) => { setting.display = $event.checked; });
  }

  public ScrollToTick(tick: number) {
    this.onScrollToTick.emit(tick);
  }

  public ToggleAudio(value) {
    this.onToggleAudio.emit(value.checked);
  }

}
