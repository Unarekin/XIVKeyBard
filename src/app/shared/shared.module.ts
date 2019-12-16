import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { PageNotFoundComponent } from './components/';
import { WebviewDirective } from './directives/';
import { FormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [
  	PageNotFoundComponent,
  	WebviewDirective
  ],
  imports: [
  	CommonModule,
  	TranslateModule,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule
  ],
  exports: [
  	TranslateModule,
  	WebviewDirective,
  	FormsModule,
  	FlexLayoutModule,
  	FontAwesomeModule
  ]
})
export class SharedModule {}
