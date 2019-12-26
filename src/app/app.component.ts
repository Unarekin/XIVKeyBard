import { Component, NgZone, ViewContainerRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { MatDialog } from '@angular/material';

import { SettingsService } from './shared/services';
import { SettingsDialogComponent } from './shared/components';
import { HomeComponent } from './pages/home/home.component';

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
  private _homeComponent: HomeComponent = null;

  

  constructor(
    public electronService: ElectronService,
    private translate: TranslateService,
    private settings: SettingsService,
    private router: Router,
    private zone: NgZone,
    public vcRef: ViewContainerRef,
    private dialog: MatDialog,
    private changeRef: ChangeDetectorRef
  ) {

    this.ClearSongSelection = this.ClearSongSelection.bind(this);
    this.ShowSettingsDialog = this.ShowSettingsDialog.bind(this);
    this.onRouteActivate = this.onRouteActivate.bind(this);

    translate.addLangs(['en', 'es']);

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

  public ClearSongSelection() {
    if (this._homeComponent)
      this._homeComponent.SelectedSong=null;
  }

  public ShowSettingsDialog() {
    let dialogRef = this.dialog.open(SettingsDialogComponent, {
      width: '50%',
      height: '75%',
      disableClose: true,
      panelClass: 'settings-dialog'
    });
  }

  public onRouteActivate(ref) {
    if (ref instanceof HomeComponent)
      this._homeComponent = ref;
  }
}


/*
  private confirmationDialog(message: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: message
      });
      dialogRef.afterClosed().subscribe(resolve);
    });
  }
*/