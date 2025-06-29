const video = document.getElementById("video");
const counterDisplay = document.getElementById("counter");

let prevY = null;
let direction = null;
let jumpCount = 0;

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  video.srcObject = stream;
  return new Promise((resolve) => {
    video.onloadedmetadata = () => resolve(video);
  });
}

async function detectJumps() {
  const detector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
    }
  );

  setInterval(async () => {
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

setupCamera().then(() => {
  video.play();
  detectJumps();
});
