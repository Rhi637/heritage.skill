import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AVATARS } from '../data';
import { UserAvatar } from '../types';
import { playSound, startBackgroundMusic } from '../utils/audio';
import { useLang, t } from '../contexts/LanguageContext';

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

export default function AvatarSelectPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { lang } = useLang();
  const [selected, setSelected] = useState<UserAvatar | null>(null);
  const [name, setName] = useState('');

  const handleConfirm = () => {
    if (!selected || !name.trim()) return;
    playSound('click');
    startBackgroundMusic(); // 确保背景音乐已启动
    const profile = {
      name: name.trim(),
      avatar: selected,
      createdAt: Date.now(),
    };
    localStorage.setItem('heritage_user', JSON.stringify(profile));
    playSound('navigate');
    navigate('/museum');
  };

  return (
    <div style={styles.container}>
      <div style={{
        ...styles.content,
        padding: isMobile ? '20px 16px' : undefined,
      }}>
        <h1 style={{
          ...styles.title,
          fontSize: isMobile ? 22 : 28,
        }}>{t('choose_avatar', lang)}</h1>
        <p style={styles.subtitle}>{t('avatar_sub', lang)}</p>

        <div style={{
          ...styles.grid,
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: isMobile ? 10 : 16,
          marginBottom: isMobile ? 20 : 32,
        }}>
          {AVATARS.map((avatar) => (
            <div
              key={avatar.id}
              style={{
                ...styles.card,
                padding: isMobile ? 14 : 20,
                borderColor: selected?.id === avatar.id ? avatar.color : 'rgba(255,255,255,0.1)',
                boxShadow: selected?.id === avatar.id ? `0 0 20px ${avatar.color}40` : 'none',
              }}
              onClick={() => {
                setSelected(avatar);
                playSound('click');
              }}
            >
              <div style={{
                ...styles.emoji,
                backgroundColor: `${avatar.color}20`,
                width: isMobile ? 44 : 56,
                height: isMobile ? 44 : 56,
                fontSize: isMobile ? 22 : 28,
              }}>
                {avatar.emoji}
              </div>
              <div style={{
                ...styles.cardName,
                fontSize: isMobile ? 11 : 13,
              }}>{avatar.name}</div>
            </div>
          ))}
        </div>

        <div style={styles.inputGroup}>
          <input
            style={{
              ...styles.input,
              padding: isMobile ? '10px 16px' : '12px 20px',
              fontSize: isMobile ? 14 : 16,
            }}
            type="text"
            placeholder={t('enter_name', lang)}
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={12}
          />
        </div>

        <button
          style={{
            ...styles.confirmBtn,
            padding: isMobile ? '12px 36px' : '14px 48px',
            fontSize: isMobile ? 14 : 16,
            opacity: selected && name.trim() ? 1 : 0.4,
            cursor: selected && name.trim() ? 'pointer' : 'not-allowed',
          }}
          onClick={handleConfirm}
        >
          {t('enter_btn', lang)}
        </button>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    height: '100vh',
    backgroundColor: '#050510',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    color: '#e0e7ff',
    overflowY: 'auto',
    imageRendering: 'pixelated',
  },
  content: {
    maxWidth: 600,
    width: '90%',
    textAlign: 'center',
  },
  title: {
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    fontWeight: 700,
    marginBottom: 8,
    color: '#a5b4fc',
    textShadow: '3px 3px 0 rgba(0,0,0,0.3), 0 0 20px rgba(99,102,241,0.3)',
    letterSpacing: 3,
    imageRendering: 'pixelated',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 32,
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    letterSpacing: 2,
    imageRendering: 'pixelated',
  },
  grid: {
    display: 'grid',
    marginBottom: 32,
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    borderRadius: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '3px solid rgba(255,255,255,0.15)',
    cursor: 'pointer',
    transition: 'none',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
  },
  emoji: {
    borderRadius: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    imageRendering: 'pixelated',
    border: '2px solid rgba(255,255,255,0.1)',
  },
  cardName: {
    color: '#9ca3af',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 2,
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    width: '100%',
    maxWidth: 300,
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '3px solid rgba(255,255,255,0.15)',
    borderRadius: 0,
    color: '#e0e7ff',
    outline: 'none',
    textAlign: 'center' as const,
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 2,
  },
  confirmBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: '3px solid #818cf8',
    borderRadius: 0,
    fontWeight: 600,
    letterSpacing: 4,
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    transition: 'none',
    imageRendering: 'pixelated',
    boxShadow: '5px 5px 0 rgba(0,0,0,0.3)',
  },
};
