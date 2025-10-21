let currentLanguage = 'en';
let signSequence = [];
let isPlaying = false;
let animationInterval = null;
let currentSignIndex = 0;

document.addEventListener('DOMContentLoaded', function() {
    initializeLanguageButtons();
    initializeTextArea();
});

function initializeLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentLanguage = this.dataset.lang;
            updatePlaceholder();
        });
    });
}

function updatePlaceholder() {
    const placeholders = {
        'en': 'Type your message here... (e.g., Hello, how are you?)',
        'hi': 'अपना संदेश यहाँ लिखें... (जैसे, नमस्ते, आप कैसे हैं?)',
        'mr': 'तुमचा संदेश येथे लिहा... (उदा., नमस्कार, तुम्ही कसे आहात?)'
    };
    document.getElementById('inputText').placeholder = placeholders[currentLanguage];
}

function initializeTextArea() {
    const textarea = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    textarea.addEventListener('input', function() {
        charCount.textContent = this.value.length;
    });
}

function showAlert(message, type='success') {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;
    setTimeout(() => alertBox.classList.remove('active'), 5000);
}

async function translateText() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) return showAlert('Please enter text', 'error');

    showLoading(true);
    try {
        const res = await fetch('/api/translate', {
            method: 'POST',
            headers: {'Content-Type':'application/json'},
            body: JSON.stringify({text: text, language: currentLanguage})
        });
        const data = await res.json();
        if (data.status === 'success') {
            signSequence = data.sign_sequence;
            displaySignSequence();
            updateStats();
            showAlert('Translation successful!', 'success');
        } else showAlert(data.error || 'Translation failed', 'error');
    } catch(e) {
        showAlert(e.message, 'error');
    } finally { showLoading(false); }
}

function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    const btn = document.querySelector('.translate-btn');
    spinner.classList.toggle('active', show);
    btn.disabled = show;
}

function displaySignSequence() {
    const container = document.getElementById('signSequence');
    if (!signSequence.length) {
        container.innerHTML = `<div class="empty-state">📝 Enter text above to start</div>`;
        return;
    }
    container.innerHTML = '';
    signSequence.forEach((sign, idx) => {
        const div = document.createElement('div');
        div.className = 'sign-item';
        div.innerHTML = `${idx+1}. <b>${sign.word}</b> - ${sign.type==='sign'?sign.data.emoji:'✋'}`;
        container.appendChild(div);
    });
}

function updateStats() {
    document.getElementById('signCount').textContent = signSequence.length;
    document.getElementById('wordCount').textContent = signSequence.length;
    document.getElementById('duration').textContent = (signSequence.length*2.5).toFixed(1)+'s';
}

function playAnimation() {
    if (!signSequence.length) return showAlert('Translate text first', 'error');
    if (isPlaying) return showAlert('Animation already playing', 'error');
    isPlaying = true; currentSignIndex = 0;
    const player = document.getElementById('videoPlayer');

    animationInterval = setInterval(()=>{
        if(currentSignIndex>=signSequence.length){stopAnimation(); return;}
        const sign = signSequence[currentSignIndex];
        player.innerHTML = `<div style="font-size:5em;">${sign.type==='sign'?sign.data.emoji:'✋'}</div>
                            <div style="font-size:2em;">${sign.word.toUpperCase()}</div>
                            <div style="color:#888;">Sign ${currentSignIndex+1} of ${signSequence.length}</div>`;
        currentSignIndex++;
    },2500);
    showAlert('Playing animation','success');
}

function pauseAnimation(){isPlaying=false; clearInterval(animationInterval);}
function stopAnimation(){isPlaying=false; clearInterval(animationInterval); currentSignIndex=0;
document.getElementById('videoPlayer').innerHTML=`<div>🤟 Animation stopped</div>`;}

