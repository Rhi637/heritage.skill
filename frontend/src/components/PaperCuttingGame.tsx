import { useState, useRef, useCallback, useEffect } from 'react';

interface PaperCuttingGameProps {
  onComplete?: (score: number) => void;
}

const GRID = 24; // 24x24 像素纸
const CELL = 10; // 每格10px

export default function PaperCuttingGame({ onComplete }: PaperCuttingGameProps) {
  const [foldMode, setFoldMode] = useState<'none' | 'half' | 'quarter'>('quarter');
  const [cutCells, setCutCells] = useState<Set<string>>(new Set());
  const [isDrawing, setIsDrawing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [hint, setHint] = useState('在折叠的纸上点击拖拽"剪"出图案，然后展开查看！');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 生成展开后的对称图案
  const getUnfoldedCells = useCallback(() => {
    const result = new Set<string>();
    for (const key of cutCells) {
      const [sx, sy] = key.split(',').map(Number);
      if (foldMode === 'half') {
        result.add(`${sx},${sy}`);
        result.add(`${GRID - 1 - sx},${sy}`);
      } else if (foldMode === 'quarter') {
        result.add(`${sx},${sy}`);
        result.add(`${GRID - 1 - sx},${sy}`);
        result.add(`${sx},${GRID - 1 - sy}`);
        result.add(`${GRID - 1 - sx},${GRID - 1 - sy}`);
      } else {
        result.add(`${sx},${sy}`);
      }
    }
    return result;
  }, [cutCells, foldMode]);

  // 绘制
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const size = GRID * CELL;
    canvas.width = size;
    canvas.height = size;

    // 背景
    ctx.fillStyle = showResult ? '#fef3c7' : '#fef3c7';
    ctx.fillRect(0, 0, size, size);

    // 纸
    ctx.fillStyle = '#dc2626';
    const cells = showResult ? getUnfoldedCells() : cutCells;
    const isFolded = !showResult && foldMode !== 'none';

    for (let ix = 0; ix < GRID; ix++) {
      for (let iy = 0; iy < GRID; iy++) {
        let activeX = ix, activeY = iy;
        if (isFolded) {
          if (foldMode === 'half' && ix > GRID / 2) continue;
          if (foldMode === 'quarter' && (ix > GRID / 2 || iy > GRID / 2)) continue;
        }
        const key = `${activeX},${activeY}`;
        const isCut = cells.has(key);
        if (!isCut) {
          ctx.fillRect(ix * CELL, iy * CELL, CELL - 1, CELL - 1);
        }
      }
    }

    // 折叠线
    if (!showResult) {
      ctx.strokeStyle = '#991b1b55';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      if (foldMode === 'half' || foldMode === 'quarter') {
        ctx.beginPath();
        ctx.moveTo(size / 2, 0);
        ctx.lineTo(size / 2, size);
        ctx.stroke();
      }
      if (foldMode === 'quarter') {
        ctx.beginPath();
        ctx.moveTo(0, size / 2);
        ctx.lineTo(size, size / 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }

    // 边框
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, size, size);
  }, [cutCells, foldMode, showResult, getUnfoldedCells]);

  const handleCanvasAction = useCallback((e: React.MouseEvent | React.TouchEvent, isDown: boolean) => {
    if (showResult) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    const x = Math.floor((clientX - rect.left) / (rect.width / GRID));
    const y = Math.floor((clientY - rect.top) / (rect.height / GRID));

    if (!isDown || x < 0 || y < 0 || x >= GRID || y >= GRID) return;

    // 折叠模式下限制剪切范围
    let cx = x, cy = y;
    if (foldMode === 'half' && x > GRID / 2) return;
    if (foldMode === 'quarter' && (x > GRID / 2 || y > GRID / 2)) return;

    setCutCells((prev) => {
      const next = new Set(prev);
      const key = `${cx},${cy}`;
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, [foldMode, showResult]);

  const handleUnfold = () => {
    const unfolded = getUnfoldedCells();
    const cutCount = unfolded.size;
    const maxScore = (GRID * GRID) / 3;
    const s = Math.min(100, Math.round((cutCount / maxScore) * 100));
    setScore(s);
    setShowResult(true);
    setHint(s > 50 ? '太棒了！精美的剪纸作品！' : s > 20 ? '不错！再试试剪更多图案？' : '多用剪刀试试，剪出更丰富的镂空图案！');
    if (onComplete && s >= 20) onComplete(s);
  };

  const handleReset = () => {
    setCutCells(new Set());
    setShowResult(false);
    setHint('在折叠的纸上点击拖拽"剪"出图案，然后展开查看！');
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      <div style={{ fontSize: 13, color: '#e0e7ff', marginBottom: 8, letterSpacing: 2 }}>
        ✂️ 剪纸模拟
      </div>

      {/* 折叠模式选择 */}
      {!showResult && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
          {(['quarter', 'half', 'none'] as const).map((mode) => (
            <button key={mode} onClick={() => { setFoldMode(mode); setCutCells(new Set()); }}
              style={{
                padding: '3px 10px', borderRadius: 0, fontSize: 10, cursor: 'pointer',
                fontFamily: 'inherit', imageRendering: 'pixelated', letterSpacing: 1,
                backgroundColor: foldMode === mode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
                border: foldMode === mode ? '2px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
                color: foldMode === mode ? '#a5b4fc' : '#9ca3af',
              }}>
              {mode === 'quarter' ? '四折' : mode === 'half' ? '对折' : '不折'}
            </button>
          ))}
        </div>
      )}

      {/* 画布 */}
      <canvas
        ref={canvasRef}
        style={{ border: '3px solid rgba(239,68,68,0.4)', borderRadius: 0, cursor: showResult ? 'default' : 'crosshair', imageRendering: 'pixelated', maxWidth: 260 }}
        onMouseDown={(e) => { setIsDrawing(true); handleCanvasAction(e, true); }}
        onMouseMove={(e) => { if (isDrawing) handleCanvasAction(e, true); }}
        onMouseUp={() => setIsDrawing(false)}
        onMouseLeave={() => setIsDrawing(false)}
        onTouchStart={(e) => { setIsDrawing(true); handleCanvasAction(e, true); }}
        onTouchMove={(e) => { if (isDrawing) handleCanvasAction(e, true); }}
        onTouchEnd={() => setIsDrawing(false)}
      />

      {/* 提示 */}
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 8, lineHeight: 1.5, maxWidth: 260, margin: '8px auto 0' }}>
        {hint}
      </div>

      {/* 分数 */}
      {showResult && (
        <div style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', marginTop: 8, letterSpacing: 2 }}>
          得分: {score}/100
        </div>
      )}

      {/* 按钮 */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10 }}>
        {!showResult ? (
          <button onClick={handleUnfold}
            style={{
              padding: '6px 20px', backgroundColor: '#dc2626', color: '#fff', border: '2px solid #ef4444',
              borderRadius: 0, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              imageRendering: 'pixelated', letterSpacing: 2, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
            }}>
            展开剪纸 ✨
          </button>
        ) : (
          <button onClick={handleReset}
            style={{
              padding: '6px 20px', backgroundColor: 'rgba(255,255,255,0.05)', color: '#9ca3af',
              border: '2px solid rgba(255,255,255,0.1)', borderRadius: 0, fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit', imageRendering: 'pixelated', letterSpacing: 2,
            }}>
            再来一次 🔄
          </button>
        )}
      </div>
    </div>
  );
}
