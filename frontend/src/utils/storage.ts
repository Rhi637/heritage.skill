import { CraftLearningProgress, DailyUsage } from '../types';

const PROGRESS_KEY = 'heritage_learning_progress';
const DAILY_USAGE_KEY = 'heritage_daily_usage';
const API_KEY_STORAGE = 'heritage_glm_api_key';
const FREE_DAILY_LIMIT = 10;

// ========== API Key 管理 ==========

export function getApiKey(): string | null {
  return localStorage.getItem(API_KEY_STORAGE);
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function removeApiKey(): void {
  localStorage.removeItem(API_KEY_STORAGE);
}

// ========== 学习进度管理 ==========

export function getAllProgress(): CraftLearningProgress[] {
  const data = localStorage.getItem(PROGRESS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCraftProgress(craftId: string): CraftLearningProgress {
  const all = getAllProgress();
  return all.find((p) => p.craftId === craftId) || {
    craftId,
    learnedPointIds: [],
    lastAccessedAt: 0,
  };
}

export function markKnowledgePointsLearned(craftId: string, pointIds: string[]): void {
  const all = getAllProgress();
  let progress = all.find((p) => p.craftId === craftId);
  if (!progress) {
    progress = { craftId, learnedPointIds: [], lastAccessedAt: Date.now() };
    all.push(progress);
  }
  // 添加新的知识点 ID（去重）
  const newIds = pointIds.filter((id) => !progress.learnedPointIds.includes(id));
  if (newIds.length > 0) {
    progress.learnedPointIds = [...progress.learnedPointIds, ...newIds];
  }
  progress.lastAccessedAt = Date.now();
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export function resetCraftProgress(craftId: string): void {
  const all = getAllProgress().filter((p) => p.craftId !== craftId);
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(all));
}

export function resetAllProgress(): void {
  localStorage.removeItem(PROGRESS_KEY);
}

// ========== 每日问答次数管理 ==========

function getTodayStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailyUsage(): DailyUsage {
  const data = localStorage.getItem(DAILY_USAGE_KEY);
  if (data) {
    const usage: DailyUsage = JSON.parse(data);
    if (usage.date === getTodayStr()) {
      return usage;
    }
  }
  return { date: getTodayStr(), count: 0 };
}

export function incrementDailyUsage(): DailyUsage {
  const usage = getDailyUsage();
  usage.count += 1;
  localStorage.setItem(DAILY_USAGE_KEY, JSON.stringify(usage));
  return usage;
}

export function getRemainingQuota(): number {
  const usage = getDailyUsage();
  return Math.max(0, FREE_DAILY_LIMIT - usage.count);
}

export function isQuotaExhausted(): boolean {
  return getRemainingQuota() <= 0;
}

export function getFreeDailyLimit(): number {
  return FREE_DAILY_LIMIT;
}
