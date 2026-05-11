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

  // 确保背景音乐已启动
  useEffect(() => {
    startBackgroundMusic();
  }, []);

  // 计算总学习进度
  const totalLearned = (() => {
    const allProgress = getAllProgress();
    let count = 0;
    for (const craft of HERITAGE_CRAFTS) {
      const cp = allProgress.find((p) => p.craftId === craft.id);
      if (cp) count += cp.learnedPointIds.length;
    }
    return count;
  })();
  const totalPoints = HERITAGE_CRAFTS.reduce((sum, c) => sum + c.knowledgePoints.length, 0);

  const handleSelectCraft = (craftId: string) => {
    playSound('navigate');
    navigate(`/craft/${craftId}`);
  };

  return (
    <div style={styles.container}>
      {/* 3D 场景（含中文标签） */}
      <MuseumScene onSelectCraft={handleSelectCraft} pixelSize={0.05} />
      {/* 注意：MuseumScene 内部已经根据 craft 数据定义了 mosaicStyle，无需额外传递 */}

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
    fontFamily: '"Microsoft YaHei", sans-serif',
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
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  userEmoji: {},
  userName: { fontSize: 14, color: '#a5b4fc', fontWeight: 600 },
  hudRight: {
    display: 'flex',
    alignItems: 'center',
  },
  progressBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 20,
    color: '#a5b4fc',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  progressBadge: {
    padding: '1px 6px',
    borderRadius: 8,
    backgroundColor: 'rgba(99,102,241,0.3)',
    color: '#c7d2fe',
  },
  hudHint: { fontSize: 12, color: '#4b5563' },
  bottomBar: {
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    backgroundColor: 'rgba(5,5,16,0.7)',
    backdropFilter: 'blur(10px)',
    borderRadius: 50,
    border: '1px solid rgba(255,255,255,0.1)',
    zIndex: 10,
  },
  craftChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    color: '#d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    imageRendering: 'pixelated', // 像素风格
    borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px) 1', // 像素边框
  },
};
