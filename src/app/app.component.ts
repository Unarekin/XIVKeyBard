import { Component, NgZone } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

import { SettingsService } from './shared/services';

import {
  faCog,
  faChevronLeft
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  private _currentRoute: string = '';

  public Icons: any = {
    settings: faCog,
    back: faChevronLeft
  };

  public get CurrentRoute(): string { return this._currentRoute; }

  

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private settings: SettingsService,
    private router: Router,
    private zone: NgZone
  ) {
    // translate.setDefaultLang('en');

    translate.setDefaultLang(settings.Has("defaultLang") ? settings.Get("defaultLang") : 'en');
    translate.use(settings.Has("currentLang") ? settings.Get("currentLang") : 'en');

    console.log('AppConfig', AppConfig);
    console.log("Route: ", this.router.url);
    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }

    router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.zone.run(() => {
          this._currentRoute = val.url;
        });
      }
    });
  }
}
