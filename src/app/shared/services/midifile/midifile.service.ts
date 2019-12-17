import { Injectable } from '@angular/core';
import { Midi } from '@tonejs/midi';

import { IPCService } from '../ipc/ipc.service';

@Injectable({
  providedIn: 'root'
})
export class MidiFileService {

  constructor(private ipc: IPCService) {
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
    return this.ipc.Send('load-file', path)
      .then((res: any) => {
        return new Midi(res);
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
    return this.ipc.Send('list-file', path);
  }
}
