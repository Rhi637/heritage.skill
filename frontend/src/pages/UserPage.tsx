import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERITAGE_CRAFTS } from '../data';
import { UserProfile } from '../types';
import { getAllProgress } from '../utils/storage';
import { playSound } from '../utils/audio';
import InheritorAvatar from '../components/InheritorAvatar';

function useIsMobile(): boolean {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => { const h = () => setM(window.innerWidth < 768); window.addEventListener('resize', h); return () => window.removeEventListener('resize', h); }, []);
  return m;
}

// 称号系统
function getTitle(learned: number, total: number): { title: string; emoji: string; color: string } {
  if (learned >= total && total > 0) return { title: '非遗大师', emoji: '👑', color: '#f59e0b' };
  if (learned >= 20) return { title: '匠心传承者', emoji: '🏅', color: '#a5b4fc' };
  if (learned >= 10) return { title: '文化守护者', emoji: '🛡️', color: '#4ade80' };
  if (learned >= 5) return { title: '学徒探索者', emoji: '📖', color: '#38bdf8' };
  return { title: '初入江湖', emoji: '🌱', color: '#9ca3af' };
}

export default function UserPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [user] = useState<UserProfile | null>(() => {
    const d = localStorage.getItem('heritage_user');
    return d ? JSON.parse(d) : null;
  });

  const stats = useMemo(() => {
    const allProgress = getAllProgress();
    let learned = 0;
    const craftDetails: { name: string; emoji: string; learned: number; total: number; color: string }[] = [];
    for (const craft of HERITAGE_CRAFTS) {
      const cp = allProgress.find((p) => p.craftId === craft.id);
      const l = cp?.learnedPointIds.length || 0;
      learned += l;
      craftDetails.push({
        name: craft.name, emoji: craft.emoji, learned: l, total: craft.knowledgePoints.length,
        color: craft.id === 'craft_shadow_puppet' ? '#f59e0b' : craft.id === 'craft_paper_cutting' ? '#ef4444' : craft.id === 'craft_embroidery' ? '#ec4899' : craft.id === 'craft_clay_figurine' ? '#14b8a6' : craft.id === 'craft_porcelain' ? '#3b82f6' : '#dc2626',
      });
    }
    const total = HERITAGE_CRAFTS.reduce((s, c) => s + c.knowledgePoints.length, 0);
    const streak = parseInt(localStorage.getItem('heritage_checkin_streak') || '0');
    return { learned, total, streak, craftDetails };
  }, []);

  const titleInfo = getTitle(stats.learned, stats.total);

  // 徽章
  const badges = [
    { emoji: '🥉', name: '铜牌学徒', desc: '学习5个知识点', earned: stats.learned >= 5 },
    { emoji: '🥈', name: '银牌匠人', desc: '学习15个知识点', earned: stats.learned >= 15 },
    { emoji: '🥇', name: '金牌大师', desc: `学完全部${stats.total}个知识点`, earned: stats.learned >= stats.total && stats.total > 0 },
    { emoji: '🔥', name: '每日打卡', desc: `连续${stats.streak}天打卡`, earned: stats.streak >= 3 },
    { emoji: '⭐', name: '全能探索者', desc: '访问所有非遗项目', earned: stats.craftDetails.filter((c) => c.learned > 0).length >= 6 },
  ];

  const handleReset = () => {
    if (window.confirm('确定要清除所有学习进度吗？此操作不可恢复！')) {
      localStorage.removeItem('heritage_progress');
      localStorage.removeItem('heritage_checkin_date');
      localStorage.removeItem('heritage_checkin_streak');
      window.location.reload();
    }
  };

  return (
    <div style={{
      width: '100vw', minHeight: '100vh', backgroundColor: '#050510',
      fontFamily: "'Zpix','Microsoft YaHei',monospace", color: '#e0e7ff',
      display: 'flex', justifyContent: 'center', paddingTop: isMobile ? 30 : 50,
      paddingBottom: 60, imageRendering: 'pixelated',
    }}>
      <div style={{ maxWidth: 520, width: '90%' }}>
        {/* 返回 */}
        <button onClick={() => { playSound('click'); navigate(-1); }} style={{
          padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af',
          fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', imageRendering: 'pixelated',
          letterSpacing: 2, marginBottom: 24,
        }}>← 返回</button>

        {/* 头像 + 信息 */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28,
          padding: 20, backgroundColor: 'rgba(255,255,255,0.03)',
          border: '3px solid rgba(255,255,255,0.1)', borderRadius: 0,
          boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        }}>
          <div style={{ width: 64, height: 64, borderRadius: 0, overflow: 'hidden', border: '3px solid rgba(99,102,241,0.3)', flexShrink: 0 }}>
            <InheritorAvatar era="modern" craftColor="#6366f1" size={64} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, marginBottom: 2 }}>
              {user?.name || '探索者'}
            </div>
            <div style={{ fontSize: 13, color: titleInfo.color, letterSpacing: 2 }}>
              {titleInfo.emoji} {titleInfo.title}
            </div>
            <div style={{ fontSize: 10, color: '#4b5563', marginTop: 4 }}>
              {user?.avatar?.name || '像素旅人'} · 加入于 {user ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '—'}
            </div>
          </div>
        </div>

        {/* 数据面板 */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24,
        }}>
          {[
            { label: '已学知识点', value: stats.learned, color: '#a5b4fc' },
            { label: '总知识点', value: stats.total, color: '#6b7280' },
            { label: '打卡天数', value: stats.streak, color: '#f59e0b' },
          ].map((s) => (
            <div key={s.label} style={{
              padding: 12, textAlign: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
              border: '2px solid rgba(255,255,255,0.08)', borderRadius: 0,
            }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, letterSpacing: 2 }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4, letterSpacing: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 学习进度条（每个非遗） */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff', letterSpacing: 2, marginBottom: 12 }}>📊 学习进度</div>
          {stats.craftDetails.map((craft) => (
            <div key={craft.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 16, imageRendering: 'pixelated', width: 24 }}>{craft.emoji}</span>
              <span style={{ fontSize: 11, color: '#9ca3af', width: 60, letterSpacing: 1 }}>{craft.name}</span>
              <div style={{ flex: 1, height: 8, backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{
                  width: `${craft.total > 0 ? (craft.learned / craft.total) * 100 : 0}%`,
                  height: '100%', backgroundColor: craft.color,
                  transition: 'width 0.5s steps(10)',
                }} />
              </div>
              <span style={{ fontSize: 10, color: '#6b7280', width: 32, textAlign: 'right' }}>{craft.learned}/{craft.total}</span>
            </div>
          ))}
        </div>

        {/* 徽章墙 */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e0e7ff', letterSpacing: 2, marginBottom: 12 }}>🏅 成就徽章</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 8 }}>
            {badges.map((b) => (
              <div key={b.name} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px',
                backgroundColor: b.earned ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
                border: b.earned ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.04)',
                borderRadius: 0, opacity: b.earned ? 1 : 0.35,
                filter: b.earned ? 'none' : 'grayscale(1)',
              }}>
                <span style={{ fontSize: 18, imageRendering: 'pixelated' }}>{b.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, color: b.earned ? '#e0e7ff' : '#6b7280', letterSpacing: 1 }}>{b.name}</div>
                  <div style={{ fontSize: 9, color: '#6b7280' }}>{b.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 设置 + 重置 */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => { playSound('click'); navigate('/settings'); }} style={{
            padding: '8px 20px', backgroundColor: 'rgba(99,102,241,0.1)',
            border: '2px solid rgba(99,102,241,0.3)', borderRadius: 0, color: '#a5b4fc',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            ⚙️ 设置
          </button>
          <button onClick={handleReset} style={{
            padding: '8px 20px', backgroundColor: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: 0, color: '#f87171',
            fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            🗑️ 重置数据
          </button>
        </div>
      </div>
    </div>
  );
}
