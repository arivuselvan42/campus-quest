/* Campus Quest - Skill Tree & Perks Component */
import { store } from '../state.js';
import { synth, spawnXpToast } from '../utils/effects.js';

export function initSkillTree(particleEngine) {
  const skillGridEl = document.getElementById('skillTreeGrid');

  function render() {
    const state = store.getState();
    const skills = state.skills;

    if (!skillGridEl) return;

    skillGridEl.innerHTML = skills.map(s => `
      <div class="skill-node ${s.unlocked ? 'unlocked' : 'locked'}" data-id="${s.id}">
        <div class="skill-icon">${s.icon}</div>
        <div class="skill-name">${s.name}</div>
        <div class="skill-desc">${s.desc}</div>
        <div style="margin-top: 8px; font-size: 11px; font-weight: 700; color: ${s.unlocked ? 'var(--accent-purple)' : 'var(--accent-gold)'}">
          ${s.unlocked ? '✓ UNLOCKED' : '💎 100 Gems'}
        </div>
      </div>
    `).join('');

    skillGridEl.querySelectorAll('.skill-node').forEach(node => {
      const id = node.getAttribute('data-id');
      node.addEventListener('click', (e) => {
        const skill = store.getState().skills.find(s => s.id === id);
        if (!skill) return;

        if (skill.unlocked) {
          synth.playClick();
          alert(`✨ Perk Active: ${skill.name}\n${skill.desc}`);
        } else {
          const rect = node.getBoundingClientRect();
          const success = store.unlockSkill(id);
          if (success) {
            synth.playLevelUp();
            spawnXpToast('PERK UNLOCKED!', rect.left, rect.top);
            if (particleEngine) {
              particleEngine.burst(rect.left + 50, rect.top + 20, 40);
            }
          } else {
            synth.playClick();
            alert('🔒 You need 100 Focus Gems (💎) to unlock this perk! Complete more daily quests to earn gems.');
          }
        }
      });
    });
  }

  store.subscribe(render);
  render();
}
