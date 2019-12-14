import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Midi } from '@tonejs/midi';

@Injectable({
  providedIn: 'root'
})
export class MidiFileService {

  constructor() {
    this.LoadFromBuffer = this.LoadFromBuffer.bind(this);
    this.LoadFromDisk = this.LoadFromDisk.bind(this);
    this.LoadFromURL = this.LoadFromURL.bind(this);
  }

  /**
   * Loads a MIDI file from a given URL.
   * @param {string} url - The URL to load
   * @returns {Promise<Midi>}
   */
  public LoadFromURL(url: string): Promise<Midi> { return Midi.fromUrl(url); }

  /**
   * Loads a MIDI file from disk.
   * @param {string} path - The path of the MIDI file to load.
   * @returns {Promise<Midi>}
   */
  public LoadFromDisk(path: string): Promise<Midi> {
    return new Promise((resolve, reject) => {
      try {
        let res: any = ipcRenderer.sendSync('load-file', path);
        if (res.status == 'error') {
          reject(new Error(res.message));
        } else {
          let midi: Midi = this.LoadFromBuffer(res.data);
          resolve(midi);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Loads a MIDI from a given buffer, likely loaded via FileReader on the front end.
   * @param {Buffer} buffer - File buffer to load
   * @returns {Midi}
   */
  public LoadFromBuffer(buffer: Buffer): Midi { return new Midi(buffer); }

  /**
   * Retrieves a list of MIDI files in a given directory.
   * @param {string} path - the directory to scan.
   * @returns {Promise<string[]>}
   */
  public GetFileList(path: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      try {
        let files: string[] = ipcRenderer.sendSync('list-file', path);
        resolve(files);
      } catch (err) {
        reject(err);
      }
    });
  }
}
