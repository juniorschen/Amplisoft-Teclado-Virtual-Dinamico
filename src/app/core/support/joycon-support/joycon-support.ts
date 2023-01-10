/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />

async function enableUSBHIDJoystickReport(device: HIDDevice) {
    const usb =
        device.collections[0].outputReports.find(
            (r) => r.reportId == 0x80
        ) != null;
    if (usb) {
        await device.sendReport(0x80, new Uint8Array([0x01]));
        await device.sendReport(0x80, new Uint8Array([0x02]));
        await device.sendReport(0x01, new Uint8Array([0x03]));
        await device.sendReport(0x80, new Uint8Array([0x04]));
    }
}

async function enableStandardFullMode(device: HIDDevice) {
    const outputReportID = 0x01;
    const subcommand = [0x03, 0x30];
    const data = [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        ...subcommand,
    ];
    await device.sendReport(outputReportID, new Uint8Array(data));
}

async function enableIMUMode(device: HIDDevice) {
    const outputReportID = 0x01;
    const subcommand = [0x40, 0x01];
    const data = [
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        0x00,
        ...subcommand,
    ];
    await device.sendReport(outputReportID, new Uint8Array(data));
}

export const enableJoyconFunctions = async (device: HIDDevice) => {
    await enableUSBHIDJoystickReport(device);
    await enableStandardFullMode(device);
    await enableIMUMode(device);
};

export function _onInputReport(event) {
    let { data, reportId, device } = event;

    if (!data) {
        return;
    }
}