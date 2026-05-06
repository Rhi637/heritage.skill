import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getApiKey, setApiKey, removeApiKey } from '../utils/storage';
import { playSound } from '../utils/audio';

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
        {/* 返回按钮 */}
        <button onClick={() => { playSound('click'); navigate(-1); }} style={styles.backBtn}>
          ← 返回
        </button>

        {/* 标题 */}
        <div style={styles.header}>
          <div style={{ ...styles.titleIcon, fontSize: isMobile ? 24 : 32 }}>⚙️</div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 22 : 28 }}>设置</h1>
        </div>

        {/* API Key 设置 */}
        <div style={{
          ...styles.section,
          padding: isMobile ? 16 : 24,
        }}>
          <div style={{ ...styles.sectionTitle, fontSize: isMobile ? 15 : 16 }}>智谱 GLM API Key</div>
          <div style={{ ...styles.sectionDesc, fontSize: isMobile ? 12 : 13 }}>
            用于调用智谱 GLM-4-Flash 大模型，实现与传承人的智能对话。
            请前往 <a href="https://open.bigmodel.cn" target="_blank" rel="noopener noreferrer" style={styles.link}>open.bigmodel.cn</a> 注册并获取 API Key。
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
              }}>
                清除 Key
              </button>
            )}
          </div>

          {/* 状态指示 */}
          <div style={styles.statusRow}>
            <div style={{
              ...styles.statusDot,
              backgroundColor: key.trim() ? '#22c55e' : '#ef4444',
            }} />
            <span style={{ ...styles.statusText, fontSize: isMobile ? 12 : 13 }}>
              {key.trim() ? 'API Key 已配置' : '未配置 API Key（无法使用对话功能）'}
            </span>
          </div>
        </div>

        {/* 使用说明 */}
        <div style={{
          ...styles.section,
          padding: isMobile ? 16 : 24,
        }}>
          <div style={{ ...styles.sectionTitle, fontSize: isMobile ? 15 : 16 }}>使用说明</div>
          <div style={styles.infoList}>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13 }}>
              <span style={styles.infoIcon}>1.</span>
              <span>每天免费 10 次问答，用完后需等待次日重置</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13 }}>
              <span style={styles.infoIcon}>2.</span>
              <span>对话中涉及的知识点会自动标记为已学习</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13 }}>
              <span style={styles.infoIcon}>3.</span>
              <span>学习进度保存在本地浏览器中</span>
            </div>
            <div style={{ ...styles.infoItem, fontSize: isMobile ? 12 : 13 }}>
              <span style={styles.infoIcon}>4.</span>
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
    fontFamily: '"Microsoft YaHei", sans-serif',
    color: '#e0e7ff',
    display: 'flex',
    justifyContent: 'center',
  },
  content: {
    maxWidth: 520,
    width: '90%',
  },
  backBtn: {
    padding: '8px 16px',
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    color: '#9ca3af',
    fontSize: 14,
    cursor: 'pointer',
    marginBottom: 32,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 32,
  },
  titleIcon: {},
  title: {
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #a5b4fc, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  section: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 600,
    marginBottom: 8,
    color: '#e0e7ff',
  },
  sectionDesc: {
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: 16,
  },
  link: {
    color: '#a5b4fc',
    textDecoration: 'none',
  },
  inputGroup: {
    display: 'flex',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#e0e7ff',
    outline: 'none',
    fontFamily: 'monospace',
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    color: '#9ca3af',
    cursor: 'pointer',
  },
  btnGroup: {
    display: 'flex',
    marginBottom: 16,
  },
  saveBtn: {
    backgroundColor: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  clearBtn: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    color: '#f87171',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 10,
    cursor: 'pointer',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
  },
  statusText: {
    color: '#6b7280',
  },
  infoList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  infoItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    color: '#9ca3af',
    lineHeight: 1.6,
  },
  infoIcon: {
    color: '#a5b4fc',
    fontWeight: 600,
    flexShrink: 0,
  },
};
