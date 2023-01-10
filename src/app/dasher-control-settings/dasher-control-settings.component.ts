/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />
import { Component } from '@angular/core';

@Component({
  selector: 'app-dasher-control-settings',
  templateUrl: './dasher-control-settings.component.html',
  styleUrls: ['./dasher-control-settings.component.scss']
})
export class DasherControlSettingsComponent {

  private devicePared;

  onStartMapping() {
    if (this.devicePared)
      return
    this.devicePared = "a"
    this.connectHid();
  }

  async connectHid() {
    if (navigator.hid == null) {
      console.error("This browser does not support USB HID communication!");
      return;
    }

    var device;
    try {
      const devices = await navigator.hid.requestDevice({
        filters: []
      });
      device = devices[0];
      device.open().then(() => {
        console.log('xxxxxxxxx')
        device.oninputreport = e => {
          this.handleInputReport(e);
        }
        //Do something with device here!
      });
    } catch (error) {
      console.warn("No device access granted", error);
      return;
    }
  }

  handleInputReport(e) {
    console.log('handleeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
    var uint8View = new Uint8Array(e.data.buffer);
    console.log(uint8View)
    const value = e.data.getUint8(0);
    if (value === 0) return;

    const someButtons = { 1: "A", 2: "X", 4: "B", 8: "Y" };
    console.log(`User pressed button ${someButtons[value]}.`);
    //Do something with the bytes
  }

}
