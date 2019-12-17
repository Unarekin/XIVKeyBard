import { Component, OnInit } from '@angular/core';
import { Midi } from '@tonejs/midi';

@Component({
  selector: 'keybard-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public SelectedSong: Midi = null;

  constructor() {
    this.SetSelectedSong = this.SetSelectedSong.bind(this);
  }

  ngOnInit(): void { }

  public SetSelectedSong($event) { this.SelectedSong = $event; }

}
