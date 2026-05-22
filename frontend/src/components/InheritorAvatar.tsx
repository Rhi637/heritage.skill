import { useMemo } from 'react';

interface InheritorAvatarProps {
  era: 'ancient' | 'modern';
  craftColor: string;
  size?: number;
}

// 像素头像：用 Canvas 绘制 16x16 像素风格头像
export default function InheritorAvatar({ era, craftColor, size = 64 }: InheritorAvatarProps) {
  const dataUrl = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d')!;

    // 背景
    ctx.fillStyle = era === 'ancient' ? '#1a0f00' : '#0a0a2e';
    ctx.fillRect(0, 0, 16, 16);

    // 肤色
    const skin = '#f5d0a9';
    // 头发色
    const hair = '#1a1a1a';
    // 服饰色 (用 craftColor)
    const cloth = craftColor;
    const clothDark = darken(craftColor, 0.3);
    // 眼睛
    const eye = '#111';
    // 脸颊
    const cheek = '#f5a0a0';

    // === 通用像素脸模板 ===
    // 头发 (顶行)
    for (let x = 3; x <= 12; x++) { set(x, 0, hair); set(x, 1, hair); set(x, 2, hair); }
    set(2, 1, hair); set(13, 1, hair);
    set(1, 2, hair); set(14, 2, hair);

    // 脸
    for (let y = 3; y <= 10; y++) for (let x = 3; x <= 12; x++) set(x, y, skin);
    for (let y = 4; y <= 9; y++) { set(2, y, skin); set(13, y, skin); }

    // 古代：加胡子/皱纹标记
    if (era === 'ancient') {
      set(6, 11, hair); set(7, 11, hair); set(8, 11, hair); set(9, 11, hair);
      set(5, 10, hair); set(10, 10, hair);
    }

    // 眼睛
    set(5, 6, eye); set(6, 6, eye);
    set(9, 6, eye); set(10, 6, eye);
    set(5, 7, eye); set(6, 7, eye);
    set(9, 7, eye); set(10, 7, eye);

    // 眉毛
    if (era === 'ancient') {
      set(4, 4, hair); set(5, 4, hair); set(6, 4, hair);
      set(9, 4, hair); set(10, 4, hair); set(11, 4, hair);
    }

    // 脸颊 (腮红)
    set(3, 8, cheek); set(4, 8, cheek);
    set(11, 8, cheek); set(12, 8, cheek);
    set(3, 9, cheek); set(11, 9, cheek);

    // 嘴
    set(7, 9, eye); set(8, 9, eye);

    // 衣服领口
    for (let x = 4; x <= 11; x++) { set(x, 12, cloth); set(x, 13, cloth); set(x, 14, cloth); set(x, 15, cloth); }
    set(3, 12, clothDark); set(12, 12, clothDark);
    set(3, 13, clothDark); set(12, 13, clothDark);

    // 领口装饰
    set(7, 12, clothDark); set(8, 12, clothDark);

    // 古代：圆领袍
    if (era === 'ancient') {
      set(6, 11, cloth); set(9, 11, cloth);
      set(7, 11, skin); set(8, 11, skin); // 露出脖子
      for (let x = 5; x <= 10; x++) set(x, 12, clothDark);
    }

    // 缩放渲染
    const outCanvas = document.createElement('canvas');
    outCanvas.width = size;
    outCanvas.height = size;
    const oCtx = outCanvas.getContext('2d')!;
    oCtx.imageSmoothingEnabled = false;
    oCtx.drawImage(canvas, 0, 0, 16, 16, 0, 0, size, size);

    return outCanvas.toDataURL();

    function set(x: number, y: number, color: string) {
      ctx.fillStyle = color;
      ctx.fillRect(x, y, 1, 1);
    }
  }, [era, craftColor, size]);

  function darken(hex: string, amount: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, ((n >> 16) & 0xff) * (1 - amount));
    const g = Math.max(0, ((n >> 8) & 0xff) * (1 - amount));
    const b = Math.max(0, (n & 0xff) * (1 - amount));
    return `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
  }

  return (
    <img
      src={dataUrl}
      alt=""
      style={{ width: size, height: size, imageRendering: 'pixelated', display: 'block' }}
    />
  );
}
