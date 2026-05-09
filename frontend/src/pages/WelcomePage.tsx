import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import { useState, useEffect } from 'react';
import { playSound, initAudioOnInteraction, startBackgroundMusic } from '../utils/audio';

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

// ========== 3D 星空场景（纯视觉，不含文字） ==========

function StarScene() {
  return (
    <>
      <Stars radius={80} depth={50} count={2000} factor={4} fade speed={1} />
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 3, 3]} color="#6366f1" intensity={2} />
    </>
  );
}

// ========== 欢迎页 ==========

export default function WelcomePage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleStart = () => {
    initAudioOnInteraction();
    startBackgroundMusic();
    playSound('click');
    navigate('/avatar');
  };

  return (
    <div style={styles.container}>
      {/* 3D 星空背景 */}
      <div style={styles.canvasWrapper}>
        <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
          <color attach="background" args={['#050510']} />
          <StarScene />
        </Canvas>
      </div>

      {/* HTML 文字覆盖层（支持中文） */}
      <div style={styles.textOverlay}>
        <h1 style={{
          ...styles.title,
          fontSize: isMobile ? 28 : 42,
          letterSpacing: isMobile ? 2 : 4,
        }}>
          非遗传承人蒸馏数字智能体
        </h1>
        <p style={{
          ...styles.subtitle,
          fontSize: isMobile ? 14 : 18,
        }}>
          穿越时空，与千年匠人对话
        </p>
      </div>

      {/* 按钮 */}
      <div style={{
        ...styles.buttonOverlay,
        bottom: isMobile ? 60 : 80,
      }}>
        <button
          style={{
            ...styles.button,
            padding: isMobile ? '12px 28px' : '16px 40px',
            fontSize: isMobile ? 16 : 18,
          }}
          onClick={handleStart}
        >
          <span style={{
            ...styles.buttonIcon,
            fontSize: isMobile ? 20 : 24,
          }}>🚀</span>
          <span style={styles.buttonText}>开始探索</span>
        </button>
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
  },
  canvasWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    top: '35%',
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 10,
    pointerEvents: 'none',
  },
  title: {
    fontWeight: 700,
    color: '#a5b4fc',
    textAlign: 'center',
    marginBottom: 16,
    textShadow: '0 0 40px rgba(99,102,241,0.5)',
  },
  subtitle: {
    color: '#6b7280',
    textAlign: 'center',
    letterSpacing: 2,
  },
  buttonOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'center',
    zIndex: 10,
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    border: '1px solid rgba(99, 102, 241, 0.5)',
    borderRadius: 50,
    color: '#e0e7ff',
    cursor: 'pointer',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
  },
  buttonIcon: {},
  buttonText: {
    fontWeight: 600,
    letterSpacing: 2,
  },
};
