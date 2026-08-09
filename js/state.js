/* Campus Quest - Reactive Application State & Persistence Store */

const STORAGE_KEY = 'CAMPUS_QUEST_STATE_V1';

const defaultState = {
  user: {
    name: 'Alex Vance',
    title: 'Code Templar',
    avatar: 'assets/avatar.jpg',
    level: 7,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 12,
    gems: 420,
    focusMinutes: 145,
    rank: 4
  },
  quests: [
    {
      id: 1,
      title: 'Complete 3 CS101 Data Structures Modules',
      category: 'academics',
      tag: 'Academics',
      xp: 150,
      completed: false,
      deadline: 'Today, 8:00 PM'
    },
    {
      id: 2,
      title: '25-Min Deep Focus Study Sprint',
      category: 'focus',
      tag: 'Focus',
      xp: 100,
      completed: true,
      deadline: 'Completed'
    },
    {
      id: 3,
      title: 'Morning Campus Run & Gym Session',
      category: 'health',
      tag: 'Health',
      xp: 120,
      completed: false,
      deadline: 'Today, 10:00 AM'
    },
    {
      id: 4,
      title: 'Review Machine Learning Neural Nets Chapter',
      category: 'skills',
      tag: 'Skills',
      xp: 200,
      completed: false,
      deadline: 'Tomorrow, 5:00 PM'
    },
    {
      id: 5,
      title: 'Submit Group Project Milestone Draft',
      category: 'academics',
      tag: 'Academics',
      xp: 250,
      completed: false,
      deadline: 'In 4 hours'
    }
  ],
  skills: [
    { id: 'focus_1', name: 'Deep Focus', desc: '+10% Focus XP Gain', unlocked: true, icon: '⚡' },
    { id: 'speed_1', name: 'Speed Reader', desc: 'Read 2x Faster', unlocked: true, icon: '📖' },
    { id: 'streak_1', name: 'Streak Guard', desc: 'Protect 1 missed day', unlocked: false, icon: '🛡️' },
    { id: 'master_1', name: 'Exam Slayer', desc: '+25% Quiz Rewards', unlocked: false, icon: '⚔️' }
  ],
  leaderboard: [
    { id: 'l1', rank: 1, name: 'Elena Rostova', level: 12, xp: 8920, avatar: 'assets/maya.jpg', title: 'Grandmaster' },
    { id: 'l2', rank: 2, name: 'Marcus Chen', level: 10, xp: 6450, avatar: 'assets/alex.jpg', title: 'Archmage' },
    { id: 'l3', rank: 3, name: 'Sarah Jenkins', level: 8, xp: 3890, avatar: 'assets/maya.jpg', title: 'Scholar' },
    { id: 'l4', rank: 4, name: 'Alex Vance (You)', level: 7, xp: 2450, avatar: 'assets/avatar.jpg', title: 'Code Templar', isUser: true },
    { id: 'l5', rank: 5, name: 'David Kim', level: 6, xp: 1980, avatar: 'assets/alex.jpg', title: 'Apprentice' }
  ]
};

class StateStore {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : defaultState;
    } catch (e) {
      console.warn('Failed to parse state from localStorage', e);
      return defaultState;
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.saveState();
    this.listeners.forEach(fn => fn(this.state));
  }

  getState() {
    return this.state;
  }

  /* User Actions */
  addXp(amount) {
    let u = this.state.user;
    u.xp += amount;
    u.gems += Math.floor(amount / 5);

    // Check level up
    let leveledUp = false;
    while (u.xp >= u.nextLevelXp) {
      u.xp -= u.nextLevelXp;
      u.level += 1;
      u.nextLevelXp = Math.floor(u.nextLevelXp * 1.25);
      leveledUp = true;
    }

    // Update leaderboard entry
    const userLeader = this.state.leaderboard.find(item => item.isUser);
    if (userLeader) {
      userLeader.xp += amount;
      userLeader.level = u.level;
    }

    this.notify();
    return { leveledUp, newLevel: u.level };
  }

  toggleQuest(questId) {
    const q = this.state.quests.find(item => item.id === questId);
    if (!q) return null;

    q.completed = !q.completed;
    if (q.completed) {
      const result = this.addXp(q.xp);
      return { completed: true, xp: q.xp, ...result };
    } else {
      // Deduct if unchecked
      this.state.user.xp = Math.max(0, this.state.user.xp - q.xp);
      this.notify();
      return { completed: false, xp: q.xp };
    }
  }

  addQuest(title, category, xp) {
    const tagMap = {
      academics: 'Academics',
      health: 'Health',
      focus: 'Focus',
      skills: 'Skills'
    };
    const newQuest = {
      id: Date.now(),
      title,
      category,
      tag: tagMap[category] || 'Custom',
      xp: parseInt(xp, 10) || 100,
      completed: false,
      deadline: 'Today'
    };
    this.state.quests.unshift(newQuest);
    this.notify();
    return newQuest;
  }

  unlockSkill(skillId) {
    const skill = this.state.skills.find(s => s.id === skillId);
    if (skill && !skill.unlocked && this.state.user.gems >= 100) {
      this.state.user.gems -= 100;
      skill.unlocked = true;
      this.notify();
      return true;
    }
    return false;
  }
}

export const store = new StateStore();
