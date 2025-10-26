// static/js/script.js
let currentIndex = 0;
let signSequence = [];
let isPlaying = false;
let videoPlayer = null;

const inputText = document.getElementById("inputText");
const videoPlayerContainer = document.getElementById("videoPlayer");
const signSequenceDiv = document.getElementById("signSequence");
const wordCount = document.getElementById("wordCount");
const signCount = document.getElementById("signCount");
const duration = document.getElementById("duration");
const loadingSpinner = document.getElementById("loadingSpinner");
const alertBox = document.getElementById("alertBox");

function showAlert(msg, type="info"){
  if(!alertBox) return;
  alertBox.innerText = msg;
  alertBox.className = `alert ${type}`;
  alertBox.style.display = "block";
  setTimeout(()=> alertBox.style.display="none", 3500);
}

function showLoading(show){
  if(!loadingSpinner) return;
  loadingSpinner.style.display = show ? "block" : "none";
}

async function translateText(){
  const text = inputText.value.trim();
  if(!text){
    showAlert("Please enter text.", "error");
    return;
  }
  showLoading(true);
  stopAnimation();

  try {
    const resp = await fetch("/api/translate", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({text})
    });
    const data = await resp.json();
    showLoading(false);

    if(!data || data.status !== "success"){
      showAlert("Translation failed: " + (data && data.error ? data.error : "Unknown"), "error");
      return;
    }

    signSequence = data.sign_sequence || [];
    updateSignSequenceUI(signSequence);

    signCount.innerText = signSequence.length;
    wordCount.innerText = (text.split(/\s+/).filter(Boolean)).length;
    duration.innerText = `${Math.round(data.animation?.estimated_duration || 0)}s`;

    if(signSequence.length > 0){
      // find first available video_url
      let idx = signSequence.findIndex(s => s.video_url);
      if(idx === -1) idx = 0;
      currentIndex = idx;
      const first = signSequence[currentIndex].video_url || `/static/videos/${signSequence[currentIndex].word}.mp4`;
      loadVideo(first);
    } else {
      showAlert("No signs found for this text.", "warning");
      loadVideo(null);
    }
  } catch(err){
    showLoading(false);
    console.error("Translate error:", err);
    showAlert("Server error: " + err.message, "error");
  }
}

function updateSignSequenceUI(sequence){
  signSequenceDiv.innerHTML = "";
  if(!sequence.length){
    signSequenceDiv.innerHTML = `<div class="empty-state"><span class="empty-icon">📝</span><p>No signs found</p></div>`;
    return;
  }
  sequence.forEach((s, i) => {
    const el = document.createElement("div");
    el.className = "sign-item" + (s.type === "fingerspell" ? " fingerspell" : "");
    el.innerHTML = `<div style="font-weight:bold">${i+1}. ${s.word}</div><div style="font-size:.9em;color:#666">${s.type}</div>`;
    el.onclick = () => {
      currentIndex = i;
      const url = s.video_url || `/static/videos/${s.word}.mp4`;
      loadVideo(url);
    };
    signSequenceDiv.appendChild(el);
  });
}

function loadVideo(url){
  if(!url){
    videoPlayerContainer.innerHTML = `<div class="placeholder-content"><span class="placeholder-icon">⚠️</span><p>No video file available</p></div>`;
    videoPlayer = null;
    return;
  }

  console.log("Loading video:", url);
  videoPlayerContainer.innerHTML = `<video id="videoElement" width="100%" controls autoplay playsinline>
    <source src="${url}" type="video/mp4">
    Your browser does not support video playback.
  </video>`;

  videoPlayer = document.getElementById("videoElement");
  if(videoPlayer) videoPlayer.onended = handleVideoEnd;
}

function playAnimation(){
  if(!signSequence.length){
    showAlert("Translate text first.", "error");
    return;
  }
  isPlaying = true;
  // ensure currentIndex points to available video
  if(!signSequence[currentIndex] || !(signSequence[currentIndex].video_url || signSequence[currentIndex].word)){
    currentIndex = signSequence.findIndex(s => s.video_url) || 0;
  }
  const url = signSequence[currentIndex].video_url || `/static/videos/${signSequence[currentIndex].word}.mp4`;
  loadVideo(url);
}

function pauseAnimation(){
  if(videoPlayer) videoPlayer.pause();
  isPlaying = false;
  showAlert("Paused", "info");
}

function stopAnimation(){
  if(videoPlayer){
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
  }
  isPlaying = false;
  currentIndex = 0;
  showAlert("Stopped", "info");
}

function handleVideoEnd(){
  if(!isPlaying) return;
  // advance to next index that has a video (video_url or fallback file exists client-side)
  let next = currentIndex + 1;
  if(next >= signSequence.length){
    stopAnimation();
    showAlert("Playback finished", "success");
    return;
  }
  currentIndex = next;
  const url = signSequence[currentIndex].video_url || `/static/videos/${signSequence[currentIndex].word}.mp4`;
  loadVideo(url);
}

if(inputText){
  inputText.addEventListener("input", () => {
    const cc = document.getElementById("charCount");
    if(cc) cc.innerText = inputText.value.length;
  });
}
