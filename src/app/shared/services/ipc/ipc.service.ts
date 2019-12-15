import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

/**
 * @module IPCService
 */

/** Service to marshal IPC calls to and from the main thread. */
@Injectable({
  providedIn: 'root'
})
export class IPCService {

  /** Hash to store promises awaiting response from the main thread. */
  private awaitingResponse: any = {};

  constructor() {
    this.generateId = this.generateId.bind(this);
    this.Send = this.Send.bind(this);
  }

  /**
   * Generates UUID to identify a specific request.
   * @returns {string}
   */
  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Sends an IPC message to the main thread.
   * @param {string} channel - The channel to which the main thread should route the request.
   * @returns {Promise}
   */
  public Send(channel: string, ...args): Promise<any[]> {
    let id = this.generateId();
    let promise: Promise<any[]> = new Promise<any[]>((resolve, reject) => {
      ipcRenderer.once(`reply-${id}`, (event, status: string, ...args) => {
        if (status === 'error') {
          reject(new Error(args[0]));
        } else if (status === 'success') {
          resolve(...args);
          delete this.awaitingResponse[id];
        }
      });
    });

    this.awaitingResponse[id] = promise;
    ipcRenderer.send(channel, uuid, ...args);
    return promise;
  }
}