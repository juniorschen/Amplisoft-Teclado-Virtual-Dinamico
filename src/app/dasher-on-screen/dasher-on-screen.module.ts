import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { DasherOnScreenComponent } from './dasher-on-screen.component';
import { DasherOnScreenRoutingModule } from './dasher-on-screen-routing.module';
import { DasherOnScreenPlayerComponent } from './dasher-on-screen-player/dasher-on-screen-player.component';

@NgModule({
  declarations: [
    DasherOnScreenComponent,
    DasherOnScreenPlayerComponent
  ],
  imports: [
    CommonModule,
    DasherOnScreenRoutingModule,
    FlexLayoutModule,
    MatInputModule,
    MatFormFieldModule,
    FormsModule,
    MatIconModule,
    MatProgressSpinnerModule
  ]
})
export class DasherOnScreenModule { }
