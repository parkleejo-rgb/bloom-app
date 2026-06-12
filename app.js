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

const MAINTENANCE_MESSAGES = [
  "Maintenance is an active choice, not a passive state.",
  "The habits that got you here are the habits that keep you here.",
  "Consistency looks different now -- less about the scale, more about feeling strong.",
  "You built this. Keeping it is the same work.",
  "Small consistent choices compound.",
  "Rest is part of the work.",
  "You're doing more than you think.",
  "Your body is doing a lot right now. Give it what it needs.",
  "Progress lives in the quiet days too.",
  "You're building something that lasts.",
];

const DEFAULT_HABITS = [
  // Sleep  (sleep_outside removed — morning walk now covers circadian benefit in Movement)
  { id: 'sleep_bed',      label: 'In bed by 10:30pm',                          pillar: 'sleep',     weight: 3, points: 2, retroactive: true,  opensWorkout: false, priority: false },
  { id: 'sleep_wake',     label: 'Woke up within 30 min of usual wake time',   pillar: 'sleep',     weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'sleep_caffeine', label: 'No caffeine after 1pm',                      pillar: 'sleep',     weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  // Nutrition — ordered by points desc
  { id: 'nutr_breakfast', label: 'High protein breakfast (30g goal)',          pillar: 'nutrition', weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_fiber',     label: 'Approx 25 to 30g fiber throughout day',         pillar: 'nutrition', weight: 2, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_no_eat',    label: 'Evening eating cutoff',                      pillar: 'nutrition', weight: 3, points: 2, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_no_junk',   label: 'No processed meat today',                    pillar: 'nutrition', weight: 3, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_alcohol',   label: 'Alcohol-free today',                         pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_lunch',     label: 'Protein and plants at lunch',                pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
  { id: 'nutr_dinner',    label: 'Protein and plants at dinner',               pillar: 'nutrition', weight: 2, points: 1, retroactive: false, opensWorkout: false, priority: false },
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
  // Optional habits — off by default
  { id: 'nutr_enough',    label: 'Ate enough to support energy and recovery',  pillar: 'nutrition', weight: 1, points: 1, retroactive: false, opensWorkout: false, priority: false, enabled: false },
];

const HABIT_RATIONALE = {
  sleep_bed:     "Sleep timing affects circadian rhythm, which regulates hunger hormones and energy metabolism. Research consistently links adequate sleep with better weight management, though the effect size varies between individuals.",
  sleep_wake:    "Consistent wake time is one of the strongest anchors for circadian rhythm stability. Evidence from sleep research suggests this matters more for sleep quality than bedtime alone, though both contribute.",
  sleep_caffeine:"Caffeine has a half-life of roughly 5 to 6 hours, meaning afternoon caffeine can still be active at bedtime. A 2013 study found caffeine taken 6 hours before bed reduced sleep by about one hour -- individual sensitivity varies considerably.",
  nutr_breakfast:"Higher protein intake at breakfast is associated with reduced hunger later in the day in several studies, likely through effects on satiety hormones. Evidence is reasonably strong for appetite regulation, though direct effects on weight loss are moderate.",
  nutr_fiber:    "Dietary fiber is associated with improved satiety, better blood sugar regulation, and gut health. Evidence for these effects is strong and consistent. Most people consume significantly less than the recommended 25 to 30g per day.",
  nutr_no_eat:   "Time-restricted eating has some evidence for metabolic benefits, particularly around circadian alignment of food intake. However, randomised trials comparing it to general calorie reduction show mixed results. The main benefit here may be reducing unplanned evening snacking. If you are breastfeeding or genuinely hungry, eating enough always takes priority.",
  nutr_no_junk:  "Processed meats are classified as Group 1 carcinogens by WHO IARC, meaning there is sufficient evidence of a link to colorectal cancer. This classification reflects strength of evidence, not that the absolute risk is large. Occasional consumption carries low absolute risk; regular daily consumption is what the evidence flags.",
  nutr_alcohol:  "Alcohol is associated with disrupted sleep architecture even in small amounts, and evidence links regular consumption to increased risk of several cancers including breast cancer. The evidence for sleep disruption is strong. Cancer risk evidence is consistent across large studies, though absolute individual risk depends on many factors.",
  nutr_lunch:    "Meals centred on protein and vegetables tend to be more satiating and lower in energy density than carbohydrate-centred meals. Evidence for this pattern is consistent across multiple study designs.",
  nutr_dinner:   "Protein and vegetable-centred meals support satiety and provide nutrient density. Ending the day with this pattern also supports your evening eating cutoff.",
  nutr_water:    "Starting the day with water supports hydration after overnight fasting and can help establish a consistent morning routine. Evidence for specific weight loss effects is weak -- the main benefit is practical habit anchoring.",
  nutr_omega3:   "DHA and EPA (omega-3 fatty acids) are depleted during pregnancy and breastfeeding. Evidence supports supplementation for maternal mood and infant neurodevelopment. Direct effects on postpartum weight loss are not well established.",
  nutr_vitamins: "Pregnancy and breastfeeding increase nutrient demands, and deficiencies in vitamin D, magnesium, and other micronutrients are common postpartum. Supplementation is supported by clinical guidelines for breastfeeding mothers. Evidence for direct weight loss effects is limited -- the benefit is nutritional adequacy during recovery.",
  nutr_enough:   "Adequate calorie intake is essential for postpartum recovery, breastfeeding, and hormonal health. Restriction below energy needs can impair milk supply, increase fatigue, and disrupt hormonal recovery. This habit is a reminder that nourishment is foundational -- not optional.",
  move_strength: "Resistance training preserves lean muscle mass during weight loss, which protects resting metabolic rate. Evidence for this is strong and consistent. ACOG recommends at least 150 minutes of moderate aerobic activity weekly postpartum, with strength training as a beneficial addition when tolerated.",
  move_other:    "Regular movement across different modalities supports cardiovascular health, mood, and stress recovery. Consistency over time matters more than intensity or type for long-term health outcomes.",
  move_walk:     "Walking combines light movement, morning light exposure, and time outdoors -- all associated with modest benefits for mood, circadian rhythm, and general activity levels. Evidence for each component individually is reasonable.",
  move_mobility: "Postpartum connective tissue recovery takes time. Regular mobility work supports injury prevention and movement quality. Evidence for specific postpartum benefits is limited but general evidence for flexibility and injury prevention is consistent.",
  stress_outside:"Time in natural environments is associated with lower self-reported stress and improved mood in several studies. Effect sizes are modest and most studies are observational, but the evidence is reasonably consistent and the cost of the habit is low.",
  stress_me:     "Postpartum identity preservation -- maintaining activities outside the caregiving role -- is associated with better mental health outcomes in qualitative and longitudinal research. Evidence is primarily from observational studies.",
  stress_task:   "A sense of agency and accomplishment outside caregiving is associated with lower postpartum distress in observational research. This habit is about psychological recovery, not productivity.",
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

/* The 6 habits with strongest direct evidence for weight loss */
const CORE_HABIT_IDS = ['sleep_bed', 'nutr_breakfast', 'nutr_no_eat', 'nutr_lunch', 'nutr_dinner', 'move_strength'];

const CORE_HABIT_PUSHBACK = {
  nutr_breakfast: "This is one of the highest-leverage habits for appetite control. Are you sure?",
  nutr_no_eat:    "This habit directly supports your fasting window. Are you sure?",
  move_strength:  "Strength training protects your metabolic rate during weight loss more than any other exercise. Are you sure?",
  sleep_bed:      "Earlier bedtime is one of the highest-leverage changes for postpartum cortisol and hunger control. Are you sure?",
  nutr_lunch:     "Protein and plants at lunch is one of the anchors of your nutrition approach. Are you sure?",
  nutr_dinner:    "Ending the day with protein and plants supports your fasting window and overnight recovery. Are you sure?",
};

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
  { id: 'pillars_50',      label: 'All domains 50%+ week',   icon: '🌸',  bonusPoints: 0,  group: 'habits'  },
  { id: 'month_strength',  label: 'Month of 3+ strength/wk', icon: '🦋',  bonusPoints: 0,   group: 'fitness' },
  // Streak badges — earned permanently, never removed on streak break
  { id: 'streak_7',   label: 'One week',                  icon: '🔥',  bonusPoints: 0,   group: 'streak', streakDays: 7,   note: null },
  { id: 'streak_21',  label: 'Getting easier',            icon: '🔥',  bonusPoints: 0,   group: 'streak', streakDays: 21,  note: 'Research suggests habits start feeling more automatic around this point.' },
  { id: 'streak_66',  label: 'This is becoming a habit',  icon: '🔥',  bonusPoints: 0,   group: 'streak', streakDays: 66,  note: '66 days is the research-backed median for habit automaticity.' },
  { id: 'streak_90',  label: '90 days',                   icon: '🔥',  bonusPoints: 0,   group: 'streak', streakDays: 90,  note: null },
  { id: 'streak_180', label: 'Built into your life now',  icon: '🔥',  bonusPoints: 0,   group: 'streak', streakDays: 180, note: null },
  { id: 'streak_365', label: 'A year of showing up',      icon: '🔥',  bonusPoints: 100, group: 'streak', streakDays: 365, note: null },
];

// Set your Google Cloud OAuth 2.0 client ID here to enable Sheets backup.
// Create one at console.cloud.google.com → APIs & Services → Credentials.
// Enable the Google Sheets API and add your app's origin to allowed JavaScript origins.
const GOOGLE_CLIENT_ID = '763862383625-3gpodcsd248v47k5f35oh2ptobendksu.apps.googleusercontent.com';

// Web Push config. Generate keys with `node worker/generate-keys.mjs`, then
// deploy the Cloudflare Worker and paste its public URL here.
const VAPID_PUBLIC_KEY = 'BDZJm6bJnXZjFnesY2wLE4kVXbericjU_Cnua-QWitRxfbMZRzIWqbMR5em6YndVv0js2DKCRBwDwRQEnP9CvRI';
const PUSH_WORKER_URL  = 'https://bloom-push.jopark-root.workers.dev';

const DEFAULT_SETTINGS = {
  name: '',
  startingWeight: null,
  goalWeightLow: null,
  goalWeightHigh: null,
  appStartDate: dateStr(new Date()),
  breastfeeding: false,
  usualWakeTime: '07:00',
  eatCutoff: '19:00',
  bedtimeTarget: '22:30',
  caffeineCutoff: '13:00',
  pointsConversionRate: 0.50,
  // Optional features
  featNotifications: true,
  featSleepTracking: true,
  featMoodLog: false,
  featProgressPhotos: false,
  featMeasurements: false,
  // Notification toggles
  notifStreakProtection: false,
  notifWeighIn: false,
  notifBedtime: false,
  notifMorningCheckin: false,
  notifMorningTime: '08:00',
  // Measurement setup
  trackedMeasurements: ['waist', 'hips'],
  measurementsSetupDone: false,
  // Mode
  mode: 'weight_loss', // 'weight_loss' | 'maintenance'
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
  saveSettings(s) { this.set('settings', s); SheetsSync.schedule(); },

  getHabits(date)      { return this.get('habits_' + date, {}); },
  saveHabits(date, h)  { this.set('habits_' + date, h); SheetsSync.schedule(); },

  getWeighIns()        { return this.get('weighins', []); },
  saveWeighIns(a)      { this.set('weighins', a); SheetsSync.schedule(); },

  getWorkouts()        { return this.get('workouts', []); },
  saveWorkouts(a)      { this.set('workouts', a); SheetsSync.schedule(); },

  getSleepLogs()       { return this.get('sleep_logs', []); },
  saveSleepLogs(a)     { this.set('sleep_logs', a); },

  getMoodLogs()        { return this.get('mood_logs', []); },
  saveMoodLogs(a)      { this.set('mood_logs', a); },

  getProgressPhotos()  { return this.get('progress_photos', []); },
  saveProgressPhotos(a){ this.set('progress_photos', a); },

  getMeasurements()    { return this.get('measurements', []); },
  saveMeasurements(a)  { this.set('measurements', a); },

  getPoints()          { return this.get('points', { total_earned: 0, spendable: 0, history: [] }); },
  savePoints(p)        { this.set('points', p); SheetsSync.schedule(); },

  getGoals()           { return this.get('goals', { name: '', amount: 0, pointsTarget: null, level: null, dateSet: null, history: [] }); },
  saveGoals(g)         { this.set('goals', g); SheetsSync.schedule(); },

  getBadges()          { return this.get('badges', {}); },
  saveBadges(b)        { this.set('badges', b); SheetsSync.schedule(); },

  getWeeklyNotes()     { return this.get('weekly_notes', {}); },
  saveWeeklyNotes(n)   { this.set('weekly_notes', n); },

  getWeeklyIntentions(){ return this.get('weekly_intentions', {}); },
  saveWeeklyIntentions(i){ this.set('weekly_intentions', i); },

  getHabitDefs() {
    const stored = this.get('habit_defs', null);
    if (!stored) return DEFAULT_HABITS.map(h => ({...h}));

    const LABEL_MIGRATIONS = [
      { id: 'nutr_breakfast', newPoints: 2 },
      { id: 'nutr_fiber',     oldLabels: ['Had a high-fiber food today', 'Approx 30g of fiber throughout day'],    newLabel: 'Approx 25 to 30g fiber throughout day', newPoints: 2 },
      { id: 'nutr_no_eat',    oldLabels: ['No eating after', 'Evening eating cutoff ('],                          newLabel: 'Evening eating cutoff', newPoints: 2 },
      { id: 'nutr_no_junk',   oldLabels: ['Avoided ultra-processed snacks','No processed meats or packaged snack foods','No processed meat or packaged snack foods today'], newLabel: 'No processed meat today' },
      { id: 'nutr_lunch',     oldLabels: ['Protein and veg forward at lunch', 'Protein and vegetables at lunch'],  newLabel: 'Protein and plants at lunch' },
      { id: 'nutr_dinner',    oldLabels: ['Protein and veg forward at dinner', 'Protein and vegetables at dinner'], newLabel: 'Protein and plants at dinner' },
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
  add(amount, reason, date = todayStr()) {
    const p = Store.getPoints();
    p.total_earned += amount;
    p.spendable += amount;
    p.history.push({ date, amount, reason });
    Store.savePoints(p);
    updatePointsBadge();
  },
  deduct(amount, reason, date = todayStr()) {
    const p = Store.getPoints();
    p.spendable    = Math.max(0, p.spendable    - amount);
    p.total_earned = Math.max(0, p.total_earned - amount);
    p.history.push({ date, amount: -amount, reason });
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
    return Math.max(0, Store.getPoints().history
      .filter(h => h.date >= ws && h.date <= weStr)
      .reduce((s, h) => s + h.amount, 0));
  },
};

/* ─── Badge System ───────────────────────────────────────────────────────── */

const Badges = {
  // Workout badge thresholds — used for both award and deactivation recheck
  WORKOUT_THRESHOLDS: [
    { id: 'first_workout', min: 1,  strengthOnly: false },
    { id: 'workouts_10',   min: 10, strengthOnly: false },
    { id: 'workouts_25',   min: 25, strengthOnly: false },
    { id: 'strength_5',    min: 5,  strengthOnly: true  },
    { id: 'strength_20',   min: 20, strengthOnly: true  },
  ],

  getDeactivated() { return Store.get('badge_deactivated', {}); },
  saveDeactivated(d) { Store.set('badge_deactivated', d); },

  // Called after any workout change (log or delete). Re-evaluates workout badge status.
  recheckWorkoutBadges() {
    const earned     = Store.getBadges();
    const deact      = this.getDeactivated();
    const workouts   = Store.getWorkouts();
    const total      = workouts.length;
    const strength   = workouts.filter(w => w.priority).length;
    let changed = false;

    this.WORKOUT_THRESHOLDS.forEach(t => {
      if (!earned[t.id]) return; // not yet earned, skip
      const count = t.strengthOnly ? strength : total;
      const qualifies = count >= t.min;
      if (!qualifies && !deact[t.id]) {
        deact[t.id] = true;
        changed = true;
      } else if (qualifies && deact[t.id]) {
        delete deact[t.id];
        changed = true;
      }
    });

    if (changed) this.saveDeactivated(deact);
  },

  // groups: array of badge groups to check, or omit to check all
  // 'weight' | 'workout' | 'rewards' | 'habits' — keeps cross-context false positives out
  check(groups) {
    const all = !groups;
    const has = g => all || groups.includes(g);

    const earned = Store.getBadges();
    const settings = Store.getSettings();
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

    if (has('weight')) {
      const weighIns = Store.getWeighIns();
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
    }

    if (has('workout')) {
      const workouts = Store.getWorkouts();
      if (workouts.length >= 1)  award('first_workout');
      if (workouts.length >= 10) award('workouts_10');
      if (workouts.length >= 25) award('workouts_25');
      const strengthCount = workouts.filter(w => w.priority).length;
      if (strengthCount >= 5)  award('strength_5');
      if (strengthCount >= 20) award('strength_20');
    }

    if (has('rewards')) {
      const goals = Store.getGoals();
      const cashouts = goals.history ? goals.history.length : 0;
      if (cashouts >= 1) award('first_cashout');
      if (cashouts >= 3) award('cashouts_3');
    }

    if (has('habits')) {
      const habitKeys = Object.keys(localStorage)
        .filter(k => k.startsWith('bloom_habits_'))
        .map(k => k.replace('bloom_habits_', ''));
      if (habitKeys.length >= 30) award('checkins_30');
      if (habitKeys.length >= 7)  award('first_full_week');
    }

    Store.saveBadges(earned);
    this.recheckWorkoutBadges();
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

/* ─── Streak System ──────────────────────────────────────────────────────── */

const Streak = {
  getData() {
    return Store.get('streak', { current: 0, best: 0, graceDaysUsed: {}, graceNoteShownFor: null, brokenNoteShownFor: null, showGraceNote: false, showBrokenNote: false, bestAtBreak: 0 });
  },
  saveData(d) { Store.set('streak', d); },

  // True if ≥5 of the (enabled) core habits are checked for that date
  isStreakDay(date) {
    const checked    = Store.getHabits(date);
    const defs       = Store.getHabitDefs();
    const coreActive = defs.filter(h => CORE_HABIT_IDS.includes(h.id) && h.enabled !== false);
    const done       = coreActive.filter(h => checked[h.id]).length;
    return done >= 5;
  },

  // Recompute streak from scratch (supports retroactive logging)
  recompute() {
    const data       = this.getData();
    const prevCurrent = data.current;
    const today      = todayStr();
    const appStart   = Store.getSettings().appStartDate || today;

    // Collect all dates that have habit data
    const allDates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('bloom_habits_')) allDates.push(k.replace('bloom_habits_', ''));
    }
    const streakDays = new Set(allDates.filter(d => this.isStreakDay(d)));

    const usedGrace = {}; // weekStart → date of missed day
    let current = 0;

    // Walk backwards from today
    const cur = new Date();
    cur.setHours(0, 0, 0, 0);

    for (let i = 0; i < 400; i++) {
      const ds = dateStr(cur);
      if (ds < appStart) break;

      if (streakDays.has(ds)) {
        current++;
      } else if (ds <= today) {
        const ws = dateStr(getWeekStart(new Date(cur)));
        if (!usedGrace[ws] && current > 0) {
          usedGrace[ws] = ds; // consume grace day for this week
        } else {
          break;
        }
      }

      cur.setDate(cur.getDate() - 1);
    }

    // Grace day note: if a grace day was used for yesterday
    const yesterday          = dateStr(new Date(Date.now() - 86400000));
    const graceWasYesterday  = Object.values(usedGrace).includes(yesterday);
    const prevGrace          = data.graceDaysUsed || {};
    const prevGraceYesterday = Object.values(prevGrace).includes(yesterday);

    if (graceWasYesterday && !prevGraceYesterday && data.graceNoteShownFor !== today) {
      data.graceNoteShownFor = today;
      data.showGraceNote = true;
    }

    // Streak broken message: was positive, now zero
    if (prevCurrent > 0 && current === 0 && data.brokenNoteShownFor !== today) {
      data.brokenNoteShownFor = today;
      data.showBrokenNote = true;
      data.bestAtBreak    = data.best || prevCurrent;
    }

    data.current       = current;
    data.best          = Math.max(data.best || 0, current);
    data.graceDaysUsed = usedGrace;

    this.saveData(data);
    return data;
  },

  // Returns how many core habits are done for a given date
  getCoreProgress(date) {
    const checked    = Store.getHabits(date || todayStr());
    const defs       = Store.getHabitDefs();
    const coreActive = defs.filter(h => CORE_HABIT_IDS.includes(h.id) && h.enabled !== false);
    const done       = coreActive.filter(h => checked[h.id]).length;
    return { done, total: coreActive.length };
  },

  // Check and award streak badges; returns newly earned badge ids
  checkBadges() {
    const data   = this.getData();
    const earned = Store.getBadges();
    const newly  = [];

    BADGE_DEFINITIONS.filter(b => b.streakDays).forEach(b => {
      if (!earned[b.id] && data.best >= b.streakDays) {
        earned[b.id] = todayStr();
        if (b.bonusPoints > 0) Points.add(b.bonusPoints, `Badge: ${b.label}`);
        newly.push(b.id);
      }
    });

    if (newly.length) Store.saveBadges(earned);
    return newly;
  },

  // Show celebration for a streak badge
  showBadgeCelebration(badgeId) {
    const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
    if (!def) return;
    const is365   = def.streakDays === 365;
    const message = def.note
      ? `${def.label} — ${def.note}`
      : (is365 ? 'A full year. That\'s extraordinary.' : `You earned the "${def.label}" streak badge!`);
    celebrate(def.icon + ' ' + def.label, message);
    if (is365 && typeof confetti !== 'undefined') {
      const colors = ['#8FAF8A', '#C4938A', '#C4B49A', '#A8C5D6', '#FFFFFF'];
      setTimeout(() => confetti({ particleCount: 200, spread: 120, origin: { y: 0.3 }, colors }), 200);
    }
  },
};

/* ─── Temptation Bundling ────────────────────────────────────────────────── */

const TBUNDLE_PROMPTS = {
  move_walk:      "What do you like on walks — a podcast, music, a call, or just quiet?",
  move_strength:  "What makes your workouts feel good — music, a show, silence, working out with someone?",
  move_other:     "What do you pair with this workout to look forward to it?",
  move_mobility:  "What helps this feel like downtime — a show, music, or just quiet time?",
  stress_outside: "What makes outside time feel like a break for you?",
  nutr_breakfast: "What's already part of your morning you could do this alongside?",
  nutr_water:     "What do you always do first thing that you could pair this with?",
  nutr_omega3:    "What's your most automatic morning habit you could stack this onto?",
  nutr_vitamins:  "What's your most automatic morning habit you could stack this onto?",
  sleep_bed:      "What helps you wind down — a show, reading, music, something else?",
};

const TBundle = {
  getData()            { return Store.get('tbundle', {}); },
  saveData(d)          { Store.set('tbundle', d); },
  getLastPromptDate()  { return Store.get('tbundle_lpd', null); },
  setLastPromptDate(d) { Store.set('tbundle_lpd', d); },

  saveNote(habitId, note) {
    const d = this.getData();
    d[habitId] = { ...(d[habitId] || {}), note };
    this.saveData(d);
  },

  skip(habitId) {
    const d = this.getData();
    d[habitId] = { ...(d[habitId] || {}), skipped: true };
    this.saveData(d);
  },

  // Count how many distinct days a habit has been checked
  _checkCount(habitId) {
    let count = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k.startsWith('bloom_habits_')) continue;
      if (Store.get(k.replace('bloom_', ''), {})[habitId]) count++;
    }
    return count;
  },

  // Return the habit id that should show a prompt today (or null)
  getPromptHabitId(checked, habits) {
    const today = todayStr();
    if (this.getLastPromptDate() === today) return null;
    const data = this.getData();
    for (const habit of habits) {
      const id = habit.id;
      if (!TBUNDLE_PROMPTS[id]) continue;
      if (data[id]?.note || data[id]?.skipped) continue;
      if (!checked[id]) continue;
      if (this._checkCount(id) >= 2) {
        this.setLastPromptDate(today);
        return id;
      }
    }
    return null;
  },

  // Check after a fresh toggle whether a prompt should now appear for this habit
  shouldPromptNow(habitId) {
    const today = todayStr();
    if (!TBUNDLE_PROMPTS[habitId]) return false;
    if (this.getLastPromptDate() === today) return false;
    const data = this.getData();
    if (data[habitId]?.note || data[habitId]?.skipped) return false;
    if (this._checkCount(habitId) >= 2) {
      this.setLastPromptDate(today);
      return true;
    }
    return false;
  },
};

/* ─── Voice Input ─────────────────────────────────────────────────────────── */

function startVoiceInput(inputEl) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { showToast('Voice input not supported in this browser'); return; }
  try {
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = e => { inputEl.value = e.results[0][0].transcript; };
    rec.onerror  = () => showToast('Could not capture voice input');
    rec.start();
    showToast('Listening…');
  } catch { showToast('Voice input unavailable'); }
}

/* ─── Adaptive Goal Helpers ──────────────────────────────────────────────── */

function suggestPointsTarget(level) {
  const DEFAULTS = { small: 50, medium: 120, big: 250 };
  const goals    = Store.getGoals();
  const history  = (goals.history || []).filter(h => h.level === level && h.pointsTarget);

  const settings = Store.getSettings();
  const pts      = Store.getPoints();
  const daysSince = Math.max(7,
    Math.round((Date.now() - parseDate(settings.appStartDate || todayStr()).getTime()) / 86400000));
  const dailyAvg = pts.total_earned / daysSince;
  const ceiling  = Math.max(DEFAULTS[level], Math.round(dailyAvg * 7 * 8)); // 8-week cap

  if (!history.length) return DEFAULTS[level];

  const last = history[history.length - 1];
  const base = last.abandoned
    ? Math.round(last.pointsTarget * 0.8)
    : Math.round(last.pointsTarget * 1.2);

  return Math.min(base, ceiling);
}

function estimateWeeks(pointsTarget) {
  const settings  = Store.getSettings();
  const pts       = Store.getPoints();
  const daysSince = Math.max(7,
    Math.round((Date.now() - parseDate(settings.appStartDate || todayStr()).getTime()) / 86400000));
  const dailyAvg  = pts.total_earned / daysSince;
  if (dailyAvg < 0.5) return null;
  const weeks = Math.round(pointsTarget / (dailyAvg * 7));
  return weeks <= 8 ? weeks : null;
}

/* ─── Feature 5: Plateau Check-In ────────────────────────────────────────── */

function detectPlateau(weighIns) {
  // Need at least 4 weigh-ins, each at least 1 week apart
  if (weighIns.length < 4) return false;
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
  const last4  = sorted.slice(-4);
  // Check that they span at least 3 weeks (21 days)
  const spanDays = (parseDate(last4[3].date) - parseDate(last4[0].date)) / 86400000;
  if (spanDays < 21) return false;
  const totalLoss = last4[0].weight - last4[3].weight;
  const weeks     = spanDays / 7;
  const avgPerWk  = totalLoss / weeks;
  return avgPerWk < 0.25; // less than 0.25 lbs/week average = plateau
}

function plateauCheckinDone() {
  const key  = 'plateau_checkin_week';
  const ws   = dateStr(getWeekStart());
  return Store.get(key, '') === ws;
}

function markPlateauCheckinDone() {
  Store.set('plateau_checkin_week', dateStr(getWeekStart()));
}

// Domain averages over last 4 weeks (returns {sleep,nutrition,movement,stress} 0-100)
function last4WeeksDomainAvgs() {
  const habits = Store.getHabitDefs().filter(h => h.enabled !== false);
  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];
  const weeks4 = Array.from({ length: 4 }, (_, i) => {
    const ws = new Date(getWeekStart());
    ws.setDate(ws.getDate() - (7 * (3 - i)));
    return ws;
  });
  const avgs = {};
  pillars.forEach(p => {
    let total = 0; let count = 0;
    weeks4.forEach(ws => {
      const days = getWeekDays(ws);
      const activeDays = days.filter(d => d <= todayStr());
      if (!activeDays.length) return;
      const scores = computePillarScores(activeDays, habits);
      total += (scores[p] || 0) * 100;
      count++;
    });
    avgs[p] = count ? Math.round(total / count) : 0;
  });
  return avgs;
}

function openPlateauCheckin() {
  openModal(body => _plateauStep1(body));
}

function _plateauStep1(body) {
  const avgs  = last4WeeksDomainAvgs();
  const notes = Store.getWeeklyNotes();
  // last 4 weekly notes
  const noteEntries = Object.entries(notes)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .slice(0, 4)
    .filter(([, v]) => v);

  const domainBars = ['sleep', 'nutrition', 'movement', 'stress'].map(p => {
    const meta = PILLAR_META[p];
    const pct  = avgs[p];
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">
          <span style="display:flex;align-items:center;gap:5px">
            <span class="pillar-dot ${meta.dotClass}"></span>${meta.label}
          </span>
          <span style="color:var(--text-muted)">${pct}%</span>
        </div>
        <div class="progress-bar-wrap" style="height:8px">
          <div class="progress-bar-fill sage" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');

  const notesHtml = noteEntries.length ? `
    <div style="margin-top:16px">
      <div style="font-size:11px;font-weight:600;letter-spacing:.06em;color:var(--text-muted);text-transform:uppercase;margin-bottom:8px">Your recent notes</div>
      ${noteEntries.map(([ws, text]) => `
        <div style="margin-bottom:10px">
          <div style="font-size:11px;color:var(--text-muted)">${formatDateShort(ws)}</div>
          <div style="font-size:13px;color:var(--text)">${escHtml(text.slice(0, 160))}${text.length > 160 ? '…' : ''}</div>
        </div>`).join('')}
    </div>` : '';

  body.innerHTML = `
    <div class="modal-title" style="font-size:16px">Here's what the last 4 weeks looked like.</div>
    <div style="margin-top:16px">${domainBars}</div>
    ${notesHtml}
    <button class="btn btn-primary btn-full mt-16" id="plateau-continue-btn">Continue</button>
  `;
  body.querySelector('#plateau-continue-btn').addEventListener('click', () => _plateauStep2(body));
}

function _plateauStep2(body) {
  body.innerHTML = `
    <button class="btn btn-outline" id="plateau-skip-btn" style="position:absolute;top:12px;right:16px;padding:4px 12px;font-size:13px">Skip</button>
    <div class="modal-title" style="margin-top:24px">What do you think has been getting in the way?</div>
    <div style="text-align:center;margin:28px 0">
      <button class="tbundle-mic" id="plateau-mic-btn" style="width:72px;height:72px;font-size:32px;border-radius:50%;background:var(--sage);color:#fff;border:none;cursor:pointer">🎤</button>
      <div id="plateau-voice-status" style="font-size:12px;color:var(--text-muted);margin-top:8px"></div>
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <a id="plateau-type-link" href="#" style="font-size:13px;color:var(--text-muted)">type instead</a>
    </div>
    <textarea id="plateau-reflection-input" class="form-input" rows="3" placeholder="Write your thoughts here…" style="display:none;width:100%;box-sizing:border-box"></textarea>
    <button class="btn btn-primary btn-full mt-8" id="plateau-next-btn" style="display:none">Next</button>
  `;

  const micBtn     = body.querySelector('#plateau-mic-btn');
  const typeLink   = body.querySelector('#plateau-type-link');
  const textarea   = body.querySelector('#plateau-reflection-input');
  const nextBtn    = body.querySelector('#plateau-next-btn');
  const statusEl   = body.querySelector('#plateau-voice-status');
  let   reflection = '';

  body.querySelector('#plateau-skip-btn').addEventListener('click', () => {
    markPlateauCheckinDone();
    closeModal();
  });

  micBtn.addEventListener('click', () => {
    startVoiceInput({ set value(v) { reflection = v; statusEl.textContent = v ? `"${v.slice(0,60)}…"` : ''; nextBtn.style.display = reflection ? '' : 'none'; } });
  });

  typeLink.addEventListener('click', e => {
    e.preventDefault();
    textarea.style.display = '';
    nextBtn.style.display  = '';
    typeLink.style.display = 'none';
    micBtn.style.display   = 'none';
    textarea.focus();
  });

  textarea.addEventListener('input', () => { reflection = textarea.value.trim(); });

  nextBtn.addEventListener('click', () => {
    reflection = reflection || textarea.value.trim();
    // Save to this week's notes
    if (reflection) {
      const notes = Store.getWeeklyNotes();
      const wsKey = dateStr(getWeekStart());
      const label = `Plateau check-in — ${todayStr()}`;
      const existing = notes[wsKey] || '';
      notes[wsKey] = existing ? `${existing}\n\n${label}\n${reflection}` : `${label}\n${reflection}`;
      Store.saveWeeklyNotes(notes);
    }
    _plateauStep3(body);
  });
}

function _plateauStep3(body) {
  const options = [
    { id: 'busy',    label: 'Life got busy or stressful' },
    { id: 'motiv',   label: "I've lost motivation" },
    { id: 'right',   label: "I'm doing everything right but nothing's moving" },
    { id: 'slipped', label: 'My habits have slipped and I know it' },
    { id: 'unsure',  label: "I'm not sure" },
  ];
  body.innerHTML = `
    <div class="modal-title">What best describes what you're experiencing?</div>
    <div style="margin-top:16px">
      ${options.map(o => `
        <button class="goal-level-opt" data-barrier="${o.id}" style="width:100%;margin-bottom:8px;text-align:left;padding:14px 16px">
          ${escHtml(o.label)}
        </button>`).join('')}
    </div>
  `;
  body.querySelectorAll('.goal-level-opt[data-barrier]').forEach(btn => {
    btn.addEventListener('click', () => _plateauStep4(body, btn.dataset.barrier));
  });
}

function _plateauStep4(body, barrier) {
  const RESPONSES = {
    busy:    'Pick one core habit to protect this week. Just one. Let everything else be bonus.',
    motiv:   'Motivation follows action, not the other way around. Start with your easiest core habit for three days.',
    right:   'Your body is adapting. Try adding one strength session or increasing protein slightly. Give it two more weeks before changing anything else.',
    slipped: 'Pick your two most important core habits and focus only on those this week. Simplify, don\'t abandon.',
    unsure:  'Look at your lowest domain bar. That\'s usually where the answer is.',
  };
  const intentions = [
    'Go to bed earlier',
    'Prep food in advance',
    'Protect one core habit no matter what',
    'Add one strength session',
    'Ask someone for support',
    'Something else',
  ];
  body.innerHTML = `
    <div style="background:var(--card-bg);border-radius:10px;padding:14px 16px;margin-bottom:20px;font-size:14px;line-height:1.5;color:var(--text)">
      ${escHtml(RESPONSES[barrier] || RESPONSES.unsure)}
    </div>
    <div class="modal-title" style="font-size:15px">What's one thing you'll try this week?</div>
    <div style="margin-top:12px" id="plateau-intentions-list">
      ${intentions.map((t, i) => `
        <button class="goal-level-opt" data-idx="${i}" style="width:100%;margin-bottom:8px;text-align:left;padding:12px 16px">
          ${escHtml(t)}
        </button>`).join('')}
    </div>
    <div id="plateau-custom-input-wrap" style="display:none;margin-top:8px">
      <textarea id="plateau-custom-intention" class="form-input" rows="2" placeholder="Describe your intention…" style="width:100%;box-sizing:border-box"></textarea>
      <div style="text-align:center;margin:8px 0">
        <button class="tbundle-mic" id="plateau-intention-mic" style="width:52px;height:52px;font-size:22px;border-radius:50%;background:var(--sage);color:#fff;border:none;cursor:pointer">🎤</button>
      </div>
      <button class="btn btn-primary btn-full" id="plateau-save-custom-btn">Save</button>
    </div>
  `;

  function saveIntention(text) {
    if (text) {
      const notes  = Store.getWeeklyNotes();
      const wsKey  = dateStr(getWeekStart());
      const label  = `Intention — ${todayStr()}`;
      const existing = notes[wsKey] || '';
      notes[wsKey] = existing ? `${existing}\n\n${label}\n${text}` : `${label}\n${text}`;
      Store.saveWeeklyNotes(notes);
    }
    markPlateauCheckinDone();
    closeModal();
    showToast('Check-in saved', 'success');
  }

  body.querySelectorAll('.goal-level-opt[data-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx  = parseInt(btn.dataset.idx);
      const text = intentions[idx];
      if (idx === 5) { // "Something else"
        body.querySelector('#plateau-intentions-list').style.display = 'none';
        body.querySelector('#plateau-custom-input-wrap').style.display = '';
        body.querySelector('#plateau-intention-mic').addEventListener('click', () => {
          const inp = body.querySelector('#plateau-custom-intention');
          startVoiceInput(inp);
        });
        body.querySelector('#plateau-save-custom-btn').addEventListener('click', () => {
          saveIntention(body.querySelector('#plateau-custom-intention').value.trim());
        });
      } else {
        saveIntention(text);
      }
    });
  });
}

/* ─── Feature 6: Sunday Check-In ─────────────────────────────────────────── */

function sundayCheckinDone() {
  const key = 'sunday_checkin_week';
  const ws  = dateStr(getWeekStart());
  return Store.get(key, '') === ws;
}

function markSundayCheckinDone() {
  Store.set('sunday_checkin_week', dateStr(getWeekStart()));
}

function shouldShowSundayCheckin() {
  const today = new Date();
  return today.getDay() === 0 && !sundayCheckinDone() && Store.get('onboarding_complete');
}

function openSundayCheckin() {
  openModal(body => _sundayStep1(body));
}

function _sundayStep1(body) {
  body.innerHTML = `
    <button class="btn btn-outline" id="sunday-skip-btn" style="position:absolute;top:12px;right:16px;padding:4px 12px;font-size:13px">Skip</button>
    <div class="modal-title" style="margin-top:24px">How was your week?</div>
    <div style="display:flex;gap:10px;margin-top:20px;margin-bottom:8px">
      ${[['tough','Tough','😔'],['okay','Okay','😐'],['strong','Strong','💪']].map(([v, l, e]) => `
        <button class="goal-level-opt sunday-week-opt" data-val="${v}" style="flex:1;padding:14px 8px;text-align:center;flex-direction:column">
          <div style="font-size:24px;margin-bottom:4px">${e}</div>
          <div style="font-size:14px;font-weight:500">${l}</div>
        </button>`).join('')}
    </div>
  `;

  body.querySelector('#sunday-skip-btn').addEventListener('click', () => {
    markSundayCheckinDone();
    closeModal();
  });

  body.querySelectorAll('.sunday-week-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.dataset.val;
      // Award 1 pt for completing step 1
      Points.add(1, 'Sunday check-in');
      // Save to notes
      const notes  = Store.getWeeklyNotes();
      const wsKey  = dateStr(getWeekStart());
      const label  = `Weekly check-in — ${todayStr()}`;
      const entry  = `Week felt: ${val.charAt(0).toUpperCase() + val.slice(1)}`;
      const existing = notes[wsKey] || '';
      notes[wsKey] = existing ? `${existing}\n\n${label}\n${entry}` : `${label}\n${entry}`;
      Store.saveWeeklyNotes(notes);
      _sundayStep2(body, wsKey, label, existing ? `${existing}\n\n${label}\n${entry}` : `${label}\n${entry}`);
    });
  });
}

function _sundayStep2(body, wsKey, existingLabel, existingNote) {
  body.innerHTML = `
    <button class="btn btn-outline" id="sunday-skip2-btn" style="position:absolute;top:12px;right:16px;padding:4px 12px;font-size:13px">Skip</button>
    <div class="modal-title" style="margin-top:24px">What will you do differently next week?</div>
    <div style="text-align:center;margin:28px 0">
      <button class="tbundle-mic" id="sunday-mic-btn" style="width:72px;height:72px;font-size:32px;border-radius:50%;background:var(--sage);color:#fff;border:none;cursor:pointer">🎤</button>
      <div id="sunday-voice-status" style="font-size:12px;color:var(--text-muted);margin-top:8px"></div>
    </div>
    <div style="text-align:center;margin-bottom:12px">
      <a id="sunday-type-link" href="#" style="font-size:13px;color:var(--text-muted)">type instead</a>
    </div>
    <textarea id="sunday-reflection-input" class="form-input" rows="3" placeholder="Write your thoughts here…" style="display:none;width:100%;box-sizing:border-box"></textarea>
    <button class="btn btn-primary btn-full mt-8" id="sunday-save-btn" style="display:none">Done — save my check-in</button>
  `;

  let reflection = '';
  const statusEl = body.querySelector('#sunday-voice-status');
  const textarea = body.querySelector('#sunday-reflection-input');
  const saveBtn  = body.querySelector('#sunday-save-btn');

  body.querySelector('#sunday-skip2-btn').addEventListener('click', () => {
    markSundayCheckinDone();
    closeModal();
    showToast('+1 pt for your check-in', 'success');
  });

  body.querySelector('#sunday-mic-btn').addEventListener('click', () => {
    startVoiceInput({ set value(v) {
      reflection = v;
      statusEl.textContent = v ? `"${v.slice(0, 60)}${v.length > 60 ? '…' : ''}"` : '';
      saveBtn.style.display = reflection ? '' : 'none';
    }});
  });

  body.querySelector('#sunday-type-link').addEventListener('click', e => {
    e.preventDefault();
    textarea.style.display   = '';
    saveBtn.style.display    = '';
    body.querySelector('#sunday-type-link').style.display = 'none';
    body.querySelector('#sunday-mic-btn').style.display   = 'none';
    textarea.focus();
  });

  textarea.addEventListener('input', () => { reflection = textarea.value.trim(); });

  saveBtn.addEventListener('click', () => {
    reflection = reflection || textarea.value.trim();
    if (reflection) {
      const notes = Store.getWeeklyNotes();
      const note  = notes[wsKey] || '';
      notes[wsKey] = note ? `${note}\n\nNext week: ${reflection}` : `Next week: ${reflection}`;
      Store.saveWeeklyNotes(notes);
    }
    // Award 2 more points (total 3 for completing both steps)
    Points.add(2, 'Sunday check-in completion');
    markSundayCheckinDone();
    closeModal();
    celebrate('✨', 'Check-in complete. +3 pts.');
  });
}

/* ─── Retroactive Logging ─────────────────────────────────────────────────── */

function openRetroDatePicker() {
  openModal(body => {
    const today = new Date();
    const options = [];
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const ds = dateStr(d);
      const checked = Store.getHabits(ds);
      const habits  = Store.getHabitDefs().filter(h => h.enabled !== false);
      const doneCount = habits.filter(h => checked[h.id]).length;
      const label = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;
      options.push({ ds, label, doneCount, total: habits.length });
    }

    body.innerHTML = `
      <div class="modal-title">Log a Past Day</div>
      <p class="text-small text-muted mb-12">Select a day to log habits for:</p>
      <div class="retro-date-list">
        ${options.map(o => `
          <button class="retro-date-btn" data-date="${o.ds}">
            <span class="retro-date-label">${o.label}</span>
            <span class="retro-date-count">${o.doneCount > 0 ? `${o.doneCount}/${o.total} logged` : 'Nothing logged'}</span>
          </button>
        `).join('')}
      </div>
    `;

    body.querySelectorAll('.retro-date-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openRetroChecklist(btn.dataset.date);
      });
    });
  });
}

function openRetroChecklist(retroDate) {
  openModal(body => {
    const habits  = Store.getHabitDefs().filter(h => h.enabled !== false);
    const checked = Store.getHabits(retroDate);

    const d = parseDate(retroDate);
    const dayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const dateLabel = `${dayNames[d.getDay()]}, ${monthNames[d.getMonth()]} ${d.getDate()}`;

    const CORE_IDS = CORE_HABIT_IDS;

    let listHtml = '';
    // Core habits
    const coreHabits  = habits.filter(h => CORE_IDS.includes(h.id));
    const bonusHabits = habits.filter(h => !CORE_IDS.includes(h.id));

    if (coreHabits.length) {
      listHtml += `<div class="retro-section-label">Daily Commitments</div>`;
      coreHabits.forEach(h => {
        listHtml += `
          <label class="retro-habit-row ${checked[h.id] ? 'checked' : ''}">
            <input type="checkbox" data-habit="${h.id}" data-pts="${h.points}" ${checked[h.id] ? 'checked' : ''}>
            <span class="retro-habit-label">${escHtml(h.label)}</span>
            <span class="retro-habit-pts">${h.points}pt${h.points > 1 ? 's' : ''}</span>
          </label>`;
      });
    }

    const pillars = ['sleep','nutrition','movement','stress'];
    pillars.forEach(pillar => {
      const ph = bonusHabits.filter(h => h.pillar === pillar);
      if (!ph.length) return;
      const meta = PILLAR_META[pillar];
      listHtml += `<div class="retro-section-label">${meta.label}</div>`;
      ph.forEach(h => {
        listHtml += `
          <label class="retro-habit-row ${checked[h.id] ? 'checked' : ''}">
            <input type="checkbox" data-habit="${h.id}" data-pts="${h.points}" ${checked[h.id] ? 'checked' : ''}>
            <span class="retro-habit-label">${escHtml(h.label)}</span>
            <span class="retro-habit-pts">${h.points}pt${h.points > 1 ? 's' : ''}</span>
          </label>`;
      });
    });

    body.innerHTML = `
      <div class="modal-title">${dateLabel}</div>
      <p class="text-small text-muted mb-12">Check off everything you did that day. Points will be awarded for new check-ins.</p>
      <div class="retro-habit-list">${listHtml}</div>
      <button class="btn btn-primary btn-full mt-16" id="retro-save-btn">Save</button>
    `;

    // Toggle checked styling live
    body.querySelectorAll('.retro-habit-row input[type=checkbox]').forEach(cb => {
      cb.addEventListener('change', () => {
        cb.closest('.retro-habit-row').classList.toggle('checked', cb.checked);
      });
    });

    body.querySelector('#retro-save-btn').addEventListener('click', () => {
      const prevChecked = Store.getHabits(retroDate);
      const newChecked  = { ...prevChecked };
      let ptsEarned = 0;

      body.querySelectorAll('.retro-habit-row input[type=checkbox]').forEach(cb => {
        const hid = cb.dataset.habit;
        const pts = parseInt(cb.dataset.pts) || 1;
        if (cb.checked && !prevChecked[hid]) {
          // Newly checked — award points
          newChecked[hid] = true;
          Points.add(pts, `Retro: ${hid} (${retroDate})`);
          ptsEarned += pts;
        } else if (!cb.checked && prevChecked[hid]) {
          // Unchecked retroactively — deduct
          delete newChecked[hid];
          Points.deduct(pts, `Retro uncheck: ${hid} (${retroDate})`);
        }
      });

      Store.saveHabits(retroDate, newChecked);
      Streak.recompute();
      closeModal();
      updatePointsBadge();
      if (currentScreen === 'today') renderToday();
      if (currentScreen === 'week') renderWeek();

      if (ptsEarned > 0) {
        showToast(`+${ptsEarned} pt${ptsEarned !== 1 ? 's' : ''} logged for ${dateLabel}`, 'success');
      } else {
        showToast('Day updated');
      }
    });
  });
}

/* ─── Navigation ─────────────────────────────────────────────────────────── */

let currentScreen = 'today';
let weightChart = null;
let viewingDate = todayStr();

function registerChartPlugins() {
  if (typeof Chart !== 'undefined' && typeof ChartAnnotation !== 'undefined') {
    try { Chart.register(ChartAnnotation); } catch {}
  }
}

function navigate(screen) {
  if (screen !== 'today') {
    viewingDate = todayStr();
    Store.set('date_strip_week_offset', 0);
  }

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
  if (['today','week','exercise','progress'].includes(screen)) {
    showHintIfNeeded(screen);
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
  const s = Store.getSettings();
  const pool = s.mode === 'maintenance' ? MAINTENANCE_MESSAGES : MOTIVATIONAL_MESSAGES;
  return pool[day % pool.length];
}

function updatePointsBadge() {
  const el = document.getElementById('points-badge');
  if (!el) return;
  const pts = Points.todayTotal();
  el.textContent = pts > 0 ? `${pts} pts today` : '';
}

/* ─── Habit Rationale Tooltip ────────────────────────────────────────────── */

const HABIT_RATIONALE_BF = {
  nutr_water:    "Breastfeeding increases your fluid needs and dehydration can affect milk supply. It also tends to feel a lot like hunger.",
  nutr_breakfast:"Breastfeeding adds roughly 25g to your daily protein needs. A strong breakfast makes a real dent in that.",
};

function showRationale(habitId, label) {
  const bf   = Store.getSettings().breastfeeding;
  const text = (bf && HABIT_RATIONALE_BF[habitId]) || HABIT_RATIONALE[habitId];
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

/* ─── Notifications Module ────────────────────────────────────────────────── */

const Notifications = {
  _timer: null,

  async requestPermission() {
    if (!('Notification' in window)) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    try { return await Notification.requestPermission(); }
    catch { return 'unsupported'; }
  },

  isBlocked() {
    return 'Notification' in window && Notification.permission === 'denied';
  },

  async show(title, body) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return false;
    const opts = {
      body,
      icon: './apple-touch-icon.png',
      badge: './apple-touch-icon.png',
      tag: `bloom-${title}-${body}`.slice(0, 120),
    };
    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready.catch(() => null);
        if (reg) { await reg.showNotification(title, opts); return true; }
      }
      new Notification(title, opts);
      return true;
    } catch {
      return false;
    }
  },

  async sendTest() {
    if (!('Notification' in window)) {
      showToast('Notifications are not supported in this browser.');
      return false;
    }
    const perm = await this.requestPermission();
    if (perm !== 'granted') {
      showToast(perm === 'denied'
        ? 'Notifications are blocked. Enable them in your device settings for this site.'
        : 'Permission not granted.', '');
      return false;
    }
    // Fire via service worker (required on mobile)
    try {
      const reg = await navigator.serviceWorker.ready.catch(() => null);
      if (reg) {
        await reg.showNotification('Bloom', {
          body: 'Notifications are working.',
          icon: './apple-touch-icon.png',
          badge: './apple-touch-icon.png',
          tag: 'bloom-test',
        });
        showToast('Notification sent -- check your lock screen if the app is open.', 'success');
        this.schedule();
        return true;
      }
    } catch(err) {
      // fall through to inline Notification
    }
    // Fallback: inline Notification (desktop)
    try {
      new Notification('Bloom', { body: 'Notifications are working.', icon: './apple-touch-icon.png' });
      showToast('Test notification sent.', 'success');
    } catch {
      showToast('Could not send notification. Check browser notification permissions.', '');
    }
    this.schedule();
    return true;
  },

  _candidateTime(hour, minute = 0, dayOfWeek = null) {
    const now = new Date();
    const d = new Date(now);
    d.setHours(hour, minute, 0, 0);
    if (dayOfWeek !== null) {
      const diff = (dayOfWeek - d.getDay() + 7) % 7;
      d.setDate(d.getDate() + diff);
    }
    if (d <= now) d.setDate(d.getDate() + (dayOfWeek === null ? 1 : 7));
    return d;
  },

  schedule() {
    clearTimeout(this._timer);
    this._timer = null;

    const s = Store.getSettings();
    if (!s.featNotifications || !('Notification' in window) || Notification.permission !== 'granted') return;

    const candidates = [];
    if (s.notifStreakProtection) candidates.push(this._candidateTime(19));
    if (s.notifWeighIn) candidates.push(this._candidateTime(9, 0, 0));
    if (s.notifBedtime) candidates.push(this._candidateTime(22));
    if (s.notifMorningCheckin && s.notifMorningTime) {
      const [h, m] = s.notifMorningTime.split(':').map(Number);
      if (!isNaN(h)) candidates.push(this._candidateTime(h, isNaN(m) ? 0 : m));
    }
    if (!candidates.length) return;

    const next = candidates.sort((a, b) => a - b)[0];
    const delay = Math.max(1000, Math.min(next - new Date(), 2147483647));
    this._timer = setTimeout(async () => {
      await this.checkPending();
      this.schedule();
    }, delay);
  },

  // Called on app open and visibility change — fires any pending notifications for today
  async checkPending() {
    const s = Store.getSettings();
    if (!s.featNotifications) return;
    const now   = new Date();
    const hour  = now.getHours();
    const min   = now.getMinutes();
    const today = todayStr();
    const fired = Store.get('notif_fired_' + today, {});

    // Streak protection — 7pm
    if (s.notifStreakProtection && !fired.streakProtection && hour >= 19) {
      const streak = Streak.recompute();
      if (streak.current > 0) {
        const { done: coreDone } = Streak.getCoreProgress(today);
        if (coreDone < 5) {
          if (await this.show('Bloom', `Your ${streak.current}-day streak is on the line. You've got time.`)) {
            fired.streakProtection = true;
          }
        }
      }
    }

    // Weigh-in reminder — Sunday 9am
    if (s.notifWeighIn && !fired.weighIn && now.getDay() === 0 && hour >= 9) {
      const ws  = dateStr(getWeekStart());
      const has = Store.getWeighIns().some(w => w.date >= ws);
      if (!has) {
        if (await this.show('Bloom', "Weekly weigh-in -- log it while you're thinking about it.")) {
          fired.weighIn = true;
        }
      }
    }

    // Bedtime nudge — 10pm
    if (s.notifBedtime && !fired.bedtime && hour >= 22) {
      const checked = Store.getHabits(today);
      if (!checked['sleep_bed']) {
        if (await this.show('Bloom', "Bedtime habit -- 30 minutes to your target.")) {
          fired.bedtime = true;
        }
      }
    }

    // Morning check-in — user-set time
    if (s.notifMorningCheckin && !fired.morningCheckin && s.notifMorningTime) {
      const [th, tm] = s.notifMorningTime.split(':').map(Number);
      if (hour > th || (hour === th && min >= tm)) {
        if (await this.show('Bloom', "How's your morning going? Log your habits.")) {
          fired.morningCheckin = true;
        }
      }
    }

    if (Object.keys(fired).length) Store.set('notif_fired_' + today, fired);
  },
};

/* ─── Web Push Module ──────────────────────────────────────────────────────── */

const Push = {
  isConfigured() {
    return !!(VAPID_PUBLIC_KEY && PUSH_WORKER_URL);
  },

  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  },

  getEndpoint() { return localStorage.getItem('bloom_push_endpoint') || null; },
  setEndpoint(endpoint) {
    if (endpoint) localStorage.setItem('bloom_push_endpoint', endpoint);
    else localStorage.removeItem('bloom_push_endpoint');
  },

  hasEnabledPrefs(settings = Store.getSettings()) {
    return !!(
      settings.featNotifications &&
      (settings.notifStreakProtection || settings.notifWeighIn ||
       settings.notifBedtime || settings.notifMorningCheckin)
    );
  },

  _vapidKey() {
    const base64 = VAPID_PUBLIC_KEY.replace(/-/g, '+').replace(/_/g, '/');
    const pad = '='.repeat((4 - base64.length % 4) % 4);
    const raw = atob(base64 + pad);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes;
  },

  _prefsFromSettings(settings) {
    return {
      streakProtection: !!settings.notifStreakProtection,
      weighIn: !!settings.notifWeighIn,
      bedtime: !!settings.notifBedtime,
      morningCheckin: !!settings.notifMorningCheckin,
      morningTime: settings.notifMorningTime || '08:00',
      tzOffset: -new Date().getTimezoneOffset(),
    };
  },

  async subscribe() {
    if (!this.isConfigured() || !this.isSupported()) return false;
    try {
      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this._vapidKey(),
        });
      }

      this.setEndpoint(sub.endpoint);
      const response = await fetch(`${PUSH_WORKER_URL}/push/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub.toJSON(),
          prefs: this._prefsFromSettings(Store.getSettings()),
        }),
      });
      if (!response.ok) throw new Error(`Push subscribe failed: ${response.status}`);
      return true;
    } catch (err) {
      console.error('Push subscribe failed:', err);
      return false;
    }
  },

  async updatePrefs() {
    const endpoint = this.getEndpoint();
    if (!this.isConfigured() || !endpoint) return;
    fetch(`${PUSH_WORKER_URL}/push/update-prefs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint,
        prefs: this._prefsFromSettings(Store.getSettings()),
      }),
    }).catch(err => console.warn('Push prefs update failed:', err));
  },

  async unsubscribe() {
    const endpoint = this.getEndpoint();
    if (endpoint && this.isConfigured()) {
      fetch(`${PUSH_WORKER_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint }),
      }).catch(() => {});
    }

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) await sub.unsubscribe();
    } catch {}
    this.setEndpoint(null);
  },

  async sendTest() {
    if (!this.isConfigured() || !this.isSupported()) return false;
    if (!this.getEndpoint()) {
      const ok = await this.subscribe();
      if (!ok) return false;
    }

    try {
      const response = await fetch(`${PUSH_WORKER_URL}/push/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: this.getEndpoint() }),
      });
      return response.ok;
    } catch (err) {
      console.warn('Push test failed:', err);
      return false;
    }
  },

  async sync(settings = Store.getSettings(), { subscribeWhenEnabled = false } = {}) {
    if (!this.isConfigured() || !this.isSupported()) return true;
    const anyEnabled = this.hasEnabledPrefs(settings);
    if (!anyEnabled) {
      if (this.getEndpoint()) await this.unsubscribe();
      return true;
    }
    if (subscribeWhenEnabled && !this.getEndpoint()) return this.subscribe();
    if (this.getEndpoint()) await this.updatePrefs();
    return true;
  },
};

/* ─── Sleep Tracking (Feature 2) ─────────────────────────────────────────── */

function calcSleepHours(sleepTime, wakeTime) {
  if (!sleepTime || !wakeTime) return null;
  const [sh, sm] = sleepTime.split(':').map(Number);
  const [wh, wm] = wakeTime.split(':').map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins  = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60; // crossed midnight
  return (wakeMins - sleepMins) / 60;
}

function fmtSleepHours(hrs) {
  if (hrs === null) return '--';
  const h = Math.floor(hrs);
  const m = Math.round((hrs - h) * 60);
  return m > 0 ? `${h} hrs ${m} min` : `${h} hrs`;
}

function renderSleepCard() {
  const s     = Store.getSettings();
  if (!s.featSleepTracking) return '';
  const now   = new Date();
  if (now.getHours() >= 12) return ''; // only show in the morning
  const today = todayStr();
  const logs  = Store.getSleepLogs();
  const entry = logs.find(l => l.date === today);

  // Default sleep time = 30 min after bedtime target
  const [bh, bm] = (s.bedtimeTarget || '22:30').split(':').map(Number);
  const sleepDefault = `${String(bh).padStart(2,'0')}:${String((bm + 30) % 60).padStart(2,'0')}`;
  const wakeDefault  = s.usualWakeTime || '07:00';

  if (entry) {
    const hrs = calcSleepHours(entry.sleepTime, entry.wakeTime);
    return `
      <div class="today-optional-card" id="sleep-card">
        <div class="today-optional-label">last night's sleep</div>
        <div class="sleep-logged-row" id="sleep-logged-summary">
          <span class="sleep-logged-text">Last night: ${fmtSleepHours(hrs)}</span>
          <button class="btn-text-link" id="sleep-edit-btn">Edit</button>
        </div>
        <div class="sleep-inputs hidden" id="sleep-inputs">
          <div class="sleep-input-row">
            <label class="sleep-input-label">Fell asleep around:</label>
            <input type="time" class="settings-row-input" id="sleep-time-input" value="${entry.sleepTime}">
          </div>
          <div class="sleep-input-row">
            <label class="sleep-input-label">Woke up around:</label>
            <input type="time" class="settings-row-input" id="wake-time-input" value="${entry.wakeTime}">
          </div>
          <button class="btn btn-sm btn-primary" id="sleep-save-btn" style="margin-top:8px">Save</button>
        </div>
      </div>`;
  }

  return `
    <div class="today-optional-card" id="sleep-card">
      <div class="today-optional-label">last night's sleep</div>
      <div class="sleep-input-row">
        <label class="sleep-input-label">Fell asleep around:</label>
        <input type="time" class="settings-row-input" id="sleep-time-input" value="${sleepDefault}">
      </div>
      <div class="sleep-input-row">
        <label class="sleep-input-label">Woke up around:</label>
        <input type="time" class="settings-row-input" id="wake-time-input" value="${wakeDefault}">
      </div>
      <button class="btn btn-sm btn-primary" id="sleep-log-btn" style="margin-top:8px">Log sleep</button>
    </div>`;
}

function bindSleepCard(screen) {
  const today = todayStr();

  screen.querySelector('#sleep-log-btn')?.addEventListener('click', () => {
    const st = screen.querySelector('#sleep-time-input')?.value;
    const wt = screen.querySelector('#wake-time-input')?.value;
    if (!st || !wt) return;
    const logs = Store.getSleepLogs().filter(l => l.date !== today);
    logs.push({ date: today, sleepTime: st, wakeTime: wt });
    Store.saveSleepLogs(logs);
    Points.add(1, 'Sleep logged');
    updatePointsBadge();
    showToast('+1 pt', 'success');
    refreshTodayOptionalCards(screen);
  });

  screen.querySelector('#sleep-edit-btn')?.addEventListener('click', () => {
    screen.querySelector('#sleep-logged-summary')?.classList.add('hidden');
    screen.querySelector('#sleep-inputs')?.classList.remove('hidden');
  });

  screen.querySelector('#sleep-save-btn')?.addEventListener('click', () => {
    const st = screen.querySelector('#sleep-time-input')?.value;
    const wt = screen.querySelector('#wake-time-input')?.value;
    if (!st || !wt) return;
    const logs = Store.getSleepLogs().filter(l => l.date !== today);
    logs.push({ date: today, sleepTime: st, wakeTime: wt });
    Store.saveSleepLogs(logs);
    showToast('Saved');
    refreshTodayOptionalCards(screen);
  });
}

/* ─── Mood / Energy / Motivation Log (Feature 3) ─────────────────────────── */

function renderMoodCard() {
  const s = Store.getSettings();
  if (!s.featMoodLog) return '';
  const today = todayStr();
  const logs  = Store.getMoodLogs();
  const entry = logs.find(l => l.date === today);

  if (entry) {
    return `
      <div class="today-optional-card" id="mood-card">
        <div class="today-optional-label">daily check-in</div>
        <div class="mood-logged-row">
          <span class="mood-logged-text">Mood ${entry.mood} &nbsp;·&nbsp; Energy ${entry.energy} &nbsp;·&nbsp; Motivation ${entry.motivation}</span>
          <button class="btn-text-link" id="mood-edit-btn">Edit</button>
        </div>
      </div>`;
  }

  return `
    <div class="today-optional-card" id="mood-card">
      <div class="today-optional-label">daily check-in</div>
      <div class="mood-slider-group">
        <div class="mood-slider-row">
          <div class="mood-slider-labels">
            <span class="mood-slider-name">Mood today</span>
            <span class="mood-slider-val" id="mood-val">5</span>
          </div>
          <input type="range" min="0" max="10" value="5" class="mood-range" id="mood-input">
          <div class="mood-anchors"><span>No positive emotions</span><span>Genuinely happy</span></div>
        </div>
        <div class="mood-slider-row">
          <div class="mood-slider-labels">
            <span class="mood-slider-name">Energy today</span>
            <span class="mood-slider-val" id="energy-val">5</span>
          </div>
          <input type="range" min="0" max="10" value="5" class="mood-range" id="energy-input">
          <div class="mood-anchors"><span>Completely exhausted</span><span>Fully energized</span></div>
        </div>
        <div class="mood-slider-row">
          <div class="mood-slider-labels">
            <span class="mood-slider-name">Motivation for health goals today</span>
            <span class="mood-slider-val" id="motivation-val">5</span>
          </div>
          <input type="range" min="0" max="10" value="5" class="mood-range" id="motivation-input">
          <div class="mood-anchors"><span>Couldn't act on goals</span><span>Felt driven</span></div>
        </div>
      </div>
      <button class="btn btn-sm btn-primary" id="mood-log-btn" style="margin-top:12px">Log</button>
    </div>`;
}

function bindMoodCard(screen) {
  const today = todayStr();

  ['mood', 'energy', 'motivation'].forEach(key => {
    const input = screen.querySelector(`#${key}-input`);
    const val   = screen.querySelector(`#${key}-val`);
    if (input && val) input.addEventListener('input', () => { val.textContent = input.value; });
  });

  screen.querySelector('#mood-log-btn')?.addEventListener('click', () => {
    const mood       = parseInt(screen.querySelector('#mood-input')?.value || 5);
    const energy     = parseInt(screen.querySelector('#energy-input')?.value || 5);
    const motivation = parseInt(screen.querySelector('#motivation-input')?.value || 5);
    const logs = Store.getMoodLogs().filter(l => l.date !== today);
    logs.push({ date: today, mood, energy, motivation, notes: [] });
    Store.saveMoodLogs(logs);
    Points.add(2, 'Check-in logged');
    updatePointsBadge();
    showToast('+2 pts', 'success');
    refreshTodayOptionalCards(screen);
    // MI follow-up prompts
    setTimeout(() => {
      if (mood < 5 || energy < 5) {
        const low  = mood < energy ? { name: 'mood', val: mood } : { name: 'energy', val: energy };
        openMIPrompt(low.name, low.val, motivation);
      } else if (motivation < 5) {
        openMIPrompt('motivation', motivation, null);
      }
    }, 400);
  });

  screen.querySelector('#mood-edit-btn')?.addEventListener('click', () => {
    const logs  = Store.getMoodLogs();
    const entry = logs.find(l => l.date === today);
    if (!entry) return;
    // Re-render card in edit mode
    const card = screen.querySelector('#mood-card');
    if (!card) return;
    card.innerHTML = `
      <div class="today-optional-label">daily check-in</div>
      <div class="mood-slider-group">
        <div class="mood-slider-row">
          <div class="mood-slider-labels"><span class="mood-slider-name">Mood today</span><span class="mood-slider-val" id="mood-val">${entry.mood}</span></div>
          <input type="range" min="0" max="10" value="${entry.mood}" class="mood-range" id="mood-input">
          <div class="mood-anchors"><span>No positive emotions</span><span>Genuinely happy</span></div>
        </div>
        <div class="mood-slider-row">
          <div class="mood-slider-labels"><span class="mood-slider-name">Energy today</span><span class="mood-slider-val" id="energy-val">${entry.energy}</span></div>
          <input type="range" min="0" max="10" value="${entry.energy}" class="mood-range" id="energy-input">
          <div class="mood-anchors"><span>Completely exhausted</span><span>Fully energized</span></div>
        </div>
        <div class="mood-slider-row">
          <div class="mood-slider-labels"><span class="mood-slider-name">Motivation for health goals today</span><span class="mood-slider-val" id="motivation-val">${entry.motivation}</span></div>
          <input type="range" min="0" max="10" value="${entry.motivation}" class="mood-range" id="motivation-input">
          <div class="mood-anchors"><span>Couldn't act on goals</span><span>Felt driven</span></div>
        </div>
      </div>
      <button class="btn btn-sm btn-primary" id="mood-save-edit-btn" style="margin-top:12px">Save</button>
    `;
    ['mood', 'energy', 'motivation'].forEach(key => {
      const inp = card.querySelector(`#${key}-input`);
      const vl  = card.querySelector(`#${key}-val`);
      if (inp && vl) inp.addEventListener('input', () => { vl.textContent = inp.value; });
    });
    card.querySelector('#mood-save-edit-btn')?.addEventListener('click', () => {
      const mood       = parseInt(card.querySelector('#mood-input')?.value || 5);
      const energy     = parseInt(card.querySelector('#energy-input')?.value || 5);
      const motivation = parseInt(card.querySelector('#motivation-input')?.value || 5);
      const ls = Store.getMoodLogs().filter(l => l.date !== today);
      ls.push({ date: today, mood, energy, motivation, notes: entry.notes || [] });
      Store.saveMoodLogs(ls);
      showToast('Saved');
      refreshTodayOptionalCards(screen);
    });
  });
}

function openMIPrompt(dimension, value, motivationValue) {
  openModal(body => {
    const isMotivation = dimension === 'motivation';
    const q1 = isMotivation
      ? `What's keeping your motivation at ${value} and not lower?`
      : `You rated ${dimension} a ${value}. What would need to change to get to ${value + 2}?`;
    body.innerHTML = `
      <div class="modal-title">One quick question</div>
      <p class="modal-desc" style="margin-bottom:14px">${escHtml(q1)}</p>
      <textarea id="mi-response-1" class="mi-textarea" rows="3" placeholder="Type here, or skip..."></textarea>
      <button class="btn btn-sm" id="mi-voice-btn" style="margin-top:6px;margin-bottom:2px;display:flex;align-items:center;gap:6px">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
        Use voice
      </button>
      <div style="display:flex;justify-content:space-between;margin-top:12px">
        <button class="btn btn-sm btn-outline" id="mi-skip-btn">Skip</button>
        <button class="btn btn-sm btn-primary" id="mi-next-btn">${isMotivation ? 'Next' : 'Done'}</button>
      </div>`;

    body.querySelector('#mi-voice-btn')?.addEventListener('click', () => startVoiceInput(body.querySelector('#mi-response-1')));
    body.querySelector('#mi-skip-btn')?.addEventListener('click', closeModal);
    body.querySelector('#mi-next-btn')?.addEventListener('click', () => {
      const resp1 = body.querySelector('#mi-response-1')?.value || '';
      if (isMotivation && resp1.trim()) {
        // Second question
        const q2 = `What would need to change to get to ${value + 2}?`;
        body.innerHTML = `
          <div class="modal-title">One more question</div>
          <p class="modal-desc" style="margin-bottom:14px">${escHtml(q2)}</p>
          <textarea id="mi-response-2" class="mi-textarea" rows="3" placeholder="Type here, or skip..."></textarea>
          <button class="btn btn-sm" id="mi-voice-btn-2" style="margin-top:6px;margin-bottom:2px;display:flex;align-items:center;gap:6px">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
            Use voice
          </button>
          <div style="display:flex;justify-content:space-between;margin-top:12px">
            <button class="btn btn-sm btn-outline" id="mi-skip-2-btn">Skip</button>
            <button class="btn btn-sm btn-primary" id="mi-done-btn">Done</button>
          </div>`;
        body.querySelector('#mi-voice-btn-2')?.addEventListener('click', () => startVoiceInput(body.querySelector('#mi-response-2')));
        body.querySelector('#mi-skip-2-btn')?.addEventListener('click', closeModal);
        body.querySelector('#mi-done-btn')?.addEventListener('click', () => {
          const resp2 = body.querySelector('#mi-response-2')?.value || '';
          saveMINote([resp1, resp2].filter(Boolean));
          closeModal();
        });
      } else {
        if (resp1.trim()) saveMINote([resp1]);
        closeModal();
      }
    });
  });
}

function saveMINote(responses) {
  const today = todayStr();
  const logs  = Store.getMoodLogs();
  const idx   = logs.findIndex(l => l.date === today);
  if (idx === -1) return;
  logs[idx].notes = [...(logs[idx].notes || []), ...responses];
  Store.saveMoodLogs(logs);
}

/* ─── Progress Photos (Feature 4) ────────────────────────────────────────── */

function isFirstOfMonth() {
  return new Date().getDate() === 1;
}

function renderPhotoPromptCard() {
  const s = Store.getSettings();
  if (!s.featProgressPhotos) return '';
  const today    = todayStr();
  const month    = today.slice(0, 7); // YYYY-MM
  const photos   = Store.getProgressPhotos();
  const hasPhoto = photos.some(p => p.date.startsWith(month));
  const dismissed = Store.get('photo_prompt_dismissed_' + month, false);
  if (hasPhoto || dismissed || !isFirstOfMonth()) return '';

  return `
    <div class="today-optional-card" id="photo-prompt-card">
      <div class="today-optional-label">monthly progress</div>
      <p class="optional-card-text">Time for your monthly progress photo.</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
        <button class="btn btn-sm btn-primary" id="photo-take-btn">Take photo</button>
        <button class="btn-text-link" id="photo-skip-btn">Skip this month</button>
      </div>
    </div>`;
}

function bindPhotoPromptCard(screen) {
  const month = todayStr().slice(0, 7);

  screen.querySelector('#photo-take-btn')?.addEventListener('click', () => {
    openPhotoCapture();
  });

  screen.querySelector('#photo-skip-btn')?.addEventListener('click', () => {
    Store.set('photo_prompt_dismissed_' + month, true);
    refreshTodayOptionalCards(screen);
  });
}

function openPhotoCapture() {
  const s        = Store.getSettings();
  const hasSeenDirections = Store.get('photo_directions_seen', false);

  const showCamera = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'user';
    input.onchange = e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        compressPhoto(ev.target.result, dataUrl => {
          const today  = todayStr();
          const month  = today.slice(0, 7);
          const photos = Store.getProgressPhotos().filter(p => !p.date.startsWith(month));
          photos.push({ date: today, dataUrl });
          Store.saveProgressPhotos(photos);
          showToast('Saved. See it in Progress.', 'success');
          const screen = document.getElementById('screen-today');
          refreshTodayOptionalCards(screen);
        });
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  if (!hasSeenDirections) {
    openModal(body => {
      body.innerHTML = `
        <div class="modal-title">For photos you can actually compare</div>
        <ul class="photo-directions-list">
          <li>Stand against the same plain wall each time</li>
          <li>Same distance from the camera</li>
          <li>Morning, before eating, is most consistent</li>
          <li>Same or similar clothing</li>
        </ul>
        <button class="btn btn-primary" id="photo-directions-ok" style="margin-top:16px;width:100%">Got it</button>`;
      body.querySelector('#photo-directions-ok')?.addEventListener('click', () => {
        Store.set('photo_directions_seen', true);
        closeModal();
        showCamera();
      });
    });
  } else {
    showCamera();
  }
}

function compressPhoto(dataUrl, cb) {
  const img = new Image();
  img.onload = () => {
    const MAX = 800;
    let w = img.width, h = img.height;
    if (w > MAX || h > MAX) {
      if (w > h) { h = Math.round(h * MAX / w); w = MAX; }
      else       { w = Math.round(w * MAX / h); h = MAX; }
    }
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
    cb(canvas.toDataURL('image/jpeg', 0.75));
  };
  img.src = dataUrl;
}

/* ─── Measurement Tracking (Feature 5) ────────────────────────────────────── */

const MEASUREMENT_POINTS = [
  { id: 'waist',      label: 'Waist',       cx: 150, cy: 200 },
  { id: 'hips',       label: 'Hips',        cx: 150, cy: 240 },
  { id: 'chest',      label: 'Chest',       cx: 150, cy: 155 },
  { id: 'leftArm',    label: 'Left arm',    cx: 105, cy: 170 },
  { id: 'rightArm',   label: 'Right arm',   cx: 195, cy: 170 },
  { id: 'leftThigh',  label: 'Left thigh',  cx: 120, cy: 295 },
  { id: 'rightThigh', label: 'Right thigh', cx: 180, cy: 295 },
];

function renderMeasurementPromptCard() {
  const s = Store.getSettings();
  if (!s.featMeasurements) return '';
  const today        = todayStr();
  const month        = today.slice(0, 7);
  const measurements = Store.getMeasurements();
  const hasMeasure   = measurements.some(m => m.date.startsWith(month));
  const dismissed    = Store.get('measure_prompt_dismissed_' + month, false);
  if (hasMeasure || dismissed || !isFirstOfMonth()) return '';

  return `
    <div class="today-optional-card" id="measure-prompt-card">
      <div class="today-optional-label">monthly measurements</div>
      <p class="optional-card-text">Time for monthly measurements.</p>
      <div style="display:flex;align-items:center;gap:12px;margin-top:10px">
        <button class="btn btn-sm btn-primary" id="measure-log-btn">Log measurements</button>
        <button class="btn-text-link" id="measure-skip-btn">Skip this month</button>
      </div>
    </div>`;
}

function bindMeasurementPromptCard(screen) {
  const month = todayStr().slice(0, 7);

  screen.querySelector('#measure-log-btn')?.addEventListener('click', () => {
    openMeasurementModal();
  });

  screen.querySelector('#measure-skip-btn')?.addEventListener('click', () => {
    Store.set('measure_prompt_dismissed_' + month, true);
    refreshTodayOptionalCards(screen);
  });
}

function openMeasurementModal() {
  const s = Store.getSettings();
  if (!s.measurementsSetupDone) {
    openMeasurementSetup(() => openMeasurementModal());
    return;
  }

  const hasSeenInstructions = Store.get('measure_instructions_seen', false);
  const showForm = () => openModal(renderMeasurementForm);

  if (!hasSeenInstructions) {
    openModal(body => {
      body.innerHTML = `
        <div class="modal-title">For consistent measurements</div>
        <ul class="photo-directions-list">
          <li>Measure at the same time of day (morning is most consistent)</li>
          <li>Stand naturally, don't flex or hold your breath</li>
          <li>Measure at the same point each time (e.g. narrowest point for waist)</li>
        </ul>
        <button class="btn btn-primary" id="measure-instructions-ok" style="margin-top:16px;width:100%">Got it</button>`;
      body.querySelector('#measure-instructions-ok')?.addEventListener('click', () => {
        Store.set('measure_instructions_seen', true);
        closeModal();
        showForm();
      });
    });
  } else {
    showForm();
  }
}

function openMeasurementSetup(onDone) {
  openModal(body => {
    const all = MEASUREMENT_POINTS;
    const s   = Store.getSettings();
    const tracked = s.trackedMeasurements || ['waist', 'hips'];
    body.innerHTML = `
      <div class="modal-title">Which measurements to track?</div>
      <p class="modal-desc" style="margin-bottom:14px">You can change these anytime in Settings.</p>
      <div class="measure-setup-list">
        ${all.map(mp => `
          <label class="measure-setup-item">
            <span>${mp.label}</span>
            <input type="checkbox" data-id="${mp.id}" ${tracked.includes(mp.id) ? 'checked' : ''}>
          </label>`).join('')}
      </div>
      <button class="btn btn-primary" id="measure-setup-done" style="margin-top:16px;width:100%">Save</button>`;
    body.querySelector('#measure-setup-done')?.addEventListener('click', () => {
      const selected = [...body.querySelectorAll('input[type=checkbox]:checked')].map(el => el.dataset.id);
      const ns = Store.getSettings();
      ns.trackedMeasurements = selected;
      ns.measurementsSetupDone = true;
      Store.saveSettings(ns);
      closeModal();
      if (onDone) onDone();
    });
  });
}

function renderMeasurementForm(body) {
  const s       = Store.getSettings();
  const tracked = (s.trackedMeasurements || []).map(id => MEASUREMENT_POINTS.find(mp => mp.id === id)).filter(Boolean);
  const today   = todayStr();
  const existing = Store.getMeasurements().find(m => m.date === today) || {};

  body.innerHTML = `
    <div class="modal-title">Log Measurements</div>
    <div class="measure-body-svg-wrap">
      ${buildBodySvg(tracked)}
    </div>
    <div class="measure-inputs">
      ${tracked.map(mp => `
        <div class="measure-input-row">
          <label class="measure-input-label">${mp.label} <span class="measure-unit">(inches)</span></label>
          <input type="number" step="0.25" class="settings-row-input" id="measure-${mp.id}" value="${existing[mp.id] || ''}">
        </div>`).join('')}
    </div>
    <button class="btn btn-primary" id="measure-save-btn" style="margin-top:16px;width:100%">Save</button>`;

  body.querySelector('#measure-save-btn')?.addEventListener('click', () => {
    const entry = { date: today };
    tracked.forEach(mp => {
      const val = parseFloat(body.querySelector(`#measure-${mp.id}`)?.value);
      if (!isNaN(val)) entry[mp.id] = val;
    });
    const all = Store.getMeasurements().filter(m => m.date !== today);
    all.push(entry);
    Store.saveMeasurements(all);
    showToast('Measurements saved.', 'success');
    closeModal();
    const screen = document.getElementById('screen-today');
    refreshTodayOptionalCards(screen);
  });
}

function buildBodySvg(tracked) {
  const dots = tracked.map(mp => `
    <circle cx="${mp.cx}" cy="${mp.cy}" r="8" fill="var(--sage)" opacity="0.8"/>
    <text x="${mp.cx}" y="${mp.cy + 4}" text-anchor="middle" font-size="9" fill="white" font-family="sans-serif">${mp.label.split(' ').map(w=>w[0]).join('')}</text>
  `).join('');

  return `
    <svg viewBox="0 0 300 450" width="120" height="180" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:0 auto">
      <!-- Head -->
      <ellipse cx="150" cy="60" rx="28" ry="32" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Neck -->
      <rect x="139" y="90" width="22" height="18" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Torso -->
      <path d="M110,108 L90,108 L85,270 L215,270 L210,108 L190,108 Z" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Left arm -->
      <path d="M90,112 Q70,140 72,200 L88,200 Q86,142 108,116 Z" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Right arm -->
      <path d="M210,112 Q230,140 228,200 L212,200 Q214,142 192,116 Z" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Left leg -->
      <path d="M115,270 L105,380 L130,380 L150,295 Z" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      <!-- Right leg -->
      <path d="M185,270 L195,380 L170,380 L150,295 Z" fill="none" stroke="var(--text-light)" stroke-width="2"/>
      ${dots}
    </svg>`;
}

/* ─── Shared: refresh optional cards on Today screen ─────────────────────── */

function refreshTodayOptionalCards(screen) {
  const wrapper = screen.querySelector('#today-optional-cards');
  if (!wrapper) return;
  wrapper.innerHTML = renderSleepCard() + renderMoodCard() + renderPhotoPromptCard() + renderMeasurementPromptCard();
  bindSleepCard(screen);
  bindMoodCard(screen);
  bindPhotoPromptCard(screen);
  bindMeasurementPromptCard(screen);
}

/* ─── TODAY Screen ───────────────────────────────────────────────────────── */

// Returns number of consecutive days (going back from yesterday) that habit was NOT checked.
// Returns 0 if the app hasn't been running for 7+ days yet (avoids false positives for new users).
// Caps scan at 60 days.
function getNeglectedDays(habitId) {
  const settings = Store.getSettings();
  const appStart = settings.appStartDate || todayStr();
  const appAgeDays = Math.floor((new Date() - parseDate(appStart)) / 86400000);
  if (appAgeDays < 7) return 0; // too new to flag anything as neglected

  let days = 0;
  for (let i = 1; i <= 60; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = dateStr(d);
    if (ds < appStart) break; // don't count days before app was started
    const checkedDay = Store.getHabits(ds);
    if (checkedDay[habitId]) return days; // was checked on this day
    days++;
  }
  return days;
}

function sortHabitsByPoints(habits) {
  return habits
    .map((habit, index) => ({ habit, index }))
    .sort((a, b) => (b.habit.points || 0) - (a.habit.points || 0) || a.index - b.index)
    .map(item => item.habit);
}

function renderDateStrip() {
  const today = todayStr();
  const viewing = viewingDate;
  const weekOffset = Store.get('date_strip_week_offset', 0);
  const anchor = new Date(getWeekStart());
  anchor.setDate(anchor.getDate() + (weekOffset * 7));
  const days = getWeekDays(anchor);
  const dowShort = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const canGoBack = weekOffset > -1;
  const canGoForward = weekOffset < 0;
  const habits = Store.getHabitDefs().filter(h => h.enabled !== false);

  const dayCols = days.map((d, i) => {
    const isPast = d < today;
    const isToday = d === today;
    const isFuture = d > today;
    const isViewing = d === viewing;
    const date = parseDate(d);
    const dayNum = date.getDate();
    const checkedHabits = Store.getHabits(d);
    const hasAnyLogged = habits.some(h => checkedHabits[h.id]);
    let colClass = 'date-strip-col';
    if (isViewing) colClass += ' selected';
    if (isToday) colClass += ' today';
    if (isFuture) colClass += ' disabled';
    if (isPast && hasAnyLogged) colClass += ' has-data';

    return `
      <button class="${colClass}" data-date="${d}" ${isFuture ? 'disabled' : ''} aria-label="${dowShort[i]} ${dayNum}${isToday ? ', today' : ''}${isViewing ? ', selected' : ''}">
        <span class="date-strip-dow">${dowShort[i]}</span>
        <span class="date-strip-num">${dayNum}</span>
        ${(isPast || isToday) && hasAnyLogged ? '<span class="date-strip-dot"></span>' : '<span class="date-strip-dot empty"></span>'}
      </button>
    `;
  }).join('');

  return `
    <div class="date-strip-wrap">
      <button class="date-strip-nav" id="date-strip-back" ${canGoBack ? '' : 'disabled'} aria-label="Previous week">‹</button>
      <div class="date-strip-days" id="date-strip-days">${dayCols}</div>
      <button class="date-strip-nav" id="date-strip-fwd" ${canGoForward ? '' : 'disabled'} aria-label="Next week">›</button>
    </div>
  `;
}

function renderPastDateBanner() {
  if (viewingDate === todayStr()) return '';
  const d = parseDate(viewingDate);
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return `
    <div class="past-date-banner">
      <span class="past-date-banner-label">Logging for ${label}</span>
      <button class="past-date-banner-today" id="go-to-today-btn">Back to today</button>
    </div>
  `;
}

function bindDateStrip(screen) {
  screen.querySelectorAll('.date-strip-col:not(.disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const d = btn.dataset.date;
      if (!d) return;
      viewingDate = d;
      renderToday();
    });
  });
  screen.querySelector('#date-strip-back')?.addEventListener('click', () => {
    const current = Store.get('date_strip_week_offset', 0);
    if (current > -1) {
      Store.set('date_strip_week_offset', current - 1);
      renderToday();
    }
  });
  screen.querySelector('#date-strip-fwd')?.addEventListener('click', () => {
    const current = Store.get('date_strip_week_offset', 0);
    if (current < 0) {
      Store.set('date_strip_week_offset', current + 1);
      if (current + 1 === 0) viewingDate = todayStr();
      renderToday();
    }
  });
  screen.querySelector('#go-to-today-btn')?.addEventListener('click', () => {
    viewingDate = todayStr();
    Store.set('date_strip_week_offset', 0);
    renderToday();
  });
}

function buildHabitItemHtml(habit, checked, isCore, bundleEntry, isPromptActive, neglectDays) {
  const id            = habit.id;
  const isChecked     = !!checked[id];
  const labelText     = `${habit.label}${habit.retroactive ? ' (for last night)' : ''}`;
  const detailId      = `habit-detail-${id}`;
  const bundleNote    = bundleEntry?.note    || null;
  const bundleSkipped = bundleEntry?.skipped || false;
  const extra         = habit.retroactive ? '<span class="text-small text-muted"> (for last night)</span>' : '';
  const workoutTag    = habit.opensWorkout && !habit.priority ? '<span class="habit-badge">Logs workout</span>' : '';
  const coreDot       = isCore
    ? '<span class="core-dot core-dot-filled" aria-hidden="true">●</span>'
    : '<span class="core-dot core-dot-empty"  aria-hidden="true">○</span>';

  // Detail panel content (rationale + bundle note + core tag)
  const bf          = Store.getSettings().breastfeeding;
  const rationale   = (bf && HABIT_RATIONALE_BF[id]) || HABIT_RATIONALE[id] || '';
  const noteHtml    = bundleNote ? `<p class="bundle-note-display">${escHtml(bundleNote)}</p>` : '';
  const rationaleHtml = rationale ? `<p class="habit-detail-rationale">${escHtml(rationale)}</p>` : '';
  const coreTagHtml = isCore ? `<p class="habit-detail-core">Core commitment</p>` : '';
  // hasDetail superseded by hasDetailFinal below (after neglect check)

  // Bundle prompt card — always rendered for eligible habits (CSS hides; has-prompt class shows)
  const promptQ         = TBUNDLE_PROMPTS[id];
  const eligiblePrompt  = promptQ && !bundleNote && !bundleSkipped;
  const promptHtml      = eligiblePrompt ? `
    <div class="tbundle-prompt">
      <p class="tbundle-question">${escHtml(promptQ)}</p>
      <div class="tbundle-input-row">
        <input class="tbundle-text" type="text" placeholder="Type here…" autocomplete="off" maxlength="120">
        <button class="tbundle-mic" type="button" title="Voice input">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      </div>
      <button class="tbundle-skip-btn" type="button">Skip</button>
    </div>` : '';

  // Neglect indicator
  const isNeglected = (neglectDays || 0) >= 7 && !isChecked;
  const neglectHtml  = isNeglected
    ? `<p class="habit-detail-neglect">You haven't done this in ${neglectDays} day${neglectDays !== 1 ? 's' : ''}.</p>`
    : '';
  const hasDetailFinal = !!(bundleNote || rationale || isCore || isNeglected);

  const itemCls = ['habit-item', isChecked ? 'checked' : '', isPromptActive ? 'has-prompt' : '', isNeglected ? 'habit-neglected' : '']
    .filter(Boolean).join(' ');

  return `
    <div class="${itemCls}" data-habit="${id}" data-opens-workout="${habit.opensWorkout}" data-priority="${habit.priority}">
      <div class="habit-main-row">
        ${coreDot}
        <button class="habit-check-zone" type="button" role="checkbox" aria-checked="${isChecked}" aria-label="${isChecked ? 'Mark incomplete' : 'Mark complete'}: ${escHtml(labelText)}"><div class="habit-check" aria-hidden="true"></div></button>
        <button class="habit-tap-zone" type="button" ${hasDetailFinal ? `aria-expanded="false" aria-controls="${detailId}"` : ''}>
          <div class="habit-text">${escHtml(habit.label)}${extra}</div>
          ${workoutTag}
          <div class="habit-points">${habit.points}pt${habit.points > 1 ? 's' : ''}</div>
          ${hasDetailFinal ? `<svg class="habit-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>` : ''}
        </button>
      </div>
      ${hasDetailFinal ? `<div class="habit-detail" id="${detailId}">${neglectHtml}${noteHtml}${rationaleHtml}${coreTagHtml}</div>` : ''}
      ${promptHtml}
    </div>`;
}

function renderToday() {
  const screen  = document.getElementById('screen-today');
  const today   = todayStr();
  const viewDate = viewingDate;
  const checked = Store.getHabits(viewDate);
  const habits  = Store.getHabitDefs().filter(h => h.enabled !== false);
  const isViewingToday = viewDate === today;

  // Temptation bundling
  const bundleData    = TBundle.getData();
  const promptHabitId = isViewingToday ? TBundle.getPromptHabitId(checked, habits) : null;

  // Neglected habit days (computed once for all habits)
  const neglectMap = {};
  habits.forEach(h => { neglectMap[h.id] = getNeglectedDays(h.id); });

  // Streak + core progress
  const streakData        = Streak.recompute();
  const { done: coreDone } = Streak.getCoreProgress(today);
  const totalDone  = habits.filter(h => checked[h.id]).length;
  const totalAll   = habits.length;
  const nowHour    = new Date().getHours();
  const onTheLine  = nowHour >= 18 && coreDone < 5 && streakData.current > 0;

  const pillars = ['sleep', 'nutrition', 'movement', 'stress'];

  let html = '';

  html += renderDateStrip();
  html += renderPastDateBanner();

  // Summary row: total done + streak counter
  const countLabel = isViewingToday ? 'habits done today' : 'habits done that day';
  html += `
    <div class="today-summary-row">
      <span id="today-habit-count" class="today-habit-count">${totalDone} of ${totalAll} ${countLabel}</span>
      ${isViewingToday && streakData.current > 0
        ? `<span id="streak-counter" class="streak-counter">🔥 ${streakData.current}-day streak</span>`
        : `<span id="streak-counter" class="streak-counter" style="display:none"></span>`}
    </div>
  `;

  if (isViewingToday) {
    // Grace day note
    if (streakData.showGraceNote) {
      html += `<div class="streak-note">Grace day used — streak intact.</div>`;
      streakData.showGraceNote = false;
      Streak.saveData(streakData);
    }

    // Streak broken message
    if (streakData.showBrokenNote) {
      html += `<div class="streak-note">Streak reset. Your best was ${streakData.bestAtBreak} days. Build a new one.</div>`;
      streakData.showBrokenNote = false;
      Streak.saveData(streakData);
    }

    // "Streak on the line" banner
    html += `
      <div id="streak-on-line-banner" class="streak-on-line" ${onTheLine ? '' : 'style="display:none"'}>
        Your ${streakData.current}-day streak is on the line today.
      </div>
    `;
  }

  // Optional feature cards (sleep, mood, photos, measurements)
  if (isViewingToday) {
    html += `<div id="today-optional-cards">`;
    html += renderSleepCard();
    html += renderMoodCard();
    html += renderPhotoPromptCard();
    html += renderMeasurementPromptCard();
    html += `</div>`;
  } else {
    html += `<div id="today-optional-cards"></div>`;
  }

  // Top section: all core habits
  const coreHabits = sortHabitsByPoints(habits.filter(h => CORE_HABIT_IDS.includes(h.id)));
  if (coreHabits.length) {
    html += `
      <div class="habit-group">
        <div class="pillar-header">
          <div class="pillar-label">Your Daily Commitments</div>
        </div>
    `;
    coreHabits.forEach(h => {
      html += buildHabitItemHtml(h, checked, true, bundleData[h.id] || null, promptHabitId === h.id, neglectMap[h.id]);
    });
    html += `</div>`;
  }

  // Domain sections: bonus habits only, completion counts include cores
  pillars.forEach(pillar => {
    const meta       = PILLAR_META[pillar];
    const allItems   = habits.filter(h => h.pillar === pillar);
    const bonusItems = sortHabitsByPoints(allItems.filter(h => !CORE_HABIT_IDS.includes(h.id)));
    if (!bonusItems.length) return;

    const pillarDone = allItems.filter(h => checked[h.id]).length;

    html += `
      <div class="habit-group">
        <div class="pillar-header">
          <div class="pillar-dot ${meta.dotClass}"></div>
          <div class="pillar-label">${meta.label}</div>
          <div id="pillar-count-${pillar}" class="pillar-count">${pillarDone} of ${allItems.length} done</div>
        </div>
    `;

    bonusItems.forEach(h => {
      html += buildHabitItemHtml(h, checked, false, bundleData[h.id] || null, promptHabitId === h.id, neglectMap[h.id]);
    });

    html += `</div>`;
  });

  screen.innerHTML = html;

  // Bind optional feature cards
  if (isViewingToday) {
    bindSleepCard(screen);
    bindMoodCard(screen);
    bindPhotoPromptCard(screen);
    bindMeasurementPromptCard(screen);
  }

  bindDateStrip(screen);

  // Habit events: check-zone → toggle, tap-zone → expand detail, prompt handlers
  screen.querySelectorAll('.habit-item').forEach(item => {
    const id = item.dataset.habit;

    // Checkbox zone: toggle check
    item.querySelector('.habit-check-zone')?.addEventListener('click', e => {
      e.stopPropagation();
      toggleHabit(item);
    });

    // Tap zone: expand/collapse detail panel
    item.querySelector('.habit-tap-zone')?.addEventListener('click', () => {
      const detail = item.querySelector('.habit-detail');
      if (detail) {
        const expanded = item.classList.toggle('expanded');
        item.querySelector('.habit-tap-zone')?.setAttribute('aria-expanded', expanded ? 'true' : 'false');
      }
    });

    // Bundle prompt: skip
    item.querySelector('.tbundle-skip-btn')?.addEventListener('click', e => {
      e.stopPropagation();
      TBundle.skip(id);
      item.classList.remove('has-prompt');
    });

    // Bundle prompt: text input save
    const tbInput = item.querySelector('.tbundle-text');
    if (tbInput) {
      let saved = false;
      const saveBundle = () => {
        if (saved) return;
        const val = tbInput.value.trim();
        if (!val) return;
        saved = true;
        TBundle.saveNote(id, val);
        renderToday();
        showToast('Saved', 'success');
      };
      tbInput.addEventListener('click',   e => e.stopPropagation());
      tbInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); saveBundle(); } });
      tbInput.addEventListener('blur',    saveBundle);
    }

    // Bundle prompt: mic button
    item.querySelector('.tbundle-mic')?.addEventListener('click', e => {
      e.stopPropagation();
      const inp = item.querySelector('.tbundle-text');
      if (inp) startVoiceInput(inp);
    });
  });
}

function updateStreakDisplay() {
  if (viewingDate !== todayStr()) return;
  const today   = todayStr();
  const checked = Store.getHabits(today);
  const habits  = Store.getHabitDefs().filter(h => h.enabled !== false);

  const streakData        = Streak.recompute();
  const { done: coreDone } = Streak.getCoreProgress(today);
  const totalDone = habits.filter(h => checked[h.id]).length;
  const totalAll  = habits.length;
  const nowHour   = new Date().getHours();

  const countEl = document.getElementById('today-habit-count');
  if (countEl) countEl.textContent = `${totalDone} of ${totalAll} habits done today`;

  const streakEl = document.getElementById('streak-counter');
  if (streakEl) {
    if (streakData.current > 0) {
      streakEl.textContent = `🔥 ${streakData.current}-day streak`;
      streakEl.style.display = '';
    } else {
      streakEl.style.display = 'none';
    }
  }

  const bannerEl = document.getElementById('streak-on-line-banner');
  if (bannerEl) {
    const show = nowHour >= 18 && coreDone < 5 && streakData.current > 0;
    bannerEl.style.display = show ? '' : 'none';
    if (show) bannerEl.textContent = `Your ${streakData.current}-day streak is on the line today.`;
  }

  // Update per-pillar counts
  ['sleep', 'nutrition', 'movement', 'stress'].forEach(pillar => {
    const items = habits.filter(h => h.pillar === pillar);
    const done  = items.filter(h => checked[h.id]).length;
    const el = document.getElementById(`pillar-count-${pillar}`);
    if (el) el.textContent = `${done} of ${items.length} done`;
  });
}

function toggleHabit(item) {
  const today   = viewingDate;
  const isViewingToday = today === todayStr();
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
    const checkBtn = item.querySelector('.habit-check-zone');
    checkBtn?.setAttribute('aria-checked', 'true');
    checkBtn?.setAttribute('aria-label', `Mark incomplete: ${habit.label}${habit.retroactive ? ' (for last night)' : ''}`);
    Points.add(habit.points, `Habit: ${habit.label}`, today);
    updatePointsBadge();
    showToast(`+${habit.points} pt${habit.points > 1 ? 's' : ''}`, 'success');

    const newBadges = Badges.check(['habits']);
    if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 400);

    // Check streak badges
    const newStreakBadges = Streak.checkBadges();
    if (newStreakBadges.length) {
      setTimeout(() => Streak.showBadgeCelebration(newStreakBadges[0]), newBadges.length ? 800 : 400);
    }

    if (isViewingToday) updateStreakDisplay();
    else renderToday();

    // Reveal bundle prompt if newly eligible
    if (isViewingToday && TBundle.shouldPromptNow(id)) {
      item.classList.add('has-prompt');
      setTimeout(() => item.querySelector('.tbundle-text')?.focus(), 200);
    }

    if (habit.opensWorkout) {
      setTimeout(() => openWorkoutModal(habit.priority ? 'strength' : null), 300);
    }
  } else {
    // Uncheck
    delete checked[id];
    Store.saveHabits(today, checked);
    item.classList.remove('checked');
    const checkBtn = item.querySelector('.habit-check-zone');
    checkBtn?.setAttribute('aria-checked', 'false');
    checkBtn?.setAttribute('aria-label', `Mark complete: ${habit.label}${habit.retroactive ? ' (for last night)' : ''}`);
    Points.deduct(habit.points, `Habit unchecked: ${habit.label}`, today);
    updatePointsBadge();
    if (isViewingToday) updateStreakDisplay();
    else renderToday();
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
  if (intention && !intention.skipped && (intention.pillar || intention.text)) {
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
  html += `<div class="card-title">Weekly Domain Progress</div>`;
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
    if (settings.mode === 'maintenance') {
      html += `<p class="text-small text-muted mt-8" style="font-style:italic">Consistency keeps you in your range. The habits that got you here are the habits that keep you here.</p>`;
    }
    if (settings.breastfeeding) {
      html += `<p class="text-small text-muted mt-8" style="font-style:italic">Breastfeeding affects when your body lets go of weight. Your habit consistency over time tells a more honest story than any single weigh-in.</p>`;
      // Plateau note
      const noChangeSince = weighIns.filter(w => w.date <= today).slice(-3);
      const plateau = noChangeSince.length >= 3 && noChangeSince.every(w => Math.abs(w.weight - noChangeSince[0].weight) < 0.5);
      if (plateau) {
        html += `<p class="text-small text-muted mt-4" style="font-style:italic">Plateaus are common while breastfeeding. Your body holds onto fat as a reserve for milk production and that has nothing to do with how hard you're working.</p>`;
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
  const spendablePts = points.spendable;
  const weekPts      = Points.thisWeekTotal();
  const goalName     = goals.name || 'your next goal';
  const ptsTarget    = goals.pointsTarget || 0;

  const pct     = ptsTarget > 0 ? Math.min(100, Math.round((spendablePts / ptsTarget) * 100)) : 0;
  const reached = ptsTarget > 0 && spendablePts >= ptsTarget;

  let html = `<div class="card">`;
  html += `<div class="card-title">Reward Progress</div>`;

  if (!goals.name) {
    html += `<p class="text-muted text-small">No reward goal set yet.</p>`;
    html += `<button class="btn btn-sm btn-primary mt-8" id="set-goal-btn">Set a goal</button>`;
  } else {
    html += `<div class="savings-goal-name">${escHtml(goalName)}</div>`;
    html += `
      <div class="savings-amounts">
        <span>${spendablePts} of ${ptsTarget} pts</span>
      </div>`;

    html += `
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
        </div>`;
    } else {
      html += `<button class="btn btn-sm btn-outline mt-8" id="set-goal-btn">Change goal</button>`;
    }
  }

  // Build net points history — habit check/uncheck pairs cancel out
  const habitNet = {}; // key: "date|habitLabel" → net amount
  const otherEvents = [];
  (points.history || []).forEach(h => {
    const m = (h.reason || '').match(/^Habit(?:\s+unchecked)?:\s+(.+)$/);
    if (m) {
      const key = `${h.date}|${m[1]}`;
      if (!habitNet[key]) habitNet[key] = { date: h.date, reason: `Habit: ${m[1]}`, amount: 0 };
      habitNet[key].amount += h.amount;
    } else if (h.amount > 0) {
      otherEvents.push(h);
    }
  });
  const recentEvents = [
    ...Object.values(habitNet).filter(h => h.amount > 0),
    ...otherEvents,
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);

  const historyRows = recentEvents.map(h =>
    `<div style="display:flex;align-items:baseline;gap:8px;font-size:12px;color:var(--text-muted);padding:2px 0">
      <span style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h.date} — ${escHtml(h.reason || '')}</span>
      <span style="white-space:nowrap;font-weight:500;flex-shrink:0">+${h.amount} pt${h.amount !== 1 ? 's' : ''}</span>
    </div>`
  ).join('');

  html += `
    <div class="savings-points-breakdown">
      <div class="row"><span>Points this week</span><span class="val">${weekPts} pts</span></div>
      <div class="row"><span>Total points earned (all time)</span><span class="val">${points.total_earned} pts</span></div>
      ${recentEvents.length ? `
        <details style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">
          <summary style="font-size:12px;color:var(--text-muted);cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between">
            <span>Recent points</span>
            <span style="font-size:10px;opacity:0.6">tap to expand</span>
          </summary>
          <div style="margin-top:8px">${historyRows}</div>
        </details>` : ''}
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
      mid:    "Sleep domain is building. The bedtime or caffeine cutoff could push this higher.",
      low:    "Sleep is your lowest domain this week. Earlier bedtime or cutting caffeine after 1pm are the highest-leverage changes.",
      lowBF:  "Broken sleep while breastfeeding is mostly out of your control. The things worth focusing on are bedtime and cutting off caffeine early.",
    },
    nutrition: {
      high:   "Solid nutrition week. Protein and whole foods are showing up.",
      mid:    "Nutrition is at halfway. The after-7pm cutoff or protein at breakfast would move this.",
      low:    "Nutrition domain is low. Start with protein at breakfast — it sets the tone for the day.",
      lowBF:  "Undereating while breastfeeding can affect milk supply and raise cortisol. The goal is hitting your protein and fiber habits, not cutting back.",
    },
    movement: {
      high:   "Strong movement week. Strength training is showing up.",
      mid:    "Halfway on movement. One more strength session would push this higher.",
      low:    "Movement is your lowest domain this week. Even 20 minutes of weights counts.",
      lowBF:  "Two strength sessions is a genuine win right now. Your body is producing milk on top of everything else you're asking it to do.",
    },
    stress: {
      high:   "Recovery is built into your week. That matters.",
      mid:    "Making progress on stress & recovery. Small things count.",
      low:    "Stress & recovery is low. One thing just for you today is a start.",
      lowBF:  "Breastfeeding raises baseline stress hormones even when life feels manageable. These habits are not optional extras.",
    },
  };
  const f = feedbacks[pillar];
  if (pct >= 50) return pct >= 75 ? f.high : f.mid;
  return (bf && f.lowBF) ? f.lowBF : f.low;
}

/* ─── EXERCISE Screen ────────────────────────────────────────────────────── */

function renderExercise() {
  const screen   = document.getElementById('screen-exercise');
  const workouts = Store.getWorkouts().slice().reverse();
  const ws = getWeekStart();
  const wsStr = dateStr(ws);
  const we = new Date(ws); we.setDate(we.getDate() + 6);
  const weStr = dateStr(we);
  const monthStart = todayStr().slice(0, 8) + '01';
  const monthWorkouts = workouts.filter(w => w.date >= monthStart && w.date <= todayStr());

  const weekWorkouts = workouts.filter(w => w.date >= wsStr && w.date <= weStr);
  const weekStrength = weekWorkouts.filter(w => w.priority);
  const weekOther    = weekWorkouts.filter(w => !w.priority);
  const totalSessions = weekWorkouts.length;
  const weekMinutes = weekWorkouts.reduce((sum, w) => sum + (parseInt(w.duration, 10) || 0), 0);
  const lastWorkout = workouts[0] || null;
  const lastWorkoutLabel = lastWorkout
    ? `${formatDateShort(lastWorkout.date)} · ${lastWorkout.activityLabel}`
    : 'No workouts yet';
  const weekActivityCounts = weekWorkouts.reduce((map, w) => {
    const key = w.activityLabel || 'Workout';
    map[key] = (map[key] || 0) + 1;
    return map;
  }, {});
  const topActivities = Object.entries(weekActivityCounts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3);
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDays = getWeekDays(ws);
  const dayStrip = weekDays.map((d, i) => {
    const dayWorkouts = weekWorkouts.filter(w => w.date === d);
    const hasStrength = dayWorkouts.some(w => w.priority);
    const cls = ['exercise-day', dayWorkouts.length ? 'done' : '', hasStrength ? 'strength' : '']
      .filter(Boolean).join(' ');
    const label = dayWorkouts.length
      ? `${dayLabels[i]}: ${dayWorkouts.length} workout${dayWorkouts.length !== 1 ? 's' : ''}`
      : `${dayLabels[i]}: no workout logged`;
    return `<span class="${cls}" aria-label="${label}" title="${label}">${dayLabels[i]}</span>`;
  }).join('');

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
    <div class="card exercise-summary-card">
      <div class="exercise-summary-head">
        <div>
          <div class="card-title">This Week</div>
          <div class="exercise-summary-main">${totalSessions} session${totalSessions !== 1 ? 's' : ''}</div>
        </div>
        <div class="exercise-summary-minutes">
          <span>${weekMinutes}</span>
          <small>min</small>
        </div>
      </div>
      <div class="exercise-goal-row">
        <div class="week-session-indicator">
          ${pips.map(p => `<div class="session-pip ${p.startsWith('empty') ? '' : p}"></div>`).join('')}
        </div>
        <span class="text-small text-muted">${minTarget} session goal · ${stretchTarget} stretch</span>
      </div>
      <div class="exercise-stat-grid">
        <div class="exercise-stat">
          <span>${weekStrength.length}</span>
          <small>Strength</small>
        </div>
        <div class="exercise-stat">
          <span>${weekOther.length}</span>
          <small>Other</small>
        </div>
        <div class="exercise-stat">
          <span>${monthWorkouts.length}</span>
          <small>This month</small>
        </div>
      </div>
      <div class="exercise-day-strip" role="list" aria-label="Workout days this week">${dayStrip}</div>
      <div class="exercise-last-line">Last: ${escHtml(lastWorkoutLabel)}</div>
      <div class="exercise-chip-row">
        ${topActivities.length
          ? topActivities.map(([label, count]) => `<span class="exercise-chip">${escHtml(label)} · ${count}</span>`).join('')
          : '<span class="exercise-chip muted">No activity logged this week</span>'}
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
        <div class="workout-entry" data-workout-id="${w.id}">
          <div class="workout-type-dot ${dot}"></div>
          <div class="workout-info">
            <div class="workout-type-name">${escHtml(w.activityLabel)}${tag}</div>
            <div class="workout-meta">${w.duration} min · ${w.intensity} · ${formatDateShort(w.date)}</div>
            ${w.note ? `<div class="workout-note">${escHtml(w.note)}</div>` : ''}
          </div>
          <button class="workout-delete-btn" data-id="${w.id}" title="Delete workout" aria-label="Delete workout">✕</button>
        </div>
      `;
    });
    html += `</div>`;
  }

  screen.innerHTML = html;
  screen.querySelector('#log-workout-btn')?.addEventListener('click', () => openWorkoutModal(null));

  screen.querySelectorAll('.workout-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!confirm('Delete this workout?')) return;
      const updated = Store.getWorkouts().filter(w => w.id !== id);
      Store.saveWorkouts(updated);
      Badges.recheckWorkoutBadges();
      renderExercise();
      if (currentScreen === 'progress') renderProgress();
    });
  });
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
    // Maintenance note below chart
    if (settings.mode === 'maintenance' && settings.goalWeightLow && settings.goalWeightHigh) {
      html += `<p class="weight-chart-note">Maintaining ${settings.goalWeightLow} to ${settings.goalWeightHigh} lbs</p>`;
    }
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
    // BF rapid loss flag (> 2 lbs/week)
    if (settings.breastfeeding && avgLoss > 2) {
      html += `<p class="text-small mt-4 bf-flag" style="font-style:italic">Your average loss is over 2 lbs per week. Some research links rapid weight loss to reduced milk supply, so it's worth keeping an eye on.</p>`;
    }
  }
  // BF: plateau message (updated text per spec)
  if (settings.breastfeeding && weighIns.length >= 3) {
    const last3 = weighIns.slice(-3);
    const plateau = last3.every(w => Math.abs(w.weight - last3[0].weight) < 0.5);
    if (plateau) {
      html += `<p class="text-small text-muted mt-8" style="font-style:italic">Plateaus are common while breastfeeding. Your body holds onto fat as a reserve for milk production and that has nothing to do with how hard you're working.</p>`;
    }
  }
  // BF: persistent notes (always shown when BF mode on)
  if (settings.breastfeeding) {
    html += `<p class="text-small text-muted mt-8" style="font-style:italic">While breastfeeding, 0.5 to 1 lb per week is a healthy rate of loss. The last 5 to 10 lbs often don't shift until after weaning and that's completely normal.</p>`;
  }
  html += `</div>`;

  // Plateau check-in banner (non-BF only, 4+ weigh-ins, not already done this week)
  if (!settings.breastfeeding && detectPlateau(weighIns) && !plateauCheckinDone()) {
    html += `
      <div class="plateau-banner" id="plateau-banner">
        <div class="plateau-banner-text">Your trend line has been flat for 4 weeks. Take a moment to check in.</div>
        <button class="btn btn-sm btn-primary mt-8" id="plateau-checkin-btn">Check in</button>
      </div>`;
  }

  // Badges
  const deactivatedBadges = Badges.getDeactivated();
  html += `<div class="screen-section-title">Milestones</div>`;
  html += `<div class="card">`;
  html += `<div class="badges-grid">`;
  BADGE_DEFINITIONS.forEach(b => {
    const isEarned     = !!earned[b.id];
    const isDeactivated = isEarned && !!deactivatedBadges[b.id];
    const cls = isDeactivated ? 'earned deactivated' : isEarned ? 'earned' : 'locked';
    const titleSuffix = isDeactivated ? ' · Complete more workouts to reactivate' : isEarned ? ` · Earned ${earned[b.id]}` : '';
    html += `
      <div class="badge-item ${cls}" title="${b.label}${titleSuffix}">
        <div class="badge-icon">${b.icon}</div>
        <div class="badge-label">${b.label}</div>
        ${isDeactivated ? `<div class="badge-deactivated-note">Reactivate</div>` : ''}
      </div>
    `;
  });
  html += `</div></div>`;

  // Habit consistency (last 8 weeks)
  html += `<div class="screen-section-title">Domain Consistency (8 Weeks)</div>`;
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
    html += `<div class="screen-section-title">Rewards Earned</div>`;
    html += `<div class="card">`;
    [...goals.history].reverse().forEach(r => {
      const ptsEarned  = r.points || 0;
      const ptsTarget  = r.pointsTarget || null;
      const ptsDisplay = ptsTarget ? `${ptsEarned} / ${ptsTarget} pts` : `${ptsEarned} pts`;
      html += `
        <div class="reward-entry">
          <div>
            <div class="reward-name">${escHtml(r.name)}</div>
            <div class="reward-meta">${formatDateShort(r.date)}</div>
          </div>
          <div class="reward-amount">${ptsDisplay}</div>
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

  // Sleep Tracking chart (Feature 2)
  if (settings.featSleepTracking) {
    const sleepLogs = Store.getSleepLogs().sort((a,b) => a.date.localeCompare(b.date));
    if (sleepLogs.length > 0) {
      html += `<div class="screen-section-title">Sleep</div>`;
      html += `<div class="card">`;
      html += `<div class="chart-wrap"><canvas id="sleep-chart"></canvas></div>`;
      // Average over last 4 weeks
      const recent28 = sleepLogs.filter(l => {
        const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 28);
        return l.date >= dateStr(cutoff);
      });
      if (recent28.length > 0) {
        const avgHrs = recent28.reduce((s, l) => s + (calcSleepHours(l.sleepTime, l.wakeTime) || 0), 0) / recent28.length;
        html += `<div class="avg-loss-stat">Average over last 4 weeks: <strong>${fmtSleepHours(avgHrs)}</strong></div>`;
      }
      if (settings.breastfeeding) {
        html += `<p class="text-small text-muted mt-8" style="font-style:italic">Broken sleep is expected right now. Focus on the trend over weeks, not any single night.</p>`;
      }
      html += `</div>`;
    }
  }

  // Mood / Energy / Motivation charts (Feature 3)
  if (settings.featMoodLog) {
    const moodLogs = Store.getMoodLogs().sort((a,b) => a.date.localeCompare(b.date));
    if (moodLogs.length > 0) {
      html += `<div class="screen-section-title">Mood, Energy &amp; Motivation</div>`;
      html += `<div class="card"><div class="chart-wrap"><canvas id="mood-chart"></canvas></div></div>`;
    }
  }

  // Progress Photos tab (Feature 4)
  if (settings.featProgressPhotos) {
    const photos = Store.getProgressPhotos().sort((a,b) => b.date.localeCompare(a.date));
    html += `<div class="screen-section-title">Progress Photos</div>`;
    html += `<div class="card">`;
    if (photos.length === 0) {
      html += `<div class="empty-state"><p>No photos yet. Your first monthly prompt will appear on the 1st of next month.</p></div>`;
    } else {
      html += `<div class="photos-grid">`;
      photos.forEach(p => {
        const d = new Date(p.date + 'T12:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        html += `
          <div class="photo-thumb" data-date="${p.date}">
            <img src="${p.dataUrl}" alt="${label}" class="photo-thumb-img">
            <div class="photo-thumb-label">${label}</div>
          </div>`;
      });
      html += `</div>`;
      html += `<button class="btn btn-sm btn-outline" id="export-photos-btn" style="margin-top:12px;width:100%">Export photos as zip</button>`;
      html += `<p class="text-small text-muted mt-8">Progress photos are stored on this device only. They will be lost if you clear your browser data. Export regularly to back them up.</p>`;
    }
    html += `</div>`;
  }

  // Measurements (Feature 5)
  if (settings.featMeasurements) {
    const measurements = Store.getMeasurements().sort((a,b) => a.date.localeCompare(b.date));
    html += `<div class="screen-section-title">Measurements</div>`;
    html += `<div class="card">`;
    if (measurements.length === 0) {
      html += `<div class="empty-state"><p>No measurements yet. Your first monthly prompt will appear on the 1st of next month.</p></div>`;
    } else {
      const tracked = (settings.trackedMeasurements || []).map(id => MEASUREMENT_POINTS.find(mp => mp.id === id)).filter(Boolean);
      // Total inches
      const first = measurements[0];
      const last  = measurements[measurements.length - 1];
      const totalFirst = tracked.reduce((s, mp) => s + (first[mp.id] || 0), 0);
      const totalLast  = tracked.reduce((s, mp) => s + (last[mp.id]  || 0), 0);
      const totalChange = totalFirst > 0 ? (totalLast - totalFirst).toFixed(1) : null;
      if (totalChange !== null) {
        const sign = parseFloat(totalChange) <= 0 ? '' : '+';
        html += `<div class="avg-loss-stat" style="margin-bottom:12px">Total inches: <strong>${sign}${totalChange} in since first log</strong></div>`;
      }
      html += `<div class="chart-wrap"><canvas id="measurements-chart"></canvas></div>`;
    }
    html += `</div>`;
  }

  screen.innerHTML = html;

  // Plateau check-in button
  screen.querySelector('#plateau-checkin-btn')?.addEventListener('click', openPlateauCheckin);

  // Photo lightbox
  screen.querySelectorAll('.photo-thumb').forEach(el => {
    el.addEventListener('click', () => {
      const date   = el.dataset.date;
      const photos = Store.getProgressPhotos();
      const photo  = photos.find(p => p.date === date);
      if (!photo) return;
      openModal(body => {
        const d = new Date(date + 'T12:00:00');
        const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        body.innerHTML = `
          <div class="modal-title">${label}</div>
          <img src="${photo.dataUrl}" style="width:100%;border-radius:8px;margin-top:8px" alt="${label}">
          <button class="btn btn-outline btn-sm" id="photo-delete-btn" style="margin-top:12px;width:100%;color:var(--text-muted)">Delete this photo</button>`;
        body.querySelector('#photo-delete-btn')?.addEventListener('click', () => {
          if (!confirm('Delete this photo? This cannot be undone.')) return;
          const updated = Store.getProgressPhotos().filter(p => p.date !== date);
          Store.saveProgressPhotos(updated);
          closeModal();
          renderProgress();
        });
      });
    });
  });

  // Export photos
  screen.querySelector('#export-photos-btn')?.addEventListener('click', exportProgressPhotos);

  // Init charts after DOM
  requestAnimationFrame(() => {
    if (weighIns.length >= 2) initWeightChart(weighIns, settings);
    if (settings.featSleepTracking) {
      const sleepLogs = Store.getSleepLogs().sort((a,b) => a.date.localeCompare(b.date));
      if (sleepLogs.length > 0) initSleepChart(sleepLogs, settings);
    }
    if (settings.featMoodLog) {
      const moodLogs = Store.getMoodLogs().sort((a,b) => a.date.localeCompare(b.date));
      if (moodLogs.length > 0) initMoodChart(moodLogs);
    }
    if (settings.featMeasurements) {
      const measurements = Store.getMeasurements().sort((a,b) => a.date.localeCompare(b.date));
      if (measurements.length > 0) initMeasurementsChart(measurements, settings);
    }
  });
}

let sleepChart = null;
let moodChart  = null;
let measurementsChart = null;

function initSleepChart(logs, settings) {
  const canvas = document.getElementById('sleep-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (sleepChart) { sleepChart.destroy(); sleepChart = null; }

  const labels = logs.map(l => l.date);
  const data   = logs.map(l => {
    const h = calcSleepHours(l.sleepTime, l.wakeTime);
    return h !== null ? Math.round(h * 10) / 10 : null;
  });

  const target = settings.breastfeeding ? 6 : 7;

  const barColors = data.map(h => {
    if (h === null) return 'rgba(200,200,200,0.3)';
    if (h < 5)    return 'rgba(217,119,6,0.75)';
    if (h < 6.5)  return 'rgba(160,160,160,0.6)';
    return 'rgba(93,122,88,0.75)';
  });

  sleepChart = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Sleep (hrs)',
        data,
        backgroundColor: barColors,
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        annotation: {
          annotations: {
            targetLine: {
              type: 'line',
              yMin: target,
              yMax: target,
              borderColor: 'rgba(93,122,88,0.5)',
              borderWidth: 1,
              borderDash: [4, 4],
              label: { content: `${target} hr target`, enabled: true, position: 'end', font: { size: 10 }, color: 'rgba(93,122,88,0.8)' },
            },
          },
        },
      },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
        y: { min: 0, max: 12, ticks: { stepSize: 2 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  });
}

function initMoodChart(logs) {
  const canvas = document.getElementById('mood-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (moodChart) { moodChart.destroy(); moodChart = null; }

  const labels = logs.map(l => l.date);
  moodChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Mood',       data: logs.map(l => l.mood),       borderColor: 'rgba(190,100,120,0.8)', borderWidth: 2, tension: 0.3, pointRadius: 3, fill: false },
        { label: 'Energy',     data: logs.map(l => l.energy),     borderColor: 'rgba(93,122,88,0.8)',   borderWidth: 2, tension: 0.3, pointRadius: 3, fill: false },
        { label: 'Motivation', data: logs.map(l => l.motivation), borderColor: 'rgba(180,140,80,0.8)',  borderWidth: 2, tension: 0.3, pointRadius: 3, fill: false },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
        y: { min: 0, max: 10, ticks: { stepSize: 2 }, grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  });
}

function initMeasurementsChart(measurements, settings) {
  const canvas = document.getElementById('measurements-chart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (measurementsChart) { measurementsChart.destroy(); measurementsChart = null; }

  const tracked = (settings.trackedMeasurements || []).map(id => MEASUREMENT_POINTS.find(mp => mp.id === id)).filter(Boolean);
  const labels  = measurements.map(m => m.date);
  const colors  = ['rgba(190,100,120,0.8)','rgba(93,122,88,0.8)','rgba(180,140,80,0.8)','rgba(100,140,200,0.8)','rgba(160,100,180,0.8)','rgba(80,180,180,0.8)','rgba(200,120,80,0.8)'];

  const datasets = tracked.map((mp, i) => ({
    label: mp.label,
    data: measurements.map(m => m[mp.id] ?? null),
    borderColor: colors[i % colors.length],
    borderWidth: 2,
    tension: 0.3,
    pointRadius: 3,
    fill: false,
    spanGaps: true,
  }));

  measurementsChart = new Chart(canvas, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } },
      scales: {
        x: { ticks: { maxTicksLimit: 8, font: { size: 10 } }, grid: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.05)' } },
      },
    },
  });
}

async function exportProgressPhotos() {
  const photos = Store.getProgressPhotos();
  if (!photos.length) return;

  // Simple approach: open each photo in a new tab since JSZip may not be available
  // If JSZip is present we'd use it; for now we trigger individual downloads
  for (const p of photos) {
    const a = document.createElement('a');
    a.href = p.dataUrl;
    a.download = `bloom-photo-${p.date}.jpg`;
    a.click();
    await new Promise(r => setTimeout(r, 200));
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
  const goalLow  = settings.goalWeightLow  || null;
  const isMaintenance = settings.mode === 'maintenance';

  // Build annotation: shaded band in maintenance, single dashed line in weight-loss
  let chartAnnotation;
  if (goalHigh) {
    if (isMaintenance && goalLow) {
      chartAnnotation = {
        annotations: {
          maintBand: {
            type: 'box',
            yMin: goalLow,
            yMax: goalHigh,
            backgroundColor: 'rgba(196,180,154,0.15)',
            borderColor: 'rgba(196,180,154,0.5)',
            borderWidth: 1,
            label: {
              content: `Maintenance: ${goalLow}–${goalHigh} lbs`,
              display: true,
              position: { x: 'end', y: 'start' },
              color: '#C4B49A',
              font: { size: 10 },
            },
          },
        },
      };
    } else {
      chartAnnotation = {
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
      };
    }
  }

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
        annotation: chartAnnotation,
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

function renderSheetsSyncSection() {
  const connected  = SheetsSync.isConnected();
  const account    = SheetsSync.getAccount();
  const lastSynced = SheetsSync.formatLastSynced();
  const needsReauth = !!localStorage.getItem('bloom_google_reauth_needed');
  const pending    = SheetsSync.getQueue().length > 0;

  if (!connected) {
    return `
      <div class="settings-group">
        <div style="padding:13px 16px">
          <p class="settings-btn-desc" style="margin-bottom:10px">Your data is stored on this device. Connect Google Sheets to automatically back it up to your own Google Drive — and restore it if your local data is ever lost.</p>
          <button class="btn btn-outline btn-sm" id="s-sheets-connect" style="width:100%">Connect Google Sheets backup</button>
        </div>
      </div>`;
  }

  return `
    <div class="settings-group">
      <div style="padding:13px 16px">
        ${needsReauth ? `<p style="color:#b45309;font-size:13px;margin-bottom:10px;font-style:italic">Google Sheets sync hasn't connected in 7 days. Tap Reconnect below.</p>` : ''}
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
          <span style="font-size:14px;font-weight:500;color:var(--text)">Connected ✓</span>
          ${account ? `<span style="font-size:12px;color:var(--text-muted)">${escHtml(account)}</span>` : ''}
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:12px">Last synced: ${lastSynced}${pending ? ' · Sync pending' : ''}</div>
        <div style="display:flex;gap:8px">
          ${needsReauth
            ? `<button class="btn btn-outline btn-sm" id="s-sheets-connect" style="flex:1">Reconnect</button>`
            : `<button class="btn btn-outline btn-sm" id="s-sheets-sync" style="flex:1">Sync now</button>`}
          <button class="btn btn-outline btn-sm" id="s-sheets-disconnect" style="flex:1;color:var(--text-muted)">Disconnect</button>
        </div>
      </div>
    </div>`;
}

function renderSettings() {
  const screen = document.getElementById('screen-settings');
  const s = Store.getSettings();

  const notifBlocked = Notifications.isBlocked();
  const notifBlockedMsg = notifBlocked
    ? `<p style="font-size:12px;color:var(--text-muted);margin-top:6px;font-style:italic">Enable notifications in iOS Settings to use this feature.</p>`
    : '';
  const notifDisabled = (el) => notifBlocked ? `style="opacity:0.5;pointer-events:none"` : '';
  const pushStatus = Push.isConfigured()
    ? (Push.getEndpoint()
      ? 'Push server is connected for this device.'
      : 'Push server is configured. Turn on a reminder to connect this device.')
    : 'Remote push server is not configured yet. Local reminders work while Bloom is open.';

  const html = `
    <div class="screen-header"><h2>Settings</h2></div>

    <div class="settings-section">
      <div class="settings-group">
        <div class="settings-btn-row" role="button" tabindex="0" id="s-how-bloom-works" style="display:flex;align-items:center;justify-content:space-between">
          <div>
            <div class="settings-btn-label" style="font-weight:600">How Bloom works</div>
            <div class="settings-btn-desc">The domains, the scoring, the evidence</div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" style="color:var(--text-light);flex-shrink:0"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">About You</div>
      <div class="settings-group">
        <div class="settings-row">
          <label class="settings-row-label" for="s-name">Name</label>
          <input class="settings-row-input" id="s-name" type="text" placeholder="Your name" value="${escHtml(s.name || '')}" autocomplete="off">
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-start-weight">Starting weight</label>
          <input class="settings-row-input" id="s-start-weight" type="number" step="0.1" placeholder="lbs" value="${s.startingWeight || ''}">
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-goal-low">Goal weight (low)</label>
          <input class="settings-row-input" id="s-goal-low" type="number" step="0.1" placeholder="lbs" value="${s.goalWeightLow || ''}">
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-goal-high">Goal weight (high)</label>
          <input class="settings-row-input" id="s-goal-high" type="number" step="0.1" placeholder="lbs" value="${s.goalWeightHigh || ''}">
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-start-date">App start date</label>
          <input class="settings-row-input" id="s-start-date" type="date" value="${s.appStartDate || todayStr()}">
        </div>
        <div class="settings-row">
          <div class="settings-row-label">Current goal</div>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="settings-mode-label" id="settings-mode-label">${s.mode === 'maintenance' ? 'Maintenance' : 'Weight loss'}</span>
            <button class="btn btn-sm btn-outline" id="s-switch-mode" style="font-size:12px;padding:4px 10px">${s.mode === 'maintenance' ? 'Switch to weight loss' : 'Switch to maintenance'}</button>
          </div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Health</div>
      <div class="settings-group">
        <div class="toggle-row" style="padding:13px 16px;align-items:flex-start">
          <div style="flex:1;min-width:0;padding-right:16px">
            <div class="toggle-label">Breastfeeding mode</div>
            <div class="toggle-sublabel">Adjusts app guidance to reflect breastfeeding.</div>
          </div>
          <label class="toggle" style="flex-shrink:0;margin-top:2px">
            <input type="checkbox" id="s-bf" ${s.breastfeeding ? 'checked' : ''}>
            <div class="toggle-track"></div>
          </label>
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-wake">Usual wake time</label>
          <input class="settings-row-input" id="s-wake" type="time" value="${s.usualWakeTime || '07:00'}">
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Time Cutoffs</div>
      <div class="settings-group">
        <div class="settings-row">
          <label class="settings-row-label" for="s-bedtime">Bedtime target</label>
          <input class="settings-row-input" id="s-bedtime" type="time" value="${s.bedtimeTarget || '22:30'}">
        </div>
        <div class="settings-row">
          <label class="settings-row-label" for="s-eat-cutoff">Eating cutoff</label>
          <input class="settings-row-input" id="s-eat-cutoff" type="time" value="${s.eatCutoff || '19:00'}">
        </div>
        <p class="settings-note" style="padding:6px 16px 10px;margin:0">If you are breastfeeding or genuinely hungry in the evening, eating enough always takes priority over this cutoff.</p>
        <div class="settings-row">
          <label class="settings-row-label" for="s-caffeine-cutoff">Caffeine cutoff</label>
          <input class="settings-row-input" id="s-caffeine-cutoff" type="time" value="${s.caffeineCutoff || '13:00'}">
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Rewards</div>
      <div class="settings-group">
        <div class="settings-btn-row" role="button" tabindex="0" id="s-set-goal">
          <div class="settings-btn-label">Set reward goal</div>
          <div class="settings-btn-desc">Name your reward goal and set a points target</div>
        </div>
        <div class="settings-btn-row" role="button" tabindex="0" id="s-manual-points">
          <div class="settings-btn-label">Manual point adjustment</div>
          <div class="settings-btn-desc">Correct errors in your point balance</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Customization</div>
      <div class="settings-group">
        <div class="settings-btn-row" role="button" tabindex="0" id="s-habits">
          <div class="settings-btn-label">Customize habits</div>
          <div class="settings-btn-desc">Toggle, rename, or add habit items</div>
        </div>
        <div class="settings-btn-row" role="button" tabindex="0" id="s-activities">
          <div class="settings-btn-label">Customize exercise activities</div>
          <div class="settings-btn-desc">Edit activity menu and priority items</div>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-section-title">Optional Features</div>
      <div class="settings-group">
        <div class="toggle-row" style="padding:13px 16px">
          <div><div class="toggle-label">Notifications</div><div class="toggle-sublabel">Streak alerts, reminders, and nudges</div></div>
          <label class="toggle"><input type="checkbox" id="s-feat-notifications" ${s.featNotifications ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div><div class="toggle-label">Sleep time tracking</div><div class="toggle-sublabel">Log your sleep window each morning</div></div>
          <label class="toggle"><input type="checkbox" id="s-feat-sleep" ${s.featSleepTracking ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div><div class="toggle-label">Mood, energy &amp; motivation log</div><div class="toggle-sublabel">Daily 0-10 check-in on how you are doing</div></div>
          <label class="toggle"><input type="checkbox" id="s-feat-mood" ${s.featMoodLog ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div><div class="toggle-label">Progress photos</div><div class="toggle-sublabel">Monthly private photo log, stored on device only</div></div>
          <label class="toggle"><input type="checkbox" id="s-feat-photos" ${s.featProgressPhotos ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div><div class="toggle-label">Measurement tracking</div><div class="toggle-sublabel">Monthly body measurements with visual body model</div></div>
          <label class="toggle"><input type="checkbox" id="s-feat-measurements" ${s.featMeasurements ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
      </div>
    </div>

    ${s.featNotifications ? `
    <div class="settings-section">
      <div class="settings-section-title">Notifications</div>
      ${notifBlockedMsg}
      <div class="settings-group" ${notifBlocked ? 'style="opacity:0.5;pointer-events:none"' : ''}>
        <div class="toggle-row" style="padding:13px 16px">
          <div>
            <div class="toggle-label">Streak protection alert</div>
            <div class="toggle-sublabel">Reminds you when your streak is at risk</div>
          </div>
          <label class="toggle"><input type="checkbox" id="s-notif-streak" ${s.notifStreakProtection ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div>
            <div class="toggle-label">Weekly weigh-in reminder</div>
            <div class="toggle-sublabel">Sunday morning reminder to log your weight</div>
          </div>
          <label class="toggle"><input type="checkbox" id="s-notif-weighin" ${s.notifWeighIn ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div>
            <div class="toggle-label">Bedtime nudge</div>
            <div class="toggle-sublabel">A gentle reminder at 10pm if your bedtime habit is not checked</div>
          </div>
          <label class="toggle"><input type="checkbox" id="s-notif-bedtime" ${s.notifBedtime ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div class="toggle-row" style="padding:13px 16px">
          <div>
            <div class="toggle-label">Morning check-in reminder</div>
            <div class="toggle-sublabel">A gentle nudge to log your habits</div>
            <div style="margin-top:8px;display:flex;align-items:center;gap:8px">
              <span style="font-size:13px;color:var(--text-muted)">Time:</span>
              <input type="time" class="settings-row-input" id="s-notif-morning-time" value="${s.notifMorningTime || '08:00'}" style="max-width:120px">
            </div>
          </div>
          <label class="toggle"><input type="checkbox" id="s-notif-morning" ${s.notifMorningCheckin ? 'checked' : ''}><div class="toggle-track"></div></label>
        </div>
        <div style="padding:13px 16px">
          <button class="btn btn-outline btn-sm btn-full" id="s-notif-test">Send test notification</button>
          <p class="settings-note" style="margin:10px 0 0">${pushStatus}</p>
        </div>
      </div>
    </div>` : ''}

    ${s.featMeasurements ? `
    <div class="settings-section">
      <div class="settings-section-title">Measurement Tracking</div>
      <div class="settings-group">
        <div class="settings-btn-row" role="button" tabindex="0" id="s-edit-measurements">
          <div class="settings-btn-label">Edit tracked measurements</div>
          <div class="settings-btn-desc">Choose which body measurements to track each month</div>
        </div>
      </div>
    </div>` : ''}

    <div class="settings-section">
      <div class="settings-section-title">Data &amp; Backup</div>
      ${renderSheetsSyncSection(s)}
      <div class="settings-group" style="margin-top:12px">
        <div class="settings-btn-row" role="button" tabindex="0" id="s-export">
          <div class="settings-btn-label">Export all data (JSON)</div>
        </div>
        <div class="settings-btn-row" role="button" tabindex="0" id="s-import">
          <div class="settings-btn-label">Import data from backup</div>
          <div class="settings-btn-desc">Restore a previous JSON export</div>
        </div>
        <div class="settings-btn-row" role="button" tabindex="0" id="s-reset">
          <div class="settings-btn-label danger-btn">Reset all data</div>
          <div class="settings-btn-desc">This cannot be undone</div>
        </div>
      </div>
    </div>

    <div style="height:20px"></div>
  `;

  screen.innerHTML = html;

  screen.querySelectorAll('.settings-btn-row[role="button"]').forEach(row => {
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        row.click();
      }
    });
  });

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
    if (e.target.checked && !Store.get('bloom_bf_safety_seen')) {
      // Show safety card once
      e.target.checked = false; // hold off until user confirms
      openModal(body => {
        body.innerHTML = `
          <h2 class="modal-title">A note on breastfeeding and weight loss</h2>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:var(--text)">Breastfeeding increases your daily calorie needs. Most guidelines suggest an additional 300 to 500 kcal per day. Restricting calories too aggressively can reduce milk supply and affect your energy and recovery.</p>
          <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:var(--text)">All targets in Bloom are guides, not rules. If you are hungry, eat. If a habit conflicts with feeding your baby or your own energy needs, skip it.</p>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:var(--text)">If you have concerns about weight management while breastfeeding, a registered dietitian or your midwife or OB can give personalised guidance.</p>
          <button class="btn btn-primary btn-full" id="bf-safety-ok">Got it</button>
        `;
        body.querySelector('#bf-safety-ok').addEventListener('click', () => {
          Store.set('bloom_bf_safety_seen', true);
          const s2 = Store.getSettings();
          s2.breastfeeding = true;
          Store.saveSettings(s2);
          const cb = screen.querySelector('#s-bf');
          if (cb) cb.checked = true;
          closeModal();
        });
      });
      return;
    }
    s.breastfeeding = e.target.checked;
    Store.saveSettings(s);
  });

  // Optional feature toggles
  const featToggles = [
    ['s-feat-notifications',  'featNotifications'],
    ['s-feat-sleep',          'featSleepTracking'],
    ['s-feat-mood',           'featMoodLog'],
    ['s-feat-photos',         'featProgressPhotos'],
    ['s-feat-measurements',   'featMeasurements'],
  ];
  featToggles.forEach(([elId, key]) => {
    screen.querySelector('#' + elId)?.addEventListener('change', async e => {
      const s = Store.getSettings();
      s[key] = e.target.checked;
      Store.saveSettings(s);
      // Re-render settings to show/hide dependent sections
      renderSettings();
      // If turning on notifications, request permission
      if (key === 'featNotifications' && e.target.checked) {
        const perm = await Notifications.requestPermission();
        if (perm === 'denied') renderSettings(); // re-render to show blocked message
      }
      Notifications.schedule();
      await Push.sync(Store.getSettings(), { subscribeWhenEnabled: e.target.checked });
      // Also refresh today screen
      if (currentScreen === 'today') renderToday();
    });
  });

  // Notification toggles
  const notifToggles = [
    ['s-notif-streak',   'notifStreakProtection'],
    ['s-notif-weighin',  'notifWeighIn'],
    ['s-notif-bedtime',  'notifBedtime'],
    ['s-notif-morning',  'notifMorningCheckin'],
  ];
  notifToggles.forEach(([elId, key]) => {
    screen.querySelector('#' + elId)?.addEventListener('change', async e => {
      const s = Store.getSettings();
      if (e.target.checked && (!('Notification' in window) || Notification.permission !== 'granted')) {
        const perm = await Notifications.requestPermission();
        if (perm !== 'granted') { e.target.checked = false; renderSettings(); return; }
      }
      s[key] = e.target.checked;
      Store.saveSettings(s);
      Notifications.schedule();
      const ok = await Push.sync(s, { subscribeWhenEnabled: e.target.checked });
      if (!ok) showToast('Push subscription failed. Check worker setup.', 'error');
      renderSettings();
    });
  });

  screen.querySelector('#s-notif-morning-time')?.addEventListener('change', e => {
    const s = Store.getSettings();
    s.notifMorningTime = e.target.value;
    Store.saveSettings(s);
    Notifications.schedule();
    Push.updatePrefs();
  });

  screen.querySelector('#s-notif-test')?.addEventListener('click', () => Notifications.sendTest());

  screen.querySelector('#s-edit-measurements')?.addEventListener('click', () => {
    openMeasurementSetup(() => renderSettings());
  });

  screen.querySelector('#s-switch-mode')?.addEventListener('click', () => {
    const s2 = Store.getSettings();
    s2.mode = s2.mode === 'maintenance' ? 'weight_loss' : 'maintenance';
    Store.saveSettings(s2);
    renderSettings();
    showToast(s2.mode === 'maintenance' ? 'Switched to maintenance mode' : 'Switched to weight loss mode', 'success');
    updateHeader();
  });

  screen.querySelector('#s-how-bloom-works')?.addEventListener('click', openHowBloomWorks);
  screen.querySelector('#s-set-goal')?.addEventListener('click', openGoalModal);
  screen.querySelector('#s-manual-points')?.addEventListener('click', openManualPointsModal);
  screen.querySelector('#s-habits')?.addEventListener('click', openHabitsCustomizer);
  screen.querySelector('#s-activities')?.addEventListener('click', openActivitiesCustomizer);

  screen.querySelector('#s-sheets-connect')?.addEventListener('click', async () => {
    await SheetsSync.connect().catch(() => showToast('Connection failed. Please try again.'));
  });
  screen.querySelector('#s-sheets-sync')?.addEventListener('click', async () => {
    showToast('Syncing…');
    await SheetsSync.syncAll();
    showToast('Synced.', 'success');
    renderSettings();
  });
  screen.querySelector('#s-sheets-disconnect')?.addEventListener('click', () => {
    openConfirm(
      'Disconnect Google Sheets?',
      'Syncing will stop. Your Google Sheet will not be deleted — you can reconnect anytime.',
      'Disconnect',
      () => SheetsSync.disconnect(),
      true
    );
  });

  screen.querySelector('#s-export')?.addEventListener('click', exportData);
  screen.querySelector('#s-import')?.addEventListener('click', importData);
  screen.querySelector('#s-reset')?.addEventListener('click', () => {
    const sheetsNote = SheetsSync.isConnected()
      ? ' Note: this will not delete your Google Sheets backup. You can restore your data later.'
      : '';
    openConfirm(
      'Reset all data?',
      `This will permanently delete all your habits, workouts, weigh-ins, and points. This cannot be undone.${sheetsNote}`,
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
let modalPreviousFocus = null;

function setBackgroundInert(activeEl, inert) {
  const app = document.getElementById('app');
  if (!app || !activeEl) return;
  [...app.children].forEach(child => {
    if (child === activeEl || child.id === 'toast-container') return;
    if (inert) {
      child.setAttribute('aria-hidden', 'true');
      child.setAttribute('inert', '');
      child.inert = true;
    } else {
      child.removeAttribute('aria-hidden');
      child.removeAttribute('inert');
      child.inert = false;
    }
  });
}

function getFocusable(container) {
  return [...container.querySelectorAll('button, [href], input, select, textarea, details, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);
}

function openModal(renderFn) {
  const overlay = document.getElementById('modal-overlay');
  const body    = document.getElementById('modal-body');
  const wasHidden = overlay.classList.contains('hidden');
  if (wasHidden) modalPreviousFocus = document.activeElement;
  overlay.classList.remove('hidden');
  overlay.removeAttribute('aria-hidden');
  body.innerHTML = '';
  renderFn(body);
  modalStack.push(renderFn);
  setBackgroundInert(overlay, true);
  const focusTarget = getFocusable(overlay)[0] || document.getElementById('modal-sheet') || overlay;
  setTimeout(() => focusTarget.focus?.(), 0);

  // Close on backdrop click
  document.getElementById('modal-backdrop').onclick = closeModal;
}

function closeModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.setAttribute('aria-hidden', 'true');
  document.getElementById('modal-body').innerHTML = '';
  modalStack = [];
  setBackgroundInert(overlay, false);
  modalPreviousFocus?.focus?.();
  modalPreviousFocus = null;
}

/* ── Workout Modal ── */

let workoutDraft = { activityId: null, activityLabel: null, priority: false, duration: 30, intensity: 'Moderate', note: '' };

function openWorkoutModal(presetActivity) {
  workoutDraft = { activityId: presetActivity, activityLabel: null, priority: false, duration: 30, intensity: 'Moderate', note: '', date: viewingDate };
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
      if (btn.dataset.id === 'other') {
        openWorkoutOtherStep(body);
        return;
      }
      workoutDraft.activityId    = btn.dataset.id;
      workoutDraft.activityLabel = btn.dataset.label;
      workoutDraft.priority      = btn.dataset.priority === 'true';
      openModal(renderWorkoutStep2);
    });
  });
}

function openWorkoutOtherStep(body) {
  body.innerHTML = `
    <div class="modal-title">Other Activity</div>
    <label class="step-label" for="other-activity-input">What did you do?</label>
    <input type="text" class="form-input mb-8" id="other-activity-input" placeholder="e.g. Hiking, Swimming, Dance…" maxlength="50" autocomplete="off">
    <p class="text-small text-muted mb-16">This will be saved to your activity menu for future sessions.</p>
    <button class="btn btn-primary btn-full" id="other-activity-save">Continue</button>
    <button class="btn btn-outline btn-full mt-8" id="other-activity-back">Back</button>
  `;

  const input = body.querySelector('#other-activity-input');
  input.focus();

  body.querySelector('#other-activity-back').addEventListener('click', () => openModal(renderWorkoutStep1));

  body.querySelector('#other-activity-save').addEventListener('click', () => {
    const label = input.value.trim();
    if (!label) { showToast('Please enter an activity name'); return; }

    // Save to activity defs if not already there
    const activities = Store.getActivityDefs();
    const exists = activities.find(a => a.label.toLowerCase() === label.toLowerCase());
    let actId;
    if (exists) {
      actId = exists.id;
      workoutDraft.priority = exists.priority;
    } else {
      actId = 'custom_' + Date.now();
      activities.push({ id: actId, label, priority: false, custom: true });
      Store.saveActivityDefs(activities);
    }

    workoutDraft.activityId    = actId;
    workoutDraft.activityLabel = label;
    workoutDraft.priority      = workoutDraft.priority || false;
    openModal(renderWorkoutStep2);
  });
}

function renderWorkoutStep2(body) {
  body.innerHTML = `
    <div class="modal-title">${escHtml(workoutDraft.activityLabel || 'Workout')}</div>
    <label class="step-label" for="dur-slider">Duration</label>
    <div class="duration-display" id="dur-display">${workoutDraft.duration} <span>min</span></div>
    <input type="range" id="dur-slider" min="5" max="120" step="5" value="${workoutDraft.duration}">
    <div class="step-label">Intensity</div>
    <div class="intensity-row">
      ${['Easy', 'Moderate', 'Hard'].map(i => `
        <button class="intensity-btn ${workoutDraft.intensity === i ? 'selected' : ''}" data-intensity="${i}">${i}</button>
      `).join('')}
    </div>
    <label class="step-label" for="workout-note">Note (optional)</label>
    <input type="text" class="form-input mb-16" id="workout-note" placeholder="Any notes…" maxlength="100" value="${escHtml(workoutDraft.note)}">
    <label class="step-label" for="workout-date">Date</label>
    <input type="date" class="form-input mb-16" id="workout-date" value="${workoutDraft.date}" max="${todayStr()}">
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

  body.querySelector('#workout-date').addEventListener('change', e => {
    workoutDraft.date = e.target.value || todayStr();
  });

  body.querySelector('#save-workout-btn').addEventListener('click', saveWorkout);
}

function saveWorkout() {
  const note = document.querySelector('#workout-note')?.value || workoutDraft.note;
  const workoutDate = workoutDraft.date || todayStr();
  const workout = {
    id: Date.now().toString(),
    date: workoutDate,
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
  Points.add(pts, `Workout: ${workout.activityLabel}`, workoutDate);

  closeModal();
  showToast(`Workout logged! +${pts} pt${pts > 1 ? 's' : ''}`, 'success');

  // Update habit for the workout date
  const habitKey = workout.priority ? 'move_strength' : 'move_other';
  const hChecked = Store.getHabits(workoutDate);
  if (!hChecked[habitKey]) {
    hChecked[habitKey] = true;
    Store.saveHabits(workoutDate, hChecked);
    if (currentScreen === 'today') renderToday();
  }

  const newBadges = Badges.check(['workout', 'habits']);
  if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 300);

  if (currentScreen === 'exercise') renderExercise();
  updatePointsBadge();
}

/* ── Weigh-in Modal ── */

function checkGoalReached(weight) {
  const s = Store.getSettings();
  if (s.mode === 'maintenance') return; // already in maintenance, no re-trigger
  const low  = s.goalWeightLow;
  const high = s.goalWeightHigh;
  if (!low || !high) return;
  if (weight < low || weight > high) return; // outside range

  // Per-range flag so re-entering range after a dip doesn't re-show
  const flagKey = `goal_reached_${Math.round(low)}_${Math.round(high)}`;
  if (Store.get(flagKey)) return;
  Store.set(flagKey, true);

  setTimeout(() => {
    openModal(body => {
      body.innerHTML = `
        <h2 class="modal-title">You reached your goal.</h2>
        <p style="margin:0 0 20px;font-size:14px;line-height:1.6">This is worth acknowledging. You showed up consistently and it paid off.</p>
        <p style="margin:0 0 24px;font-size:14px;font-weight:500">What would you like to do now?</p>
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn-primary" id="goal-switch-maintenance">Switch to maintenance</button>
          <button class="btn-outline" id="goal-set-new">Set a new goal</button>
        </div>
      `;
      body.querySelector('#goal-switch-maintenance').addEventListener('click', () => {
        const s2 = Store.getSettings();
        s2.mode = 'maintenance';
        Store.saveSettings(s2);
        closeModal();
        showToast('Switched to maintenance mode', 'success');
        updateHeader();
        if (currentScreen === 'week')     renderWeek();
        if (currentScreen === 'progress') renderProgress();
        if (currentScreen === 'settings') renderSettings();
      });
      body.querySelector('#goal-set-new').addEventListener('click', () => {
        closeModal();
        // Navigate to settings and scroll to goal weight fields
        navigate('settings');
        setTimeout(() => {
          const el = document.querySelector('#s-goal-low');
          if (el) { el.focus(); el.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }, 200);
      });
    });
  }, 500); // slight delay so toast clears
}

function openWeighInModal() {
  openModal(body => {
    const weighIns = Store.getWeighIns();
    const last = weighIns.length ? weighIns[weighIns.length-1].weight : '';
      body.innerHTML = `
        <div class="modal-title">Log Weigh-In</div>
        <div class="form-group">
        <label class="form-label" for="weighin-input">Weight (lbs)</label>
        <input class="form-input" id="weighin-input" type="number" step="0.1" placeholder="${last || 'e.g. 162.5'}" inputmode="decimal">
      </div>
      <div class="form-group">
        <label class="form-label" for="weighin-date">Date</label>
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
      const isNewWeighIn = idx < 0;
      if (idx >= 0) weighIns[idx] = { date, weight };
      else weighIns.push({ date, weight });
      weighIns.sort((a,b) => a.date.localeCompare(b.date));
      Store.saveWeighIns(weighIns);

      if (isNewWeighIn) Points.add(3, 'Weekly weigh-in');
      closeModal();
      showToast(isNewWeighIn ? 'Weight logged! +3 pts' : 'Weight updated', 'success');

      const newBadges = Badges.check(['weight']);
      if (newBadges.length) setTimeout(() => Badges.showCelebration(newBadges), 300);

      if (currentScreen === 'week') renderWeek();
      if (currentScreen === 'progress') renderProgress();
      updatePointsBadge();

      // Check for goal range achievement
      checkGoalReached(weight);
    });
  });
}

/* ── Goal Modal ── */

function openGoalModal() {
  openModal(body => _goalScreen1(body));
}

function _goalScreen1(body) {
  const goals = Store.getGoals();
  body.innerHTML = `
    <div class="modal-title">What are you working toward?</div>
    <div class="form-group">
      <label class="form-label" for="goal-name">Goal name</label>
      <input class="form-input" id="goal-name" type="text" placeholder="e.g. Rouje dress"
             value="${escHtml(goals.name || '')}" maxlength="60" autocomplete="off">
    </div>
    <div class="form-group">
      <label class="form-label" for="goal-amount">What does it cost? <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
      <input class="form-input" id="goal-amount" type="number" step="1" min="0"
             placeholder="Dollar amount" value="${goals.amount || ''}">
    </div>
    <button class="btn btn-primary btn-full" id="goal-next-btn">Next</button>
  `;
  body.querySelector('#goal-name').focus();
  body.querySelector('#goal-next-btn').addEventListener('click', () => {
    const name   = body.querySelector('#goal-name').value.trim();
    const amount = parseFloat(body.querySelector('#goal-amount').value) || 0;
    if (!name) { showToast('Enter a goal name'); return; }
    _goalScreen2(body, { name, amount });
  });
}

function _goalScreen2(body, { name, amount }) {
  body.innerHTML = `
    <div class="modal-title">How soon do you want to earn this?</div>
    <div class="goal-level-picker">
      <button class="goal-level-opt" data-level="small">
        <div class="goal-level-label">Small treat</div>
        <div class="goal-level-desc">Earn it quickly</div>
      </button>
      <button class="goal-level-opt" data-level="medium">
        <div class="goal-level-label">Something I really want</div>
        <div class="goal-level-desc">Feels genuinely earned</div>
      </button>
      <button class="goal-level-opt" data-level="big">
        <div class="goal-level-label">Big goal</div>
        <div class="goal-level-desc">Ambitious — the reward means something</div>
      </button>
    </div>
    <button class="btn btn-outline btn-full mt-8" id="goal-back-btn">Back</button>
  `;
  body.querySelectorAll('.goal-level-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      const level = opt.dataset.level;
      _goalScreen3(body, { name, amount, level, pointsTarget: suggestPointsTarget(level) });
    });
  });
  body.querySelector('#goal-back-btn').addEventListener('click', () => _goalScreen1(body));
}

function _goalScreen3(body, { name, amount, level, pointsTarget }) {
  const LABELS  = { small: 'Small treat', medium: 'Something I really want', big: 'Big goal' };
  const weeksEst = estimateWeeks(pointsTarget);
  body.innerHTML = `
    <div class="modal-title">Your goal is set.</div>
    <div class="goal-confirm-card">
      <div class="goal-confirm-name">${escHtml(name)}</div>
      ${amount ? `<div class="goal-confirm-amount">$${amount}</div>` : ''}
      <div class="goal-confirm-target">${pointsTarget} points · ${escHtml(LABELS[level])}</div>
      ${weeksEst ? `<div class="goal-confirm-pace">At your recent pace, about ${weeksEst} week${weeksEst !== 1 ? 's' : ''}.</div>` : ''}
    </div>
    <button class="btn btn-primary btn-full" id="goal-save-btn">Start earning</button>
    <button class="btn btn-outline btn-full mt-8" id="goal-back-btn">Back</button>
  `;
  body.querySelector('#goal-back-btn').addEventListener('click', () => _goalScreen2(body, { name, amount }));
  body.querySelector('#goal-save-btn').addEventListener('click', () => {
    const goals = Store.getGoals();
    // Archive abandoned goal if one was active and unfinished
    if (goals.name && goals.pointsTarget) {
      const spendable = Store.getPoints().spendable;
      if (spendable < goals.pointsTarget) {
        if (!goals.history) goals.history = [];
        goals.history.push({
          name: goals.name, amount: goals.amount || 0,
          pointsTarget: goals.pointsTarget, level: goals.level || 'medium',
          dateSet: goals.dateSet || todayStr(), abandoned: true,
        });
      }
    }
    goals.name         = name;
    goals.amount       = amount;
    goals.pointsTarget = pointsTarget;
    goals.level        = level;
    goals.dateSet      = todayStr();
    Store.saveGoals(goals);
    closeModal();
    showToast('Goal saved!', 'success');
    if (currentScreen === 'week') renderWeek();
  });
}

/* ── Cash Out Modal ── */

function openCashOutModal() {
  const goals  = Store.getGoals();
  const points = Store.getPoints();

  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">Cash Out</div>
      <p style="font-size:15px;margin-bottom:16px;color:var(--text)">
        Cashing out <strong>${escHtml(goals.name)}</strong>.
        <br><span style="font-size:13px;color:var(--text-muted)">${points.spendable} pts earned</span>
      </p>
      <p class="text-muted text-small mb-16">Your spendable balance resets to zero. Lifetime total earned is preserved.</p>
      <button class="btn btn-primary btn-full" id="confirm-cashout-btn">Confirm Cash Out</button>
      <button class="btn btn-outline btn-full mt-8" id="cancel-cashout-btn">Cancel</button>
    `;

    body.querySelector('#cancel-cashout-btn').addEventListener('click', closeModal);
    body.querySelector('#confirm-cashout-btn').addEventListener('click', () => {
      const goals2  = Store.getGoals();
      const points2 = Store.getPoints();
      if (!goals2.history) goals2.history = [];
      goals2.history.push({
        name: goals2.name, date: todayStr(),
        points: points2.spendable, pointsTarget: goals2.pointsTarget || null,
        level: goals2.level || null, daysToEarn: goals2.dateSet
          ? Math.round((Date.now() - parseDate(goals2.dateSet).getTime()) / 86400000) : null,
      });
      const goalName2  = goals2.name;
      const goalAmount = goals2.amount;
      goals2.name = ''; goals2.amount = 0; goals2.pointsTarget = null;
      goals2.level = null; goals2.dateSet = null;
      Store.saveGoals(goals2);
      points2.spendable = 0;
      Store.savePoints(points2);

      const newBadges = Badges.check(['rewards']);
      closeModal();
      // Dollars appear only here, at the celebration moment
      const celebMsg = goalAmount
        ? `You earned it: ${goalName2 || 'Your goal'} ($${parseFloat(goalAmount).toFixed(2)})`
        : `You earned it: ${goalName2 || 'Your goal'}`;
      celebrate('🛍️', celebMsg);
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
      <p class="text-muted text-small mb-16">Pick a domain to prioritize, or write a short intention.</p>
      <div class="pillar-choice-grid">
        ${['sleep','nutrition','movement','stress'].map(p => `
          <button class="pillar-choice-btn" data-pillar="${p}">
            <div class="dot pillar-dot ${p}"></div>
            ${PILLAR_META[p].label}
          </button>
        `).join('')}
      </div>
      <div class="form-group">
        <label class="form-label" for="intention-text">Custom intention</label>
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
      i[wsStr] = { skipped: true };
      Store.saveWeeklyIntentions(i);
      closeModal();
      renderWeek();
    });

    body.querySelector('#save-intention-btn').addEventListener('click', () => {
      const text = body.querySelector('#intention-text').value.trim();
      if (!selectedPillar && !text) {
        showToast('Pick a domain or write an intention');
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
        <label class="form-label" for="adj-amount">Adjustment amount (+ to add, - to deduct)</label>
        <input class="form-input" id="adj-amount" type="number" step="1" placeholder="e.g. 10 or -5">
      </div>
      <div class="form-group">
        <label class="form-label" for="adj-reason">Reason</label>
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

  // Toggle on/off (core habits get a one-line pushback)
  body.querySelectorAll('.habit-toggle').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const habits  = Store.getHabitDefs();
      const h       = habits.find(x => x.id === toggle.dataset.id);
      if (!h) return;

      const isCore      = CORE_HABIT_IDS.includes(h.id);
      const isDisabling = !toggle.checked;

      if (isCore && isDisabling) {
        toggle.checked = true; // revert visually while confirming
        const pushback = CORE_HABIT_PUSHBACK[h.id] || 'This is a core habit for weight loss. Are you sure?';
        openModal(b => {
          b.innerHTML = `
            <div class="modal-title" style="margin-bottom:12px">Remove core habit?</div>
            <p style="font-size:14px;color:var(--text-muted);margin-bottom:24px;line-height:1.5">${escHtml(pushback)}</p>
            <button class="btn btn-outline btn-full" id="core-remove-btn">Remove anyway</button>
            <button class="btn btn-primary btn-full mt-8" id="core-keep-btn">Keep it</button>
          `;
          b.querySelector('#core-remove-btn').addEventListener('click', () => {
            const habits2 = Store.getHabitDefs();
            const h2 = habits2.find(x => x.id === toggle.dataset.id);
            if (h2) { h2.enabled = false; Store.saveHabitDefs(habits2); }
            if (currentScreen === 'today') renderToday();
            openModal(renderHabitsCustomizerBody);
          });
          b.querySelector('#core-keep-btn').addEventListener('click', () => {
            openModal(renderHabitsCustomizerBody);
          });
        });
      } else {
        if (h) { h.enabled = toggle.checked; Store.saveHabitDefs(habits); }
        if (currentScreen === 'today') renderToday();
      }
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
            <label class="form-label" for="new-habit-label">Habit name</label>
            <input class="form-input" id="new-habit-label" type="text" placeholder="e.g. Took vitamins" maxlength="60" autocomplete="off">
          </div>
          <div class="form-group">
            <label class="form-label" for="new-habit-pillar">Domain</label>
            <select class="form-input form-select" id="new-habit-pillar">
              ${['sleep','nutrition','movement','stress'].map(p =>
                `<option value="${p}" ${p === pillar ? 'selected' : ''}>${PILLAR_META[p].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-habit-also">Also contributes to <span style="font-weight:400;text-transform:none;letter-spacing:0">(optional)</span></label>
            <select class="form-input form-select" id="new-habit-also">
              <option value="">— None —</option>
              ${['sleep','nutrition','movement','stress'].filter(p => p !== pillar).map(p =>
                `<option value="${p}">${PILLAR_META[p].label}</option>`
              ).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="new-habit-pts">Points</label>
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
          ${a.custom ? `<button class="activity-delete-btn" data-id="${a.id}" title="Delete activity" style="margin-left:auto;background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:16px;padding:4px 6px">✕</button>` : ''}
        </div>
      `;
    });
    html += `<p class="text-muted text-small mt-8" style="padding:0 4px">Priority activities earn 2 pts and get the strength training visual distinction. Custom activities (marked ✕) can be deleted.</p>`;
    body.innerHTML = html;

    body.querySelectorAll('.activity-priority').forEach(toggle => {
      toggle.addEventListener('change', () => {
        const activities = Store.getActivityDefs();
        activities[parseInt(toggle.dataset.idx)].priority = toggle.checked;
        Store.saveActivityDefs(activities);
        openActivitiesCustomizer();
      });
    });

    body.querySelectorAll('.activity-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const updated = Store.getActivityDefs().filter(a => a.id !== id);
        Store.saveActivityDefs(updated);
        openActivitiesCustomizer();
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
    <div class="celebration-icon"></div>
    <div class="celebration-title"></div>
    <div class="celebration-text"></div>
    <button class="btn btn-primary" id="celebrate-close">Got it</button>
  `;
  el.querySelector('.celebration-icon').textContent = title.split(' ')[0] || '';
  el.querySelector('.celebration-title').textContent = title.replace(/^\S+\s/, '');
  el.querySelector('.celebration-text').textContent = message;
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

/* ─── Data Export / Import ───────────────────────────────────────────────── */

function getAppStateBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('bloom_')) data[k] = localStorage.getItem(k);
  }
  return data;
}

function restoreAppStateBackup(data) {
  if (!data || typeof data !== 'object') return;
  Object.entries(data).forEach(([k, v]) => {
    if (k.startsWith('bloom_') && typeof v === 'string') localStorage.setItem(k, v);
  });
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'application/json,.json';
  input.addEventListener('change', () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const keys = Object.keys(data).filter(k => k.startsWith('bloom_'));
        if (keys.length === 0) { showToast('No Bloom data found in that file.'); return; }
        openConfirm(
          'Import and overwrite?',
          `This will replace all current data with the backup (${keys.length} items). This cannot be undone.`,
          'Import',
          () => {
            keys.forEach(k => localStorage.setItem(k, data[k]));
            showToast('Data imported. Reloading…', 'success');
            setTimeout(() => window.location.reload(), 1200);
          },
          true
        );
      } catch {
        showToast('Could not read that file. Make sure it\'s a Bloom JSON export.');
      }
    };
    reader.readAsText(file);
  });
  input.click();
}

function exportData() {
  const data = getAppStateBackup();
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
  const overlay = document.getElementById('modal-overlay');
  const modalOpen = overlay && !overlay.classList.contains('hidden');
  const onboarding = document.getElementById('onboarding');
  const trapEl = modalOpen ? overlay : onboarding;
  if (e.key === 'Escape' && modalOpen) closeModal();
  if (e.key === 'Tab' && trapEl) {
    const focusable = getFocusable(trapEl);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

/* ─── First-visit Hints ──────────────────────────────────────────────────── */

const HINTS = {
  today:    "Tap the checkbox to check off a habit. Tap the habit name to see the science behind it.",
  week:     "These bars update as you check off habits each day. They reflect your week so far — not how much of the week is left.",
  exercise: "Log any workout in three taps. Strength sessions are weighted as the priority domain for body composition.",
  progress: "The trend line matters more than individual weeks — especially postpartum. Focus on the direction, not the number.",
};

function showHintIfNeeded(screen) {
  const key = `bloom_hint_${screen}_seen`;
  if (localStorage.getItem(key)) return;
  const text = HINTS[screen];
  if (!text) return;

  const hint = document.createElement('div');
  hint.className = 'screen-hint';
  hint.innerHTML = `
    <span class="screen-hint-text">${text}</span>
    <button class="screen-hint-close" aria-label="Dismiss">&times;</button>
  `;
  hint.querySelector('.screen-hint-close').addEventListener('click', () => {
    localStorage.setItem(key, '1');
    hint.remove();
  });

  const screenEl = document.getElementById(`screen-${screen}`);
  if (screenEl) screenEl.insertAdjacentElement('afterbegin', hint);
}

/* ─── How Bloom Works ────────────────────────────────────────────────────── */

function openHowBloomWorks() {
  openModal(body => {
    body.innerHTML = `
      <div class="modal-title">How Bloom works</div>

      <div class="how-section">
        <div class="how-heading">The daily check-in</div>
        <p>Open the Today screen and tap habits as you complete them throughout the day. Each check-off earns points immediately and habits reset at midnight. If you forget to log a day, use the "Log a past day" button at the bottom of the Today screen -- you can go back up to 7 days and check off anything you actually did. The goal is to make this a 60-second interaction, not a planning session.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Your core habits and bonus habits</div>
        <p>Six habits are marked as core commitments: bedtime, protein breakfast, evening eating cutoff, protein and plants at lunch and dinner, and strength training. Completing at least five of those six is what counts as a streak day. Everything else on your list is a bonus habit. Bonus habits still earn points and contribute to your domain bars -- they just don't affect the streak.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Understanding your domain bars</div>
        <p>Your habits feed into four domains: Sleep, Nutrition, Movement, and Stress &amp; Recovery. The domain bars on the This Week screen fill based on your completions for the week so far, measured against days elapsed rather than all seven days -- so on a Tuesday, you're compared against two days of possible habits, not a full week. A few habits cross domains: the morning walk counts toward both Movement and Sleep, and mobility work counts toward both Movement and Stress.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">The streak system</div>
        <p>Your streak counts consecutive days where you completed at least five of your six core habits. One grace day per calendar week is built in -- if you miss a day, the streak survives as long as it's the only miss that week. The streak counter appears on the Today screen once you have a streak of 1 or more days. Milestones at 7, 21, 66, 90, 180, and 365 days are tracked in the Progress screen and earn badges permanently -- breaking a streak never removes a badge you've already earned.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">The savings bar and rewards</div>
        <p>Set a specific reward goal -- something you want to buy or experience. Every point earns toward your goal, and when the bar fills you tap "Cash out." The idea is simple: you commit to not buying that thing until you've earned it, and the app tracks the permission. Past goals are saved in your rewards history on the Progress screen.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Logging exercise</div>
        <p>On the Exercise screen, tap "Log a workout" and choose an activity, duration, and intensity. Checking the strength training habit on Today will prompt the workout log automatically. Strength training sessions are marked as priority because resistance training preserves lean muscle mass during weight loss. The Exercise screen shows your weekly totals and full workout history.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Reading your progress</div>
        <p>The Progress screen shows your full weight history with a smoothed trend line overlaid -- the trend is what to watch, not individual weeks. Milestone markers show your first 5 and 10 lbs lost and whether you've reached your goal range. If you switch to maintenance mode after reaching your goal, the target line changes to a shaded band showing your maintenance range. The Progress screen also shows your streak history, earned badges, and any optional tracking you have turned on.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Optional features</div>
        <p>Five optional features are available under Settings -- Optional Features. Sleep tracking adds a morning card to log your estimated sleep window and shows a bar chart over time. The mood, energy, and motivation log adds a daily check-in with pattern charts on the Progress screen. Progress photos lets you capture a monthly photo and view them as a timeline. Measurement tracking records body measurements monthly with a line graph. Notifications let you set up to four optional reminders including streak protection, weigh-in nudge, bedtime reminder, and a morning check-in. All optional features are off by default and can be turned on or off at any time.</p>
      </div>

      <div class="how-section">
        <div class="how-heading">Customizing your habits</div>
        <p>In Settings you can toggle any habit on or off, rename items to match your own language, adjust point values, and add custom habits to any domain. The activity menu for workouts is fully editable. Core habits will ask for confirmation before being removed since they affect the streak calculation.</p>
      </div>

      <div class="how-section" style="border-bottom:none">
        <div class="how-heading">Your data and backup</div>
        <p>Everything is stored locally on your device -- no account, no server, no one else can see it. Use Export Data in Settings regularly to download a backup. If your browser cache is ever cleared, that backup is the only way to restore your history. Google Sheets sync is also available under Settings -- Data if you want a live copy of your data automatically backed up to your own Google Drive.</p>
      </div>
    `;
  });
}

/* ─── Onboarding ─────────────────────────────────────────────────────────── */

let obScreen = 0;

function openOnboarding() {
  if (Store.get('onboarding_complete')) return;

  const el = document.createElement('div');
  el.id = 'onboarding';
  el.innerHTML = `
    <button id="ob-skip">Skip</button>
    <div id="ob-screens"></div>
    <div id="ob-dots"></div>
  `;
  document.getElementById('app').appendChild(el);
  setBackgroundInert(el, true);

  document.getElementById('ob-skip').addEventListener('click', closeOnboarding);
  renderObScreen(0);
  setTimeout(() => getFocusable(el)[0]?.focus(), 0);
}

const OB_SCREENS = [
  // Screen 1 — Welcome
  () => `
    <div class="ob-screen">
      <img src="apple-touch-icon.png" alt="Bloom" class="ob-logo">
      <h1 class="ob-headline">A wellness tracker that works with postpartum life, not against it.</h1>
      <p class="ob-body">Built around four domains and daily habits — not calorie counting, not macro tracking.</p>
      <button class="ob-btn" id="ob-next">Next</button>
    </div>
  `,
  // Screen 2 — How it works
  () => `
    <div class="ob-screen">
      <h1 class="ob-headline">Habits, not numbers.</h1>
      <p class="ob-body">Bloom tracks the behaviors that research shows actually drive postpartum weight loss and wellbeing — sleep, nutrition, movement, and stress recovery. These are the four domains your daily habits feed into.</p>
      <p class="ob-body">Research consistently shows that behavior-based approaches outperform calorie and macro tracking for long-term results. They're more sustainable, easier to maintain, and better suited to postpartum life where cognitive load is already high.</p>
      <div class="ob-domains">
        <div class="ob-domain ob-domain-sleep">Sleep</div>
        <div class="ob-domain ob-domain-nutrition">Nutrition</div>
        <div class="ob-domain ob-domain-movement">Movement</div>
        <div class="ob-domain ob-domain-stress">Stress &amp; Recovery</div>
      </div>
      <button class="ob-btn" id="ob-next">Next</button>
    </div>
  `,
  // Screen 3 — Reward goal
  () => {
    const g = Store.getGoals();
    return `<div class="ob-screen">
      <h1 class="ob-headline">What are you working toward?</h1>
      <p class="ob-body">Every habit you check off earns points toward a personal reward. Set a goal now or come back to it later.</p>
      <div class="ob-chips">
        <button class="ob-chip" data-label="Something to wear">👗 Something to wear</button>
        <button class="ob-chip" data-label="An experience">✨ An experience</button>
        <button class="ob-chip" data-label="Something for the home">🏠 Something for the home</button>
        <button class="ob-chip" data-label="A treat">🌿 A treat</button>
        <button class="ob-chip" data-label="A savings goal">💰 A savings goal</button>
        <button class="ob-chip" data-label="">＋ Something else</button>
      </div>
      <div class="form-group">
        <input class="form-input" id="ob-goal-name" type="text" aria-label="Goal name" placeholder="Name your goal" maxlength="60" autocomplete="off" value="${escHtml(g.name || '')}">
      </div>
      <div class="form-group">
        <input class="form-input" id="ob-goal-amount" type="number" aria-label="Goal cost" placeholder="How much does it cost? ($)" step="1" min="0" value="${g.amount || ''}">
      </div>
      <p class="ob-note">You can change this anytime in Settings.</p>
      <button class="ob-btn" id="ob-next">Next</button>
      <button class="ob-skip-step" id="ob-skip-goal">I'll set this later</button>
    </div>`;
  },
  // Screen 4 — Quick setup
  () => {
    const s = Store.getSettings();
    return `<div class="ob-screen">
      <h1 class="ob-headline">A few things to get you started.</h1>
      <p class="ob-body">You can update all of these anytime in Settings.</p>
      <div class="form-group">
        <input class="form-input" id="ob-name" type="text" aria-label="Name" placeholder="What should we call you?" maxlength="40" autocomplete="off" value="${escHtml(s.name || '')}">
      </div>
      <div class="form-group">
        <input class="form-input" id="ob-start-weight" type="number" aria-label="Starting weight" placeholder="Starting weight (lbs)" step="0.1" min="50" value="${s.startingWeight || ''}">
        <p class="ob-note" style="margin-top:8px">Used to track your progress over time.</p>
      </div>
      <div class="form-group">
        <label class="form-label">Goal weight range (lbs)</label>
        <div style="display:flex;gap:8px;align-items:center">
          <input class="form-input" id="ob-goal-low"  type="number" aria-label="Goal weight low" placeholder="From" step="0.5" style="flex:1" value="${s.goalWeightLow || ''}">
          <span style="color:var(--text-muted);flex-shrink:0">to</span>
          <input class="form-input" id="ob-goal-high" type="number" aria-label="Goal weight high" placeholder="To"   step="0.5" style="flex:1" value="${s.goalWeightHigh || ''}">
        </div>
      </div>
      <div class="toggle-row" style="border:none;padding:0;margin-bottom:16px">
        <div>
          <div class="toggle-label">Breastfeeding mode</div>
          <div class="toggle-sublabel">Adjusts guidance and messaging throughout the app to reflect breastfeeding.</div>
        </div>
        <label class="toggle" style="flex-shrink:0;margin-left:12px">
          <input type="checkbox" id="ob-bf" ${s.breastfeeding ? 'checked' : ''}>
          <div class="toggle-track"></div>
        </label>
      </div>
      <button class="ob-btn" id="ob-next">Next</button>
    </div>`;
  },
  // Screen 5 — Done
  () => {
    const bf = Store.getSettings().breastfeeding;
    return `
      <div class="ob-screen">
        <img src="apple-touch-icon.png" alt="Bloom" class="ob-logo">
        <h1 class="ob-headline">You're all set.</h1>
        <p class="ob-body">Check in daily, reflect weekly, and let the consistency do the work. Postpartum progress is not linear — the domains are there to show you the full picture, not just the scale.</p>
        ${bf ? `<p class="ob-body" style="font-style:italic;font-size:13px">Breastfeeding mode is on. Timelines and messages throughout the app reflect what's actually happening in your body, not generic weight loss expectations.</p>` : ''}
        <button class="ob-btn" id="ob-next">Get started</button>
      </div>
    `;
  },
];

function renderObScreen(n) {
  obScreen = n;
  const container = document.getElementById('ob-screens');
  if (!container) return;

  container.innerHTML = OB_SCREENS[n]();
  container.style.opacity = '0';
  requestAnimationFrame(() => { container.style.transition = 'opacity 0.25s'; container.style.opacity = '1'; });

  // Dots
  const dots = document.getElementById('ob-dots');
  if (dots) {
    dots.innerHTML = OB_SCREENS.map((_, i) =>
      `<div class="ob-dot ${i === n ? 'active' : ''}"></div>`
    ).join('');
  }

  // Next button
  document.getElementById('ob-next')?.addEventListener('click', () => obAdvance(n));
  setTimeout(() => getFocusable(document.getElementById('onboarding'))[0]?.focus(), 0);

  // Screen 3 chips
  document.querySelectorAll('.ob-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.getElementById('ob-goal-name').value = chip.dataset.label;
      document.querySelectorAll('.ob-chip').forEach(c => c.classList.remove('selected'));
      chip.classList.add('selected');
    });
  });
  document.getElementById('ob-skip-goal')?.addEventListener('click', () => renderObScreen(n + 1));

  // Swipe left/right to navigate
  let touchStartX = 0, touchStartY = 0;
  container.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  container.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return; // too small or mostly vertical
    if (dx < 0) {
      obAdvance(n);              // swipe left → next (saves + advances)
    } else if (n > 0) {
      obSaveScreen(n);           // save current inputs before going back
      renderObScreen(n - 1);    // swipe right → back
    }
  }, { passive: true });
}

function obSaveScreen(n) {
  if (n === 2) {
    const name   = document.getElementById('ob-goal-name')?.value.trim();
    const amount = parseFloat(document.getElementById('ob-goal-amount')?.value);
    if (name) {
      const goals = Store.getGoals();
      goals.name         = name;
      goals.amount       = isNaN(amount) ? 0 : amount;
      goals.pointsTarget = goals.pointsTarget || 120; // default: "Something I really want"
      goals.level        = goals.level        || 'medium';
      goals.dateSet      = goals.dateSet      || todayStr();
      Store.saveGoals(goals);
    }
  }
  if (n === 3) {
    const s  = Store.getSettings();
    const name = document.getElementById('ob-name')?.value.trim();
    const sw   = parseFloat(document.getElementById('ob-start-weight')?.value);
    const gl   = parseFloat(document.getElementById('ob-goal-low')?.value);
    const gh   = parseFloat(document.getElementById('ob-goal-high')?.value);
    const bf   = document.getElementById('ob-bf')?.checked;
    if (name)    s.name           = name;
    if (!isNaN(sw)) s.startingWeight = sw;
    if (!isNaN(gl)) s.goalWeightLow  = gl;
    if (!isNaN(gh)) s.goalWeightHigh = gh;
    s.breastfeeding = bf || false;
    Store.saveSettings(s);
  }
}

function obAdvance(n) {
  obSaveScreen(n);

  if (n >= OB_SCREENS.length - 1) {
    closeOnboarding();
  } else {
    renderObScreen(n + 1);
  }
}

function closeOnboarding() {
  Store.set('onboarding_complete', true);
  const el = document.getElementById('onboarding');
  if (el) {
    setBackgroundInert(el, false);
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s';
    setTimeout(() => { el.remove(); showHintIfNeeded(currentScreen); }, 300);
  }
}

/* ─── Init ───────────────────────────────────────────────────────────────── */

/* ─── Google Sheets Sync ─────────────────────────────────────────────────── */

const SheetsSync = {
  _gapiReady:    false,
  _debounceTimer: null,
  _restoring:    false,

  // ── Stored state ──────────────────────────────────────────────────────────

  getStoredToken() {
    try { return JSON.parse(localStorage.getItem('bloom_google_token')); } catch { return null; }
  },
  setStoredToken(t) {
    if (t) localStorage.setItem('bloom_google_token', JSON.stringify(t));
    else   localStorage.removeItem('bloom_google_token');
  },
  getSheetId()    { return localStorage.getItem('bloom_sheets_id') || null; },
  setSheetId(id)  {
    if (id) localStorage.setItem('bloom_sheets_id', id);
    else    localStorage.removeItem('bloom_sheets_id');
  },
  getLastSynced() { return localStorage.getItem('bloom_last_synced') || null; },
  setLastSynced(t){
    if (t) localStorage.setItem('bloom_last_synced', t);
    else   localStorage.removeItem('bloom_last_synced');
  },
  getAccount()    { return localStorage.getItem('bloom_sync_account') || null; },
  setAccount(e)   {
    if (e) localStorage.setItem('bloom_sync_account', e);
    else   localStorage.removeItem('bloom_sync_account');
  },
  getQueue() {
    try { return JSON.parse(localStorage.getItem('bloom_sync_queue') || '[]'); } catch { return []; }
  },
  setQueue(q) { localStorage.setItem('bloom_sync_queue', JSON.stringify(q)); },

  isConnected() { return !!(this.getStoredToken() && this.getSheetId()); },

  // ── App load init ─────────────────────────────────────────────────────────

  async init() {
    if (!this.isConnected()) return;
    const token = this.getStoredToken();
    if (!token) return;
    if (token.expires_at && Date.now() < token.expires_at - 60000) {
      try {
        await this._loadGapi();
        gapi.client.setToken({ access_token: token.access_token });
        this._gapiReady = true;
        await this._retryQueue();
      } catch {}
    }
    this._checkStaleness();
  },

  // ── OAuth connect ─────────────────────────────────────────────────────────

  async connect() {
    if (!GOOGLE_CLIENT_ID) {
      showToast('No Google Client ID configured. See the GOOGLE_CLIENT_ID constant in app.js.');
      return;
    }
    try { await this._loadGapi(); }
    catch {
      showToast('Google API failed to load. Check your connection.');
      return;
    }
    return new Promise((resolve, reject) => {
      const tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email',
        callback: async (resp) => {
          if (resp.error) { reject(new Error(resp.error)); return; }
          const tokenData = {
            access_token: resp.access_token,
            expires_at:   Date.now() + (parseInt(resp.expires_in) * 1000),
          };
          this.setStoredToken(tokenData);
          gapi.client.setToken({ access_token: resp.access_token });
          this._gapiReady = true;
          try {
            const userResp = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${resp.access_token}` }
            });
            const info = await userResp.json();
            if (info.email) this.setAccount(info.email);
          } catch {}
          try {
            const sheetId = await this._createSpreadsheet();
            this.setSheetId(sheetId);
            localStorage.removeItem('bloom_google_reauth_needed');
            await this.syncAll();
            showToast('Backup connected. Your data is now syncing to Google Sheets in your Drive.', 'success');
            renderSettings();
            resolve();
          } catch(e) { reject(e); }
        }
      });
      tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  },

  disconnect() {
    this.setStoredToken(null);
    this.setSheetId(null);
    this.setLastSynced(null);
    this.setAccount(null);
    this.setQueue([]);
    localStorage.removeItem('bloom_google_reauth_needed');
    renderSettings();
  },

  // ── Debounced sync trigger (called by Store save methods) ─────────────────

  schedule() {
    if (!this.isConnected() || this._restoring) return;
    clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => { this.syncAll(); }, 3000);
  },

  // ── Full sync ─────────────────────────────────────────────────────────────

  async syncAll() {
    if (!this.isConnected()) return;
    try {
      await this._ensureToken();
      const id = this.getSheetId();
      await this._syncWeighInsTab(id);
      await this._syncHabitsTab(id);
      await this._syncWorkoutsTab(id);
      await this._syncPointsTab(id);
      await this._syncGoalsTab(id);
      await this._syncSettingsTab(id);
      await this._syncBadgesTab(id);
      this.setLastSynced(new Date().toISOString());
      this.setQueue([]);
      localStorage.removeItem('bloom_google_reauth_needed');
      // Refresh settings panel if open
      const el = document.querySelector('#screen-settings');
      if (el && el.classList.contains('active')) renderSettings();
    } catch(e) {
      this._queueSync();
      if (e.message === 'Token expired' || (e.status && e.status === 401)) {
        localStorage.setItem('bloom_google_reauth_needed', '1');
      }
    }
  },

  // ── Token management ──────────────────────────────────────────────────────

  async _ensureToken() {
    const token = this.getStoredToken();
    if (!token) throw new Error('Not connected');
    if (token.expires_at && Date.now() > token.expires_at - 60000) throw new Error('Token expired');
    if (!this._gapiReady) {
      await this._loadGapi();
      gapi.client.setToken({ access_token: token.access_token });
      this._gapiReady = true;
    }
  },

  async _loadGapi() {
    if (this._gapiReady) return;
    await new Promise((resolve, reject) => {
      if (typeof gapi === 'undefined') { reject(new Error('gapi not loaded')); return; }
      gapi.load('client', { callback: resolve, onerror: reject });
    });
    await gapi.client.init({});
    await gapi.client.load('https://sheets.googleapis.com/$discovery/rest?version=v4');
  },

  // ── Offline queue ─────────────────────────────────────────────────────────

  _queueSync() {
    const q = this.getQueue();
    q.push({ ts: Date.now() });
    if (q.length > 50) q.splice(0, q.length - 50);
    this.setQueue(q);
  },

  async _retryQueue() {
    if (this.getQueue().length > 0) await this.syncAll();
  },

  _checkStaleness() {
    const last = this.getLastSynced();
    if (!last) return;
    const daysSince = (Date.now() - new Date(last).getTime()) / 86400000;
    if (daysSince > 7) localStorage.setItem('bloom_google_reauth_needed', '1');
  },

  // ── Spreadsheet creation ──────────────────────────────────────────────────

  async _createSpreadsheet() {
    const resp = await gapi.client.sheets.spreadsheets.create({
      resource: {
        properties: { title: 'Bloom Data' },
        sheets: [
          { properties: { title: 'Weigh-ins'    } },
          { properties: { title: 'Daily Habits' } },
          { properties: { title: 'Workouts'     } },
          { properties: { title: 'Points'       } },
          { properties: { title: 'Goals'        } },
          { properties: { title: 'Settings'     } },
          { properties: { title: 'Badges'       } },
        ]
      }
    });
    return resp.result.spreadsheetId;
  },

  // ── Tab write helper ──────────────────────────────────────────────────────

  async _writeTab(spreadsheetId, tabName, rows) {
    await gapi.client.sheets.spreadsheets.values.clear({ spreadsheetId, range: tabName });
    if (rows.length === 0) return;
    await gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: 'RAW',
      resource: { values: rows }
    });
  },

  // ── Per-tab sync ──────────────────────────────────────────────────────────

  async _syncWeighInsTab(id) {
    const rows = [['Date', 'Weight (lbs)', 'Notes']];
    Store.getWeighIns().sort((a,b) => a.date.localeCompare(b.date))
      .forEach(w => rows.push([w.date, w.weight, w.notes || '']));
    await this._writeTab(id, 'Weigh-ins', rows);
  },

  async _syncHabitsTab(id) {
    const dates = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k.startsWith('bloom_habits_')) dates.push(k.replace('bloom_habits_', ''));
    }
    dates.sort();
    const habitIds = Store.getHabitDefs().map(h => h.id);
    const rows = [['Date', ...habitIds]];
    dates.forEach(date => {
      const checked = Store.getHabits(date);
      rows.push([date, ...habitIds.map(id => checked[id] ? 'TRUE' : 'FALSE')]);
    });
    await this._writeTab(id, 'Daily Habits', rows);
  },

  async _syncWorkoutsTab(id) {
    const rows = [['Date', 'Activity', 'Duration (min)', 'Intensity', 'Notes']];
    Store.getWorkouts().slice().sort((a,b) => a.date.localeCompare(b.date))
      .forEach(w => rows.push([w.date, w.activity || '', w.duration || '', w.intensity || '', w.notes || '']));
    await this._writeTab(id, 'Workouts', rows);
  },

  async _syncPointsTab(id) {
    const points = Store.getPoints();
    const rows = [['Date', 'Event', 'Points Earned', 'Running Total', 'Spendable Balance']];
    let running = 0;
    (points.history || []).forEach(evt => {
      running += (evt.amount || 0);
      rows.push([evt.date || '', evt.reason || '', evt.amount || 0, running, '']);
    });
    if (rows.length > 1) rows[rows.length - 1][4] = points.spendable || 0;
    await this._writeTab(id, 'Points', rows);
  },

  async _syncGoalsTab(id) {
    const goals = Store.getGoals();
    const rows = [['Date Set', 'Goal Name', 'Goal Amount ($)', 'Amount Earned ($)', 'Date Cashed Out', 'Status']];
    if (goals.name) rows.push([goals.dateSet || '', goals.name, goals.amount || 0, goals.earned || 0, '', 'Active']);
    (goals.history || []).forEach(g =>
      rows.push([g.dateSet || '', g.name || '', g.amount || 0, g.earned || 0, g.dateCashedOut || '', 'Cashed out'])
    );
    await this._writeTab(id, 'Goals', rows);
  },

  async _syncSettingsTab(id) {
    const settings = Store.getSettings();
    const rows = [['Key', 'Value']];
    Object.entries(settings).forEach(([k, v]) => rows.push([k, v === null ? '' : String(v)]));
    rows.push(['_points_json',  JSON.stringify(Store.getPoints())]);
    rows.push(['_goals_json',   JSON.stringify(Store.getGoals())]);
    rows.push(['_habitdefs_json', JSON.stringify(Store.getHabitDefs())]);
    const appStateJson = JSON.stringify(getAppStateBackup());
    const chunkSize = 40000;
    for (let i = 0; i < appStateJson.length; i += chunkSize) {
      rows.push([`_appstate_json_${String(i / chunkSize).padStart(3, '0')}`, appStateJson.slice(i, i + chunkSize)]);
    }
    await this._writeTab(id, 'Settings', rows);
  },

  async _syncBadgesTab(id) {
    const badges = Store.getBadges();
    const rows = [['Badge ID', 'Badge Name', 'Date Earned']];
    Object.entries(badges).forEach(([badgeId, dateEarned]) => {
      const def = BADGE_DEFINITIONS.find(b => b.id === badgeId);
      rows.push([badgeId, def ? def.label : badgeId, dateEarned || '']);
    });
    await this._writeTab(id, 'Badges', rows);
  },

  // ── Restore ───────────────────────────────────────────────────────────────

  async restoreAll() {
    this._restoring = true;
    try {
      await this._ensureToken();
      const id = this.getSheetId();

      // Settings tab first — contains JSON blobs for complex state
      const settingsResp = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Settings!A:B' });
      const settingsMap = {};
      (settingsResp.result.values || []).slice(1).forEach(([k, v]) => { if (k) settingsMap[k] = v || ''; });

      // Restore settings object
      const s = { ...DEFAULT_SETTINGS };
      Object.keys(DEFAULT_SETTINGS).forEach(k => {
        if (settingsMap[k] === undefined) return;
        const v = settingsMap[k];
        if (v === 'true') s[k] = true;
        else if (v === 'false') s[k] = false;
        else if (v !== '' && !isNaN(Number(v)) && typeof DEFAULT_SETTINGS[k] === 'number') s[k] = Number(v);
        else s[k] = v;
      });
      Store.saveSettings(s);

      // Restore complex state from JSON blobs
      const appStateJson = Object.keys(settingsMap)
        .filter(k => k.startsWith('_appstate_json_'))
        .sort()
        .map(k => settingsMap[k])
        .join('');
      if (appStateJson) { try { restoreAppStateBackup(JSON.parse(appStateJson)); } catch {} }
      if (settingsMap['_points_json'])    { try { Store.savePoints(JSON.parse(settingsMap['_points_json'])); } catch {} }
      if (settingsMap['_goals_json'])     { try { Store.saveGoals(JSON.parse(settingsMap['_goals_json'])); } catch {} }
      if (settingsMap['_habitdefs_json']) { try { Store.set('habit_defs', JSON.parse(settingsMap['_habitdefs_json'])); } catch {} }

      // Weigh-ins
      const wiResp = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Weigh-ins!A:C' });
      const weighIns = (wiResp.result.values || []).slice(1).filter(r => r[0]).map(r => ({
        date: r[0], weight: parseFloat(r[1]) || 0, notes: r[2] || ''
      }));
      Store.saveWeighIns(weighIns);

      // Habits (per-date)
      const habResp = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Daily Habits' });
      const habRows = habResp.result.values || [];
      if (habRows.length > 1) {
        const habitIds = habRows[0].slice(1);
        habRows.slice(1).forEach(row => {
          if (!row[0]) return;
          const checked = {};
          habitIds.forEach((hId, i) => { checked[hId] = row[i + 1] === 'TRUE'; });
          Store.saveHabits(row[0], checked);
        });
      }

      // Workouts
      const woResp = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Workouts!A:E' });
      const workouts = (woResp.result.values || []).slice(1).filter(r => r[0]).map((r, i) => ({
        id: i + 1, date: r[0], activity: r[1] || '', duration: r[2] ? parseInt(r[2]) : null,
        intensity: r[3] || '', notes: r[4] || ''
      }));
      Store.saveWorkouts(workouts);

      // Badges
      const badgeResp = await gapi.client.sheets.spreadsheets.values.get({ spreadsheetId: id, range: 'Badges!A:C' });
      const badges = {};
      (badgeResp.result.values || []).slice(1).filter(r => r[0]).forEach(r => { badges[r[0]] = r[2] || todayStr(); });
      Store.saveBadges(badges);

      this.setLastSynced(new Date().toISOString());
    } finally {
      this._restoring = false;
    }
  },

  // ── Named public API (all route through schedule for debouncing) ───────────

  syncWeighIn()  { this.schedule(); },
  syncHabits()   { this.schedule(); },
  syncWorkout()  { this.schedule(); },
  syncPoints()   { this.schedule(); },
  syncSettings() { this.schedule(); },
  syncGoal()     { this.schedule(); },
  syncBadge()    { this.schedule(); },

  // ── Helpers ───────────────────────────────────────────────────────────────

  formatLastSynced() {
    const t = this.getLastSynced();
    if (!t) return 'Never';
    const d = new Date(t);
    const now = new Date();
    const diffMin = Math.floor((now - d) / 60000);
    if (diffMin < 1)  return 'Just now';
    if (diffMin < 60) return `${diffMin} min ago`;
    if (d.toDateString() === now.toDateString()) return `Today at ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
    return d.toLocaleDateString([], {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  },
};

function hasLocalData() {
  if (Store.getWeighIns().length > 0) return true;
  if (Store.getWorkouts().length > 0) return true;
  if (Store.getSettings().name) return true;
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i).startsWith('bloom_habits_')) return true;
  }
  return false;
}

function showRestorePrompt() {
  const overlay = document.createElement('div');
  overlay.id = 'restore-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:var(--bg);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center;gap:16px';
  overlay.innerHTML = `
    <div style="font-size:48px;margin-bottom:8px">🌸</div>
    <h2 style="font-size:22px;font-weight:600;color:var(--text)">Restore your data?</h2>
    <p style="color:var(--text-muted);font-size:15px;max-width:300px;line-height:1.5">It looks like your local data was cleared. Your Bloom data is backed up to Google Sheets.</p>
    <button id="restore-btn" class="btn btn-primary" style="width:100%;max-width:300px;margin-top:8px">Restore from Google Sheets</button>
    <button id="restore-fresh-btn" class="btn btn-outline" style="width:100%;max-width:300px">Start fresh</button>
  `;
  document.getElementById('app').appendChild(overlay);

  overlay.querySelector('#restore-btn').addEventListener('click', async () => {
    const btn = overlay.querySelector('#restore-btn');
    btn.textContent = 'Restoring…';
    btn.disabled = true;
    try {
      await SheetsSync.restoreAll();
      overlay.remove();
      Store.set('onboarding_complete', true);
      renderToday();
      showToast('Your data has been restored from Google Sheets.', 'success');
    } catch(e) {
      btn.textContent = 'Restore from Google Sheets';
      btn.disabled = false;
      showToast('Restore failed. Please check your connection and try again.');
    }
  });

  overlay.querySelector('#restore-fresh-btn').addEventListener('click', () => {
    openConfirm(
      'Start fresh?',
      'This will permanently delete your Google Sheets backup. Are you sure?',
      'Yes, Start Fresh',
      () => {
        SheetsSync.disconnect();
        overlay.remove();
        openOnboarding();
      },
      true
    );
  });
}

function init() {
  registerChartPlugins();

  // Dismiss splash after a brief moment
  const splash = document.getElementById('splash');
  if (splash) {
    setTimeout(() => { splash.classList.add('splash-out'); }, 350);
    splash.addEventListener('transitionend', () => splash.remove());
  }

  // Register service worker — auto-reload when a new version activates
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
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

  // Onboarding, restore check, and Sheets init
  setTimeout(async () => {
    // If Sheets is connected and local data is gone, offer restore
    if (SheetsSync.isConnected() && !hasLocalData()) {
      showRestorePrompt();
      return;
    }
    if (Store.get('onboarding_complete')) {
      if (shouldShowSundayCheckin()) {
        setTimeout(openSundayCheckin, 600);
      } else {
        showHintIfNeeded('today');
      }
    } else {
      openOnboarding();
    }
    // Kick off Sheets init (validates token, retries queue) after UI settles
    await SheetsSync.init();
  }, 500);

  // Midnight reset check (basic: store last-open date)
  const lastOpen = Store.get('last_open_date', null);
  const today = todayStr();
  if (lastOpen && lastOpen !== today) {
    // New day — nothing to reset (habits are stored by date, so already separate)
  }
  Store.set('last_open_date', today);

  // Repair: recompute both spendable and total_earned from history.
  // - spendable = net of all history amounts since last cash-out (floor 0)
  // - total_earned = spendable + total points ever cashed out
  // This fixes inflation caused by toggle bug (uncheck didn't decrement total_earned).
  (() => {
    const p = Store.getPoints();
    const g = Store.getGoals();
    if (!p.history || p.history.length === 0) return;

    const cashedOutPts = (g.history || []).reduce((s, h) => s + (h.points || 0), 0);

    // Find the date of the most recent cash-out so we only net history after it
    const cashOutDates = (g.history || []).map(h => h.date || '').filter(Boolean).sort();
    const lastCashOut  = cashOutDates[cashOutDates.length - 1] || '';

    const relevantHistory = lastCashOut
      ? p.history.filter(h => (h.date || '') >= lastCashOut)
      : p.history;

    const netSpendable   = Math.max(0, relevantHistory.reduce((s, h) => s + (h.amount || 0), 0));
    const correctTotal   = netSpendable + cashedOutPts;

    let changed = false;
    if (p.spendable    !== netSpendable)  { p.spendable    = netSpendable;  changed = true; }
    if (p.total_earned !== correctTotal)  { p.total_earned = correctTotal;  changed = true; }
    if (changed) Store.savePoints(p);
  })();

  // Update header message daily
  setInterval(updateHeader, 60 * 60 * 1000);

  // Check pending notifications on load and on visibility change
  setTimeout(async () => {
    await Notifications.checkPending();
    Notifications.schedule();
  }, 2000);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      Notifications.checkPending().then(() => Notifications.schedule());
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
