/*
Fixed JS — Flask-based ISL Video Translator
Author: ChatGPT
*/

let signSequence = [];
let isPlaying = false;
let currentIndex = 0;
let videoPlayer = null;

// DOM elements
const inputText = document.getElementById("inputText");
const videoPlayerContainer = document.getElementById("videoPlayer");
const signSequenceDiv = document.getElementById("signSequence");
const wordCount = document.getElementById("wordCount");
const signCount = document.getElementById("signCount");
const duration = document.getElementById("duration");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertBox = document.getElementById("alertBox");

// =======================
// Helper Functions
// =======================
function showAlert(message, type = "info") {
  alertBox.textContent = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3000);
}

function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none";
}

// =======================
// Translation API Call
// =======================
async function translateText() {
  const text = inputText.value.trim();
  if (!text) {
    showAlert("⚠️ Please enter text first!", "error");
    return;
  }

  showLoading(true);
  stopAnimation();

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) throw new Error("Server error. Check Flask console.");

    const data = await response.json();
    if (!data || data.status !== "success") {
      throw new Error(data.error || "Unknown translation error");
    }

    signSequence = data.sign_sequence || [];
    updateSignSequenceUI(signSequence);

    signCount.textContent = signSequence.length;
    wordCount.textContent = text.split(" ").length;
    duration.textContent = `${Math.round(data.animation.estimated_duration)}s`;

    if (signSequence.length && signSequence[0].video_url) {
      loadVideo(signSequence[0].video_url);
    }

    showAlert("✅ Translation successful!", "success");
  } catch (err) {
    console.error("Error:", err);
    showAlert("❌ " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

// =======================
// Sequence Display
// =======================
function updateSignSequenceUI(sequence) {
  signSequenceDiv.innerHTML = "";

  if (!sequence.length) {
    signSequenceDiv.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📝</span>
        <p>No signs found. Try again!</p>
      </div>`;
    return;
  }

  sequence.forEach((sign, idx) => {
    const div = document.createElement("div");
    div.className = "sign-item";
    div.innerHTML = `
      <span class="sign-word">${idx + 1}. ${sign.word}</span>
      <span class="sign-type">${sign.type}</span>
    `;
    div.onclick = () => {
      currentIndex = idx;
      if (sign.video_url) loadVideo(sign.video_url);
      else showAlert("⚠️ No video for this word", "error");
    };
    signSequenceDiv.appendChild(div);
  });
}

// =======================
// Video Controls
// =======================
function loadVideo(url) {
  if (!url) {
    videoPlayerContainer.innerHTML = `
      <div class="placeholder-content">
        <span class="placeholder-icon">⚠️</span>
        <p>Video not available</p>
      </div>`;
    return;
  }

  videoPlayerContainer.innerHTML = `
    <video id="videoElement" width="100%" height="auto" autoplay muted playsinline>
      <source src="${url}" type="video/mp4">
      Your browser does not support video playback.
    </video>
  `;

  videoPlayer = document.getElementById("videoElement");
  videoPlayer.onended = handleVideoEnd;
}

function playAnimation() {
  if (!signSequence.length) return showAlert("⚠️ Translate first!", "error");

  isPlaying = true;
  currentIndex = 0;
  playNextVideo();
  showAlert("▶️ Playing animation", "success");
}

function pauseAnimation() {
  if (videoPlayer) videoPlayer.pause();
  isPlaying = false;
  showAlert("⏸️ Paused", "info");
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
      const next = signSequence[currentIndex];
      if (next.video_url) loadVideo(next.video_url);
      else handleVideoEnd();
    } else {
      stopAnimation();
      showAlert("✅ Playback finished!", "success");
    }
  }
}

function playNextVideo() {
  if (currentIndex < signSequence.length) {
    const sign = signSequence[currentIndex];
    if (sign.video_url) loadVideo(sign.video_url);
    else handleVideoEnd();
  } else stopAnimation();
}

// =======================
// Misc Functions
// =======================
function clearInput() {
  inputText.value = "";
  document.getElementById("charCount").textContent = "0";
}

inputText.addEventListener("input", () => {
  document.getElementById("charCount").textContent = inputText.value.length;
});

// Export functions globally
window.translateText = translateText;
window.playAnimation = playAnimation;
window.pauseAnimation = pauseAnimation;
window.stopAnimation = stopAnimation;
window.clearInput = clearInput;
