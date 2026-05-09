import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Html, Sparkles, MeshReflectorMaterial } from '@react-three/drei';
import * as THREE from 'three';

// ========== 马赛克纹理生成 ==========

function createMosaicTexture(
  style: 'paper_cutting' | 'shadow_puppet' | 'embroidery' | 'clay_figurine',
  color: string
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // 背景色
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, 256, 256);

  // 根据样式生成不同的马赛克图案
  const cellSize = 16; // 每个马赛克块的大小
  const cols = canvas.width / cellSize;
  const rows = canvas.height / cellSize;

  // 解析颜色为 RGB
  const tempDiv = document.createElement('div');
  tempDiv.style.color = color;
  document.body.appendChild(tempDiv);
  const computedColor = getComputedStyle(tempDiv).color;
  document.body.removeChild(tempDiv);
  const rgbMatch = computedColor.match(/\d+/g);
  const baseR = rgbMatch ? parseInt(rgbMatch[0]) : 100;
  const baseG = rgbMatch ? parseInt(rgbMatch[1]) : 100;
  const baseB = rgbMatch ? parseInt(rgbMatch[2]) : 100;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // 随机偏移颜色
      const offsetR = (Math.random() - 0.5) * 60;
      const offsetG = (Math.random() - 0.5) * 60;
      const offsetB = (Math.random() - 0.5) * 60;
      const rr = Math.min(255, Math.max(0, baseR + offsetR));
      const gg = Math.min(255, Math.max(0, baseG + offsetG));
      const bb = Math.min(255, Math.max(0, baseB + offsetB));

      // 根据样式决定是否绘制该块
      let draw = true;
      if (style === 'paper_cutting') {
        // 剪纸风格：随机留白，形成镂空效果
        draw = Math.random() > 0.3;
      } else if (style === 'shadow_puppet') {
        // 皮影风格：半透明效果，随机透明度
        draw = Math.random() > 0.2;
      } else if (style === 'embroidery') {
        // 苏绣风格：细密纹理，几乎全部填充
        draw = Math.random() > 0.1;
      } else if (style === 'clay_figurine') {
        // 泥塑风格：粗糙质感，随机缺失
        draw = Math.random() > 0.25;
      }

      if (draw) {
        ctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }

  // 添加一些随机线条模拟剪纸/皮影的轮廓
  ctx.strokeStyle = `rgba(255,255,255,0.2)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    const x1 = Math.random() * 256;
    const y1 = Math.random() * 256;
    const x2 = Math.random() * 256;
    const y2 = Math.random() * 256;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2); // 重复纹理以覆盖更大面积
  return texture;
}

// ========== 星空背景 ==========

function StarField() {
  return <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

// ========== 发光展台 ==========

interface ExhibitProps {
  position: [number, number, number];
  color: string;
  label: string;
  emoji: string;
  mosaicStyle: 'paper_cutting' | 'shadow_puppet' | 'embroidery' | 'clay_figurine';
  onClick?: () => void;
}

function Exhibit({ position, color, label, emoji, mosaicStyle, onClick }: ExhibitProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // 生成马赛克纹理（缓存）
  const mosaicTexture = useMemo(() => createMosaicTexture(mosaicStyle, color), [mosaicStyle, color]);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
    if (groupRef.current) {
      // 让整个展台缓慢上下浮动
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* 底座（使用马赛克纹理） */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.4, 0.3, 32]} />
        <meshStandardMaterial
          map={mosaicTexture}
          emissive={color}
          emissiveIntensity={0.3}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 发光光环 */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>

      {/* 顶部发光球（也使用马赛克纹理） */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial
            map={mosaicTexture}
            emissive={color}
            emissiveIntensity={0.8}
            transparent
            opacity={0.8}
          />
        </mesh>
      </Float>

      {/* 闪烁粒子（增加数量和大小） */}
      <Sparkles
        count={30}
        scale={[2.5, 0.6, 2.5]}
        size={0.12}
        speed={0.6}
        color={color}
        opacity={0.7}
      />

      {/* 3D 空间中的 HTML 标签（支持中文） */}
      <Html position={[0, 2.2, 0]} center distanceFactor={8}>
        <div style={{
          padding: '8px 20px',
          backgroundColor: 'rgba(5, 5, 16, 0.75)',
          border: `1px solid ${color}60`,
          borderRadius: 20,
          color: '#e0e7ff',
          fontSize: 15,
          fontWeight: 600,
          whiteSpace: 'nowrap',
          textAlign: 'center',
          cursor: 'pointer',
          backdropFilter: 'blur(8px)',
          textShadow: `0 0 10px ${color}`,
          letterSpacing: 2,
          userSelect: 'none',
        }}>
          {emoji} {label}
        </div>
      </Html>

      {/* 点光源 */}
      <pointLight position={[0, 2, 0]} color={color} intensity={2} distance={5} />
    </group>
  );
}

// ========== 博物馆地面（带反射） ==========

function MuseumFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        mirror={0}
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={0.3}
        roughness={0.2}
        depthScale={1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#0a0a1a"
        metalness={0.9}
      />
    </mesh>
  );
}

// ========== 中央全息投影 ==========

function CenterHologram() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);
  const ringRef4 = useRef<THREE.Mesh>(null);
  const sparkleRef = useRef<THREE.Group>(null);
  const innerSphereRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef1.current) ringRef1.current.rotation.x = t * 0.3;
    if (ringRef2.current) ringRef2.current.rotation.y = t * 0.5;
    if (ringRef3.current) ringRef3.current.rotation.z = t * 0.7;
    if (ringRef4.current) ringRef4.current.rotation.x = t * 0.4;
    if (ringRef4.current) ringRef4.current.rotation.y = t * 0.6;
    if (sparkleRef.current) {
      sparkleRef.current.rotation.y = t * 0.2;
    }
    if (innerSphereRef.current) {
      innerSphereRef.current.rotation.x = t * 0.1;
      innerSphereRef.current.rotation.y = t * 0.15;
    }
  });

  return (
    <group position={[0, 1.5, 0]}>
      {/* 中心球体（内部发光） */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh ref={innerSphereRef}>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} wireframe />
        </mesh>
        {/* 内部发光小球 */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="#a5b4fc" emissive="#a5b4fc" emissiveIntensity={1} transparent opacity={0.6} />
        </mesh>
      </Float>

      {/* 旋转光环（增加一个额外的环） */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={1} transparent opacity={0.6} />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.5, 0.02, 16, 64]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1} transparent opacity={0.4} />
      </mesh>
      <mesh ref={ringRef3}>
        <torusGeometry args={[1.8, 0.02, 16, 64]} />
        <meshStandardMaterial color="#14b8a6" emissive="#14b8a6" emissiveIntensity={1} transparent opacity={0.3} />
      </mesh>
      <mesh ref={ringRef4}>
        <torusGeometry args={[2.1, 0.015, 16, 64]} />
        <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.8} transparent opacity={0.2} />
      </mesh>

      {/* 闪烁粒子环 */}
      <group ref={sparkleRef}>
        <Sparkles
          count={80}
          scale={[4, 0.5, 4]}
          size={0.12}
          speed={0.4}
          color="#a5b4fc"
          opacity={0.9}
        />
      </group>

      {/* 博物馆标题（3D 空间中的 HTML） */}
      <Html position={[0, 3.5, 0]} center distanceFactor={8}>
        <div style={{
          color: '#a5b4fc',
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 6,
          textShadow: '0 0 20px rgba(99,102,241,0.8), 0 0 40px rgba(99,102,241,0.4)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
          pointerEvents: 'none',
        }}>
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
}

export default function MuseumScene({ onSelectCraft }: MuseumSceneProps) {
  const crafts = [
    { id: 'craft_shadow_puppet', label: '皮影戏', emoji: '🎭', color: '#f59e0b', mosaicStyle: 'shadow_puppet' as const, position: [-4, 0, -3] as [number, number, number] },
    { id: 'craft_paper_cutting', label: '剪纸', emoji: '✂️', color: '#ef4444', mosaicStyle: 'paper_cutting' as const, position: [4, 0, -3] as [number, number, number] },
    { id: 'craft_embroidery', label: '苏绣', emoji: '🪡', color: '#ec4899', mosaicStyle: 'embroidery' as const, position: [-4, 0, 3] as [number, number, number] },
    { id: 'craft_clay_figurine', label: '泥塑', emoji: '🏺', color: '#14b8a6', mosaicStyle: 'clay_figurine' as const, position: [4, 0, 3] as [number, number, number] },
  ];

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
      <color attach="background" args={['#050510']} />
      <fog attach="fog" args={['#050510', 15, 35]} />

      {/* 环境光 */}
      <ambientLight intensity={0.15} />

      {/* 星空 */}
      <StarField />

      {/* 地面（带反射） */}
      <MuseumFloor />

      {/* 中央全息投影 */}
      <CenterHologram />

      {/* 展台（含 3D 空间中的中文标签） */}
      {crafts.map((craft) => (
        <Exhibit
          key={craft.id}
          position={craft.position}
          color={craft.color}
          label={craft.label}
          emoji={craft.emoji}
          mosaicStyle={craft.mosaicStyle}
          onClick={() => onSelectCraft(craft.id)}
        />
      ))}
      </Canvas>
    </div>
  );
}
