import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { playSound, initAudioOnInteraction, startBackgroundMusic } from '../utils/audio';

// ========== 移动端检测 ==========
function useIsMobile(): boolean {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setM(window.innerWidth < 768);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return m;
}

// ========== 像素浮岛（CSS 像素山） ==========
function PixelLandscape() {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '40%', overflow: 'hidden', pointerEvents: 'none' }}>
      {/* 远山 */}
      {[20, 50, 75].map((l, i) => (
        <div key={`m${i}`} style={{
          position: 'absolute', bottom: 0, left: `${l}%`,
          width: 0, height: 0,
          borderLeft: `${60 + i * 30}px solid transparent`,
          borderRight: `${40 + i * 20}px solid transparent`,
          borderBottom: `${100 + i * 50}px solid #0f0f2e`,
          transform: 'translateX(-50%)',
        }} />
      ))}
      {/* 像素风格地面条纹 */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={`g${i}`} style={{
          position: 'absolute', bottom: 0, left: `${i * 5}%`,
          width: '5%', height: `${4 + (i % 3) * 3}px`,
          backgroundColor: i % 2 === 0 ? '#111133' : '#0d0d28',
          imageRendering: 'pixelated',
        }} />
      ))}
      {/* 像素星星 */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={`s${i}`} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 60}%`,
          width: `${Math.random() > 0.7 ? 3 : 2}px`,
          height: `${Math.random() > 0.7 ? 3 : 2}px`,
          backgroundColor: '#6366f1',
          opacity: 0.3 + Math.random() * 0.5,
          imageRendering: 'pixelated',
          animation: `blink ${1.5 + Math.random() * 2}s steps(2) infinite`,
        }} />
      ))}
    </div>
  );
}

// ========== 飘落的非遗 icon ==========
const CRAFT_ICONS = ['🎭', '✂️', '🪡', '🏺', '🔵', '🧧'];

function FallingIcons() {
  const icons = useMemo(() =>
    Array.from({ length: 15 }).map((_, i) => ({
      icon: CRAFT_ICONS[i % CRAFT_ICONS.length],
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 10,
      size: 14 + Math.random() * 20,
    })), []
  );

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
      {icons.map((ic, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${ic.left}%`,
          top: -40,
          fontSize: ic.size,
          imageRendering: 'pixelated',
          animation: `iconFall ${ic.duration}s linear ${ic.delay}s infinite`,
          opacity: 0.5,
        }}>{ic.icon}</div>
      ))}
      <style>{`
        @keyframes iconFall {
          0% { transform: translateY(-40px) rotate(0deg); opacity: 0.6; }
          80% { opacity: 0.4; }
          100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ========== 欢迎页 ==========
export default function WelcomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  const handleStart = () => {
    initAudioOnInteraction();
    startBackgroundMusic();
    playSound('click');
    navigate('/avatar');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: '#050510',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 像素山背景 */}
      <PixelLandscape />

      {/* 飘落的非遗 icon */}
      <FallingIcons />

      {/* 主标题区 */}
      <div style={{ textAlign: 'center', zIndex: 2, marginBottom: isMobile ? 32 : 48 }}>
        {/* 像素标题 */}
        <h1 style={{
          fontSize: isMobile ? 22 : 36, fontWeight: 700, letterSpacing: isMobile ? 4 : 8,
          color: '#a5b4fc', marginBottom: 8, imageRendering: 'pixelated',
          textShadow: '4px 4px 0 rgba(0,0,0,0.5), -2px -2px 0 rgba(99,102,241,0.3), 0 0 30px rgba(99,102,241,0.3)',
          lineHeight: 1.4,
        }}>
          非遗文化博物馆
        </h1>
        <p style={{
          fontSize: isMobile ? 11 : 14, color: '#6b7280', letterSpacing: isMobile ? 3 : 6,
          imageRendering: 'pixelated', marginBottom: 4,
        }}>
          INTANGIBLE CULTURAL HERITAGE
        </p>
        <p style={{
          fontSize: isMobile ? 10 : 12, color: '#4b5563', letterSpacing: 2,
          imageRendering: 'pixelated',
        }}>
          传承人蒸馏数字智能体
        </p>
      </div>

      {/* 像素分隔线 */}
      <div style={{
        width: isMobile ? 180 : 280, height: 3, backgroundColor: '#6366f1',
        marginBottom: isMobile ? 20 : 32, imageRendering: 'pixelated',
        boxShadow: '0 0 10px rgba(99,102,241,0.5)',
      }} />

      {/* PRESS START 闪烁 */}
      <button onClick={handleStart} style={{
        padding: isMobile ? '12px 32px' : '16px 48px',
        backgroundColor: 'rgba(99,102,241,0.15)', border: '3px solid rgba(99,102,241,0.5)',
        borderRadius: 0, color: blink ? '#a5b4fc' : '#6366f1',
        fontSize: isMobile ? 14 : 18, fontWeight: 700, cursor: 'pointer',
        fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: isMobile ? 4 : 6,
        imageRendering: 'pixelated', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
        transition: 'color 0.1s steps(2)',
      }}>
        {blink ? '▶ PRESS START' : '  PRESS START'}
      </button>

      {/* 底部快捷入口 */}
      <div style={{
        position: 'absolute', bottom: isMobile ? 24 : 40,
        display: 'flex', gap: isMobile ? 10 : 20, zIndex: 2,
      }}>
        {[
          { label: '进入博物馆', emoji: '🏛️', action: () => navigate('/museum') },
          { label: '学习进度', emoji: '📖', action: () => navigate('/learning') },
          { label: '用户', emoji: '👤', action: () => navigate('/user') },
        ].map((btn) => (
          <button key={btn.label} onClick={() => { playSound('click'); btn.action(); }} style={{
            padding: isMobile ? '6px 14px' : '8px 18px',
            backgroundColor: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 0, color: '#9ca3af', fontSize: isMobile ? 10 : 12,
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            {btn.emoji} {isMobile ? '' : btn.label}
          </button>
        ))}
      </div>

      {/* 版本号 */}
      <div style={{
        position: 'absolute', bottom: 12, right: 16, zIndex: 2,
        fontSize: 9, color: '#333355', letterSpacing: 2, imageRendering: 'pixelated',
      }}>
        v2.0
      </div>
    </div>
  );
}
