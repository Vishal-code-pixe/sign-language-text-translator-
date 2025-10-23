// -------------------------------
// Sign Language Translator - Video Version
// -------------------------------

let currentIndex = 0;
let signSequence = [];
let isPlaying = false;
let videoPlayer;

// DOM elements
const inputText = document.getElementById("inputText");
const videoPlayerContainer = document.getElementById("videoPlayer");
const signSequenceDiv = document.getElementById("signSequence");
const wordCount = document.getElementById("wordCount");
const signCount = document.getElementById("signCount");
const duration = document.getElementById("duration");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertBox = document.getElementById("alertBox");

// -------------------------------
// Helper Functions
// -------------------------------
function showAlert(message, type = "info") {
  alertBox.innerText = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3000);
}

function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none";
}

// -------------------------------
// API Request
// -------------------------------
async function translateText() {
  const text = inputText.value.trim();
  if (!text) {
    showAlert("Please enter text before translating.", "error");
    return;
  }

  showLoading(true);
  stopAnimation();

  try {
    const response = await fetch("/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    showLoading(false);

    if (data.status !== "success") {
      showAlert("Translation failed: " + data.error, "error");
      return;
    }

    signSequence = data.sign_sequence || [];
    updateSignSequenceUI(signSequence);

    signCount.innerText = signSequence.length;
    wordCount.innerText = text.split(" ").length;
    duration.innerText = `${Math.round(data.animation.estimated_duration)}s`;

    if (signSequence.length > 0) {
      loadVideo(signSequence[0].video_url);
    }
  } catch (err) {
    showLoading(false);
    showAlert("Error: " + err.message, "error");
  }
}

// -------------------------------
// UI Rendering
// -------------------------------
function updateSignSequenceUI(sequence) {
  signSequenceDiv.innerHTML = "";

  if (!sequence.length) {
    signSequenceDiv.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No signs found. Try another phrase!</p>
      </div>`;
    return;
  }

  sequence.forEach((sign, idx) => {
    const div = document.createElement("div");
    div.className = "sign-item";
    div.innerHTML = `
      <span class="sign-word">${sign.word || sign.letter}</span>
      <span class="sign-type">${sign.type}</span>`;
    div.onclick = () => {
      currentIndex = idx;
      loadVideo(sign.video_url);
    };
    signSequenceDiv.appendChild(div);
  });
}

// -------------------------------
// Video Controls
// -------------------------------
function loadVideo(videoUrl) {
  if (!videoUrl) {
    videoPlayerContainer.innerHTML = `
      <div class="placeholder-content">
        <span class="placeholder-icon">⚠️</span>
        <p>Video not available</p>
      </div>`;
    return;
  }

  videoPlayerContainer.innerHTML = `
    <video id="videoElement" width="100%" height="auto" autoplay muted>
      <source src="${videoUrl}" type="video/mp4">
      Your browser does not support video playback.
    </video>`;

  videoPlayer = document.getElementById("videoElement");
  videoPlayer.onended = handleVideoEnd;
}

function playAnimation() {
  if (!signSequence.length) {
    showAlert("Please translate text first.", "error");
    return;
  }

  isPlaying = true;
  playNextVideo();
}

function pauseAnimation() {
  if (videoPlayer) videoPlayer.pause();
  isPlaying = false;
}

function stopAnimation() {
  if (videoPlayer) {
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  }
  isPlaying = false;
  currentIndex = 0;
}

function handleVideoEnd() {
  if (isPlaying) {
    currentIndex++;
    if (currentIndex < signSequence.length) {
      loadVideo(signSequence[currentIndex].video_url);
    } else {
      stopAnimation();
      showAlert("✅ Translation playback finished!", "success");
    }
  }
}

function playNextVideo() {
  if (currentIndex < signSequence.length) {
    loadVideo(signSequence[currentIndex].video_url);
  } else {
    stopAnimation();
  }
}

// -------------------------------
// Character Counter
// -------------------------------
inputText.addEventListener("input", () => {
  document.getElementById("charCount").innerText = inputText.value.length;
});
