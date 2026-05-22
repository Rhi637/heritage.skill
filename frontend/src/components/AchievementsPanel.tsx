import { useState, useMemo } from 'react';

interface AchievementsPanelProps {
  totalLearned: number;
  totalPoints: number;
  craftCount: number;
}

// 每日冷知识库
const dailyFacts = [
  '皮影戏已有两千多年历史，比电影早了一千多年！',
  '一把好的剪纸剪刀要求刀刃锋利、咬合紧密，不能有缝隙。',
  '苏绣一根丝线可以劈成16丝，比头发丝还细。',
  '天津泥人张始于清代，创始人张明山能在袖中捏塑，片刻即成。',
  '剪纸讲究"线线相连"，不能有断线，否则作品会散架。',
  '皮影人物由11个部件组成，用线连成关节。',
  '苏绣双面三异绣能做到正反两面图案、颜色、针法都不同。',
  '泥塑彩绘讲究"三分塑七分彩"，上色比塑形更考验功力。',
  '折叠剪纸的关键是找准对称轴，四折可以剪出团花。',
  '皮影传统用色以红绿黑为主，红色代表忠勇。',
  '苏绣乱针绣由杨守玉在民国时期创立，类似油画笔触。',
  '泥人张传统技法讲究"一印、二捏、三镶、四滚"。',
  '一把好剪刀用了六十年还能剪纸，剪纸艺人的手就是尺子。',
  '皮影的牛皮要刮几十遍，直到薄如蝉翼、透光均匀。',
  '苏绣平绣要求"针脚齐、丝缕直、边缘光"。',
];

export default function AchievementsPanel({ totalLearned, totalPoints, craftCount }: AchievementsPanelProps) {
  const [checkedIn, setCheckedIn] = useState(() => {
    const today = new Date().toDateString();
    return localStorage.getItem('heritage_checkin_date') === today;
  });
  const [streak, setStreak] = useState(() => {
    return parseInt(localStorage.getItem('heritage_checkin_streak') || '0');
  });
  const [dailyFact] = useState(() => {
    const idx = new Date().getDate() % dailyFacts.length;
    return dailyFacts[idx];
  });

  const handleCheckIn = () => {
    const today = new Date().toDateString();
    const lastDate = localStorage.getItem('heritage_checkin_date') || '';
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    let newStreak = 1;
    if (lastDate === yesterday) newStreak = streak + 1;
    else if (lastDate === today) return;

    localStorage.setItem('heritage_checkin_date', today);
    localStorage.setItem('heritage_checkin_streak', String(newStreak));
    setCheckedIn(true);
    setStreak(newStreak);
  };

  // 成就徽章
  const badges = useMemo(() => {
    const list: { emoji: string; name: string; desc: string; earned: boolean }[] = [];
    list.push({ emoji: '🥉', name: '铜牌学徒', desc: '学习5个知识点', earned: totalLearned >= 5 });
    list.push({ emoji: '🥈', name: '银牌匠人', desc: '学习15个知识点', earned: totalLearned >= 15 });
    list.push({ emoji: '🥇', name: '金牌大师', desc: '学完全部知识点', earned: totalLearned >= totalPoints && totalPoints > 0 });
    list.push({ emoji: '⭐', name: '探索者', desc: `访问所有${craftCount}个非遗项目`, earned: totalLearned >= craftCount });
    list.push({ emoji: '🔥', name: '连续打卡', desc: `连续登录${streak}天`, earned: streak >= 3 });
    return list;
  }, [totalLearned, totalPoints, craftCount, streak]);

  return (
    <div style={{ fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      {/* 每日打卡 */}
      <div style={{
        padding: 14, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.03)',
        border: '3px solid rgba(255,255,255,0.1)', borderRadius: 0,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#f59e0b', marginBottom: 4, letterSpacing: 2 }}>
          📅 每日挑战
        </div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 6, lineHeight: 1.5 }}>
          {dailyFact}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, color: '#9ca3af' }}>
            🔥 连续 {streak} 天打卡
          </span>
          <button onClick={handleCheckIn} disabled={checkedIn} style={{
            padding: '4px 14px', fontSize: 11, cursor: checkedIn ? 'default' : 'pointer',
            fontFamily: 'inherit', imageRendering: 'pixelated', borderRadius: 0, letterSpacing: 1,
            backgroundColor: checkedIn ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.15)',
            border: checkedIn ? '1px solid rgba(34,197,94,0.2)' : '2px solid rgba(245,158,11,0.3)',
            color: checkedIn ? '#4ade80' : '#fbbf24',
          }}>
            {checkedIn ? '✓ 今日已打卡' : '打卡签到'}
          </button>
        </div>
      </div>

      {/* 成就徽章 */}
      <div style={{
        padding: 14, backgroundColor: 'rgba(255,255,255,0.03)',
        border: '3px solid rgba(255,255,255,0.1)', borderRadius: 0,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#a5b4fc', marginBottom: 12, letterSpacing: 2 }}>
          🏅 成就徽章
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {badges.map((badge) => (
            <div key={badge.name} style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
              backgroundColor: badge.earned ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.01)',
              border: badge.earned ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.04)',
              borderRadius: 0, opacity: badge.earned ? 1 : 0.4,
              filter: badge.earned ? 'none' : 'grayscale(1)',
            }}>
              <span style={{ fontSize: 18, imageRendering: 'pixelated' }}>{badge.emoji}</span>
              <div>
                <div style={{ fontSize: 12, color: badge.earned ? '#e0e7ff' : '#6b7280', letterSpacing: 1 }}>
                  {badge.name}
                </div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>{badge.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
