import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { BrowserModule } from '@angular/platform-browser';

import { SettingsComponent } from './settings.component';
import { SharedModule } from '../../shared/shared.module';
import { MaterialModule } from '../../material.module';


@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    MaterialModule
    // BrowserModule
  ]
})
export class SettingsModule {}