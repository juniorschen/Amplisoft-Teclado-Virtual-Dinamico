import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

import { DasherConfigurationsComponent } from './dasher-configurations.component';
import { DasherConfigurationsRoutingModule } from './dasher-configurations-routing.module';

@NgModule({
  declarations: [
    DasherConfigurationsComponent
  ],
  imports: [
    CommonModule,
    DasherConfigurationsRoutingModule,
    FlexLayoutModule,
    MatSlideToggleModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class DasherConfigurationsModule { }
