/* Campus Quest - Focus Dungeon (Pomodoro Study Timer) Component */
import { store } from '../state.js';
import { synth, spawnXpToast } from '../utils/effects.js';

export function initFocusTimer(particleEngine) {
  const timerDigits = document.getElementById('timerDigits');
  const timerLabel = document.getElementById('timerLabel');
  const btnToggleTimer = document.getElementById('btnToggleTimer');
  const btnResetTimer = document.getElementById('btnResetTimer');
  const circleProgress = document.getElementById('timerCircleProgress');
  const ambientBtns = document.querySelectorAll('.ambient-btn');

  let totalSeconds = 25 * 60;
  let remainingSeconds = totalSeconds;
  let isRunning = false;
  let timerInterval = null;
  let currentAmbient = null;
  let ambientAudioNode = null;

  const totalDash = 502; // 2 * PI * r (r=80)

  function updateDisplay() {
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerDigits.innerText = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

    // SVG Offset
    const progressFraction = 1 - (remainingSeconds / totalSeconds);
    const offset = totalDash * (1 - progressFraction);
    if (circleProgress) {
      circleProgress.style.strokeDashoffset = offset;
    }
  }

  function startTimer() {
    isRunning = true;
    btnToggleTimer.innerHTML = '<span>⏸ Pause</span>';
    btnToggleTimer.classList.add('primary');

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateDisplay();

      if (remainingSeconds <= 0) {
        completeSession();
      }
    }, 1000);
  }

  function pauseTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    btnToggleTimer.innerHTML = '<span>▶ Focus</span>';
    btnToggleTimer.classList.remove('primary');
  }

  function resetTimer() {
    pauseTimer();
    remainingSeconds = totalSeconds;
    updateDisplay();
  }

  function completeSession() {
    pauseTimer();
    synth.playLevelUp();
    const rect = timerDigits.getBoundingClientRect();
    spawnXpToast(100, rect.left, rect.top);
    if (particleEngine) {
      particleEngine.burst(rect.left + 50, rect.top + 20, 50);
    }
    
    // Reward user state
    const result = store.addXp(100);
    alert('🔥 Focus Dungeon Sprint Complete! You earned +100 XP!');
    
    if (result.leveledUp) {
      setTimeout(() => {
        alert(`🎉 LEVEL UP! You reached Level ${result.newLevel}!`);
      }, 400);
    }
    resetTimer();
  }

  btnToggleTimer.addEventListener('click', () => {
    synth.playClick();
    if (isRunning) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  btnResetTimer.addEventListener('click', () => {
    synth.playClick();
    resetTimer();
  });

  // Ambient Sound Synth Toggle
  ambientBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      const soundType = btn.getAttribute('data-sound');

      ambientBtns.forEach(b => b.classList.remove('active'));

      if (currentAmbient === soundType) {
        currentAmbient = null; // Toggle off
        stopAmbientAudio();
      } else {
        btn.classList.add('active');
        currentAmbient = soundType;
        playAmbientAudio(soundType);
      }
    });
  });

  function playAmbientAudio(type) {
    stopAmbientAudio();
    try {
      synth.init();
      if (!synth.ctx) return;

      const osc = synth.ctx.createOscillator();
      const gain = synth.ctx.createGain();

      if (type === 'rain') {
        osc.type = 'sine';
        osc.frequency.value = 150;
      } else if (type === 'cafe') {
        osc.type = 'triangle';
        osc.frequency.value = 220;
      } else if (type === 'waves') {
        osc.type = 'sine';
        osc.frequency.value = 110;
      }

      gain.gain.setValueAtTime(0.03, synth.ctx.currentTime);
      osc.connect(gain);
      gain.connect(synth.ctx.destination);
      osc.start();
      ambientAudioNode = { osc, gain };
    } catch (e) {
      console.warn('Ambient audio synth error', e);
    }
  }

  function stopAmbientAudio() {
    if (ambientAudioNode) {
      try {
        ambientAudioNode.osc.stop();
      } catch (e) {}
      ambientAudioNode = null;
    }
  }

  updateDisplay();
}
