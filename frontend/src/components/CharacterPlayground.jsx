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

  const renderKeycap = (keyChar, sublabel, actionName, width = 58) => {
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
          borderRadius: '12px',
          border: isActive ? '2.5px solid #FF1E27' : '2.5px solid #000000',
          background: isActive
            ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 75%, #A1050B 100%)'
            : 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FB 75%, #DCE2EC 100%)',
          boxShadow: isActive
            ? '0 0 18px rgba(255, 30, 39, 0.85), 0 2px 0 #7A0206'
            : '0 5px 0 #000000, 0 8px 16px rgba(0, 0, 0, 0.55)',
          transform: isActive ? 'translateY(3px)' : 'translateY(0)',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          userSelect: 'none',
          touchAction: 'manipulation',
          transition: 'transform 0.06s ease, box-shadow 0.06s ease, background 0.08s ease',
          outline: 'none',
          overflow: 'hidden',
        }}
        title={`Click or hold ${keyChar} to ${sublabel.toLowerCase()}`}
      >
        {/* Inner key face tray matching the drawing */}
        <div
          style={{
            position: 'absolute',
            top: '3px',
            left: '4px',
            right: '4px',
            bottom: '14px',
            borderRadius: '7px',
            border: isActive ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(0, 0, 0, 0.08)',
            background: isActive
              ? 'linear-gradient(180deg, rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0.05) 100%)'
              : 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', system-ui, -apple-system, sans-serif",
              fontSize: '1.5rem',
              fontWeight: 900,
              lineHeight: 1,
              color: isActive ? '#FFFFFF' : '#0B0D13',
              letterSpacing: '-0.02em',
            }}
          >
            {keyChar}
          </span>
        </div>

        {/* Lower beveled chin sublabel */}
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: '0.52rem',
            fontWeight: 800,
            letterSpacing: '0.04em',
            color: isActive ? '#FFFFFF' : '#475569',
            textTransform: 'uppercase',
            pointerEvents: 'none',
          }}
        >
          {sublabel}
        </span>
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
        {/* Title and Rig Status - Swiss Modular Card */}
        <div
          style={{
            background: 'rgba(12, 13, 19, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.14)',
            borderTop: '2px solid #FF1E27',
            borderRadius: '10px',
            padding: '14px 20px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
            pointerEvents: 'auto',
            maxWidth: '620px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                background: 'rgba(255, 30, 39, 0.12)',
                border: '1px solid rgba(255, 30, 39, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <i className="fa-solid fa-gamepad" style={{ fontSize: '1.25rem', color: '#FF1E27' }}></i>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
                  Charan 3D Character Arena — GTA Mode
                </h2>
                <span
                  style={{
                    fontSize: '0.74rem',
                    background: '#1a1c27',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  }}
                >
                  {modelLabel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    display: 'inline-block',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#FF1E27',
                    boxShadow: '0 0 8px #FF1E27',
                  }}
                />
                <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>
                  {telemetry.hasAnimations ? (
                    <>
                      Rigged: <strong style={{ color: '#FF6B72' }}>"{telemetry.activeClip}"</strong>
                    </>
                  ) : (
                    <>
                      Procedural Rig: <strong style={{ color: '#FF6B72' }}>Legs Walk</strong>
                    </>
                  )}
                  {' • '}
                  <span style={{ color: '#ffffff' }}>
                    {lockArms ? 'Arms Steady' : 'Arms Free'}
                  </span>
                  {' • '}
                  <span
                    style={{
                      color: '#ffffff',
                      background: 'rgba(255, 30, 39, 0.14)',
                      border: '1px solid rgba(255, 30, 39, 0.35)',
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
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Model Switcher - Swiss Red/Black/White */}
        <div style={{ display: 'flex', gap: '10px', pointerEvents: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Sound Audio Mute / Unmute Toggle */}
          <button
            onClick={() => toggleSound()}
            data-sound="switch"
            style={{
              background: soundActive ? 'rgba(255, 30, 39, 0.18)' : 'rgba(12, 13, 19, 0.92)',
              border: `1px solid ${soundActive ? '#FF1E27' : 'rgba(255, 255, 255, 0.18)'}`,
              color: soundActive ? '#FFFFFF' : '#94a3b8',
              padding: '10px 14px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: soundActive ? '0 0 14px rgba(255, 30, 39, 0.35)' : 'none',
            }}
            title="Sound Controls: click to toggle button sound effects on/off"
          >
            <i className={soundActive ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'} style={{ fontSize: '0.92rem', color: soundActive ? '#FF1E27' : '#94a3b8' }}></i>
            <span>{soundActive ? 'Audio ON' : 'Muted'}</span>
          </button>

          {/* Emergency Stop / Brake Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('character-stop'));
            }}
            data-sound="brake"
            style={{
              background: 'rgba(255, 30, 39, 0.18)',
              border: '1px solid #FF1E27',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 0 12px rgba(255, 30, 39, 0.25)',
            }}
            title="Emergency Stop / Brake: halts character immediately and settles into Stand At Ease (Key: Space)"
          >
            <i className="fa-solid fa-hand" style={{ color: '#FF6B72' }}></i>
            <span>Stop / Brake</span>
            <kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>Space</kbd>
          </button>

          {/* Replay Hologram Creation Button */}
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('character-materialize'));
            }}
            data-sound="hologram"
            style={{
              background: 'rgba(255, 30, 39, 0.18)',
              border: '1px solid #FF1E27',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 800,
              fontSize: '0.84rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 0 14px rgba(255, 30, 39, 0.3)',
              transition: 'all 0.2s ease',
            }}
            title="Initiate Sci-Fi Red Hologram creation / materialization sequence (Key: R)"
          >
            <i className="fa-solid fa-bolt" style={{ color: '#FF1E27' }}></i>
            <span>Hologram</span>
            <kbd style={{ background: '#FF1E27', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 900 }}>R</kbd>
          </button>

          {/* Steady Arms / Leg Walk Toggle */}
          <button
            onClick={() => setLockArms(!lockArms)}
            data-sound="switch"
            style={{
              background: lockArms ? 'rgba(255, 30, 39, 0.18)' : 'rgba(12, 13, 19, 0.92)',
              border: `1px solid ${lockArms ? '#FF1E27' : 'rgba(255, 255, 255, 0.18)'}`,
              color: lockArms ? '#FFFFFF' : '#94a3b8',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.84rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: lockArms ? '0 0 12px rgba(255, 30, 39, 0.25)' : 'none',
            }}
            title="When active, the upper body/hands stay locked in steady resting pose while only legs walk."
          >
            {lockArms ? (
              <>
                <i className="fa-solid fa-shield-halved" style={{ color: '#FF1E27' }}></i>
                <span>Arms: Steady</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-person-walking"></i>
                <span>Arms: Free</span>
              </>
            )}
          </button>

          {/* Camera Mode Toggle */}
          <button
            onClick={() => setCameraMode(cameraMode === 'chase' ? 'free' : 'chase')}
            data-sound="switch"
            style={{
              background: 'rgba(12, 13, 19, 0.92)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              color: '#FFFFFF',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.84rem',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
          >
            {cameraMode === 'chase' ? (
              <>
                <i className="fa-solid fa-crosshairs" style={{ color: '#FF1E27' }}></i>
                <span>GTA 3rd-Person</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-arrows-rotate"></i>
                <span>Free Orbit</span>
              </>
            )}
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
              background: 'rgba(12, 13, 19, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.22)',
              color: '#FFFFFF',
              padding: '10px 14px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.84rem',
              cursor: 'pointer',
              outline: 'none',
              backdropFilter: 'blur(8px)',
            }}
          >
            <option value={publicUrl + '/my-meshy-model.glb'}>Meshy Character (Dusky Skin — Charan)</option>
            <option value={publicUrl + '/my-meshy-model-backup.glb'}>Meshy Character (Original Pale Skin Backup)</option>
            <option value={publicUrl + '/models/sample_rigged_character.glb'}>Vanguard Rigged Soldier (Blender/Mixamo — Steady Hands)</option>
            <option value={publicUrl + '/models/character.glb'}>/models/character.glb (Mixamo Rigged)</option>
            <option value="custom">Upload / Drop Custom .glb...</option>
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
              <i className="fa-solid fa-arrow-left"></i>
              <span>Exit Workspace</span>
            </button>
          )}
        </div>
      </div>


      {/* BOTTOM LEFT: INTERACTIVE WASD SWISS CONTROLLER */}
      <div
        style={{
          position: 'absolute',
          bottom: 24,
          left: 24,
          zIndex: 30,
          background: 'rgba(12, 13, 19, 0.95)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          borderTop: '2px solid #FF1E27',
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)',
          pointerEvents: 'auto',
          userSelect: 'none',
          maxWidth: '390px',
        }}
      >
        {/* Swiss Card Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-block',
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#FF1E27',
                boxShadow: '0 0 8px #FF1E27',
              }}
            />
            <span style={{ fontSize: '0.72rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontWeight: 800, textTransform: 'uppercase', color: '#FF1E27', letterSpacing: '0.08em' }}>
              SYS // WASD_CONTROLLER
            </span>
          </div>
          <span style={{ fontSize: '0.68rem', background: 'rgba(255, 30, 39, 0.12)', border: '1px solid rgba(255, 30, 39, 0.3)', color: '#FF6B72', padding: '1px 8px', borderRadius: '3px', fontWeight: 800, fontFamily: 'monospace' }}>
            INTERACTIVE
          </span>
        </div>

        {/* Controller Body: WASD Inverted-T Pad & Action Column */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {/* WASD Inverted-T Pad matching user illustration */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            {/* Top Key: W */}
            <div>
              {renderKeycap('W', 'Walk', 'forward', 58)}
            </div>
            {/* Bottom Keys: A, S, D */}
            <div style={{ display: 'flex', gap: '6px' }}>
              {renderKeycap('A', 'Left', 'left', 58)}
              {renderKeycap('S', 'Back', 'back', 58)}
              {renderKeycap('D', 'Right', 'right', 58)}
            </div>
          </div>

          {/* Action Modifiers Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
            {/* Space Brake Keycap */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                sendKeyAction('stop', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sendKeyAction('stop', false);
              }}
              onPointerLeave={() => {
                if (pressedKeys.stop) sendKeyAction('stop', false);
              }}
              onPointerCancel={() => {
                if (pressedKeys.stop) sendKeyAction('stop', false);
              }}
              style={{
                height: '40px',
                borderRadius: '8px',
                border: pressedKeys.stop ? '2px solid #FF1E27' : '2px solid #000000',
                background: pressedKeys.stop
                  ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 75%, #A1050B 100%)'
                  : 'linear-gradient(180deg, #1C1E26 0%, #12131A 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                transform: pressedKeys.stop ? 'translateY(2px)' : 'translateY(0)',
                boxShadow: pressedKeys.stop
                  ? '0 0 16px rgba(255, 30, 39, 0.85), 0 1px 0 #7A0206'
                  : '0 3px 0 #000000, 0 6px 12px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.06s ease, box-shadow 0.06s ease, background 0.08s ease',
                userSelect: 'none',
                touchAction: 'manipulation',
                outline: 'none',
              }}
              title="Click or press Space for emergency brake & Stand At Ease"
            >
              <kbd style={{ background: '#FF1E27', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 900, border: '1px solid #000' }}>SPACE</kbd>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: pressedKeys.stop ? '#FFFFFF' : '#F1F4F9' }}>Brake / Ease</span>
            </button>

            {/* Shift Sprint Keycap */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                sendKeyAction('run', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                sendKeyAction('run', false);
              }}
              onPointerLeave={() => {
                if (pressedKeys.run) sendKeyAction('run', false);
              }}
              onPointerCancel={() => {
                if (pressedKeys.run) sendKeyAction('run', false);
              }}
              style={{
                height: '40px',
                borderRadius: '8px',
                border: pressedKeys.run ? '2px solid #FF1E27' : '2px solid #000000',
                background: pressedKeys.run
                  ? 'linear-gradient(180deg, #FF2E36 0%, #D80C14 75%, #A1050B 100%)'
                  : 'linear-gradient(180deg, #1C1E26 0%, #12131A 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                transform: pressedKeys.run ? 'translateY(2px)' : 'translateY(0)',
                boxShadow: pressedKeys.run
                  ? '0 0 16px rgba(255, 30, 39, 0.85), 0 1px 0 #7A0206'
                  : '0 3px 0 #000000, 0 6px 12px rgba(0, 0, 0, 0.4)',
                transition: 'transform 0.06s ease, box-shadow 0.06s ease, background 0.08s ease',
                userSelect: 'none',
                touchAction: 'manipulation',
                outline: 'none',
              }}
              title="Click or hold Shift for Sprint speed"
            >
              <kbd style={{ background: '#2B2E3D', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 900, border: '1px solid #000' }}>SHIFT</kbd>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: pressedKeys.run ? '#FFFFFF' : '#CBD5E1' }}>Sprint Run</span>
            </button>

            {/* R Hologram Keycap */}
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('character-materialize'));
              }}
              data-sound="hologram"
              style={{
                height: '40px',
                borderRadius: '8px',
                border: '2px solid #000000',
                background: 'linear-gradient(180deg, #241416 0%, #170A0B 100%)',
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                fontSize: '0.74rem',
                fontWeight: 800,
                letterSpacing: '0.04em',
                boxShadow: '0 3px 0 #000000, 0 6px 12px rgba(0, 0, 0, 0.4)',
                transition: 'all 0.12s ease',
                userSelect: 'none',
                outline: 'none',
              }}
              title="Click or press R to replay red hologram materialization"
            >
              <kbd style={{ background: '#FF1E27', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 900, border: '1px solid #000' }}>R</kbd>
              <span style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#FF8A90' }}>Hologram</span>
            </button>
          </div>
        </div>

        {/* Footer Swiss Meta Readout */}
        <div style={{ marginTop: '12px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.66rem', fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", color: '#94a3b8' }}>
            CLICK TO MOVE OR USE WASD KEYBOARD
          </span>
          <span style={{ fontSize: '0.66rem', color: '#FF6B72', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}>
            <i className="fa-solid fa-computer-mouse"></i> AIM VIEW
          </span>
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
            padding: '10px 18px',
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
          <i className="fa-solid fa-download"></i>
          <span>Download character_for_mixamo.zip</span>
        </a>

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

