import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private _settings: any = {};
  private _defaultSettings: any = require('./defaultSettings.json');

  public get Settings(): any {
    return Object.assign({}, this._defaultSettings, this._settings);
  }

  constructor() {
    this.Save = this.Save.bind(this);
    this.Refresh = this.Refresh.bind(this);
    this.Get = this.Get.bind(this);
    this.Set = this.Set.bind(this);
    this.Clear = this.Clear.bind(this);

    // console.log("Default settings: ", this._settings);

    try {
      this.Refresh();
    } catch (err) {
      console.error("There was a problem loading application settings:");
      console.error(err);
    }
  }

  /**
   * Saves settings to storage.
   * Will only persist settings which have changed from the default.
   */
  public Save(): void {
    localStorage.setItem("app-settings", JSON.stringify(this._settings));
  }

  /**
   * Forcefully loads settings from storage.
   */
  public Refresh() {
    let settings: any = localStorage.getItem("app-settings");
    if (settings) {
      settings = JSON.parse(settings);
      this._settings = settings;
    }
  }


  /**
   * Retrieve a setting.
   * @param {string} setting - The setting to retrieve.
   * @returns {T}
   */
  public Get<T>(setting: string): T {
    // console.log("Settings: ", this.Settings);
    if (this.Settings[setting])
      return this.Settings[setting];
    else
      throw new Error(`Unknown setting: ${setting}`);
  }

  /**
   * Sets a setting.
   * @param {string} setting - The setting to set.
   * @param {T} value - The value to which to set it.
   */
  public Set<T>(setting: string, value: T) {
    this._settings[setting] = value;
    console.log("Settings: ", this.Settings);
    this.Save();
    return value;
  }

  /**
   * Clears all settings back to default.
   */
  public Clear() {
    this._settings = {};
    this.Save();
  }

  /**
   * Returns whether or not a setting exists.
   * @param {string} setting - The setting for which to check
   * @param {boolean} nonDefault - If true, only check that we have a customized setting set.
   * @returns {boolean}
   */
  public Has(setting: string, nonDefault: boolean = false): boolean {
    if (nonDefault)
      return (this._settings[setting] ? true : false);
    else
      return (this.Settings[setting] ? true : false);
  }
}
