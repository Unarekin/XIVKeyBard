import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { MidiFileService, SettingsService } from '../../services';
import { Midi } from '@tonejs/midi';
import { NgxFileDropEntry, FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';

import * as path from 'path';

interface SongEntry {
  source: string,
  path: string
};

@Component({
  selector: 'keybard-songselector',
  templateUrl: './songselector.component.html',
  styleUrls: ['./songselector.component.scss']
})
export class SongSelectorComponent implements OnInit {
  public ScannedSongs: SongEntry[] = [];
  public FileDraggedOver: boolean = false;


  @Output()
  public onSongSelected: EventEmitter<Midi> = new EventEmitter<Midi>();
  

  constructor(private midifile: MidiFileService, private settings: SettingsService) {
    this.ScanAllDirectories = this.ScanAllDirectories.bind(this);
    this.ScanDirectory = this.ScanDirectory.bind(this);
    this.LoadSong = this.LoadSong.bind(this);
    this.FileChange = this.FileChange.bind(this);

    this.Dropped = this.Dropped.bind(this);
    this.FileLeave = this.FileLeave.bind(this);
    this.FileOver = this.FileOver.bind(this);
    this.LoadFromFile = this.LoadFromFile.bind(this);
    this.SetLoadedSong = this.SetLoadedSong.bind(this);
  }

  ngOnInit() {
    this.ScanAllDirectories();
  }

  /**
   * Scans all directories for songs.
   */
  public ScanAllDirectories() {
    let directories: string[] = this.settings.Get("songDirectories");

    directories.forEach((directory: string) => { this.ScanDirectory(directory); });
  }


  /**
   * Refreshes song entries from a particular directory.
   */
  public ScanDirectory(directory: string) {
    this.midifile.GetFileList(directory)
      .then((files: string[]) => {
        let entries: SongEntry[] = files.map((dir: string) => {
          return {
            source: directory,
            name: path.basename(dir, path.extname(dir)),
            path: dir
          };
        });
        this.ScannedSongs = this.ScannedSongs
          .filter((song: SongEntry) => song.source != directory)
          .concat(entries)
          ;
      })
      .catch(console.error);
  }

  private SetLoadedSong(song: Midi) {
    this.onSongSelected.emit(song);
  }

  public LoadSong(song: SongEntry) {
    this.midifile.LoadFromDisk(path.join(song.source, song.path))
      .then((midi: Midi) => {
        midi.name = path.basename(song.path);

        this.SetLoadedSong(midi);
      })
      .catch(console.error);
  }

  private LoadFromFile(file: File) {
    let reader = new FileReader();
    reader.onload = (e: any) => {
      let midi: Midi = this.midifile.LoadFromBuffer(e.target.result);
      midi.name = file.name;

      this.SetLoadedSong(midi);
    }

    reader.readAsArrayBuffer(file);
  }

  public FileChange($event) {
    console.log("Event: ", $event);
    if ($event.target && $event.target.files && $event.target.files[0]) {
      let file = $event.target.files[0];
      this.LoadFromFile(file);
    }
  }

  public Dropped(files: NgxFileDropEntry[]) {
    if (files && files.length) {
      // If, for some reason, we received more than one, we only process the first .mid we can find.
      let droppedFile: NgxFileDropEntry = files.find((file: NgxFileDropEntry) => path.extname(file.relativePath) == ".mid");
      // console.log("Dropped: ", droppedFile);

      if (droppedFile) {
        let fileEntry: FileSystemFileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        // console.log("Entry: ", fileEntry);
        fileEntry.file(this.LoadFromFile);
      }
    }
  }

  public FileOver(event) {
    // console.log(event);
  }

  public FileLeave(event) {
    // console.log(event);
  }



}
