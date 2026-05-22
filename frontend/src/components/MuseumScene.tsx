import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Html, Sparkles, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

// ========== 体素方块类型 ==========

type VoxelBlock = { x: number; y: number; z: number; size: number; mat: number };

// ========== 星空背景 ==========

function StarField() {
  return <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

// ========== NPC 导览员 (像素小人) ==========

function NPCGuide({ showBubble }: { showBubble: boolean }) {
  const g = 0.08;
  const bodyRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (bodyRef.current) bodyRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.04;
  });

  const skin = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5d0a9', roughness: 1, metalness: 0 }), []);
  const hair = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 1, metalness: 0 }), []);
  const cloth = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6366f1', roughness: 1, metalness: 0 }), []);
  const shoe = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b2a1a', roughness: 1, metalness: 0 }), []);
  const mats = [skin, hair, cloth, shoe];

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) => b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });
    // 头 (球)
    for (let ix = -2; ix <= 2; ix++) for (let iy = 7; iy <= 11; iy++) for (let iz = -2; iz <= 2; iz++)
      if ((ix/2.2)**2 + ((iy-9)/2.2)**2 + (iz/2.2)**2 <= 1) p(ix, iy, iz, iy >= 10 ? 1 : 0);
    // 眼睛
    p(-1, 9, 3, 1); p(1, 9, 3, 1);
    // 身体
    for (let ix = -2; ix <= 2; ix++) for (let iy = 3; iy <= 6; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 2);
    // 双臂
    for (let ix = -4; ix <= -3; ix++) for (let iy = 4; iy <= 5; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 2);
    for (let ix = 3; ix <= 4; ix++) for (let iy = 4; iy <= 5; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 2);
    // 腿
    for (let ix = -1; ix <= 1; ix+=2) for (let iy = -1; iy <= 2; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 3);
    return b;
  }, []);

  return (
    <group ref={bodyRef} position={[0.5, 0.6, -1.5]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
      {showBubble && (
        <Html position={[0, 1.6, 0]} center distanceFactor={6}>
          <div style={{ padding: '6px 14px', backgroundColor: 'rgba(5,5,16,0.85)', borderRadius: 0, border: '2px solid rgba(99,102,241,0.4)', color: '#a5b4fc', fontSize: 11, whiteSpace: 'nowrap', fontFamily: "'Zpix','Microsoft YaHei',monospace", imageRendering: 'pixelated', letterSpacing: 1, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)' }}>
            👋 欢迎！点击展台探索非遗技艺~
          </div>
        </Html>
      )}
    </group>
  );
}

// ========== 皮影戏 — 扁平半透明剪影 + 三根操纵杆 ==========

function ShadowPuppetFigure() {
  const g = 0.065; // grid size

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#d4a017', roughness: 1, metalness: 0, transparent: true, opacity: 0.72 }), // 0 body amber
    new THREE.MeshStandardMaterial({ color: '#8b5e14', roughness: 1, metalness: 0, transparent: true, opacity: 0.75 }), // 1 dark edge
    new THREE.MeshStandardMaterial({ color: '#c9952e', roughness: 0.5, metalness: 0.3, transparent: true, opacity: 0.8 }), // 2 crown gold
    new THREE.MeshStandardMaterial({ color: '#5c3317', roughness: 1, metalness: 0 }), // 3 rod
    new THREE.MeshStandardMaterial({ color: '#f5e6c8', roughness: 1, metalness: 0, transparent: true, opacity: 0.55 }), // 4 glow
    new THREE.MeshStandardMaterial({ color: '#1a0a00', roughness: 1, metalness: 0 }), // 5 eye/line
    new THREE.MeshStandardMaterial({ color: '#e8b830', roughness: 0.4, metalness: 0.4, transparent: true, opacity: 0.78 }), // 6 highlight
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) =>
      b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    // ---- 裙摆 (大梯形鱼尾裙) ----
    for (let iy = -6; iy <= -1; iy++) {
      const hw = 5 + Math.abs(iy + 3);
      for (let ix = -hw; ix <= hw; ix++)
        for (let iz = -1; iz <= 1; iz++)
          if (Math.abs(ix) + Math.abs(iz) <= hw + 1) p(ix, iy, iz, (ix === -hw || ix === hw || iy === -6) ? 1 : 0);
    }
    // 裙摆波浪下沿
    for (let ix = -6; ix <= 6; ix++) if (Math.abs(ix) % 2 === 0) { p(ix, -7, -1, 1); p(ix, -7, 0, 1); p(ix, -7, 1, 1); }

    // ---- 袍身 ----
    for (let iy = 0; iy <= 5; iy++) {
      const hw = iy <= 2 ? 4 : 5;
      for (let ix = -hw; ix <= hw; ix++)
        for (let iz = -1; iz <= 1; iz++)
          if (Math.abs(ix) + Math.abs(iz) <= hw + 1) p(ix, iy, iz, (ix === -hw || ix === hw) ? 1 : 0);
    }

    // ---- 金腰带 ----
    for (let ix = -4; ix <= 4; ix++) for (let iz = -1; iz <= 1; iz++) p(ix, 2, iz, 6);
    for (let ix = -1; ix <= 1; ix++) for (let iz = -2; iz <= 2; iz++) p(ix, 2, iz, 2);

    // ---- 左袖 (宽大飘逸) ----
    for (let ix = -8; ix <= -5; ix++) for (let iy = 1; iy <= 5; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, ix <= -7 ? 1 : 0);
    for (let iy = 0; iy <= 5; iy++) { p(-9, iy, 0, 1); if (iy % 2 === 0) p(-9, iy, -1, 1); }

    // ---- 右袖 ----
    for (let ix = 5; ix <= 8; ix++) for (let iy = 1; iy <= 5; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, ix >= 7 ? 1 : 0);
    for (let iy = 0; iy <= 5; iy++) { p(9, iy, 0, 1); if (iy % 2 === 0) p(9, iy, 1, 1); }

    // ---- 双手 ----
    for (let ix = -10; ix <= -9; ix++) for (let iy = 2; iy <= 4; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 0);
    for (let ix = 9; ix <= 10; ix++) for (let iy = 2; iy <= 4; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 0);

    // ---- 脖子 ----
    for (let ix = -1; ix <= 1; ix++) for (let iz = -1; iz <= 1; iz++) for (let iy = 5; iy <= 6; iy++) p(ix, iy, iz, 0);

    // ---- 头部 (椭圆脸) ----
    for (let ix = -3; ix <= 3; ix++)
      for (let iy = 5; iy <= 10; iy++)
        for (let iz = -1; iz <= 1; iz++)
          if ((ix / 3.5) ** 2 + ((iy - 7.5) / 3) ** 2 <= 1) p(ix, iy, iz, 0);
    for (let ix = -1; ix <= 1; ix++) for (let iy = 7; iy <= 8; iy++) p(ix, iy, 2, 4);

    // ---- 丹凤眼 ----
    p(-2, 8, 2, 5); p(-1, 8, 2, 5); p(-2, 7, 2, 5);
    p(1, 8, 2, 5); p(2, 8, 2, 5); p(2, 7, 2, 5);
    p(-1, 8, 3, 4); p(1, 8, 3, 4);
    p(0, 5, 2, 6); // 小口

    // ---- 盔头底座 ----
    for (let ix = -4; ix <= 4; ix++) for (let iy = 10; iy <= 11; iy++) for (let iz = -1; iz <= 1; iz++)
      if (Math.abs(ix) + Math.abs(iz) <= 5) p(ix, iy, iz, 2);

    // ---- 凤冠主体 ----
    for (let ix = -3; ix <= 3; ix++) for (let iy = 11; iy <= 13; iy++) for (let iz = -1; iz <= 1; iz++)
      if (Math.abs(ix) + Math.abs(iz) <= 4) p(ix, iy, iz, iy >= 12 && Math.abs(ix) <= 1 ? 6 : 2);

    // ---- 凤冠顶部 ----
    for (let ix = -2; ix <= 2; ix++) for (let iy = 13; iy <= 15; iy++) for (let iz = -1; iz <= 1; iz++)
      if (Math.abs(ix) + Math.abs(iy - 14) <= 3) p(ix, iy, iz, 2);
    for (let ix = -1; ix <= 1; ix++) for (let iz = -1; iz <= 1; iz++) p(ix, 15, iz, 6);
    for (let ix = -2; ix <= 2; ix++) for (let iz = -1; iz <= 1; iz++) p(ix, 16, iz, 2);
    for (let ix = -1; ix <= 1; ix++) for (let iz = -1; iz <= 1; iz++) p(ix, 17, iz, 2);

    // ---- 雉鸡翎:左 (超长弯曲) ----
    for (let iy = 12; iy <= 21; iy++) {
      const o = Math.floor((iy - 11) / 2);
      for (let iz = -1; iz <= 1; iz++) {
        p(-5 - o, iy, iz, 1);
        if (iy >= 15) p(-6 - o, iy, iz, 6);
      }
    }
    for (let iz = -1; iz <= 1; iz++) { p(-10, 21, iz, 2); p(-10, 22, iz, 2); }

    // ---- 雉鸡翎:右 ----
    for (let iy = 12; iy <= 21; iy++) {
      const o = Math.floor((iy - 11) / 2);
      for (let iz = -1; iz <= 1; iz++) {
        p(5 + o, iy, iz, 1);
        if (iy >= 15) p(6 + o, iy, iz, 6);
      }
    }
    for (let iz = -1; iz <= 1; iz++) { p(10, 21, iz, 2); p(10, 22, iz, 2); }

    // ---- 头部操纵杆 (主杆, 从头贯穿到底) ----
    for (let iy = -8; iy <= 18; iy++) { p(0, iy, 3, 3); if (iy >= 0) p(0, iy, 4, 3); }
    for (let iy = -9; iy <= -8; iy++) for (let ix = -1; ix <= 1; ix++) p(ix, iy, 3, 3);

    // ---- 左手操纵杆 ----
    for (let iy = -8; iy <= 3; iy++) p(-10, iy, 3, 3);
    // ---- 右手操纵杆 ----
    for (let iy = -8; iy <= 3; iy++) p(10, iy, 3, 3);

    // ---- 透光斑点 ----
    for (let ix = -2; ix <= 2; ix++) for (let iy = -4; iy <= -2; iy++) if ((ix + iy) % 3 === 0) p(ix, iy, 2, 4);

    return b;
  }, []);

  return (
    <group position={[0, 1.35, 0]}>
      <pointLight position={[0, 9, -3]} color="#f59e0b" intensity={1.5} distance={6} />
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 剪纸 — 纯平面红色镂空公鸡 + 白色衬纸 ==========

function PaperCuttingFigure() {
  const g = 0.06;

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 1, metalness: 0 }), // 0 red
    new THREE.MeshStandardMaterial({ color: '#991b1b', roughness: 1, metalness: 0 }), // 1 dark red
    new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 1, metalness: 0 }), // 2 white backing
    new THREE.MeshStandardMaterial({ color: '#b91c1c', roughness: 1, metalness: 0 }), // 3 accent
    new THREE.MeshStandardMaterial({ color: '#450a0a', roughness: 1, metalness: 0 }), // 4 eye
    new THREE.MeshStandardMaterial({ color: '#7f1d1d', roughness: 1, metalness: 0 }), // 5 border
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) =>
      b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    // ---- 白色衬纸 (剪纸贴在白纸上) ----
    for (let ix = -12; ix <= 12; ix++)
      for (let iy = -10; iy <= 14; iy++)
        if (Math.abs(ix) <= 12 && Math.abs(iy) <= 14) p(ix, iy, -1, 2);
    // 衬纸边框
    for (let ix = -12; ix <= 12; ix++) { p(ix, -11, -1, 5); p(ix, 14, -1, 5); }
    for (let iy = -10; iy <= 14; iy++) { p(-13, iy, -1, 5); p(13, iy, -1, 5); }

    // ---- 公鸡身体 (大椭圆) ----
    for (let ix = -5; ix <= 6; ix++)
      for (let iy = -2; iy <= 7; iy++) {
        const dx = (ix - 0.5) / 5.8;
        const dy = (iy - 2.5) / 5;
        if (dx * dx + dy * dy <= 1.0) {
          // 月牙纹镂空
          if (iy >= 2 && iy <= 5 && Math.abs(ix) >= 2 && Math.abs(ix) <= 4 && (ix + iy) % 3 === 0) continue;
          // 中心镂空
          if (iy >= 0 && iy <= 3 && ix === 0 && iy % 2 === 0) continue;
          p(ix, iy, 0, 0);
        }
      }

    // 身体锯齿边 (暗红)
    for (let iy = -1; iy <= 6; iy++) if (iy % 2 === 0) { p(-6, iy, 0, 1); p(7, iy, 0, 1); }

    // ---- 鸡头 ----
    for (let ix = -5; ix <= -1; ix++)
      for (let iy = 5; iy <= 10; iy++)
        if (((ix + 3) / 3.2) ** 2 + ((iy - 7.5) / 3.2) ** 2 <= 1) p(ix, iy, 0, 0);

    // ---- 鸡冠 (三峰红冠) ----
    for (let iy = 9; iy <= 14; iy++) {
      const hw = iy >= 13 ? 1 : iy >= 11 ? 2 : 3;
      for (let ix = -5 + (13 - iy); ix <= -1; ix++)
        if (Math.abs(ix + 3) <= hw) p(ix, iy, 0, 1);
    }
    p(-3, 14, 0, 1); p(-2, 14, 0, 1); p(-3, 15, 0, 1); // 冠尖

    // ---- 鸡喙 (尖嘴向左) ----
    for (let ix = -9; ix <= -4; ix++) { p(ix, 6, 0, 1); if (ix <= -6) p(ix, 7, 0, 1); }
    p(-9, 5, 0, 1); p(-10, 6, 0, 1);

    // 眼睛 (镂空黑点)
    p(-4, 8, 0, 4);
    // 鸡嗉
    for (let ix = -5; ix <= -3; ix++) p(ix, 4, 0, 0);

    // ---- 尾羽 (弧形大扇) ----
    for (let iy = -2; iy <= 12; iy++) {
      const o = Math.max(0, Math.floor((iy + 1) / 2));
      for (let ix = 5 + o; ix <= 7 + o; ix++) if (ix <= 15) p(ix, iy, 0, 0);
    }
    for (let iy = 2; iy <= 12; iy += 2) { const o = Math.floor(iy / 2); p(8 + o, iy, 0, 1); }
    for (let iy = 10; iy <= 14; iy++) p(14, iy, 0, 1);
    for (let iy = 11; iy <= 15; iy++) p(13, iy, 0, 0);
    p(15, 12, 0, 1); p(15, 13, 0, 1);

    // ---- 翅膀纹 ----
    for (let ix = -3; ix <= 1; ix++) for (let iy = -1; iy <= 4; iy++) if ((ix + iy) % 2 === 0) p(ix, iy, 0, 3);
    for (let iy = 0; iy <= 4; iy++) { p(1, iy, 0, 1); p(2, iy, 0, iy >= 1 && iy <= 3 ? 1 : 0); }

    // ---- 鸡腿 + 爪子 ----
    for (let iy = -5; iy <= -2; iy++) { p(-1, iy, 0, 0); p(2, iy, 0, 0); }
    for (let ix = -2; ix <= 0; ix++) p(ix, -6, 0, 1);
    for (let ix = 1; ix <= 3; ix++) p(ix, -6, 0, 1);
    p(-2, -7, 0, 1); p(3, -7, 0, 1); p(-1, -7, 0, 1); p(2, -7, 0, 1);

    // ---- 剪纸四角云纹 ----
    for (const [cx, cy] of [[-10, 12], [10, 12], [-10, -8], [10, -8]])
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
        if (Math.abs(dx) + Math.abs(dy) <= 1) p(cx + dx, cy + dy, 0, 3);

    return b;
  }, []);

  return (
    <group position={[0, 1.3, 0]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 苏绣 — 绣绷 + 牡丹刺绣 + 针线 ==========

function EmbroideryFigure() {
  const g = 0.055;

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 1, metalness: 0 }), // 0 wood
    new THREE.MeshStandardMaterial({ color: '#fdf2f8', roughness: 1, metalness: 0 }), // 1 fabric
    new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.6, metalness: 0 }), // 2 pink
    new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.5, metalness: 0.1 }), // 3 yellow
    new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7, metalness: 0 }), // 4 green
    new THREE.MeshStandardMaterial({ color: '#c0c0c0', roughness: 0.15, metalness: 0.9 }), // 5 needle
    new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.4, metalness: 0 }), // 6 red thread
    new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.4, metalness: 0 }), // 7 blue thread
    new THREE.MeshStandardMaterial({ color: '#5c3317', roughness: 1, metalness: 0 }), // 8 dark wood
    new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 1, metalness: 0 }), // 9 fabric highlight
    new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.4, metalness: 0.1 }), // 10 gold
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) =>
      b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    const R = 8, Ri = 7;

    // ---- 外环 (木框) ----
    for (let ix = -R; ix <= R; ix++)
      for (let iy = -R; iy <= R; iy++) {
        const d = Math.sqrt(ix * ix + iy * iy);
        if (d >= R - 1.2 && d <= R + 0.5)
          for (let iz = -3; iz <= 3; iz++) p(ix, iy, iz, d >= R - 0.4 ? 8 : 0);
      }

    // ---- 内环 ----
    for (let ix = -Ri; ix <= Ri; ix++)
      for (let iy = -Ri; iy <= Ri; iy++) {
        const d = Math.sqrt(ix * ix + iy * iy);
        if (d >= Ri - 1 && d <= Ri + 0.5)
          for (let iz = -2; iz <= 2; iz++) p(ix, iy, iz, 0);
      }

    // ---- 绣布 ----
    for (let ix = -Ri + 1; ix <= Ri - 1; ix++)
      for (let iy = -Ri + 1; iy <= Ri - 1; iy++)
        if (Math.sqrt(ix * ix + iy * iy) <= Ri - 1.2)
          for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 1);

    // ---- 牡丹花 (大朵中心) ----
    const fcx = 0, fcy = 2;
    // 花心
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) p(fcx + dx, fcy + dy, 2, 3);
    // 5大瓣
    for (let petal = 0; petal < 5; petal++) {
      const a = (petal / 5) * Math.PI * 2 - Math.PI / 2;
      const px = Math.round(Math.cos(a) * 4);
      const py = Math.round(Math.sin(a) * 4);
      for (let dx = -2; dx <= 2; dx++)
        for (let dy = -2; dy <= 2; dy++)
          if (Math.sqrt(dx * dx + dy * dy) <= 2.2)
            p(fcx + px + dx, fcy + py + dy, 2, Math.sqrt(dx * dx + dy * dy) <= 1 ? 3 : 2);
    }
    // 外圈金边
    for (let a = 0; a < 16; a++) {
      const rx = Math.round(Math.cos(a / 16 * Math.PI * 2) * 5.5);
      const ry = Math.round(Math.sin(a / 16 * Math.PI * 2) * 5.5);
      p(fcx + rx, fcy + ry, 2, 10);
    }

    // ---- 小梅花 (左上) ----
    const mcx = -4, mcy = -2;
    for (let dx = -1; dx <= 1; dx++) p(mcx + dx, mcy, 2, 3);
    for (let petal = 0; petal < 5; petal++) {
      const a = (petal / 5) * Math.PI * 2;
      const px = Math.round(Math.cos(a) * 2.2);
      const py = Math.round(Math.sin(a) * 2.2);
      for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
        if (Math.abs(dx) + Math.abs(dy) <= 1) p(mcx + px + dx, mcy + py + dy, 2, 2);
    }

    // ---- 绿叶 ----
    for (let dx = -3; dx <= -1; dx++) for (let dy = -3; dy <= -1; dy++) if (Math.abs(dx + 2) + Math.abs(dy + 2) <= 3) p(fcx + dx, fcy + dy, 2, 4);
    for (let dx = 1; dx <= 3; dx++) for (let dy = -3; dy <= -1; dy++) if (Math.abs(dx - 2) + Math.abs(dy + 2) <= 3) p(fcx + dx, fcy + dy, 2, 4);
    for (let dx = -2; dx <= 2; dx++) for (let dy = -5; dy <= -3; dy++) if (Math.abs(dx) + Math.abs(dy + 4) <= 2) p(fcx + dx, fcy + dy, 2, 4);

    // ---- 绣花针 (斜穿) ----
    for (let t = -2; t <= 10; t++) p(5 + t, -6 + t, 2, 5);
    p(14, 2, 2, 5); p(15, 3, 2, 5); // 针尖

    // ---- 红线 ----
    for (let t = 0; t <= 6; t++) p(13 - t, 3 + t, 3, 6);
    for (let t = 0; t <= 4; t++) p(7 - t, 9 + t, 3, 6);

    // ---- 蓝线 ----
    for (let t = 0; t <= 5; t++) p(13 - t, 2 + t, 4, 7);

    // ---- 支架 ----
    for (let iy = -R - 4; iy <= -R; iy++) for (let iz = -4; iz <= -3; iz++) { p(-2, iy, iz, 0); p(2, iy, iz, 0); }
    for (let ix = -8; ix <= 8; ix++) for (let iy = -R - 5; iy <= -R - 3; iy++) for (let iz = -4; iz <= -3; iz++) p(ix, iy, iz, 8);
    for (let ix = -3; ix <= 3; ix++) for (let iy = -R - 1; iy <= -R; iy++) for (let iz = -4; iz <= -3; iz++) p(ix, iy, iz, 0);

    // ---- 丝线轴 ----
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
      p(-6 + dx, -R - 4 + dy, -3, 6);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
      p(6 + dx, -R - 4 + dy, -3, 7);

    return b;
  }, []);

  return (
    <group position={[0, 1.35, 0]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 泥塑 — 天津泥人张大头娃娃 ==========

function ClayFigurineFigure() {
  const g = 0.065;

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#d2b48c', roughness: 1, metalness: 0 }), // 0 clay base
    new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 1, metalness: 0 }), // 1 black hair
    new THREE.MeshStandardMaterial({ color: '#c24141', roughness: 1, metalness: 0 }), // 2 red dudou
    new THREE.MeshStandardMaterial({ color: '#f5a0a0', roughness: 1, metalness: 0 }), // 3 pink cheek
    new THREE.MeshStandardMaterial({ color: '#111111', roughness: 1, metalness: 0 }), // 4 eye
    new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.6, metalness: 0 }), // 5 yellow
    new THREE.MeshStandardMaterial({ color: '#f5d0a9', roughness: 1, metalness: 0 }), // 6 light skin
    new THREE.MeshStandardMaterial({ color: '#22c55e', roughness: 0.7, metalness: 0 }), // 7 green
    new THREE.MeshStandardMaterial({ color: '#3b2a1a', roughness: 1, metalness: 0 }), // 8 dark wood brow
    new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.7, metalness: 0 }), // 9 blue
    new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.6, metalness: 0 }), // 10 pink
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) =>
      b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    // ---- 大头 (大圆球, 泥人张 "大头" 约40%总高) ----
    const hcy = 3;
    for (let ix = -6; ix <= 6; ix++)
      for (let iy = -4; iy <= 9; iy++)
        for (let iz = -5; iz <= 5; iz++) {
          const dx = ix / 6.3, dy = (iy - hcy) / 5.8, dz = iz / 5.2, dist = dx * dx + dy * dy + dz * dz;
          if (dist <= 1.0) {
            if (iy >= 3 && dist >= 0.5 && iz <= 2) p(ix, iy, iz, 1); // 后脑黑发
            else if (iy >= 7 && dist >= 0.25) p(ix, iy, iz, 1);
            else p(ix, iy, iz, 6);
          }
        }

    // ---- 左发髻 (包子头) ----
    for (let ix = -10; ix <= -5; ix++)
      for (let iy = 5; iy <= 11; iy++)
        for (let iz = -3; iz <= 3; iz++)
          if (((ix + 7.5) / 3.2) ** 2 + ((iy - 8) / 3.2) ** 2 + (iz / 3.2) ** 2 <= 1) p(ix, iy, iz, 1);
    for (let iz = -3; iz <= 3; iz++) { p(-5, 6, iz, 2); p(-5, 7, iz, 2); } // 红绳

    // ---- 右发髻 ----
    for (let ix = 5; ix <= 10; ix++)
      for (let iy = 5; iy <= 11; iy++)
        for (let iz = -3; iz <= 3; iz++)
          if (((ix - 7.5) / 3.2) ** 2 + ((iy - 8) / 3.2) ** 2 + (iz / 3.2) ** 2 <= 1) p(ix, iy, iz, 1);
    for (let iz = -3; iz <= 3; iz++) { p(5, 6, iz, 2); p(5, 7, iz, 2); }

    // ---- 齐刘海 ----
    for (let ix = -4; ix <= 4; ix++) for (let iy = 7; iy <= 9; iy++) for (let iz = -6; iz <= -4; iz++) p(ix, iy, iz, 1);
    for (let ix = -3; ix <= 3; ix++) for (let iz = -6; iz <= -4; iz++) p(ix, 5, iz, 8);

    // ---- 眉眼 ----
    for (let dx = -1; dx <= 0; dx++) p(-2 + dx, 3, 6, 8); // 左眉
    for (let dx = 0; dx <= 1; dx++) p(1 + dx, 3, 6, 8); // 右眉
    p(-2, 2, 6, 4); p(-1, 2, 6, 4); p(1, 2, 6, 4); p(2, 2, 6, 4); // 眼
    p(-1, 2, 6, 6); p(1, 2, 6, 6); // 眼白

    // ---- 大红脸颊 ----
    for (let ix = -4; ix <= -2; ix++)
      for (let iy = 0; iy <= 2; iy++)
        for (let iz = -6; iz <= -4; iz++)
          if ((ix + 3) ** 2 + (iy - 1) ** 2 + (iz + 5) ** 2 <= 4) p(ix, iy, iz, 3);
    for (let ix = 2; ix <= 4; ix++)
      for (let iy = 0; iy <= 2; iy++)
        for (let iz = -6; iz <= -4; iz++)
          if ((ix - 3) ** 2 + (iy - 1) ** 2 + (iz + 5) ** 2 <= 4) p(ix, iy, iz, 3);

    // ---- 小嘴 (红点) ----
    p(0, 0, 6, 10); p(-1, 0, 6, 10); p(1, 0, 6, 10);
    p(0, 1, 6, 6); // 鼻子

    // ---- 圆胖身体 ----
    for (let ix = -4; ix <= 4; ix++)
      for (let iy = -10; iy <= -4; iy++)
        for (let iz = -4; iz <= 4; iz++)
          if ((ix / 4.5) ** 2 + ((iy + 7) / 3.5) ** 2 + (iz / 3.5) ** 2 <= 1) p(ix, iy, iz, 0);

    // ---- 红肚兜 ----
    for (let ix = -3; ix <= 3; ix++)
      for (let iy = -9; iy <= -5; iy++)
        for (let iz = -5; iz <= -2; iz++)
          if (Math.abs(ix) + Math.abs(iy + 7) <= 4.5) p(ix, iy, iz, 2);

    // 肚兜花纹
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++)
      if (Math.abs(dx) + Math.abs(dy) <= 1) p(dx, -7 + dy, -5, 5);
    p(-2, -8, -5, 7); p(2, -8, -5, 7);
    p(-2, -6, -5, 9); p(2, -6, -5, 9);
    p(0, -9, -5, 10); p(0, -5, -5, 10);

    // ---- 短臂 ----
    for (let ix = -7; ix <= -6; ix++) for (let iy = -9; iy <= -6; iy++) for (let iz = -2; iz <= 2; iz++) p(ix, iy, iz, 0);
    for (let ix = -8; ix <= -8; ix++) for (let iy = -8; iy <= -7; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 6);
    for (let iz = -2; iz <= 2; iz++) p(-5, -8, iz, 9);

    for (let ix = 6; ix <= 7; ix++) for (let iy = -9; iy <= -6; iy++) for (let iz = -2; iz <= 2; iz++) p(ix, iy, iz, 0);
    for (let ix = 8; ix <= 8; ix++) for (let iy = -8; iy <= -7; iy++) for (let iz = -1; iz <= 1; iz++) p(ix, iy, iz, 6);
    for (let iz = -2; iz <= 2; iz++) p(5, -8, iz, 9);

    // ---- 短腿 + 小鞋 ----
    for (let ix = -2; ix <= -1; ix++) for (let iy = -14; iy <= -11; iy++) for (let iz = -2; iz <= 2; iz++) p(ix, iy, iz, 0);
    for (let ix = 1; ix <= 2; ix++) for (let iy = -14; iy <= -11; iy++) for (let iz = -2; iz <= 2; iz++) p(ix, iy, iz, 0);

    // 黑布鞋
    for (let ix = -3; ix <= 0; ix++) for (let iy = -16; iy <= -14; iy++) for (let iz = -2; iz <= 3; iz++) p(ix, iy, iz, 1);
    for (let ix = 0; ix <= 3; ix++) for (let iy = -16; iy <= -14; iy++) for (let iz = -2; iz <= 3; iz++) p(ix, iy, iz, 1);
    p(-2, -14, 4, 2); p(2, -14, 4, 2); // 鞋头红点

    // ---- 肩部彩绘点 ----
    for (let iz = -5; iz <= -3; iz++) { p(-3, -5, iz, 5); p(3, -5, iz, 5); }
    for (let iz = -5; iz <= -3; iz++) { p(-4, -6, iz, 7); p(4, -6, iz, 7); }

    return b;
  }, []);

  return (
    <group position={[0, 1.6, 0]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 青花瓷 — 瓷瓶造型 ==========

function PorcelainFigure() {
  const g = 0.06;

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3, metalness: 0.1 }), // 0 white porcelain
    new THREE.MeshStandardMaterial({ color: '#1e40af', roughness: 0.3, metalness: 0.1 }), // 1 cobalt blue
    new THREE.MeshStandardMaterial({ color: '#3b82f6', roughness: 0.3, metalness: 0.2 }), // 2 light blue
    new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.3, metalness: 0.2 }), // 3 dark blue
    new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.4, metalness: 0.3 }), // 4 rim
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) => b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    // 瓶底
    for (let iy = -8; iy <= -6; iy++) {
      const r = 3;
      for (let ix = -r; ix <= r; ix++) for (let iz = -r; iz <= r; iz++)
        if (Math.sqrt(ix * ix + iz * iz) <= r + 0.5) p(ix, iy, iz, 0);
    }

    // 瓶腹 (大肚子)
    for (let iy = -5; iy <= 3; iy++) {
      const r = 4 + Math.sin(((iy + 5) / 8) * Math.PI) * 2;
      for (let ix = -6; ix <= 6; ix++) for (let iz = -6; iz <= 6; iz++) {
        const dist = Math.sqrt(ix * ix + iz * iz);
        if (dist <= r + 0.3 && dist >= 0) {
          if (iy >= -3 && iy <= 1 && Math.abs(dist - r * 0.6) <= 1) {
            // 缠枝莲纹样环
            p(ix, iy, iz, (Math.abs(ix + iz) % 4 === 0) ? 2 : 1);
          } else {
            p(ix, iy, iz, 0);
          }
        }
      }
    }

    // 瓶肩 (收缩)
    for (let iy = 4; iy <= 6; iy++) {
      const r = 6 - (iy - 3) * 1.2;
      for (let ix = -6; ix <= 6; ix++) for (let iz = -6; iz <= 6; iz++)
        if (Math.sqrt(ix * ix + iz * iz) <= r + 0.3) p(ix, iy, iz, 0);
    }

    // 瓶颈
    for (let iy = 7; iy <= 10; iy++) {
      for (let ix = -2; ix <= 2; ix++) for (let iz = -2; iz <= 2; iz++)
        if (Math.sqrt(ix * ix + iz * iz) <= 2.3) p(ix, iy, iz, 0);
    }

    // 瓶口
    for (let iy = 11; iy <= 12; iy++) {
      for (let ix = -3; ix <= 3; ix++) for (let iz = -3; iz <= 3; iz++)
        if (Math.sqrt(ix * ix + iz * iz) <= 3.3) p(ix, iy, iz, 4);
    }
    for (let ix = -3; ix <= 3; ix++) for (let iz = -3; iz <= 3; iz++)
      if (Math.sqrt(ix * ix + iz * iz) <= 3.3) p(ix, 13, iz, 4);

    // 瓶身蓝色缠枝纹装饰
    for (let iy = -3; iy <= 2; iy++) {
      const a = (iy + 3) * 0.8;
      const rx = Math.round(Math.cos(a) * 3.5);
      const rz = Math.round(Math.sin(a) * 3.5);
      p(rx, iy, rz, 3);
      p(-rx, iy, -rz, 1);
    }

    // 蓝色云纹在瓶腹
    for (let iy = -1; iy <= 1; iy++) {
      p(0, iy, 5, 1); p(0, iy, -5, 1);
      p(5, iy, 0, 1); p(-5, iy, 0, 1);
    }

    return b;
  }, []);

  return (
    <group position={[0, 1.3, 0]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 木版年画 — 长方形雕版 ==========

function WoodblockFigure() {
  const g = 0.06;

  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ color: '#d4a574', roughness: 1, metalness: 0 }), // 0 wood
    new THREE.MeshStandardMaterial({ color: '#b8733c', roughness: 1, metalness: 0 }), // 1 dark wood
    new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6, metalness: 0 }), // 2 red ink
    new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 1, metalness: 0 }), // 3 black ink
    new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.5, metalness: 0 }), // 4 yellow ink
  ], []);

  const blocks = useMemo((): VoxelBlock[] => {
    const b: VoxelBlock[] = [];
    const p = (ix: number, iy: number, iz: number, mat: number) => b.push({ x: ix * g, y: iy * g, z: iz * g, size: g, mat });

    // 木板主体 (扁平长方体)
    for (let ix = -8; ix <= 8; ix++) for (let iy = -6; iy <= 6; iy++) for (let iz = -1; iz <= 1; iz++) {
      if (Math.abs(ix) <= 8 && Math.abs(iy) <= 6) {
        if (iz === -1 || iz === 1) p(ix, iy, iz, 1);
        else p(ix, iy, iz, 0);
      }
    }

    // 雕版凸起图案 (门神简化轮廓 - 在木板正面)
    // 人物轮廓
    for (let ix = -3; ix <= 3; ix++) for (let iy = -3; iy <= 5; iy++)
      if (Math.abs(ix) + Math.abs(iy - 1) <= 6) p(ix, iy, 2, 3);

    // 红色装饰 (服饰)
    for (let ix = -2; ix <= 2; ix++) for (let iy = -3; iy <= 0; iy++)
      p(ix, iy, 3, 2);

    // 黄色点缀
    p(0, -4, 3, 4);
    p(0, 5, 3, 4);
    p(-3, 2, 3, 4);
    p(3, 2, 3, 4);

    // 刻痕纹理 (凹线)
    for (let ix = -4; ix <= 4; ix += 2) p(ix, -5, 2, 1);
    for (let iy = -4; iy <= 4; iy += 2) p(-5, iy, 2, 1);
    for (let iy = -4; iy <= 4; iy += 2) p(5, iy, 2, 1);

    // 底座
    for (let ix = -9; ix <= 9; ix++) for (let iy = -8; iy <= -7; iy++) for (let iz = -3; iz <= 3; iz++)
      if (Math.abs(ix) <= 10) p(ix, iy, iz, 1);

    return b;
  }, []);

  return (
    <group position={[0, 1.3, 0]}>
      {blocks.map((blk, i) => (
        <mesh key={i} position={[blk.x, blk.y, blk.z]}>
          <boxGeometry args={[blk.size, blk.size, blk.size]} />
          <primitive object={mats[blk.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 展台关联光连线 ==========

function ConnectionLines() {
  const beamMat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#6366f1', roughness: 0.2, metalness: 0.5,
    transparent: true, opacity: 0.2, emissive: '#6366f1', emissiveIntensity: 0.3,
  }), []);

  const SP = 2.6; // same as exhibit spacing
  const conns = [
    { s: [-5 * SP / 2, 0.3, 0], e: [-3 * SP / 2, 0.3, 0] },
    { s: [-3 * SP / 2, 0.3, 0], e: [-1 * SP / 2, 0.3, 0] },
    { s: [-1 * SP / 2, 0.3, 0], e: [1 * SP / 2, 0.3, 0] },
    { s: [1 * SP / 2, 0.3, 0], e: [3 * SP / 2, 0.3, 0] },
    { s: [3 * SP / 2, 0.3, 0], e: [5 * SP / 2, 0.3, 0] },
  ];

  return (
    <group>
      {conns.map((conn, i) => {
        const dx = conn.e[0] - conn.s[0];
        const length = Math.abs(dx);
        const midX = (conn.s[0] + conn.e[0]) / 2;
        return (
          <mesh key={i} position={[midX, 0.3, 0]}>
            <boxGeometry args={[length, 0.015, 0.015]} />
            <primitive object={beamMat} attach="material" />
          </mesh>
        );
      })}
    </group>
  );
}

// ========== 展台 ==========

interface ExhibitProps {
  position: [number, number, number];
  color: string;
  label: string;
  emoji: string;
  mosaicStyle: 'paper_cutting' | 'shadow_puppet' | 'embroidery' | 'clay_figurine' | 'porcelain' | 'woodblock';
  onClick?: () => void;
  progress?: number;
}

function Exhibit({ position, color, label, emoji, mosaicStyle, onClick, progress = 0 }: ExhibitProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const baseMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.7, metalness: 0.3, emissive: color, emissiveIntensity: progress / 200 }), [color, progress]);
  const ringMat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.4, metalness: 0.6, emissive: color, emissiveIntensity: 0.3 + progress * 0.005 }), [color, progress]);
  const sparkleCount = 20 + Math.floor(progress * 0.8);
  const sparkleSize = 0.1 + progress * 0.001;
  const sparkleOpacity = 0.5 + progress * 0.005;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) ringRef.current.rotation.z = t * 0.5;
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
      groupRef.current.rotation.y = t * 0.1;
    }
  });

  const FigureComponent = useMemo(() => {
    switch (mosaicStyle) {
      case 'shadow_puppet': return <ShadowPuppetFigure />;
      case 'paper_cutting': return <PaperCuttingFigure />;
      case 'embroidery': return <EmbroideryFigure />;
      case 'clay_figurine': return <ClayFigurineFigure />;
      case 'porcelain': return <PorcelainFigure />;
      case 'woodblock': return <WoodblockFigure />;
      default: return null;
    }
  }, [mosaicStyle]);

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      <mesh><cylinderGeometry args={[1.2, 1.4, 0.3, 16]} /><primitive object={baseMat} attach="material" /></mesh>
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 8, 32]} /><primitive object={ringMat} attach="material" />
      </mesh>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>{FigureComponent}</Float>
      <Sparkles count={sparkleCount} scale={[2.5, 0.6, 2.5]} size={sparkleSize} speed={0.6} color={color} opacity={sparkleOpacity} />
      {progress >= 100 && (
        <pointLight position={[0, 1.5, 1]} color={color} intensity={1.5} distance={3} />
      )}
      <Html position={[0, 2.2, 0]} center distanceFactor={8}>
        <div style={{
          padding: '8px 20px', backgroundColor: 'rgba(5,5,16,0.75)', border: `1px solid ${color}60`,
          borderRadius: 20, color: '#e0e7ff', fontSize: 15, fontWeight: 600, whiteSpace: 'nowrap',
          textAlign: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)',
          textShadow: `0 0 10px ${color}`, letterSpacing: 2, userSelect: 'none', imageRendering: 'pixelated',
        }}>{emoji} {label}</div>
      </Html>
      <pointLight position={[0, 2, 0]} color={color} intensity={2} distance={5} />
    </group>
  );
}

// ========== 卷轴地面 ==========

function MuseumFloor() {
  // 卷轴主体（横向长矩形，类似古画长卷）
  const scrollW = 18, scrollD = 5;
  const scrollMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f5e6c8', roughness: 0.9, metalness: 0 }), []);
  const edgeMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#c9a84c', roughness: 0.5, metalness: 0.2 }), []);
  const rodMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b4513', roughness: 0.6, metalness: 0.3 }), []);

  return (
    <group position={[0, -0.2, 0]}>
      {/* 卷轴主体 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[scrollW, scrollD]} />
        <primitive object={scrollMat} attach="material" />
      </mesh>
      {/* 卷轴边框（金色） */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, scrollD / 2]}>
        <planeGeometry args={[scrollW, 0.1]} />
        <primitive object={edgeMat} attach="material" />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, -scrollD / 2]}>
        <planeGeometry args={[scrollW, 0.1]} />
        <primitive object={edgeMat} attach="material" />
      </mesh>
      {/* 左侧卷轴杆 */}
      <mesh position={[-scrollW / 2 - 0.15, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, scrollD + 0.4, 8]} />
        <primitive object={rodMat} attach="material" />
      </mesh>
      {/* 右侧卷轴杆 */}
      <mesh position={[scrollW / 2 + 0.15, 0.15, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.12, 0.12, scrollD + 0.4, 8]} />
        <primitive object={rodMat} attach="material" />
      </mesh>
      {/* 卷轴上的纹理线条（模拟古画纹路） */}
      {[-4, -2, 0, 2, 4].map((dx) => (
        <mesh key={dx} rotation={[-Math.PI / 2, 0, 0]} position={[dx, 0.02, 0]}>
          <planeGeometry args={[0.03, scrollD - 0.5]} />
          <primitive object={edgeMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

// ========== 中央全息投影 ==========

function CenterHologram() {
  const r1 = useRef<THREE.Mesh>(null), r2 = useRef<THREE.Mesh>(null), r3 = useRef<THREE.Mesh>(null), r4 = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);

  const m1 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#8b5cf6', roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.6, emissive: '#8b5cf6', emissiveIntensity: 0.5 }), []);
  const m2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ec4899', roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.4, emissive: '#ec4899', emissiveIntensity: 0.4 }), []);
  const m3 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#14b8a6', roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.3, emissive: '#14b8a6', emissiveIntensity: 0.3 }), []);
  const m4 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.3, metalness: 0.6, transparent: true, opacity: 0.2, emissive: '#f59e0b', emissiveIntensity: 0.2 }), []);
  const sphereM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#6366f1', roughness: 0.2, metalness: 0.4, wireframe: true }), []);
  const coreM = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a5b4fc', roughness: 0.1, metalness: 0.2, transparent: true, opacity: 0.65, emissive: '#a5b4fc', emissiveIntensity: 0.9 }), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) r1.current.rotation.x = t * 0.3;
    if (r2.current) r2.current.rotation.y = t * 0.5;
    if (r3.current) r3.current.rotation.z = t * 0.7;
    if (r4.current) { r4.current.rotation.x = t * 0.4; r4.current.rotation.y = t * 0.6; }
    if (inner.current) { inner.current.rotation.x = t * 0.1; inner.current.rotation.y = t * 0.15; }
  });

  return (
    <group position={[0, 7, -2]}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={inner}><icosahedronGeometry args={[0.5, 1]} /><primitive object={sphereM} attach="material" /></mesh>
        <mesh><sphereGeometry args={[0.2, 8, 8]} /><primitive object={coreM} attach="material" /></mesh>
      </Float>
      <mesh ref={r1}><torusGeometry args={[1.2, 0.02, 8, 32]} /><primitive object={m1} attach="material" /></mesh>
      <mesh ref={r2}><torusGeometry args={[1.5, 0.02, 8, 32]} /><primitive object={m2} attach="material" /></mesh>
      <mesh ref={r3}><torusGeometry args={[1.8, 0.02, 8, 32]} /><primitive object={m3} attach="material" /></mesh>
      <mesh ref={r4}><torusGeometry args={[2.1, 0.015, 8, 32]} /><primitive object={m4} attach="material" /></mesh>
      <Sparkles count={80} scale={[4, 0.5, 4]} size={0.12} speed={0.4} color="#a5b4fc" opacity={0.9} />
      <Html position={[0, -5, 0]} center distanceFactor={8}>
        <div style={{ color: '#a5b4fc', fontSize: 22, fontWeight: 700, letterSpacing: 6, textShadow: '0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4)', whiteSpace: 'nowrap', userSelect: 'none', pointerEvents: 'none', imageRendering: 'pixelated' }}>
          非遗文化博物馆
        </div>
      </Html>
      <pointLight color="#6366f1" intensity={3} distance={8} />
    </group>
  );
}

// ========== 博物馆主场景 ==========

interface MuseumSceneProps {
  onSelectCraft: (craftId: string) => void;
  timeMode?: 'ancient' | 'modern';
  showGuide?: boolean;
  craftProgress?: Record<string, number>; // craftId → learned percentage 0-100
}

export default function MuseumScene({ onSelectCraft, timeMode = 'modern', showGuide = false, craftProgress = {} }: MuseumSceneProps) {
  // @react-three/postprocessing 3.x 类型兼容
  const FX = EffectComposer as any;

  const isAncient = timeMode === 'ancient';
  const bgColor = isAncient ? '#1a0f00' : '#050510';
  const fogColor = isAncient ? '#3d2b1f' : '#050510';
  const ambColor = isAncient ? '#ffd599' : '#6366f1';
  const ambIntensity = isAncient ? 0.25 : 0.15;
  const spotColor = isAncient ? '#f59e0b' : '#6366f1';

  // 画卷长轴布局：6个展台从左到右一字排开
  const SPACING = 2.6;
  const TOTAL = 6;
  const crafts = [
    { id: 'craft_shadow_puppet', label: '皮影戏', emoji: '🎭', color: '#f59e0b', mosaicStyle: 'shadow_puppet' as const },
    { id: 'craft_paper_cutting', label: '剪纸', emoji: '✂️', color: '#ef4444', mosaicStyle: 'paper_cutting' as const },
    { id: 'craft_embroidery', label: '苏绣', emoji: '🪡', color: '#ec4899', mosaicStyle: 'embroidery' as const },
    { id: 'craft_clay_figurine', label: '泥塑', emoji: '🏺', color: '#14b8a6', mosaicStyle: 'clay_figurine' as const },
    { id: 'craft_porcelain', label: '青花瓷', emoji: '🔵', color: '#3b82f6', mosaicStyle: 'porcelain' as const },
    { id: 'craft_woodblock', label: '木版年画', emoji: '🧧', color: '#dc2626', mosaicStyle: 'woodblock' as const },
  ].map((craft, i) => ({
    ...craft,
    position: [
      (i - (TOTAL - 1) / 2) * SPACING, // -6.5 到 +6.5 均匀分布
      0,
      0, // 全部在同一深度，无前后遮挡
    ] as [number, number, number],
  }));

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Canvas dpr={[0.3, 0.5]} camera={{ position: [0, 4.5, 9], fov: 65 }}>
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[fogColor, 15, 35]} />
        <ambientLight intensity={ambIntensity} color={ambColor} />
        <StarField />
        <MuseumFloor />
        <NPCGuide showBubble={showGuide} />
        <ConnectionLines />
        <CenterHologram />
        {crafts.map((craft) => (
          <Exhibit key={craft.id} position={craft.position} color={craft.color} label={craft.label}
            emoji={craft.emoji} mosaicStyle={craft.mosaicStyle} onClick={() => onSelectCraft(craft.id)}
            progress={craftProgress[craft.id] || 0} />
        ))}
        <SpotLight position={[0, 10, 0]} angle={0.5} penumbra={0.5} decay={1} intensity={2} color={spotColor} castShadow />
        <FX>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={isAncient ? 0.7 : 0.5} />
        </FX>
      </Canvas>
    </div>
  );
}
