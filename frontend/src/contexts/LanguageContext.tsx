import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'zh' | 'en';

const UI: Record<string, Record<Lang, string>> = {
  // === 欢迎页 ===
  welcome_title: { zh: '非遗文化博物馆', en: 'ICH Museum' },
  welcome_sub: { zh: 'INTANGIBLE CULTURAL HERITAGE', en: 'INTANGIBLE CULTURAL HERITAGE' },
  welcome_tag: { zh: '传承人蒸馏数字智能体', en: 'Digital Inheritor Agent' },
  welcome_back: { zh: '👋 欢迎回来，', en: '👋 Welcome back, ' },
  press_start: { zh: '▶ PRESS START', en: '▶ PRESS START' },
  continue_explore: { zh: '▶ 继续探索', en: '▶ Continue' },
  change_avatar: { zh: '🎭 换形象', en: '🎭 Avatar' },

  // === 导航 ===
  enter_museum: { zh: '进入博物馆', en: 'Enter Museum' },
  learning_progress: { zh: '学习进度', en: 'Learning' },
  user_page: { zh: '用户', en: 'User' },
  settings: { zh: '设置', en: 'Settings' },
  back: { zh: '← 返回', en: '← Back' },
  back_museum: { zh: '← 返回博物馆', en: '← Back to Museum' },
  send: { zh: '发送', en: 'Send' },
  close: { zh: '关闭', en: 'Close' },

  // === 博物馆 ===
  museum_title: { zh: '非遗文化博物馆', en: 'ICH Museum' },
  game_btn: { zh: '小游戏', en: 'Games' },
  ancient: { zh: '🏮 古代', en: '🏮 Ancient' },
  modern: { zh: '💡 现代', en: '💡 Modern' },
  click_exhibit: { zh: '点击展台进入 →', en: 'Click Exhibit →' },
  space_gate: { zh: '时空之门开启中...', en: 'Time gate opening...' },
  create_avatar_hint: { zh: '👤 创建形象', en: '👤 New Avatar' },
  language_zh: { zh: '🌐 中', en: '🌐 中' },
  language_en: { zh: '🌐 EN', en: '🌐 EN' },

  // === 形象选择 ===
  choose_avatar: { zh: '选择你的数字形象', en: 'Choose Your Avatar' },
  avatar_sub: { zh: '你将以这个形象穿梭于非遗文化博物馆', en: 'Explore the museum with this avatar' },
  enter_name: { zh: '输入你的探索者名称...', en: 'Enter your name...' },
  enter_btn: { zh: '进入博物馆 →', en: 'Enter Museum →' },

  // === 传承人选择 ===
  select_inheritor: { zh: '选择一位传承人开始学习', en: 'Select an inheritor to begin' },
  modern_label: { zh: '现代', en: 'Modern' },
  view_detail: { zh: '📋 详情', en: '📋 Detail' },
  go_learn: { zh: '前往学习 →', en: 'Learn →' },
  time_travel: { zh: '穿梭时空 →', en: 'Time Travel →' },
  skills_label: { zh: '擅长技能', en: 'Skills' },
  catchphrases_label: { zh: '口头禅', en: 'Sayings' },

  // === 对话 ===
  recommend_question: { zh: '推荐问题：', en: 'Suggested: ' },
  today_remaining: { zh: '今日剩余', en: 'Remaining' },
  times: { zh: '次', en: '' },
  need_api_key: { zh: '需要配置 API Key', en: 'API Key Required' },
  api_key_modal_desc: { zh: '请先前往设置页面配置智谱 GLM API Key，才能开始对话。', en: 'Configure your GLM API Key in Settings to start chatting.' },
  later: { zh: '稍后再说', en: 'Later' },
  go_settings: { zh: '前往设置', en: 'Settings' },
  quota_exhausted: { zh: '今日免费次数已用完', en: 'Daily quota exhausted' },
  quota_desc: { zh: '每天免费 10 次问答，请明天再来继续学习！', en: '10 free questions per day. Come back tomorrow!' },
  view_progress: { zh: '查看学习进度', en: 'View Progress' },
  got_it: { zh: '知道了', en: 'OK' },

  // === 测验 ===
  quiz_btn: { zh: '📝 测验一下学到的知识', en: '📝 Test your knowledge' },
  quiz_title: { zh: '📝 知识闯关测验', en: '📝 Knowledge Quiz' },
  quiz_desc: { zh: '共 {n} 题 · 检验你的{c}学习成果', en: '{n} questions · Test your {c} knowledge' },
  quiz_start: { zh: '开始闯关 →', en: 'Start Quiz →' },
  quiz_question: { zh: '第', en: 'Q' },
  quiz_of: { zh: '题', en: ' of ' },
  quiz_submit: { zh: '提交答案', en: 'Submit' },
  quiz_next: { zh: '下一题 →', en: 'Next →' },
  quiz_pass: { zh: '闯关成功！', en: 'Quiz Passed!' },
  quiz_fail: { zh: '继续加油！', en: 'Keep it up!' },
  quiz_correct: { zh: '答对', en: 'Correct: ' },
  quiz_seal: { zh: '🏅 获得{c}大师印章', en: '🏅 {c} Master Seal' },
  quiz_done: { zh: '完成', en: 'Done' },
  quiz_about: { zh: '关于"{t}"，哪一项是正确的？', en: 'About "{t}", which is correct?' },

  // === 学习进度页 ===
  learning_title: { zh: '📚 学习进度', en: '📚 Learning Progress' },
  overview_total: { zh: '总进度', en: 'Overall' },
  learned_kp: { zh: '已学知识点', en: 'Learned' },
  total_kp: { zh: '总知识点', en: 'Total' },
  heritage_count: { zh: '非遗项目', en: 'Crafts' },
  empty_learning: { zh: '还没有学习记录，去和传承人对话吧！', en: 'No learning records yet. Go chat with an inheritor!' },
  go_learn_btn: { zh: '前往学习 →', en: 'Learn →' },

  // === 成就+打卡 ===
  achievements: { zh: '🏅 成就徽章', en: '🏅 Achievements' },
  daily_checkin: { zh: '📅 每日挑战', en: '📅 Daily' },
  checkin_btn: { zh: '打卡签到', en: 'Check In' },
  checked_in: { zh: '✓ 今日已打卡', en: '✓ Done' },
  streak_label: { zh: '🔥 连续', en: '🔥 Streak: ' },
  streak_days: { zh: '天打卡', en: ' days' },
  badge_bronze: { zh: '铜牌学徒', en: 'Bronze Apprentice' },
  badge_silver: { zh: '银牌匠人', en: 'Silver Artisan' },
  badge_gold: { zh: '金牌大师', en: 'Gold Master' },
  badge_explorer: { zh: '全能探索者', en: 'Explorer' },
  badge_streak: { zh: '连续打卡', en: 'Streak' },
  badge_bronze_desc: { zh: '学习5个知识点', en: 'Learn 5 points' },
  badge_silver_desc: { zh: '学习15个知识点', en: 'Learn 15 points' },
  badge_gold_desc: { zh: '学完全部知识点', en: 'Complete all points' },
  badge_explorer_desc: { zh: '访问所有非遗项目', en: 'Visit all crafts' },
  badge_streak_desc: { zh: '连续3天打卡', en: '3-day streak' },

  // === 用户页 ===
  user_title: { zh: '非遗大师', en: 'ICH Master' },
  user_desc: { zh: '匠心传承者', en: 'Artisan Inheritor' },
  user_since: { zh: '加入于', en: 'Joined ' },
  user_share: { zh: '📤 分享成就', en: '📤 Share' },
  user_reset: { zh: '🗑️ 重置数据', en: '🗑️ Reset Data' },
  user_learning_progress: { zh: '📊 学习进度', en: '📊 Progress' },
  user_cert_title: { zh: '📜 学习证书 · ', en: '📜 Certificate · ' },
  download_cert: { zh: '📥 下载证书', en: '📥 Download' },

  // === 设置页 ===
  settings_title: { zh: '⚙️ 设置', en: '⚙️ Settings' },
  api_key_title: { zh: '智谱 GLM API Key', en: 'GLM API Key' },
  api_key_desc: { zh: '用于调用智谱 GLM-4-Flash 大模型，实现与传承人的智能对话。请前往 open.bigmodel.cn 注册并获取 API Key。', en: 'Used for GLM-4-Flash model. Get API Key at open.bigmodel.cn.' },
  api_key_placeholder: { zh: '请输入你的 API Key...', en: 'Enter API Key...' },
  show_key: { zh: '显示', en: 'Show' },
  hide_key: { zh: '隐藏', en: 'Hide' },
  save_key: { zh: '保存 Key', en: 'Save Key' },
  saved_key: { zh: '已保存 ✓', en: 'Saved ✓' },
  clear_key: { zh: '清除 Key', en: 'Clear Key' },
  api_configured: { zh: 'API Key 已配置', en: 'API Key configured' },
  api_not_configured: { zh: '未配置 API Key（无法使用对话功能）', en: 'No API Key (chat disabled)' },
  music_title: { zh: '背景音乐', en: 'BGM' },
  music_on: { zh: '🔊 已开启', en: '🔊 On' },
  music_off: { zh: '🔇 已静音', en: '🔇 Muted' },
  volume_label: { zh: '音量', en: 'Volume' },
  usage_title: { zh: '使用说明', en: 'Usage' },
  usage_1: { zh: '每天免费 10 次问答，用完后需等待次日重置', en: '10 free questions per day' },
  usage_2: { zh: '对话中涉及的知识点会自动标记为已学习', en: 'Mentioned knowledge points auto-marked as learned' },
  usage_3: { zh: '学习进度保存在本地浏览器中', en: 'Progress stored locally in browser' },
  usage_4: { zh: 'API Key 仅保存在你的浏览器本地，不会上传到任何服务器', en: 'API Key stored locally, never uploaded' },

  // === 游戏 ===
  game_paper_cut: { zh: '✂️ 剪纸', en: '✂️ Cut' },
  game_scroll: { zh: '📜 寻宝', en: '📜 Hunt' },
  game_cut_title: { zh: '✂️ 剪纸模拟器', en: '✂️ Paper Cut Sim' },
  game_scroll_title: { zh: '📜 卷轴寻宝', en: '📜 Scroll Hunt' },
  game_scroll_desc: { zh: '点击收集飘过的非遗宝物！集齐所有6种解锁成就', en: 'Click to collect heritage treasures! Collect all 6.' },
  game_start: { zh: '▶ 开始寻宝', en: '▶ Start Hunt' },
  game_retry: { zh: '🔄 再来一局', en: '🔄 Retry' },
  game_over: { zh: '收集结束！', en: 'Collection Over!' },
  game_score: { zh: '得分', en: 'Score' },
  game_high: { zh: '最高', en: 'High' },
  game_collected: { zh: '收集', en: 'Collected' },
  game_all_done: { zh: '🏅 全部收集！你是非遗守护者！', en: '🏅 All collected! You are a heritage guardian!' },

  // === 剪纸游戏 ===
  cut_title: { zh: '✂️ 剪纸模拟', en: '✂️ Paper Cutting' },
  cut_quarter: { zh: '四折', en: '4-Fold' },
  cut_half: { zh: '对折', en: '2-Fold' },
  cut_none: { zh: '不折', en: 'Flat' },
  cut_hint: { zh: '在折叠的纸上点击拖拽"剪"出图案，然后展开查看！', en: 'Click/drag to cut on folded paper, then unfold!' },
  cut_unfold: { zh: '展开剪纸 ✨', en: 'Unfold ✨' },
  cut_retry: { zh: '再来一次 🔄', en: 'Retry 🔄' },
  cut_great: { zh: '太棒了！精美的剪纸作品！', en: 'Great! Beautiful paper cutting!' },
  cut_good: { zh: '不错！再试试剪更多图案？', en: 'Good! Try cutting more patterns?' },
  cut_more: { zh: '多用剪刀试试，剪出更丰富的镂空图案！', en: 'Try more cuts for richer patterns!' },
  cut_score: { zh: '得分', en: 'Score' },

  // === 小游戏+体验按钮 ===
  try_game_btn: { zh: '✂️ 剪纸模拟器', en: '✂️ Paper Cut' },
  try_quiz_btn: { zh: '📝 知识闯关测验', en: '📝 Quiz' },
  try_achieve_btn: { zh: '🏅 查看成就', en: '🏅 Achievements' },
  direct_game_title: { zh: '✂️ {c}模拟器', en: '✂️ {c} Simulator' },
  direct_game_sub: { zh: '用剪刀在折叠的红纸上剪出图案，展开看看！', en: 'Cut patterns on folded red paper, unfold to see!' },
  direct_game_back: { zh: '返回博物馆 →', en: 'Back to Museum →' },

  // === 时空穿梭 ===
  travel_to_dynasty: { zh: '穿梭至{d}', en: 'Traveling to {d}' },
  travel_to_region: { zh: '前往{r}', en: 'Going to {r}' },
  travel_starting: { zh: '时空隧道启动中...', en: 'Time tunnel activating...' },
  travel_connecting: { zh: '正在连接{n}...', en: 'Connecting to {n}...' },

  // === 学习进度标签 ===
  difficulty_beginner: { zh: '入门', en: 'Beginner' },
  difficulty_intermediate: { zh: '进阶', en: 'Intermed' },
  difficulty_advanced: { zh: '高级', en: 'Advanced' },

  // === 通用 ===
  v_label: { zh: 'v2.0', en: 'v2.0' },
  share_text: { zh: '我在非遗文化博物馆学习了传统技艺！', en: 'I learned traditional crafts at ICH Museum!' },
  share_url: { zh: 'rhi637.github.io/heritage.skill', en: 'rhi637.github.io/heritage.skill' },
  share_title: { zh: '来非遗文化博物馆，与千年匠人对话！', en: 'Visit ICH Museum, talk to ancient artisans!' },
  confirm_reset: { zh: '确定要清除所有学习进度吗？此操作不可恢复！', en: 'Clear all progress? This cannot be undone!' },
};

export function t(key: string, lang: Lang, vars?: Record<string, string>): string {
  let s = UI[key]?.[lang] || key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, v);
  return s;
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
