/*
File: script.js
Location: static/js/script.js
Description: Frontend JavaScript for Sign Language Translation System
*/

// ============================================
// GLOBAL VARIABLES
// ============================================
let currentLanguage = 'en';
let signSequence = [];
let isPlaying = false;
let animationInterval = null;
let currentSignIndex = 0;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Sign Language Translation System Initialized');
    initializeLanguageButtons();
    initializeTextArea();
});

// ============================================
// LANGUAGE SELECTOR
// ============================================
function initializeLanguageButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current language
            currentLanguage = this.dataset.lang;
            
            // Update placeholder text
            updatePlaceholder();
        });
    });
}

function updatePlaceholder() {
    const textarea = document.getElementById('inputText');
    const placeholders = {
        'en': 'Type your message here... (e.g., Hello, how are you?)',
        'hi': 'अपना संदेश यहाँ लिखें... (जैसे, नमस्ते, आप कैसे हैं?)',
        'mr': 'तुमचा संदेश येथे लिहा... (उदा., नमस्कार, तुम्ही कसे आहात?)'
    };
    textarea.placeholder = placeholders[currentLanguage] || placeholders['en'];
}

// ============================================
// TEXT AREA FUNCTIONALITY
// ============================================
function initializeTextArea() {
    const textarea = document.getElementById('inputText');
    const charCount = document.getElementById('charCount');
    
    textarea.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        // Change color based on length
        if (length > 500) {
            charCount.style.color = '#f44336';
        } else if (length > 300) {
            charCount.style.color = '#ff9800';
        } else {
            charCount.style.color = '#999';
        }
    });
}

// ============================================
// ALERT SYSTEM
// ============================================
function showAlert(message, type = 'success') {
    const alertBox = document.getElementById('alertBox');
    alertBox.textContent = message;
    alertBox.className = `alert ${type} active`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertBox.classList.remove('active');
    }, 5000);
}

// ============================================
// TRANSLATION FUNCTION
// ============================================
async function translateText() {
    const inputText = document.getElementById('inputText').value.trim();
    
    // Validation
    if (!inputText) {
        showAlert('⚠️ Please enter some text to translate', 'error');
        return;
    }
    
    if (inputText.length < 2) {
        showAlert('⚠️ Please enter at least 2 characters', 'error');
        return;
    }
    
    // Show loading
    showLoading(true);
    
    try {
        // Call API
        const response = await fetch('/api/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: inputText,
                language: currentLanguage
            })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            signSequence = result.sign_sequence;
            displaySignSequence();
            updateStats();
            showAlert('✅ Translation successful!', 'success');
        } else {
            showAlert('❌ Translation failed: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Translation error:', error);
        showAlert('❌ Error: ' + error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================================
// LOADING STATE
// ============================================
function showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const translateBtn = document.querySelector('.translate-btn');
    
    if (show) {
        loadingSpinner.classList.add('active');
        translateBtn.disabled = true;
        translateBtn.classList.add('translating');
    } else {
        loadingSpinner.classList.remove('active');
        translateBtn.disabled = false;
        translateBtn.classList.remove('translating');
    }
}

// ============================================
// DISPLAY SIGN SEQUENCE
// ============================================
function displaySignSequence() {
    const container = document.getElementById('signSequence');
    
    if (signSequence.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <span class="empty-icon">📝</span>
                <p>No signs to display</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    signSequence.forEach((sign, idx) => {
        const signItem = document.createElement('div');
        signItem.className = 'sign-item';
        signItem.style.animationDelay = `${idx * 0.1}s`;
        
        const typeClass = sign.type === 'fingerspell' ? 'fingerspell' : '';
        
        signItem.innerHTML = `
            <span class="sign-word">${idx + 1}. ${sign.word}</span>
            <span class="sign-type ${typeClass}">${sign.type}</span>
        `;
        
        container.appendChild(signItem);
    });
}

// ============================================
// UPDATE STATISTICS
// ============================================
function updateStats() {
    const signCount = signSequence.length;
    const wordCount = signSequence.length;
    const duration = (signSequence.length * 2.5).toFixed(1);
    
    // Animate number changes
    animateValue('signCount', 0, signCount, 500);
    animateValue('wordCount', 0, wordCount, 500);
    
    document.getElementById('duration').textContent = duration + 's';
}

function animateValue(id, start, end, duration) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current);
    }, 16);
}

// ============================================
// ANIMATION CONTROLS
// ============================================
function playAnimation() {
    if (signSequence.length === 0) {
        showAlert('⚠️ Please translate some text first', 'error');
        return;
    }
    
    if (isPlaying) {
        showAlert('⚠️ Animation is already playing', 'error');
        return;
    }
    
    isPlaying = true;
    currentSignIndex = 0;
    
    const videoPlayer = document.getElementById('videoPlayer');
    
    // Start animation
    animationInterval = setInterval(() => {
        if (!isPlaying || currentSignIndex >= signSequence.length) {
            stopAnimation();
            return;
        }
        
        const currentSign = signSequence[currentSignIndex];
        
        videoPlayer.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 5em; margin-bottom: 20px;">🤟</div>
                <div style="font-size: 2em; font-weight: bold; margin-bottom: 10px;">
                    ${currentSign.word.toUpperCase()}
                </div>
                <div style="color: #888; font-size: 1.2em;">
                    Sign ${currentSignIndex + 1} of ${signSequence.length}
                </div>
                <div style="margin-top: 20px; color: #aaa;">
                    ${currentSign.type === 'fingerspell' ? '✋ Fingerspelling' : '🤟 Sign Language'}
                </div>
            </div>
        `;
        
        // Highlight current sign in sequence
        highlightCurrentSign(currentSignIndex);
        
        currentSignIndex++;
    }, 2500); // 2.5 seconds per sign
    
    showAlert('▶️ Playing animation', 'success');
}

function pauseAnimation() {
    if (!isPlaying) {
        showAlert('⚠️ No animation is playing', 'error');
        return;
    }
    
    isPlaying = false;
    clearInterval(animationInterval);
    showAlert('⏸️ Animation paused', 'success');
}

function stopAnimation() {
    isPlaying = false;
    clearInterval(animationInterval);
    currentSignIndex = 0;
    
    const videoPlayer = document.getElementById('videoPlayer');
    videoPlayer.innerHTML = `
        <div class="placeholder-content">
            <span class="placeholder-icon">✅</span>
            <p>Animation complete</p>
            <small style="color: #888; display: block; margin-top: 10px;">
                Click Play to watch again
            </small>
        </div>
    `;
    
    // Remove highlights
    document.querySelectorAll('.sign-item').forEach(item => {
        item.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
    });
    
    showAlert('⏹️ Animation stopped', 'success');
}

function highlightCurrentSign(index) {
    // Remove all highlights
    document.querySelectorAll('.sign-item').forEach(item => {
        item.style.background = 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)';
        item.style.transform = 'translateX(0)';
    });
    
    // Highlight current sign
    const signItems = document.querySelectorAll('.sign-item');
    if (signItems[index]) {
        signItems[index].style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        signItems[index].style.transform = 'translateX(10px) scale(1.05)';
        signItems[index].querySelector('.sign-word').style.color = 'white';
        
        // Scroll into view
        signItems[index].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================
document.addEventListener('keydown', function(event) {
    // Ctrl/Cmd + Enter to translate
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        event.preventDefault();
        translateText();
    }
    
    // Space to play/pause (when not focused on textarea)
    if (event.key === ' ' && document.activeElement.tagName !== 'TEXTAREA') {
        event.preventDefault();
        if (isPlaying) {
            pauseAnimation();
        } else {
            playAnimation();
        }
    }
    
    // Escape to stop
    if (event.key === 'Escape') {
        stopAnimation();
    }
});

// ============================================
// UTILITY FUNCTIONS
// ============================================
function clearInput() {
    document.getElementById('inputText').value = '';
    document.getElementById('charCount').textContent = '0';
}

function clearResults() {
    signSequence = [];
    displaySignSequence();
    updateStats();
    stopAnimation();
}

// ============================================
// EXPORT FUNCTIONS (for HTML inline use)
// ============================================
window.translateText = translateText;
window.playAnimation = playAnimation;
window.pauseAnimation = pauseAnimation;
window.stopAnimation = stopAnimation;
window.clearInput = clearInput;
window.clearResults = clearResults;

// ============================================
// CONSOLE INFO
// ============================================
console.log('%c Sign Language Translation System ', 'background: #667eea; color: white; font-size: 16px; padding: 10px; border-radius: 5px;');
console.log('%c Made with ❤️ for Deaf and Mute Students ', 'color: #667eea; font-size: 12px;');
console.log('%c Keyboard Shortcuts: ', 'font-weight: bold; font-size: 14px;');
console.log('  • Ctrl/Cmd + Enter: Translate');
console.log('  • Space: Play/Pause');
console.log('  • Escape: Stop');
