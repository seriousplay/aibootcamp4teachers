/* ===== API 适配层：在线(fetch后端) / 离线(localStorage) 统一接口 ===== */

const API = (function() {
  let mode = 'offline'; // 'online' | 'offline'
  let baseUrl = '';
  let token = null;

  // ===== localStorage 键名 =====
  const KEYS = {
    USERS: 'ml_users',       // 注册用户表 {phone: {id,name,pwdHash,name,createdAt}}
    PROGRESS: 'ml_progress', // {steps:[], task:null, points:0, badges:[], firstLogin:false}
    TOKEN: 'ml_token',
    USER: 'ml_user',
    MODE: 'ml_mode',
    BACKEND_URL: 'ml_backend_url',
  };

  // ===== 工具函数 =====
  function lsGet(key, def) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch(e) { return def; }
  }
  function lsSet(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) {} }

  // 简单哈希（离线弱安全，仅本地使用）
  function simpleHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
    return 'h' + Math.abs(h).toString(36);
  }

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  // ===== 后端探测 =====
  async function detectBackend() {
    // 尝试同源
    const candidates = [];
    if (window.location.protocol.startsWith('http')) candidates.push(window.location.origin);
    candidates.push('http://localhost:8000');
    const saved = lsGet(KEYS.BACKEND_URL, null);
    if (saved) candidates.unshift(saved);

    for (const url of candidates) {
      try {
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 2000);
        const resp = await fetch(url + '/api/health', { signal: ctrl.signal });
        clearTimeout(tid);
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'ok') {
            mode = 'online';
            baseUrl = url;
            lsSet(KEYS.MODE, 'online');
            return true;
          }
        }
      } catch(e) { /* 继续尝试下一个 */ }
    }
    mode = 'offline';
    lsSet(KEYS.MODE, 'offline');
    return false;
  }

  // ===== 在线模式实现 =====
  async function onlineRequest(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
    if (token) headers['Authorization'] = 'Bearer ' + token;
    const resp = await fetch(baseUrl + path, { ...opts, headers });
    if (resp.status === 401) { logout(); throw new Error('未授权'); }
    if (!resp.ok) { const e = await resp.json().catch(() => ({})); throw new Error(e.message || '请求失败'); }
    return resp.json();
  }

  const onlineAPI = {
    async register(phone, pwd, name) {
      const data = await onlineRequest('/api/auth/register', { method:'POST', body: JSON.stringify({phone, password:pwd, name}) });
      token = data.token; lsSet(KEYS.TOKEN, token); lsSet(KEYS.USER, data.user);
      return data;
    },
    async login(phone, pwd) {
      const data = await onlineRequest('/api/auth/login', { method:'POST', body: JSON.stringify({phone, password:pwd}) });
      token = data.token; lsSet(KEYS.TOKEN, token); lsSet(KEYS.USER, data.user);
      return data;
    },
    async me() { return onlineRequest('/api/auth/me'); },
    async getProgress() { return onlineRequest('/api/progress'); },
    async setStep(levelId, completed) { return onlineRequest('/api/progress/step', { method:'PUT', body: JSON.stringify({levelId, completed}) }); },
    async setTask(taskType) { return onlineRequest('/api/progress/task', { method:'PUT', body: JSON.stringify({taskType}) }); },
    async getLeaderboard() { return onlineRequest('/api/leaderboard'); },
    async awardExplorer() { return onlineRequest('/api/progress/explorer', { method:'PUT' }); },
    async submitQuiz(levelId, answers) { return onlineRequest('/api/progress/quiz', { method:'PUT', body: JSON.stringify({levelId, answers}) }); },
  };

  // ===== 离线模式实现 =====
  const offlineAPI = {
    async register(phone, pwd, name) {
      const users = lsGet(KEYS.USERS, {});
      if (users[phone]) throw new Error('该手机号已注册');
      const id = Date.now().toString();
      users[phone] = { id, name, pwdHash: simpleHash(pwd), createdAt: new Date().toISOString() };
      lsSet(KEYS.USERS, users);
      // 初始化进度
      const prog = { steps: [], task: null, points: 0, badges: [], firstLogin: true, loginDates: [todayStr()] };
      lsSet(KEYS.PROGRESS + '_' + phone, prog);
      const user = { id, phone, name, points: 0 };
      token = 'offline_' + id; lsSet(KEYS.TOKEN, token); lsSet(KEYS.USER, user);
      // 首次登录加分
      prog.points += 5; prog.badges = ['first_login']; lsSet(KEYS.PROGRESS + '_' + phone, prog);
      user.points = 5;
      return { token, user };
    },
    async login(phone, pwd) {
      const users = lsGet(KEYS.USERS, {});
      if (!users[phone]) throw new Error('手机号未注册');
      if (users[phone].pwdHash !== simpleHash(pwd)) throw new Error('密码错误');
      const user = { id: users[phone].id, phone, name: users[phone].name, points: 0 };
      const prog = lsGet(KEYS.PROGRESS + '_' + phone, { steps: [], task: null, points: 0, badges: [], firstLogin: false, loginDates: [] });
      // 每日登录加分
      const today = todayStr();
      if (!prog.loginDates) prog.loginDates = [];
      if (!prog.loginDates.includes(today)) {
        prog.loginDates.push(today);
        prog.points = (prog.points || 0) + 5;
        if (!prog.badges.includes('first_login')) prog.badges.push('first_login');
      }
      user.points = prog.points || 0;
      lsSet(KEYS.PROGRESS + '_' + phone, prog);
      token = 'offline_' + user.id; lsSet(KEYS.TOKEN, token); lsSet(KEYS.USER, user);
      return { token, user };
    },
    async me() { return { user: lsGet(KEYS.USER, null) }; },
    async getProgress() {
      const user = lsGet(KEYS.USER, null);
      if (!user) throw new Error('未登录');
      const prog = lsGet(KEYS.PROGRESS + '_' + user.phone, { steps: [], task: null, points: 0, badges: [], firstLogin: false });
      return { steps: prog.steps || [], task: prog.task, points: prog.points || 0, badges: prog.badges || [], quiz: prog.quiz || {}, level: GAMIFY.getLevel(prog.points || 0) };
    },
    async setStep(levelId, completed) {
      const user = lsGet(KEYS.USER, null);
      if (!user) throw new Error('未登录');
      const prog = lsGet(KEYS.PROGRESS + '_' + user.phone, { steps: [], task: null, points: 0, badges: [] });
      // 规范化已有关卡（兼容老数据）
      prog.steps = GAMIFY._normalizeLevels(prog.steps);
      const oldBadges = prog.badges || [];
      if (completed && !prog.steps.includes(levelId)) prog.steps.push(levelId);
      if (!completed) prog.steps = prog.steps.filter(s => s !== levelId);
      const loginBonus = (prog.loginDates ? prog.loginDates.length : 0) * 5;
      prog.points = GAMIFY.calculatePoints(prog.steps, !!prog.task) + loginBonus;
      prog.badges = GAMIFY.calculateBadges(prog.steps, !!prog.task, true, false);
      const newBadges = GAMIFY.checkNewBadges(oldBadges, prog.badges);
      const oldPoints = user.points || 0;
      user.points = prog.points;
      lsSet(KEYS.PROGRESS + '_' + user.phone, prog);
      lsSet(KEYS.USER, user);
      const levelInfo = GAMIFY.getLevel(prog.points);
      const lvUp = GAMIFY.checkLevelUp(oldPoints, prog.points);
      return { points: prog.points, newBadges, level: levelInfo, leveledUp: lvUp.leveledUp, oldLevel: lvUp.oldLevel, newLevel: lvUp.newLevel };
    },
    async setTask(taskType) {
      const user = lsGet(KEYS.USER, null);
      if (!user) throw new Error('未登录');
      const prog = lsGet(KEYS.PROGRESS + '_' + user.phone, { steps: [], task: null, points: 0, badges: [] });
      const oldBadges = prog.badges || [];
      prog.task = taskType;
      const loginBonus = (prog.loginDates ? prog.loginDates.length : 0) * 5;
      prog.points = GAMIFY.calculatePoints(prog.steps, true) + loginBonus;
      prog.badges = GAMIFY.calculateBadges(prog.steps, true, true, false);
      const newBadges = GAMIFY.checkNewBadges(oldBadges, prog.badges);
      const oldPoints = user.points || 0;
      user.points = prog.points;
      lsSet(KEYS.PROGRESS + '_' + user.phone, prog);
      lsSet(KEYS.USER, user);
      const lvUp = GAMIFY.checkLevelUp(oldPoints, prog.points);
      return { points: prog.points, newBadges, leveledUp: lvUp.leveledUp, oldLevel: lvUp.oldLevel, newLevel: lvUp.newLevel };
    },
    async getLeaderboard() { return []; }, // 离线无排行榜
    async awardExplorer() {
      const user = lsGet(KEYS.USER, null);
      if (!user) throw new Error('未登录');
      const prog = lsGet(KEYS.PROGRESS + '_' + user.phone, { steps:[], task:null, points:0, badges:[] });
      if ((prog.badges || []).includes('explorer')) return { awarded:false, points:prog.points };
      prog.badges = prog.badges || [];
      prog.badges.push('explorer');
      lsSet(KEYS.PROGRESS + '_' + user.phone, prog);
      return { awarded:true, points:prog.points };
    },
    async submitQuiz(levelId, answers) {
      const user = lsGet(KEYS.USER, null);
      if (!user) throw new Error('未登录');
      const prog = lsGet(KEYS.PROGRESS + '_' + user.phone, { steps:[], task:null, points:0, badges:[], quiz:{} });
      prog.quiz = prog.quiz || {};
      prog.steps = GAMIFY._normalizeLevels(prog.steps);
      prog.quiz[levelId] = { answers, correct:true };
      const alreadyMastered = prog.steps.includes(levelId);
      if (alreadyMastered) {
        lsSet(KEYS.PROGRESS + '_' + user.phone, prog);
        return { mastered:false, points:prog.points, newBadges:[], level:GAMIFY.getLevel(prog.points), leveledUp:false };
      }
      const oldBadges = prog.badges || [];
      prog.steps.push(levelId);
      const loginBonus = (prog.loginDates ? prog.loginDates.length : 0) * 5;
      prog.points = GAMIFY.calculatePoints(prog.steps, !!prog.task) + loginBonus;
      prog.badges = GAMIFY.calculateBadges(prog.steps, !!prog.task, true, false);
      const newBadges = GAMIFY.checkNewBadges(oldBadges, prog.badges);
      const oldPoints = user.points || 0;
      user.points = prog.points;
      lsSet(KEYS.PROGRESS + '_' + user.phone, prog);
      lsSet(KEYS.USER, user);
      const lvUp = GAMIFY.checkLevelUp(oldPoints, prog.points);
      return { mastered:true, points:prog.points, newBadges, level:GAMIFY.getLevel(prog.points), leveledUp:lvUp.leveledUp, oldLevel:lvUp.oldLevel, newLevel:lvUp.newLevel };
    },
  };

  function logout() {
    token = null;
    localStorage.removeItem(KEYS.TOKEN);
    localStorage.removeItem(KEYS.USER);
  }

  function isLoggedIn() {
    return !!lsGet(KEYS.USER, null);
  }

  function getCurrentUser() {
    return lsGet(KEYS.USER, null);
  }

  function getMode() { return mode; }

  // 统一接口
  return {
    detectBackend,
    get mode() { return mode; },
    get baseUrl() { return baseUrl; },
    isLoggedIn,
    getCurrentUser,
    logout,
    register: (...a) => mode === 'online' ? onlineAPI.register(...a) : offlineAPI.register(...a),
    login: (...a) => mode === 'online' ? onlineAPI.login(...a) : offlineAPI.login(...a),
    me: () => mode === 'online' ? onlineAPI.me() : offlineAPI.me(),
    getProgress: () => mode === 'online' ? onlineAPI.getProgress() : offlineAPI.getProgress(),
    setStep: (n, c) => mode === 'online' ? onlineAPI.setStep(n, c) : offlineAPI.setStep(n, c),
    setTask: (t) => mode === 'online' ? onlineAPI.setTask(t) : offlineAPI.setTask(t),
    getLeaderboard: () => mode === 'online' ? onlineAPI.getLeaderboard() : offlineAPI.getLeaderboard(),
    awardExplorer: () => mode === 'online' ? onlineAPI.awardExplorer() : offlineAPI.awardExplorer(),
    submitQuiz: (n, a) => mode === 'online' ? onlineAPI.submitQuiz(n, a) : offlineAPI.submitQuiz(n, a),
  };
})();
