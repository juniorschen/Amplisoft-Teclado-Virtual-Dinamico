import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dasher-on-screen-feedback-modal',
  templateUrl: './dasher-on-screen-feedback-modal.component.html',
  styleUrls: ['./dasher-on-screen-feedback-modal.component.scss']
})
export class DasherOnScreenFeedbackModalComponent {
  public message: string;
  constructor(public dialogRef: MatDialogRef<DasherOnScreenFeedbackModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message }) {
    console.log(this.data)
    this.message = this.data.message;
  }
}
