import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

const UI_STRINGS: Record<string, Record<Lang, string>> = {
  welcome_title: { zh: '非遗文化博物馆', en: 'ICH Museum' },
  welcome_sub: { zh: 'INTANGIBLE CULTURAL HERITAGE', en: 'INTANGIBLE CULTURAL HERITAGE' },
  welcome_tag: { zh: '传承人蒸馏数字智能体', en: 'Digital Inheritor Agent' },
  press_start: { zh: '▶ PRESS START', en: '▶ PRESS START' },
  enter_museum: { zh: '进入博物馆', en: 'Enter Museum' },
  learning_progress: { zh: '学习进度', en: 'Learning' },
  user: { zh: '用户', en: 'User' },
  game: { zh: '小游戏', en: 'Games' },
  ancient: { zh: '古代', en: 'Ancient' },
  modern: { zh: '现代', en: 'Modern' },
  click_exhibit: { zh: '点击展台进入 →', en: 'Click Exhibit →' },
  space_gate: { zh: '时空之门开启中...', en: 'Time gate opening...' },
  create_avatar: { zh: '创建形象', en: 'Create Avatar' },
  settings: { zh: '设置', en: 'Settings' },
  back: { zh: '← 返回', en: '← Back' },
  send: { zh: '发送', en: 'Send' },
  quiz: { zh: '测验一下学到的知识', en: 'Test your knowledge' },
  quiz_start: { zh: '开始闯关 →', en: 'Start Quiz →' },
  certificate_earned: { zh: '恭喜获得学习证书！', en: 'Certificate Earned!' },
  achievements: { zh: '成就徽章', en: 'Achievements' },
  daily_checkin: { zh: '每日挑战', en: 'Daily Challenge' },
  checkin_btn: { zh: '打卡签到', en: 'Check In' },
  checked_in: { zh: '✓ 今日已打卡', en: '✓ Checked In' },
  total_kp: { zh: '总知识点', en: 'Total Points' },
  learned_kp: { zh: '已学知识点', en: 'Learned' },
  streak_days: { zh: '打卡天数', en: 'Streak' },
  reset_data: { zh: '重置数据', en: 'Reset Data' },
  choose_avatar: { zh: '选择你的数字形象', en: 'Choose Your Avatar' },
  avatar_sub: { zh: '你将以这个形象穿梭于非遗文化博物馆', en: 'Explore the museum with this avatar' },
  enter_name: { zh: '输入你的探索者名称...', en: 'Enter your name...' },
  enter_btn: { zh: '进入博物馆 →', en: 'Enter Museum →' },
};

export function t(key: string, lang: Lang): string {
  return UI_STRINGS[key]?.[lang] || key;
}

const LangContext = createContext<{ lang: Lang; toggleLang: () => void }>({ lang: 'zh', toggleLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('heritage_lang') as Lang) || 'zh');
  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === 'zh' ? 'en' : 'zh';
      localStorage.setItem('heritage_lang', next);
      return next;
    });
  }, []);
  return <LangContext.Provider value={{ lang, toggleLang }}>{children}</LangContext.Provider>;
}

export function useLang() { return useContext(LangContext); }
