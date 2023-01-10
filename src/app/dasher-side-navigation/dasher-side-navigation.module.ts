import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    FlexLayoutModule
  ]
})
export class DasherSideNavigationModule { }
