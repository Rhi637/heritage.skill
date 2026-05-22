import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { playSound, initAudioOnInteraction, startBackgroundMusic } from '../utils/audio';
import { useLang, t } from '../contexts/LanguageContext';
import { UserProfile } from '../types';

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
      {/* 像素星星（useMemo 避免重渲染闪烁） */}
      {useMemo(() => Array.from({ length: 40 }).map((_, i) => {
        const left = Math.random() * 100;
        const top = Math.random() * 60;
        const size = Math.random() > 0.7 ? 3 : 2;
        const alpha = 0.3 + Math.random() * 0.5;
        const dur = 1.5 + Math.random() * 2;
        return (
          <div key={`s${i}`} style={{
            position: 'absolute', left: `${left}%`, top: `${top}%`,
            width: size, height: size, backgroundColor: '#6366f1',
            opacity: alpha, imageRendering: 'pixelated',
            animation: `blink ${dur}s steps(2) infinite`,
          }} />
        );
      }), [])}
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
  const { lang, toggleLang } = useLang();

  const existingUser = useMemo((): UserProfile | null => {
    try { const d = localStorage.getItem('heritage_user'); return d ? JSON.parse(d) : null; }
    catch { return null; }
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink((b) => !b), 600);
    return () => clearInterval(t);
  }, []);

  const handleStart = () => {
    initAudioOnInteraction();
    startBackgroundMusic();
    playSound('click');
    navigate(existingUser ? '/museum' : '/avatar');
  };

  return (
    <div style={{
      width: '100vw', height: '100vh', backgroundColor: '#050510',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* 像素装饰框 */}
      <div style={{ position: 'absolute', top: 14, left: 14, right: 14, bottom: 14, border: '2px solid rgba(201,168,76,0.1)', pointerEvents: 'none', zIndex: 1 }} />
      {/* 四角装饰 */}
      {['tl','tr','bl','br'].map((pos) => (
        <div key={pos} style={{ position: 'absolute',
          top: pos.startsWith('t') ? 10 : undefined, bottom: pos.startsWith('b') ? 10 : undefined,
          left: pos.endsWith('l') ? 10 : undefined, right: pos.endsWith('r') ? 10 : undefined,
          width: 18, height: 18, zIndex: 1, pointerEvents: 'none',
          borderTop: pos.startsWith('t') ? '3px solid rgba(201,168,76,0.3)' : 'none',
          borderBottom: pos.startsWith('b') ? '3px solid rgba(201,168,76,0.3)' : 'none',
          borderLeft: pos.endsWith('l') ? '3px solid rgba(201,168,76,0.3)' : 'none',
          borderRight: pos.endsWith('r') ? '3px solid rgba(201,168,76,0.3)' : 'none',
        }} />
      ))}
      {/* 像素山背景 */}
      <PixelLandscape />

      {/* 飘落的非遗 icon */}
      <FallingIcons />

      {/* 主标题区 */}
      <div style={{ textAlign: 'center', zIndex: 2, marginBottom: isMobile ? 32 : 48 }}>
        {/* 像素标题 */}
        <h1 style={{
          fontSize: isMobile ? 22 : 36, fontWeight: 700, letterSpacing: isMobile ? 4 : 8,
          color: '#c9a84c', marginBottom: 8, imageRendering: 'pixelated',
          textShadow: '4px 4px 0 rgba(0,0,0,0.5), -2px -2px 0 rgba(99,102,241,0.2), 0 0 40px rgba(201,168,76,0.3)',
          lineHeight: 1.4,
        }}>
          {t('welcome_title', lang)}
        </h1>
        <p style={{
          fontSize: isMobile ? 11 : 14, color: '#7c6f56', letterSpacing: isMobile ? 3 : 6,
          imageRendering: 'pixelated', marginBottom: 4,
        }}>
          {t('welcome_sub', lang)}
        </p>
        <p style={{
          fontSize: isMobile ? 10 : 12, color: '#5c5040', letterSpacing: 2,
          imageRendering: 'pixelated',
        }}>
          {t('welcome_tag', lang)}
        </p>
        {existingUser && (
          <p style={{ fontSize: isMobile ? 10 : 12, color: '#c9a84c', letterSpacing: 2, imageRendering: 'pixelated', marginTop: 8 }}>
            {t('welcome_back', lang)}{existingUser.name}
          </p>
        )}
      </div>

      {/* 中国风分隔线 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isMobile ? 20 : 32, zIndex: 2 }}>
        <div style={{ width: isMobile ? 40 : 60, height: 2, backgroundColor: '#c9a84c' }} />
        <div style={{ width: isMobile ? 8 : 12, height: isMobile ? 8 : 12, backgroundColor: '#dc2626', transform: 'rotate(45deg)' }} />
        <div style={{ width: isMobile ? 40 : 60, height: 2, backgroundColor: '#c9a84c' }} />
        <div style={{ width: isMobile ? 8 : 12, height: isMobile ? 8 : 12, backgroundColor: '#dc2626', transform: 'rotate(45deg)' }} />
        <div style={{ width: isMobile ? 40 : 60, height: 2, backgroundColor: '#c9a84c' }} />
      </div>

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
        {existingUser
          ? (blink ? t('continue_explore', lang) : t('continue_explore', lang).replace('▶ ', '  '))
          : (blink ? t('press_start', lang) : t('press_start', lang).replace('▶ ', '  '))}
      </button>

      {/* 底部快捷入口 */}
      <div style={{
        position: 'absolute', bottom: isMobile ? 24 : 40,
        display: 'flex', gap: isMobile ? 10 : 20, zIndex: 2,
      }}>
        {[
          { label: t('enter_museum', lang), emoji: '🏛️', action: () => navigate('/museum') },
          { label: t('learning_progress', lang), emoji: '📖', action: () => navigate('/learning') },
          { label: t('user_page', lang), emoji: '👤', action: () => navigate('/user') },
        ].map((btn) => (
          <button key={btn.label} onClick={() => { initAudioOnInteraction(); playSound('click'); btn.action(); }} style={{
            padding: isMobile ? '6px 14px' : '8px 18px',
            backgroundColor: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 0, color: '#9ca3af', fontSize: isMobile ? 10 : 12,
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            {btn.emoji} {isMobile ? '' : btn.label}
          </button>
        ))}
        {/* 语言切换 */}
        <button onClick={() => { toggleLang(); playSound('click'); }} style={{
          padding: isMobile ? '6px 14px' : '8px 18px',
          backgroundColor: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)',
          borderRadius: 0, color: '#9ca3af', fontSize: isMobile ? 10 : 12,
          cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
          imageRendering: 'pixelated',
        }}>
          🌐 {lang === 'zh' ? '中' : 'EN'}
        </button>
        {/* 返回用户可重新选择形象 */}
        {existingUser && (
          <button onClick={() => { initAudioOnInteraction(); playSound('click'); navigate('/avatar'); }} style={{
            padding: isMobile ? '6px 14px' : '8px 18px',
            backgroundColor: 'rgba(255,255,255,0.04)', border: '2px solid rgba(255,255,255,0.1)',
            borderRadius: 0, color: '#9ca3af', fontSize: isMobile ? 10 : 12,
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            {t('change_avatar', lang)}
          </button>
        )}
      </div>

      {/* 版本号 */}
      <div style={{
        position: 'absolute', bottom: 12, right: 16, zIndex: 2,
        fontSize: 9, color: '#333355', letterSpacing: 2, imageRendering: 'pixelated',
      }}>
        {t('v_label', lang)}
      </div>
    </div>
  );
}
