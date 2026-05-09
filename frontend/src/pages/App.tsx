import { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import WelcomePage from './WelcomePage';
import AvatarSelectPage from './AvatarSelectPage';
import MuseumPage from './MuseumPage';
import CraftPage from './CraftPage';
import LearningPage from './LearningPage';
import SettingsPage from './SettingsPage';
import { isMuted, toggleMute, initAudioOnInteraction, getVolume, setVolume, updateBackgroundMusicVolume } from '../utils/audio';

// ========== 全局音频控制按钮 ==========

function AudioControlButton() {
  const [muted, setMutedState] = useState(isMuted());
  const [showVolume, setShowVolume] = useState(false);
  const [volume, setVolumeState] = useState(getVolume());

  const handleToggle = () => {
    initAudioOnInteraction();
    const newMuted = toggleMute();
    setMutedState(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolumeState(v);
    setVolume(v);
    updateBackgroundMusicVolume();
  };

  return (
    <div
      style={controlStyles.wrapper}
      onMouseEnter={() => setShowVolume(true)}
      onMouseLeave={() => setShowVolume(false)}
    >
      <button onClick={handleToggle} style={controlStyles.button}>
        {muted ? '🔇' : '🔊'}
      </button>
      {showVolume && !muted && (
        <div style={controlStyles.slider}>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={handleVolumeChange}
            style={controlStyles.rangeInput}
          />
        </div>
      )}
    </div>
  );
}

const controlStyles: Record<string, React.CSSProperties> = {
  wrapper: {
    position: 'fixed',
    top: 16,
    right: 16,
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(5,5,16,0.7)',
    backdropFilter: 'blur(10px)',
    cursor: 'pointer',
    fontSize: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  slider: {
    padding: '8px 12px',
    borderRadius: 12,
    backgroundColor: 'rgba(5,5,16,0.8)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  rangeInput: {
    width: 100,
    accentColor: '#6366f1',
    cursor: 'pointer',
  },
};

// ========== CSS 动画注入 ==========

function InjectAnimations() {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      @keyframes blink {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  return null;
}

// ========== 主应用 ==========

export default function App() {
  return (
    <HashRouter>
      <InjectAnimations />
      <AudioControlButton />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/avatar" element={<AvatarSelectPage />} />
        <Route path="/museum" element={<MuseumPage />} />
        <Route path="/craft/:craftId" element={<CraftPage />} />
        <Route path="/learning" element={<LearningPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
