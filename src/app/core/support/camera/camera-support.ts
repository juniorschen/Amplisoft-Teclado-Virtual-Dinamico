import "tracking";
import "tracking/build/data/eye";
declare var tracking: any;

export async function connectControlCamera(tracker, trackerTask, onPacketSended) {
    var video = document.getElementById('myVideo');
    if (video) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        document.getElementById('myVideo')["srcObject"] = stream;
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
}