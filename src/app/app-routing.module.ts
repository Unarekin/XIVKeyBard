import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from './shared/components';
import { SharedModule } from './shared/shared.module';

// import { HomeModule } from './pages/home/home.module';
// import { SettingsModule } from './pages/settings/settings.module';

import { HomeComponent } from './pages/home/home.component';
import { SettingsComponent } from './pages/settings/settings.component';


const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    pathMatch: 'full',
    component: HomeComponent
  },
  {
    path: 'settings',
    pathMatch: 'full',
    component: SettingsComponent
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  declarations: [
    HomeComponent,
    SettingsComponent
  ],
  imports: [
    SharedModule,
    RouterModule.forRoot(routes, { useHash: true })
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
  constructor() { }
}
