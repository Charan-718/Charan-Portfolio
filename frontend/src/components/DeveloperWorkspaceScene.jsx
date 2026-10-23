import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { playClickSound } from '../utils/soundEffects';
import {
  createProjectsScreenTexture,
  createWelcomeScreenTexture,
  createTechStackScreenTexture,
  createQuickAccessScreenTexture,
} from './workspaceScreenTextures';

export const workspaceProjects = [
  {
    id: 'dayflow',
    title: 'DayFlow — Full-Stack HRMS',
    hostName: 'day-flow-six.vercel.app',
    hostBadge: 'Vercel Hosted',
    category: 'HRMS & WORKFORCE',
    repo: 'Charan-718/Day-Flow',
    liveUrl: 'https://day-flow-six.vercel.app/',
    thumbnail: '/thumbnails/dayflow.png',
    status: 'Live Production',
    accentColor: '#FF1E27',
    badgeText: 'SPEC_01 // HRMS & RBAC',
  },
  {
    id: 'freshmart',
    title: 'freshmart-fsd',
    hostName: 'freshmart-fsd.netlify.app',
    hostBadge: 'Netlify Hosted',
    category: 'FULL-STACK E-COMMERCE',
    repo: 'Charan-718/freshmart-fsd',
    liveUrl: 'https://freshmart-fsd.netlify.app/',
    thumbnail: '/thumbnails/freshmart.png',
    status: 'Live Production',
    accentColor: '#22C55E',
    badgeText: 'SPEC_10 // GROCERY SYSTEM',
  },
  {
    id: 'greenova',
    title: 'greenova-csp',
    hostName: 'greenova-csp.netlify.app',
    hostBadge: 'Netlify Hosted',
    category: 'SUSTAINABILITY & CLEAN-TECH',
    repo: 'Charan-718/greenova-csp',
    liveUrl: 'https://greenova-csp.netlify.app',
    thumbnail: '/thumbnails/greenova.png',
    status: 'Live Production',
    accentColor: '#10B981',
    badgeText: 'SPEC_11 // CARBON OFFSET',
  },
  {
    id: 'medireport',
    title: 'medi-report',
    hostName: 'medi-report.netlify.app',
    hostBadge: 'Netlify Hosted',
    category: 'HEALTHCARE DIAGNOSTICS AI',
    repo: 'Charan-718/medi-report',
    liveUrl: 'https://medi-report.netlify.app',
    thumbnail: '/thumbnails/medireport.png',
    status: 'Live Production',
    accentColor: '#06B6D4',
    badgeText: 'SPEC_13 // CLINICAL AI',
  },
  {
    id: 'furnexa',
    title: 'mini-erp-furnexa',
    hostName: 'mini-erp-furnexa.netlify.app',
    hostBadge: 'Netlify Hosted',
    category: 'LOGISTICS & MINI-ERP',
    repo: 'Charan-718/mini-erp-furnexa',
    liveUrl: 'https://mini-erp-furnexa.netlify.app',
    thumbnail: '/thumbnails/furnexa.png',
    status: 'Live Production',
    accentColor: '#F59E0B',
    badgeText: 'SPEC_14 // LOGISTICS',
  },
  {
    id: 'traveloop',
    title: 'Traveloop — AI Travel Planner',
    hostName: 'traveloop-plum.vercel.app',
    hostBadge: 'Vercel Hosted',
    category: 'AI TRAVEL ENGINE',
    repo: 'mounikakorrakuti1/traveloop',
    liveUrl: 'https://traveloop-plum.vercel.app/',
    thumbnail: '/thumbnails/traveloop.png',
    status: 'Live Production',
    accentColor: '#3B82F6',
    badgeText: 'SPEC_02 // GEOSPATIAL AI',
  },
  {
    id: 'learnloop',
    title: 'LearnLoop — EdTech Hub',
    hostName: 'charan-718.github.io/LearnLoop',
    hostBadge: 'GitHub Pages',
    category: 'INTERACTIVE LEARNING',
    repo: 'Charan-718/LearnLoop',
    liveUrl: 'https://charan-718.github.io/LearnLoop/',
    thumbnail: '/thumbnails/learnloop.png',
    status: 'Live Production',
    accentColor: '#8B5CF6',
    badgeText: 'SPEC_12 // INTERACTIVE STUDY',
  },
  {
    id: 'quantum-chatbot',
    title: 'Quantum Conversational AI',
    hostName: 'quantum-chatbot-green.vercel.app',
    hostBadge: 'Vercel Hosted',
    category: 'CONVERSATIONAL AI',
    repo: 'Charan-718/Chatbot',
    liveUrl: 'https://quantum-chatbot-green.vercel.app/',
    thumbnail: '/thumbnails/quantum.png',
    status: 'Live Production',
    accentColor: '#EC4899',
    badgeText: 'SPEC_05 // QUANTUM BOT',
  },
];

export default function DeveloperWorkspaceScene({ onClose }) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [currentPage, setCurrentPage] = useState(0); // 0 = First 4 projects, 1 = Next 4 projects
  const [, setTick] = useState(0);

  // References for animated 3D elements
  const globeRef = useRef();
  const ringRef1 = useRef();
  const ringRef2 = useRef();

  useFrame((state, delta) => {
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.45;
      globeRef.current.position.y = 1.15 + Math.sin(state.clock.getElapsedTime() * 1.8) * 0.04;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z += delta * 0.35;
      ringRef1.current.rotation.x += delta * 0.2;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z -= delta * 0.28;
      ringRef2.current.rotation.y += delta * 0.25;
    }
  });

  // 100% WebGL Canvas Textures for physical 3D screens (zero DOM overlays, perfect depth buffer occlusion)
  const projectsTextureObj = useMemo(() => {
    return createProjectsScreenTexture(currentPage, workspaceProjects, publicUrl, () => {
      setTick((t) => t + 1);
    });
  }, [currentPage, publicUrl]);

  const welcomeTextureObj = useMemo(() => {
    return createWelcomeScreenTexture();
  }, []);

  const techStackTextureObj = useMemo(() => {
    return createTechStackScreenTexture();
  }, []);

  const quickAccessTextureObj = useMemo(() => {
    return createQuickAccessScreenTexture();
  }, []);

  // Cleanup WebGL textures on unmount to prevent GPU memory leaks
  useEffect(() => {
    return () => {
      projectsTextureObj?.texture?.dispose();
      welcomeTextureObj?.texture?.dispose();
      techStackTextureObj?.texture?.dispose();
      quickAccessTextureObj?.texture?.dispose();
    };
  }, [projectsTextureObj, welcomeTextureObj, techStackTextureObj, quickAccessTextureObj]);

  const handleProjectsClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;

    // Header pagination controls
    if (canvasY >= 35 && canvasY <= 110) {
      if (canvasX >= 1580 && canvasX <= 1750) {
        if (currentPage > 0) {
          playClickSound('switch');
          setCurrentPage(0);
        }
        return;
      }
      if (canvasX >= 1880 && canvasX <= 2010) {
        if (currentPage < 1) {
          playClickSound('switch');
          setCurrentPage(1);
        }
        return;
      }
    }

    // Project cards click handling
    const displayed = workspaceProjects.slice(currentPage * 4, currentPage * 4 + 4);
    const cardPositions = [
      { x: 52, y: 142, w: 950, h: 420 },
      { x: 1046, y: 142, w: 950, h: 420 },
      { x: 52, y: 588, w: 950, h: 420 },
      { x: 1046, y: 588, w: 950, h: 420 },
    ];

    for (let i = 0; i < displayed.length; i++) {
      const { x, y, w, h } = cardPositions[i];
      if (canvasX >= x && canvasX <= x + w && canvasY >= y && canvasY <= y + h) {
        const proj = displayed[i];
        const rightX = x + 476;
        const btn1Y = y + 236;

        // GitHub Repo button
        if (canvasX >= rightX + 224 && canvasX <= rightX + 410 && canvasY >= btn1Y && canvasY <= btn1Y + 54) {
          playClickSound('click');
          window.open(`https://github.com/${proj.repo}`, '_blank', 'noopener,noreferrer');
          return;
        }

        // Live Application URL or general card click
        playClickSound('click');
        window.open(proj.liveUrl, '_blank', 'noopener,noreferrer');
        return;
      }
    }
  };

  const handleProjectsPointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 2048;
    const canvasY = (1 - e.uv.y) * 1088;

    let isClickable = false;
    if (canvasY >= 35 && canvasY <= 110) {
      if ((canvasX >= 1580 && canvasX <= 1750) || (canvasX >= 1880 && canvasX <= 2010)) {
        isClickable = true;
      }
    } else if (canvasY >= 142 && canvasY <= 1008) {
      if ((canvasX >= 52 && canvasX <= 1002) || (canvasX >= 1046 && canvasX <= 1996)) {
        isClickable = true;
      }
    }

    document.body.style.cursor = isClickable ? 'pointer' : 'auto';
  };

  const handleWelcomeClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 880;

    // Stat card 1: Public Repositories (x: 40..490, y: 370..550)
    if (canvasX >= 40 && canvasX <= 490 && canvasY >= 370 && canvasY <= 550) {
      playClickSound('click');
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
      return;
    }

    // Stat card 2: Live Deployments (x: 534..984, y: 370..550)
    if (canvasX >= 534 && canvasX <= 984 && canvasY >= 370 && canvasY <= 550) {
      playClickSound('click');
      window.open('https://github.com/Charan-718?tab=repositories', '_blank', 'noopener,noreferrer');
      return;
    }
  };

  const handleWelcomePointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasX = e.uv.x * 1024;
    const canvasY = (1 - e.uv.y) * 880;
    const isClickable =
      canvasY >= 370 &&
      canvasY <= 550 &&
      ((canvasX >= 40 && canvasX <= 490) || (canvasX >= 534 && canvasX <= 984));
    document.body.style.cursor = isClickable ? 'pointer' : 'auto';
  };

  const handleQuickAccessClick = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasY = (1 - e.uv.y) * 630;

    if (canvasY >= 130 && canvasY <= 265) {
      // 1. Switch Projects Page
      playClickSound('switch');
      setCurrentPage((p) => (p === 0 ? 1 : 0));
    } else if (canvasY >= 285 && canvasY <= 420) {
      // 2. GitHub Profile
      playClickSound('click');
      window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
    } else if (canvasY >= 440 && canvasY <= 575) {
      // 3. Trigger Hologram Re-Scan
      playClickSound('hologram');
      window.dispatchEvent(new CustomEvent('charan-hologram-rescan'));
    }
  };

  const handleQuickAccessPointerMove = (e) => {
    e.stopPropagation();
    if (!e.uv) return;
    const canvasY = (1 - e.uv.y) * 630;
    let hovered = -1;
    if (canvasY >= 130 && canvasY <= 265) hovered = 0;
    else if (canvasY >= 285 && canvasY <= 420) hovered = 1;
    else if (canvasY >= 440 && canvasY <= 575) hovered = 2;

    if (quickAccessTextureObj?.redraw) {
      quickAccessTextureObj.redraw(hovered);
    }
    document.body.style.cursor = hovered !== -1 ? 'pointer' : 'auto';
  };

  const handleQuickAccessPointerOut = () => {
    if (quickAccessTextureObj?.redraw) {
      quickAccessTextureObj.redraw(-1);
    }
    document.body.style.cursor = 'auto';
  };

  return (
    <group name="DeveloperWorkspaceEnvironment">
      {/* =========================================================================
          1. LIGHTING SETUP — NATURAL, REALISTIC DIFFUSE ILLUMINATION
             Clean, balanced diffuse lighting that ensures the character is clearly
             visible in the dark environment with natural matte cloth & skin textures,
             without any artificial metallic shine, plastic glints, or harsh specular hot spots.
         ========================================================================= */}
      {/* Pure Diffuse Ambient Light (Uniformly illuminates textures with ZERO specular shine) */}
      <ambientLight intensity={1.4} color="#ffffff" />

      {/* Soft Natural Hemisphere Fill (Gentle vertical gradient from ceiling to floor) */}
      <hemisphereLight skyColor="#ffffff" groundColor="#222222" intensity={0.6} />

      {/* Single Soft Overhead Directional Key Light (Provides natural gravity shadows) */}
      <directionalLight
        position={[0, 8, 3]}
        intensity={1.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0001}
      />

      {/* Gentle Camera-Side Fill Light (Ensures character back is clearly visible without specular glare) */}
      <directionalLight
        position={[0, 3, -6]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Soft Environmental Neon Accents (Localized to the pedestal, screens, and furniture) */}
      {/* Red Volumetric Glow over Center Hologram Pedestal */}
      <pointLight position={[0, 1.8, 4.2]} intensity={2.5} distance={6} color="#FF1E27" decay={2} />

      {/* Red Floor Uplight under Projects Screen */}
      <pointLight position={[0, 0.5, 8.5]} intensity={1.8} distance={5} color="#FF1E27" decay={2} />

      {/* Quick Access Kiosk Soft Red Beacon */}
      <pointLight position={[-4.8, 1.5, 0.8]} intensity={1.5} distance={3.5} color="#FF1E27" decay={2} />

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
          3. CENTER HOLOGRAPHIC GLOBE & PEDESTAL (MATCHING IMAGE 1 & 2)
         ========================================================================= */}
      <group position={[0, 0, 4.2]}>
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

        {/* Upward Hologram Beam (Translucent Sci-Fi Red Cylinder) */}
        <mesh position={[0, 0.85, 0]}>
          <cylinderGeometry args={[0.75, 0.45, 0.8, 32, 1, true]} />
          <meshBasicMaterial
            color="#FF1E27"
            transparent
            opacity={0.12}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        {/* Rotating 3D Holographic Globe */}
        <group ref={globeRef} position={[0, 1.15, 0]}>
          {/* Outer Wireframe Globe */}
          <mesh>
            <sphereGeometry args={[0.55, 20, 20]} />
            <meshBasicMaterial
              color="#FF1E27"
              wireframe
              transparent
              opacity={0.7}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Inner Glowing Core */}
          <mesh>
            <sphereGeometry args={[0.22, 16, 16]} />
            <meshBasicMaterial
              color="#FF5259"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </mesh>

          {/* Rotating Holographic Orbital Rings */}
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

      {/* Modern Potted Office Plant on Left Side (Matching Image 1) */}
      <group position={[-5.2, 0, 3.4]}>
        {/* Planter Pot */}
        <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.38, 0.26, 0.7, 24]} />
          <meshStandardMaterial color="#14161f" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.71, 0]}>
          <cylinderGeometry args={[0.36, 0.36, 0.04, 24]} />
          <meshStandardMaterial color="#090a0d" roughness={0.9} metalness={0.1} />
        </mesh>
        {/* Plant Stems & Foliage */}
        {[0, 60, 120, 180, 240, 300].map((deg, i) => {
          const rad = (deg * Math.PI) / 180;
          return (
            <mesh
              key={i}
              position={[Math.sin(rad) * 0.22, 1.05 + (i % 2) * 0.18, Math.cos(rad) * 0.22]}
              rotation={[0.35, rad, 0.35]}
              castShadow
            >
              <sphereGeometry args={[0.22, 12, 10]} />
              <meshStandardMaterial color="#1e3a2f" roughness={0.6} metalness={0.1} />
            </mesh>
          );
        })}
      </group>

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
          onPointerMove={handleProjectsPointerMove}
          onPointerOut={() => {
            document.body.style.cursor = 'auto';
          }}
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
          8. LEFT CURVED SCREEN — "WELCOME & REPOSITORIES TELEMETRY"
             Positioned at [-6.5, 2.7, 7.8], angled inward towards center
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
             Positioned at [6.8, 2.75, 7.8], angled inward towards center
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
          10. FOREGROUND "QUICK ACCESS" KIOSK (MATCHING IMAGE 1 BOTTOM-LEFT)
             Positioned at [-3.4, 0.75, 2.4], angled at character
         ========================================================================= */}
      <group position={[-5.0, 1.25, 0.5]} rotation={[-0.22, Math.PI - 0.85, 0]}>
        {/* Physical 3D Freestanding Kiosk Base on Floor */}
        <mesh position={[0, -1.2, -0.05]} receiveShadow castShadow>
          <cylinderGeometry args={[0.7, 0.85, 0.1, 24]} />
          <meshStandardMaterial color="#0c0e14" metalness={0.9} roughness={0.3} />
        </mesh>
        {/* Vertical Pedestal Pillar Column */}
        <mesh position={[0, -0.65, -0.05]} receiveShadow castShadow>
          <boxGeometry args={[0.45, 1.0, 0.35]} />
          <meshStandardMaterial color="#14161f" metalness={0.85} roughness={0.3} />
        </mesh>
        {/* Glowing Red Neon Strip on Pillar */}
        <mesh position={[0, -0.65, 0.14]}>
          <boxGeometry args={[0.06, 0.9, 0.02]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* Angled Console Desktop Shelf */}
        <mesh position={[0, -0.18, 0.05]} rotation={[0.3, 0, 0]} receiveShadow castShadow>
          <boxGeometry args={[2.7, 0.1, 0.7]} />
          <meshStandardMaterial color="#0e1017" roughness={0.25} metalness={0.85} />
        </mesh>

        {/* Solid 3D Screen Enclosure Box (Prevents seeing through from back) */}
        <mesh position={[0, 0, -0.08]} receiveShadow castShadow>
          <boxGeometry args={[2.65, 1.65, 0.15]} />
          <meshStandardMaterial color="#080a10" roughness={0.25} metalness={0.9} />
        </mesh>

        <mesh position={[0, 0, 0.001]}>
          <ringGeometry args={[1.25, 1.28, 4]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        {/* True 3D WebGL Screen Surface */}
        <mesh
          position={[0, 0, 0.02]}
          onClick={handleQuickAccessClick}
          onPointerMove={handleQuickAccessPointerMove}
          onPointerOut={handleQuickAccessPointerOut}
        >
          <planeGeometry args={[2.6, 1.6]} />
          <meshStandardMaterial
            map={quickAccessTextureObj.texture}
            emissiveMap={quickAccessTextureObj.texture}
            emissive="#ffffff"
            emissiveIntensity={0.75}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}
