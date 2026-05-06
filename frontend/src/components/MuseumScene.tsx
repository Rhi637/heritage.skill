import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Html } from '@react-three/drei';
import * as THREE from 'three';

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
  onClick?: () => void;
}

function Exhibit({ position, color, label, emoji, onClick }: ExhibitProps) {
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (ringRef.current) {
      ringRef.current.rotation.z = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      {/* 底座 */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.4, 0.3, 32]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 发光光环 */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 16, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} />
      </mesh>

      {/* 顶部发光球 */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.3}>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.8} transparent opacity={0.8} />
        </mesh>
      </Float>

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

// ========== 博物馆地面 ==========

function MuseumFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[60, 60]} />
      <meshStandardMaterial color="#0a0a1a" metalness={0.9} roughness={0.1} />
    </mesh>
  );
}

// ========== 中央全息投影 ==========

function CenterHologram() {
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);
  const ringRef3 = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef1.current) ringRef1.current.rotation.x = t * 0.3;
    if (ringRef2.current) ringRef2.current.rotation.y = t * 0.5;
    if (ringRef3.current) ringRef3.current.rotation.z = t * 0.7;
  });

  return (
    <group position={[0, 1.5, 0]}>
      {/* 中心球体 */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <icosahedronGeometry args={[0.5, 1]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.8} wireframe />
        </mesh>
      </Float>

      {/* 旋转光环 */}
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
    { id: 'craft_shadow_puppet', label: '皮影戏', emoji: '🎭', color: '#f59e0b', position: [-4, 0, -3] as [number, number, number] },
    { id: 'craft_paper_cutting', label: '剪纸', emoji: '✂️', color: '#ef4444', position: [4, 0, -3] as [number, number, number] },
    { id: 'craft_embroidery', label: '苏绣', emoji: '🪡', color: '#ec4899', position: [-4, 0, 3] as [number, number, number] },
    { id: 'craft_clay_figurine', label: '泥塑', emoji: '🏺', color: '#14b8a6', position: [4, 0, 3] as [number, number, number] },
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

      {/* 地面 */}
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
          onClick={() => onSelectCraft(craft.id)}
        />
      ))}
      </Canvas>
    </div>
  );
}
