/*
 * Modern Sign Language Translator Frontend
 * By Vishal's Project ✨
 */

let signSequence = [];
let currentIndex = 0;
let isPlaying = false;
let videoPlayer = null;

// DOM elements
const videoContainer = document.getElementById("videoPlayer");
const signSequenceDiv = document.getElementById("signSequence");
const inputText = document.getElementById("inputText");
const signCount = document.getElementById("signCount");
const wordCount = document.getElementById("wordCount");
const duration = document.getElementById("duration");

// =================== ALERTS ===================
function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.className = `popup-alert ${type}`;
  alert.innerText = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.classList.add("show"), 50);
  setTimeout(() => {
    alert.classList.remove("show");
    setTimeout(() => alert.remove(), 500);
  }, 3000);
}

// =================== TRANSLATION ===================
async function translateText() {
  const text = inputText.value.trim();
  if (!text) return showAlert("⚠️ Enter text before translating", "error");

  stopAnimation();
  videoContainer.innerHTML = `<div class="loading"><div class="spinner"></div><p>Translating...</p></div>`;

  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });
  const data = await res.json();

  if (data.status !== "success") return showAlert("❌ " + data.error, "error");

  signSequence = data.sign_sequence || [];
  signCount.innerText = signSequence.length;
  wordCount.innerText = text.split(" ").length;
  duration.innerText = `${Math.round(data.animation.estimated_duration)}s`;
  updateSequenceUI();
  showAlert("✅ Translation ready!", "success");

  if (signSequence.length) loadVideo(signSequence[0]);
}

// =================== VIDEO HANDLING ===================
function loadVideo(sign) {
  if (!sign?.data?.path) {
    videoContainer.innerHTML = `<div class="placeholder"><span>⚠️</span><p>Video not available</p></div>`;
    return;
  }

  videoContainer.innerHTML = `
    <video id="videoElement" autoplay muted playsinline>
      <source src="/${sign.data.path}" type="video/mp4">
    </video>
    <div id="progressBar"></div>
  `;

  videoPlayer = document.getElementById("videoElement");
  const progressBar = document.getElementById("progressBar");

  videoPlayer.ontimeupdate = () => {
    const p = (videoPlayer.currentTime / videoPlayer.duration) * 100;
    progressBar.style.width = p + "%";
  };
  videoPlayer.onended = handleVideoEnd;
}

function handleVideoEnd() {
  if (isPlaying) {
    currentIndex++;
    if (currentIndex < signSequence.length) {
      highlightSign(currentIndex);
      loadVideo(signSequence[currentIndex]);
    } else {
      stopAnimation();
      showAlert("✅ Animation finished!", "success");
    }
  }
}

function playAnimation() {
  if (!signSequence.length) return showAlert("⚠️ Translate text first!", "error");
  isPlaying = true;
  highlightSign(currentIndex);
  loadVideo(signSequence[currentIndex]);
}

function pauseAnimation() {
  if (videoPlayer) videoPlayer.pause();
  isPlaying = false;
}

function stopAnimation() {
  isPlaying = false;
  currentIndex = 0;
  if (videoPlayer) videoPlayer.pause();
  clearHighlights();
}

// =================== SEQUENCE DISPLAY ===================
function updateSequenceUI() {
  signSequenceDiv.innerHTML = "";
  signSequence.forEach((sign, idx) => {
    const div = document.createElement("div");
    div.className = "sign-item fade-in";
    div.innerHTML = `<span>${idx + 1}. ${sign.word}</span>`;
    signSequenceDiv.appendChild(div);
  });
}

function highlightSign(i) {
  clearHighlights();
  const items = document.querySelectorAll(".sign-item");
  if (items[i]) items[i].classList.add("highlight");
}

function clearHighlights() {
  document.querySelectorAll(".sign-item").forEach(i => i.classList.remove("highlight"));
}

function clearInput() {
  inputText.value = "";
  signSequenceDiv.innerHTML = "<p class='empty'>Cleared input.</p>";
}

// =================== THEME TOGGLE ===================
const themeSwitch = document.getElementById("themeSwitch");
const saved = localStorage.getItem("theme");
if (saved === "light") {
  document.body.classList.add("light-mode");
  themeSwitch.checked = true;
}

themeSwitch.addEventListener("change", () => {
  if (themeSwitch.checked) {
    document.body.classList.add("light-mode");
    localStorage.setItem("theme", "light");
    showAlert("🌞 Light mode enabled", "info");
  } else {
    document.body.classList.remove("light-mode");
    localStorage.setItem("theme", "dark");
    showAlert("🌙 Dark mode enabled", "info");
  }
});
