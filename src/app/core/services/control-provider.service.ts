/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import "tracking";
import "tracking/build/data/eye";
declare var tracking: any;


import { enableJoyconFunctions, _onInputReportJoycon } from 'src/app/core/support/joycon-support/joycon-support';

@Injectable({
    providedIn: 'root'
})
export class ControlProviderService {

    private currentHidDevice: HIDDevice;
    private tracker: any;
    private trackerTask: any;
    private onPacketSended = new Subject<any>();
    private activeControl: string;

    constructor() { }

    public getActiveControl() {
        return localStorage.getItem('ActiveControl');
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
            localStorage.removeItem('currentDeviceHidId');
        }
        if (this.tracker) {
            this.trackerTask.stop();
            this.tracker = undefined;
        }
    }

    public getPacketOutput() {
        return this.onPacketSended;
    }

    public async initializeControl() {
        if (this.isHidDeviceConfigured()) {
            await this.connectControlHid();
        } else if (this.isOcularDeviceConfigured()) {
            await this.connectControlCamera();
        }
    }

    async connectControlHid(filters = []): Promise<boolean> {
        if (navigator.hid == null) {
            console.error("This browser does not support USB HID communication!");
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
            } else {
                this.currentHidDevice.oninputreport = e => {
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

    public async connectControlCamera() {
        var video = document.getElementById('myVideo');
        if (video) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            document.getElementById('myVideo')["srcObject"] = stream;
            this.tracker = new tracking.ObjectTracker("eye");

            this.tracker.on('track', (event) => {
                if (event.data.length > 0) {
                    this.onPacketSended.next({
                        detail: {
                            x: event.data[0].x,
                            y: event.data[0].y,
                        }
                    });
                }
            });

            this.trackerTask = tracking.track('#myVideo', this.tracker, { camera: true });
        }
    }
}