/*
File: static/js/script.js
Description: Frontend JavaScript for Flask-based ISL Sign Language Translator (Video Version)
Updated: Fixed API route, video playback, loading states, and improved visuals
*/

// ==================================================
// GLOBAL VARIABLES
// ==================================================
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

// ==================================================
// UTILITIES
// ==================================================
function showAlert(message, type = "success") {
  alertBox.innerText = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3500);
}

function showLoading(show) {
  loadingSpinner.style.display = show ? "flex" : "none";
}

// ==================================================
// TRANSLATION REQUEST
// ==================================================
async function translateText() {
  const text = inputText.value.trim();

  if (!text) {
    showAlert("⚠️ Please enter text before translating.", "error");
    return;
  }

  showLoading(true);
  stopAnimation();
  signSequenceDiv.innerHTML = `<div class="loading-text">Translating...</div>`;

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server error: ${errorText}`);
    }

    const data = await response.json();

    if (!data || data.status !== "success") {
      throw new Error(data?.error || "Unknown error occurred");
    }

    signSequence = data.sign_sequence || [];

    if (!signSequence.length) {
      signSequenceDiv.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📝</span>
          <p>No matching signs found.</p>
        </div>`;
      showLoading(false);
      return;
    }

    updateSignSequenceUI(signSequence);
    signCount.innerText = signSequence.length;
    wordCount.innerText = text.split(" ").length;
    duration.innerText = `${Math.round(data.animation.estimated_duration)}s`;

    // Load first video automatically
    if (signSequence[0].video_url) loadVideo(signSequence[0].video_url);
    else showAlert("Some signs have no video files.", "error");

    showAlert("✅ Translation successful!", "success");
  } catch (err) {
    console.error("Translation error:", err);
    showAlert("❌ " + err.message, "error");
  } finally {
    showLoading(false);
  }
}

// ==================================================
// SIGN SEQUENCE DISPLAY
// ==================================================
function updateSignSequenceUI(sequence) {
  signSequenceDiv.innerHTML = "";

  sequence.forEach((sign, idx) => {
    const div = document.createElement("div");
    div.className = "sign-item fade-in";
    div.innerHTML = `
      <span class="sign-word">${idx + 1}. ${sign.word}</span>
      <span class="sign-type">${sign.type}</span>
    `;
    div.onclick = () => {
      currentIndex = idx;
      if (sign.video_url) loadVideo(sign.video_url);
      else showAlert("⚠️ No video available for this sign.", "error");
    };
    signSequenceDiv.appendChild(div);
  });
}

// ==================================================
// VIDEO PLAYER
// ==================================================
function loadVideo(videoUrl) {
  if (!videoUrl) {
    videoPlayerContainer.innerHTML = `
      <div class="placeholder-content">
        <span class="placeholder-icon">⚠️</span>
        <p>Video not available</p>
      </div>`;
    return;
  }

  const videoHTML = `
    <video id="videoElement" width="100%" height="auto" autoplay muted playsinline>
      <source src="${videoUrl}" type="video/mp4">
      Your browser does not support video playback.
    </video>
  `;

  videoPlayerContainer.innerHTML = videoHTML;
  videoPlayer = document.getElementById("videoElement");
  videoPlayer.onended = handleVideoEnd;
}

// ==================================================
// VIDEO CONTROLS
// ==================================================
function playAnimation() {
  if (!signSequence.length) {
    showAlert("⚠️ Please translate some text first.", "error");
    return;
  }

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
  showAlert("⏹️ Stopped", "info");
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
      showAlert("✅ Playback complete!", "success");
    }
  }
}

function playNextVideo() {
  if (currentIndex < signSequence.length) {
    const sign = signSequence[currentIndex];
    if (sign.video_url) loadVideo(sign.video_url);
    else handleVideoEnd();
  } else {
    stopAnimation();
  }
}

// ==================================================
// UTILITIES
// ==================================================
function clearInput() {
  inputText.value = "";
  document.getElementById("charCount").innerText = "0";
}

function clearResults() {
  signSequence = [];
  signSequenceDiv.innerHTML = `
    <div class="empty-state">
      <span class="empty-icon">📝</span>
      <p>Translation will appear here</p>
    </div>`;
  stopAnimation();
  wordCount.innerText = "0";
  signCount.innerText = "0";
  duration.innerText = "0s";
}

// ==================================================
// CHARACTER COUNTER
// ==================================================
inputText.addEventListener("input", () => {
  document.getElementById("charCount").innerText = inputText.value.length;
});

// ==================================================
// EXPORT TO WINDOW
// ==================================================
window.translateText = translateText;
window.playAnimation = playAnimation;
window.pauseAnimation = pauseAnimation;
window.stopAnimation = stopAnimation;
window.clearInput = clearInput;
window.clearResults = clearResults;
