let browserCameraStream = null;

async function startBrowserCamera(videoId = 'videoFeed') {
    const video = document.getElementById(videoId);
    if (!video || browserCameraStream) {
        return browserCameraStream;
    }

    browserCameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
        audio: false
    });

    video.srcObject = browserCameraStream;
    await video.play();
    return browserCameraStream;
}

function getCameraFrame(videoId = 'videoFeed', canvasId = 'cameraCanvas') {
    const video = document.getElementById(videoId);
    const canvas = document.getElementById(canvasId);

    if (!video || !canvas || video.readyState < 2) {
        return null;
    }

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.85);
}

async function predictCameraFrame() {
    const image = getCameraFrame();
    if (!image) {
        return null;
    }

    const response = await fetch('/predict_frame', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image })
    });

    if (!response.ok) {
        throw new Error('Prediction request failed');
    }

    return response.json();
}

window.addEventListener('DOMContentLoaded', () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('Browser camera API is not available.');
        return;
    }

    startBrowserCamera().catch(error => {
        console.error('Could not start browser camera:', error);
    });
});
