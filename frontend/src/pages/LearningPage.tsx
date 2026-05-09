import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HERITAGE_CRAFTS } from '../data';
import { getAllProgress } from '../utils/storage';
import { KnowledgePoint, DifficultyLevel } from '../types';
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

function RingProgress({ percent, size, strokeWidth, color }: { percent: number; size: number; strokeWidth: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
    </svg>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: DifficultyLevel }) {
  const config = {
    beginner: { label: '入门', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    intermediate: { label: '进阶', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    advanced: { label: '高级', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  };
  const c = config[difficulty];
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, backgroundColor: c.bg, color: c.color, fontSize: 11 }}>
      {c.label}
    </span>
  );
}

export default function LearningPage() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [expandedCraft, setExpandedCraft] = useState<string | null>(null);

  // 确保背景音乐已启动
  useEffect(() => {
    startBackgroundMusic();
  }, []);

  // 确保背景音乐已启动
  useEffect(() => {
    startBackgroundMusic();
  }, []);

  const progressData = useMemo(() => {
    const allProgress = getAllProgress();
    return HERITAGE_CRAFTS.map((craft) => {
      const craftProgress = allProgress.find((p) => p.craftId === craft.id);
      const learnedIds = craftProgress?.learnedPointIds || [];
      const total = craft.knowledgePoints.length;
      const learned = learnedIds.length;
      const percent = total > 0 ? Math.round((learned / total) * 100) : 0;
      return { craft, learnedIds, total, learned, percent };
    });
  }, []);

  const totalLearned = progressData.reduce((sum, d) => sum + d.learned, 0);
  const totalPoints = progressData.reduce((sum, d) => sum + d.total, 0);
  const overallPercent = totalPoints > 0 ? Math.round((totalLearned / totalPoints) * 100) : 0;

  return (
    <div style={{
      ...styles.container,
      paddingTop: isMobile ? 20 : 40,
      paddingBottom: isMobile ? 40 : 60,
    }}>
      <div style={styles.content}>
        {/* 返回按钮 */}
        <button onClick={() => { playSound('click'); navigate('/museum'); }} style={styles.backBtn}>
          ← 返回博物馆
        </button>

        {/* 标题 */}
        <div style={styles.header}>
          <div style={{ ...styles.titleIcon, fontSize: isMobile ? 24 : 32 }}>📚</div>
          <h1 style={{ ...styles.title, fontSize: isMobile ? 22 : 28 }}>学习进度</h1>
        </div>

        {/* 总进度概览 */}
        <div style={{
          ...styles.overview,
          flexDirection: isMobile ? 'column' : 'row',
          gap: isMobile ? 16 : 28,
          padding: isMobile ? 16 : 24,
        }}>
          <div style={{
            ...styles.overviewRing,
            width: isMobile ? 80 : 100,
            height: isMobile ? 80 : 100,
          }}>
            <RingProgress percent={overallPercent} size={isMobile ? 80 : 100} strokeWidth={isMobile ? 6 : 8} color="#6366f1" />
            <div style={styles.overviewText}>
              <div style={{ ...styles.overviewPercent, fontSize: isMobile ? 18 : 22 }}>{overallPercent}%</div>
              <div style={styles.overviewLabel}>总进度</div>
            </div>
          </div>
          <div style={{
            ...styles.overviewStats,
            flexDirection: isMobile ? 'row' : undefined,
            gap: isMobile ? 12 : 20,
          }}>
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, fontSize: isMobile ? 20 : 24 }}>{totalLearned}</div>
              <div style={styles.statLabel}>已学知识点</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, fontSize: isMobile ? 20 : 24 }}>{totalPoints}</div>
              <div style={styles.statLabel}>总知识点</div>
            </div>
            <div style={styles.statDivider} />
            <div style={styles.statItem}>
              <div style={{ ...styles.statNumber, fontSize: isMobile ? 20 : 24 }}>{HERITAGE_CRAFTS.length}</div>
              <div style={styles.statLabel}>非遗项目</div>
            </div>
          </div>
        </div>

        {/* 各项目进度 */}
        {progressData.map(({ craft, learnedIds, total, learned, percent }) => {
          const isExpanded = expandedCraft === craft.id;
          const craftColor = craft.id === 'craft_shadow_puppet' ? '#f59e0b'
            : craft.id === 'craft_paper_cutting' ? '#ef4444'
            : craft.id === 'craft_embroidery' ? '#ec4899'
            : '#14b8a6';

          return (
            <div key={craft.id} style={styles.craftCard}>
              {/* 项目头部 */}
              <div style={{
                ...styles.craftHeader,
                padding: isMobile ? '12px 14px' : '16px 20px',
              }} onClick={() => setExpandedCraft(isExpanded ? null : craft.id)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
                  <div style={styles.craftRing}>
                    <RingProgress percent={percent} size={isMobile ? 44 : 52} strokeWidth={4} color={craftColor} />
                    <div style={{ ...styles.craftRingText, fontSize: isMobile ? 10 : 12 }}>{percent}%</div>
                  </div>
                  <div>
                    <div style={{ ...styles.craftName, fontSize: isMobile ? 14 : 16 }}>{craft.emoji} {craft.name}</div>
                    <div style={styles.craftSub}>{craft.category} · 已学 {learned}/{total} 个知识点</div>
                  </div>
                </div>
                <div style={{ ...styles.expandIcon, transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</div>
              </div>

              {/* 展开的知识点列表 */}
              {isExpanded && (
                <div style={{
                  ...styles.pointList,
                  padding: isMobile ? '8px 14px' : '12px 20px',
                }}>
                  {craft.knowledgePoints.map((kp: KnowledgePoint) => {
                    const isLearned = learnedIds.includes(kp.id);
                    return (
                      <div key={kp.id} style={{
                        ...styles.pointItem,
                        borderLeftColor: isLearned ? craftColor : 'rgba(255,255,255,0.1)',
                        backgroundColor: isLearned ? `${craftColor}08` : 'transparent',
                        padding: isMobile ? '8px 10px' : '10px 14px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ color: isLearned ? craftColor : '#4b5563', fontSize: 14 }}>
                            {isLearned ? '✓' : '○'}
                          </span>
                          <span style={{ ...styles.pointTitle, color: isLearned ? '#e0e7ff' : '#6b7280', fontSize: isMobile ? 13 : 14 }}>
                            {kp.title}
                          </span>
                          <DifficultyBadge difficulty={kp.difficulty} />
                        </div>
                        {isLearned && (
                          <div style={styles.pointContent}>{kp.content}</div>
                        )}
                      </div>
                    );
                  })}
                  {learned === 0 && (
                    <div style={styles.emptyHint}>
                      还没有学习记录，去和传承人对话吧！
                      <div
                        style={styles.goChatBtn}
                        onClick={(e) => { e.stopPropagation(); navigate(`/craft/${craft.id}`); }}
                      >
                        前往学习 →
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
    maxWidth: 600,
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
    marginBottom: 24,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
  },
  titleIcon: {},
  title: {
    fontWeight: 700,
    margin: 0,
    background: 'linear-gradient(135deg, #a5b4fc, #ec4899)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  overview: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 24,
  },
  overviewRing: {
    position: 'relative',
    flexShrink: 0,
  },
  overviewText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
  overviewPercent: {
    fontWeight: 700,
    color: '#a5b4fc',
    lineHeight: 1,
  },
  overviewLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  overviewStats: {
    display: 'flex',
    flex: 1,
  },
  statItem: {
    textAlign: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 700,
    color: '#e0e7ff',
  },
  statLabel: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  craftCard: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  craftHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
  },
  craftRing: {
    position: 'relative',
    width: 52,
    height: 52,
    flexShrink: 0,
  },
  craftRingText: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontWeight: 600,
    color: '#e0e7ff',
  },
  craftName: {
    fontWeight: 600,
  },
  craftSub: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  expandIcon: {
    fontSize: 12,
    color: '#6b7280',
    transition: 'transform 0.3s ease',
  },
  pointList: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  pointItem: {
    borderRadius: 10,
    borderLeft: '3px solid',
    transition: 'all 0.2s ease',
  },
  pointTitle: {
    fontWeight: 500,
  },
  pointContent: {
    fontSize: 12,
    color: '#9ca3af',
    lineHeight: 1.6,
    marginTop: 4,
    paddingLeft: 22,
  },
  emptyHint: {
    textAlign: 'center',
    padding: '20px 0',
    color: '#6b7280',
    fontSize: 14,
  },
  goChatBtn: {
    display: 'inline-block',
    marginTop: 8,
    padding: '6px 16px',
    backgroundColor: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: 8,
    color: '#a5b4fc',
    fontSize: 13,
    cursor: 'pointer',
  },
};
