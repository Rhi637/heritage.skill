import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, shaderMaterial } from '@react-three/fiber';
import { Stars, Float, Html, Sparkles, MeshReflectorMaterial, Environment, ContactShadows, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { extend } from '@react-three/fiber';

// ========== 像素风格着色器 ==========

const PixelationShader = {
  uniforms: {
    uColor: { value: new THREE.Color('#ffffff') },
    uPixelSize: { value: 0.05 }, // 像素大小（0~1），越小越精细
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform vec3 uColor;
    uniform float uPixelSize;
    varying vec2 vUv;

    void main() {
      // 量化 UV 坐标，产生像素块
      vec2 pixelUv = floor(vUv / uPixelSize) * uPixelSize + uPixelSize * 0.5;
      // 简单的颜色输出（可以添加随机偏移模拟像素噪点）
      gl_FragColor = vec4(uColor, 1.0);
    }
  `,
};

const PixelationMaterial = shaderMaterial(
  PixelationShader.uniforms,
  PixelationShader.vertexShader,
  PixelationShader.fragmentShader
);

// 使用 extend 注册自定义材质
extend({ PixelationMaterial });

// ========== 马赛克纹理生成（已弃用，改用像素着色器） ==========

// ========== 星空背景 ==========

function StarField() {
  return <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

// ========== 非遗项目3D形象 ==========

function ShadowPuppetFigure({ color = '#f59e0b', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  // 为每个像素块创建材质
  const blockMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [color, pixelSize]);

  // 皮影人物（3D 像素块堆叠）
  const blocks = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number }[] = [];
    const blockSize = 0.08;
    // 头部
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const dist = Math.sqrt(i * i + j * j);
        if (dist <= 2.2) {
          result.push({ x: i * blockSize, y: 0.7 + j * blockSize, z: 0, size: blockSize });
        }
      }
    }
    // 身体
    for (let i = -1; i <= 1; i++) {
      for (let j = 0; j <= 5; j++) {
        result.push({ x: i * blockSize, y: 0.1 + j * blockSize, z: 0, size: blockSize });
      }
    }
    // 左臂
    for (let i = -3; i <= -1; i++) {
      for (let j = 1; j <= 3; j++) {
        result.push({ x: i * blockSize, y: 0.1 + j * blockSize, z: 0, size: blockSize });
      }
    }
    // 右臂
    for (let i = 1; i <= 3; i++) {
      for (let j = 1; j <= 3; j++) {
        result.push({ x: i * blockSize, y: 0.1 + j * blockSize, z: 0, size: blockSize });
      }
    }
    // 左腿
    for (let i = -1; i <= 0; i++) {
      for (let j = -3; j <= -1; j++) {
        result.push({ x: i * blockSize, y: j * blockSize, z: 0, size: blockSize });
      }
    }
    // 右腿
    for (let i = 0; i <= 1; i++) {
      for (let j = -3; j <= -1; j++) {
        result.push({ x: i * blockSize, y: j * blockSize, z: 0, size: blockSize });
      }
    }
    return result;
  }, []);

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={blockMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function PaperCuttingFigure({ color = '#ef4444', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const blockMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [color, pixelSize]);

  // 剪纸团花（3D 像素块堆叠）
  const blocks = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number }[] = [];
    const gridSize = 8;
    const blockSize = 0.08;
    const radius = 0.35;
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        const x = (i / gridSize - 0.5) * radius * 2;
        const z = (j / gridSize - 0.5) * radius * 2;
        const dist = Math.sqrt(x * x + z * z);
        // 花瓣形状：只在特定角度范围内有块
        const angle = Math.atan2(z, x);
        const petalAngle = Math.floor(angle / (Math.PI / 3)) * (Math.PI / 3);
        const petalDist = Math.abs(dist - 0.25) < 0.1 ? 1 : 0;
        const centerDist = dist < 0.08 ? 1 : 0;
        if (petalDist > 0 || centerDist > 0) {
          const yOffset = Math.sin(dist * 10) * 0.02;
          result.push({ x, y: yOffset, z, size: blockSize });
        }
      }
    }
    return result;
  }, []);

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={blockMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function EmbroideryFigure({ color = '#ec4899', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const outerMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.8;
    return mat;
  }, [color, pixelSize]);

  const innerMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#fdf2f8');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.8;
    return mat;
  }, [pixelSize]);

  // 绣花绷子（3D 像素块堆叠）
  const blocks = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number }[] = [];
    const blockSize = 0.06;
    const outerRadius = 0.35;
    const innerRadius = 0.25;
    const segments = 24;
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      const x = Math.cos(angle) * outerRadius;
      const z = Math.sin(angle) * outerRadius;
      result.push({ x, y: 0, z, size: blockSize });
    }
    // 内部绣品（随机像素块）
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = innerRadius * Math.sqrt(Math.random());
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      result.push({ x, y: 0, z, size: blockSize * 0.8 });
    }
    return result;
  }, []);

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={i < 24 ? outerMat : innerMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function ClayFigurineFigure({ color = '#8B4513', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const bodyMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [color, pixelSize]);

  const headMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#D2691E');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  // 泥人（3D 像素块堆叠）
  const blocks = useMemo(() => {
    const result: { x: number; y: number; z: number; size: number }[] = [];
    const blockSize = 0.07;
    // 身体（圆柱形）
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        const dist = Math.sqrt(i * i + j * j);
        if (dist <= 2.5) {
          for (let k = 0; k <= 4; k++) {
            result.push({ x: i * blockSize, y: -0.2 + k * blockSize, z: j * blockSize, size: blockSize });
          }
        }
      }
    }
    // 头部（球形）
    for (let i = -2; i <= 2; i++) {
      for (let j = -2; j <= 2; j++) {
        for (let k = -2; k <= 2; k++) {
          const dist = Math.sqrt(i * i + j * j + k * k);
          if (dist <= 2.2) {
            result.push({ x: i * blockSize, y: 0.3 + k * blockSize, z: j * blockSize, size: blockSize });
          }
        }
      }
    }
    return result;
  }, []);

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={block.y > 0.2 ? headMat : bodyMat} attach="material" />
        </mesh>
      ))}
    </group>
  );
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

function Exhibit({ position, color, label, emoji, mosaicStyle, onClick, pixelSize = 0.05 }: ExhibitProps & { pixelSize?: number }) {
  // 使用 useMemo 创建像素材质实例，确保每次 color/pixelSize 变化时更新
  const pixelMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [color, pixelSize]);
  const ringRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);


  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.5;
    }
    if (groupRef.current) {
      // 让整个展台缓慢上下浮动
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.05;
      // 让整个展台缓慢旋转
      groupRef.current.rotation.y = t * 0.1;
    }
  });

  // 根据样式选择对应的3D形象
  const FigureComponent = useMemo(() => {
    switch (mosaicStyle) {
      case 'shadow_puppet':
        return <ShadowPuppetFigure color={color} pixelSize={pixelSize} />;
      case 'paper_cutting':
        return <PaperCuttingFigure color={color} pixelSize={pixelSize} />;
      case 'embroidery':
        return <EmbroideryFigure color={color} pixelSize={pixelSize} />;
      case 'clay_figurine':
        return <ClayFigurineFigure color={color} pixelSize={pixelSize} />;
      default:
        return null;
    }
  }, [mosaicStyle, color, pixelSize]);


  return (
    <group ref={groupRef} position={position} onClick={onClick}>
      {/* 底座（使用像素风格着色器） */}
      <mesh>
        <cylinderGeometry args={[1.2, 1.4, 0.3, 32]} />
        <primitive object={pixelMat} attach="material" />
      </mesh>

      {/* 发光光环（也使用像素风格） */}
      <mesh ref={ringRef} position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.3, 0.03, 16, 64]} />
        <primitive object={pixelMat} attach="material" />
      </mesh>

      {/* 非遗项目3D形象 */}
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
        {FigureComponent}
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

function MuseumFloor({ pixelSize = 0.05 }: { pixelSize?: number }) {
  const floorMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#0a0a1a');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
      <planeGeometry args={[60, 60]} />
      <primitive object={floorMat} attach="material" />
    </mesh>
  );
}

// ========== 中央全息投影 ==========

function CenterHologram({ pixelSize = 0.05 }: { pixelSize?: number }) {
  // 为每个环创建独立的像素材质
  const ringMat1 = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#8b5cf6');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.6;
    return mat;
  }, [pixelSize]);

  const ringMat2 = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#ec4899');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.4;
    return mat;
  }, [pixelSize]);

  const ringMat3 = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#14b8a6');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.3;
    return mat;
  }, [pixelSize]);

  const ringMat4 = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#f59e0b');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.2;
    return mat;
  }, [pixelSize]);

  const sphereMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#6366f1');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.wireframe = true;
    return mat;
  }, [pixelSize]);

  const innerSphereMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#a5b4fc');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.6;
    return mat;
  }, [pixelSize]);
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
          <primitive object={sphereMat} attach="material" />
        </mesh>
        {/* 内部发光小球 */}
        <mesh>
          <sphereGeometry args={[0.2, 16, 16]} />
          <primitive object={innerSphereMat} attach="material" />
        </mesh>
      </Float>

      {/* 旋转光环（增加一个额外的环） */}
      <mesh ref={ringRef1}>
        <torusGeometry args={[1.2, 0.02, 16, 64]} />
        <primitive object={ringMat1} attach="material" />
      </mesh>
      <mesh ref={ringRef2}>
        <torusGeometry args={[1.5, 0.02, 16, 64]} />
        <primitive object={ringMat2} attach="material" />
      </mesh>
      <mesh ref={ringRef3}>
        <torusGeometry args={[1.8, 0.02, 16, 64]} />
        <primitive object={ringMat3} attach="material" />
      </mesh>
      <mesh ref={ringRef4}>
        <torusGeometry args={[2.1, 0.015, 16, 64]} />
        <primitive object={ringMat4} attach="material" />
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

export default function MuseumScene({ onSelectCraft, pixelSize = 0.05 }: MuseumSceneProps & { pixelSize?: number }) {
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
      <MuseumFloor pixelSize={pixelSize} />

      {/* 中央全息投影 */}
      <CenterHologram pixelSize={pixelSize} />

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
          pixelSize={pixelSize}
        />
      ))}

      {/* 环境贴图（HDR 光照） */}
      <Environment preset="night" />

      {/* 接触阴影 */}
      <ContactShadows
        position={[0, -0.2, 0]}
        opacity={0.6}
        scale={20}
        blur={2}
        far={4}
      />

      {/* 聚光灯（从上方照射） */}
      <SpotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={0.5}
        decay={1}
        intensity={2}
        color="#6366f1"
        castShadow
      />

      {/* 后期处理：Bloom 辉光效果 */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
          intensity={0.5}
        />
      </EffectComposer>
      </Canvas>
    </div>
  );
}
