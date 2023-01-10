/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />
import { Injectable } from '@angular/core';
import { enableJoyconFunctions } from 'src/app/core/support/joycon-support/joycon-support';

@Injectable({
    providedIn: 'root'
})
export class ControlProviderService {

    private mapedControlersNumbers = new Map<string, number>([
        ["Joy-Con (L)", 0x2007],
        ["Joy-Con (R)", 0x2006]
    ]);

    constructor() {
    }

    public getActiveControl(controlName: string) {
        return localStorage.getItem(controlName);
    }

    public setActiveControl(controlName: string) {
        localStorage.setItem(controlName, 'true');
    }

    public desactiveControl(controlName: string) {
        localStorage.removeItem(controlName);
    }

    async connectControlHid(filters = []): Promise<boolean> {
        if (navigator.hid == null) {
            console.error("This browser does not support USB HID communication!");
            return false;
        }

        let device;
        try {
            const cachedDevices = await navigator.hid.getDevices();
            console.log(cachedDevices)
            const devices = await navigator.hid.requestDevice({
                filters: filters
            });
            if (devices.length == 0) {
                return false;
            }
            device = devices[0];
            if (!device.opened) {
                await device.open();
            }
            switch (device.productId) {
                case this.mapedControlersNumbers.get(device.productId):
                    await enableJoyconFunctions(device);
                    device.oninputreport = e => {
                        this.handleInputReport(e);
                    }
                    break;
                default:
                    device.oninputreport = e => {
                        this.handleInputReport(e);
                    }
                    break;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    handleInputReport(e) {
        var uint8View = new Uint8Array(e.data.buffer);
        console.log(uint8View)
        const value = e.data.getUint8(0);
        if (value === 0) return;
        const someButtons = { 1: "A", 2: "X", 4: "B", 8: "Y" };
        console.log(`User pressed button ${someButtons[value]}.`);
    }
}