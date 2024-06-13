import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TextFieldModule } from '@angular/cdk/text-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { DasherFeedbackComponent } from './dasher-feedback.component';
import { DasherFeedbackRoutingModule } from './dasher-feedback-routing.module';

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
    FormsModule,
    MatSnackBarModule
  ]
})
export class DasherFeedbackModule { }
