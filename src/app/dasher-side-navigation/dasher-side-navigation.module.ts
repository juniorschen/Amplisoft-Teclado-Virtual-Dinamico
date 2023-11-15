import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DasherSideNavigationComponent } from './dasher-side-navigation.component';
import { DasherSideNavigationRoutingModule } from './dasher-side-navigation-routing.module';

@NgModule({
  declarations: [
    DasherSideNavigationComponent
  ],
  imports: [
    CommonModule,
    DasherSideNavigationRoutingModule,
    MatSidenavModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class DasherSideNavigationModule { }
