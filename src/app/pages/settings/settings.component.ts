import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material';

import { SettingsService } from '../../shared/services';
import {
  ConfirmationDialogComponent,
  PromptDialogComponent
} from '../../shared/components';


import {
  faSave,
  faPlus,
  faTrash,
  faEdit
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'keybard-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  private _allLanguages: any = require('./languages.json');

  public Icons: any = {
    save: faSave,
    add: faPlus,
    remove: faTrash,
    edit: faEdit
  }

  public Languages: any[] = [];

  public get CurrentLanguage(): string { return this.translate.currentLang; }
  public set CurrentLanguage(lang: string) { this.translate.use(lang); }

  public LibraryPaths: string[] = [];

  constructor(
    private translate: TranslateService,
    private settings: SettingsService,
    private dialog: MatDialog
  ) {
    this.onLanguageChange = this.onLanguageChange.bind(this);
    this.removeDirectory = this.removeDirectory.bind(this);

    this.LibraryPaths = settings.Get<string[]>("songDirectories");
  }

  ngOnInit(): void {
    // Set up list of languages.
    setTimeout(() => {
      this.Languages = this.translate.langs
        .map((lang: string) => {
        if (this._allLanguages[lang]) {
          return {
            value: lang,
            name: this._allLanguages[lang].nativeName,
            englishName: this._allLanguages[lang].name
          };
        } else {
          return {
            value: '',
            name: `Unknown language: ${lang}`,
            englishName: ''
          };
        }
      })
      .sort((a: any, b: any) => a.name > b.name ? 1 : -1)
      ;
    }, 500);
  }

  private confirmationDialog(message: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '350px',
        data: message
      });
      dialogRef.afterClosed().subscribe(resolve);
    });
  }

  private promptDialog(message: string, value: string = ''): Promise<string> {
    return new Promise((resolve, reject) => {
      let dialogRef = this.dialog.open(PromptDialogComponent, {
        width: '350px',
        data: {
          message: message,
          value: value
        }
      });
      dialogRef.afterClosed().subscribe(resolve);
    });
  }

  public removeDirectory(dir: string) {
    this.confirmationDialog(this.translate.instant("PAGES.SETTINGS.REMOVEDIRECTORYCONFIRMATION"))
      .then((confirmed: boolean) => {
        if (confirmed) {
          let index: number = this.LibraryPaths.indexOf(dir);
          if (index !== -1)
            this.LibraryPaths.splice(index, 1);
        }
      })
      .catch(console.error);
  }

  public editDirectory(dir: string) {
    this.promptDialog(this.translate.instant("PAGES.SETTINGS.EDITDIRECTORYPROMPT"), dir)
      .then((res: any) => {
        if (res && res.confirmed && res.response) {
          let index = this.LibraryPaths.indexOf(dir);
          if (index !== -1)
            this.LibraryPaths[index] = res.response;
        }
      })
      .catch(console.error);
  }

  public onLanguageChange($event) {
    this.translate.use($event.value);
    // this.settings.Set("currentLang", $event.value);
  }

  public Save() {
    this.settings.Set<string>("currentLang", this.CurrentLanguage);
    this.settings.Set<string[]>("songDirectories", this.LibraryPaths);
  }

  public AddPath() {
    this.promptDialog(this.translate.instant("PAGES.SETTINGS.ADDDIRECTORYPROMPT"))
      .then((res: any) => {
        if (res && res.confirmed && res.response) {
          this.LibraryPaths.push(res.response);
        }
      })
      .catch(console.error);
  }



}
