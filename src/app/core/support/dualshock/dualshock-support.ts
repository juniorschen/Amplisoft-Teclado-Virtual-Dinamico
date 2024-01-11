export enum DualShock4Interface {
    Disconnected = 'none',
    /** The controller is connected over USB */
    USB = 'usb',
    /** The controller is connected over BT */
    Bluetooth = 'bt'
}

export function normalizeThumbstick(input: number, deadZone = 0) {
    const rel = (input - 128) / 128
    if (Math.abs(rel) <= deadZone) return 0
    return Math.min(1, Math.max(-1, rel))
}

function dispatchEvent(data, deviceHID: HIDDevice) {
    deviceHID.dispatchEvent(new CustomEvent('hidinput', {
        detail: {
            analogStickLeft: {
                horizontal: normalizeThumbstick(data.getUint8(0)),
                vertical: normalizeThumbstick(data.getUint8(1))
            },
            analogStickRight: {
                horizontal: normalizeThumbstick(data.getUint8(2)),
                vertical: normalizeThumbstick(data.getUint8(3))
            }
        }
    }));
}

export function _onInputReportDualShock(event, deviceHID: HIDDevice, controlInterface: DualShock4Interface) {
    const { data } = event;

    if(!controlInterface) {
        if (data.byteLength === 63) {
            controlInterface = DualShock4Interface.USB;
        } else {
            controlInterface = DualShock4Interface.Bluetooth;
            deviceHID!.receiveFeatureReport(0x02);
            return controlInterface;
        }
    }

    if (controlInterface === DualShock4Interface.USB && event.reportId === 0x01) {
        dispatchEvent(data, deviceHID);
    }

    if (controlInterface === DualShock4Interface.Bluetooth && event.reportId === 0x11) {
        dispatchEvent(new DataView(data.buffer, 2), deviceHID);
        deviceHID!.receiveFeatureReport(0x02);
    }

    return controlInterface;
}