/* Campus Quest - Daily Quest Component */
import { store } from '../state.js';
import { synth, spawnXpToast } from '../utils/effects.js';

export function initQuests(particleEngine) {
  const questListEl = document.getElementById('questList');
  const chipBtns = document.querySelectorAll('.chip-btn');
  const addQuestBtn = document.getElementById('btnOpenAddQuest');
  const modalOverlay = document.getElementById('modalAddQuest');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const formAddQuest = document.getElementById('formAddQuest');

  let currentCategory = 'all';

  function render() {
    const state = store.getState();
    const quests = state.quests;

    const filtered = currentCategory === 'all'
      ? quests
      : currentCategory === 'completed'
        ? quests.filter(q => q.completed)
        : quests.filter(q => q.category === currentCategory);

    if (filtered.length === 0) {
      questListEl.innerHTML = `
        <div style="text-align: center; padding: 32px; color: var(--text-muted);">
          <div style="font-size: 32px; margin-bottom: 8px;">🎯</div>
          <p style="font-weight: 600;">No quests in this category yet!</p>
        </div>
      `;
      return;
    }

    questListEl.innerHTML = filtered.map(q => `
      <div class="quest-item ${q.completed ? 'completed' : ''}" data-id="${q.id}">
        <div class="quest-left">
          <button class="quest-checkbox" aria-label="Toggle quest completion">
            ${q.completed ? '✓' : ''}
          </button>
          <div class="quest-info">
            <div class="quest-title">${escapeHtml(q.title)}</div>
            <div class="quest-meta">
              <span class="tag-badge tag-${q.category}">${q.tag}</span>
              <span>⏰ ${q.deadline}</span>
            </div>
          </div>
        </div>
        <div class="quest-right">
          <div class="xp-reward-pill">+${q.xp} XP</div>
        </div>
      </div>
    `).join('');

    // Attach click listeners to checkboxes
    questListEl.querySelectorAll('.quest-item').forEach(item => {
      const id = parseInt(item.getAttribute('data-id'), 10);
      const checkbox = item.querySelector('.quest-checkbox');

      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        const rect = checkbox.getBoundingClientRect();
        const res = store.toggleQuest(id);

        if (res && res.completed) {
          synth.playQuestComplete();
          spawnXpToast(res.xp, rect.left, rect.top);
          if (particleEngine) {
            particleEngine.burst(rect.left + 12, rect.top + 12, 35);
          }
          if (res.leveledUp) {
            setTimeout(() => {
              synth.playLevelUp();
              alert(`🎉 LEVEL UP! You are now Level ${res.newLevel}!`);
            }, 300);
          }
        } else {
          synth.playClick();
        }
      });
    });
  }

  // Filter Chip Listeners
  chipBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playClick();
      chipBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-filter');
      render();
    });
  });

  // Modal Handlers
  if (addQuestBtn && modalOverlay) {
    addQuestBtn.addEventListener('click', () => {
      synth.playClick();
      modalOverlay.classList.add('active');
    });

    btnCloseModal.addEventListener('click', () => {
      synth.playClick();
      modalOverlay.classList.remove('active');
    });

    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        modalOverlay.classList.remove('active');
      }
    });

    formAddQuest.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('questTitleInput').value.trim();
      const category = document.getElementById('questCategorySelect').value;
      const xp = document.getElementById('questXpInput').value;

      if (title) {
        store.addQuest(title, category, xp);
        synth.playQuestComplete();
        formAddQuest.reset();
        modalOverlay.classList.remove('active');
      }
    });
  }

  store.subscribe(render);
  render();
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
