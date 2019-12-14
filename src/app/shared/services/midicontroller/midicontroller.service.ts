
import { Injectable } from '@angular/core';
import { EventEmitter } from 'events';

import * as webmidi from 'webmidi';

export interface MIDIDevice {
  id: string,
  name: string,
  type: string,
  manufacturer: string
}

export interface MIDINote {
  number: number,
  name: string,
  octave: number,
  timestamp: number,
  velocity: number
};

@Injectable({
  providedIn: 'root'
})
export class MidiControllerService extends EventEmitter {
  // private _selectedInput: any = null;
  // public get Inputs(): any[] { return webmidi.inputs; }
  // public get Outputs(): any[] { return webmidi.outputs; }
  // public get SelectedInput(): any { return this._selectedInput; }

  // private _devices: MIDIDevice[] = [];
  private _devices: any = {};
  private _selected: MIDIDevice = null;
  private _internalDevices: any = {};

  public get Inputs(): MIDIDevice[] { return (<MIDIDevice[]>Object.values(this._devices)).filter((device: MIDIDevice) => device.type == "input"); }
  public get Outputs(): MIDIDevice[] { return (<MIDIDevice[]>Object.values(this._devices)).filter((device: MIDIDevice) => device.type == "output"); }
  public get SelectedDevice(): MIDIDevice { return this._selected; }

  constructor() {
    super();
    this.Initialize = this.Initialize.bind(this);
    this.hookEvents = this.hookEvents.bind(this);
    this.unhookEvents = this.unhookEvents.bind(this);
    this.SelectInput = this.SelectInput.bind(this);
    this.DeselectInput = this.DeselectInput.bind(this);
    this.onNote = this.onNote.bind(this);
    this.offNote = this.offNote.bind(this);
  }


  private onNote(evt) {
    console.log("On: ", evt);
    this.emit('on', {
      number: evt.note.number,
      name: evt.note.name,
      octave: evt.note.octave,
      timestamp: evt.timestamp,
      velocity: evt.velocity
    });
  }

  private offNote(evt) {
    console.log("Off: ", evt);
    this.emit('off', {
      number: evt.note.number,
      name: evt.note.name,
      octave: evt.note.octave,
      timestamp: evt.timestamp,
      velocity: evt.velocity
    });
  }

  private hookEvents(id: string): void {
    let device = this._internalDevices[id];
    if (!device)
      throw new Error(`Unknown device: ${id}`);

    device.addListener('noteon', 'all', this.onNote);
    device.addListener('noteoff', 'all', this.offNote);
  }

  private unhookEvents(id: string): void {
    let device = this._internalDevices[id];
    if (!device)
      throw new Error(`Unknown device: ${id}`);

    device.removeListener('noteon');
    device.removeListener('noteoff');
  }

  public Initialize(): Promise<MIDIDevice[]> {
    return new Promise((resolve, reject) => {
      (<any>webmidi).enable((err) => {
        if (err) {
          reject(err);
        } else {
          [].concat((<any>webmidi).inputs, (<any>webmidi).outputs).forEach((device: any) => {
            this._devices[device.id] = {
              id: device.id,
              name: device.name,
              manufacturer: device.manufacturer,
              type: device.type
            };
            this._internalDevices[device.id] = device;
          });

          if (this.Inputs.length == 1)
            this.SelectInput(this.Inputs[0].id);

          resolve();
        }
      });
    });
  }

  public SelectInput(id: string): any {
    if (!this._devices[id])
      throw new Error(`Unknown device '${id}'`);

    if (this.SelectedDevice)
      this.DeselectInput(this.SelectedDevice.id);


    this._selected = this._devices[id];
    this.hookEvents(id);
  }

  public DeselectInput(id: string) {
    this.unhookEvents(id);
    this._selected =null;
  }
}
