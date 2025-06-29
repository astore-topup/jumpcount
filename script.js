const video = document.getElementById("video");
const counterDisplay = document.getElementById("counter");
const toggleBtn = document.getElementById("toggleCamera");

let currentStream;
let useBackCamera = true; // Start with back camera if available
let detector;
let prevY = null;
let direction = null;
let jumpCount = 0;

async function getCameraStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  const constraints = {
    video: {
      facingMode: useBackCamera ? { exact: "environment" } : "user"
    }
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    video.srcObject = stream;
    currentStream = stream;
    video.onloadedmetadata = () => video.play();
  } catch (err) {
    alert("Gagal mengakses kamera. Coba izinkan akses kamera.");
    console.error(err);
  }
}

toggleBtn.addEventListener("click", async () => {
  useBackCamera = !useBackCamera;
  await getCameraStream();
});

async function initDetector() {
  detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    }
  );
}

async function detectJumps() {
  setInterval(async () => {
    if (!detector) return;
    const poses = await detector.estimatePoses(video);
    if (poses.length > 0) {
      const keypoints = poses[0].keypoints;
      const nose = keypoints.find(p => p.name === 'nose');
      if (!nose || nose.score < 0.8) return;

      const y = nose.y;
      if (prevY !== null) {
        const dy = y - prevY;

        if (dy < -15 && direction !== "up") {
          direction = "up";
        } else if (dy > 15 && direction === "up") {
          direction = "down";
          jumpCount++;
          counterDisplay.textContent = `Lompatan: ${jumpCount}`;
        }
      }
      prevY = y;
    }
  }, 100);
}

// Inisialisasi semua
(async () => {
  await getCameraStream();
  await initDetector();
  detectJumps();
})();
