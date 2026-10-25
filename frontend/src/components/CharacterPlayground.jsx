import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls, OrbitControls } from '@react-three/drei';
import Character from './Character';
import DeveloperWorkspaceScene from './DeveloperWorkspaceScene';
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

export default function CharacterPlayground({ onClose, isCurtainActive = false }) {
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
      if (e.code === 'KeyR') window.dispatchEvent(new CustomEvent('character-materialize'));
      if (e.code === 'KeyC') setCameraMode((p) => (p === 'chase' ? 'free' : 'chase'));
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

  const renderTactileHUDKeycap = ({
    id,
    icon,
    label,
    hotkey,
    isRed = false,
    isActive = false,
    onClick,
    title,
    width = 56,
    height = 56,
    sound = 'switch',
  }) => {
    const isCurrentlyActive = isActive;
    const baseBg = isRed || isCurrentlyActive ? '#8A0307' : '#D1D5DB';
    const faceBg = isRed || isCurrentlyActive
      ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 100%)'
      : '#FFFFFF';
    const glyphColor = isRed || isCurrentlyActive ? '#FFFFFF' : '#000000';
    const shadowColor = isRed || isCurrentlyActive
      ? 'rgba(255, 30, 39, 0.65)'
      : 'rgba(0, 0, 0, 0.55)';

    const shelfHeight = hotkey ? 17 : 14;
    const faceHeight = height - shelfHeight;

    return (
      <button
        key={id}
        type="button"
        onClick={onClick}
        data-sound={sound}
        title={title}
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          borderRadius: '12px',
          border: '2.5px solid #000000',
          background: baseBg,
          boxShadow: isCurrentlyActive
            ? '0 1px 0 #000000, 0 0 18px rgba(255, 30, 39, 0.95)'
            : `0 4px 0 #000000, 0 8px 16px ${shadowColor}`,
          transform: isCurrentlyActive ? 'translateY(3px)' : 'translateY(0)',
          cursor: 'pointer',
          padding: 0,
          userSelect: 'none',
          touchAction: 'manipulation',
          transition: 'transform 0.08s ease, box-shadow 0.08s ease, filter 0.08s ease',
          outline: 'none',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => {
          if (!isCurrentlyActive) {
            e.currentTarget.style.filter = 'brightness(1.08)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = 'none';
          e.currentTarget.style.transform = isCurrentlyActive ? 'translateY(3px)' : 'translateY(0)';
          e.currentTarget.style.boxShadow = isCurrentlyActive
            ? '0 1px 0 #000000, 0 0 18px rgba(255, 30, 39, 0.95)'
            : `0 4px 0 #000000, 0 8px 16px ${shadowColor}`;
        }}
        onPointerDown={(e) => {
          e.currentTarget.style.transform = 'translateY(3px)';
          e.currentTarget.style.boxShadow = isRed || isCurrentlyActive
            ? '0 1px 0 #000000, 0 0 14px rgba(255, 30, 39, 0.9)'
            : '0 1px 0 #000000, 0 3px 8px rgba(0, 0, 0, 0.6)';
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = isCurrentlyActive ? 'translateY(3px)' : 'translateY(0)';
          e.currentTarget.style.boxShadow = isCurrentlyActive
            ? '0 1px 0 #000000, 0 0 18px rgba(255, 30, 39, 0.95)'
            : `0 4px 0 #000000, 0 8px 16px ${shadowColor}`;
        }}
      >
        {/* Inner top key face matching WASD physical mechanical keys */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '3px',
            right: '3px',
            height: `${faceHeight}px`,
            borderRadius: '8px',
            border: '2px solid #000000',
            background: faceBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: label ? '8px' : '0px',
            pointerEvents: 'none',
          }}
        >
          {icon && (
            <i
              className={icon}
              style={{
                fontSize: label ? '1.05rem' : '1.35rem',
                color: glyphColor,
                lineHeight: 1,
              }}
            ></i>
          )}
          {label && (
            <span
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: '0.82rem',
                fontWeight: 900,
                color: glyphColor,
                letterSpacing: '0.04em',
                lineHeight: 1,
                textTransform: 'uppercase',
              }}
            >
              {label}
            </span>
          )}
        </div>

        {/* Micro Hotkey Badge at bottom underside */}
        {hotkey && (
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: '0.58rem',
              fontWeight: 900,
              color: isRed || isCurrentlyActive ? '#FFFFFF' : '#000000',
              letterSpacing: '0.05em',
              lineHeight: 1,
              pointerEvents: 'none',
              textTransform: 'uppercase',
            }}
          >
            {hotkey}
          </div>
        )}

        {/* Diagonal corner bevel lines from reference illustration */}
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
        {/* Top Left: Tactile Mechanical Keycaps HUD */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          {/* Settings Keycap */}
          {renderTactileHUDKeycap({
            id: 'hud-settings',
            icon: 'fa-solid fa-gear',
            hotkey: 'ESC',
            isRed: settingsOpen,
            isActive: settingsOpen,
            onClick: () => setSettingsOpen((prev) => !prev),
            title: 'Arena Settings & Controls (Key: Esc)',
            width: 58,
            height: 58,
            sound: 'switch',
          })}

          {/* Hologram Keycap */}
          {renderTactileHUDKeycap({
            id: 'hud-hologram',
            icon: 'fa-solid fa-bolt',
            hotkey: 'R',
            isRed: true,
            isActive: false,
            onClick: () => {
              window.dispatchEvent(new CustomEvent('character-materialize'));
            },
            title: 'Replay Red Hologram Sequence (Key: R)',
            width: 58,
            height: 58,
            sound: 'hologram',
          })}

          {/* Audio Keycap */}
          {renderTactileHUDKeycap({
            id: 'hud-audio',
            icon: soundActive ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark',
            hotkey: soundActive ? 'VOL' : 'MUTE',
            isRed: false,
            isActive: !soundActive,
            onClick: () => toggleSound(),
            title: soundActive ? 'Tactile Audio: ON (Click to Mute)' : 'Tactile Audio: MUTED (Click to Enable)',
            width: 58,
            height: 58,
            sound: 'switch',
          })}

          {/* Tracker Camera Follow / Free Orbit Keycap */}
          {renderTactileHUDKeycap({
            id: 'hud-tracker',
            icon: 'fa-solid fa-crosshairs',
            hotkey: cameraMode === 'chase' ? 'LOCK' : 'FREE',
            isRed: cameraMode === 'chase',
            isActive: cameraMode === 'chase',
            onClick: () => setCameraMode((prev) => (prev === 'chase' ? 'free' : 'chase')),
            title: cameraMode === 'chase' ? 'Camera Tracker: GTA Chase Follow Locked (Key: C to toggle)' : 'Camera Tracker: Free Orbit (Key: C to toggle)',
            width: 58,
            height: 58,
            sound: 'switch',
          })}
        </div>

        {/* Top Right: Exit Workspace Tactile Mechanical Keycap */}
        {onClose && (
          <div style={{ pointerEvents: 'auto' }}>
            {renderTactileHUDKeycap({
              id: 'hud-exit',
              icon: 'fa-solid fa-arrow-left',
              label: 'EXIT WORKSPACE',
              hotkey: null,
              isRed: true,
              onClick: onClose,
              title: 'Exit 3D Workspace and return to Portfolio',
              width: 184,
              height: 52,
              sound: 'pop',
            })}
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
                        val.includes('my-meshy-solid-model.glb')
                          ? 'Meshy Character (Solid Model)'
                          : 'Meshy Character (Dusky Skin — Charan)'
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
                  <option value={publicUrl + '/my-meshy-solid-model.glb'}>Meshy Character (Solid Model)</option>
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

      {/* BOTTOM RIGHT: TACTILE MECHANICAL TELEMETRY TRACKER */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 30,
          pointerEvents: 'auto',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            position: 'relative',
            borderRadius: '12px',
            border: '2.5px solid #000000',
            background: '#D1D5DB',
            boxShadow: '0 4px 0 #000000, 0 8px 24px rgba(0, 0, 0, 0.65)',
            padding: '3px 3px 14px 3px',
          }}
        >
          {/* Inner Recessed Telemetry Console Screen */}
          <div
            style={{
              position: 'relative',
              borderRadius: '8px',
              border: '2px solid #000000',
              background: 'linear-gradient(180deg, #161822 0%, #0A0B10 100%)',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
            }}
          >
            {/* Interactive Tracker Mode Keycap Pill */}
            <button
              type="button"
              onClick={() => setCameraMode((prev) => (prev === 'chase' ? 'free' : 'chase'))}
              data-sound="switch"
              title="Click to toggle Camera Tracker (GTA Chase vs Free Orbit)"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: cameraMode === 'chase'
                  ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 100%)'
                  : '#1E293B',
                border: '1.5px solid #000000',
                borderRadius: '6px',
                padding: '4px 9px',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.68rem',
                cursor: 'pointer',
                letterSpacing: '0.06em',
                boxShadow: cameraMode === 'chase'
                  ? '0 0 12px rgba(255, 30, 39, 0.7)'
                  : 'none',
                outline: 'none',
                transition: 'all 0.12s ease',
              }}
            >
              <i
                className="fa-solid fa-crosshairs"
                style={{
                  fontSize: '0.72rem',
                }}
              ></i>
              <span>TRACKER: {cameraMode === 'chase' ? 'LOCKED' : 'FREE'}</span>
            </button>

            {/* Action State Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.64rem', fontWeight: 800, color: '#94A3B8', letterSpacing: '0.05em' }}>
                ACTION
              </span>
              <span
                style={{
                  background: '#FF1E27',
                  border: '1.5px solid #000000',
                  borderRadius: '5px',
                  padding: '2px 8px',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  letterSpacing: '0.02em',
                  boxShadow: '0 0 8px rgba(255, 30, 39, 0.4)',
                }}
              >
                {telemetry.activeClip}
              </span>
            </div>

            {/* Numeric Telemetry Badges */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem', fontVariantNumeric: 'tabular-nums' }}>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', marginRight: '4px' }}>SPD</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 900 }}>{telemetry.speed.toFixed(1)} m/s</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', marginRight: '4px' }}>DIR</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 900 }}>{telemetry.facingDeg}°</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', marginRight: '4px' }}>CAM</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 900 }}>{telemetry.camDeg}°</strong>
              </div>
              <div>
                <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', marginRight: '4px' }}>POS</span>
                <strong style={{ color: '#FFFFFF', fontWeight: 900 }}>X:{telemetry.pos.x} Z:{telemetry.pos.z}</strong>
              </div>
            </div>
          </div>

          {/* Micro Underside Label with Diagonal Bevel Lines */}
          <div
            style={{
              position: 'absolute',
              bottom: '2px',
              left: '12px',
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: '0.55rem',
              fontWeight: 800,
              color: '#000000',
              letterSpacing: '0.08em',
              pointerEvents: 'none',
              textTransform: 'uppercase',
            }}
          >
            REALTIME LOCOMOTION TELEMETRY RIG
          </div>

          {/* Diagonal Corner Bevel Lines matching WASD reference */}
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
        </div>
      </div>

      {/* UNIFIED 3D WORKSPACE CANVAS (TRUE REAL-WORLD 3D DEPTH) */}
      <KeyboardControls map={keyboardMap}>
        <Canvas
          shadows
          camera={{ position: [0, 2.62, -8.5], fov: 48 }}
          style={{ width: '100%', height: '100%', cursor: cameraMode === 'chase' ? 'grab' : 'default' }}
        >
          {/* Futuristic Cyber Developer Workspace Command Center */}
          <DeveloperWorkspaceScene onClose={onClose} />

          {/* Playable Character with GTA Locomotion & Steady Hands */}
          <Suspense fallback={null}>
            <Character
              key={`${activeModel}-${lockArms}`}
              modelUrl={activeModel}
              cameraFollow={cameraMode === 'chase'}
              lockArms={lockArms}
              controlMode="gta"
              isCurtainActive={isCurtainActive}
              onTelemetryChange={handleTelemetry}
            />
          </Suspense>

          {/* Free Camera Controls (when in free orbit mode) */}
          {cameraMode === 'free' && (
            <OrbitControls target={[0, 1.25, 0]} maxPolarAngle={Math.PI / 2.05} />
          )}
        </Canvas>
      </KeyboardControls>
    </div>
  );
}

