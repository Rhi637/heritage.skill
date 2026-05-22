import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MuseumScene from '../components/MuseumScene';
import { HERITAGE_CRAFTS } from '../data';
import { UserProfile } from '../types';
import { getAllProgress } from '../utils/storage';
import { playSound, startBackgroundMusic } from '../utils/audio';

// ========== 移动端检测 hook ==========

function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
}

export default function MuseumPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [user] = useState<UserProfile | null>(() => {
    const data = localStorage.getItem('heritage_user');
    return data ? JSON.parse(data) : null;
  });
  const [timeMode, setTimeMode] = useState<'ancient' | 'modern'>(() => {
    return (localStorage.getItem('heritage_timemode') as 'ancient' | 'modern') || 'modern';
  });
  const [showGuide, setShowGuide] = useState(() => {
    const visited = localStorage.getItem('heritage_visited');
    return !visited;
  });

  // 确保背景音乐已启动
  useEffect(() => {
    startBackgroundMusic();
    localStorage.setItem('heritage_visited', 'true');
    if (showGuide) setTimeout(() => setShowGuide(false), 8000);
  }, []);

  // 计算总学习进度 & 每个 craft 的进度
  const { totalLearned, totalPoints, craftProgress } = (() => {
    const allProgress = getAllProgress();
    let count = 0;
    const cp: Record<string, number> = {};
    for (const craft of HERITAGE_CRAFTS) {
      const prog = allProgress.find((p) => p.craftId === craft.id);
      const learned = prog?.learnedPointIds.length || 0;
      count += learned;
      cp[craft.id] = craft.knowledgePoints.length > 0
        ? Math.round((learned / craft.knowledgePoints.length) * 100)
        : 0;
    }
    const total = HERITAGE_CRAFTS.reduce((sum, c) => sum + c.knowledgePoints.length, 0);
    return { totalLearned: count, totalPoints: total, craftProgress: cp };
  })();

  const handleSelectCraft = (craftId: string) => {
    playSound('navigate');
    navigate(`/craft/${craftId}`);
  };

  const toggleTimeMode = () => {
    const next = timeMode === 'modern' ? 'ancient' : 'modern';
    setTimeMode(next);
    localStorage.setItem('heritage_timemode', next);
    playSound('click');
  };

  return (
    <div style={styles.container}>
      {/* 3D 场景 */}
      <MuseumScene onSelectCraft={handleSelectCraft} timeMode={timeMode} showGuide={showGuide} craftProgress={craftProgress} />

      {/* 顶部 HUD */}
      <div style={{
        ...styles.hud,
        padding: isMobile ? '10px 12px' : '16px 24px',
      }}>
        <div style={styles.userInfo}>
          {user && (
            <>
              <span style={{
                ...styles.userEmoji,
                fontSize: isMobile ? 18 : 24,
              }}>{user.avatar.emoji}</span>
              {!isMobile && <span style={styles.userName}>{user.name}</span>}
            </>
          )}
        </div>
        <div style={{
          ...styles.hudRight,
          gap: isMobile ? 8 : 16,
        }}>
          {/* 学习进度按钮 */}
          <button
            style={{
              ...styles.progressBtn,
              padding: isMobile ? '4px 10px' : '6px 14px',
              fontSize: isMobile ? 11 : 13,
            }}
            onClick={() => {
              playSound('click');
              navigate('/learning');
            }}
          >
            📚 学习进度
            {totalLearned > 0 && (
              <span style={{
                ...styles.progressBadge,
                fontSize: isMobile ? 9 : 11,
              }}>{totalLearned}/{totalPoints}</span>
            )}
          </button>
          {/* 时空切换按钮 */}
          <button
            onClick={toggleTimeMode}
            style={{
              ...styles.progressBtn,
              padding: isMobile ? '4px 8px' : '6px 12px',
              fontSize: isMobile ? 10 : 12,
              backgroundColor: timeMode === 'ancient' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)',
              border: `2px solid ${timeMode === 'ancient' ? 'rgba(245,158,11,0.3)' : 'rgba(99,102,241,0.3)'}`,
              color: timeMode === 'ancient' ? '#fbbf24' : '#a5b4fc',
              letterSpacing: 1,
            }}
          >
            {timeMode === 'ancient' ? '🏮 古代' : '💡 现代'}
          </button>
          {!isMobile && <div style={styles.hudHint}>点击展台进入 →</div>}
        </div>
      </div>

      {/* 底部快捷导航 */}
      <div style={{
        ...styles.bottomBar,
        bottom: isMobile ? 12 : 24,
        gap: isMobile ? 6 : 12,
        padding: isMobile ? '8px 12px' : '12px 24px',
      }}>
        {HERITAGE_CRAFTS.map((craft) => (
          <div
            key={craft.id}
            style={{
              ...styles.craftChip,
              padding: isMobile ? '6px 10px' : '8px 16px',
              fontSize: isMobile ? 11 : 13,
              imageRendering: 'pixelated', // 像素风格
              borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px) 1', // 像素边框
            }}
            onClick={() => handleSelectCraft(craft.id)}
          >
            <span>{craft.emoji}</span>
            <span>{craft.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    position: 'relative',
    backgroundColor: '#050510',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
  },
  hud: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'linear-gradient(180deg, rgba(5,5,16,0.8) 0%, transparent 100%)',
    zIndex: 10,
  },
  userInfo: { display: 'flex', alignItems: 'center', gap: 8 },
  userEmoji: { imageRendering: 'pixelated' },
  userName: { fontSize: 14, color: '#a5b4fc', fontWeight: 600, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 },
  hudRight: { display: 'flex', alignItems: 'center' },
  progressBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99,102,241,0.15)',
    border: '2px solid rgba(99,102,241,0.3)',
    borderRadius: 0,
    color: '#a5b4fc',
    cursor: 'pointer',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 2,
    boxShadow: '2px 2px 0 rgba(0,0,0,0.3)',
  },
  progressBadge: {
    padding: '1px 6px',
    borderRadius: 0,
    backgroundColor: 'rgba(99,102,241,0.3)',
    color: '#c7d2fe',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
  },
  hudHint: { fontSize: 12, color: '#4b5563', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 },
  bottomBar: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    backgroundColor: 'rgba(5,5,16,0.85)',
    borderRadius: 0,
    border: '2px solid rgba(255,255,255,0.1)',
    zIndex: 10,
    imageRendering: 'pixelated',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
  },
  craftChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#d1d5db',
    cursor: 'pointer',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 2,
    border: '2px solid rgba(255,255,255,0.08)',
  },
};
