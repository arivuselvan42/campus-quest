/* Campus Quest - Standings & Leaderboard Component */
import { store } from '../state.js';

export function initLeaderboard() {
  const leaderboardEl = document.getElementById('leaderboardList');

  function render() {
    if (!leaderboardEl) return;
    const state = store.getState();
    const board = [...state.leaderboard].sort((a, b) => b.xp - a.xp);

    leaderboardEl.innerHTML = board.map((item, index) => {
      const rank = index + 1;
      const rankIcon = rank === 1 ? '👑' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';

      return `
        <div class="leader-item ${item.isUser ? 'user-highlight' : ''}">
          <div class="leader-left">
            <div class="rank-badge ${rankClass}">${rankIcon}</div>
            <img src="${item.avatar}" alt="${item.name}" class="leader-avatar" />
            <div class="leader-name-group">
              <div class="leader-name">${item.name}</div>
              <div class="leader-lvl">Lvl ${item.level} • ${item.title}</div>
            </div>
          </div>
          <div class="leader-xp">${item.xp.toLocaleString()} XP</div>
        </div>
      `;
    }).join('');
  }

  store.subscribe(render);
  render();
}
