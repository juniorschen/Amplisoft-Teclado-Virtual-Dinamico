import "tracking";
import "tracking/build/data/eye";
declare var tracking: any;
declare const webgazer: any;

const trackingJSCamera = false;
let trackerTask;
let tracker;

export async function connectControlCamera(onPacketSended) {
    if (trackingJSCamera) {
        var video = document.getElementById('myVideo');
        if (video) {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
            document.getElementById('myVideo')["srcObject"] = stream;

            if (trackingJSCamera) {
                trackByTrackingJs(onPacketSended);
            } else {
                trackByWeGazer(onPacketSended);
            }
        }

        trackByTrackingJs(onPacketSended);
    } else {
        trackByWeGazer(onPacketSended);
    }
}

export async function stopCameraControl() {
    if (trackingJSCamera) {
        stopTrackByTrackingJs();
    } else {
        stopTrackByWeGazer();
    }
}

//#region webgazer
function trackByWeGazer(onPacketSended) {
    webgazer.showVideo(false);
    webgazer.setGazeListener(function (data, elapsedTime) {
        if (data == null) {
            return;
        }
    }).begin();
    webgazer.showPredictionPoints(true);
}

function stopTrackByWeGazer() {
    localStorage.removeItem('CalibratedEyeControl');
    try {
        webgazer.clearData();
        webgazer.end();
    } catch {}
}
//#endregion

//#region webgazer calibration
export function calibrateCamera() {
    webgazer.clearData();
    alert(`Vamos calibrar a camera para melhor detecção ocular. \nSerá necessário a ajuda do mouse nesta etapa, mova ele por todas as ações apresentadas na tela realizando o acompanhamento com os olhos, quando o indicador vermelho estiver sobre a ação clique cinco vezes sobre o mesmo.\nPara iniciar aguarde a camera carregar e o indicativo de deteção de rosto fique verde então clique sobre a tela para o indicador ocular ser carregado.`);
    webgazer.showVideo(true);
    webgazer.setGazeListener(function (data, elapsedTime) {
    }).begin();
    webgazer.showPredictionPoints(true);
}

export function endCalibrateCamera() {
    localStorage.setItem('CalibratedEyeControl', "true");
    alert(`Calibração finalizada o software irá iniciar agora, caso precise calibrar novamente entre nos configuradores de controle desmarque a opção ocular e marque novamente.`);
    webgazer.end();
}
//#endregion

//#region OLD trackingjs
function trackByTrackingJs(onPacketSended) {
    tracker = new tracking.ObjectTracker('eye');
    tracker.setInitialScale(1);
    tracker.setStepSize(1);

    tracker.on('track', (event) => {
        if (event.data.length > 1) {
            onPacketSended.next({
                detail: {
                    leftEye: {
                        x: event.data[0].x,
                        y: event.data[0].y,
                    },
                    rightEye: {
                        x: event.data[1].x,
                        y: event.data[1].y,
                    }
                }
            });
        }
    });

    trackerTask = tracking.track('#myVideo', tracker, { camera: true });
}

function stopTrackByTrackingJs() {
    if (tracker) {
        trackerTask.stop();
        tracker = undefined;
    }
}
//#endregion