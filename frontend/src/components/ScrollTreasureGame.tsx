import { useState, useRef, useEffect, useCallback } from 'react';

interface Collectible {
  id: number;
  emoji: string;
  name: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  wobble: number;
}

const HERITAGE_ITEMS = [
  { emoji: '🎭', name: '皮影戏' },
  { emoji: '✂️', name: '剪纸' },
  { emoji: '🪡', name: '苏绣' },
  { emoji: '🏺', name: '泥塑' },
  { emoji: '🔵', name: '青花瓷' },
  { emoji: '🧧', name: '木版年画' },
];

const GAME_WIDTH = 340;
const GAME_HEIGHT = 280;

export default function ScrollTreasureGame({ onComplete }: { onComplete?: (score: number) => void }) {
  const [started, setStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [, setLives] = useState(5);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [highScore, setHighScore] = useState(() => parseInt(localStorage.getItem('scroll_treasure_high') || '0'));
  const [, setLevel] = useState(1);

  const itemsRef = useRef<Collectible[]>([]);
  const nextIdRef = useRef(0);
  const frameRef = useRef(0);
  const spawnTimerRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>(0);
  const startedRef = useRef(false);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const livesRef = useRef(5);
  const collectedRef = useRef<Set<string>>(new Set());
  const levelRef = useRef(1);

  // 画像素卷轴背景
  const drawBackground = useCallback((ctx: CanvasRenderingContext2D) => {
    // 卷轴底色
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // 卷轴纹理线
    ctx.strokeStyle = '#d4c5a0';
    ctx.lineWidth = 1;
    for (let y = 20; y < GAME_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(GAME_WIDTH - 20, y);
      ctx.stroke();
    }

    // 上边框
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(0, 0, GAME_WIDTH, 6);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, 0, GAME_WIDTH, 2);

    // 下边框
    ctx.fillStyle = '#c9a84c';
    ctx.fillRect(0, GAME_HEIGHT - 6, GAME_WIDTH, 6);
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(0, GAME_HEIGHT - 2, GAME_WIDTH, 2);

    // 左卷轴
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(8, 0, 8, GAME_HEIGHT);
    ctx.fillStyle = '#a0622e';
    ctx.fillRect(10, 0, 4, GAME_HEIGHT);

    // 右卷轴
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(GAME_WIDTH - 16, 0, 8, GAME_HEIGHT);
    ctx.fillStyle = '#a0622e';
    ctx.fillRect(GAME_WIDTH - 14, 0, 4, GAME_HEIGHT);

    // 装饰云纹
    ctx.fillStyle = '#d4c5a0';
    for (let x = 40; x < GAME_WIDTH - 40; x += 80) {
      ctx.fillRect(x, 10, 12, 4);
      ctx.fillRect(x + 4, 8, 4, 4);
      ctx.fillRect(x, GAME_HEIGHT - 14, 12, 4);
      ctx.fillRect(x + 4, GAME_HEIGHT - 12, 4, 4);
    }
  }, []);

  // 主游戏循环
  const gameLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const s = startedRef.current;
    const go = gameOverRef.current;

    frameRef.current++;

    // 生成新物品
    spawnTimerRef.current--;
    if (s && !go && spawnTimerRef.current <= 0) {
      const item = HERITAGE_ITEMS[Math.floor(Math.random() * HERITAGE_ITEMS.length)];
      const baseSpeed = 0.6 + levelRef.current * 0.2;
      itemsRef.current.push({
        id: nextIdRef.current++,
        emoji: item.emoji,
        name: item.name,
        x: GAME_WIDTH + 20,
        y: 40 + Math.random() * (GAME_HEIGHT - 120),
        speed: baseSpeed + Math.random() * 1.2,
        size: 24 + Math.floor(Math.random() * 12),
        rotation: 0,
        rotSpeed: (Math.random() - 0.5) * 0.05,
        wobble: Math.random() * Math.PI * 2,
      });
      spawnTimerRef.current = Math.max(15, 55 - levelRef.current * 5);
    }

    // 更新物品位置
    const newItems: Collectible[] = [];
    let missedCount = 0;
    for (const item of itemsRef.current) {
      item.x -= item.speed;
      item.rotation += item.rotSpeed;
      item.wobble += 0.03;
      const wobbleY = Math.sin(item.wobble) * 8;

      if (item.x < -40) {
        missedCount++;
      } else {
        newItems.push({ ...item, y: item.y + wobbleY });
      }
    }
    itemsRef.current = newItems;

    // 丢失减少生命
    if (missedCount > 0 && s && !go) {
      livesRef.current = Math.max(0, livesRef.current - missedCount);
      setLives(livesRef.current);
      comboRef.current = 0;
      setCombo(0);
      if (livesRef.current <= 0) {
        gameOverRef.current = true;
        setGameOver(true);
        const finalScore = scoreRef.current;
        if (finalScore > parseInt(localStorage.getItem('scroll_treasure_high') || '0')) {
          localStorage.setItem('scroll_treasure_high', String(finalScore));
          setHighScore(finalScore);
        }
        if (onComplete && finalScore >= 100) onComplete(finalScore);
      }
    }

    // 升级
    const newLevel = Math.floor(scoreRef.current / 250) + 1;
    if (newLevel !== levelRef.current) {
      levelRef.current = newLevel;
      setLevel(newLevel);
    }

    // 绘制
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    drawBackground(ctx);

    // 绘制物品
    for (const item of itemsRef.current) {
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      ctx.font = `${item.size}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.emoji, 0, 0);
      ctx.restore();

      // 像素高光
      if (item.size > 32) {
        ctx.fillStyle = 'rgba(255,255,255,0.15)';
        ctx.fillRect(item.x - item.size / 2, item.y - item.size / 2, item.size, 2);
      }
    }

    // HUD
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, GAME_WIDTH, 22);
    ctx.font = "bold 10px monospace";
    ctx.textAlign = 'left';
    ctx.fillStyle = '#f5e6c8';
    ctx.fillText(`🏆${scoreRef.current}`, 16, 15);
    ctx.fillText(`⚡Lv${levelRef.current}`, 100, 15);
    // 生命
    ctx.fillText('❤'.repeat(livesRef.current), 200, 15);
    // Combo
    if (comboRef.current > 1) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillText(`x${comboRef.current}!`, 270, 15);
    }
    // 收集进度
    ctx.fillStyle = '#22c55e';
    ctx.fillText(`${collectedRef.current.size}/${HERITAGE_ITEMS.length}`, 310, 15);

    if (go) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, GAME_HEIGHT / 2 - 30, GAME_WIDTH, 60);
      ctx.fillStyle = '#f87171';
      ctx.font = "bold 16px monospace";
      ctx.textAlign = 'center';
      ctx.fillText('收集结束！', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [drawBackground, onComplete]);

  // Canvas 点击检测
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!startedRef.current || gameOverRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;
    const cx = mx * scaleX;
    const cy = my * scaleY;

    let hit = false;
    const remaining: Collectible[] = [];
    for (const item of itemsRef.current) {
      const half = item.size / 2 + 8;
      if (!hit && cx > item.x - half && cx < item.x + half && cy > item.y - half && cy < item.y + half) {
        hit = true;
        scoreRef.current += 10 + comboRef.current * 5;
        setScore(scoreRef.current);
        comboRef.current++;
        setCombo(comboRef.current);
        const newCollected = new Set(collectedRef.current);
        newCollected.add(item.name);
        collectedRef.current = newCollected;
        setCollected(new Set(newCollected));
      } else {
        remaining.push(item);
      }
    }
    itemsRef.current = remaining;

    if (!hit) {
      comboRef.current = 0;
      setCombo(0);
    }
  }, []);

  // 启动
  const startGame = () => {
    itemsRef.current = [];
    nextIdRef.current = 0;
    frameRef.current = 0;
    spawnTimerRef.current = 10;
    scoreRef.current = 0;
    comboRef.current = 0;
    livesRef.current = 5;
    collectedRef.current = new Set();
    levelRef.current = 1;
    gameOverRef.current = false;
    startedRef.current = true;
    setScore(0);
    setCombo(0);
    setLives(5);
    setCollected(new Set());
    setLevel(1);
    setGameOver(false);
    setStarted(true);
    if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  };

  // 清理
  useEffect(() => {
    return () => { if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current); };
  }, []);

  return (
    <div style={{ textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      <div style={{ fontSize: 13, color: '#f59e0b', marginBottom: 6, letterSpacing: 2 }}>
        📜 卷轴寻宝
      </div>
      <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 8 }}>
        点击收集飘过的非遗宝物！集齐所有6种解锁成就
      </div>

      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        onClick={handleCanvasClick}
        style={{
          border: '3px solid rgba(245,158,11,0.4)',
          borderRadius: 0,
          cursor: gameOver ? 'default' : 'crosshair',
          imageRendering: 'pixelated',
          maxWidth: '100%',
        }}
      />

      {!started && !gameOver && (
        <button onClick={startGame} style={{
          marginTop: 10, padding: '8px 28px', backgroundColor: '#f59e0b', color: '#fff',
          border: '3px solid #fbbf24', borderRadius: 0, fontSize: 14, cursor: 'pointer',
          fontFamily: 'inherit', imageRendering: 'pixelated', letterSpacing: 3,
          boxShadow: '4px 4px 0 rgba(0,0,0,0.3)',
        }}>
          ▶ 开始寻宝
        </button>
      )}

      {gameOver && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', letterSpacing: 2 }}>
            得分: {score} | 最高: {highScore} | 收集: {collected.size}/6种
          </div>
          {collected.size >= 6 && (
            <div style={{ fontSize: 12, color: '#4ade80', letterSpacing: 2, marginTop: 4 }}>
              🏅 全部收集！你是非遗守护者！
            </div>
          )}
          <button onClick={startGame} style={{
            marginTop: 8, padding: '6px 24px', backgroundColor: 'rgba(255,255,255,0.05)',
            border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, color: '#9ca3af',
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: 2,
            imageRendering: 'pixelated',
          }}>
            🔄 再来一局
          </button>
        </div>
      )}

      {started && !gameOver && (
        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 6 }}>
          已收集: {collected.size}/6种 | 连击 x{combo}
        </div>
      )}
    </div>
  );
}
