import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MaterialModule } from '../material.module';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgxFileDropModule } from 'ngx-file-drop';

import {
  ConfirmationDialogComponent,
  PromptDialogComponent,
  SongSelectorComponent
} from './components';

import {
  MidiControllerService,
  MidiFileService,
  IPCService,
  SettingsService
} from './services';

@NgModule({
  declarations: [
  	PageNotFoundComponent,
  	WebviewDirective,
  	ConfirmationDialogComponent,
  	PromptDialogComponent,
    SongSelectorComponent
  ],
  imports: [
  	CommonModule,
  	TranslateModule,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule,
    MaterialModule,
    ScrollingModule,
    NgxFileDropModule
  ],
  exports: [
  	TranslateModule,
  	WebviewDirective,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule,
    CommonModule,
    BrowserModule,
    MaterialModule,
    SongSelectorComponent,
    NgxFileDropModule
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    PromptDialogComponent
  ],
  providers: [
    MidiControllerService,
    MidiFileService,
    IPCService,
    SettingsService
  ]
})
export class SharedModule {}
