import { useState, useMemo } from 'react';
import { KnowledgePoint } from '../types';

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  kpId: string;
}

interface CraftQuizProps {
  knowledgePoints: KnowledgePoint[];
  craftName: string;
  craftColor: string;
  onComplete: (score: number, total: number) => void;
}

// 从知识点生成测验题
function generateQuestions(knowledgePoints: KnowledgePoint[]): QuizQuestion[] {
  const pool = [...knowledgePoints].sort(() => Math.random() - 0.5).slice(0, 5);
  return pool.map((kp) => {
    // 简单规则：从 content 中提取关键信息生成题目
    const sentences = kp.content.replace(/[，。；：、！？]/g, '|').split('|').filter((s) => s.length > 6);
    const target = sentences[Math.floor(Math.random() * sentences.length)] || kp.title;

    return {
      question: `关于"${kp.title}"，以下哪个说法是正确的？`,
      options: [
        target.slice(0, Math.min(28, target.length)), // 正确答案（截断）
        generateFakeOption(kp),
        generateFakeOption(kp),
      ].sort(() => Math.random() - 0.5),
      correct: -1, // 稍后填充
      kpId: kp.id,
    };
  }).map((q) => ({
    ...q,
    correct: q.options.indexOf(q.options.find((o) => q.options.filter((x) => x === o).length === 1 && o === q.options.filter((_, i) => {
      const originalCorrect = q.options.filter((oo, ii) => {
        // 找到原始正确选项的索引
        return true;
      });
      return true;
    })[0]) || 0),
    correct: q.options.findIndex((o, i) => i === 0), // 正确答案在排序后变了，需要重新找
  }));
}

// 简化版：用固定模板生成
function generateFakeOption(kp: KnowledgePoint): string {
  const fakes = [
    `${kp.category}最早起源于宋代`,
    `${kp.title}只需要一种工具`,
    `${kp.category}在现代已经完全失传`,
    `${kp.title}不涉及手工技艺`,
    `学习${kp.title}只需一天即可掌握`,
    `${kp.category}只在南方地区流传`,
    `${kp.title}使用机器批量生产`,
    `${kp.category}是近代才出现的技艺`,
  ];
  return fakes[Math.floor(Math.random() * fakes.length)];
}

export default function CraftQuiz({ knowledgePoints, craftName, craftColor, onComplete }: CraftQuizProps) {
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const questions = useMemo(() => {
    if (knowledgePoints.length < 2) return [];
    const qs = knowledgePoints.slice(0, Math.min(5, knowledgePoints.length)).map((kp) => {
      const fake1 = generateFakeOption(kp);
      const fake2 = generateFakeOption(kp);
      const correctText = kp.content.slice(0, Math.min(40, kp.content.length));
      const opts = [correctText, fake1, fake2].sort(() => Math.random() - 0.5);
      return {
        question: `关于"${kp.title}"，哪一项是正确的？`,
        options: opts,
        correct: opts.indexOf(correctText),
        kpId: kp.id,
      };
    });
    return qs;
  }, [knowledgePoints]);

  if (!started) {
    return (
      <div style={{ textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', padding: '16px 0' }}>
        <div style={{ fontSize: 14, color: '#e0e7ff', marginBottom: 4, letterSpacing: 2 }}>📝 知识闯关测验</div>
        <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 12 }}>
          共 {questions.length} 题 · 检验你的{craftName}学习成果
        </div>
        <button onClick={() => setStarted(true)} style={{
          padding: '8px 24px', backgroundColor: craftColor, color: '#fff', border: '2px solid rgba(255,255,255,0.2)',
          borderRadius: 0, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', imageRendering: 'pixelated',
          letterSpacing: 3, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
        }}>
          开始闯关 →
        </button>
      </div>
    );
  }

  if (showResult) {
    const correctCount = answers.filter((a, i) => a === questions[i].correct).length;
    const percent = Math.round((correctCount / questions.length) * 100);
    const passed = percent >= 60;

    return (
      <div style={{ textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', padding: '16px 0' }}>
        <div style={{ fontSize: 32, marginBottom: 8, imageRendering: 'pixelated' }}>
          {passed ? '🏆' : '💪'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: passed ? '#f59e0b' : '#9ca3af', letterSpacing: 2, marginBottom: 4 }}>
          {passed ? '闯关成功！' : '继续加油！'}
        </div>
        <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
          答对 {correctCount}/{questions.length} 题 ({percent}%)
        </div>
        {passed && (
          <div style={{
            display: 'inline-block', padding: '4px 16px', border: `2px solid ${craftColor}`,
            backgroundColor: `${craftColor}20`, color: craftColor, fontSize: 12, letterSpacing: 2,
            marginBottom: 12, imageRendering: 'pixelated',
          }}>
            🏅 获得{craftName}大师印章
          </div>
        )}
        <br />
        <button onClick={() => onComplete(correctCount, questions.length)} style={{
          padding: '6px 20px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 12,
          cursor: 'pointer', fontFamily: 'inherit', imageRendering: 'pixelated', letterSpacing: 2,
        }}>
          完成
        </button>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div style={{ padding: '12px 0', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: craftColor, letterSpacing: 2 }}>第 {currentQ + 1}/{questions.length} 题</span>
        <span style={{ fontSize: 11, color: '#6b7280' }}>{craftName}测验</span>
      </div>
      <div style={{ fontSize: 13, color: '#e0e7ff', marginBottom: 12, lineHeight: 1.6, letterSpacing: 1 }}>
        {q.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {q.options.map((opt, i) => (
          <button key={i} onClick={() => setSelected(i)} style={{
            padding: '8px 12px', textAlign: 'left', fontSize: 12, cursor: 'pointer',
            fontFamily: 'inherit', imageRendering: 'pixelated', borderRadius: 0,
            backgroundColor: selected === i ? `${craftColor}20` : 'rgba(255,255,255,0.03)',
            border: selected === i ? `2px solid ${craftColor}` : '1px solid rgba(255,255,255,0.1)',
            color: selected === i ? '#e0e7ff' : '#9ca3af',
          }}>
            {String.fromCharCode(65 + i)}. {opt}
          </button>
        ))}
      </div>
      <button disabled={selected === null} onClick={() => {
        if (selected !== null) {
          const newAnswers = [...answers, selected];
          setAnswers(newAnswers);
          setSelected(null);
          if (currentQ + 1 >= questions.length) {
            setShowResult(true);
          } else {
            setCurrentQ(currentQ + 1);
          }
        }
      }} style={{
        marginTop: 12, padding: '6px 20px', backgroundColor: selected !== null ? craftColor : 'rgba(255,255,255,0.05)',
        color: selected !== null ? '#fff' : '#6b7280', border: 'none', borderRadius: 0,
        fontSize: 12, cursor: selected !== null ? 'pointer' : 'default', fontFamily: 'inherit',
        imageRendering: 'pixelated', letterSpacing: 2, boxShadow: selected !== null ? '2px 2px 0 rgba(0,0,0,0.3)' : 'none',
      }}>
        {currentQ + 1 >= questions.length ? '提交答案' : '下一题 →'}
      </button>
    </div>
  );
}
