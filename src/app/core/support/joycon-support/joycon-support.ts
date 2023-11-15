/// <reference types="w3c-web-usb" />
/// <reference types="w3c-web-hid" />

import { concatTypedArrays } from "src/app/common/array-consts";
import * as PacketParser from './parse';

const lastValues = {
    timestamp: null,
    alpha: 0,
    beta: 0,
    gamma: 0,
};

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
    await enableStandardFullMode(device);
    await enableIMUMode(device);
};

export function _onInputReportJoycon(event, deviceHID: HIDDevice) {
    let { data, reportId, device } = event;

    if (!data) {
        return;
    }

    data = concatTypedArrays(
        new Uint8Array([reportId]),
        new Uint8Array(data.buffer)
    );
    const hexData = data.map((byte) => byte.toString(16));

    let packet = {
        inputReportID: PacketParser.parseInputReportID(data, hexData),
    } as any;

    switch (reportId) {
        case 0x3f: {
            packet = {
                dataView: event.data,
                ...packet,
                buttonStatus: PacketParser.parseButtonStatus(data, hexData),
                analogStick: PacketParser.parseAnalogStick(data, hexData),
                filter: PacketParser.parseFilter(data, hexData),
            };
            break;
        }
        case 0x21:
        case 0x30: {
            packet = {
                dataView: event.data,
                ...packet,
                timer: PacketParser.parseTimer(data, hexData),
                batteryLevel: PacketParser.parseBatteryLevel(data, hexData),
                connectionInfo: PacketParser.parseConnectionInfo(data, hexData),
                buttonStatus: PacketParser.parseCompleteButtonStatus(data, hexData),
                analogStickLeft: PacketParser.parseAnalogStickLeft(data, hexData),
                analogStickRight: PacketParser.parseAnalogStickRight(data, hexData),
                vibrator: PacketParser.parseVibrator(data, hexData),
            };

            if (reportId === 0x21) {
                packet = {
                    dataView: event.data,
                    ...packet,
                    ack: PacketParser.parseAck(data, hexData),
                    subcommandID: PacketParser.parseSubcommandID(data, hexData),
                    subcommandReplyData: PacketParser.parseSubcommandReplyData(
                        data,
                        hexData
                    ),
                    deviceInfo: PacketParser.parseDeviceInfo(data, hexData),
                };
            }

            if (reportId === 0x30) {
                const accelerometers = PacketParser.parseAccelerometers(
                    data,
                    hexData
                );
                const gyroscopes = PacketParser.parseGyroscopes(data, hexData);
                const rps = PacketParser.calculateActualGyroscope(
                    gyroscopes.map((g) => g.map((v) => v.rps))
                );
                const dps = PacketParser.calculateActualGyroscope(
                    gyroscopes.map((g) => g.map((v) => v.dps))
                );
                const acc = PacketParser.calculateActualAccelerometer(
                    accelerometers.map((a) => [a.x.acc, a.y.acc, a.z.acc])
                );
                const quaternion = PacketParser.toQuaternion(
                    rps,
                    acc,
                    device.productId
                );

                packet = {
                    dataView: event.data,
                    ...packet,
                    accelerometers,
                    gyroscopes,
                    actualAccelerometer: acc,
                    actualGyroscope: {
                        dps: dps,
                        rps: rps,
                    },
                    actualOrientation: PacketParser.toEulerAngles(
                        lastValues,
                        rps,
                        acc,
                        device.productId
                    ),
                    actualOrientationQuaternion:
                        PacketParser.toEulerAnglesQuaternion(quaternion),
                    quaternion: quaternion,
                    ringCon: PacketParser.parseRingCon(data, hexData),
                };
            }
            break;
        }
    }

    deviceHID.dispatchEvent(new CustomEvent('hidinput', { detail: packet }));
}