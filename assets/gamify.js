/* ===== 游戏化系统 v2：关卡制（5知识关 + 8实操关 = 13关） ===== */

// 关卡定义
const KNOWLEDGE_LEVELS = ['K1', 'K2', 'K3', 'K4', 'K5'];
const PRACTICE_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'];
const ALL_LEVELS = KNOWLEDGE_LEVELS.concat(PRACTICE_LEVELS);

// 积分规则
const POINT_RULES = {
  DAILY_LOGIN: 5,
  TASK_SELECT: 20,
  LEVEL_COMPLETE: 10,        // 每关完成
  KNOWLEDGE_BONUS: 30,       // 知识关全通
  PRACTICE_BONUS: 80,        // 实操关全通
  ALL_CLEAR_BONUS: 150,      // 13关全通
};

// 等级体系（8级）—— 理论满分约385分，可摸到 Lv.7
const LEVELS = [
  { lv: 1, name: 'AI新兵',     minPoints: 0,    color: 'lvl-1' },
  { lv: 2, name: '提示词学徒',  minPoints: 40,   color: 'lvl-2' },
  { lv: 3, name: '教案能手',    minPoints: 90,   color: 'lvl-3' },
  { lv: 4, name: '技能行家',    minPoints: 150,  color: 'lvl-4' },
  { lv: 5, name: '分层达人',    minPoints: 220,  color: 'lvl-5' },
  { lv: 6, name: '审核专家',    minPoints: 290,  color: 'lvl-6' },
  { lv: 7, name: 'AI教学先锋',  minPoints: 360,  color: 'lvl-7' },
  { lv: 8, name: '微学习大师',  minPoints: 500,  color: 'lvl-8' },
];

// 徽章定义（6枚）
const BADGE_DEFS = [
  { id: 'first_login',      icon: '🚀', name: '启程者',   desc: '首次登录' },
  { id: 'task_chooser',     icon: '🎯', name: '抉择者',   desc: '选择任意任务' },
  { id: 'knowledge_master', icon: '⚡', name: '认知达人', desc: '完成5个知识关' },
  { id: 'practice_master',  icon: '🏁', name: '实战先锋', desc: '完成8个实操关' },
  { id: 'all_clear',        icon: '🏆', name: '满分通关', desc: '13关全部完成' },
  { id: 'explorer',         icon: '📚', name: '探索者',   desc: '复制3次提示词' },
];

// 把任意形式的已通关记录标准化为关卡ID列表（兼容老数据：纯数字1-8 → P1-P8）
function _normalizeLevels(raw) {
  if (!raw) return [];
  const result = [];
  for (let item of raw) {
    const s = String(item).trim();
    if (/^\d+$/.test(s) && +s >= 1 && +s <= 8) {
      const mapped = 'P' + s;
      if (!result.includes(mapped)) result.push(mapped);
    } else if (ALL_LEVELS.indexOf(s) >= 0) {
      if (!result.includes(s)) result.push(s);
    }
  }
  return result;
}

// 根据积分获取等级
function getLevel(points) {
  let result = LEVELS[0];
  for (const lv of LEVELS) {
    if (points >= lv.minPoints) result = lv;
  }
  return result;
}

// 根据已通关关卡计算应得积分（纯计算，不含每日登录）
function calculatePoints(levelsRaw, hasTask) {
  const levels = _normalizeLevels(levelsRaw);
  let pts = 0;
  pts += levels.length * POINT_RULES.LEVEL_COMPLETE;
  if (hasTask) pts += POINT_RULES.TASK_SELECT;
  if (KNOWLEDGE_LEVELS.every(k => levels.includes(k))) pts += POINT_RULES.KNOWLEDGE_BONUS;
  if (PRACTICE_LEVELS.every(p => levels.includes(p))) pts += POINT_RULES.PRACTICE_BONUS;
  if (levels.length === ALL_LEVELS.length) pts += POINT_RULES.ALL_CLEAR_BONUS;
  return pts;
}

// 根据已通关关卡计算应得徽章
function calculateBadges(levelsRaw, hasTask, hasFirstLogin, hasExplored) {
  const levels = _normalizeLevels(levelsRaw);
  const earned = [];
  if (hasFirstLogin) earned.push('first_login');
  if (hasTask) earned.push('task_chooser');
  if (KNOWLEDGE_LEVELS.every(k => levels.includes(k))) earned.push('knowledge_master');
  if (PRACTICE_LEVELS.every(p => levels.includes(p))) earned.push('practice_master');
  if (levels.length === ALL_LEVELS.length) earned.push('all_clear');
  if (hasExplored) earned.push('explorer');
  return earned;
}

// 检查升级
function checkLevelUp(oldPoints, newPoints) {
  const oldLv = getLevel(oldPoints);
  const newLv = getLevel(newPoints);
  if (newLv.lv > oldLv.lv) {
    return { leveledUp: true, oldLevel: oldLv, newLevel: newLv };
  }
  return { leveledUp: false };
}

// 检查新徽章
function checkNewBadges(oldBadges, newBadges) {
  return newBadges.filter(b => !oldBadges.includes(b));
}

// 导出
if (typeof window !== 'undefined') {
  window.GAMIFY = {
    POINT_RULES, LEVELS, BADGE_DEFS,
    KNOWLEDGE_LEVELS, PRACTICE_LEVELS, ALL_LEVELS,
    getLevel, calculatePoints, calculateBadges, checkLevelUp, checkNewBadges, _normalizeLevels,
  };
}
