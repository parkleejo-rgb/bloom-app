/* ═══════════════════════════════════════════════════════════════════════════
   Bloom — Postpartum Progress Tracker
   app.js — Single-file SPA logic
   ═══════════════════════════════════════════════════════════════════════════ */

'use strict';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const MOTIVATIONAL_MESSAGES = [
  "Small consistent choices compound.",
  "You're doing more than you think.",
  "Rest is part of the work.",
  "Postpartum progress is not linear. That's normal.",
  "One good choice leads to the next.",
  "You're building something that lasts.",
  "Your body is doing a lot right now. Give it what it needs.",
  "Progress lives in the quiet days too.",
  "Consistency beats intensity every time.",
  "You're further along than you were yesterday.",
];

const DEFAULT_HABITS = [
  // Sleep  (sleep_outside removed — morning walk now covers circadian benefit in Movement)
  { id: 'sleep_bed',      label: 'In bed by 10:30pm',                          pillar: 'sleep',     weight: 3, points: 2, retroactive: true,  opensWorkout: false, priority: false },
  { id: 'sleep_wake',     label: 'Woke up within 30 min of usual wake time',   pillar: 'sleep',     weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'sleep_caffeine', label: 'No caffeine after 1pm',                      pillar: 'sleep',     weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  // Nutrition — ordered by points desc
  { id: 'nutr_breakfast', label: 'High protein breakfast (30g goal)',          pillar: 'nutrition', weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_fiber',     label: 'Approx 30g of fiber throughout day',         pillar: 'nutrition', weight: 2, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_no_eat',    label: 'No eating after 7pm',                        pillar: 'nutrition', weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_no_junk',   label: 'No processed meat or packaged snack foods today', pillar: 'nutrition', weight: 3, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_alcohol',   label: 'Alcohol-free today',                         pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_lunch',     label: 'Protein and veg forward lunch',              pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_dinner',    label: 'Protein and veg forward dinner',             pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_water',     label: 'Drank water first thing this morning',       pillar: 'nutrition', weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_omega3',    label: 'Took omega-3 supplement',                    pillar: 'nutrition', weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_vitamins',  label: 'Took prenatal vitamins, mag, vit D',         pillar: 'nutrition', weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false },
  // Movement
  { id: 'move_strength',  label: 'Completed a strength training session',      pillar: 'movement',  weight: 4, points: 2, retroactive: false, opensWorkout: true,  priority: true  },
  { id: 'move_other',     label: 'Completed another workout',                  pillar: 'movement',  weight: 2, points: 1, retroactive: false, opensWorkout: true,  priority: false },
  { id: 'move_walk',      label: 'Morning dog walk',                           pillar: 'movement',  weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false, alsoContributes: 'sleep', alsoWeight: 1 },
  { id: 'move_mobility',  label: 'Did mobility work or stretching',            pillar: 'movement',  weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false, alsoContributes: 'stress', alsoWeight: 1 },
  // Stress & Recovery
  { id: 'stress_outside', label: 'Got outside today (non-workout time)',       pillar: 'stress',    weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'stress_me',      label: 'Did one thing just for me',                  pillar: 'stress',    weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'stress_task',    label: 'Made progress on one non-baby task',         pillar: 'stress',    weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
];

const HABIT_RATIONALE = {
  sleep_bed:     "Late nights elevate cortisol and disrupt the hormones that regulate hunger — getting to bed earlier is one of the highest-leverage changes for postpartum weight loss.",
  sleep_wake:    "Consistent wake time is one of the strongest anchors for circadian rhythm stability — it helps your body predict sleep pressure more reliably than bedtime alone.",
  sleep_caffeine:"Caffeine has a 5–6 hour half-life, meaning an afternoon coffee is still active in your system at bedtime and fragments sleep architecture even if you fall asleep easily.",
  nutr_breakfast:"A high-protein breakfast reduces hunger hormones for the rest of the day more effectively than the same protein eaten at dinner — front-loading protein is one of the most evidence-backed strategies for appetite control.",
  nutr_fiber:    "Fiber feeds the gut bacteria that regulate hunger hormones, slows glucose absorption, and reduces overall appetite — most people eat roughly half the recommended daily amount.",
  nutr_no_eat:   "Late eating is associated with increased fat storage in several studies, likely through circadian disruption of metabolic processes — a consistent eating cutoff also reinforces your natural fasting window.",
  nutr_no_junk:  "Processed meats are classified as a Group 1 carcinogen by the WHO, and packaged snack foods contain emulsifiers linked to gut microbiome disruption and inflammation — large cohort studies link high UPF consumption to increased cancer risk.",
  nutr_alcohol:  "Even small amounts of alcohol disrupt sleep architecture, elevate cortisol, and are directly linked to increased breast cancer risk — alcohol-free days have compounding benefits across multiple health outcomes.",
  nutr_lunch:    "Meals built around protein and fiber slow glucose absorption, extend satiety, and reduce the likelihood of reactive eating later in the afternoon.",
  nutr_dinner:   "Ending the day with a protein and vegetable-centred meal supports muscle maintenance overnight and keeps blood sugar stable through your fasting window.",
  nutr_water:    "After hours of sleep without fluids, starting the day with water supports energy, digestion, and helps establish a consistent morning routine.",
  nutr_omega3:   "Pregnancy and breastfeeding deplete DHA significantly — low omega-3 is linked to postpartum mood issues and systemic inflammation, both of which affect weight loss and recovery.",
  nutr_vitamins: "Postpartum nutritional depletion is real — magnesium supports sleep and stress regulation, vitamin D deficiency is particularly common postpartum and affects mood and immune function, and prenatal vitamins cover the gaps that breastfeeding creates.",
  move_strength: "Resistance training preserves lean muscle mass during weight loss, protecting your metabolic rate — postpartum, this matters more than cardio for long-term body composition.",
  move_other:    "Any movement beyond strength training improves cardiovascular health, mood, and stress regulation — consistency across modalities matters more than intensity.",
  move_walk:     "A morning walk combines circadian light exposure, gentle movement, and cortisol regulation — morning light specifically anchors your circadian rhythm and improves sleep quality that night, while the movement supports stress recovery.",
  move_mobility: "Postpartum connective tissue is more vulnerable to injury — consistent mobility work protects your ability to keep exercising, which is the actual goal.",
  stress_outside:"Even 10 minutes in a natural environment reduces cortisol measurably, independent of exercise — chronic postpartum stress actively impairs fat loss, particularly around the abdomen.",
  stress_me:     "Postpartum identity preservation — maintaining activities that belong to you, not your role as a mother — is consistently linked to better mental health outcomes and lower chronic stress.",
  stress_task:   "A sense of agency and accomplishment outside caregiving reduces the psychological load of postpartum life and supports the self-efficacy that sustains healthy habits long-term.",
};

const PILLAR_META = {
  sleep:     { label: 'Sleep',           colorClass: 'blue', dotClass: 'sleep'     },
  nutrition: { label: 'Nutrition',       colorClass: 'sage', dotClass: 'nutrition' },
  movement:  { label: 'Movement',        colorClass: 'rose', dotClass: 'movement'  },
  stress:    { label: 'Stress & Recovery', colorClass: 'sand', dotClass: 'stress'  },
};

const DEFAULT_ACTIVITIES = [
  { id: 'strength',    label: 'Strength training', priority: true  },
  { id: 'spin',        label: 'Spin / Cycling',    priority: false },
  { id: 'functional',  label: 'Functional training', priority: false },
  { id: 'bodyweight',  label: 'Bodyweight',         priority: false },
  { id: 'yoga',        label: 'Yoga',               priority: false },
  { id: 'walk',        label: 'Walk',               priority: false },
  { id: 'core',        label: 'Core',               priority: false },
  { id: 'other',       label: 'Other',              priority: false },
];

const BADGE_DEFINITIONS = [
  { id: 'first_weighin',   label: 'First weigh-in',          icon: '⚖️',  bonusPoints: 10, group: 'weight'  },
  { id: 'lost_5',          label: '5 lbs lost',              icon: '🌱',  bonusPoints: 20, group: 'weight'  },
  { id: 'lost_10',         label: '10 lbs lost',             icon: '✨',  bonusPoints: 25, group: 'weight'  },
  { id: 'lost_20',         label: '20 lbs lost',             icon: '🌟',  bonusPoints: 30, group: 'weight'  },
  { id: 'halfway',         label: 'Halfway to goal',         icon: '🏃',  bonusPoints: 40, group: 'weight'  },
  { id: 'goal_range',      label: 'Goal range reached',      icon: '🎯',  bonusPoints: 100, group: 'weight' },
  { id: 'first_workout',   label: 'First workout',           icon: '💪',  bonusPoints: 0,  group: 'fitness' },
  { id: 'workouts_10',     label: '10 workouts',             icon: '🔥',  bonusPoints: 0,  group: 'fitness' },
  { id: 'workouts_25',     label: '25 workouts',             icon: '⚡',  bonusPoints: 0,  group: 'fitness' },
  { id: 'strength_5',      label: '5 strength sessions',     icon: '🏋️', bonusPoints: 0,  group: 'fitness' },
  { id: 'strength_20',     label: '20 strength sessions',    icon: '💎',  bonusPoints: 0,  group: 'fitness' },
  { id: 'first_full_week', label: 'First full check-in week',icon: '📅',  bonusPoints: 0,  group: 'habits'  },
  { id: 'checkins_30',     label: '30 days of check-ins',    icon: '📊',  bonusPoints: 15, group: 'habits'  },
  { id: 'first_cashout',   label: 'First reward cashed out', icon: '🛍️', bonusPoints: 0,  group: 'rewards' },
  { id: 'cashouts_3',      label: '3 rewards cashed out',    icon: '👑',  bonusPoints: 0,  group: 'rewards' },
  { id: 'pillars_50',      label: 'All pillars 50%+ week',   icon: '🌸',  bonusPoints: 0,  group: 'habits'  },
  { id: 'month_strength',  label: 'Month of 3+ strength/wk', icon: '🦋',  bonusPoints: 0,  group: 'fitness' },
];

const DEFAULT_SETTINGS = {
  name: '',
  startingWeight: null,
  goalWeightLow: 135,
  goalWeightHigh: 145,
  appStartDate: dateStr(new Date()),
  breastfeeding: false,
  usualWakeTime: '07:00',
  eatCutoff: '19:00',
  bedtimeTarget: '22:30',
  caffeineCutoff: '13:00',
  pointsConversionRate: 0.50,
};

/* ─── Storage Layer ──────────────────────────────────────────────────────── */

const Store = {
  get(key, fallback = null) {
    try {
      const v = localStorage.getItem('bloom_' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, val) {
    try { localStorage.setItem('bloom_' + key, JSON.stringify(val)); } catch {}
  },
  remove(key) { localStorage.removeItem('bloom_' + key); },

  getSettings()   { return { ...DEFAULT_SETTINGS, ...this.get('settings', {}) }; },
  saveSettings(s) { this.set('settings', s); },

  getHabits(date)      { return this.get('habits_' + date, {}); },
  saveHabits(date, h)  { this.set('habits_' + date, h); },

  getWeighIns()        { return this.get('weighins', []); },
  saveWeighIns(a)      { this.set('weighins', a); },

  getWorkouts()        { return this.get('workouts', []); },
  saveWorkouts(a)      { this.set('workouts', a); },

  getPoints()          { return this.get('points', { total_earned: 0, spendable: 0, history: [] }); },
  savePoints(p)        { this.set('points', p); },

  getGoals()           { return this.get('goals', { name: '', amount: 0, history: [] }); },
  saveGoals(g)         { this.set('goals', g); },

  getBadges()          { return this.get('badges', {}); },
  saveBadges(b)        { this.set('badges', b); },

  getWeeklyNotes()     { return this.get('weekly_notes', {}); },
  saveWeeklyNotes(n)   { this.set('weekly_notes', n); },

  getWeeklyIntentions(){ return this.get('weekly_intentions', {}); },
  saveWeeklyIntentions(i){ this.set('weekly_intentions', i); },

  getHabitDefs() {
    const stored = this.get('habit_defs', null);
    if (!stored) return DEFAULT_HABITS.map(h => ({...h}));

    const LABEL_MIGRATIONS = [
      { id: 'nutr_breakfast', newPoints: 2 },
      { id: 'nutr_fiber',     oldLabels: ['Had a high-fiber food today'],                                         newLabel: 'Approx 30g of fiber throughout day', newPoints: 2 },
      { id: 'nutr_no_eat',    newPoints: 2 },
      { id: 'nutr_no_junk',   oldLabels: ['Avoided ultra-processed snacks','No processed meats or packaged snack foods'], newLabel: 'No processed meat or packaged snack foods today' },
      // move_walk: alsoContributes changed from stress → sleep
      { id: 'move_walk',      newAlso: 'sleep', newAlsoWeight: 1 },
    ];

    // Remove retired habits (sleep_outside merged into move_walk)
    const RETIRED = ['sleep_outside'];

    // Collect custom habits to preserve at end of their pillar
    let migrated = stored
      .filter(h => !RETIRED.includes(h.id))
      .map(h => {
        if (h.custom) return h;
        const def = DEFAULT_HABITS.find(d => d.id === h.id);
        let u = { ...h };

        // Sync alsoContributes from defaults
        if (def) {
          if (def.alsoContributes) {
            u = { ...u, alsoContributes: def.alsoContributes, alsoWeight: def.alsoWeight };
          } else if (u.alsoContributes) {
            // default no longer has it — remove
            delete u.alsoContributes; delete u.alsoWeight;
          }
        }

        const m = LABEL_MIGRATIONS.find(x => x.id === h.id);
        if (m) {
          if (m.newLabel && (!m.oldLabels || m.oldLabels.includes(h.label))) u = { ...u, label: m.newLabel };
          if (m.newPoints !== undefined) u = { ...u, points: m.newPoints, weight: m.newPoints };
          if (m.newAlso)  { u.alsoContributes = m.newAlso; u.alsoWeight = m.newAlsoWeight; }
        }
        return u;
      });

    // Add any new default habits not yet in stored data
    DEFAULT_HABITS.forEach(def => {
      if (!migrated.find(h => h.id === def.id)) migrated.push({ ...def });
    });

    // Sort to match DEFAULT_HABITS order; custom habits trail their pillar
    const defaultOrder = DEFAULT_HABITS.map(h => h.id);
    migrated.sort((a, b) => {
      const ai = defaultOrder.indexOf(a.id);
      const bi = defaultOrder.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    return migrated;
  },
  saveHabitDefs(h)     { this.set('habit_defs', h); },

  getActivityDefs()    { return this.get('activity_defs', DEFAULT_ACTIVITIES.map(a => ({...a}))); },
  saveActivityDefs(a)  { this.set('activity_defs', a); },
};

/* ─── Date Utilities ─────────────────────────────────────────────────────── */

function dateStr(d) {
  // Use local date, not UTC — toISOString() would give "tomorrow" for US timezones in the evening
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dy = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dy}`;
}
function todayStr() { return dateStr(new Date()); }
function parseDate(s)  { const [y,m,d] = s.split('-').map(Number); return new Date(y, m-1, d); }

function getWeekStart(date) {
  const d = new Date(date || new Date());
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function getWeekDays(weekStart) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return dateStr(d);
  });
}

function daysElapsedThisWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const ws = getWeekStart();
  const diff = Math.round((today - ws) / 86400000) + 1;
  return Math.max(1, Math.min(diff, 7));
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function formatDateShort(s) {
  return parseDate(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekRange(ws) {
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  const opts = { month: 'short', day: 'numeric' };
  return `${ws.toLocaleDateString('en-US', opts)} – ${we.toLocaleDateString('en-US', opts)}`;
}

/* ─── Points System ──────────────────────────────────────────────────────── */

const Points = {
  add(amount, reason) {
    const p = Store.getPoints();
    p.total_earned += amount;
    p.spendable += amount;
    p.history.push({ date: todayStr(), amount, reason });
    Store.savePoints(p);
    updatePointsBadge();
  },
  deduct(amount, reason) {
    const p = Store.getPoints();
    p.spendable = Math.max(0, p.spendable - amount);
    p.history.push({ date: todayStr(), amount: -amount, reason });
    Store.savePoints(p);
    updatePointsBadge();
  },
  todayTotal() {
    const today = todayStr();
    return Math.max(0, Store.getPoints().history
      .filter(h => h.date === today)
      .reduce((s, h) => s + h.amount, 0));
  },
  toDollars(pts) {
    const rate = Store.getSettings().pointsConversionRate || 0.50;
    return (pts * rate).toFixed(2);
  },
  thisWeekTotal() {
    const ws = dateStr(getWeekStart());
    const we = new Date(getWeekStart()); we.setDate(we.getDate() + 6);
    const weStr = dateStr(we);
    return Store.getPoints().history
      .filter(h => h.date >= ws && h.date <= weStr && h.amount > 0)
      .reduce((s, h) => s + h.amount, 0);
  },
};

/* ─── Badge System ───────────────────────────────────────────────────────── */

const Badges = {
  check() {
    const earned = Store.getBadges();
    const settings = Store.getSettings();
    const weighIns = Store.getWeighIns();
    const workouts = Store.getWorkouts();
    const goals = Store.getGoals();
    const newly = [];

    function award(id) {
      if (!earned[id]) {
        earned[id] = todayStr();
        const def = BADGE_DEFINITIONS.find(b => b.id === id);
        if (def && def.bonusPoints > 0) {
          Points.add(def.bonusPoints, `Badge: ${def.label}`);
        }
        newly.push(id);
      }
    }

    if (weighIns.length >= 1) award('first_weighin');

    if (weighIns.length >= 1 && settings.startingWeight) {
      const latest = weighIns[weighIns.length - 1].weight;
      const lost = settings.startingWeight - latest;
      if (lost >= 5)  award('lost_5');
      if (lost >= 10) award('lost_10');
      if (lost >= 20) award('lost_20');

      const goalMid = ((settings.goalWeightLow || 135) + (settings.goalWeightHigh || 145)) / 2;
      const totalToLose = settings.startingWeight - goalMid;
      if (totalToLose > 0 && lost >= totalToLose / 2) award('halfway');
      if (latest <= (settings.goalWeightHigh || 145)) award('goal_range');
    }

    if (workouts.length >= 1)  award('first_workout');
    if (workouts.length >= 10) award('workouts_10');
    if (workouts.length >= 25) award('workouts_25');

    const strengthCount = workouts.filter(w => w.priority).length;
    if (strengthCount >= 5)  award('strength_5');
    if (strengthCount >= 20) award('strength_20');

    const cashouts = goals.history ? goals.history.length : 0;
    if (cashouts >= 1) award('first_cashout');
    if (cashouts >= 3) award('cashouts_3');

    // 30 days of check-ins
    const habitKeys = Object.keys(localStorage)
      .filter(k => k.startsWith('bloom_habits_'))
      .map(k => k.replace('bloom_habits_', ''));
    if (habitKeys.length >= 30) award('checkins_30');
    if (habitKeys.length >= 7)  award('first_full_week');

    Store.saveBadges(earned);
    return newly;
  },

  showCelebration(badgeIds) {
    if (!badgeIds.length) return;
    const id = badgeIds[0];
    const def = BADGE_DEFINITIONS.find(b => b.id === id);
    if (!def) return;
    celebrate(def.icon + ' ' + def.label, `You earned the "${def.label}" badge!`);
  },
};

/* ─── Navigation ─────────────────────────────────────────────────────────── */

let currentScreen = 'today';
let weightChart = null;
let rationaleVisible = false;
let rationaleTimer = null;

function navigate(screen) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  const el = document.getElementById(`screen-${screen}`);
  if (el) el.classList.add('active');

  const btn = document.querySelector(`.nav-btn[data-screen="${screen}"]`);
  if (btn) btn.classList.add('active');

  currentScreen = screen;
  renderScreen(screen);
}

function renderScreen(screen) {
  switch (screen) {
    case 'today':    renderToday();    break;
    case 'week':     renderWeek();     break;
    case 'exercise': renderExercise(); break;
    case 'progress': renderProgress(); break;
    case 'settings': renderSettings(); break;
  }
}

/* ─── Header ─────────────────────────────────────────────────────────────── */

function updateHeader() {
  const dateEl = document.getElementById('header-date');
  const msgEl  = document.getElementById('header-message');
  if (dateEl) dateEl.textContent = formatDate(new Date());
  if (msgEl)  msgEl.textContent  = getDailyMessage();
  updatePointsBadge();
}

function getDailyMessage() {
  const day = new Date().getDate();
  return MOTIVATIONAL_MESSAGES[day % MOTIVATIONAL_MESSAGES.length];
}

function updatePointsBadge() {
  const el = document.getElementById('points-badge');
  if (!el) return;
  const pts = Points.todayTotal();
  el.textContent = pts > 0 ? `${pts} pts today` : '';
}

/* ─── Habit Rationale Tooltip ────────────────────────────────────────────── */

function showRationale(habitId, label) {
  const text = HABIT_RATIONALE[habitId];
  if (!text) return;
  const card  = document.getElementById('rationale-card');
  if (!card) return;
  card.querySelector('#rationale-name').textContent = label;
  card.querySelector('#rationale-text').textContent = text;
  card.classList.remove('hidden');
  rationaleVisible = true;
  clearTimeout(rationaleTimer);
  rationaleTimer = setTimeout(hideRationale, 7000);
}

function hideRationale() {
  document.getElementById('rationale-card')?.classList.add('hidden');
  rationaleVisible = false;
  clearTimeout(rationaleTimer);
}

/* ─── TODAY Screen ───────────────────────────────────────────────────────── */

function renderToday() {
  const screen = document.getElementById('screen-today');
  const today  = todayStr();
  const checked = Store.getHabits(today);
  const habits  = Store.getHabitDefs().filter(h => h.enabled !== false);

  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];

  let html = '';

  pillars.forEach(pillar => {
    const meta = PILLAR_META[pillar];
    const items = habits.filter(h => h.pillar === pillar);
    if (!items.length) return;

    html += `
      <div class="habit-group">
        <div class="pillar-header">
          <div class="pillar-dot ${meta.dotClass}"></div>
          <div class="pillar-label">${meta.label}</div>
        </div>
    `;

    items.forEach(habit => {
      const isChecked = !!checked[habit.id];
      const extra = habit.retroactive ? '<span class="text-small text-muted"> (for last night)</span>' : '';
      const priorityTag = habit.priority ? '<span class="habit-badge priority">Priority</span>' : '';
      const workoutTag = habit.opensWorkout && !habit.priority ? '<span class="habit-badge">Logs workout</span>' : '';

      html += `
        <div class="habit-item ${isChecked ? 'checked' : ''}" data-habit="${habit.id}" data-opens-workout="${habit.opensWorkout}" data-priority="${habit.priority}">
          <div class="habit-check"></div>
          <div class="habit-text">${habit.label}${extra}</div>
          ${priorityTag}${workoutTag}
          <div class="habit-points">${habit.points}pt${habit.points > 1 ? 's' : ''}</div>
        </div>
      `;
    });

    html += `</div>`;
  });

  screen.innerHTML = html;

  // Attach habit click + long-press events
  screen.querySelectorAll('.habit-item').forEach(item => {
    let pressTimer = null;
    let wasLongPress = false;

    const startPress = () => {
      wasLongPress = false;
      pressTimer = setTimeout(() => {
        wasLongPress = true;
        const habits = Store.getHabitDefs();
        const h = habits.find(x => x.id === item.dataset.habit);
        showRationale(item.dataset.habit, h?.label || '');
      }, 500);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    item.addEventListener('touchstart',  startPress,  { passive: true });
    item.addEventListener('touchend',    cancelPress);
    item.addEventListener('touchmove',   cancelPress);
    item.addEventListener('mousedown',   startPress);
    item.addEventListener('mouseup',     cancelPress);
    item.addEventListener('mouseleave',  cancelPress);

    item.addEventListener('click', () => {
      if (wasLongPress) { wasLongPress = false; return; }
      if (rationaleVisible) { hideRationale(); return; }
      toggleHabit(item);
    });
  });
}

function toggleHabit(item) {
  const today   = todayStr();
  const id      = item.dataset.habit;
  const checked = Store.getHabits(today);
  const habits  = Store.getHabitDefs();
  const habit   = habits.find(h => h.id === id);
  if (!habit) return;

  const wasChecked = !!checked[id];

  if (!wasChecked) {
    // Check it
    checked[id] = true;
    Store.saveHabits(today, checked);
    item.classList.add('checked');
    Points.add(habit.points, `Habit: ${habit.label}`);
    updatePointsBadge();
    showToast(`+${habit.points} pt${habit.points > 1 ? 's' : ''}`, 'success');

    const newBadges = Badges.check();
    if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 400);

    if (habit.opensWorkout) {
      setTimeout(() => openWorkoutModal(habit.priority ? 'strength' : null), 300);
    }
  } else {
    // Uncheck
    delete checked[id];
    Store.saveHabits(today, checked);
    item.classList.remove('checked');
    Points.deduct(habit.points, `Habit unchecked: ${habit.label}`);
    updatePointsBadge();
  }
}

/* ─── THIS WEEK Screen ───────────────────────────────────────────────────── */

function renderWeek() {
  const screen   = document.getElementById('screen-week');
  const ws       = getWeekStart();
  const wsStr    = dateStr(ws);
  const days     = getWeekDays(ws);
  const today    = todayStr();
  const settings = Store.getSettings();

  // First week of tracking: count from appStartDate so missed days don't drag bars down.
  // All subsequent weeks: count from Monday as normal.
  const appStart      = settings.appStartDate || wsStr;
  const isFirstWeek   = appStart >= wsStr && appStart <= days[6]; // appStart falls in this week
  const countFromDay  = isFirstWeek ? appStart : wsStr;
  const activeDays    = days.filter(d => d >= countFromDay && d <= today);
  const elapsed       = Math.max(1, activeDays.length);
  const habits = Store.getHabitDefs().filter(h => h.enabled !== false);
  const intentions = Store.getWeeklyIntentions();
  const weeklyNotes = Store.getWeeklyNotes();
  const weighIns = Store.getWeighIns();
  const points = Store.getPoints();
  const goals  = Store.getGoals();

  // Compute pillar scores — pass activeDays so the function uses the right window
  const pillarScores = computePillarScores(activeDays, habits);

  // Current week weight
  const thisWeekWeighIn = weighIns.find(w => w.date >= wsStr && w.date <= days[6]);
  const prevWeighIn = [...weighIns].filter(w => w.date < wsStr).sort((a,b) => b.date.localeCompare(a.date))[0];

  // Weekly intention
  const intention = intentions[wsStr];

  let html = '';

  // Intention
  if (intention) {
    const txt = intention.pillar ? PILLAR_META[intention.pillar]?.label : intention.text;
    html += `
      <div class="intention-chip">
        <span>Focus this week:</span>
        <strong>${txt || intention.text || ''}</strong>
      </div>
    `;
  }

  // Week range
  const daysIntoWeek = daysElapsedThisWeek();
  const trackingNote = isFirstWeek && elapsed < daysIntoWeek
    ? `Day ${elapsed} tracked this week (started ${formatDateShort(appStart)})`
    : `Day ${elapsed} of 7`;
  html += `<p class="text-muted text-small mb-8">${formatWeekRange(ws)} &nbsp;·&nbsp; ${trackingNote}</p>`;

  // Pillar bars
  html += `<div class="card">`;
  html += `<div class="card-title">Weekly Pillar Progress</div>`;
  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];
  pillars.forEach(p => {
    const meta  = PILLAR_META[p];
    const score = pillarScores[p] || 0;
    const pct   = Math.round(score * 100);
    html += `
      <div class="pillar-bar-row">
        <div class="pillar-bar-meta">
          <div class="pillar-bar-name" style="display:flex;align-items:center;gap:6px">
            <div class="pillar-dot ${meta.dotClass}"></div>${meta.label}
          </div>
          <div class="pillar-bar-pct">${pct}%</div>
        </div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${meta.colorClass}" style="width:${pct}%"></div>
        </div>
        <div class="pillar-bar-feedback">${getPillarFeedback(p, pct, settings.breastfeeding)}</div>
      </div>
    `;
  });
  html += `</div>`;

  // Weigh-in section
  if (!thisWeekWeighIn) {
    html += `
      <div class="weighin-prompt">
        <div class="weighin-prompt-text">Ready to log this week's weight?</div>
        <button class="btn btn-sm btn-primary" id="weighin-prompt-btn">Log</button>
      </div>
    `;
  } else {
    const prev = prevWeighIn;
    const delta = prev ? (thisWeekWeighIn.weight - prev.weight) : null;
    const deltaClass = delta === null ? 'same' : delta < 0 ? 'down' : delta > 0 ? 'up' : 'same';
    const deltaStr = delta === null ? '' : `${delta > 0 ? '+' : ''}${delta.toFixed(1)} lbs`;
    const fluctuation = delta !== null && Math.abs(delta) <= 1.5;

    html += `<div class="card">`;
    html += `<div class="card-title">Weekly Weigh-In</div>`;
    html += `
      <div class="weighin-display">
        <div class="weighin-value">${thisWeekWeighIn.weight}</div>
        <div class="weighin-unit">lbs</div>
        ${delta !== null ? `<div class="weighin-delta ${deltaClass}">${deltaStr}</div>` : ''}
      </div>
    `;
    if (fluctuation && delta !== 0) {
      html += `<p class="text-small text-muted">Within normal fluctuation range (±1.5 lbs).</p>`;
    }
    if (settings.breastfeeding) {
      const noChangeSince = weighIns.filter(w => w.date <= today).slice(-3);
      const plateau = noChangeSince.length >= 3 && noChangeSince.every(w => Math.abs(w.weight - noChangeSince[0].weight) < 0.5);
      if (plateau) {
        html += `<p class="text-small text-muted mt-8" style="font-style:italic">If you're breastfeeding, your body may hold onto the last 5–10 lbs until weaning. This is biological, not failure.</p>`;
      }
    }
    html += `<button class="btn btn-sm btn-outline mt-8" id="reweighin-btn">Update</button>`;
    html += `</div>`;
  }

  // Savings / Goal bar
  html += renderSavingsBar(points, goals, settings);

  // Weekly Notes
  const noteKey = wsStr;
  const note = weeklyNotes[noteKey] || '';
  html += `
    <div class="card">
      <div class="card-title">Weekly Notes</div>
      <textarea class="form-input" id="weekly-note-input" placeholder="Any notes about this week?" rows="3" maxlength="500">${note}</textarea>
      <button class="btn btn-sm btn-secondary btn-full mt-8" id="save-note-btn">Save Note</button>
    </div>
  `;

  screen.innerHTML = html;

  // Events
  const weighInPromptBtn = screen.querySelector('#weighin-prompt-btn');
  if (weighInPromptBtn) weighInPromptBtn.addEventListener('click', openWeighInModal);

  const reWeighInBtn = screen.querySelector('#reweighin-btn');
  if (reWeighInBtn) reWeighInBtn.addEventListener('click', openWeighInModal);

  screen.querySelector('#save-note-btn')?.addEventListener('click', () => {
    const text = screen.querySelector('#weekly-note-input')?.value.trim();
    const notes = Store.getWeeklyNotes();
    notes[wsStr] = text;
    Store.saveWeeklyNotes(notes);
    showToast('Note saved');
  });

  const cashOutBtn = screen.querySelector('#cashout-btn');
  if (cashOutBtn) cashOutBtn.addEventListener('click', openCashOutModal);

  const setGoalBtn = screen.querySelector('#set-goal-btn');
  if (setGoalBtn) setGoalBtn.addEventListener('click', openGoalModal);

  // Show intention prompt if not set
  if (!intention) {
    setTimeout(() => openIntentionModal(wsStr), 200);
  }
}

function renderSavingsBar(points, goals, settings) {
  const rate = settings.pointsConversionRate || 0.50;
  const spendableDollars = (points.spendable * rate);
  const totalDollars     = (points.total_earned * rate);
  const goalAmt  = goals.amount || 0;
  const goalName = goals.name || 'your next goal';
  const pct = goalAmt > 0 ? Math.min(100, Math.round((spendableDollars / goalAmt) * 100)) : 0;
  const weekPts  = Points.thisWeekTotal();

  let html = `<div class="card">`;
  html += `<div class="card-title">Savings Progress</div>`;

  if (!goals.name) {
    html += `<p class="text-muted text-small">No goal set yet.</p>`;
    html += `<button class="btn btn-sm btn-primary mt-8" id="set-goal-btn">Set a goal</button>`;
  } else {
    const reached = spendableDollars >= goalAmt && goalAmt > 0;

    html += `<div class="savings-goal-name">${goalName}</div>`;
    html += `
      <div class="savings-amounts">
        <span>$${spendableDollars.toFixed(2)} earned</span>
        <span>Goal: $${goalAmt.toFixed(2)}</span>
      </div>
      <div class="progress-bar-wrap">
        <div class="progress-bar-fill sage" style="width:${pct}%"></div>
      </div>
      <div class="savings-pct">${pct}% of goal</div>
    `;

    if (reached) {
      html += `
        <div style="background:#D9EFDA;border-radius:8px;padding:12px;margin-top:10px;text-align:center">
          <div style="font-weight:600;color:#3D8040;margin-bottom:4px">You earned it. Go get it.</div>
          <button class="btn btn-sm btn-primary" id="cashout-btn">Cash Out</button>
        </div>
      `;
    } else {
      html += `<button class="btn btn-sm btn-outline mt-8" id="set-goal-btn">Change goal</button>`;
    }
  }

  html += `
    <div class="savings-points-breakdown">
      <div class="row"><span>Points this week</span><span class="val">${weekPts} pts ($${(weekPts * rate).toFixed(2)})</span></div>
      <div class="row"><span>Total points earned</span><span class="val">${points.total_earned} pts</span></div>
      <div class="row"><span>Total dollars earned</span><span class="val">$${totalDollars.toFixed(2)}</span></div>
      <div class="row"><span>Spendable balance</span><span class="val">$${spendableDollars.toFixed(2)}</span></div>
    </div>
  `;
  html += `</div>`;
  return html;
}

function computePillarScores(activeDays, habits) {
  const scores     = {};
  const pillars    = ['sleep', 'nutrition', 'movement', 'stress'];
  const activeCount = Math.max(1, activeDays.length);

  pillars.forEach(pillar => {
    const primary   = habits.filter(h => h.pillar === pillar);
    const secondary = habits.filter(h => h.pillar !== pillar && h.alsoContributes === pillar);

    const maxPerDay =
      primary.reduce((s, h) => s + h.weight, 0) +
      secondary.reduce((s, h) => s + (h.alsoWeight || h.weight), 0);

    if (maxPerDay === 0) { scores[pillar] = 0; return; }

    let totalEarned = 0;
    activeDays.forEach(day => {
      const checked = Store.getHabits(day);
      primary.forEach(h => {
        if (checked[h.id]) totalEarned += h.weight;
      });
      secondary.forEach(h => {
        if (checked[h.id]) totalEarned += (h.alsoWeight || h.weight);
      });
    });

    scores[pillar] = totalEarned / (activeCount * maxPerDay);
  });

  return scores;
}

function getPillarFeedback(pillar, pct, bf) {
  const feedbacks = {
    sleep: {
      high:   "Sleep discipline is on point this week.",
      mid:    "Sleep pillar is building. The bedtime or caffeine cutoff could push this higher.",
      low:    "Sleep is your lowest pillar this week. Earlier bedtime or cutting caffeine after 1pm are the highest-leverage changes.",
    },
    nutrition: {
      high:   "Solid nutrition week. Protein and whole foods are showing up.",
      mid:    "Nutrition is at halfway. The after-7pm cutoff or protein at breakfast would move this.",
      low:    "Nutrition pillar is low. Start with protein at breakfast — it sets the tone for the day.",
    },
    movement: {
      high:   "Strong movement week. Strength training is showing up.",
      mid:    "Halfway on movement. One more strength session would push this higher.",
      low:    "Movement is your lowest pillar this week. Even 20 minutes of weights counts.",
    },
    stress: {
      high:   "Recovery is built into your week. That matters.",
      mid:    "Making progress on stress & recovery. Small things count.",
      low:    "Stress & recovery is low. One thing just for you today is a start.",
    },
  };
  const f = feedbacks[pillar];
  if (pct >= 75) return f.high;
  if (pct >= 40) return f.mid;
  return f.low;
}

/* ─── EXERCISE Screen ────────────────────────────────────────────────────── */

function renderExercise() {
  const screen   = document.getElementById('screen-exercise');
  const workouts = Store.getWorkouts().slice().reverse();
  const ws = getWeekStart();
  const wsStr = dateStr(ws);
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  const weStr = dateStr(we);

  const weekWorkouts = workouts.filter(w => w.date >= wsStr && w.date <= weStr);
  const weekStrength = weekWorkouts.filter(w => w.priority);
  const weekOther    = weekWorkouts.filter(w => !w.priority);
  const totalSessions = weekWorkouts.length;

  // Session pips (3 min, 5 stretch)
  const minTarget = 3;
  const stretchTarget = 5;
  const pips = Array.from({ length: stretchTarget }, (_, i) => {
    if (i < totalSessions && i < minTarget) return 'done';
    if (i < totalSessions) return 'stretch';
    if (i < minTarget) return 'empty-min';
    return 'empty-stretch';
  });

  let html = `
    <div class="card">
      <div class="card-title">This Week</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px">
        <div class="week-session-indicator">
          ${pips.map(p => `<div class="session-pip ${p.startsWith('empty') ? '' : p}"></div>`).join('')}
        </div>
        <span class="text-small text-muted">${totalSessions} session${totalSessions !== 1 ? 's' : ''} (${minTarget} min goal)</span>
      </div>
      <div class="text-small text-muted">
        ${weekStrength.length} strength · ${weekOther.length} other
      </div>
    </div>

    <button class="btn btn-primary btn-full mb-16" id="log-workout-btn">+ Log a Workout</button>
  `;

  if (workouts.length === 0) {
    html += `
      <div class="empty-state">
        <div class="empty-icon">🏋️</div>
        <p>No workouts logged yet.<br>Your history will appear here.</p>
      </div>
    `;
  } else {
    html += `<div class="screen-section-title">History</div>`;
    html += `<div class="card">`;
    workouts.forEach(w => {
      const dot = w.priority ? 'priority' : '';
      const tag = w.priority ? '<span class="priority-tag">Strength</span>' : '';
      html += `
        <div class="workout-entry">
          <div class="workout-type-dot ${dot}"></div>
          <div class="workout-info">
            <div class="workout-type-name">${escHtml(w.activityLabel)}${tag}</div>
            <div class="workout-meta">${w.duration} min · ${w.intensity}</div>
            ${w.note ? `<div class="workout-note">${escHtml(w.note)}</div>` : ''}
          </div>
          <div class="workout-date">${formatDateShort(w.date)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  screen.innerHTML = html;
  screen.querySelector('#log-workout-btn')?.addEventListener('click', () => openWorkoutModal(null));
}

/* ─── PROGRESS Screen ────────────────────────────────────────────────────── */

function renderProgress() {
  const screen = document.getElementById('screen-progress');
  const settings = Store.getSettings();
  const weighIns = Store.getWeighIns().sort((a,b) => a.date.localeCompare(b.date));
  const workouts = Store.getWorkouts();
  const earned   = Store.getBadges();
  const notes    = Store.getWeeklyNotes();
  const goals    = Store.getGoals();

  let html = '';

  // Weight graph
  html += `<div class="screen-section-title">Weight Trend</div>`;
  html += `<div class="card">`;
  if (weighIns.length < 2) {
    html += `<div class="empty-state"><p>Log at least 2 weigh-ins to see your weight trend.</p></div>`;
  } else {
    html += `<div class="chart-wrap"><canvas id="weight-chart"></canvas></div>`;
    // Milestones
    if (settings.startingWeight) {
      const latest = weighIns[weighIns.length-1].weight;
      const lost = settings.startingWeight - latest;
      html += `<div class="milestone-list">`;
      if (lost >= 5)  html += `<div class="milestone-item"><div class="milestone-dot" style="background:var(--sage)"></div>5 lbs lost reached</div>`;
      if (lost >= 10) html += `<div class="milestone-item"><div class="milestone-dot" style="background:var(--sage-dark)"></div>10 lbs lost reached</div>`;
      if (latest <= (settings.goalWeightHigh || 145)) html += `<div class="milestone-item"><div class="milestone-dot" style="background:var(--rose)"></div>Goal range reached</div>`;
      html += `</div>`;
    }
  }
  // Average loss
  if (weighIns.length >= 4) {
    const recent4 = weighIns.slice(-4);
    const avgLoss = (recent4[0].weight - recent4[recent4.length-1].weight) / (recent4.length - 1);
    const sign = avgLoss >= 0 ? '-' : '+';
    html += `<div class="avg-loss-stat">Avg change (last 4 weeks): <strong>${sign}${Math.abs(avgLoss).toFixed(1)} lbs/week</strong></div>`;
  }
  if (settings.breastfeeding && weighIns.length >= 3) {
    const last3 = weighIns.slice(-3);
    const plateau = last3.every(w => Math.abs(w.weight - last3[0].weight) < 0.5);
    if (plateau) {
      html += `<p class="text-small text-muted mt-8" style="font-style:italic">Plateaus are common while breastfeeding. Your body may hold onto weight until weaning — this is biological protection, not failure.</p>`;
    }
  }
  html += `</div>`;

  // Badges
  html += `<div class="screen-section-title">Milestones</div>`;
  html += `<div class="card">`;
  html += `<div class="badges-grid">`;
  BADGE_DEFINITIONS.forEach(b => {
    const isEarned = !!earned[b.id];
    html += `
      <div class="badge-item ${isEarned ? 'earned' : 'locked'}" title="${b.label}${isEarned ? ` · Earned ${earned[b.id]}` : ''}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-label">${b.label}</div>
      </div>
    `;
  });
  html += `</div></div>`;

  // Habit consistency (last 8 weeks)
  html += `<div class="screen-section-title">Habit Consistency (8 Weeks)</div>`;
  html += `<div class="card">`;
  const weeks8 = Array.from({ length: 8 }, (_, i) => {
    const ws = getWeekStart();
    ws.setDate(ws.getDate() - (7 * (7 - i)));
    return ws;
  });
  const habits = Store.getHabitDefs().filter(h => h.enabled !== false);
  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];
  pillars.forEach(p => {
    const meta = PILLAR_META[p];
    const dots = weeks8.map(ws => {
      const days = getWeekDays(ws);
      const wsDayStr = dateStr(ws);
      const appStart = Store.getSettings().appStartDate || wsDayStr;
      const isFirst  = appStart >= wsDayStr && appStart <= days[6];
      const fromDay  = isFirst ? appStart : wsDayStr;
      const activeDays = days.filter(d => d >= fromDay && d <= todayStr());
      if (!activeDays.length) return false;
      const scores = computePillarScores(activeDays, habits);
      return (scores[p] || 0) >= 0.5;
    });
    html += `
      <div class="consistency-row">
        <div class="consistency-label" style="display:flex;align-items:center;gap:5px">
          <div class="pillar-dot ${meta.dotClass}"></div>${meta.label}
        </div>
        <div class="dot-row">
          ${dots.map(d => `<div class="dot-cell ${d ? '' : 'empty'}"></div>`).join('')}
        </div>
        <span class="text-small text-muted">${dots.filter(Boolean).length}/8</span>
      </div>
    `;
  });
  html += `</div>`;

  // Rewards history
  if (goals.history && goals.history.length > 0) {
    html += `<div class="screen-section-title">Rewards Cashed Out</div>`;
    html += `<div class="card">`;
    [...goals.history].reverse().forEach(r => {
      html += `
        <div class="reward-entry">
          <div>
            <div class="reward-name">${escHtml(r.name)}</div>
            <div class="reward-meta">${formatDateShort(r.date)}</div>
          </div>
          <div class="reward-amount">$${parseFloat(r.amount).toFixed(2)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Weekly notes history
  const noteEntries = Object.entries(notes).sort((a,b) => b[0].localeCompare(a[0])).slice(0, 12);
  if (noteEntries.length > 0) {
    html += `<div class="screen-section-title">Weekly Notes</div>`;
    html += `<div class="card">`;
    noteEntries.forEach(([ws, text]) => {
      if (!text) return;
      html += `
        <div class="week-note-entry">
          <div class="week-note-date">${formatDateShort(ws)}</div>
          <div class="week-note-text">${escHtml(text)}</div>
        </div>
      `;
    });
    html += `</div>`;
  }

  screen.innerHTML = html;

  // Init chart after DOM is ready
  if (weighIns.length >= 2) {
    requestAnimationFrame(() => initWeightChart(weighIns, settings));
  }
}

function initWeightChart(weighIns, settings) {
  const canvas = document.getElementById('weight-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (weightChart) { weightChart.destroy(); weightChart = null; }

  const labels = weighIns.map(w => w.date);
  const raw    = weighIns.map(w => w.weight);

  // Moving average trend (window 3)
  const trend = raw.map((_, i) => {
    const window = raw.slice(Math.max(0, i-1), i+2);
    return window.reduce((s, v) => s + v, 0) / window.length;
  });

  const goalHigh = settings.goalWeightHigh || 145;

  weightChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Trend',
          data: trend,
          borderColor: 'rgba(93,122,88,0.9)',
          borderWidth: 3,
          pointRadius: 0,
          tension: 0.4,
          fill: false,
          order: 1,
        },
        {
          label: 'Weight',
          data: raw,
          borderColor: 'rgba(196,147,138,0.6)',
          borderWidth: 1.5,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(196,147,138,0.7)',
          pointBorderColor: 'white',
          pointBorderWidth: 2,
          tension: 0,
          fill: false,
          order: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: ctx => ctx[0].label,
            label: ctx => ctx.datasetIndex === 1 ? `${ctx.parsed.y} lbs` : `Trend: ${ctx.parsed.y.toFixed(1)} lbs`,
          },
        },
        annotation: goalHigh ? {
          annotations: {
            goalLine: {
              type: 'line',
              yMin: goalHigh,
              yMax: goalHigh,
              borderColor: 'rgba(196,180,154,0.6)',
              borderWidth: 1.5,
              borderDash: [4, 4],
              label: { content: 'Goal', display: true, position: 'end', color: '#C4B49A', font: { size: 10 } },
            },
          },
        } : undefined,
      },
      scales: {
        x: {
          ticks: {
            maxTicksLimit: 6,
            callback: (_, i) => formatDateShort(labels[i]),
            color: '#8A8480',
            font: { size: 11 },
          },
          grid: { color: '#F0EDE8' },
        },
        y: {
          ticks: { color: '#8A8480', font: { size: 11 } },
          grid: { color: '#F0EDE8' },
        },
      },
    },
  });
}

/* ─── SETTINGS Screen ────────────────────────────────────────────────────── */

function renderSettings() {
  const screen = document.getElementById('screen-settings');
  const s = Store.getSettings();

  const html = `
    <div class="screen-header"><h2>Settings</h2></div>

    <div class="settings-section">
      <div class="settings-section-title">About You</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-label">Name</div>
          <input class="settings-row-input" id="s-name" type="text" placeholder="Your name" value="${escHtml(s.name || '')}" autocomplete="off">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Starting weight</div>
          <input class="settings-row-input" id="s-start-weight" type="number" step="0.1" placeholder="lbs" value="${s.startingWeight || ''}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Goal weight (low)</div>
          <input class="settings-row-input" id="s-goal-low" type="number" step="0.1" placeholder="lbs" value="${s.goalWeightLow || ''}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Goal weight (high)</div>
          <input class="settings-row-input" id="s-goal-high" type="number" step="0.1" placeholder="lbs" value="${s.goalWeightHigh || ''}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">App start date</div>
          <input class="settings-row-input" id="s-start-date" type="date" value="${s.appStartDate || todayStr()}">
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Health</div>
      <div class="settings-group">
        <div class="toggle-row" style="padding:13px 16px">
          <div>
            <div class="toggle-label">Breastfeeding mode</div>
            <div class="toggle-sublabel">Adds context to plateau messages</div>
          </div>
          <label class="toggle">
            <input type="checkbox" id="s-bf" ${s.breastfeeding ? 'checked' : ''}>
            <div class="toggle-track"></div>
          </label>
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Usual wake time</div>
          <input class="settings-row-input" id="s-wake" type="time" value="${s.usualWakeTime || '07:00'}">
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Time Cutoffs</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-label">Bedtime target</div>
          <input class="settings-row-input" id="s-bedtime" type="time" value="${s.bedtimeTarget || '22:30'}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Eating cutoff</div>
          <input class="settings-row-input" id="s-eat-cutoff" type="time" value="${s.eatCutoff || '19:00'}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Caffeine cutoff</div>
          <input class="settings-row-input" id="s-caffeine-cutoff" type="time" value="${s.caffeineCutoff || '13:00'}">
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Rewards</div>
      <div class="settings-group">
        <div class="settings-row">
          <div class="settings-row-label">Points conversion rate</div>
          <div style="display:flex;align-items:center;gap:4px">
            <span style="font-size:14px;color:var(--text-muted)">$</span>
            <input class="settings-row-input" id="s-rate" type="number" step="0.05" min="0.05" placeholder="0.50" value="${s.pointsConversionRate || 0.50}" style="max-width:80px">
            <span style="font-size:14px;color:var(--text-muted)">/pt</span>
          </div>
        </div>
        <div class="settings-btn-row" id="s-set-goal">
          <div class="settings-btn-label">Set savings goal</div>
          <div class="settings-btn-desc">Name your clothing goal and dollar target</div>
        </div>
        <div class="settings-btn-row" id="s-manual-points">
          <div class="settings-btn-label">Manual point adjustment</div>
          <div class="settings-btn-desc">Correct errors in your point balance</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Customization</div>
      <div class="settings-group">
        <div class="settings-btn-row" id="s-habits">
          <div class="settings-btn-label">Customize habits</div>
          <div class="settings-btn-desc">Toggle, rename, or add habit items</div>
        </div>
        <div class="settings-btn-row" id="s-activities">
          <div class="settings-btn-label">Customize exercise activities</div>
          <div class="settings-btn-desc">Edit activity menu and priority items</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Data</div>
      <div class="settings-group">
        <div class="settings-btn-row" id="s-export">
          <div class="settings-btn-label">Export all data (JSON)</div>
        </div>
        <div class="settings-btn-row" id="s-reset">
          <div class="settings-btn-label danger-btn">Reset all data</div>
          <div class="settings-btn-desc">This cannot be undone</div>
        </div>
      </div>
    </div>

    <div style="height:20px"></div>
  `;

  screen.innerHTML = html;

  // Auto-save on change for inputs
  const fields = [
    ['s-name',          'name',                  'text'],
    ['s-start-weight',  'startingWeight',         'number'],
    ['s-goal-low',      'goalWeightLow',          'number'],
    ['s-goal-high',     'goalWeightHigh',         'number'],
    ['s-start-date',    'appStartDate',           'text'],
    ['s-wake',          'usualWakeTime',          'text'],
    ['s-bedtime',       'bedtimeTarget',          'text'],
    ['s-eat-cutoff',    'eatCutoff',              'text'],
    ['s-caffeine-cutoff','caffeineCutoff',        'text'],
    ['s-rate',          'pointsConversionRate',   'number'],
  ];

  fields.forEach(([elId, key, type]) => {
    const el = screen.querySelector('#' + elId);
    if (!el) return;
    el.addEventListener('change', () => {
      const s = Store.getSettings();
      s[key] = type === 'number' ? parseFloat(el.value) || null : el.value;
      Store.saveSettings(s);
      showToast('Saved');
    });
  });

  screen.querySelector('#s-bf')?.addEventListener('change', e => {
    const s = Store.getSettings();
    s.breastfeeding = e.target.checked;
    Store.saveSettings(s);
  });

  screen.querySelector('#s-set-goal')?.addEventListener('click', openGoalModal);
  screen.querySelector('#s-manual-points')?.addEventListener('click', openManualPointsModal);
  screen.querySelector('#s-habits')?.addEventListener('click', openHabitsCustomizer);
  screen.querySelector('#s-activities')?.addEventListener('click', openActivitiesCustomizer);

  screen.querySelector('#s-export')?.addEventListener('click', exportData);
  screen.querySelector('#s-reset')?.addEventListener('click', () => {
    openConfirm(
      'Reset all data?',
      'This will permanently delete all your habits, workouts, weigh-ins, and points. This cannot be undone.',
      'Delete Everything',
      () => {
        openConfirm(
          'Are you absolutely sure?',
          'All data will be erased. There is no way to recover it.',
          'Yes, Delete Everything',
          resetAllData,
          true
        );
      },
      true
    );
  });
}

/* ─── Modal System ───────────────────────────────────────────────────────── */

let modalStack = [];

function openModal(renderFn) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-body');
  overlay.classList.remove('hidden');
  body.innerHTML = '';
  renderFn(body);
  modalStack.push(renderFn);

  // Close on backdrop click
  document.getElementById('modal-backdrop').onclick = closeModal;
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  document.getElementById('modal-body').innerHTML = '';
  modalStack = [];
}

/* ── Workout Modal ── */

let workoutDraft = { activityId: null, activityLabel: null, priority: false, duration: 30, intensity: 'Moderate', note: '' };

function openWorkoutModal(presetActivity) {
  workoutDraft = { activityId: presetActivity, activityLabel: null, priority: false, duration: 30, intensity: 'Moderate', note: '' };
  if (presetActivity === 'strength') {
    workoutDraft.activityId = 'strength';
    workoutDraft.activityLabel = 'Strength training';
    workoutDraft.priority = true;
    openModal(renderWorkoutStep2);
  } else {
    openModal(renderWorkoutStep1);
  }
}

function renderWorkoutStep1(body) {
  const activities = Store.getActivityDefs();
  body.innerHTML = `
    <div class="modal-title">Log a Workout</div>
    <div class="step-label">What type of workout?</div>
    <div class="activity-grid">
      ${activities.map(a => `
        <button class="activity-btn ${a.priority ? 'priority-activity' : ''} ${workoutDraft.activityId === a.id ? 'selected' : ''}"
          data-id="${a.id}" data-label="${escHtml(a.label)}" data-priority="${a.priority}">
          ${a.priority ? '⭐ ' : ''}${escHtml(a.label)}
        </button>
      `).join('')}
    </div>
  `;

  body.querySelectorAll('.activity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      workoutDraft.activityId    = btn.dataset.id;
      workoutDraft.activityLabel = btn.dataset.label;
      workoutDraft.priority      = btn.dataset.priority === 'true';
      openModal(renderWorkoutStep2);
    });
  });
}

function renderWorkoutStep2(body) {
  body.innerHTML = `
    <div class="modal-title">${escHtml(workoutDraft.activityLabel || 'Workout')}</div>
    <div class="step-label">Duration</div>
    <div class="duration-display" id="dur-display">${workoutDraft.duration} <span>min</span></div>
    <input type="range" id="dur-slider" min="5" max="120" step="5" value="${workoutDraft.duration}">
    <div class="step-label">Intensity</div>
    <div class="intensity-row">
      ${['Easy', 'Moderate', 'Hard'].map(i => `
        <button class="intensity-btn ${workoutDraft.intensity === i ? 'selected' : ''}" data-intensity="${i}">${i}</button>
      `).join('')}
    </div>
    <div class="step-label">Note (optional)</div>
    <input type="text" class="form-input mb-16" id="workout-note" placeholder="Any notes…" maxlength="100" value="${escHtml(workoutDraft.note)}">
    <button class="btn btn-primary btn-full" id="save-workout-btn">Save Workout</button>
  `;

  const slider = body.querySelector('#dur-slider');
  const display = body.querySelector('#dur-display');
  slider.addEventListener('input', () => {
    workoutDraft.duration = parseInt(slider.value);
    display.innerHTML = `${workoutDraft.duration} <span>min</span>`;
  });

  body.querySelectorAll('.intensity-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      workoutDraft.intensity = btn.dataset.intensity;
      body.querySelectorAll('.intensity-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  body.querySelector('#workout-note').addEventListener('input', e => {
    workoutDraft.note = e.target.value;
  });

  body.querySelector('#save-workout-btn').addEventListener('click', saveWorkout);
}

function saveWorkout() {
  const note = document.querySelector('#workout-note')?.value || workoutDraft.note;
  const workout = {
    id: Date.now().toString(),
    date: todayStr(),
    activityId: workoutDraft.activityId,
    activityLabel: workoutDraft.activityLabel || 'Workout',
    priority: workoutDraft.priority,
    duration: workoutDraft.duration,
    intensity: workoutDraft.intensity,
    note: note.trim(),
  };

  const workouts = Store.getWorkouts();
  workouts.push(workout);
  Store.saveWorkouts(workouts);

  const pts = workout.priority ? 2 : 1;
  Points.add(pts, `Workout: ${workout.activityLabel}`);

  closeModal();
  showToast(`Workout logged! +${pts} pt${pts > 1 ? 's' : ''}`, 'success');

  // Update today's habit if strength
  if (workout.priority) {
    const today = todayStr();
    const checked = Store.getHabits(today);
    if (!checked['move_strength']) {
      checked['move_strength'] = true;
      Store.saveHabits(today, checked);
      if (currentScreen === 'today') renderToday();
    }
  } else {
    const today = todayStr();
    const checked = Store.getHabits(today);
    if (!checked['move_other']) {
      checked['move_other'] = true;
      Store.saveHabits(today, checked);
      if (currentScreen === 'today') renderToday();
    }
  }

  const newBadges = Badges.check();
  if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 300);

  if (currentScreen === 'exercise') renderExercise();
  updatePointsBadge();
}

/* ── Weigh-in Modal ── */

function openWeighInModal() {
  openModal(body => {
    const weighIns = Store.getWeighIns();
    const last = weighIns.length ? weighIns[weighIns.length-1].weight : '';
    body.innerHTML = `
      <div class="modal-title">Log Weigh-In</div>
      <div class="form-group">
        <label class="form-label">Weight (lbs)</label>
        <input class="form-input" id="weighin-input" type="number" step="0.1" placeholder="${last || 'e.g. 162.5'}" inputmode="decimal">
      </div>
      <div class="form-group">
        <label class="form-label">Date</label>
        <input class="form-input" id="weighin-date" type="date" value="${todayStr()}">
      </div>
      <button class="btn btn-primary btn-full" id="save-weighin-btn">Log Weight</button>
    `;

    body.querySelector('#weighin-input').focus();
    body.querySelector('#save-weighin-btn').addEventListener('click', () => {
      const weight = parseFloat(body.querySelector('#weighin-input').value);
      const date   = body.querySelector('#weighin-date').value || todayStr();
      if (isNaN(weight) || weight < 50 || weight > 500) {
        showToast('Please enter a valid weight');
        return;
      }
      const weighIns = Store.getWeighIns();
      // Replace if same date
      const idx = weighIns.findIndex(w => w.date === date);
      if (idx >= 0) weighIns[idx] = { date, weight };
      else weighIns.push({ date, weight });
      weighIns.sort((a,b) => a.date.localeCompare(b.date));
      Store.saveWeighIns(weighIns);

      Points.add(3, 'Weekly weigh-in');
      closeModal();
      showToast('Weight logged! +3 pts', 'success');

      const newBadges = Badges.check();
      if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 300);

      if (currentScreen === 'week') renderWeek();
      if (currentScreen === 'progress') renderProgress();
      updatePointsBadge();
    });
  });
}

/* ── Goal Modal ── */

function openGoalModal() {
  const goals = Store.getGoals();
  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">Set Savings Goal</div>
      <div class="form-group">
        <label class="form-label">Goal name</label>
        <input class="form-input" id="goal-name" type="text" placeholder="e.g. Rouje dress" value="${escHtml(goals.name || '')}" maxlength="60">
      </div>
      <div class="form-group">
        <label class="form-label">Dollar target</label>
        <input class="form-input" id="goal-amount" type="number" step="1" min="1" placeholder="e.g. 180" value="${goals.amount || ''}">
      </div>
      <button class="btn btn-primary btn-full" id="save-goal-btn">Save Goal</button>
    `;

    body.querySelector('#save-goal-btn').addEventListener('click', () => {
      const name   = body.querySelector('#goal-name').value.trim();
      const amount = parseFloat(body.querySelector('#goal-amount').value);
      if (!name) { showToast('Please enter a goal name'); return; }
      if (isNaN(amount) || amount <= 0) { showToast('Please enter a valid dollar amount'); return; }
      const goals = Store.getGoals();
      goals.name   = name;
      goals.amount = amount;
      Store.saveGoals(goals);
      closeModal();
      showToast('Goal saved!', 'success');
      if (currentScreen === 'week') renderWeek();
    });
  });
}

/* ── Cash Out Modal ── */

function openCashOutModal() {
  const goals = Store.getGoals();
  const points = Store.getPoints();
  const settings = Store.getSettings();
  const rate = settings.pointsConversionRate || 0.50;
  const dollars = (points.spendable * rate).toFixed(2);

  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">Cash Out</div>
      <p style="font-size:15px;margin-bottom:16px;color:var(--text)">
        Cashing out <strong>$${dollars}</strong> for <strong>${escHtml(goals.name)}</strong>.
      </p>
      <p class="text-muted text-small mb-16">Your spendable balance will reset to $0. Your lifetime total earned is preserved.</p>
      <button class="btn btn-primary btn-full" id="confirm-cashout-btn">Confirm Cash Out</button>
      <button class="btn btn-outline btn-full mt-8" id="cancel-cashout-btn">Cancel</button>
    `;

    body.querySelector('#cancel-cashout-btn').addEventListener('click', closeModal);
    body.querySelector('#confirm-cashout-btn').addEventListener('click', () => {
      const goals = Store.getGoals();
      const points = Store.getPoints();
      if (!goals.history) goals.history = [];
      goals.history.push({
        name: goals.name,
        amount: dollars,
        date: todayStr(),
        points: points.spendable,
      });
      goals.name   = '';
      goals.amount = 0;
      Store.saveGoals(goals);
      points.spendable = 0;
      Store.savePoints(points);

      const newBadges = Badges.check();

      closeModal();
      celebrate('🛍️ You earned it.', `$${dollars} cashed out for ${goals.name || 'your goal'}. Go get it.`);
      if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 2000);
      if (currentScreen === 'week') setTimeout(renderWeek, 2200);
    });
  });
}

/* ── Intention Modal ── */

function openIntentionModal(wsStr) {
  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">What's your focus this week?</div>
      <p class="text-muted text-small mb-16">Pick a pillar to prioritize, or write a short intention.</p>
      <div class="pillar-choice-grid">
        ${['sleep','nutrition','movement','stress'].map(p => `
          <button class="pillar-choice-btn" data-pillar="${p}">
            <div class="dot pillar-dot ${p}"></div>
            ${PILLAR_META[p].label}
          </button>
        `).join('')}
      </div>
      <div class="form-group">
        <input class="form-input" id="intention-text" type="text" placeholder="Or write a short intention…" maxlength="100">
      </div>
      <button class="btn btn-primary btn-full" id="save-intention-btn">Set Intention</button>
      <button class="btn btn-outline btn-full mt-8" id="skip-intention-btn">Skip for now</button>
    `;

    let selectedPillar = null;
    body.querySelectorAll('.pillar-choice-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        selectedPillar = btn.dataset.pillar;
        body.querySelectorAll('.pillar-choice-btn').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        body.querySelector('#intention-text').value = '';
      });
    });

    body.querySelector('#skip-intention-btn').addEventListener('click', () => {
      const i = Store.getWeeklyIntentions();
      i[wsStr] = { pillar: null, text: '' };
      Store.saveWeeklyIntentions(i);
      closeModal();
    });

    body.querySelector('#save-intention-btn').addEventListener('click', () => {
      const text = body.querySelector('#intention-text').value.trim();
      if (!selectedPillar && !text) {
        showToast('Pick a pillar or write an intention');
        return;
      }
      const i = Store.getWeeklyIntentions();
      i[wsStr] = { pillar: selectedPillar, text };
      Store.saveWeeklyIntentions(i);
      closeModal();
      renderWeek();
    });
  });
}

/* ── Manual Points Modal ── */

function openManualPointsModal() {
  openModal(body => {
    const pts = Store.getPoints();
    body.innerHTML = `
      <div class="modal-title">Manual Point Adjustment</div>
      <p class="text-muted text-small mb-16">Current balance: <strong>${pts.spendable} pts</strong> (${pts.total_earned} total earned)</p>
      <div class="form-group">
        <label class="form-label">Adjustment amount (+ to add, - to deduct)</label>
        <input class="form-input" id="adj-amount" type="number" step="1" placeholder="e.g. 10 or -5">
      </div>
      <div class="form-group">
        <label class="form-label">Reason</label>
        <input class="form-input" id="adj-reason" type="text" placeholder="e.g. Correction for missed check-in" maxlength="80">
      </div>
      <button class="btn btn-primary btn-full" id="confirm-adj-btn">Apply Adjustment</button>
    `;

    body.querySelector('#confirm-adj-btn').addEventListener('click', () => {
      const amount = parseInt(body.querySelector('#adj-amount').value);
      const reason = body.querySelector('#adj-reason').value.trim() || 'Manual adjustment';
      if (isNaN(amount) || amount === 0) { showToast('Enter a non-zero amount'); return; }
      if (amount > 0) Points.add(amount, reason);
      else Points.deduct(Math.abs(amount), reason);
      closeModal();
      showToast(`Adjusted by ${amount > 0 ? '+' : ''}${amount} pts`, 'success');
    });
  });
}

/* ── Confirm Modal ── */

function openConfirm(title, message, confirmLabel, onConfirm, danger = false) {
  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">${escHtml(title)}</div>
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;line-height:1.5">${escHtml(message)}</p>
      <button class="btn ${danger ? 'btn-rose' : 'btn-primary'} btn-full" id="confirm-yes-btn">${escHtml(confirmLabel)}</button>
      <button class="btn btn-outline btn-full mt-8" id="confirm-no-btn">Cancel</button>
    `;

    body.querySelector('#confirm-no-btn').addEventListener('click', closeModal);
    body.querySelector('#confirm-yes-btn').addEventListener('click', () => {
      closeModal();
      onConfirm();
    });
  });
}

/* ── Habits Customizer ── */

function openHabitsCustomizer() {
  openModal(renderHabitsCustomizerBody);
}

function renderHabitsCustomizerBody(body) {
  const habits  = Store.getHabitDefs();
  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];

  let html = `<div class="modal-title">Customize Habits</div>`;
  pillars.forEach(p => {
    const meta  = PILLAR_META[p];
    const items = habits.filter(h => h.pillar === p);
    html += `
      <div class="hc-pillar-header">
        <div class="pillar-dot ${meta.dotClass}" style="width:8px;height:8px;border-radius:50%;flex-shrink:0"></div>
        <span class="hc-pillar-label">${meta.label}</span>
      </div>
    `;
    items.forEach(h => {
      const isCustom = !!h.custom;
      html += `
        <div class="habit-settings-item">
          <label class="toggle" style="flex-shrink:0">
            <input type="checkbox" class="habit-toggle" data-id="${h.id}" ${h.enabled !== false ? 'checked' : ''}>
            <div class="toggle-track"></div>
          </label>
          <textarea
            class="hc-name-input"
            data-id="${h.id}"
            maxlength="60"
            rows="1"
            aria-label="Habit name"
          >${escHtml(h.label)}</textarea>
          ${h.alsoContributes
            ? `<span class="hc-also-tag" title="Also scores toward ${PILLAR_META[h.alsoContributes]?.label}">+${PILLAR_META[h.alsoContributes]?.label.split(' ')[0]}</span>`
            : ''}
          <select class="hc-pts-select" data-id="${h.id}" aria-label="Points">
            ${[1,2,3].map(n => `<option value="${n}" ${(h.points||1) === n ? 'selected' : ''}>${n}pt</option>`).join('')}
          </select>
          ${isCustom
            ? `<button class="hc-delete-btn" data-id="${h.id}" title="Delete habit" aria-label="Delete">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
               </button>`
            : `<div style="width:14px;flex-shrink:0"></div>`}
        </div>
      `;
    });
    html += `
      <button class="hc-add-btn" data-pillar="${p}" data-pts="1">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add to ${meta.label}
      </button>
    `;
  });

  html += `<div style="height:16px"></div>`;
  body.innerHTML = html;

  // Toggle on/off
  body.querySelectorAll('.habit-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const habits = Store.getHabitDefs();
      const h = habits.find(x => x.id === toggle.dataset.id);
      if (h) { h.enabled = toggle.checked; Store.saveHabitDefs(habits); }
      if (currentScreen === 'today') renderToday();
    });
  });

  // Auto-resize textareas and save on blur
  body.querySelectorAll('.hc-name-input').forEach(input => {
    // Store original so we can revert on empty
    const original = input.value.trim();
    // Size to fit content immediately
    const resize = () => { input.style.height = 'auto'; input.style.height = input.scrollHeight + 'px'; };
    resize();
    input.addEventListener('input', resize);
    input.addEventListener('blur', () => {
      const val = input.value.trim();
      if (!val) { input.value = original; resize(); return; }
      const habits = Store.getHabitDefs();
      const h = habits.find(x => x.id === input.dataset.id);
      if (h && h.label !== val) {
        h.label = val;
        Store.saveHabitDefs(habits);
        if (currentScreen === 'today') renderToday();
      }
    });
  });

  // Points selector
  body.querySelectorAll('.hc-pts-select').forEach(sel => {
    sel.addEventListener('change', () => {
      const pts = parseInt(sel.value);
      const habits = Store.getHabitDefs();
      const h = habits.find(x => x.id === sel.dataset.id);
      if (h) {
        h.points = pts;
        h.weight = pts;  // also updates pillar bar weighting
        Store.saveHabitDefs(habits);
        if (currentScreen === 'today') renderToday();
      }
    });
  });

  // Delete custom habit
  body.querySelectorAll('.hc-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      openConfirm('Delete habit?', 'This habit will be removed from your checklist.', 'Delete', () => {
        const habits = Store.getHabitDefs().filter(h => h.id !== id);
        Store.saveHabitDefs(habits);
        if (currentScreen === 'today') renderToday();
        openModal(renderHabitsCustomizerBody);
      }, true);
    });
  });

  // Add new habit
  body.querySelectorAll('.hc-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const pillar = btn.dataset.pillar;
      openModal(b => {
        b.innerHTML = `
          <div class="modal-title">Add Habit</div>
          <div class="form-group">
            <label class="form-label">Habit name</label>
            <input class="form-input" id="new-habit-label" type="text" placeholder="e.g. Took vitamins" maxlength="60" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label">Pillar</label>
            <select class="form-input form-select" id="new-habit-pillar">
              ${['sleep','nutrition','movement','stress'].map(p =>
                `<option value="${p}" ${p === pillar ? 'selected' : ''}>${PILLAR_META[p].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Also contributes to <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <select class="form-input form-select" id="new-habit-also">
              <option value="">— None —</option>
              ${['sleep','nutrition','movement','stress'].filter(p => p !== pillar).map(p =>
                `<option value="${p}">${PILLAR_META[p].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Points</label>
            <select class="form-input form-select" id="new-habit-pts">
              <option value="1">1 point</option>
              <option value="2">2 points</option>
            </select>
          </div>
          <button class="btn btn-primary btn-full" id="new-habit-save">Add Habit</button>
          <button class="btn btn-outline btn-full mt-8" id="new-habit-back">Back</button>
        `;
        // Update "also contributes" options when primary pillar changes
        b.querySelector('#new-habit-pillar').addEventListener('change', e => {
          const chosen = e.target.value;
          const also = b.querySelector('#new-habit-also');
          const prev = also.value;
          also.innerHTML = `<option value="">— None —</option>` +
            ['sleep','nutrition','movement','stress'].filter(p => p !== chosen).map(p =>
              `<option value="${p}" ${p === prev && p !== chosen ? 'selected' : ''}>${PILLAR_META[p].label}</option>`
            ).join('');
        });
        b.querySelector('#new-habit-label').focus();
        b.querySelector('#new-habit-back').addEventListener('click', () => openModal(renderHabitsCustomizerBody));
        b.querySelector('#new-habit-save').addEventListener('click', () => {
          const label       = b.querySelector('#new-habit-label').value.trim();
          const pillar      = b.querySelector('#new-habit-pillar').value;
          const also        = b.querySelector('#new-habit-also').value || null;
          const pts         = parseInt(b.querySelector('#new-habit-pts').value);
          if (!label) { showToast('Please enter a habit name'); return; }
          const habits = Store.getHabitDefs();
          const entry = {
            id:             'custom_' + Date.now(),
            label,
            pillar,
            weight:         pts,
            points:         pts,
            enabled:        true,
            custom:         true,
            retroactive:    false,
            opensWorkout:   false,
            priority:       false,
          };
          if (also) { entry.alsoContributes = also; entry.alsoWeight = pts; }
          habits.push(entry);
          Store.saveHabitDefs(habits);
          if (currentScreen === 'today') renderToday();
          openModal(renderHabitsCustomizerBody);
          showToast('Habit added', 'success');
        });
      });
    });
  });
}

/* ── Activities Customizer ── */

function openActivitiesCustomizer() {
  openModal(body => {
    const activities = Store.getActivityDefs();
    let html = `<div class="modal-title">Exercise Activities</div>`;
    activities.forEach((a, i) => {
      html += `
        <div class="habit-settings-item">
          <label class="toggle" style="flex-shrink:0" title="Priority (strength-style)">
            <input type="checkbox" class="activity-priority" data-idx="${i}" ${a.priority ? 'checked' : ''}>
            <div class="toggle-track"></div>
          </label>
          <div class="habit-settings-name">${escHtml(a.label)}</div>
          ${a.priority ? '<span class="habit-badge priority">Priority</span>' : ''}
        </div>
      `;
    });
    html += `<p class="text-muted text-small mt-8" style="padding:0 4px">Priority activities earn 2 pts and get the strength training visual distinction.</p>`;
    body.innerHTML = html;

    body.querySelectorAll('.activity-priority').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const activities = Store.getActivityDefs();
        activities[parseInt(toggle.dataset.idx)].priority = toggle.checked;
        Store.saveActivityDefs(activities);
        openActivitiesCustomizer(); // re-render
      });
    });
  });
}

/* ─── Celebration ────────────────────────────────────────────────────────── */

function celebrate(title, message) {
  // Remove any existing
  const existing = document.getElementById('celebration-overlay');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.id = 'celebration-overlay';
  el.innerHTML = `
    <div class="celebration-icon">${title.split(' ')[0]}</div>
    <div class="celebration-title">${title.replace(/^\S+\s/, '')}</div>
    <div class="celebration-text">${message}</div>
    <button class="btn btn-primary" id="celebrate-close">Got it</button>
  `;
  document.body.appendChild(el);

  el.querySelector('#celebrate-close').addEventListener('click', () => el.remove());
  setTimeout(() => el.remove(), 8000);

  // Confetti
  if (typeof confetti !== 'undefined') {
    const colors = ['#8FAF8A', '#C4938A', '#C4B49A', '#A8C5D6', '#FFFFFF'];
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.4 }, colors });
    setTimeout(() => confetti({ particleCount: 60, spread: 60, origin: { y: 0.3 }, colors }), 400);
  }
}

/* ─── Toast ──────────────────────────────────────────────────────────────── */

function showToast(message, type = '') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => el.remove(), 350);
  }, 2000);
}

/* ─── Data Export ────────────────────────────────────────────────────────── */

function exportData() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('bloom_')) data[k] = localStorage.getItem(k);
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = `bloom-backup-${todayStr()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Data exported!', 'success');
}

function resetAllData() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith('bloom_')) keys.push(localStorage.key(i));
  }
  keys.forEach(k => localStorage.removeItem(k));
  showToast('All data deleted.');
  navigate('today');
}

/* ─── Utilities ──────────────────────────────────────────────────────────── */

function escHtml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ─── Keyboard / Accessibility ───────────────────────────────────────────── */

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});

/* ─── Init ───────────────────────────────────────────────────────────────── */

function init() {
  // Dismiss splash after a brief moment
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => { splash.classList.add('splash-out'); }, 350);
    splash.addEventListener('transitionend', () => splash.remove());
  }

  // Register service worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  // Navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.screen));
  });

  document.getElementById('settings-btn')?.addEventListener('click', () => {
    if (currentScreen === 'settings') navigate('today');
    else navigate('settings');
  });

  // Update header
  updateHeader();

  // Render today screen
  renderToday();

  // Midnight reset check (basic: store last-open date)
  const lastOpen = Store.get('last_open_date', null);
  const today = todayStr();
  if (lastOpen && lastOpen !== today) {
    // New day — nothing to reset (habits are stored by date, so already separate)
  }
  Store.set('last_open_date', today);

  // Update header message daily
  setInterval(updateHeader, 60 * 60 * 1000);
}

document.addEventListener('DOMContentLoaded', init);
