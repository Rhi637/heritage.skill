// ========== 用户相关类型 ==========

export interface UserAvatar {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface UserProfile {
  name: string;
  avatar: UserAvatar;
  createdAt: number;
}

// ========== 非遗项目相关类型 ==========

export type Era = 'ancient' | 'modern';

export interface Inheritor {
  id: string;
  name: string;
  era: Era;
  region: string;
  dynasty?: string;        // 古代传承人对应朝代
  experienceYears: number;
  description: string;
  avatarEmoji: string;
  avatarImage?: string;    // AI 生成的头像图片路径
  catchphrases: string[];
  skills?: string[];       // 擅长技能
  story?: string;          // 个人故事
}

export interface HeritageCraft {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  inheritors: Inheritor[];
  sceneColor: string;      // 3D 场景主题色
  knowledgePoints: KnowledgePoint[];
}

// ========== 知识点相关类型 ==========

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface KnowledgePoint {
  id: string;
  title: string;
  category: string;
  difficulty: DifficultyLevel;
  content: string;
  suggestedQuestions: string[];
}

// ========== 对话相关类型 ==========

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  knowledgePointIds?: string[];
  timestamp: number;
  isTyping?: boolean;      // 是否正在打字中
}

export interface ChatResponse {
  reply: string;
  knowledge_point_ids: string[];
  timestamp: number;
}

// ========== 学习进度 ==========

export type MasteryLevel = 'not_learned' | 'understood' | 'can_restate';

export interface KnowledgeProgress {
  pointId: string;
  level: MasteryLevel;
  updatedAt: number;
}

export interface CraftLearningProgress {
  craftId: string;
  learnedPointIds: string[];
  lastAccessedAt: number;
}

// ========== 每日问答限制 ==========

export interface DailyUsage {
  date: string;            // YYYY-MM-DD
  count: number;
}

// ========== API 相关类型 ==========

export interface GLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GLMResponse {
  id: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
