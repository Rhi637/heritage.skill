import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiKey, setApiKey, removeApiKey } from '../utils/storage';
import { playSound, isMuted, toggleMute, getVolume, setVolume, startBackgroundMusic, stopBackgroundMusic, updateBackgroundMusicVolume } from '../utils/audio';

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

export default function SettingsPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [key, setKey] = useState(getApiKey() || '');
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [volume, setVolumeState] = useState(getVolume());

  const handleSave = () => {
    if (key.trim()) {
      setApiKey(key.trim());
      setSaved(true);
      playSound('click');
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const handleClear = () => {
    removeApiKey();
    setKey('');
    playSound('click');
  };

  return (
    <div style={{
      ...styles.container,
      paddingTop: isMobile ? 40 : 60,
    }}>
      <div style={styles.content}>
        {/* 返回按钮（像素风格） */}
        <button onClick={() => { playSound('click'); navigate(-1); }} style={{ ...styles.backBtn, imageRendering: 'pixelated', borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px) 1' }}>
          ← 返回
        </button>

        {/* 标题（像素风格） */}
        <div style={styles.header}>
          <div style={{ ...styles.titleIcon, fontSize: isMobile ? 24 : 32, imageRendering: 'pixelated' }}>⚙️</div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 22 : 28, imageRendering: 'pixelated', textShadow: '2px 2px 0 rgba(99,102,241,0.3), -2px -2px 0 rgba(99,102,241,0.3)' }}>设置</h1>
        </div>

        {/* API Key 设置（像素风格） */}
        <div style={{
          ...styles.section,
          padding: isMobile ? 16 : 24,
          imageRendering: 'pixelated',
          borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 4px) 1',
        }}>
          <div style={{ ...styles.sectionTitle, fontSize: isMobile ? 15 : 16, imageRendering: 'pixelated' }}>智谱 GLM API Key</div>
          <div style={{ ...styles.sectionDesc, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
            用于调用智谱 GLM-4-Flash 大模型，实现与传承人的智能对话。
            请前往 <a href="https://open.bigmodel.cn" target="_blank" rel="noopener noreferrer" style={{ ...styles.link, imageRendering: 'pixelated' }}>open.bigmodel.cn</a> 注册并获取 API Key。
          </div>

          <div style={{
            ...styles.inputGroup,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 8,
          }}>
            <input
              style={{
                ...styles.input,
                padding: isMobile ? '10px 12px' : '10px 16px',
                fontSize: isMobile ? 13 : 14,
                imageRendering: 'pixelated',
                borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px) 1',
              }}
              type={showKey ? 'text' : 'password'}
              placeholder="请输入你的 API Key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />
            <button onClick={() => setShowKey(!showKey)} style={{
              ...styles.toggleBtn,
              padding: isMobile ? '10px 12px' : '10px 16px',
              fontSize: isMobile ? 12 : 13,
              imageRendering: 'pixelated',
              borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 2px, transparent 2px, transparent 4px) 1',
            }}>
              {showKey ? '隐藏' : '显示'}
            </button>
          </div>

          <div style={{
            ...styles.btnGroup,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? 8 : 8,
          }}>
            <button
              style={{
                ...styles.saveBtn,
                padding: isMobile ? '10px 20px' : '10px 24px',
                fontSize: isMobile ? 13 : 14,
                opacity: key.trim() ? 1 : 0.4,
                cursor: key.trim() ? 'pointer' : 'not-allowed',
                imageRendering: 'pixelated',
                borderImage: 'repeating-linear-gradient(45deg, rgba(99,102,241,0.5) 0px, rgba(99,102,241,0.5) 2px, transparent 2px, transparent 4px) 1',
              }}
              onClick={handleSave}
              disabled={!key.trim()}
            >
              {saved ? '已保存 ✓' : '保存 Key'}
            </button>
            {key && (
              <button onClick={handleClear} style={{
                ...styles.clearBtn,
                padding: isMobile ? '10px 20px' : '10px 24px',
                fontSize: isMobile ? 13 : 14,
                imageRendering: 'pixelated',
                borderImage: 'repeating-linear-gradient(45deg, rgba(239,68,68,0.3) 0px, rgba(239,68,68,0.3) 2px, transparent 2px, transparent 4px) 1',
              }}>
                清除 Key
              </button>
            )}
          </div>

          {/* 状态指示（像素风格） */}
          <div style={{ ...styles.statusRow, imageRendering: 'pixelated' }}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: key.trim() ? '#22c55e' : '#ef4444',
              imageRendering: 'pixelated',
            }} />
            <span style={{ ...styles.statusText, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
              {key.trim() ? 'API Key 已配置' : '未配置 API Key（无法使用对话功能）'}
            </span>
          </div>
        </div>

        {/* 背景音乐设置（像素风格） */}
        <div style={{
          ...styles.section,
          padding: isMobile ? 16 : 24,
          imageRendering: 'pixelated',
          borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 4px) 1',
        }}>
          <div style={{ ...styles.sectionTitle, fontSize: isMobile ? 15 : 16, imageRendering: 'pixelated' }}>背景音乐</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <button
              onClick={() => {
                const newMuted = toggleMute();
                setMutedState(newMuted);
                if (newMuted) {
                  stopBackgroundMusic();
                } else {
                  startBackgroundMusic();
                }
                playSound('click');
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: muted ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)',
                border: `1px solid ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                borderRadius: 10,
                color: muted ? '#f87171' : '#4ade80',
                fontSize: 14,
                cursor: 'pointer',
                imageRendering: 'pixelated',
                borderImage: `repeating-linear-gradient(45deg, ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'} 0px, ${muted ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'} 2px, transparent 2px, transparent 4px) 1`,
              }}
            >
              {muted ? '🔇 已静音' : '🔊 已开启'}
            </button>
          </div>
          {!muted && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, color: '#9ca3af', imageRendering: 'pixelated' }}>音量</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolumeState(v);
                  setVolume(v);
                  updateBackgroundMusicVolume();
                }}
                style={{ flex: 1, accentColor: '#6366f1', cursor: 'pointer', imageRendering: 'pixelated' }}
              />
              <span style={{ fontSize: 12, color: '#6b7280', minWidth: 30, textAlign: 'right', imageRendering: 'pixelated' }}>
                {Math.round(volume * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* 使用说明（像素风格） */}
        <div style={{
          ...styles.section,
          padding: isMobile ? 16 : 24,
          imageRendering: 'pixelated',
          borderImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, transparent 2px, transparent 4px) 1',
        }}>
          <div style={{ ...styles.sectionTitle, fontSize: isMobile ? 15 : 16, imageRendering: 'pixelated' }}>使用说明</div>
          <div style={{ ...styles.infoList, imageRendering: 'pixelated' }}>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
              <span style={{ ...styles.infoIcon, imageRendering: 'pixelated' }}>1.</span>
              <span>每天免费 10 次问答，用完后需等待次日重置</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
              <span style={{ ...styles.infoIcon, imageRendering: 'pixelated' }}>2.</span>
              <span>对话中涉及的知识点会自动标记为已学习</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
              <span style={{ ...styles.infoIcon, imageRendering: 'pixelated' }}>3.</span>
              <span>学习进度保存在本地浏览器中</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13, imageRendering: 'pixelated' }}>
              <span style={{ ...styles.infoIcon, imageRendering: 'pixelated' }}>4.</span>
              <span>API Key 仅保存在你的浏览器本地，不会上传到任何服务器</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#050510',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    color: '#e0e7ff',
    display: 'flex',
    justifyContent: 'center',
    imageRendering: 'pixelated',
  },
  content: { maxWidth: 520, width: '90%' },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    color: '#9ca3af',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 32,
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 2,
  },
  header: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 },
  titleIcon: { imageRendering: 'pixelated' },
  title: {
    fontWeight: 700,
    margin: 0,
    color: '#a5b4fc',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    textShadow: '3px 3px 0 rgba(0,0,0,0.3)',
    letterSpacing: 3,
    imageRendering: 'pixelated',
  },
  section: {
    borderRadius: 0,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '3px solid rgba(255,255,255,0.1)',
    marginBottom: 20,
    boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
  },
  sectionTitle: { fontWeight: 600, marginBottom: 8, color: '#e0e7ff', fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: 2 },
  sectionDesc: { color: '#6b7280', lineHeight: 1.6, marginBottom: 16, fontFamily: "'Zpix','Microsoft YaHei',monospace" },
  link: { color: '#a5b4fc', textDecoration: 'none', fontFamily: "'Zpix','Microsoft YaHei',monospace" },
  inputGroup: { display: 'flex', marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    color: '#e0e7ff',
    outline: 'none',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '2px solid rgba(255,255,255,0.1)',
    borderRadius: 0,
    color: '#9ca3af',
    cursor: 'pointer',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
  },
  btnGroup: { display: 'flex', marginBottom: 16 },
  saveBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: '3px solid #818cf8',
    borderRadius: 0,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
    letterSpacing: 3,
    boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
  },
  clearBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '2px solid rgba(239,68,68,0.3)',
    borderRadius: 0,
    cursor: 'pointer',
    fontFamily: "'Zpix','Microsoft YaHei',monospace",
    imageRendering: 'pixelated',
  },
  statusRow: { display: 'flex', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 0 },
  statusText: { color: '#6b7280', fontFamily: "'Zpix','Microsoft YaHei',monospace" },
  infoList: { display: 'flex', flexDirection: 'column' as const, gap: 10 },
  infoItem: { display: 'flex', alignItems: 'flex-start', gap: 10, color: '#9ca3af', lineHeight: 1.6, fontFamily: "'Zpix','Microsoft YaHei',monospace" },
  infoIcon: { color: '#a5b4fc', fontWeight: 600, flexShrink: 0, fontFamily: "'Zpix','Microsoft YaHei',monospace" },
};
