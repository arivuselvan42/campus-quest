/* Campus Quest - Main Application Entrypoint */
import { store } from './state.js';
import { synth, ParticleEngine } from './utils/effects.js';
import { initQuests } from './components/quests.js';
import { initFocusTimer } from './components/timer.js';
import { initSkillTree } from './components/skillTree.js';
import { initLeaderboard } from './components/leaderboard.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Particle Canvas Engine
  const particleEngine = new ParticleEngine('fxCanvas');

  // Mute Sound Toggle
  const btnToggleMute = document.getElementById('btnToggleMute');
  if (btnToggleMute) {
    btnToggleMute.addEventListener('click', () => {
      const isMuted = synth.toggleMute();
      btnToggleMute.innerHTML = isMuted ? '🔇' : '🔊';
    });
  }

  // Header Profile Sync
  function syncHeaderProfile() {
    const user = store.getState().user;
    
    document.getElementById('headerLevelBadge').innerText = `Lvl ${user.level}`;
    document.getElementById('headerUserName').innerText = user.name;
    document.getElementById('headerUserTitle').innerText = user.title;
    document.getElementById('headerStreakCount').innerText = `${user.streak} Days`;
    document.getElementById('headerGemsCount').innerText = `${user.gems}`;
    
    // Hero Banner Stats
    document.getElementById('heroLevelTitle').innerText = `Level ${user.level} - ${user.title}`;
    document.getElementById('heroXpCounter').innerText = `${user.xp.toLocaleString()} / ${user.nextLevelXp.toLocaleString()} XP`;

    const xpPct = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));
    document.getElementById('heroXpFill').style.width = `${xpPct}%`;
    document.getElementById('heroXpMeta').innerText = `${xpPct}% towards Level ${user.level + 1}`;
  }

  store.subscribe(syncHeaderProfile);
  syncHeaderProfile();

  // Tab Navigation System
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      const targetTab = btn.getAttribute('data-tab');

      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabPanels.forEach(panel => {
        if (panel.id === `tab-${targetTab}`) {
          panel.style.display = 'block';
        } else {
          panel.style.display = 'none';
        }
      });
    });
  });

  // Initialize Modules
  initQuests(particleEngine);
  initFocusTimer(particleEngine);
  initSkillTree(particleEngine);
  initLeaderboard();

  console.log('⚔️ Campus Quest App initialized!');
});
