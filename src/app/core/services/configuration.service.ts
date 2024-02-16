/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { enableJoyconFunctions, _onInputReportJoycon } from 'src/app/core/support/joycon-support/joycon-support';
import { _onInputReportDualShock } from '../support/dualshock/dualshock-support';
import { calibrateCamera, connectControlCamera, stopCameraControl } from '../support/camera/camera-support';

@Injectable({
    providedIn: 'root'
})
export class ConfigurationsService {

    private currentHidDevice: HIDDevice;
    private onPacketSended = new Subject<any>();
    private activeControl: string;
    public sensorialSelectionDelayMs = 1000 * 4;

    constructor() { }

    public getActiveControl() {
        return localStorage.getItem('ActiveControl') ?? "";
    }

    public setActiveControl(control: string) {
        localStorage.setItem('ActiveControl', control);
    }

    public desactiveControl() {
        localStorage.removeItem('ActiveControl');
    }

    public getControlDebounceTime() {
        if (!this.activeControl) {
            this.activeControl = this.getActiveControl();
        }
        // Sensorial emite valores o tempo todo e não a cada ação do usuário então é necessario ter um debounce time para cada evento
        return this.activeControl.includes('Sensorial') ? 15 : 0;
    }

    public isAnyControlConfigured() {
        return this.getActiveControl() != null && this.getActiveControl() != undefined && this.getActiveControl() != "";
    }

    public isOcularDeviceConfigured() {
        return this.getActiveControl().includes("Ocular");
    }

    public isHidDeviceConfigured() {
        return localStorage.getItem('currentDeviceHidId') != null;
    }

    public async forgetDevices() {
        if (this.currentHidDevice) {
            await this.currentHidDevice.close();
            await this.currentHidDevice.forget();
            this.currentHidDevice = undefined;
            localStorage.removeItem('currentDeviceHidId');
        } else {
            stopCameraControl();
        }
    }

    public getPacketOutput() {
        return this.onPacketSended;
    }

    public async initializeControl() {
        if (this.isOcularDeviceConfigured()) {
            if (localStorage.getItem('CalibratedEyeControl') == null) {
                calibrateCamera();
            } else {
                await connectControlCamera(this.onPacketSended);
            }
        } else if (this.isHidDeviceConfigured()) {
            await this.connectControlHid();
        }
    }

    async connectControlHid(filters = []): Promise<boolean> {
        if (navigator.hid == null) {
            alert("Atenção o navegador atual não apresenta suporte para dispositvos HID utilize Google Chrome, Edge ou Opera!")
            return false;
        }

        try {
            const cachedDevices = await navigator.hid.getDevices();
            this.currentHidDevice = cachedDevices.find(l => l.productId == Number(localStorage.getItem('currentDeviceHidId')));

            if (!this.currentHidDevice) {
                const devices = await navigator.hid.requestDevice({
                    filters: filters
                });
                if (devices.length == 0) {
                    return false;
                }
                this.currentHidDevice = devices[0];
                localStorage.setItem('currentDeviceHidId', this.currentHidDevice.productId.toString());
            }

            if (!this.currentHidDevice.opened) {
                await this.currentHidDevice.open();
            }

            if (this.getActiveControl().includes("Joycon")) {
                await enableJoyconFunctions(this.currentHidDevice);
                this.currentHidDevice.oninputreport = e => {
                    _onInputReportJoycon(e, this.currentHidDevice);
                }
                this.currentHidDevice.addEventListener('hidinput', (e) => {
                    this.onPacketSended.next(e);
                });
            } else if (this.getActiveControl().includes("DualShock")) {
                let controlInterface;
                this.currentHidDevice.oninputreport = e => {
                    controlInterface = _onInputReportDualShock(e, this.currentHidDevice, controlInterface);
                }
                this.currentHidDevice.addEventListener('hidinput', (e) => {
                    this.onPacketSended.next(e);
                });
            } else {
                this.currentHidDevice.oninputreport = e => {
                    this.handleInputReport(e);
                }
            }
            return true;
        } catch (error) {
            console.log('error', error)
            return false;
        }
    }

    handleInputReport(e) {
        var uint8View = new Uint8Array(e.data.buffer);
        if (e.data.getUint8(0) === 0) return;
    }
}