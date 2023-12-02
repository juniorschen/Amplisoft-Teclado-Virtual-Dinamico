import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from "firebase/firestore";
import { Subject, fromEvent, take, takeUntil } from 'rxjs';
import { getFirestore } from "firebase/firestore";
// node_modules/tracking/build/data/face.js
import "tracking";
import "tracking/build/data/face";
import "tracking/build/data/eye";
declare var window: any;
declare var tracking: any;

@Component({
  selector: 'app-dasher-feedback',
  templateUrl: './dasher-feedback.component.html',
  styleUrls: ['./dasher-feedback.component.scss']
})
export class DasherFeedbackComponent implements OnInit, AfterViewInit, OnDestroy {

  public input = '';
  private firestore: Firestore = inject(Firestore);
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  @ViewChild("canvas") canvas: ElementRef;
  @ViewChild('video') videoElement!: ElementRef;
  private tracker: any;

  constructor(private _ngZone: NgZone) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  async ngAfterViewInit(): Promise<void> {
    var video = document.getElementById('myVideo');
    if (video) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      document.getElementById('myVideo')["srcObject"] = stream;
      this.tracker = new tracking.ObjectTracker("face");

      this.tracker.on('track', function (event) {
        console.log(event)
      });

      tracking.track('#myVideo', this.tracker, { camera: true });
    }
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
