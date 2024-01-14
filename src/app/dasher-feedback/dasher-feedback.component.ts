import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { Component, NgZone, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { doc, setDoc } from "firebase/firestore";
import { DeviceDetectorService } from 'ngx-device-detector';
import { take } from 'rxjs';
import { IdentifierService } from '../core/services/identifier.service';
import { ConfigurationsService } from '../core/services/configuration.service';

@Component({
  selector: 'app-dasher-feedback',
  templateUrl: './dasher-feedback.component.html',
  styleUrls: ['./dasher-feedback.component.scss']
})
export class DasherFeedbackComponent implements OnInit, OnDestroy {

  public input = '';
  private firestore: Firestore = inject(Firestore);
  @ViewChild('autosize') autosize: CdkTextareaAutosize;

  constructor(private _ngZone: NgZone, private deviceService: DeviceDetectorService, private identifierService: IdentifierService,
    private controlProviderService: ConfigurationsService) { }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  public async sendFeedback() {
    const deviceInfo = this.deviceService.getDeviceInfo();
    await setDoc(doc(this.firestore, "feedback", this.identifierService.generateUUIDV4()), {
      "browser": window.navigator.userAgent,
      "os": deviceInfo.os,
      "os_version": deviceInfo.os_version,
      "device": deviceInfo.deviceType,
      "deviceId": this.identifierService.getDeviceId(),
      "control": this.controlProviderService.getActiveControl(),
      "data": this.input
    });
  }
}
