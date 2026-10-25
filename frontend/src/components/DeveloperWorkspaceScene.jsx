import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound } from '../utils/soundEffects';
import {
  createProjectsScreenTexture,
  createWelcomeScreenTexture,
  createTechStackScreenTexture,
} from './workspaceScreenTextures';

export const workspaceProjects = [
  // Page 1: Verified Live Deployed Production Applications (Arranged First)
  {
    id: 'dayflow',
    title: 'DayFlow',
    subtitle: 'HRMS • Workforce',
    tag: '[01]',
    category: 'HRMS & WORKFORCE',
    repo: 'Charan-718/Day-Flow',
    liveUrl: 'https://day-flow-six.vercel.app/',
    thumbnail: '/thumbnails/dayflow.jpg',
    accentColor: '#FF1E27',
  },
  {
    id: 'sahakarya',
    title: 'Sahakárya',
    subtitle: 'Cooperative Gig Services',
    tag: '[02]',
    category: 'COOPERATIVE GIG SERVICES',
    repo: 'Kouhsik33/Cooperative-Gig-Services-Platform',
    liveUrl: 'https://sahakarya.vercel.app/',
    thumbnail: '/thumbnails/sahakarya.jpg',
    accentColor: '#F59E0B',
  },
  {
    id: 'traveloop',
    title: 'Traveloop',
    subtitle: 'AI Travel Planning',
    tag: '[03]',
    category: 'AI TRAVEL ENGINE',
    repo: 'mounikakorrakuti1/traveloop',
    liveUrl: 'https://traveloop-plum.vercel.app/',
    thumbnail: '/thumbnails/traveloop.jpg',
    accentColor: '#3B82F6',
  },
  {
    id: 'freshmart',
    title: 'FreshMart',
    subtitle: 'Full-Stack E-Commerce',
    tag: '[04]',
    category: 'FULL-STACK E-COMMERCE',
    repo: 'Charan-718/freshmart-fsd',
    liveUrl: 'https://freshmart-fsd.netlify.app/',
    thumbnail: '/thumbnails/freshmart.png',
    accentColor: '#22C55E',
  },
  {
    id: 'greenova',
    title: 'Greenova',
    subtitle: 'Sustainability & Clean-Tech',
    tag: '[05]',
    category: 'SUSTAINABILITY & CLEAN-TECH',
    repo: 'Charan-718/greenova-csp',
    liveUrl: 'https://greenova-csp.netlify.app',
    thumbnail: '/thumbnails/greenova.png',
    accentColor: '#10B981',
  },
  {
    id: 'medireport',
    title: 'MediReport',
    subtitle: 'Healthcare Clinical AI',
    tag: '[06]',
    category: 'HEALTHCARE DIAGNOSTICS AI',
    repo: 'Charan-718/medi-report',
    liveUrl: 'https://medi-report.netlify.app',
    thumbnail: '/thumbnails/medireport.png',
    accentColor: '#06B6D4',
  },

  // Page 2: Additional Verified Production Applications & High-Tech Demos
  {
    id: 'furnexa',
    title: 'Furnexa',
    subtitle: 'Logistics & Mini-ERP',
    tag: '[07]',
    category: 'LOGISTICS & MINI-ERP',
    repo: 'Charan-718/mini-erp-furnexa',
    liveUrl: 'https://mini-erp-furnexa.netlify.app',
    thumbnail: '/thumbnails/furnexa.png',
    accentColor: '#F59E0B',
  },
  {
    id: 'learnloop',
    title: 'LearnLoop',
    subtitle: 'Interactive Learning Platform',
    tag: '[08]',
    category: 'INTERACTIVE LEARNING',
    repo: 'Charan-718/LearnLoop',
    liveUrl: 'https://charan-718.github.io/LearnLoop/',
    thumbnail: '/thumbnails/learnloop.png',
    accentColor: '#8B5CF6',
  },
  {
    id: 'quantumcodehub',
    title: 'QuantumCodeHub',
    subtitle: 'Quantum Computing • AI',
    tag: '[09]',
    category: 'QUANTUM COMPUTING • AI',
    repo: 'Charan-718/QuantumCodeHub',
    liveUrl: 'https://charan-718.github.io/Quantum-Keydistribution/',
    thumbnail: '/thumbnails/quantumcodehub.jpg',
    accentColor: '#38BDF8',
  },
  {
    id: 'twinaero',
    title: 'TwinAero',
    subtitle: 'Digital Twin • Aerospace',
    tag: '[10]',
    category: 'DIGITAL TWIN • AEROSPACE',
    repo: 'Charan-718/TwinAreo',
    liveUrl: 'https://charan-718.github.io/Extinct-Era/dino_landing_page.html',
    thumbnail: '/thumbnails/twinaero.jpg',
    accentColor: '#FF4D55',
  },
  {
    id: 'aqvh',
    title: 'AQVH',
    subtitle: 'Quantum AI • Stock Prediction',
    tag: '[11]',
    category: 'QUANTUM AI • STOCK PREDICTION',
    repo: 'Charan-718',
    liveUrl: 'https://charan-718.github.io/Schrodinger-Cat/',
    thumbnail: '/thumbnails/aqvh.jpg',
    accentColor: '#22C55E',
  },
];

// =============================================================================
// MICRO-DETAIL 1: ATMOSPHERIC CYBER EMBER PARTICLES (VOLUMETRIC DECK ATMOSPHERE)
// =============================================================================
function CyberAtmosphericMotes({ count = 90 }) {
  const motesRef = useRef();
  const [positions, phases] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 22; // X: -11 to 11
      pos[i * 3 + 1] = 0.5 + Math.random() * 5.6; // Y: 0.5 to 6.1
      pos[i * 3 + 2] = -3 + Math.random() * 15; // Z: -3 to 12
      ph[i] = Math.random() * Math.PI * 2;
    }
    return [pos, ph];
  }, [count]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame((state) => {
    if (!motesRef.current) return;
    const t = state.clock.getElapsedTime();
    const posAttr = motesRef.current.geometry.attributes.position;
    const arr = posAttr.array;
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      arr[idx + 1] += Math.sin(t * 1.2 + phases[i]) * 0.0025;
      arr[idx] += Math.cos(t * 0.7 + phases[i]) * 0.0018;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={motesRef} geometry={geom}>
      <pointsMaterial
        size={0.08}
        color="#FF3B44"
        transparent
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

// =============================================================================
// MICRO-DETAIL 2: FLOOR LASER CONDUITS & PULSING DATA PACKETS
// =============================================================================
function CyberFloorConduits() {
  const packetRef = useRef();

  useFrame((state) => {
    if (packetRef.current) {
      const p = (state.clock.getElapsedTime() * 0.45) % 1.0;
      // Animate packet along path toward projects screen [0, 4.2] -> [0, 9.8]
      packetRef.current.position.z = 4.2 + p * 5.6;
    }
  });

  return (
    <group position={[0, 0.004, 0]}>
      {/* 1. Pedestal to Featured Projects Screen */}
      <mesh position={[0, 0, 7.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.04, 5.6]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.65} side={THREE.DoubleSide} />
      </mesh>
      {/* Traveling Data Packet */}
      <mesh ref={packetRef} position={[0, 0.006, 7.0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* 2. Pedestal to Tech Stack Screen */}
      <mesh position={[3.8, 0, 5.6]} rotation={[-Math.PI / 2, 0, -0.62]}>
        <planeGeometry args={[0.04, 7.6]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.45} side={THREE.DoubleSide} />
      </mesh>


      {/* 4. Pedestal to Cyber Pylon */}
      <mesh position={[-2.6, 0, 3.8]} rotation={[-Math.PI / 2, 0, 1.72]}>
        <planeGeometry args={[0.04, 5.2]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// =============================================================================
// MICRO-DETAIL 3: HIGH-TECH CYBER COMMAND DATA PYLON & QUANTUM POWER COLUMN
// Replaces the green potted plant with a sleek sci-fi terminal matching the crimson palette
// =============================================================================
function CyberCommandPylon({ onInteract }) {
  const coreRef = useRef();
  const ringARef = useRef();
  const ringBRef = useRef();
  const [pulse, setPulse] = useState(false);

  useFrame((state, delta) => {
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 1.5;
      coreRef.current.rotation.x += delta * 0.7;
      coreRef.current.position.y = 1.05 + Math.sin(state.clock.getElapsedTime() * 2.8) * 0.035;
    }
    if (ringARef.current) {
      ringARef.current.rotation.z += delta * 1.8;
      ringARef.current.rotation.x += delta * 0.9;
    }
    if (ringBRef.current) {
      ringBRef.current.rotation.z -= delta * 1.5;
      ringBRef.current.rotation.y += delta * 1.1;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    playClickSound('hologram');
    setPulse(true);
    setTimeout(() => setPulse(false), 900);
    if (onInteract) onInteract();
  };

  return (
    <group
      position={[-5.2, 0, 3.4]}
      rotation={[0, 0.45, 0]}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Heavy Octagonal High-Tech Base Chassis */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.16, 8]} />
        <meshStandardMaterial color="#0c0e14" roughness={0.25} metalness={0.9} />
      </mesh>

      {/* Glowing Red Floor Base Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <ringGeometry args={[0.66, 0.72, 32]} />
        <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
      </mesh>

      {/* Interactive Floor Shockwave Ripple when clicked */}
      {pulse && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[0.7, 1.4, 32]} />
          <meshBasicMaterial
            color="#FF3B44"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}

      {/* Lower Pillar with Heat-Sink Slots */}
      <mesh position={[0, 0.38, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.42, 0.52, 0.44, 24]} />
        <meshStandardMaterial color="#10131d" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* 4 Red Heatsink LED Strips */}
      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh key={i} position={[Math.sin(rad) * 0.44, 0.38, Math.cos(rad) * 0.44]} rotation={[0, -rad, 0]}>
            <boxGeometry args={[0.04, 0.32, 0.03]} />
            <meshBasicMaterial color="#FF1E27" />
          </mesh>
        );
      })}

      {/* Middle Telemetry Collar & Status Indicator */}
      <mesh position={[0, 0.64, 0]}>
        <cylinderGeometry args={[0.46, 0.46, 0.08, 24]} />
        <meshStandardMaterial color="#090a10" roughness={0.2} metalness={0.92} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.68, 0]}>
        <ringGeometry args={[0.42, 0.45, 32]} />
        <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
      </mesh>

      {/* High-Tech Transparent Containment Chamber Glass */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.72, 24, 1, true]} />
        <meshStandardMaterial
          color="#0b101c"
          roughness={0.1}
          metalness={0.95}
          transparent
          opacity={0.32}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Chamber Vertical Support Struts */}
      {[0, 120, 240].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        return (
          <mesh key={`strut-${i}`} position={[Math.sin(rad) * 0.38, 1.05, Math.cos(rad) * 0.38]}>
            <boxGeometry args={[0.035, 0.72, 0.035]} />
            <meshStandardMaterial color="#161926" roughness={0.3} metalness={0.88} />
          </mesh>
        );
      })}

      {/* Floating Rotating Faceted Quantum Core */}
      <group ref={coreRef} position={[0, 1.05, 0]}>
        <mesh>
          <octahedronGeometry args={[0.22, 1]} />
          <meshBasicMaterial color="#FF1E27" wireframe transparent opacity={0.85} blending={THREE.AdditiveBlending} />
        </mesh>
        <mesh>
          <octahedronGeometry args={[0.14, 0]} />
          <meshBasicMaterial color="#FFA3A7" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>

      {/* Counter-Rotating Holographic Rings inside chamber */}
      <mesh ref={ringARef} position={[0, 1.05, 0]}>
        <ringGeometry args={[0.26, 0.28, 32]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.7} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={ringBRef} position={[0, 1.05, 0]} rotation={[0.6, 0, 0.4]}>
        <ringGeometry args={[0.3, 0.32, 32]} />
        <meshBasicMaterial color="#FF5259" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Chamber Upper Cap & Projector Aperture */}
      <mesh position={[0, 1.45, 0]}>
        <cylinderGeometry args={[0.42, 0.44, 0.08, 24]} />
        <meshStandardMaterial color="#090a10" roughness={0.2} metalness={0.92} />
      </mesh>
      <mesh position={[0, 1.54, 0]}>
        <cylinderGeometry args={[0.18, 0.26, 0.1, 16]} />
        <meshStandardMaterial color="#151824" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Top Beacon Glow */}
      <mesh position={[0, 1.62, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#FF1E27" />
      </mesh>

      {/* Subtle Upward Holographic Laser Stream */}
      <mesh position={[0, 3.2, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 3.2, 16, 1, true]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.15} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>

      {/* Status Screen Telemetry Plate on Front */}
      <group position={[0, 0.65, 0.47]} rotation={[-0.3, 0, 0]}>
        <mesh>
          <planeGeometry args={[0.44, 0.22]} />
          <meshBasicMaterial color="#0b0d14" />
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[0.42, 0.2]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.2} blending={THREE.AdditiveBlending} />
        </mesh>
        {/* Tiny Status LEDs */}
        {[-0.14, 0, 0.14].map((lx, li) => (
          <mesh key={li} position={[lx, 0.05, 0.01]}>
            <circleGeometry args={[0.018, 12]} />
            <meshBasicMaterial color={li === 0 ? '#FF1E27' : '#FFFFFF'} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

export default function DeveloperWorkspaceScene({ onClose }) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [, setTick] = useState(0);

  // Horizontal scroll momentum and dragging state for Projects display screen
  const targetScrollX = useRef(0);
  const currentScrollX = useRef(0);
  const isDraggingProjects = useRef(false);
  const dragStartX = useRef(0);
  const dragStartScrollX = useRef(0);
  const hasDraggedFar = useRef(false);

  // Central Hologram State: 0 = Planetary Net, 1 = Quantum Tesseract, 2 = AI Neural Core
  const [holoMode, setHoloMode] = useState(0);
  const [strobeState, setStrobeState] = useState(false);

  // References for animated 3D elements
  const globeRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();
  const tesseractOuterRef = useRef();
  const tesseractInnerRef = useRef();
  const neuralCoreRef = useRef();
  const beaconRef = useRef();

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // 1. Central Hologram Multimode Animations (Lowered to ensure main banner is 100% visible)
    if (holoMode === 0) {
      if (globeRef.current) {
        globeRef.current.rotation.y += delta * 0.45;
        globeRef.current.position.y = 0.36 + Math.sin(t * 1.8) * 0.03;
      }
    } else if (holoMode === 1) {
      if (tesseractOuterRef.current) {
        tesseractOuterRef.current.rotation.y += delta * 0.7;
        tesseractOuterRef.current.rotation.x += delta * 0.4;
      }
      if (tesseractInnerRef.current) {
        tesseractInnerRef.current.rotation.y -= delta * 0.9;
        tesseractInnerRef.current.rotation.z += delta * 0.5;
      }
    } else if (holoMode === 2) {
      if (neuralCoreRef.current) {
        neuralCoreRef.current.rotation.y += delta * 0.6;
        neuralCoreRef.current.position.y = 0.36 + Math.sin(t * 2.2) * 0.03;
      }
    }

    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.35;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z += delta * 0.28;
      ringRef2.current.rotation.y += delta * 0.25;
    }

    // 2. Dome Ceiling Central Star Beacon Pulse
    if (beaconRef.current) {
      const s = 1.0 + Math.sin(t * 2.5) * 0.12;
      beaconRef.current.scale.set(s, s, s);
    }

    // 3. Radial Truss Navigation Strobes
    const isStrobe = Math.floor(t * 1.5) % 3 === 0;
    if (isStrobe !== strobeState) {
      setStrobeState(isStrobe);
    }

    // 4. Smooth Horizontal Swipe / Momentum Scroll for Projects Screen
    if (projectsTextureObj && projectsTextureObj.setScrollX) {
      const diff = targetScrollX.current - currentScrollX.current;
      if (Math.abs(diff) > 0.4) {
        currentScrollX.current += diff * Math.min(1, delta * 14);
        projectsTextureObj.setScrollX(currentScrollX.current);
      }
    }
  });

  const handlePedestalClick = (e) => {
    e.stopPropagation();
    playClickSound('hologram');
    setHoloMode((m) => (m + 1) % 3);
  };

  // 100% WebGL Canvas Textures for physical 3D screens (zero DOM overlays, perfect depth buffer occlusion)
  const projectsTextureObj = useMemo(() => {
    return createProjectsScreenTexture(0, workspaceProjects, publicUrl, () => {
      setTick((t) => t + 1);
    });
  }, [publicUrl]);

  const welcomeTextureObj = useMemo(() => {
    return createWelcomeScreenTexture();
  }, []);

  const techStackTextureObj = useMemo(() => {
    return createTechStackScreenTexture();
  }, []);

  // Celestial deep-space starfield visible through the high panoramic glass clerestory (Matching Image 2)
  const starsGeometry = useMemo(() => {
    const count = 450;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = 0.15 + Math.random() * 0.95; // In the upper dome
      const r = 26 + Math.random() * 10;
      positions[i * 3] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 1] = 6.0 + r * Math.cos(phi);
      positions[i * 3 + 2] = 4.2 + r * Math.sin(phi) * Math.cos(theta);
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geom;
  }, []);

  // Cleanup WebGL textures and geometries on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      projectsTextureObj?.texture?.dispose();
      welcomeTextureObj?.texture?.dispose();
      techStackTextureObj?.texture?.dispose();
      starsGeometry?.dispose();
    };
  }, [projectsTextureObj, welcomeTextureObj, techStackTextureObj, starsGeometry]);

  // Horizontal Swipe & Drag Interactions for Main Projects Screen
  const handleProjectsPointerDown = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    isDraggingProjects.current = true;
    dragStartX.current = e.uv.x;
    dragStartScrollX.current = targetScrollX.current;
    hasDraggedFar.current = false;
  };

  const handleProjectsPointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;

    if (isDraggingProjects.current) {
      // Invert delta: dragging pointer left (smaller uv.x) reveals cards to the right (higher scrollX)
      const deltaX = (dragStartX.current - e.uv.x) * 2048;
      if (Math.abs(deltaX) > 8) {
        hasDraggedFar.current = true;
      }
      const maxScroll = projectsTextureObj?.getMaxScrollX ? projectsTextureObj.getMaxScrollX() : 1994;
      targetScrollX.current = Math.max(0, Math.min(maxScroll, dragStartScrollX.current + deltaX));
      document.body.style.cursor = 'grabbing';
      return;
    }

    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;

    let isClickable = false;
    // Bottom controls: ‹ PREV (674..834), VIEW ALL PROJECTS → (874..1174), NEXT › (1214..1374)
    if (canvasY >= 960 && canvasY <= 1024) {
      if ((canvasX >= 674 && canvasX <= 834) || (canvasX >= 874 && canvasX <= 1174) || (canvasX >= 1214 && canvasX <= 1374)) {
        isClickable = true;
      }
    } else if (canvasY >= 170 && canvasY <= 940) {
      const curX = currentScrollX.current;
      const cardW = 590;
      const cardH = 360;
      const colGap = 44;
      const rowGap = 34;
      for (let i = 0; i < workspaceProjects.length; i++) {
        const page = Math.floor(i / 6);
        const idxInPage = i % 6;
        const col = idxInPage % 3;
        const row = Math.floor(idxInPage / 3);
        const cardX = page * 2048 + 95 + col * (cardW + colGap) - curX;
        const cardY = 176 + row * (cardH + rowGap);
        if (canvasX >= cardX && canvasX <= cardX + cardW && canvasY >= cardY && canvasY <= cardY + cardH) {
          isClickable = true;
          break;
        }
      }
    }

    document.body.style.cursor = isClickable ? 'pointer' : 'grab';
  };

  const handleProjectsPointerUp = (e) => {
    e.stopPropagation();
    isDraggingProjects.current = false;
    document.body.style.cursor = 'auto';
  };

  const handleProjectsPointerOut = () => {
    isDraggingProjects.current = false;
    document.body.style.cursor = 'auto';
  };

  const handleProjectsWheel = (e) => {
    e.stopPropagation();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    const maxScroll = projectsTextureObj?.getMaxScrollX ? projectsTextureObj.getMaxScrollX() : 2048;
    targetScrollX.current = Math.max(0, Math.min(maxScroll, targetScrollX.current + delta * 1.5));
  };

  const handleProjectsClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    if (hasDraggedFar.current) {
      hasDraggedFar.current = false;
      return;
    }

    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;
    const maxScroll = projectsTextureObj?.getMaxScrollX ? projectsTextureObj.getMaxScrollX() : 2048;

    // Bottom action controls
    if (canvasY >= 960 && canvasY <= 1024) {
      // ‹ PREV button
      if (canvasX >= 674 && canvasX <= 834) {
        playClickSound('switch');
        targetScrollX.current = Math.max(0, targetScrollX.current - 2048);
        return;
      }
      // VIEW ALL PROJECTS → button
      if (canvasX >= 874 && canvasX <= 1174) {
        playClickSound('click');
        if (onClose) onClose();
        setTimeout(() => {
          const el = document.getElementById('projects');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }
      // NEXT › button
      if (canvasX >= 1214 && canvasX <= 1374) {
        playClickSound('switch');
        targetScrollX.current = Math.min(maxScroll, targetScrollX.current + 2048);
        return;
      }
    }

    // Project cards click handling
    const curX = currentScrollX.current;
    const cardW = 590;
    const cardH = 360;
    const colGap = 44;
    const rowGap = 34;

    for (let i = 0; i < workspaceProjects.length; i++) {
      const page = Math.floor(i / 6);
      const idxInPage = i % 6;
      const col = idxInPage % 3;
      const row = Math.floor(idxInPage / 3);
      const cardX = page * 2048 + 95 + col * (cardW + colGap) - curX;
      const cardY = 176 + row * (cardH + rowGap);

      if (canvasX >= cardX && canvasX <= cardX + cardW && canvasY >= cardY && canvasY <= cardY + cardH) {
        const proj = workspaceProjects[i];
        playClickSound('click');
        window.open(proj.liveUrl || `https://github.com/${proj.repo}`, '_blank', 'noopener,noreferrer');
        return;
      }
    }
  };

  const handleWelcomeClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 880;

    // Direct GitHub profile handle pill in header (x: 630..950, y: 140..178)
    if (canvasX >= 630 && canvasX <= 950 && canvasY >= 140 && canvasY <= 178) {
      playClickSound('click');
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
      return;
    }

    // Stat card 1: GitHub Profile & 32 Public Repositories (x: 40..490, y: 340..550)
    if (canvasX >= 40 && canvasX <= 490 && canvasY >= 340 && canvasY <= 550) {
      playClickSound('click');
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
      return;
    }

    // Stat card 2: Live Production Deployments (x: 534..984, y: 340..550)
    if (canvasX >= 534 && canvasX <= 984 && canvasY >= 340 && canvasY <= 550) {
      playClickSound('click');
      window.open('https://github.com/Charan-718?tab=repositories', '_blank', 'noopener,noreferrer');
      return;
    }

    // System Matrix specs box (x: 40..984, y: 565..825)
    if (canvasX >= 40 && canvasX <= 984 && canvasY >= 565 && canvasY <= 825) {
      playClickSound('click');
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const handleWelcomePointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 880;
    const isClickable =
      (canvasX >= 630 && canvasX <= 950 && canvasY >= 140 && canvasY <= 178) ||
      (canvasY >= 340 && canvasY <= 550 && ((canvasX >= 40 && canvasX <= 490) || (canvasX >= 534 && canvasX <= 984))) ||
      (canvasX >= 40 && canvasX <= 984 && canvasY >= 565 && canvasY <= 825);
    document.body.style.cursor = isClickable ? 'pointer' : 'auto';
  };

  return (
    <group name="DeveloperWorkspaceEnvironment">
      {/* =========================================================================
          1. LIGHTING SETUP — HIGH CLARITY STUDIO & BALANCED DIFFUSE ILLUMINATION
             Ensures the 3D character and environment are clearly visible, with crisp
             clothing folds, natural skin tones, and rich contrast without any metallic glare.
         ========================================================================= */}
      {/* Pure Diffuse Ambient Light (Evenly illuminates textures with clean, natural matte finish) */}
      <ambientLight intensity={1.45} color="#ffffff" />

      {/* Soft Natural Hemisphere Fill (Gentle vertical gradient from ceiling to floor) */}
      <hemisphereLight skyColor="#ffffff" groundColor="#222222" intensity={0.65} />

      {/* Single Soft Overhead Directional Key Light (Provides natural gravity shadows) */}
      <directionalLight
        position={[0, 8, 3]}
        intensity={1.05}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Gentle Camera-Side Fill Light (Ensures character back is clearly visible without specular glare) */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={0.55}
        color="#ffffff"
      />

      {/* Soft Environmental Neon Accents (Localized to the pedestal, screens, and furniture) */}
      {/* Red Volumetric Glow over Center Hologram Pedestal */}
      <pointLight position={[0, 1.8, 4.2]} intensity={2.5} distance={6} color="#FF1E27" decay={2} />

      {/* Red Floor Uplight under Projects Screen */}
      <pointLight position={[0, 0.5, 8.5]} intensity={1.8} distance={5} color="#FF1E27" decay={2} />


      {/* Lounge Accent Lamp */}
      <pointLight position={[4.2, 0.8, 2.0]} intensity={1.4} distance={3.0} color="#FF3B44" decay={2} />

      {/* =========================================================================
          2. ENVIRONMENT FLOOR & PLATFORM (REFLECTIVE CARBON WITH CONCENTRIC RINGS)
         ========================================================================= */}
      {/* Primary Circular Stage Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 4]} receiveShadow>
        <circleGeometry args={[14.5, 64]} />
        <meshStandardMaterial
          color="#0c0e14"
          roughness={0.22}
          metalness={0.78}
          envMapIntensity={0.8}
        />
      </mesh>

      {/* Outer Ground Plane for Horizon */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]} receiveShadow>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#050608" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Floor Grid Pattern */}
      <gridHelper
        args={[29, 29, '#FF1E27', '#1a1d2e']}
        position={[0, 0.002, 4]}
      />

      {/* Concentric Glowing Red Neon Floor Rings (Matching Images 1 & 2) */}
      {/* Central Pedestal Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4.2]}>
        <ringGeometry args={[1.5, 1.58, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4.2]}>
        <ringGeometry args={[2.4, 2.45, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Mid Character Perimeter Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[5.8, 5.88, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Outer Workspace Platform Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[10.5, 10.62, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.75} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 4]}>
        <ringGeometry args={[14.2, 14.38, 64]} />
        <meshBasicMaterial color="#FF1E27" transparent opacity={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Radial Neon Light Tracks */}
      {[-0.6, -0.2, 0.2, 0.6].map((angle, idx) => (
        <mesh
          key={idx}
          rotation={[-Math.PI / 2, 0, angle]}
          position={[Math.sin(angle) * 7.5, 0.003, 4 + Math.cos(angle) * 3.5]}
        >
          <planeGeometry args={[0.06, 6]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.45} />
        </mesh>
      ))}

      {/* =========================================================================
          3. CENTER HOLOGRAPHIC DISPLAY & PEDESTAL (INTERACTIVE CLICK TO CYCLE MODES)
         ========================================================================= */}
      <group
        position={[0, 0, 4.2]}
        onClick={handlePedestalClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {/* Tiered Technological Pedestal Base */}
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.2, 1.45, 0.24, 32]} />
          <meshStandardMaterial color="#11131a" metalness={0.85} roughness={0.25} />
        </mesh>

        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.9, 1.15, 0.14, 32]} />
          <meshStandardMaterial color="#171922" metalness={0.9} roughness={0.2} />
        </mesh>

        {/* Glowing Red Emitter Ring on Pedestal */}
        <mesh position={[0, 0.36, 0]}>
          <cylinderGeometry args={[0.75, 0.85, 0.04, 32]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* Projector Cone Glass Rim */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.6, 0.72, 0.08, 32]} />
          <meshStandardMaterial color="#000000" metalness={0.95} roughness={0.1} />
        </mesh>

        {/* Upward Hologram Beam (Compact low-profile beam) */}
        <mesh position={[0, 0.46, 0]}>
          <cylinderGeometry args={[0.42, 0.32, 0.28, 32, 1, true]} />
          <meshBasicMaterial
            color="#FF1E27"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Multi-Mode 3D Holographic System (Positioned low so main screen is 100% visible) */}
        <group position={[0, 0.46, 0]}>
          {/* Mode 0: Global Planetary Network */}
          {holoMode === 0 && (
            <group ref={globeRef}>
              <mesh>
                <sphereGeometry args={[0.34, 20, 20]} />
                <meshBasicMaterial
                  color="#FF1E27"
                  wireframe
                  transparent
                  opacity={0.7}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.14, 16, 16]} />
                <meshBasicMaterial
                  color="#FF5259"
                  transparent
                  opacity={0.85}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
              {[0, 120, 240].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                return (
                  <mesh key={i} position={[Math.sin(rad) * 0.48, Math.sin(rad * 2) * 0.14, Math.cos(rad) * 0.48]}>
                    <sphereGeometry args={[0.024, 8, 8]} />
                    <meshBasicMaterial color="#FFFFFF" />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Mode 1: Quantum Tesseract (4D Hypercube) */}
          {holoMode === 1 && (
            <group>
              <mesh ref={tesseractOuterRef}>
                <boxGeometry args={[0.76, 0.76, 0.76]} />
                <meshBasicMaterial color="#FF1E27" wireframe transparent opacity={0.8} blending={THREE.AdditiveBlending} />
              </mesh>
              <mesh ref={tesseractInnerRef}>
                <boxGeometry args={[0.42, 0.42, 0.42]} />
                <meshBasicMaterial color="#FFFFFF" wireframe transparent opacity={0.9} blending={THREE.AdditiveBlending} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.15, 16, 16]} />
                <meshBasicMaterial color="#FF3B44" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
              </mesh>
            </group>
          )}

          {/* Mode 2: AI Neural Cluster & Synaptic Network */}
          {holoMode === 2 && (
            <group ref={neuralCoreRef}>
              <mesh>
                <octahedronGeometry args={[0.28, 1]} />
                <meshBasicMaterial color="#FF1E27" wireframe transparent opacity={0.9} blending={THREE.AdditiveBlending} />
              </mesh>
              <mesh>
                <sphereGeometry args={[0.16, 16, 16]} />
                <meshBasicMaterial color="#FFFFFF" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
              </mesh>
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
                const rad = (deg * Math.PI) / 180;
                const r = 0.65;
                return (
                  <mesh key={i} position={[Math.cos(rad) * r, Math.sin(rad * 3) * 0.24, Math.sin(rad) * r]}>
                    <sphereGeometry args={[0.032, 8, 8]} />
                    <meshBasicMaterial color={i % 2 === 0 ? '#FF3B44' : '#38BDF8'} />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Universal Rotating Holographic Orbital Rings */}
          <mesh ref={ringRef1} rotation={[0.4, 0.2, 0]}>
            <ringGeometry args={[0.72, 0.75, 48]} />
            <meshBasicMaterial
              color="#FF1E27"
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
          <mesh ref={ringRef2} rotation={[-0.5, 0.4, 0.3]}>
            <ringGeometry args={[0.82, 0.85, 48]} />
            <meshBasicMaterial
              color="#FF6B72"
              transparent
              opacity={0.65}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        </group>
      </group>

      {/* =========================================================================
          4. OVERHEAD CEILING LIGHTING RIG & CIRCULAR ROOF TRUSS
         ========================================================================= */}
      <group position={[0, 6.2, 4]}>
        {/* Large Outer Structural Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[13.2, 0.28, 16, 64]} />
          <meshStandardMaterial color="#161820" metalness={0.85} roughness={0.3} />
        </mesh>

        {/* Glowing Red Neon Ring Underneath */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
          <torusGeometry args={[13.1, 0.08, 16, 64]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* Inner Secondary Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
          <torusGeometry args={[6.5, 0.14, 16, 48]} />
          <meshStandardMaterial color="#181a24" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
          <torusGeometry args={[6.45, 0.05, 16, 48]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.7} />
        </mesh>

        {/* Radial Truss Spoke Beams */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.sin(rad) * 9.8, 0, Math.cos(rad) * 9.8]}
              rotation={[0, -rad, 0]}
            >
              <boxGeometry args={[0.2, 0.25, 6.5]} />
              <meshStandardMaterial color="#12141c" metalness={0.8} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* =========================================================================
          5. PERIMETER CYBER WALLS & PANORAMIC CITY SKYLINE
         ========================================================================= */}
      <group position={[0, 3.2, 4]}>
        {/* Curved Back Glass Wall */}
        <mesh>
          <cylinderGeometry args={[14.6, 14.6, 7.5, 48, 1, true, 0, Math.PI * 2]} />
          <meshStandardMaterial
            color="#07080c"
            metalness={0.92}
            roughness={0.15}
            transparent
            opacity={0.88}
            side={THREE.BackSide}
          />
        </mesh>

        {/* Vertical Structural Columns with Red Neon Grooves */}
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const x = Math.sin(rad) * 14.5;
          const z = Math.cos(rad) * 14.5;
          return (
            <group key={i} position={[x, 0, z]} rotation={[0, -rad, 0]}>
              <mesh>
                <boxGeometry args={[0.45, 7.5, 0.45]} />
                <meshStandardMaterial color="#11131a" metalness={0.8} roughness={0.3} />
              </mesh>
              {/* Neon Strip */}
              <mesh position={[0, 0, -0.23]}>
                <boxGeometry args={[0.06, 7.2, 0.02]} />
                <meshBasicMaterial color="#FF1E27" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* =========================================================================
          6. INTERIOR LOUNGE CORNER & DEVELOPER ACCENTS (MATCHING IMAGE 1)
         ========================================================================= */}
      {/* Modern Lounge Area on Right Side */}
      <group position={[4.5, 0, 2.2]} rotation={[0, -0.65, 0]}>
        {/* Soft Dark Leather Lounge Beanbag / Chair */}
        <mesh position={[0.7, 0.42, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.65, 24, 20]} />
          <meshStandardMaterial color="#151720" roughness={0.65} metalness={0.2} />
        </mesh>
        <mesh position={[0.7, 0.65, -0.2]} rotation={[0.4, 0, 0]} castShadow>
          <sphereGeometry args={[0.5, 20, 16]} />
          <meshStandardMaterial color="#101117" roughness={0.7} metalness={0.15} />
        </mesh>

        {/* Sleek Dark Round Side Table */}
        <mesh position={[-0.35, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.42, 0.42, 0.44, 24]} />
          <meshStandardMaterial color="#0e1017" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Ambient Red Cylindrical Cyber Lamp on Table */}
        <mesh position={[-0.35, 0.54, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.22, 20]} />
          <meshBasicMaterial color="#FF2E36" />
        </mesh>
        <mesh position={[-0.35, 0.44, 0]}>
          <cylinderGeometry args={[0.11, 0.11, 0.04, 20]} />
          <meshStandardMaterial color="#050508" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* High-Tech Cyber Command Data Pylon & Quantum Power Column (Zero green, 100% Crimson/Carbon Cyber Deck) */}
      <CyberCommandPylon />

      {/* =========================================================================
          7. MAIN CENTER DISPLAY — "FEATURED PROJECTS" (NETLIFY / VERCEL STYLE)
             Positioned directly in front of character at [0, 2.7, 9.2]
         ========================================================================= */}
      <group position={[0, 4.35, 11.2]} rotation={[0.08, Math.PI, 0]}>
        {/* Physical 3D Solid Monitor Casing (Like a Real-World Display) */}
        <mesh position={[0, 0, -0.1]} receiveShadow castShadow>
          <boxGeometry args={[9.5, 5.1, 0.2]} />
          <meshStandardMaterial
            color="#0b0d14"
            roughness={0.25}
            metalness={0.9}
          />
        </mesh>

        {/* Outer Red Glowing Bezel Edge */}
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[4.7, 4.74, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.8} />
        </mesh>

        {/* Red Neon Corner Accents */}
        {[-4.65, 4.65].map((x, xi) =>
          [-2.45, 2.45].map((y, yi) => (
            <mesh key={`${xi}-${yi}`} position={[x, y, 0.01]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#FF1E27" />
            </mesh>
          ))
        )}

        {/* True 3D WebGL Screen Surface (Zero DOM overlays, respects hardware depth buffer) */}
        <mesh
          position={[0, 0, 0.02]}
          onClick={handleProjectsClick}
          onPointerDown={handleProjectsPointerDown}
          onPointerMove={handleProjectsPointerMove}
          onPointerUp={handleProjectsPointerUp}
          onPointerOut={handleProjectsPointerOut}
          onWheel={handleProjectsWheel}
        >
          <planeGeometry args={[9.4, 5.0]} />
          <meshStandardMaterial
            map={projectsTextureObj.texture}
            emissiveMap={projectsTextureObj.texture}
            emissive="#ffffff"
            emissiveIntensity={0.7}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* =========================================================================
          8. LEFT CURVED SCREEN — "WORKSPACE ARCHITECTURE & GITHUB TELEMETRY"
             Positioned at [-8.8, 3.4, 7.5], angled inward towards center
         ========================================================================= */}
      <group position={[-8.8, 3.4, 7.5]} rotation={[0.06, Math.PI - 0.65, 0]}>
        {/* Physical 3D Solid Monitor Casing (Like a Real-World Display) */}
        <mesh position={[0, 0, -0.1]} receiveShadow castShadow>
          <boxGeometry args={[5.9, 5.1, 0.2]} />
          <meshStandardMaterial color="#0b0d14" roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[2.8, 2.84, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.6} />
        </mesh>

        {/* True 3D WebGL Screen Surface */}
        <mesh
          position={[0, 0, 0.02]}
          onClick={handleWelcomeClick}
          onPointerMove={handleWelcomePointerMove}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
        >
          <planeGeometry args={[5.8, 5.0]} />
          <meshStandardMaterial
            map={welcomeTextureObj.texture}
            emissiveMap={welcomeTextureObj.texture}
            emissive="#ffffff"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* =========================================================================
          9. RIGHT CURVED SCREEN — "TECH STACK & CORE MATRIX"
             Positioned at [8.8, 3.4, 7.5], angled inward towards center
         ========================================================================= */}
      <group position={[8.8, 3.4, 7.5]} rotation={[0.06, Math.PI + 0.65, 0]}>
        {/* Physical 3D Solid Monitor Casing (Like a Real-World Display) */}
        <mesh position={[0, 0, -0.1]} receiveShadow castShadow>
          <boxGeometry args={[5.9, 5.1, 0.2]} />
          <meshStandardMaterial color="#0b0d14" roughness={0.25} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.01]}>
          <ringGeometry args={[2.8, 2.84, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.6} />
        </mesh>

        {/* True 3D WebGL Screen Surface */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[5.8, 5.0]} />
          <meshStandardMaterial
            map={techStackTextureObj.texture}
            emissiveMap={techStackTextureObj.texture}
            emissive="#ffffff"
            emissiveIntensity={0.65}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      </group>

      {/* =========================================================================
          11. FUTURISTIC STARSHIP DOME CEILING & CELESTIAL CANOPY (MATCHING IMAGE 2)
              Positioned directly above the central hologram pedestal at [0, 7.35, 4.2]
         ========================================================================= */}
      <group position={[0, 7.35, 4.2]}>
        {/* A. Outer Structural Bulkhead & Bevelled Rim */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[11.2, 14.2, 64]} />
          <meshStandardMaterial color="#0a0c13" metalness={0.9} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[13.8, 14.2, 0.45, 64, 1, true]} />
          <meshStandardMaterial color="#08090e" metalness={0.92} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* B. Outer Glowing Neon Red Ring (Matching Image 2 outer red glow) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[10.35, 10.55, 64]} />
          <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
          <ringGeometry args={[10.15, 10.75, 64]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.4} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* C. Middle Stepped Dark Metallic Soffit Deck */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.08, 0]}>
          <ringGeometry args={[7.4, 10.15, 64]} />
          <meshStandardMaterial color="#0f121a" metalness={0.88} roughness={0.32} side={THREE.DoubleSide} />
        </mesh>

        {/* D. Middle Red Neon Accent Ring (Matching Image 2 middle ring) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[7.15, 7.32, 64]} />
          <meshBasicMaterial color="#FF1E27" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.015, 0]}>
          <ringGeometry args={[7.0, 7.45, 64]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.35} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* E. Inner Stepped Ring Deck */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.12, 0]}>
          <ringGeometry args={[4.8, 7.0, 64]} />
          <meshStandardMaterial color="#141724" metalness={0.85} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* F. Inner Brilliant Glowing White Halo Ring (Matching Image 2 inner white ring) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
          <ringGeometry args={[4.55, 4.75, 64]} />
          <meshBasicMaterial color="#FFFFFF" side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.035, 0]}>
          <ringGeometry args={[4.35, 4.95, 64]} />
          <meshBasicMaterial color="#38BDF8" transparent opacity={0.45} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* G. Central Aperture Star Pod & Hologram Emitter Core */}
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[3.2, 3.4, 0.4, 48]} />
          <meshStandardMaterial color="#080a10" metalness={0.92} roughness={0.25} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.07, 0]}>
          <circleGeometry args={[3.15, 48]} />
          <meshStandardMaterial color="#06070a" roughness={0.7} metalness={0.5} />
        </mesh>

        {/* Central Glowing Red Star Core Emitter Lens (Matching Image 2 center beacon) */}
        <mesh ref={beaconRef} position={[0, -0.05, 0]}>
          <sphereGeometry args={[0.35, 24, 24]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]}>
          <ringGeometry args={[0.08, 1.1, 32]} />
          <meshBasicMaterial color="#FF4D55" transparent opacity={0.75} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* Concentric Fiber-Optic Micro Star Dots inside Core (Image 2 celestial aperture) */}
        {[0.8, 1.4, 2.0, 2.6].map((radDist, ri) =>
          [0, 45, 90, 135, 180, 225, 270, 315].map((ang, ai) => {
            const r = (ang * Math.PI) / 180 + ri * 0.2;
            return (
              <mesh key={`star-dot-${ri}-${ai}`} position={[Math.cos(r) * radDist, 0.075, Math.sin(r) * radDist]}>
                <sphereGeometry args={[0.024, 8, 8]} />
                <meshBasicMaterial color={ai % 2 === 0 ? '#38BDF8' : '#FFFFFF'} />
              </mesh>
            );
          })
        )}

        {/* Navigation Strobes on North, South, East, West Rafters (Flashing Starship Signal Lights) */}
        {[0, 90, 180, 270].map((deg, idx) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh key={`strobe-${idx}`} position={[Math.sin(rad) * 11.2, 0.06, Math.cos(rad) * 11.2]}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshBasicMaterial color="#FFFFFF" transparent opacity={strobeState ? 1.0 : 0.15} />
            </mesh>
          );
        })}

        {/* Subtle Vertical Hologram Projection Light Column down to Floor Pedestal */}
        <mesh position={[0, -3.2, 0]}>
          <cylinderGeometry args={[0.1, 0.65, 6.2, 24, 1, true]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.05} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>

        {/* H. 12 Radial Structural Trusses / Rafter Beams (Starship Framework in Image 2) */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <group key={`ceiling-rafter-${i}`} rotation={[0, rad, 0]}>
              {/* Metallic Girder Body spanning from inner core to outer rim */}
              <mesh position={[0, 0.14, 7.3]}>
                <boxGeometry args={[0.16, 0.28, 8.2]} />
                <meshStandardMaterial color="#11141e" metalness={0.9} roughness={0.3} />
              </mesh>
              {/* Glowing Red Under-Beam Neon Strip */}
              <mesh position={[0, -0.01, 7.3]}>
                <boxGeometry args={[0.04, 0.03, 8.2]} />
                <meshBasicMaterial color="#FF1E27" />
              </mesh>
            </group>
          );
        })}

        {/* I. 6 Overhead Studio Downlight Projector Cans along the Ring */}
        {[30, 90, 150, 210, 270, 330].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          const px = Math.cos(rad) * 6.8;
          const pz = Math.sin(rad) * 6.8;
          return (
            <group key={`overhead-can-${i}`} position={[px, -0.05, pz]} rotation={[0.2 * Math.sin(rad), -rad, 0.2 * Math.cos(rad)]}>
              <mesh>
                <cylinderGeometry args={[0.14, 0.18, 0.35, 16]} />
                <meshStandardMaterial color="#0c0e14" metalness={0.9} roughness={0.3} />
              </mesh>
              <mesh position={[0, -0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.13, 16]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* =========================================================================
          12. MICRO-DETAILS: FLOOR CONDUITS & ATMOSPHERIC CYBER EMBER MOTES
         ========================================================================= */}
      <CyberFloorConduits />
      <CyberAtmosphericMotes count={90} />

      {/* =========================================================================
          13. CELESTIAL DEEP-SPACE SKY DOME WITH SPARKLING STARS & NEBULA
              Visible through the high panoramic glass clerestory above the screens
         ========================================================================= */}
      <points geometry={starsGeometry}>
        <pointsMaterial size={0.18} color="#ffffff" transparent opacity={0.85} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  );
}
