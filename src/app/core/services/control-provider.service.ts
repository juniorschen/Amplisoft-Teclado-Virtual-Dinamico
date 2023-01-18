/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { enableJoyconFunctions, _onInputReportJoycon } from 'src/app/core/support/joycon-support/joycon-support';

@Injectable({
    providedIn: 'root'
})
export class ControlProviderService {

    private currentDevice: HIDDevice;
    private onPacketSended = new Subject<any>();
    private mapedControlersNumbers = new Map<number, string>([
        [8198, "Wireless Gamepad"],
        [8199, "Wireless Gamepad"]
    ]);

    constructor() { }

    public getActiveControl() {
        return localStorage.getItem('ActiveControl');
    }

    public setActiveControl(control: string) {
        localStorage.setItem('ActiveControl', control);
        this.setActiveControlType('joystick');
    }

    public getActiveControlType() {
        return localStorage.getItem('ActiveControlType');
    }

    public setActiveControlType(type: 'gyroscope' | 'joystick') {
        localStorage.setItem('ActiveControlType', type);
    }

    public desactiveControl() {
        localStorage.removeItem('ActiveControl');
        localStorage.removeItem('ActiveControlType');
    }

    public isAnyDeviceConfigured() {
        return localStorage.getItem('currentDeviceId') != null;
    }

    public getControlDebounceTime() {
        return this.getActiveControlType() == 'gyroscope' ? 15 : 0;
    }

    public async forgetDevice() {
        if (this.currentDevice) {
            await this.currentDevice.close();
            await this.currentDevice.forget();
            localStorage.removeItem('currentDeviceId');
        }
    }

    public getHIDPacketOutput() {
        return this.onPacketSended;
    }

    async connectControlHid(filters = []): Promise<boolean> {
        if (navigator.hid == null) {
            console.error("This browser does not support USB HID communication!");
            return false;
        }

        try {
            const cachedDevices = await navigator.hid.getDevices();
            this.currentDevice = cachedDevices.find(l => l.productId == Number(localStorage.getItem('currentDeviceId')));

            if (!this.currentDevice) {
                const devices = await navigator.hid.requestDevice({
                    filters: filters
                });
                if (devices.length == 0) {
                    return false;
                }
                this.currentDevice = devices[0];
                localStorage.setItem('currentDeviceId', this.currentDevice.productId.toString());
            }

            if (!this.currentDevice.opened) {
                await this.currentDevice.open();
            }

            // TODO JUST JOYCONs
            if (this.mapedControlersNumbers.has(this.currentDevice.productId)) {
                await enableJoyconFunctions(this.currentDevice);
                this.currentDevice.oninputreport = e => {
                    _onInputReportJoycon(e, this.currentDevice);
                }
                this.currentDevice.addEventListener('hidinput', (e) => {
                    this.onPacketSended.next(e);
                  });
            } else {
                this.currentDevice.oninputreport = e => {
                    this.handleInputReport(e);
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }

    handleInputReport(e) {
        var uint8View = new Uint8Array(e.data.buffer);
        if (e.data.getUint8(0) === 0) return;
        console.log(uint8View)
    }
}