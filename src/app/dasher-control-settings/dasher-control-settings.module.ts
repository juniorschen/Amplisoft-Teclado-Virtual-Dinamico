import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DasherControlSettingsComponent } from './dasher-control-settings.component';
import { DasherControlSettingsRoutingModule } from './dasher-control-settings-routing.module';

@NgModule({
  declarations: [
    DasherControlSettingsComponent
  ],
  imports: [
    CommonModule,
    DasherControlSettingsRoutingModule
  ]
})
export class DasherControlSettingsModule { }
