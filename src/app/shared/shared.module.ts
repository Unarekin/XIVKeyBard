import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { GestureConfig } from '@angular/material';

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
  SongSelectorComponent,
  PianoRollComponent,
  SongControlComponent,
  SongSettingsComponent
} from './components';

import {
  MidiControllerService,
  MidiFileService,
  IPCService,
  SettingsService
} from './services';

import {
  TimeDurationPipe
} from './pipes';

@NgModule({
  declarations: [
  	PageNotFoundComponent,
  	WebviewDirective,
  	ConfirmationDialogComponent,
  	PromptDialogComponent,
    SongSelectorComponent,
    PianoRollComponent,
    SongControlComponent,
    TimeDurationPipe,
    SongSettingsComponent
  ],
  imports: [
  	CommonModule,
  	TranslateModule,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule,
    MaterialModule,
    ScrollingModule,
    NgxFileDropModule,
    BrowserAnimationsModule
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
    PianoRollComponent,
    SongControlComponent,
    TimeDurationPipe,
    NgxFileDropModule,
    BrowserAnimationsModule
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    PromptDialogComponent
  ],
  providers: [
    MidiControllerService,
    MidiFileService,
    IPCService,
    SettingsService,
    { provide: HAMMER_GESTURE_CONFIG, useClass: GestureConfig }
  ]
})
export class SharedModule {}
