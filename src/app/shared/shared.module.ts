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
import { ConfirmationDialogComponent } from './components/confirmation-dialog/confirmation-dialog.component';
import { PromptDialogComponent } from './components/prompt-dialog/prompt-dialog.component';

@NgModule({
  declarations: [
  	PageNotFoundComponent,
  	WebviewDirective,
  	ConfirmationDialogComponent,
  	PromptDialogComponent
  ],
  imports: [
  	CommonModule,
  	TranslateModule,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule,
    MaterialModule
  ],
  exports: [
  	TranslateModule,
  	WebviewDirective,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule,
    CommonModule,
    BrowserModule,
    MaterialModule
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    PromptDialogComponent
  ]
})
export class SharedModule {}
