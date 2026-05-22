import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Html, Sparkles, Environment, ContactShadows, SpotLight } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';

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

class PixelationMaterial extends THREE.ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        uColor: { value: new THREE.Color('#ffffff') },
        uPixelSize: { value: 0.05 },
      },
      vertexShader: PixelationShader.vertexShader,
      fragmentShader: PixelationShader.fragmentShader,
    });
  }
}

// ========== 马赛克纹理生成（已弃用，改用像素着色器） ==========

// ========== 星空背景 ==========

function StarField() {
  return <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />;
}

// ========== 非遗项目3D形象 ==========

function ShadowPuppetFigure({ color = '#f59e0b', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const bs = 0.06;

  const mainMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [color, pixelSize]);

  const accentMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#d97706');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [pixelSize]);

  const detailMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#fbbf24');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [pixelSize]);

  const blocks = useMemo(() => {
    const b: { x: number; y: number; z: number; size: number; mat: number }[] = [];
    const pushBox = (ix: number, iy: number, iz: number, mat: number) => {
      b.push({ x: ix * bs, y: iy * bs, z: iz * bs, size: bs, mat });
    };
    // 0=main, 1=accent, 2=detail

    // 裙摆 (wide trapezoid at bottom, y:-5 to -1)
    for (let iy = -5; iy <= -1; iy++) {
      const halfW = 4 + Math.abs(iy + 2); // wider at bottom
      for (let ix = -halfW; ix <= halfW; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (Math.abs(ix) + Math.abs(iz) <= halfW + 1) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 裙摆底部装饰边
    for (let ix = -6; ix <= 6; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        if (Math.abs(ix) + Math.abs(iz) <= 7) pushBox(ix, -6, iz, 1);
      }
    }

    // 身体/袍子 (y:0 to 4)
    for (let iy = 0; iy <= 4; iy++) {
      for (let ix = -3; ix <= 3; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (Math.abs(ix) + Math.abs(iz) <= 4) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 腰带 (accent color)
    for (let ix = -3; ix <= 3; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        if (Math.abs(ix) + Math.abs(iz) <= 4) pushBox(ix, 1, iz, 1);
      }
    }

    // 左袖 (wide, extending left)
    for (let ix = -7; ix <= -4; ix++) {
      for (let iy = 1; iy <= 4; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 左袖口
    for (let ix = -8; ix <= -8; ix++) {
      for (let iy = 1; iy <= 4; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 右袖 (wide, extending right)
    for (let ix = 4; ix <= 7; ix++) {
      for (let iy = 1; iy <= 4; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 右袖口
    for (let ix = 8; ix <= 8; ix++) {
      for (let iy = 1; iy <= 4; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 脖子 (y:5)
    for (let ix = -1; ix <= 1; ix++) {
      for (let iz = -1; iz <= 1; iz++) {
        pushBox(ix, 5, iz, 0);
      }
    }

    // 头部 (sphere, centered at y≈7.5, radius≈2.5 grid units)
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = 5; iy <= 10; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          const dist = Math.sqrt(ix * ix + (iy - 7.5) * (iy - 7.5) + iz * iz * 1.5);
          if (dist <= 2.8) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 眼睛 (detail)
    pushBox(-1, 8, 2, 2);
    pushBox(1, 8, 2, 2);

    // 盔头底座 (y:10 to 12)
    for (let iy = 10; iy <= 12; iy++) {
      const halfW = iy === 12 ? 3 : 4;
      for (let ix = -halfW; ix <= halfW; ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 盔头顶部装饰 (y:12 to 14)
    for (let ix = -2; ix <= 2; ix++) {
      for (let iy = 12; iy <= 14; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (Math.abs(ix) + Math.abs(iz) <= 3) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 盔头绒球 (top)
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = 14; iy <= 15; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 2);
        }
      }
    }

    // 雉鸡翎 - 左 (tall thin spikes)
    for (let iy = 12; iy <= 19; iy++) {
      const offset = Math.floor((iy - 12) / 2);
      pushBox(-3 - offset, iy, 0, 2);
    }

    // 雉鸡翎 - 右
    for (let iy = 12; iy <= 19; iy++) {
      const offset = Math.floor((iy - 12) / 2);
      pushBox(3 + offset, iy, 0, 2);
    }

    return b;
  }, []);

  const mats = [mainMat, accentMat, detailMat];

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={mats[block.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function PaperCuttingFigure({ color = '#ef4444', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const bs = 0.055;

  const mainMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [color, pixelSize]);

  const accentMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#dc2626');
    mat.uniforms.uPixelSize.value = pixelSize;
    mat.transparent = true;
    mat.opacity = 0.9;
    return mat;
  }, [pixelSize]);

  const eyeMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#000000');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const blocks = useMemo(() => {
    const b: { x: number; y: number; z: number; size: number; mat: number }[] = [];
    const pushBox = (ix: number, iy: number, iz: number, mat: number) => {
      b.push({ x: ix * bs, y: iy * bs, z: iz * bs, size: bs, mat });
    };

    // 鸡身 (oval body, facing left)
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = -2; iy <= 4; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const dx = ix / 3.5;
          const dy = (iy - 1) / 3.0;
          if (dx * dx + dy * dy <= 1.0) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 鸡胸 (rounder front, accent)
    for (let ix = -4; ix <= -3; ix++) {
      for (let iy = -1; iy <= 2; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 鸡头 (smaller sphere, left side of body)
    for (let ix = -6; ix <= -3; ix++) {
      for (let iy = 2; iy <= 6; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          const dx = (ix + 4.5) / 2.2;
          const dy = (iy - 4) / 2.2;
          if (dx * dx + dy * dy <= 1.0) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 鸡冠 (comb on top of head, jagged)
    for (let iy = 6; iy <= 9; iy++) {
      const halfW = iy >= 8 ? 1 : iy >= 7 ? 2 : 3;
      for (let ix = -6 + (9 - iy); ix <= -3 + (iy - 6); ix++) {
        for (let iz = -1; iz <= 1; iz++) {
          if (Math.abs(ix + 4.5) <= halfW) pushBox(ix, iy, iz, 1);
        }
      }
    }
    // 冠尖
    pushBox(-5, 10, 0, 1);
    pushBox(-4, 10, 0, 1);
    pushBox(-5, 11, 0, 1);

    // 鸡喙 (beak, pointing left)
    for (let ix = -8; ix <= -6; ix++) {
      for (let iy = 3; iy <= 4; iy++) {
        pushBox(ix, iy, 0, 1);
      }
    }
    pushBox(-9, 3, 0, 1);
    pushBox(-9, 4, 0, 1);

    // 眼睛
    pushBox(-5, 4, 2, 2);

    // 鸡嗉 (wattle under beak)
    for (let iy = 2; iy <= 3; iy++) {
      pushBox(-7, iy, 1, 1);
    }

    // 尾羽 (sweeping back and up, to the right)
    for (let iy = -1; iy <= 10; iy++) {
      const offset = Math.floor((iy + 1) / 2);
      for (let iz = -1; iz <= 1; iz++) {
        for (let ix = 3 + offset; ix <= 4 + offset; ix++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 尾羽尖端 (flare out)
    for (let iy = 8; iy <= 12; iy++) {
      const offset = Math.floor((iy - 6) / 2);
      for (let iz = -1; iz <= 1; iz++) {
        for (let ix = 3 + offset; ix <= 5 + offset; ix++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }
    // 尾部羽毛装饰块
    for (let iy = 5; iy <= 8; iy++) {
      pushBox(5, iy, 1, 1);
      pushBox(5, iy, -1, 1);
    }

    // 鸡腿 (thin legs)
    for (let iy = -4; iy <= -3; iy++) {
      pushBox(-1, iy, 2, 1);
      pushBox(1, iy, 2, 1);
    }
    // 鸡脚 (claws)
    for (let ix = -2; ix <= 0; ix++) {
      pushBox(ix, -5, 2, 1);
    }
    for (let ix = 0; ix <= 2; ix++) {
      pushBox(ix, -5, 2, 1);
    }

    // 翅膀 (on side of body)
    for (let ix = -2; ix <= 2; ix++) {
      for (let iy = 0; iy <= 3; iy++) {
        pushBox(ix, iy, 2, 0);
      }
    }

    return b;
  }, []);

  const mats = [mainMat, accentMat, eyeMat];

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={mats[block.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function EmbroideryFigure({ color = '#ec4899', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const bs = 0.05;

  const frameMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#8B4513');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const fabricMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#fdf2f8');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const flowerMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [color, pixelSize]);

  const leafMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#22c55e');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const needleMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#c0c0c0');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const blocks = useMemo(() => {
    const b: { x: number; y: number; z: number; size: number; mat: number }[] = [];
    const pushBox = (ix: number, iy: number, iz: number, mat: number) => {
      b.push({ x: ix * bs, y: iy * bs, z: iz * bs, size: bs, mat });
    };
    // 0=frame, 1=fabric, 2=flower, 3=leaf, 4=needle

    const frameR = 7;    // outer ring radius in grid units
    const innerR = 6;    // inner ring radius
    const thickness = 2; // ring thickness in Z

    // 外环 (outer ring)
    for (let ix = -frameR; ix <= frameR; ix++) {
      for (let iy = -frameR; iy <= frameR; iy++) {
        const dist = Math.sqrt(ix * ix + iy * iy);
        if (dist >= frameR - 1 && dist <= frameR + 0.5) {
          for (let iz = -thickness; iz <= thickness; iz++) {
            pushBox(ix, iy, iz, 0);
          }
        }
        // 内环
        if (dist >= innerR - 0.5 && dist <= innerR + 1) {
          for (let iz = -thickness; iz <= thickness; iz++) {
            pushBox(ix, iy, iz, 0);
          }
        }
      }
    }

    // 绣布 (fabric inside inner ring, thin)
    for (let ix = -innerR + 1; ix <= innerR - 1; ix++) {
      for (let iy = -innerR + 1; iy <= innerR - 1; iy++) {
        const dist = Math.sqrt(ix * ix + iy * iy);
        if (dist <= innerR - 0.5) {
          for (let iz = -1; iz <= 1; iz++) {
            pushBox(ix, iy, iz, 1);
          }
        }
      }
    }

    // 刺绣花朵 (梅花图案 - 5 petals)
    const flowerCX = 0;
    const flowerCY = 1;
    // 花心
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -1; iy <= 1; iy++) {
        pushBox(flowerCX + ix, flowerCY + iy, 3, 3);
      }
    }
    // 5片花瓣
    for (let p = 0; p < 5; p++) {
      const angle = (p / 5) * Math.PI * 2 - Math.PI / 2;
      const px = Math.round(Math.cos(angle) * 3);
      const py = Math.round(Math.sin(angle) * 3);
      for (let ix = -2; ix <= 2; ix++) {
        for (let iy = -2; iy <= 2; iy++) {
          const dist = Math.sqrt(ix * ix + iy * iy);
          if (dist <= 2.0) {
            pushBox(flowerCX + px + ix, flowerCY + py + iy, 3, 2);
          }
        }
      }
    }

    // 叶子
    for (let iy = -3; iy <= -1; iy++) {
      for (let ix = -5 + Math.abs(iy + 2); ix <= -3 + Math.abs(iy + 2); ix++) {
        pushBox(ix, iy, 3, 3);
      }
    }
    for (let iy = -3; iy <= -1; iy++) {
      for (let ix = 3 + Math.abs(iy + 2); ix <= 5 + Math.abs(iy + 2); ix++) {
        pushBox(ix, iy, 3, 3);
      }
    }

    // 支架 (十字交叉底座)
    for (let ix = -3; ix <= 3; ix++) {
      for (let iz = -4; iz <= -3; iz++) {
        pushBox(ix, -frameR - 2, iz, 0);
      }
    }
    for (let iy = -frameR - 1; iy <= -frameR; iy++) {
      for (let iz = -4; iz <= -3; iz++) {
        pushBox(0, iy, iz, 0);
      }
    }
    // 底座横杆
    for (let ix = -6; ix <= 6; ix++) {
      for (let iy = -frameR - 5; iy <= -frameR - 3; iy++) {
        for (let iz = -4; iz <= -3; iz++) {
          if (Math.abs(ix) <= 7) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 绣花针 (diagonal needle)
    for (let t = 0; t <= 10; t++) {
      const nx = 4 + Math.round(t * 0.3);
      const ny = -3 + t;
      const nz = 3;
      pushBox(nx, ny, nz, 4);
    }
    // 针尖
    pushBox(7, 0, 3, 4);
    pushBox(8, 1, 3, 4);

    return b;
  }, []);

  const mats = [frameMat, fabricMat, flowerMat, leafMat, needleMat];

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={mats[block.mat]} attach="material" />
        </mesh>
      ))}
    </group>
  );
}

function ClayFigurineFigure({ color = '#14b8a6', pixelSize = 0.05 }: { color?: string; pixelSize?: number }) {
  const bs = 0.06;

  const clayMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#D2B48C');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const hairMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#1a1a1a');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const dudouMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color(color);
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [color, pixelSize]);

  const cheekMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#fca5a5');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const eyeMat = useMemo(() => {
    const mat = new PixelationMaterial();
    mat.uniforms.uColor.value = new THREE.Color('#000000');
    mat.uniforms.uPixelSize.value = pixelSize;
    return mat;
  }, [pixelSize]);

  const blocks = useMemo(() => {
    const b: { x: number; y: number; z: number; size: number; mat: number }[] = [];
    const pushBox = (ix: number, iy: number, iz: number, mat: number) => {
      b.push({ x: ix * bs, y: iy * bs, z: iz * bs, size: bs, mat });
    };
    // 0=clay, 1=hair, 2=dudou, 3=cheek, 4=eye

    // 头部 (large sphere, 泥人特征:大头)
    for (let ix = -5; ix <= 5; ix++) {
      for (let iy = -1; iy <= 9; iy++) {
        for (let iz = -4; iz <= 4; iz++) {
          const dx = ix / 5.5;
          const dy = (iy - 4) / 5;
          const dz = iz / 4.5;
          if (dx * dx + dy * dy + dz * dz <= 1.0) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 左发髻 (hair bun)
    for (let ix = -7; ix <= -4; ix++) {
      for (let iy = 8; iy <= 11; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          const dx = (ix + 5.5) / 2.5;
          const dy = (iy - 9.5) / 2;
          const dz = iz / 2.5;
          if (dx * dx + dy * dy + dz * dz <= 1.0) pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 右发髻
    for (let ix = 4; ix <= 7; ix++) {
      for (let iy = 8; iy <= 11; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          const dx = (ix - 5.5) / 2.5;
          const dy = (iy - 9.5) / 2;
          const dz = iz / 2.5;
          if (dx * dx + dy * dy + dz * dz <= 1.0) pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 刘海 (bangs)
    for (let ix = -3; ix <= 3; ix++) {
      for (let iy = 8; iy <= 9; iy++) {
        for (let iz = -3; iz <= -1; iz++) {
          pushBox(ix, iy, iz, 1);
        }
      }
    }

    // 眼睛
    pushBox(-2, 5, 5, 4);
    pushBox(2, 5, 5, 4);
    // 瞳孔高光
    pushBox(-2, 5, 6, 0);
    pushBox(2, 5, 6, 0);

    // 红脸颊
    for (let ix = -2; ix <= -1; ix++) {
      for (let iy = 3; iy <= 4; iy++) {
        pushBox(ix, iy, 5, 3);
      }
    }
    for (let ix = 1; ix <= 2; ix++) {
      for (let iy = 3; iy <= 4; iy++) {
        pushBox(ix, iy, 5, 3);
      }
    }

    // 小嘴
    pushBox(0, 2, 5, 4);

    // 身体 (round, chubby, smaller than head)
    for (let ix = -4; ix <= 4; ix++) {
      for (let iy = -8; iy <= -1; iy++) {
        for (let iz = -3; iz <= 3; iz++) {
          const dx = ix / 4.5;
          const dy = (iy + 4.5) / 4;
          const dz = iz / 3.5;
          if (dx * dx + dy * dy + dz * dz <= 1.0) pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 肚兜 (red dudou on front of body)
    for (let ix = -2; ix <= 2; ix++) {
      for (let iy = -6; iy <= -2; iy++) {
        for (let iz = -4; iz <= -2; iz++) {
          pushBox(ix, iy, iz, 2);
        }
      }
    }
    // 肚兜菱形装饰
    for (let ix = -1; ix <= 1; ix++) {
      for (let iy = -5; iy <= -4; iy++) {
        pushBox(ix, iy, -5, 0);
      }
    }

    // 左臂 (short, stubby)
    for (let ix = -7; ix <= -5; ix++) {
      for (let iy = -6; iy <= -4; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 左手
    for (let ix = -8; ix <= -7; ix++) {
      for (let iy = -6; iy <= -5; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 右臂
    for (let ix = 5; ix <= 7; ix++) {
      for (let iy = -6; iy <= -4; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 右手
    for (let ix = 7; ix <= 8; ix++) {
      for (let iy = -6; iy <= -5; iy++) {
        for (let iz = -1; iz <= 1; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 左腿
    for (let ix = -2; ix <= -1; ix++) {
      for (let iy = -11; iy <= -9; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 左脚
    for (let ix = -3; ix <= 0; ix++) {
      for (let iy = -12; iy <= -11; iy++) {
        for (let iz = -1; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }

    // 右腿
    for (let ix = 1; ix <= 2; ix++) {
      for (let iy = -11; iy <= -9; iy++) {
        for (let iz = -2; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }
    // 右脚
    for (let ix = 0; ix <= 3; ix++) {
      for (let iy = -12; iy <= -11; iy++) {
        for (let iz = -1; iz <= 2; iz++) {
          pushBox(ix, iy, iz, 0);
        }
      }
    }

    return b;
  }, []);

  const mats = [clayMat, hairMat, dudouMat, cheekMat, eyeMat];

  return (
    <group position={[0, 1.2, 0]}>
      {blocks.map((block, i) => (
        <mesh key={i} position={[block.x, block.y, block.z]}>
          <boxGeometry args={[block.size, block.size, block.size]} />
          <primitive object={mats[block.mat]} attach="material" />
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
  // @react-three/postprocessing 与 @types/react 类型兼容处理
  const FX: any = EffectComposer;
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
      <FX>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          height={300}
          intensity={0.5}
        />
      </FX>
      </Canvas>
    </div>
  );
}
