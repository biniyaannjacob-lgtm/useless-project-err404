// DOM Elements
const bodyElem = document.getElementById('app-body');
const mainContainer = document.getElementById('main-container');
const startBtn = document.getElementById('start-btn');
const stopBtn = document.getElementById('stop-btn');
const therapyBtn = document.getElementById('therapy-btn');
const panicBtn = document.getElementById('panic-btn');
const statusDisplay = document.getElementById('status-display');
const disabledKeyWarning = document.getElementById('disabled-key-warning');

const targetParagraphElem = document.getElementById('target-paragraph');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

const totalKeysElem = document.getElementById('total-keys');
const backspacesElem = document.getElementById('backspaces');
const spacesElem = document.getElementById('spaces');
const entersElem = document.getElementById('enters');

const diagnosisDisplay = document.getElementById('diagnosis-display');
const destructTimerElem = document.getElementById('destruct-timer');
const adviceDisplay = document.getElementById('advice-display');
const newAdviceBtn = document.getElementById('new-advice-btn');

// State Variables
let isSessionActive = false;
let typedText = "";
let totalKeys = 0;
let backspaces = 0;
let spaces = 0;
let enters = 0;
let keyCounts = {};
let disabledKeys = new Set();
let disableKeyInterval = null;
let chaosModeActive = false;
let destructInterval = null;

// Spam Blocker / Restraining Order State
let lastKey = '';
let sameKeyCount = 0;
let lastKeyTime = 0;

const targetText = targetParagraphElem ? targetParagraphElem.textContent.trim() : "";

const unhelpfulAdvice = [
    "Psychologist Fact: 94% of backspace presses are caused by overthinking.",
    "Have you tried apologizing to your Shift key?",
    "Typing faster won't make your problems go away, but it looks impressive.",
    "If you press Spacebar 100 times, nothing happens. We checked.",
    "Warning: Extreme emotional attachment to the Enter key detected.",
    "Your keyboard can smell your hesitation."
];

// Passive-Aggressive Auto-Correct Dictionary
const sarcasticSwaps = {
    "sorry": "sorry (not really)",
    "because": "because... reasons",
    "obviously": "as if you knew",
    "oops": "oops (classic move)",
    "why": "why must you overthink"
};

// Audio Context Singleton
let audioCtx = null;
function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
}

// 🐱 Synthesized Meow Sound
function playMeowSound(pitchMultiplier = 1) {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        
        const baseFreq = 400 * pitchMultiplier;
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(baseFreq * 1.3, ctx.currentTime + 0.1);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.7, ctx.currentTime + 0.25);

        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.25);
    } catch(e){}
}

function playBuzzerSound() {
    try {
        const ctx = getAudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } catch(e){}
}

function playVictorySound() {
    try {
        const ctx = getAudioContext();
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.1);
            gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.1);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.1 + 0.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(ctx.currentTime + index * 0.1);
            osc.stop(ctx.currentTime + index * 0.1 + 0.2);
        });
    } catch(e){}
}

// 👁️ Judgemental Eyes Mouse Follower
document.addEventListener('mousemove', (e) => {
    const pupils = document.querySelectorAll('.pupil');
    pupils.forEach(pupil => {
        const eye = pupil.parentElement;
        const rect = eye.getBoundingClientRect();
        const eyeX = rect.left + rect.width / 2;
        const eyeY = rect.top + rect.height / 2;
        const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
        const distance = Math.min(10, Math.hypot(e.clientX - eyeX, e.clientY - eyeY) / 10);
        
        pupil.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px)`;
    });
});

// ⌨️ Keydown Listener
window.addEventListener('keydown', (e) => {
    if (!isSessionActive) return;

    // PREVENT SPACEBAR FROM SCROLLING THE PAGE
    if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
    }

    let pressedKey = e.key.toLowerCase();

    // Check if key is confiscated
    if (disabledKeys.has(pressedKey)) {
        e.preventDefault();
        playBuzzerSound();
        triggerContainerShake();
        let keyDisplayName = pressedKey === ' ' ? 'SPACE' : pressedKey.toUpperCase();
        if (disabledKeyWarning) {
            disabledKeyWarning.textContent = `🚨 DENIED! The key '${keyDisplayName}' is confiscated!`;
        }
        return;
    }

    // --- FEATURE: Keyboard Restraining Order (Spam Check) ---
    const now = Date.now();
    if (pressedKey === lastKey && (now - lastKeyTime) < 1500) {
        sameKeyCount++;
    } else {
        sameKeyCount = 1;
        lastKey = pressedKey;
    }
    lastKeyTime = now;

    if (sameKeyCount >= 5 && !disabledKeys.has(pressedKey)) {
        disabledKeys.add(pressedKey);
        playBuzzerSound();
        triggerContainerShake();
        
        let keyDisplayName = pressedKey === ' ' ? 'SPACE' : pressedKey.toUpperCase();
        if (disabledKeyWarning) {
            disabledKeyWarning.textContent = `⚖️ LEGAL NOTICE: A restraining order has been issued between you and the '${keyDisplayName}' key!`;
        }
        
        let keyElem = document.querySelector(`.key[data-key="${pressedKey}"]`);
        if (keyElem) keyElem.classList.add('confiscated');
        
        sameKeyCount = 0;
        return;
    }

    // --- FEATURE: Play Meow Sounds ---
    if (e.key === 'Backspace') {
        playBuzzerSound();
    } else {
        let randomPitch = 0.8 + Math.random() * 0.5;
        playMeowSound(randomPitch);
    }

    totalKeys++;
    if (totalKeysElem) totalKeysElem.textContent = totalKeys;

    // Track Key Frequencies
    keyCounts[pressedKey] = (keyCounts[pressedKey] || 0) + 1;
    animateVirtualKey(pressedKey);

    // Handle Inputs
    if (e.key === 'Backspace') {
        backspaces++;
        if (backspacesElem) backspacesElem.textContent = backspaces;
        typedText = typedText.slice(0, -1);
    } else if (e.key === ' ') {
        spaces++;
        if (spacesElem) spacesElem.textContent = spaces;
        typedText += ' ';
    } else if (e.key === 'Enter') {
        enters++;
        if (entersElem) entersElem.textContent = enters;
    } else if (e.key.length === 1) {
        typedText += e.key;
    }

    // --- FEATURE: Passive-Aggressive Auto-Correct ---
    Object.keys(sarcasticSwaps).forEach(trigger => {
        if (typedText.endsWith(trigger + " ")) {
            typedText = typedText.slice(0, -(trigger.length + 1)) + sarcasticSwaps[trigger] + " ";
            if (statusDisplay) statusDisplay.textContent = `😏 Auto-Correct updated '${trigger}'!`;
        }
    });

    updateProgress();
});

// Key Animation & Heatmap
function animateVirtualKey(key) {
    let keyElem = document.querySelector(`.key[data-key="${key}"]`);
    if (keyElem) {
        keyElem.classList.add('active');
        setTimeout(() => keyElem.classList.remove('active'), 120);

        let count = keyCounts[key] || 0;
        if (count > 15) keyElem.style.background = '#ff4757';
        else if (count > 8) keyElem.style.background = '#ffa502';
        else if (count > 3) keyElem.style.background = '#2ed573';
    }
}

function triggerContainerShake() {
    if (mainContainer) {
        mainContainer.classList.add('screen-shake');
        setTimeout(() => mainContainer.classList.remove('screen-shake'), 400);
    }
}

// Update Progress Bar
function updateProgress() {
    if (!targetText) return;
    let matchedChars = 0;
    for (let i = 0; i < typedText.length; i++) {
        if (typedText[i] === targetText[i]) matchedChars++;
    }
    
    let progressPercent = Math.min(100, Math.floor((matchedChars / targetText.length) * 100));
    if (progressBar) progressBar.style.width = `${progressPercent}%`;
    if (progressText) progressText.textContent = `Progress: ${progressPercent}%`;

    if (progressPercent >= 100) {
        playVictorySound();
        if (statusDisplay) statusDisplay.textContent = "Paragraph completed! Stopping session...";
        stopSession();
    }
}

// Disable Most Used Key Every 1 Minute
function startDisablingKeys() {
    disableKeyInterval = setInterval(() => {
        if (!isSessionActive) return;

        let sortedKeys = Object.keys(keyCounts)
            .filter(k => k.length === 1 && !disabledKeys.has(k))
            .sort((a, b) => keyCounts[b] - keyCounts[a]);

        if (sortedKeys.length > 0) {
            let keyToDisable = sortedKeys[0];
            disabledKeys.add(keyToDisable);
            
            playBuzzerSound();
            triggerContainerShake();

            let keyDisplayName = keyToDisable === ' ' ? 'SPACE' : keyToDisable.toUpperCase();
            if (disabledKeyWarning) {
                disabledKeyWarning.textContent = `🚫 PSYCHOLOGIST NOTICE: Key '${keyDisplayName}' disabled due to obsession!`;
            }
            
            let keyElem = document.querySelector(`.key[data-key="${keyToDisable}"]`);
            if (keyElem) keyElem.classList.add('confiscated');
        }
    }, 60000);
}

// Start Session
if (startBtn) {
    startBtn.addEventListener('click', () => {
        isSessionActive = true;
        totalKeys = 0;
        backspaces = 0;
        spaces = 0;
        enters = 0;
        typedText = "";
        keyCounts = {};
        disabledKeys.clear();
        sameKeyCount = 0;
        clearInterval(destructInterval);

        document.querySelectorAll('.key').forEach(k => {
            k.style.background = '#2f3542';
            k.classList.remove('confiscated');
        });

        if (totalKeysElem) totalKeysElem.textContent = "0";
        if (backspacesElem) backspacesElem.textContent = "0";
        if (spacesElem) spacesElem.textContent = "0";
        if (entersElem) entersElem.textContent = "0";
        if (disabledKeyWarning) disabledKeyWarning.textContent = "";
        if (destructTimerElem) destructTimerElem.textContent = "";
        if (progressBar) progressBar.style.width = "0%";
        if (progressText) progressText.textContent = "Progress: 0%";
        if (diagnosisDisplay) diagnosisDisplay.textContent = "Analyzing your keystroke behavior...";

        startBtn.disabled = true;
        if (stopBtn) stopBtn.disabled = false;
        if (statusDisplay) statusDisplay.textContent = "Session Active: Start typing the paragraph above!";

        startDisablingKeys();
    });
}

// Stop Session
function stopSession() {
    if (!isSessionActive) return;

    isSessionActive = false;
    clearInterval(disableKeyInterval);

    if (startBtn) startBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = true;

    generateRoastDiagnosis();
    startSelfDestructTimer();

    if (statusDisplay) statusDisplay.textContent = "Session complete! Diagnosis generated locally.";
}

if (stopBtn) {
    stopBtn.addEventListener('click', stopSession);
}

// Self-Destruct Timer
function startSelfDestructTimer() {
    let timeLeft = 5;
    if (destructTimerElem) {
        destructTimerElem.textContent = `💥 This diagnosis will self-destruct in ${timeLeft}s to preserve your dignity!`;
    }

    destructInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            if (destructTimerElem) {
                destructTimerElem.textContent = `💥 This diagnosis will self-destruct in ${timeLeft}s to preserve your dignity!`;
            }
        } else {
            clearInterval(destructInterval);
            if (diagnosisDisplay) diagnosisDisplay.textContent = "[ REDACTED BY PSYCHOLOGIST ]";
            if (destructTimerElem) destructTimerElem.textContent = "🔥 Diagnosis destroyed forever.";
        }
    }, 1000);
}

// Panic Button
if (panicBtn) {
    panicBtn.addEventListener('click', () => {
        if (bodyElem) bodyElem.classList.toggle('panic-mode');
        playBuzzerSound();
    });
}

// Chaos Mode Toggle
if (therapyBtn) {
    therapyBtn.addEventListener('click', () => {
        chaosModeActive = !chaosModeActive;
        if (chaosModeActive) {
            therapyBtn.textContent = "🌀 CHAOS MODE: ACTIVE";
            therapyBtn.style.background = "#ff4757";
            if (statusDisplay) statusDisplay.textContent = "Psychological Therapy engaged: Maximum absurd behavior enabled.";
        } else {
            therapyBtn.textContent = "🌀 PSYCHOLOGICAL THERAPY MODE";
            therapyBtn.style.background = "#00d2d3";
            if (statusDisplay) statusDisplay.textContent = "Therapy Mode disengaged.";
        }
    });
}

// Unhelpful Advice Generator
if (newAdviceBtn) {
    newAdviceBtn.addEventListener('click', () => {
        playMeowSound(1.2);
        const randomAdvice = unhelpfulAdvice[Math.floor(Math.random() * unhelpfulAdvice.length)];
        if (adviceDisplay) adviceDisplay.textContent = randomAdvice;
    });
}

// Generate Absurd Psychological Diagnosis
function generateRoastDiagnosis() {
    let roasts = [];

    if (backspaces > 10) {
        roasts.push("Diagnosis: Extreme Regret Syndrome. You spend more time taking back your words than saying them.");
    } else if (spaces > 15) {
        roasts.push("Diagnosis: Excessive Hesitation. You create physical space between words because you fear commitment.");
    } else if (enters > 3) {
        roasts.push("Diagnosis: Key Aggression Disorder. Please stop taking out your anger on the Enter key.");
    } else {
        roasts.push("Diagnosis: Dangerously Normal. Your typing lacks dramatic flair. Seek professional chaos.");
    }

    if (diagnosisDisplay) {
        diagnosisDisplay.textContent = roasts.join(" ");
    }
}