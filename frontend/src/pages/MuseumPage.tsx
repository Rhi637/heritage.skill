import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MuseumScene from '../components/MuseumScene';
import { HERITAGE_CRAFTS } from '../data';
import { HeritageCraft, UserProfile } from '../types';
import PaperCuttingGame from '../components/PaperCuttingGame';
import ScrollTreasureGame from '../components/ScrollTreasureGame';
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
  const [zoomingCraft, setZoomingCraft] = useState<HeritageCraft | null>(null);
  const [gameOpen, setGameOpen] = useState(false);
  const [activeGame, setActiveGame] = useState<'cutting' | 'scroll'>('cutting');

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

  const handleSelectCraft = useCallback((craftId: string) => {
    const craft = HERITAGE_CRAFTS.find((c) => c.id === craftId);
    if (!craft) { navigate(`/craft/${craftId}`); return; }
    playSound('travel');
    setZoomingCraft(craft);
    // 1.2秒后进入对话页
    setTimeout(() => {
      setZoomingCraft(null);
      navigate(`/craft/${craftId}`);
    }, 1200);
  }, [navigate]);

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

      {/* 放大过渡动画 */}
      {zoomingCraft && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(5,5,16,0.85)', zIndex: 100,
          backdropFilter: 'blur(4px)',
          animation: 'pixelPulse 0.3s steps(3)',
        }}>
          <div style={{
            fontSize: 64, imageRendering: 'pixelated', marginBottom: 16,
            animation: 'pixelFloat 0.6s steps(4) infinite',
          }}>
            {zoomingCraft.emoji}
          </div>
          <div style={{
            fontFamily: "'Zpix','Microsoft YaHei',monospace", fontSize: 28, fontWeight: 700,
            color: '#a5b4fc', letterSpacing: 6, textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            imageRendering: 'pixelated', marginBottom: 8,
          }}>
            {zoomingCraft.name}
          </div>
          <div style={{
            fontFamily: "'Zpix','Microsoft YaHei',monospace", fontSize: 12, color: '#6b7280',
            letterSpacing: 2, imageRendering: 'pixelated',
          }}>
            时空之门开启中...
          </div>
          {/* 像素进度条 */}
          <div style={{
            width: 120, height: 6, marginTop: 16, backgroundColor: '#1a1a2e',
            border: '1px solid rgba(99,102,241,0.3)', overflow: 'hidden',
          }}>
            <div style={{
              width: '100%', height: '100%', backgroundColor: '#6366f1',
              animation: 'shrink 1.2s steps(12) forwards',
            }} />
          </div>
        </div>
      )}

      {/* 顶部 HUD */}
      <div style={{
        ...styles.hud,
        padding: isMobile ? '10px 12px' : '16px 24px',
      }}>
        {user ? (
          <button onClick={() => { playSound('click'); navigate('/user'); }} style={{
            ...styles.userInfo, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <span style={{ ...styles.userEmoji, fontSize: isMobile ? 18 : 24 }}>{user.avatar.emoji}</span>
            {!isMobile && <span style={styles.userName}>{user.name}</span>}
          </button>
        ) : (
          <button onClick={() => { playSound('click'); navigate('/avatar'); }} style={{
            ...styles.userInfo, background: 'none', border: 'none', cursor: 'pointer', padding: 0,
          }}>
            <span style={{ fontSize: 12, color: '#6b7280', letterSpacing: 2, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>👤 创建形象</span>
          </button>
        )}
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

      {/* 小游戏浮动入口 */}
      <button onClick={() => { setGameOpen(true); playSound('click'); }} style={{
        position: 'absolute', bottom: isMobile ? 80 : 100, right: isMobile ? 12 : 24,
        width: 50, height: 50, borderRadius: 0, backgroundColor: 'rgba(239,68,68,0.15)',
        border: '3px solid rgba(239,68,68,0.4)', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 20,
        fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated',
        boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        animation: 'pixelFloat 2s steps(4) infinite',
      }}>
        <span style={{ fontSize: 22, imageRendering: 'pixelated' }}>✂️</span>
        <span style={{ fontSize: 8, color: '#f87171', letterSpacing: 1, imageRendering: 'pixelated' }}>小游戏</span>
      </button>

      {/* 游戏弹窗 */}
      {gameOpen && (
        <div onClick={() => setGameOpen(false)} style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 200,
        }}>
          <div onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: '#111127', border: '3px solid rgba(239,68,68,0.3)',
            borderRadius: 0, padding: 24, maxWidth: 340, width: '90%',
            boxShadow: '6px 6px 0 rgba(0,0,0,0.4)',
            fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 0 }}>
                <button onClick={() => setActiveGame('cutting')} style={{
                  padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: 1, imageRendering: 'pixelated',
                  borderRadius: 0, border: activeGame === 'cutting' ? '2px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: activeGame === 'cutting' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)',
                  color: activeGame === 'cutting' ? '#f87171' : '#6b7280',
                }}>✂️ 剪纸</button>
                <button onClick={() => setActiveGame('scroll')} style={{
                  padding: '4px 12px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: 1, imageRendering: 'pixelated',
                  borderRadius: 0, border: activeGame === 'scroll' ? '2px solid rgba(245,158,11,0.4)' : '1px solid rgba(255,255,255,0.1)',
                  backgroundColor: activeGame === 'scroll' ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                  color: activeGame === 'scroll' ? '#fbbf24' : '#6b7280',
                }}>📜 寻宝</button>
              </div>
              <button onClick={() => setGameOpen(false)} style={{
                padding: '2px 8px', backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af',
                fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
              }}>✕</button>
            </div>
            {activeGame === 'cutting' ? (
              <PaperCuttingGame onComplete={(score) => { if (score >= 50) playSound('click'); }} />
            ) : (
              <ScrollTreasureGame onComplete={(score) => { if (score >= 100) playSound('click'); }} />
            )}
          </div>
        </div>
      )}

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
              imageRendering: 'pixelated',
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
