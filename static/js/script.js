// -------------------------------
// Sign Language Translator - Video Version (Fixed)
// -------------------------------

let currentIndex = 0;
let signSequence = [];
let isPlaying = false;
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

// -------------------------------
// Helper Functions
// -------------------------------
function showAlert(message, type = "info") {
  if (!alertBox) return;
  alertBox.innerText = message;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(() => (alertBox.style.display = "none"), 3000);
}

function showLoading(show) {
  if (!loadingSpinner) return;
  loadingSpinner.style.display = show ? "block" : "none";
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
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const t = await response.text();
      console.error("Server returned error:", response.status, t);
      throw new Error("Server error: " + response.status);
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      const txt = await response.text();
      console.error("Non-JSON response:", txt);
      throw new Error("Invalid server response (expected JSON).");
    }

    const data = await response.json();
    showLoading(false);

    if (!data || data.status !== "success") {
      showAlert("Translation failed: " + (data && data.error ? data.error : "Unknown error"), "error");
      return;
    }

    signSequence = data.sign_sequence || [];
    updateSignSequenceUI(signSequence);

    signCount.innerText = signSequence.length;
    wordCount.innerText = (text.split(/\s+/).filter(Boolean)).length;
    duration.innerText = `${Math.round(data.animation?.estimated_duration || 0)}s`;

    if (signSequence.length > 0) {
      // load first available video (skip nulls)
      let firstIndex = signSequence.findIndex(s => s.video_url);
      if (firstIndex === -1) {
        showAlert("No video files available for the detected signs.", "warning");
        loadVideo(null);
      } else {
        currentIndex = firstIndex;
        loadVideo(signSequence[firstIndex].video_url);
      }
    } else {
      showAlert("No signs found for the entered text.", "warning");
      loadVideo(null);
    }
  } catch (err) {
    showLoading(false);
    console.error("Translation Error:", err);
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
    div.className = "sign-item" + (sign.type === "fingerspell" ? " fingerspell" : "");
    const label = sign.word || (sign.data && sign.data.file) || sign.letter || ("item" + idx);
    div.innerHTML = `
      <div style="font-weight:bold">${idx + 1}. ${label}</div>
      <div style="font-size:0.85em;color:#666">${sign.type || 'sign'}</div>
    `;
    div.onclick = () => {
      currentIndex = idx;
      if (sign.video_url) loadVideo(sign.video_url);
      else showAlert("No video available for this sign", "error");
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
    videoPlayer = null;
    return;
  }

  videoPlayerContainer.innerHTML = `
    <video id="videoElement" width="100%" height="auto" autoplay controls playsinline>
      <source src="${videoUrl}" type="video/mp4">
      Your browser does not support video playback.
    </video>`;

  videoPlayer = document.getElementById("videoElement");
  if (videoPlayer) {
    videoPlayer.onended = handleVideoEnd;
  }
}

function playAnimation() {
  if (!signSequence.length) {
    showAlert("Please translate text first.", "error");
    return;
  }

  isPlaying = true;
  // start from currentIndex (if it points to nothing, find next)
  if (!signSequence[currentIndex] || !signSequence[currentIndex].video_url) {
    currentIndex = signSequence.findIndex(s => s.video_url);
    if (currentIndex === -1) {
      showAlert("No video files available to play.", "error");
      return;
    }
  }

  loadVideo(signSequence[currentIndex].video_url);
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
    // move to next available video
    let next = currentIndex + 1;
    while (next < signSequence.length && !signSequence[next].video_url) next++;
    if (next < signSequence.length) {
      currentIndex = next;
      loadVideo(signSequence[currentIndex].video_url);
    } else {
      stopAnimation();
      showAlert("✅ Translation playback finished!", "success");
    }
  }
}

// -------------------------------
// Character Counter
// -------------------------------
if (inputText) {
  inputText.addEventListener("input", () => {
    const cc = document.getElementById("charCount");
    if (cc) cc.innerText = inputText.value.length;
  });
}
