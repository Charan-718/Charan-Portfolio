import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import Character from './Character';
import { isSoundEnabled, toggleSound, onSoundStateChange, playClickSound } from '../utils/soundEffects';

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
  const [pressedKeys, setPressedKeys] = useState({
    forward: false,
    back: false,
    left: false,
    right: false,
    run: false,
    stop: false,
  });

  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        setSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    return onSoundStateChange(setSoundActive);
  }, []);

  const sendKeyAction = (action, active) => {
    window.dispatchEvent(
      new CustomEvent('character-key-event', {
        detail: { action, active },
      })
    );
    setPressedKeys((prev) => ({ ...prev, [action]: active }));
    if (active) {
      if (action === 'stop') {
        playClickSound('brake');
      } else {
        playClickSound('click');
      }
    }
  };

  // Synchronize on-screen keycap active highlights with physical keyboard presses
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setPressedKeys((p) => ({ ...p, forward: true }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setPressedKeys((p) => ({ ...p, back: true }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setPressedKeys((p) => ({ ...p, left: true }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setPressedKeys((p) => ({ ...p, right: true }));
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setPressedKeys((p) => ({ ...p, run: true }));
      if (e.code === 'Space' || e.code === 'KeyX') setPressedKeys((p) => ({ ...p, stop: true }));
    };

    const handleKeyUp = (e) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') setPressedKeys((p) => ({ ...p, forward: false }));
      if (e.code === 'KeyS' || e.code === 'ArrowDown') setPressedKeys((p) => ({ ...p, back: false }));
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') setPressedKeys((p) => ({ ...p, left: false }));
      if (e.code === 'KeyD' || e.code === 'ArrowRight') setPressedKeys((p) => ({ ...p, right: false }));
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') setPressedKeys((p) => ({ ...p, run: false }));
      if (e.code === 'Space' || e.code === 'KeyX') setPressedKeys((p) => ({ ...p, stop: false }));
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleTelemetry = (data) => {
    setTelemetry(data);
    if (data.activeKeys) {
      setPressedKeys((prev) => ({
        ...prev,
        ...data.activeKeys,
      }));
    }
  };

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

  const renderKeycap = (keyChar, actionName, width = 58) => {
    const isActive = !!pressedKeys[actionName];
    return (
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          sendKeyAction(actionName, true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          sendKeyAction(actionName, false);
        }}
        onPointerLeave={() => {
          if (pressedKeys[actionName]) sendKeyAction(actionName, false);
        }}
        onPointerCancel={() => {
          if (pressedKeys[actionName]) sendKeyAction(actionName, false);
        }}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: '60px',
          borderRadius: '13px',
          border: '2.5px solid #000000',
          background: isActive ? '#8A0307' : '#D1D5DB',
          boxShadow: isActive
            ? '0 1px 0 #000000, 0 0 18px rgba(255, 30, 39, 0.95)'
            : '0 4px 0 #000000, 0 8px 14px rgba(0, 0, 0, 0.55)',
          transform: isActive ? 'translateY(3px)' : 'translateY(0)',
          cursor: 'pointer',
          padding: 0,
          userSelect: 'none',
          touchAction: 'manipulation',
          transition: 'transform 0.05s ease, box-shadow 0.05s ease, background 0.06s ease',
          outline: 'none',
          overflow: 'hidden',
          display: 'block',
        }}
        title={`Click or hold ${keyChar}`}
      >
        {/* Inner top key face matching Image 2 */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            right: '3px',
            height: '42px',
            borderRadius: '9px',
            border: '2px solid #000000',
            background: isActive
              ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 100%)'
              : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            transition: 'background 0.06s ease',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
              fontSize: '1.65rem',
              fontWeight: 900,
              lineHeight: 1,
              color: isActive ? '#FFFFFF' : '#000000',
              letterSpacing: '-0.02em',
            }}
          >
            {keyChar}
          </span>
        </div>

        {/* Diagonal corner bevel lines from reference illustration */}
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            left: '3px',
            width: '9px',
            height: '2px',
            background: '#000000',
            transform: 'rotate(45deg)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '4px',
            right: '3px',
            width: '9px',
            height: '2px',
            background: '#000000',
            transform: 'rotate(-45deg)',
            transformOrigin: 'top right',
            pointerEvents: 'none',
          }}
        />
      </button>
    );
  };

  const renderModifierKeycap = (label, actionName, width = 120) => {
    const isActive = !!pressedKeys[actionName];
    return (
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          sendKeyAction(actionName, true);
        }}
        onPointerUp={(e) => {
          e.preventDefault();
          sendKeyAction(actionName, false);
        }}
        onPointerLeave={() => {
          if (pressedKeys[actionName]) sendKeyAction(actionName, false);
        }}
        onPointerCancel={() => {
          if (pressedKeys[actionName]) sendKeyAction(actionName, false);
        }}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: '42px',
          borderRadius: '10px',
          border: '2.5px solid #000000',
          background: isActive ? '#8A0307' : '#D1D5DB',
          boxShadow: isActive
            ? '0 1px 0 #000000, 0 0 16px rgba(255, 30, 39, 0.95)'
            : '0 4px 0 #000000, 0 6px 12px rgba(0, 0, 0, 0.55)',
          transform: isActive ? 'translateY(3px)' : 'translateY(0)',
          cursor: 'pointer',
          padding: 0,
          userSelect: 'none',
          touchAction: 'manipulation',
          transition: 'transform 0.05s ease, box-shadow 0.05s ease, background 0.06s ease',
          outline: 'none',
          overflow: 'hidden',
          display: 'block',
        }}
        title={`Click or hold ${label}`}
      >
        {/* Inner top key face in same color as WASD */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            right: '3px',
            height: '27px',
            borderRadius: '6px',
            border: '2px solid #000000',
            background: isActive
              ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 100%)'
              : '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            pointerEvents: 'none',
            transition: 'background 0.06s ease',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: '0.78rem',
              fontWeight: 900,
              lineHeight: 1,
              color: isActive ? '#FFFFFF' : '#000000',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
            }}
          >
            {label}
          </span>
        </div>

        {/* Diagonal corner bevel lines */}
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            left: '3px',
            width: '8px',
            height: '2px',
            background: '#000000',
            transform: 'rotate(45deg)',
            transformOrigin: 'top left',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '3px',
            right: '3px',
            width: '8px',
            height: '2px',
            background: '#000000',
            transform: 'rotate(-45deg)',
            transformOrigin: 'top right',
            pointerEvents: 'none',
          }}
        />
      </button>
    );
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
      />      {/* TOP HEADER HUD - CLEAN & UNCLUTTERED */}
      <div
        style={{
          position: 'absolute',
          top: 24,
          left: 28,
          right: 28,
          zIndex: 30,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {/* Top Left: Standalone Symbols Only (No Card, No Text) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', pointerEvents: 'auto' }}>
          {/* Settings Symbol */}
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            data-sound="switch"
            aria-label="Settings"
            title="Arena Settings & Controls (Key: Esc)"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: settingsOpen ? '#FF1E27' : '#FFFFFF',
              fontSize: '1.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.18s ease, filter 0.18s ease, color 0.18s ease',
              outline: 'none',
              filter: settingsOpen ? 'drop-shadow(0 0 12px #FF1E27)' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2) rotate(45deg)';
              e.currentTarget.style.color = '#FF1E27';
              e.currentTarget.style.filter = 'drop-shadow(0 0 14px #FF1E27)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
              e.currentTarget.style.color = settingsOpen ? '#FF1E27' : '#FFFFFF';
              e.currentTarget.style.filter = settingsOpen ? 'drop-shadow(0 0 12px #FF1E27)' : 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))';
            }}
          >
            <i className="fa-solid fa-gear"></i>
          </button>

          {/* Hologram Symbol */}
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('character-materialize'));
            }}
            data-sound="hologram"
            aria-label="Replay Hologram"
            title="Replay Red Hologram Sequence (Key: R)"
            style={{
              background: 'transparent',
              border: 'none',
              padding: '6px',
              cursor: 'pointer',
              color: '#FF1E27',
              fontSize: '1.45rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.18s ease, filter 0.18s ease, color 0.18s ease',
              outline: 'none',
              filter: 'drop-shadow(0 2px 8px rgba(255, 30, 39, 0.45))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.22)';
              e.currentTarget.style.filter = 'drop-shadow(0 0 16px #FF1E27)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'drop-shadow(0 2px 8px rgba(255, 30, 39, 0.45))';
            }}
          >
            <i className="fa-solid fa-bolt"></i>
          </button>
        </div>

        {/* Top Right: Exit Workspace Button */}
        {onClose && (
          <div style={{ pointerEvents: 'auto' }}>
            <button
              type="button"
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
                gap: '7px',
                boxShadow: '0 4px 16px rgba(255, 30, 39, 0.4)',
                transition: 'all 0.2s ease',
              }}
              title="Return to Portfolio Overview"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Exit Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* IN-GAME SETTINGS MODAL POPUP */}
      {settingsOpen && (
        <div
          onClick={() => setSettingsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            animation: 'fadeIn 0.18s ease-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '640px',
              maxHeight: '88vh',
              overflowY: 'auto',
              background: 'rgba(12, 13, 19, 0.98)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              borderTop: '3px solid #FF1E27',
              borderRadius: '12px',
              padding: '24px 28px',
              boxShadow: '0 24px 70px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 30, 39, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '8px',
                    background: 'rgba(255, 30, 39, 0.15)',
                    border: '1px solid rgba(255, 30, 39, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <i className="fa-solid fa-gear" style={{ color: '#FF1E27', fontSize: '1.15rem' }}></i>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                    ARENA SETTINGS & CONTROLS
                  </h3>
                  <span style={{ fontSize: '0.68rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#FF6B72', letterSpacing: '0.08em' }}>
                    SYS // GAME_CONFIGURATION_MENU
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.14)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.15s ease',
                }}
                title="Close Settings (Esc)"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Section 1: Character & Rigging Status */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#94a3b8', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.06em' }}>
                ACTIVE AVATAR SPECIFICATION
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffffff' }}>
                  {modelLabel}
                </span>
                <span
                  style={{
                    color: '#ffffff',
                    background: 'rgba(255, 30, 39, 0.16)',
                    border: '1px solid rgba(255, 30, 39, 0.4)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <i className="fa-solid fa-user-check" style={{ color: '#FF1E27' }}></i> Dusky Skin (Charan)
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '6px' }}>
                Status:{' '}
                {telemetry.hasAnimations ? (
                  <strong style={{ color: '#FF6B72' }}>Rigged Animation "{telemetry.activeClip}"</strong>
                ) : (
                  <strong style={{ color: '#FF6B72' }}>Procedural Walking Rig Active (Symmetric Calibrated Leg Stride)</strong>
                )}
              </div>
            </div>

            {/* Section 2: Audio & Sound Controls */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#FF1E27', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
                AUDIO & HAPTICS
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(20, 22, 32, 0.8)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Tactile Button Sound FX</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Play subtle feedback clicks on actions</div>
                </div>
                <button
                  onClick={() => toggleSound()}
                  data-sound="switch"
                  title={soundActive ? 'Audio ON (Click to Mute)' : 'Muted (Click to Unmute)'}
                  style={{
                    background: soundActive ? 'linear-gradient(135deg, #FF1E27 0%, #C40A12 100%)' : 'rgba(255, 255, 255, 0.08)',
                    border: `1px solid ${soundActive ? '#FF1E27' : 'rgba(255, 255, 255, 0.2)'}`,
                    color: '#ffffff',
                    width: '36px',
                    height: '36px',
                    padding: 0,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                  aria-label={soundActive ? 'Mute Sound' : 'Enable Sound'}
                >
                  <i className={soundActive ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'}></i>
                </button>
              </div>
            </div>

            {/* Section 3: Locomotion & Camera Modes */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#FF1E27', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
                LOCOMOTION & CAMERA MODES
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
                {/* Camera Mode Toggle */}
                <div style={{ background: 'rgba(20, 22, 32, 0.8)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Camera System</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Toggle rear-chase follow vs free rotation</div>
                  <button
                    onClick={() => setCameraMode(cameraMode === 'chase' ? 'free' : 'chase')}
                    data-sound="switch"
                    style={{
                      background: cameraMode === 'chase' ? 'rgba(255, 30, 39, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${cameraMode === 'chase' ? '#FF1E27' : 'rgba(255, 255, 255, 0.18)'}`,
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className={cameraMode === 'chase' ? 'fa-solid fa-crosshairs' : 'fa-solid fa-arrows-rotate'} style={{ color: '#FF1E27' }}></i>
                    <span>{cameraMode === 'chase' ? 'GTA 3rd-Person Follow' : 'Free Orbit View'}</span>
                  </button>
                </div>

                {/* Arms Rigging Toggle */}
                <div style={{ background: 'rgba(20, 22, 32, 0.8)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#fff' }}>Arms Rigging Stance</div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Steady resting hands vs full skeletal swing</div>
                  <button
                    onClick={() => setLockArms(!lockArms)}
                    data-sound="switch"
                    style={{
                      background: lockArms ? 'rgba(255, 30, 39, 0.18)' : 'rgba(255, 255, 255, 0.08)',
                      border: `1px solid ${lockArms ? '#FF1E27' : 'rgba(255, 255, 255, 0.18)'}`,
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                    }}
                  >
                    <i className={lockArms ? 'fa-solid fa-shield-halved' : 'fa-solid fa-person-walking'} style={{ color: '#FF1E27' }}></i>
                    <span>{lockArms ? 'Arms: Steady (GTA Locomotion)' : 'Arms: Free'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 4: 3D Character Model Switcher */}
            <div>
              <div style={{ fontSize: '0.72rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#FF1E27', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
                3D CHARACTER MODEL SELECTOR
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                    background: 'rgba(20, 22, 32, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FFFFFF',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    outline: 'none',
                    width: '100%',
                  }}
                >
                  <option value={publicUrl + '/my-meshy-model.glb'}>Meshy Character (Dusky Skin — Charan)</option>
                  <option value={publicUrl + '/my-meshy-model-backup.glb'}>Meshy Character (Original Pale Skin Backup)</option>
                  <option value={publicUrl + '/models/sample_rigged_character.glb'}>Vanguard Rigged Soldier (Blender/Mixamo — Steady Hands)</option>
                  <option value={publicUrl + '/models/character.glb'}>/models/character.glb (Mixamo Rigged)</option>
                  <option value="custom">Upload / Drop Custom .glb...</option>
                </select>

                <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px dashed rgba(255, 255, 255, 0.25)',
                      color: '#ffffff',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-cloud-arrow-up" style={{ color: '#FF1E27' }}></i>
                    <span>Upload Custom .glb / .gltf</span>
                  </button>

                  <a
                    href={publicUrl + '/character_for_mixamo.zip'}
                    download="character_for_mixamo.zip"
                    data-sound="pop"
                    style={{
                      flex: 1,
                      background: 'rgba(255, 30, 39, 0.14)',
                      border: '1px solid rgba(255, 30, 39, 0.35)',
                      color: '#ffffff',
                      textDecoration: 'none',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <i className="fa-solid fa-download" style={{ color: '#FF1E27' }}></i>
                    <span>Download Model Zip</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Section 5: Keyboard Shortcuts Reference */}
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '12px 14px',
              }}
            >
              <div style={{ fontSize: '0.7rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.06em' }}>
                CONTROLS CHEATSHEET
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', fontSize: '0.75rem' }}>
                <div><kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>W / S</kbd> Walk Front / Back</div>
                <div><kbd style={{ background: '#252736', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>A / D</kbd> Rotate Model</div>
                <div><kbd style={{ background: '#252736', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>SHIFT</kbd> Sprint Run</div>
                <div><kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>SPACE</kbd> Stop / Brake</div>
                <div><kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>R</kbd> Replay Hologram</div>
                <div><kbd style={{ background: '#252736', color: '#fff', padding: '1px 5px', borderRadius: '3px', fontWeight: 900 }}>MOUSE</kbd> Aim / Orbit View</div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                data-sound="pop"
                style={{
                  background: 'linear-gradient(135deg, #FF1E27 0%, #C40A12 100%)',
                  border: 'none',
                  color: '#ffffff',
                  padding: '9px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(255, 30, 39, 0.4)',
                }}
              >
                <span>Close Settings</span>
                <kbd style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '1px 5px', borderRadius: '3px', fontSize: '0.68rem' }}>ESC</kbd>
              </button>
            </div>
          </div>
        </div>
      )}


      {/* BOTTOM LEFT: FLOATING WASD & ACTION CONTROLS (NO CARD BACKGROUND) */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 30,
          pointerEvents: 'auto',
          userSelect: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px' }}>
          {/* WASD Inverted-T Pad matching Image 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {/* Top Key: W */}
            <div>
              {renderKeycap('W', 'forward', 58)}
            </div>
            {/* Bottom Keys: A, S, D */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {renderKeycap('A', 'left', 58)}
              {renderKeycap('S', 'back', 58)}
              {renderKeycap('D', 'right', 58)}
            </div>
          </div>

          {/* Action Modifiers: SPACE & SHIFT in identical mechanical keycap style and color */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {renderModifierKeycap('SPACE', 'stop', 114)}
            {renderModifierKeycap('SHIFT', 'run', 114)}
          </div>
        </div>

        {/* Minimal Floating Hint */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', textShadow: '0 2px 6px rgba(0,0,0,0.95)' }}>
          <span style={{ fontSize: '0.62rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#cbd5e1', letterSpacing: '0.04em' }}>
            CLICK TO MOVE OR USE WASD KEYBOARD
          </span>
          <span style={{ fontSize: '0.62rem', color: '#FF6B72', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <i className="fa-solid fa-computer-mouse"></i> AIM VIEW
          </span>
        </div>
      </div>

      {/* BOTTOM RIGHT: TELEMETRY BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 30,
          pointerEvents: 'auto',
        }}
      >
        {/* Telemetry Panel - Swiss Modular Card */}
        <div
          style={{
            background: 'rgba(12, 13, 19, 0.95)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderTop: '2px solid #FF1E27',
            borderRadius: '10px',
            padding: '10px 16px',
            fontSize: '0.82rem',
            color: '#94a3b8',
            fontVariantNumeric: 'tabular-nums',
            display: 'flex',
            gap: '14px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span>Action: <strong style={{ color: '#FF1E27' }}>{telemetry.activeClip}</strong></span>
          <span>Speed: <strong style={{ color: '#fff' }}>{telemetry.speed.toFixed(1)} m/s</strong></span>
          <span>Facing: <strong style={{ color: '#fff' }}>{telemetry.facingDeg}°</strong></span>
          <span>Cam: <strong style={{ color: '#ffffff' }}>{telemetry.camDeg}°</strong></span>
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
              onTelemetryChange={handleTelemetry}
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

