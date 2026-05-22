import { useMemo } from 'react';

interface CertificateProps {
  userName: string;
  craftName: string;
  craftEmoji: string;
  score: number;
  total: number;
  date: string;
}

export default function Certificate({ userName, craftName, craftEmoji, score, total, date }: CertificateProps) {
  const dataUrl = useMemo(() => {
    const w = 400, h = 280;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    // 羊皮纸背景
    ctx.fillStyle = '#f5e6c8';
    ctx.fillRect(0, 0, w, h);

    // 边框
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 6;
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 2;
    ctx.strokeRect(14, 14, w - 28, h - 28);

    // 标题
    ctx.fillStyle = '#8b4513';
    ctx.font = 'bold 20px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('非遗学习证书', w / 2, 55);
    ctx.fillText('ICH Learning Certificate', w / 2, 78);

    // 分隔线
    ctx.strokeStyle = '#c9a84c';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 88);
    ctx.lineTo(w - 60, 88);
    ctx.stroke();

    // 内容
    ctx.fillStyle = '#5c3317';
    ctx.font = '14px monospace';
    ctx.fillText(`兹证明探索者 "${userName}"`, w / 2, 115);
    ctx.fillText(`在非遗文化博物馆中`, w / 2, 138);
    ctx.fillText(`完成了 "${craftName}" ${craftEmoji} 的学习`, w / 2, 161);

    // 分数
    ctx.font = 'bold 18px monospace';
    ctx.fillStyle = '#c9a84c';
    ctx.fillText(`掌握知识点: ${score}/${total} (${Math.round(score/total*100)}%)`, w / 2, 195);

    // 日期
    ctx.font = '12px monospace';
    ctx.fillStyle = '#8b4513';
    ctx.fillText(`颁发日期: ${date}`, w / 2, 225);
    ctx.fillText('非遗文化博物馆 · ICH Museum', w / 2, 248);

    // 像素印章
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(w - 80, h - 70, 50, 50);
    ctx.fillStyle = '#f5e6c8';
    ctx.font = '10px monospace';
    ctx.fillText('非遗', w - 55, h - 45);
    ctx.fillText('认证', w - 55, h - 30);

    return canvas.toDataURL('image/png');
  }, [userName, craftName, craftEmoji, score, total, date]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `ICH_Certificate_${craftName}_${date}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div style={{ textAlign: 'center', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated' }}>
      <img src={dataUrl} alt="证书" style={{ maxWidth: '100%', border: '3px solid #c9a84c', borderRadius: 0, imageRendering: 'pixelated' }} />
      <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button onClick={handleDownload} style={{
          padding: '8px 20px', backgroundColor: '#c9a84c', color: '#1a0f00', border: '3px solid #8b4513',
          borderRadius: 0, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
          letterSpacing: 2, imageRendering: 'pixelated', boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
        }}>
          📥 下载证书
        </button>
      </div>
    </div>
  );
}
