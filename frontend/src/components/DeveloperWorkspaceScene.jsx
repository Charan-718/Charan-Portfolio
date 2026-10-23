import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { playClickSound } from '../utils/soundEffects';

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
  const [hoveredCard, setHoveredCard] = useState(null);

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

  const displayedProjects = workspaceProjects.slice(currentPage * 4, currentPage * 4 + 4);

  const handleOpenProject = (url, title) => {
    playClickSound('click');
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <group name="DeveloperWorkspaceEnvironment">
      {/* =========================================================================
          1. LIGHTING SETUP — HIGH-CONTRAST CYBERPUNK / SWISS TECH LIGHTING
         ========================================================================= */}
      <ambientLight intensity={0.9} color="#151722" />

      {/* Main Overhead Studio Downlight */}
      <spotLight
        position={[0, 9, 4]}
        target-position={[0, 0, 4]}
        intensity={3.5}
        angle={0.65}
        penumbra={0.7}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
      />

      {/* Red Ambient Volumetric Glow over Center Pedestal */}
      <pointLight position={[0, 1.8, 4.2]} intensity={4.5} distance={7} color="#FF1E27" />

      {/* Soft Blue Perimeter Rim Lighting */}
      <directionalLight position={[-8, 6, -4]} intensity={0.8} color="#60a5fa" />
      <directionalLight position={[8, 6, -4]} intensity={0.8} color="#f43f5e" />

      {/* Red Floor Uplight under Projects Screen */}
      <pointLight position={[0, 0.4, 8.2]} intensity={2.8} distance={6} color="#FF1E27" />

      {/* Warm Ambient Red Accent from Table Lamp */}
      <pointLight position={[4.2, 0.8, 2.0]} intensity={2.2} distance={3.5} color="#FF3B44" />

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
      <group position={[0, 2.75, 9.2]} rotation={[0, Math.PI, 0]}>
        {/* Physical 3D Floating Bezel Frame */}
        <mesh position={[0, 0, -0.06]} receiveShadow castShadow>
          <planeGeometry args={[9.4, 5.0]} />
          <meshStandardMaterial
            color="#080a10"
            roughness={0.2}
            metalness={0.9}
            transparent
            opacity={0.96}
          />
        </mesh>

        {/* Outer Red Glowing Bezel Edge */}
        <mesh position={[0, 0, -0.05]}>
          <ringGeometry args={[4.7, 4.74, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.8} />
        </mesh>

        {/* Red Neon Corner Accents */}
        {[-4.65, 4.65].map((x, xi) =>
          [-2.45, 2.45].map((y, yi) => (
            <mesh key={`${xi}-${yi}`} position={[x, y, -0.04]}>
              <planeGeometry args={[0.4, 0.4]} />
              <meshBasicMaterial color="#FF1E27" />
            </mesh>
          ))
        )}

        {/* 3D Glass Screen Surface */}
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[9.2, 4.8]} />
          <meshStandardMaterial
            color="#0e1017"
            roughness={0.15}
            metalness={0.5}
            transparent
            opacity={0.65}
          />
        </mesh>

        {/* Drei <Html> Overlay with Crisp Netlify/Vercel Hero Cards */}
        <Html
          transform
          distanceFactor={7.2}
          position={[0, 0, 0.02]}
          style={{
            width: '1180px',
            userSelect: 'none',
            fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
            color: '#FFFFFF',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(11, 13, 19, 0.94)',
              border: '2px solid rgba(255, 30, 39, 0.55)',
              borderRadius: '16px',
              padding: '24px 28px',
              boxShadow: '0 0 50px rgba(255, 30, 39, 0.25), 0 25px 60px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Header Strip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid rgba(255, 255, 255, 0.12)',
                paddingBottom: '14px',
                marginBottom: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#FF1E27',
                    boxShadow: '0 0 14px #FF1E27, 0 0 22px #FF1E27',
                    animation: 'pulse 1.5s infinite',
                  }}
                />
                <h2
                  style={{
                    margin: 0,
                    fontSize: '1.45rem',
                    fontWeight: 900,
                    letterSpacing: '0.06em',
                    color: '#FFFFFF',
                    textTransform: 'uppercase',
                  }}
                >
                  FEATURED PROJECTS <span style={{ color: '#FF1E27' }}>{'//'} LIVE WORKSPACE</span>
                </h2>
                <span
                  style={{
                    background: 'rgba(255, 30, 39, 0.15)',
                    color: '#FF6B72',
                    padding: '3px 10px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                    border: '1px solid rgba(255, 30, 39, 0.35)',
                  }}
                >
                  CLICK TO VISIT REAL-TIME SITES
                </span>
              </div>

              {/* Page Toggle Switcher */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound('switch');
                    setCurrentPage((prev) => (prev === 0 ? 1 : 0));
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    color: '#FFFFFF',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FF1E27';
                    e.currentTarget.style.borderColor = '#FF1E27';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.22)';
                  }}
                >
                  <span>PAGE {currentPage + 1} OF 2</span>
                  <i className="fa-solid fa-arrows-rotate"></i>
                </button>
              </div>
            </div>

            {/* Project Cards Grid — 4 Cards per page (Netlify / Vercel Showcase Format) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '18px',
              }}
            >
              {displayedProjects.map((proj) => {
                const isHovered = hoveredCard === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => handleOpenProject(proj.liveUrl, proj.title)}
                    onMouseEnter={() => {
                      setHoveredCard(proj.id);
                      playClickSound('hover');
                    }}
                    onMouseLeave={() => setHoveredCard(null)}
                    style={{
                      background: isHovered ? 'rgba(26, 29, 42, 0.98)' : 'rgba(16, 18, 26, 0.95)',
                      border: isHovered
                        ? '2px solid #FF1E27'
                        : '1px solid rgba(255, 255, 255, 0.14)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transform: isHovered ? 'translateY(-6px) scale(1.02)' : 'translateY(0)',
                      boxShadow: isHovered
                        ? '0 12px 30px rgba(0, 0, 0, 0.7), 0 0 24px rgba(255, 30, 39, 0.45)'
                        : '0 6px 18px rgba(0, 0, 0, 0.5)',
                      transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    title={`Click to open ${proj.title} in new tab`}
                  >
                    {/* Top Hero-Section Thumbnail Container (Like Netlify / Vercel Cards) */}
                    <div
                      style={{
                        position: 'relative',
                        width: '100%',
                        height: '145px',
                        background: '#090a0f',
                        overflow: 'hidden',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <img
                        src={publicUrl + proj.thumbnail}
                        alt={proj.title}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          objectPosition: 'top center',
                          transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                          transition: 'transform 0.3s ease',
                        }}
                      />

                      {/* Netlify/Vercel Host Badge */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: 'rgba(0, 0, 0, 0.78)',
                          backdropFilter: 'blur(6px)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          padding: '3px 8px',
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        <i className="fa-solid fa-cloud" style={{ color: proj.accentColor }}></i>
                        <span>{proj.hostBadge}</span>
                      </div>

                      {/* Live Indicator Pill */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid #22c55e',
                          borderRadius: '4px',
                          padding: '3px 7px',
                          fontSize: '0.62rem',
                          fontWeight: 800,
                          color: '#4ade80',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <span
                          style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: '#22c55e',
                          }}
                        />
                        <span>LIVE</span>
                      </div>

                      {/* Hover Overlay with "LAUNCH LIVE SITE" */}
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(255, 30, 39, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          opacity: isHovered ? 1 : 0,
                          transition: 'opacity 0.18s ease',
                          pointerEvents: 'none',
                        }}
                      >
                        <div
                          style={{
                            background: '#FF1E27',
                            color: '#FFFFFF',
                            padding: '6px 14px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            letterSpacing: '0.04em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.6)',
                          }}
                        >
                          <span>OPEN LIVE SITE</span>
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </div>
                      </div>
                    </div>

                    {/* Card Content Footer (Title, Category, Repo link) */}
                    <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div
                        style={{
                          fontSize: '0.65rem',
                          fontWeight: 800,
                          color: proj.accentColor,
                          letterSpacing: '0.06em',
                          fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                        }}
                      >
                        {proj.category}
                      </div>

                      <h4
                        style={{
                          margin: 0,
                          fontSize: '0.96rem',
                          fontWeight: 800,
                          color: '#FFFFFF',
                          lineHeight: 1.25,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {proj.title}
                      </h4>

                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          marginTop: '2px',
                        }}
                      >
                        <i className="fa-brands fa-github" style={{ fontSize: '0.8rem' }}></i>
                        <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                          {proj.repo}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Footer Tip */}
            <div
              style={{
                marginTop: '16px',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.72rem',
                color: '#94a3b8',
              }}
            >
              <span>
                <strong style={{ color: '#fff' }}>Interactive 3D Workspace:</strong> Walk up to any terminal or click a project thumbnail to launch.
              </span>
              <span style={{ color: '#FF6B72' }}>
                SHOWING {currentPage * 4 + 1}–{currentPage * 4 + displayedProjects.length} OF {workspaceProjects.length} HOSTED APPS
              </span>
            </div>
          </div>
        </Html>
      </group>

      {/* =========================================================================
          8. LEFT CURVED SCREEN — "WELCOME & REPOSITORIES TELEMETRY"
             Positioned at [-6.5, 2.7, 7.8], angled inward towards center
         ========================================================================= */}
      <group position={[-6.8, 2.75, 7.8]} rotation={[0, Math.PI - 0.42, 0]}>
        {/* Physical 3D Floating Bezel Frame */}
        <mesh position={[0, 0, -0.06]} receiveShadow castShadow>
          <planeGeometry args={[5.8, 5.0]} />
          <meshStandardMaterial color="#080a10" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <ringGeometry args={[2.8, 2.84, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.6} />
        </mesh>

        <Html
          transform
          distanceFactor={7.2}
          position={[0, 0, 0.02]}
          style={{
            width: '680px',
            userSelect: 'none',
            fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
            color: '#FFFFFF',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(11, 13, 19, 0.94)',
              border: '2px solid rgba(255, 30, 39, 0.45)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 0 45px rgba(255, 30, 39, 0.2), 0 25px 60px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  color: '#FF6B72',
                  letterSpacing: '0.12em',
                  marginBottom: '6px',
                }}
              >
                CHARAN-718 // DEVELOPER SUITE
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome to my <br />
                <span style={{ color: '#FF1E27' }}>Developer Workspace.</span>
              </h1>
              <p
                style={{
                  margin: '10px 0 0 0',
                  color: '#94a3b8',
                  fontSize: '0.95rem',
                  lineHeight: 1.45,
                }}
              >
                Explore my projects, explore innovation. Real-time digital twins,
                enterprise HRMS platforms, and machine learning pipelines.
              </p>
            </div>

            {/* Terminal Prompt Animation */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '12px 16px',
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: '0.85rem',
                color: '#FF6B72',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ color: '#FF1E27' }}>$</span>
              <span>explore my work_</span>
            </div>

            {/* Real Stats Cards (Matching Image 1) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '14px',
              }}
            >
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(255, 30, 39, 0.15)',
                    border: '1px solid rgba(255, 30, 39, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF1E27',
                    fontSize: '1.2rem',
                  }}
                >
                  <i className="fa-brands fa-github"></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>32</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Public Repositories</div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                }}
              >
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '8px',
                    background: 'rgba(34, 197, 94, 0.15)',
                    border: '1px solid rgba(34, 197, 94, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#22c55e',
                    fontSize: '1.15rem',
                  }}
                >
                  <i className="fa-solid fa-globe"></i>
                </div>
                <div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>18+</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>Live Deployments</div>
                </div>
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* =========================================================================
          9. RIGHT CURVED SCREEN — "TECH STACK & CORE MATRIX"
             Positioned at [6.8, 2.75, 7.8], angled inward towards center
         ========================================================================= */}
      <group position={[6.8, 2.75, 7.8]} rotation={[0, Math.PI + 0.42, 0]}>
        {/* Physical 3D Floating Bezel Frame */}
        <mesh position={[0, 0, -0.06]} receiveShadow castShadow>
          <planeGeometry args={[5.8, 5.0]} />
          <meshStandardMaterial color="#080a10" roughness={0.2} metalness={0.9} />
        </mesh>
        <mesh position={[0, 0, -0.05]}>
          <ringGeometry args={[2.8, 2.84, 4]} />
          <meshBasicMaterial color="#FF1E27" transparent opacity={0.6} />
        </mesh>

        <Html
          transform
          distanceFactor={7.2}
          position={[0, 0, 0.02]}
          style={{
            width: '680px',
            userSelect: 'none',
            fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
            color: '#FFFFFF',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(11, 13, 19, 0.94)',
              border: '2px solid rgba(255, 30, 39, 0.45)',
              borderRadius: '16px',
              padding: '28px',
              boxShadow: '0 0 45px rgba(255, 30, 39, 0.2), 0 25px 60px rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#FF1E27',
                  boxShadow: '0 0 10px #FF1E27',
                }}
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                TECH STACK
              </h2>
            </div>

            {/* Tech Badges Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px',
              }}
            >
              {[
                { name: 'React', icon: 'fa-brands fa-react', color: '#61DAFB' },
                { name: 'TypeScript', icon: 'fa-solid fa-code', color: '#3178C6' },
                { name: 'Node.js', icon: 'fa-brands fa-node-js', color: '#68A063' },
                { name: 'Python', icon: 'fa-brands fa-python', color: '#FFD43B' },
                { name: 'PostgreSQL', icon: 'fa-solid fa-database', color: '#336791' },
                { name: 'Docker', icon: 'fa-brands fa-docker', color: '#2496ED' },
                { name: 'FastAPI', icon: 'fa-solid fa-bolt', color: '#009688' },
                { name: 'Qiskit', icon: 'fa-solid fa-atom', color: '#8A2BE2' },
                { name: 'Prisma', icon: 'fa-solid fa-gem', color: '#2D3748' },
                { name: 'TailwindCSS', icon: 'fa-solid fa-wind', color: '#38BDF8' },
                { name: 'Three.js', icon: 'fa-solid fa-cube', color: '#FF1E27' },
                { name: 'Express', icon: 'fa-solid fa-server', color: '#FFFFFF' },
              ].map((tech, i) => (
                <div
                  key={i}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '8px',
                    padding: '10px 8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    textAlign: 'center',
                  }}
                >
                  <i className={tech.icon} style={{ color: tech.color, fontSize: '1.25rem' }}></i>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#e2e8f0' }}>{tech.name}</span>
                </div>
              ))}
            </div>

            {/* Philosophy Banner (Matching Image 1) */}
            <div
              style={{
                marginTop: '6px',
                background: 'rgba(255, 30, 39, 0.1)',
                border: '1px solid rgba(255, 30, 39, 0.35)',
                borderRadius: '8px',
                padding: '14px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                }}
              >
                “Build • Innovate • Inspire”
              </div>
            </div>
          </div>
        </Html>
      </group>

      {/* =========================================================================
          10. FOREGROUND "QUICK ACCESS" KIOSK (MATCHING IMAGE 1 BOTTOM-LEFT)
             Positioned at [-3.4, 0.75, 2.4], angled at character
         ========================================================================= */}
      <group position={[-3.4, 0.75, 2.4]} rotation={[-0.28, Math.PI - 0.45, 0]}>
        {/* Physical Console Angled Wedge Stand */}
        <mesh position={[0, -0.32, -0.08]} receiveShadow castShadow>
          <boxGeometry args={[2.5, 0.65, 0.3]} />
          <meshStandardMaterial color="#0e1017" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Screen Bezel */}
        <mesh position={[0, 0, -0.04]} receiveShadow castShadow>
          <planeGeometry args={[2.6, 1.6]} />
          <meshStandardMaterial color="#080a10" roughness={0.2} metalness={0.9} />
        </mesh>

        <mesh position={[0, 0, -0.03]}>
          <ringGeometry args={[1.25, 1.28, 4]} />
          <meshBasicMaterial color="#FF1E27" />
        </mesh>

        <Html
          transform
          distanceFactor={3.8}
          position={[0, 0, 0.02]}
          style={{
            width: '420px',
            userSelect: 'none',
            fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
            color: '#FFFFFF',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(11, 13, 19, 0.95)',
              border: '2px solid #FF1E27',
              borderRadius: '12px',
              padding: '16px',
              boxShadow: '0 0 30px rgba(255, 30, 39, 0.4), 0 16px 40px rgba(0, 0, 0, 0.8)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div
              style={{
                fontSize: '0.75rem',
                fontWeight: 900,
                color: '#FF1E27',
                letterSpacing: '0.08em',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#FF1E27',
                }}
              />
              <span>QUICK ACCESS CONSOLE</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  playClickSound('switch');
                  setCurrentPage((p) => (p === 0 ? 1 : 0));
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF1E27';
                  e.currentTarget.style.borderColor = '#FF1E27';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-layer-group"></i>
                  <span>Switch Projects Page</span>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound('click');
                  window.open('https://github.com/Charan-718', '_blank', 'noopener,noreferrer');
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF1E27';
                  e.currentTarget.style.borderColor = '#FF1E27';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-brands fa-github"></i>
                  <span>GitHub Profile</span>
                </div>
                <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.7rem' }}></i>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClickSound('hologram');
                  window.dispatchEvent(new CustomEvent('character-materialize'));
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#FFFFFF',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#FF1E27';
                  e.currentTarget.style.borderColor = '#FF1E27';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-bolt"></i>
                  <span>Trigger Hologram Re-Scan</span>
                </div>
                <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.7rem' }}></i>
              </button>
            </div>
          </div>
        </Html>
      </group>
    </group>
  );
}
