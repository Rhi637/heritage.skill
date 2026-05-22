import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HERITAGE_CRAFTS } from '../data';
import { HeritageCraft, Inheritor, Message, GLMMessage } from '../types';
import { getApiKey, getRemainingQuota, isQuotaExhausted, incrementDailyUsage, markKnowledgePointsLearned } from '../utils/storage';
import { buildSystemPrompt, callGLMApi, extractKnowledgePointIds } from '../utils/api';
import { playSound, startBackgroundMusic } from '../utils/audio';
import InheritorAvatar from '../components/InheritorAvatar';

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

export default function CraftPage() {
  const { craftId } = useParams<{ craftId: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const craft: HeritageCraft | undefined = HERITAGE_CRAFTS.find((c) => c.id === craftId);
  const craftColor = craft?.id === 'craft_shadow_puppet' ? '#f59e0b'
    : craft?.id === 'craft_paper_cutting' ? '#ef4444'
    : craft?.id === 'craft_embroidery' ? '#ec4899'
    : '#14b8a6';

  const [selectedInheritor, setSelectedInheritor] = useState<Inheritor | null>(null);
  const [travelingInheritor, setTravelingInheritor] = useState<Inheritor | null>(null);
  const [showDetail, setShowDetail] = useState<Inheritor | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelPhase, setTravelPhase] = useState(0);
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 清理打字机效果的定时器
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const handleSelectInheritor = (inheritor: Inheritor) => {
    playSound('travel');
    startBackgroundMusic(); // 确保背景音乐已启动
    setTravelingInheritor(inheritor);
    setIsTraveling(true);
    setTravelPhase(0);
    setTimeout(() => setTravelPhase(1), 500);
    setTimeout(() => setTravelPhase(2), 1500);
    setTimeout(() => setTravelPhase(3), 2500);
    setTimeout(() => {
      setSelectedInheritor(inheritor);
      setTravelingInheritor(null);
      setIsTraveling(false);
      setTravelPhase(0);
      setMessages([
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: inheritor.era === 'ancient'
            ? `你好！我是${inheritor.dynasty}的${inheritor.name}，${inheritor.catchphrases[0]}。有什么想学的，尽管问我！`
            : `你好！我是${inheritor.name}，${inheritor.catchphrases[0]}。来，我带你了解${craft?.name}！`,
          timestamp: Date.now(),
        },
      ]);
    }, 3500);
  };

  // 打字机效果
  const typewriterEffect = useCallback((
    msgId: string,
    fullText: string,
    kpIds: string[]
  ) => {
    let index = 0;
    const speed = 30; // 每个字的间隔（毫秒）

    const type = () => {
      if (abortRef.current?.signal.aborted) return;
      index += 1;
      const currentText = fullText.slice(0, index);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === msgId
            ? { ...m, content: currentText, isTyping: index < fullText.length }
            : m
        )
      );
      if (index < fullText.length) {
        setTimeout(type, speed);
      } else {
        // 打字完成，标记知识点为已学习
        if (kpIds.length > 0 && craftId) {
          markKnowledgePointsLearned(craftId, kpIds);
        }
        playSound('reply');
      }
    };
    type();
  }, [craftId]);

  const handleSend = async (customText?: string) => {
    const text = (customText || input).trim();
    if (!text || isLoading) return;

    // 检查 API Key
    const apiKey = getApiKey();
    if (!apiKey) {
      setShowApiModal(true);
      return;
    }

    // 检查配额
    if (isQuotaExhausted()) {
      setShowQuotaModal(true);
      return;
    }

    playSound('send');
    const userMsg: Message = { id: crypto.randomUUID(), role: 'user', content: text, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 增加使用次数
      incrementDailyUsage();

      // 构建系统提示词
      const systemPrompt = buildSystemPrompt(
        selectedInheritor!,
        craft!,
        craft!.knowledgePoints
      );

      // 构建对话历史（最近 10 条）
      const recentMessages = messages.slice(-10).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      // 调用 API
      const reply = await callGLMApi(apiKey, systemPrompt, recentMessages as GLMMessage[], text);

      // 提取知识点 ID
      const allPointIds = craft!.knowledgePoints.map((kp) => kp.id);
      const kpIds = extractKnowledgePointIds(reply, allPointIds);

      // 创建消息（先显示空内容，打字机效果填充）
      const assistantMsgId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        {
          id: assistantMsgId,
          role: 'assistant',
          content: '',
          knowledgePointIds: kpIds,
          timestamp: Date.now(),
          isTyping: true,
        },
      ]);

      // 启动打字机效果
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();
      typewriterEffect(assistantMsgId, reply, kpIds);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '未知错误';
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `哎呀，出了点问题：${errorMsg}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取推荐问题
  const getSuggestedQuestions = (): string[] => {
    if (!craft) return [];
    const allQuestions = craft.knowledgePoints.flatMap((kp) => kp.suggestedQuestions);
    // 随机选 3 个
    const shuffled = allQuestions.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  };

  const suggestedQuestions = getSuggestedQuestions();

  // ========== 时空穿梭动画 ==========
  if (isTraveling && travelingInheritor) {
    const isAncient = travelingInheritor.era === 'ancient';
    const bgColor = isAncient ? '#1a0a00' : '#0a0a2e';
    const accentColor = isAncient ? '#f59e0b' : '#6366f1';
    const ringSize = isMobile ? 160 : 220;
    const ring2Size = isMobile ? 120 : 170;
    const ring3Size = isMobile ? 80 : 120;
    const avatarSize = isMobile ? 60 : 80;

    return (
      <div style={{ width: '100vw', height: '100vh', background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: '"Microsoft YaHei", sans-serif', transition: 'background 1s ease', overflow: 'hidden' }}>
        {/* 粒子效果（像素风格） */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${Math.random() * 100}%`,
              top: travelPhase >= 2 ? `${Math.random() * 100}%` : '100%',
              width: 4,
              height: 4,
              borderRadius: 0, // 方形粒子
              backgroundColor: accentColor,
              opacity: travelPhase >= 1 ? 0.6 : 0,
              transition: `top ${1 + Math.random()}s ease-out, opacity 0.5s ease`,
              animation: travelPhase >= 1 ? `float ${2 + Math.random() * 3}s ease-in-out infinite` : 'none',
              imageRendering: 'pixelated',
            }} />
          ))}
        </div>

        {/* 旋转光环（像素风格） */}
        <div style={{ position: 'relative', width: ringSize, height: ringSize, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ position: 'absolute', width: ringSize, height: ringSize, borderRadius: '50%', border: `2px solid ${accentColor}`, opacity: travelPhase >= 1 ? 0.8 : 0.3, transition: 'all 0.5s ease', animation: 'spin 2s linear infinite', imageRendering: 'pixelated', borderImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 2px, transparent 2px, transparent 4px) 1` }} />
          <div style={{ position: 'absolute', width: ring2Size, height: ring2Size, borderRadius: '50%', border: `2px solid ${accentColor}`, opacity: travelPhase >= 1 ? 0.6 : 0.2, transition: 'all 0.5s ease', animation: 'spin 1.5s linear infinite reverse', imageRendering: 'pixelated', borderImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 2px, transparent 2px, transparent 4px) 1` }} />
          <div style={{ position: 'absolute', width: ring3Size, height: ring3Size, borderRadius: '50%', border: `2px solid ${accentColor}`, opacity: travelPhase >= 2 ? 0.5 : 0.1, transition: 'all 0.5s ease', animation: 'spin 1s linear infinite', imageRendering: 'pixelated', borderImage: `repeating-linear-gradient(45deg, ${accentColor} 0px, ${accentColor} 2px, transparent 2px, transparent 4px) 1` }} />

          {/* 传承人像素头像 */}
          <div style={{
            width: avatarSize, height: avatarSize, borderRadius: 0, overflow: 'hidden',
            border: `3px solid ${accentColor}`,
            opacity: travelPhase >= 2 ? 1 : 0.3,
            transform: travelPhase >= 2 ? 'scale(1)' : 'scale(0.5)',
            transition: 'all 0.8s steps(4)',
            imageRendering: 'pixelated',
            boxShadow: `0 0 0 2px ${accentColor}, 0 0 0 4px rgba(0,0,0,0.5)`,
          }}>
            <InheritorAvatar era={travelingInheritor.era} craftColor={craftColor} size={avatarSize} />
          </div>
        </div>

        {/* 文字提示（像素风格） */}
        <div style={{ textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: isMobile ? 18 : 24, fontWeight: 700, color: accentColor, marginBottom: 8, opacity: travelPhase >= 1 ? 1 : 0, transition: 'opacity 0.5s ease', imageRendering: 'pixelated', textShadow: `2px 2px 0 ${accentColor}40, -2px -2px 0 ${accentColor}40` }}>
            {isAncient ? `穿梭至${travelingInheritor.dynasty}` : `前往${travelingInheritor.region}`}
          </div>
          <div style={{ fontSize: isMobile ? 12 : 14, color: '#9ca3af', opacity: travelPhase >= 2 ? 1 : 0, transition: 'opacity 0.5s ease', imageRendering: 'pixelated' }}>
            {travelPhase < 2 ? '时空隧道启动中...' : `正在连接${travelingInheritor.name}...`}
          </div>
        </div>
      </div>
    );
  }

  // ========== 传承人选择页 ==========
  if (!selectedInheritor) {
    const cardMinWidth = isMobile ? 'minmax(260px, 1fr)' : 'minmax(320px, 1fr)';

    return (
      <div style={{ width: '100vw', minHeight: '100vh', backgroundColor: '#050510', fontFamily: "'Zpix','Microsoft YaHei',monospace", color: '#e0e7ff', padding: isMobile ? '24px 12px' : '40px 24px', imageRendering: 'pixelated' }}>
        <button onClick={() => { playSound('click'); navigate('/museum'); }} style={{ position: 'absolute', top: isMobile ? 12 : 20, left: isMobile ? 12 : 20, padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>← 返回博物馆</button>

        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 40 }}>
          <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, marginBottom: 12, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 3, textShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>{craft?.emoji} {craft?.name}</div>
          <div style={{ fontSize: isMobile ? 13 : 14, color: '#6b7280', maxWidth: 500, margin: '0 auto', lineHeight: 1.6, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 1 }}>{craft?.description}</div>
        </div>
        <div style={{ textAlign: 'center', fontSize: isMobile ? 14 : 16, color: '#9ca3af', marginBottom: isMobile ? 16 : 24, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>选择一位传承人开始学习</div>

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, ${cardMinWidth})`, gap: isMobile ? 16 : 24, maxWidth: 750, margin: '0 auto' }}>
          {craft?.inheritors.map((inh) => (
            <div key={inh.id} style={{ position: 'relative', padding: isMobile ? 20 : 28, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.03)', border: '3px solid rgba(255,255,255,0.1)', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)' }} onClick={() => handleSelectInheritor(inh)}>
              {/* 时代标签 */}
              <div style={{ position: 'absolute', top: 16, right: 16, padding: '4px 12px', borderRadius: 0, backgroundColor: inh.era === 'ancient' ? 'rgba(245,158,11,0.15)' : 'rgba(99,102,241,0.15)', color: inh.era === 'ancient' ? '#fbbf24' : '#a5b4fc', fontSize: 12, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2, border: '1px solid rgba(255,255,255,0.1)' }}>
                {inh.era === 'ancient' ? `${inh.dynasty}` : '现代'}
              </div>

              {/* 像素头像 */}
              <div style={{ width: isMobile ? 80 : 100, height: isMobile ? 80 : 100, borderRadius: 0, overflow: 'hidden', margin: '0 auto 16px', border: '3px solid rgba(255,255,255,0.15)', boxShadow: '3px 3px 0 rgba(99,102,241,0.2)' }}>
                <InheritorAvatar era={inh.era} craftColor={craftColor} size={isMobile ? 80 : 100} />
              </div>

              <div style={{ fontSize: isMobile ? 20 : 22, fontWeight: 600, marginBottom: 4, fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: 2 }}>{inh.name}</div>
              <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 12, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>📍 {inh.region} · 从艺{inh.experienceYears}年</div>
              <div style={{ fontSize: 13, color: '#9ca3af', lineHeight: 1.6, marginBottom: 12, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>{inh.description}</div>

              {/* 技能标签 */}
              {inh.skills && (
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
                  {inh.skills.map((skill) => (
                    <span key={skill} style={{ padding: '3px 10px', borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.05)', fontSize: 11, color: '#9ca3af', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', border: '1px solid rgba(255,255,255,0.08)' }}>{skill}</span>
                  ))}
                </div>
              )}

              {/* 查看详情 + 开始按钮 */}
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <div onClick={(e) => { e.stopPropagation(); setShowDetail(inh); }} style={{ padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>📋 详情</div>
                <div style={{ padding: '8px 20px', backgroundColor: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', borderRadius: 0, color: '#a5b4fc', fontSize: 13, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>
                  {inh.era === 'ancient' ? '穿梭时空' : '前往学习'} →
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 详情面板 */}
        {showDetail && (
          <div onClick={() => setShowDetail(null)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: isMobile ? '95%' : 480, width: isMobile ? '95%' : '90%', backgroundColor: '#111127', borderRadius: 0, padding: isMobile ? 20 : 32, border: '3px solid rgba(255,255,255,0.15)', maxHeight: '80vh', overflowY: 'auto', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <div style={{ width: isMobile ? 56 : 72, height: isMobile ? 56 : 72, borderRadius: 0, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
                  <InheritorAvatar era={showDetail.era} craftColor={craftColor} size={isMobile ? 56 : 72} />
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 600, fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: 2 }}>{showDetail.name}</div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>
                    {showDetail.era === 'ancient' ? `${showDetail.dynasty}` : '现代'} · 📍 {showDetail.region} · 从艺{showDetail.experienceYears}年
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.8, marginBottom: 20, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>{showDetail.story}</div>
              {showDetail.skills && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>擅长技能</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {showDetail.skills.map((skill) => (
                      <span key={skill} style={{ padding: '4px 12px', borderRadius: 0, backgroundColor: 'rgba(99,102,241,0.1)', color: '#a5b4fc', fontSize: 12, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', border: '1px solid rgba(99,102,241,0.2)' }}>{skill}</span>
                    ))}
                  </div>
                </div>
              )}
              {showDetail.catchphrases.length > 0 && (
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 8, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>口头禅</div>
                  {showDetail.catchphrases.map((cp) => (
                    <div key={cp} style={{ padding: '8px 12px', marginBottom: 6, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 0, fontSize: 13, color: '#d1d5db', fontFamily: "'Zpix','Microsoft YaHei',monospace", border: '1px solid rgba(255,255,255,0.05)' }}>"{cp}"</div>
                  ))}
                </div>
              )}
              <div onClick={() => setShowDetail(null)} style={{ marginTop: 20, textAlign: 'center', padding: '10px', color: '#6b7280', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>关闭</div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========== 对话页 ==========
  const remaining = getRemainingQuota();

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#0a0a1a', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      {/* 顶部栏 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12, padding: isMobile ? '8px 12px' : '12px 20px', backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '2px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => { playSound('click'); setSelectedInheritor(null); if (abortRef.current) abortRef.current.abort(); }} style={{ padding: '6px 12px', backgroundColor: 'transparent', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 13, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>← 返回</button>
        <div style={{ width: isMobile ? 30 : 36, height: isMobile ? 30 : 36, borderRadius: 0, overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', flexShrink: 0, imageRendering: 'pixelated' }}>
          <InheritorAvatar era={selectedInheritor.era} craftColor={craftColor} size={isMobile ? 30 : 36} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: isMobile ? 14 : 15, fontWeight: 600, color: '#e0e7ff' }}>{selectedInheritor.name}</div>
          {!isMobile && (
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{selectedInheritor.era === 'ancient' ? `${selectedInheritor.dynasty} · ` : ''}{selectedInheritor.region} · {craft?.name}</div>
          )}
        </div>
        {/* 剩余次数 */}
        <div style={{ padding: '4px 10px', borderRadius: 12, backgroundColor: remaining > 3 ? 'rgba(34,197,94,0.15)' : remaining > 0 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)', color: remaining > 3 ? '#4ade80' : remaining > 0 ? '#fbbf24' : '#f87171', fontSize: isMobile ? 10 : 12 }}>
          {isMobile ? `${remaining}次` : `今日剩余 ${remaining} 次`}
        </div>
        {/* 设置按钮 */}
        <button onClick={() => { playSound('click'); navigate('/settings'); }} style={{ padding: '6px 10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 14, cursor: 'pointer', imageRendering: 'pixelated' }}>⚙️</button>
      </div>

      {/* 消息列表 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 0' : '20px 0' }}>
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16, padding: '0 12px' }}>
            {msg.role === 'assistant' && (
              <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 0, overflow: 'hidden', marginRight: 8, flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }}>
                <InheritorAvatar era={selectedInheritor.era} craftColor={craftColor} size={isMobile ? 28 : 32} />
              </div>
            )}
            <div style={{ maxWidth: isMobile ? '85%' : '75%' }}>
              <div style={{
                padding: isMobile ? '10px 14px' : '12px 16px',
                borderRadius: 16,
                fontSize: isMobile ? 14 : 15,
                lineHeight: 1.6,
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap',
                backgroundColor: msg.role === 'user' ? '#6366f1' : 'rgba(255,255,255,0.08)',
                color: msg.role === 'user' ? '#fff' : '#e0e7ff',
                position: 'relative',
              }}>
                {msg.content.split('\n').map((line, i) => <div key={i} style={{ minHeight: line ? 22 : 8 }}>{line}</div>)}
                {/* 打字光标 */}
                {msg.isTyping && (
                  <span style={{ display: 'inline-block', width: 2, height: 16, backgroundColor: '#6366f1', marginLeft: 2, animation: 'blink 0.8s infinite', verticalAlign: 'text-bottom' }} />
                )}
              </div>
              {/* 知识点标签 */}
              {msg.knowledgePointIds && msg.knowledgePointIds.length > 0 && !msg.isTyping && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6, justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  {msg.knowledgePointIds.map((kpId) => {
                    const kp = craft?.knowledgePoints.find((k) => k.id === kpId);
                    if (!kp) return null;
                    return (
                      <span key={kpId} style={{
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: 'rgba(99,102,241,0.12)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#a5b4fc',
                        fontSize: 11,
                      }}>
                        📖 {kp.title}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div style={{ display: 'flex', padding: '0 12px', marginBottom: 16 }}>
            <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 0, overflow: 'hidden', marginRight: 8, flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }}>
              <InheritorAvatar era={selectedInheritor.era} craftColor={craftColor} size={isMobile ? 28 : 32} />
            </div>
            <div style={{ padding: '12px 20px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16 }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b7280', margin: '0 2px', animation: 'blink 1s infinite' }}>●</span>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b7280', margin: '0 2px', animation: 'blink 1s infinite 0.2s' }}>●</span>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#6b7280', margin: '0 2px', animation: 'blink 1s infinite 0.4s' }}>●</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 推荐问题 */}
      {messages.length <= 1 && !isLoading && suggestedQuestions.length > 0 && (
        <div style={{ padding: isMobile ? '6px 12px' : '8px 16px', display: 'flex', gap: isMobile ? 6 : 8, flexWrap: 'wrap', borderTop: '2px solid rgba(255,255,255,0.04)' }}>
          <span style={{ fontSize: 12, color: '#6b7280', lineHeight: '30px', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>推荐问题：</span>
          {suggestedQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              style={{
                padding: isMobile ? '5px 10px' : '6px 14px',
                backgroundColor: 'rgba(99,102,241,0.1)',
                border: '2px solid rgba(99,102,241,0.25)',
                borderRadius: 0,
                color: '#a5b4fc',
                fontSize: isMobile ? 11 : 12,
                cursor: 'pointer',
                fontFamily: "'Zpix','Microsoft YaHei',monospace",
                imageRendering: 'pixelated',
                letterSpacing: 1,
              }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* 输入区域 */}
      <div style={{ display: 'flex', gap: isMobile ? 6 : 8, padding: isMobile ? '8px 12px' : '12px 16px', backgroundColor: 'rgba(255,255,255,0.03)', borderTop: '2px solid rgba(255,255,255,0.06)' }}>
        <input
          style={{ flex: 1, padding: isMobile ? '8px 12px' : '10px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#e0e7ff', fontSize: isMobile ? 14 : 15, outline: 'none', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder={`问${selectedInheritor.name}关于${craft?.name}的问题...`}
          disabled={isLoading}
        />
        <button
          style={{ padding: isMobile ? '8px 16px' : '10px 24px', backgroundColor: '#6366f1', color: '#fff', border: '3px solid #818cf8', borderRadius: 0, fontSize: isMobile ? 14 : 15, fontWeight: 500, cursor: 'pointer', opacity: isLoading || !input.trim() ? 0.4 : 1, fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 3, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}
          onClick={() => handleSend()}
          disabled={isLoading || !input.trim()}
        >
          发送
        </button>
      </div>

      {/* API Key 未配置弹窗 */}
      {showApiModal && (
        <div onClick={() => setShowApiModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, width: isMobile ? '92%' : '90%', backgroundColor: '#111127', borderRadius: 0, padding: isMobile ? 24 : 32, border: '3px solid rgba(255,255,255,0.15)', textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 16, imageRendering: 'pixelated' }}>🔑</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#e0e7ff', fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: 2 }}>需要配置 API Key</div>
            <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 24, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>
              请先前往设置页面配置智谱 GLM API Key，才能开始对话。
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => setShowApiModal(false)} style={{ padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>
                稍后再说
              </button>
              <button onClick={() => { setShowApiModal(false); navigate('/settings'); }} style={{ padding: '10px 24px', backgroundColor: '#6366f1', border: '3px solid #818cf8', borderRadius: 0, color: '#fff', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
                前往设置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 配额用完弹窗 */}
      {showQuotaModal && (
        <div onClick={() => setShowQuotaModal(false)} style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400, width: isMobile ? '92%' : '90%', backgroundColor: '#111127', borderRadius: 0, padding: isMobile ? 24 : 32, border: '3px solid rgba(255,255,255,0.15)', textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', boxShadow: '6px 6px 0 rgba(0,0,0,0.3)' }}>
            <div style={{ fontSize: 40, marginBottom: 16, imageRendering: 'pixelated' }}>⏰</div>
            <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: '#e0e7ff', fontFamily: "'Zpix','Microsoft YaHei',monospace", letterSpacing: 2 }}>今日免费次数已用完</div>
            <div style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.6, marginBottom: 24, fontFamily: "'Zpix','Microsoft YaHei',monospace" }}>
              每天免费 10 次问答，请明天再来继续学习！
              <br />
              你可以前往学习进度页面回顾已学知识。
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => { setShowQuotaModal(false); navigate('/learning'); }} style={{ padding: '10px 24px', backgroundColor: 'rgba(99,102,241,0.15)', border: '2px solid rgba(99,102,241,0.3)', borderRadius: 0, color: '#a5b4fc', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>
                查看学习进度
              </button>
              <button onClick={() => setShowQuotaModal(false)} style={{ padding: '10px 24px', backgroundColor: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af', fontSize: 14, cursor: 'pointer', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 2 }}>
                知道了
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
