import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import Character from './Character';
import { isSoundEnabled, toggleSound, onSoundStateChange } from '../utils/soundEffects';

const keyboardMap = [
  { name: 'forward', keys: ['KeyW', 'ArrowUp'] },
  { name: 'back', keys: ['KeyS', 'ArrowDown'] },
  { name: 'left', keys: ['KeyA', 'ArrowLeft'] },
  { name: 'right', keys: ['KeyD', 'ArrowRight'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
  { name: 'stop', keys: ['Space', 'KeyX'] },
  { name: 'materialize', keys: ['KeyR'] },
];

export default function CharacterPlayground({ onClose }) {
  const publicUrl = process.env.PUBLIC_URL || '';
  const [cameraMode, setCameraMode] = useState('chase'); // 'chase' or 'free'
  const [lockArms, setLockArms] = useState(true); // Steady hands: only legs walk
  const [activeModel, setActiveModel] = useState(publicUrl + '/my-meshy-model.glb');
  const [modelLabel, setModelLabel] = useState('Meshy Character (Dusky Skin — Charan)');
  const [soundActive, setSoundActive] = useState(isSoundEnabled());

  useEffect(() => {
    return onSoundStateChange(setSoundActive);
  }, []);
  const [telemetry, setTelemetry] = useState({
    moving: false,
    running: false,
    speed: 0,
    pos: { x: '0.00', z: '0.00' },
    facingDeg: 0,
    camDeg: 0,
    hasAnimations: true,
    activeClip: 'Idle (Steady Hands)',
    lockArms: true,
  });

  const fileInputRef = useRef(null);

  // Allow uploading or dragging in a custom rigged GLB directly in the browser
  const handleFileUpload = (file) => {
    if (!file) return;
    if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
      const url = URL.createObjectURL(file);
      setActiveModel(url);
      setModelLabel(file.name);
    } else {
      alert('Please upload a .glb file (e.g. character.glb exported from Mixamo/Blender).');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        width: '100vw',
        height: '100vh',
        background: 'radial-gradient(circle at center, #14151c 0%, #08080a 100%)',
        overflow: 'hidden',
        color: '#f0f3fa',
        fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Hidden file input for loading rigged GLB directly */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".glb,.gltf"
        style={{ display: 'none' }}
        onChange={(e) => {
          if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
        }}
      />

      {/* TOP HEADER HUD */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 24,
          right: 24,
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none',
        }}
      >
        {/* Title and Rig Status */}
        <div
          style={{
            background: 'rgba(16, 17, 24, 0.94)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '14px 20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            pointerEvents: 'auto',
            maxWidth: '620px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.6rem' }}>🎮</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Charan 3D Character Arena — GTA Mode
                </h2>
                <span style={{ fontSize: '0.78rem', background: '#25293d', padding: '2px 8px', borderRadius: '4px', color: '#a5b4fc', fontWeight: 700 }}>
                  {modelLabel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span style={{ fontSize: '0.82rem', color: '#6ee7b7', fontWeight: 600 }}>
                  {telemetry.hasAnimations
                    ? `Rigged Locomotion: "${telemetry.activeClip}"`
                    : 'Procedural Leg Rig Active (Legs Walk, Steady Hands)'}
                  {' • '}
                  <span style={{ color: '#93c5fd' }}>
                    {lockArms ? 'Arms Steady (Legs Walk)' : 'Arms Free'}
                  </span>
                  {' • '}
                  <span style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.16)', padding: '2px 7px', borderRadius: '4px', fontSize: '0.74rem', fontWeight: 700 }}>
                    ✨ Dusky Skin (Charan)
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Model Switcher */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Sound Audio Mute / Unmute Toggle */}
          <button
            onClick={() => toggleSound()}
            data-sound="switch"
            style={{
              background: soundActive ? 'rgba(34, 197, 94, 0.16)' : 'rgba(107, 114, 128, 0.2)',
              border: `1px solid ${soundActive ? '#22c55e' : '#6b7280'}`,
              color: soundActive ? '#86efac' : '#9ca3af',
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: soundActive ? '0 0 12px rgba(34, 197, 94, 0.25)' : 'none',
            }}
            title="Sound Controls: click to toggle button sound effects on/off"
          >
            <span style={{ fontSize: '1rem' }}>{soundActive ? '🔊' : '🔇'}</span>
            <span>{soundActive ? 'Audio ON' : 'Muted'}</span>
          </button>

          {/* Emergency Stop / Brake Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('character-stop'));
            }}
            data-sound="brake"
            style={{
              background: 'rgba(255, 30, 39, 0.2)',
              border: '1px solid #FF1E27',
              color: '#FF6B72',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            title="Emergency Stop / Brake: halts character immediately and settles into Stand At Ease (Key: Space)"
          >
            <span>🛑</span> Stop / Brake <kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.74rem' }}>Space</kbd>
          </button>

          {/* Replay Hologram Creation Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('character-materialize'));
            }}
            data-sound="hologram"
            style={{
              background: 'rgba(255, 30, 39, 0.16)',
              border: '1px solid #FF3840',
              color: '#ff8a90',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 14px rgba(255, 30, 39, 0.25)',
              transition: 'all 0.2s ease',
            }}
            title="Initiate Sci-Fi Red Hologram creation / materialization sequence (Key: R)"
          >
            <span>⚡</span> Hologram <kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.74rem' }}>R</kbd>
          </button>

          {/* Steady Arms / Leg Walk Toggle */}
          <button
            onClick={() => setLockArms(!lockArms)}
            data-sound="switch"
            style={{
              background: lockArms ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
              border: `1px solid ${lockArms ? '#10b981' : '#ef4444'}`,
              color: lockArms ? '#6ee7b7' : '#fca5a5',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
            title="When active, the upper body/hands stay locked in steady resting pose while only legs walk."
          >
            {lockArms ? '🛡️ Arms: Steady (Legs Walk Only)' : '🏃 Arms: Free Swing'}
          </button>

          {/* Camera Mode Toggle */}
          <button
            onClick={() => setCameraMode(cameraMode === 'chase' ? 'free' : 'chase')}
            data-sound="switch"
            style={{
              background: 'rgba(20, 22, 33, 0.88)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#fff',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.85rem',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.2s ease',
            }}
          >
            {cameraMode === 'chase' ? '🎯 GTA 3rd-Person' : '🔄 Free Orbit'}
          </button>

          {/* Model Switcher Menu */}
          <select
            value={activeModel}
            data-sound="pop"
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'custom') {
                fileInputRef.current?.click();
              } else {
                setActiveModel(val);
                setModelLabel(
                  val.includes('sample_rigged_character.glb')
                    ? 'Vanguard Rigged Soldier (Blender/Mixamo)'
                    : val.includes('my-meshy-model-backup.glb')
                    ? 'Meshy Character (Original Pale Skin Backup)'
                    : val.includes('my-meshy-model.glb')
                    ? 'Meshy Character (Dusky Skin — Charan)'
                    : 'character.glb'
                );
              }
            }}
            style={{
              background: 'rgba(20, 22, 33, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              outline: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <option value={publicUrl + '/my-meshy-model.glb'}>📦 Meshy Character (Dusky Skin — Charan)</option>
            <option value={publicUrl + '/my-meshy-model-backup.glb'}>📦 Meshy Character (Original Pale Skin Backup)</option>
            <option value={publicUrl + '/models/sample_rigged_character.glb'}>✨ Vanguard Rigged Soldier (Blender/Mixamo — Steady Hands)</option>
            <option value={publicUrl + '/models/character.glb'}>🎯 /models/character.glb (Mixamo Rigged)</option>
            <option value="custom">📂 Upload / Drop Custom .glb...</option>
          </select>

          {/* Close Button to return to Portfolio */}
          {onClose && (
            <button
              onClick={onClose}
              data-sound="pop"
              style={{
                background: '#FF1E27',
                border: 'none',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 4px 16px rgba(255, 30, 39, 0.4)',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              ✕ Exit Workspace
            </button>
          )}
        </div>
      </div>


      {/* BOTTOM LEFT: GTA CONTROLS GUIDE */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 30,
          background: 'rgba(15, 17, 26, 0.94)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '10px',
          padding: '16px 20px',
          pointerEvents: 'none',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 800, textTransform: 'uppercase', color: '#FF1E27', letterSpacing: '0.05em' }}>
            GTA Locomotion & Camera
          </div>
          <span style={{ fontSize: '0.72rem', background: 'rgba(255,30,39,0.15)', color: '#FF7B80', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
            Active
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, auto)', gap: '8px 18px', fontSize: '0.84rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#272a38', padding: '3px 8px', borderRadius: '4px', border: '1px solid #43485c', fontWeight: 700, color: '#f1f5f9' }}>W / S</kbd>
            <span style={{ color: '#cbd5e1' }}>Walk Front / Back</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#272a38', padding: '3px 8px', borderRadius: '4px', border: '1px solid #43485c', fontWeight: 700, color: '#f1f5f9' }}>A / D</kbd>
            <span style={{ color: '#cbd5e1' }}>Rotate Model (Cam Steady)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#FF1E27', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FF3840', fontWeight: 800 }}>Space</kbd>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Stop / Brake (Instant Halt)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#272a38', padding: '3px 8px', borderRadius: '4px', border: '1px solid #43485c', fontWeight: 700, color: '#f1f5f9' }}>Shift</kbd>
            <span style={{ color: '#cbd5e1' }}>Sprint (Gentle Stride)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#272a38', padding: '3px 8px', borderRadius: '4px', border: '1px solid #43485c', fontWeight: 700, color: '#f1f5f9' }}>Mouse</kbd>
            <span style={{ color: '#cbd5e1' }}>Rotate Camera View / Aim</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#272a38', padding: '3px 8px', borderRadius: '4px', border: '1px solid #43485c', fontWeight: 700, color: '#f1f5f9' }}>Scroll</kbd>
            <span style={{ color: '#cbd5e1' }}>Zoom Camera</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <kbd style={{ background: '#FF1E27', color: '#fff', padding: '3px 8px', borderRadius: '4px', border: '1px solid #FF3840', fontWeight: 800 }}>R</kbd>
            <span style={{ color: '#ffffff', fontWeight: 700 }}>Replay Hologram Effect</span>
          </div>
        </div>
      </div>

      {/* BOTTOM RIGHT: TELEMETRY & DOWNLOAD LINK */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '10px',
        }}
      >
        {/* Ready Mixamo Zip Download Banner */}
        <a
          href={publicUrl + '/character_for_mixamo.zip'}
          download="character_for_mixamo.zip"
          data-sound="pop"
          title="Download the prepared character OBJ, MTL, and texture archive ready to auto-rig on mixamo.com"
          style={{
            background: 'linear-gradient(135deg, #FF1E27 0%, #D40C14 100%)',
            color: '#fff',
            textDecoration: 'none',
            padding: '10px 16px',
            borderRadius: '8px',
            fontWeight: 800,
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 16px rgba(255, 30, 39, 0.4)',
            transition: 'transform 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <span>📦</span>
          <span>Download character_for_mixamo.zip</span>
        </a>

        {/* Telemetry Panel */}
        <div
          style={{
            background: 'rgba(15, 17, 26, 0.94)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '0.82rem',
            color: '#94a3b8',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            gap: '14px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          }}
        >
          <span>Action: <strong style={{ color: '#FF3840' }}>{telemetry.activeClip}</strong></span>
          <span>Speed: <strong style={{ color: '#fff' }}>{telemetry.speed.toFixed(1)} m/s</strong></span>
          <span>Facing: <strong style={{ color: '#fff' }}>{telemetry.facingDeg}°</strong></span>
          <span>Cam: <strong style={{ color: '#a5b4fc' }}>{telemetry.camDeg}°</strong></span>
          <span>Pos: <strong style={{ color: '#fff' }}>X:{telemetry.pos.x} Z:{telemetry.pos.z}</strong></span>
        </div>
      </div>

      {/* MAIN 3D CANVAS */}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 3, 6], fov: 45 }}
          style={{ width: '100%', height: '100%', cursor: cameraMode === 'chase' ? 'grab' : 'default' }}
        >
          {/* Lighting */}
          <ambientLight intensity={1.2} />
          <directionalLight
            position={[5, 10, 6]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
          />
          <directionalLight position={[-5, 5, -5]} intensity={0.6} color="#93c5fd" />

          {/* Ground Arena Floor */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[250, 250]} />
            <meshStandardMaterial color="#14151a" roughness={0.7} metalness={0.1} />
          </mesh>

          {/* Grid Helper with Red Accent */}
          <gridHelper args={[250, 100, '#FF1E27', '#222533']} position={[0, 0.001, 0]} />

          {/* Outer ring marker */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[12, 12.15, 64]} />
            <meshBasicMaterial color="#FF1E27" transparent opacity={0.4} />
          </mesh>

          {/* Playable Character with GTA Locomotion & Steady Hands */}
          <Suspense fallback={null}>
            <Character
              key={`${activeModel}-${lockArms}`}
              modelUrl={activeModel}
              cameraFollow={cameraMode === 'chase'}
              lockArms={lockArms}
              controlMode="gta"
              onTelemetryChange={setTelemetry}
            />
          </Suspense>

          {/* Free Camera Controls (when in free orbit mode) */}
          {cameraMode === 'free' && (
            <OrbitControls target={[0, 1, 0]} maxPolarAngle={Math.PI / 2.05} />
          )}
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

