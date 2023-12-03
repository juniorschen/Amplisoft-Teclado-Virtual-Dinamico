import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from "firebase/firestore";
import { take } from 'rxjs';

@Component({
  selector: 'app-dasher-feedback',
  templateUrl: './dasher-feedback.component.html',
  styleUrls: ['./dasher-feedback.component.scss']
})
export class DasherFeedbackComponent implements OnInit, OnDestroy {

  public input = '';
  private firestore: Firestore = inject(Firestore);
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private _ngZone: NgZone) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public async sendFeedback() {
    console.log(this.input)
    await setDoc(doc(this.firestore, "feedback", "new-feedback"), { "data": this.input });
  }
}
