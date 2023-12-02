import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DasherFeedbackComponent } from './dasher-feedback.component';
import { DasherFeedbackRoutingModule } from './dasher-feedback-routing.module';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    DasherFeedbackComponent
  ],
  imports: [
    CommonModule,
    DasherFeedbackRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule,
    FormsModule
  ]
})
export class DasherFeedbackModule { }
