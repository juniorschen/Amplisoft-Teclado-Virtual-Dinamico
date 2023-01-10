import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { DasherControlSettingsComponent } from './dasher-control-settings.component';
import { DasherControlSettingsRoutingModule } from './dasher-control-settings-routing.module';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    DasherControlSettingsComponent
  ],
  imports: [
    CommonModule,
    DasherControlSettingsRoutingModule,
    FlexLayoutModule,
    MatSlideToggleModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DasherControlSettingsModule { }
