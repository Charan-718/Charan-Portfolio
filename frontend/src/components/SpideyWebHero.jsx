import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playClickSound } from '../utils/soundEffects';
import './SpideyWebHero.css';

/**
 * SpideyWebHero Component
 * Dominating Spider-Man styled CTA button that shoots an authentic multi-strand
 * elastic spider web anchoring to the user's mouse cursor with 100% pixel-perfect precision
 * and dynamic magnetic attraction physics.
 */
export default function SpideyWebHero({ onOpenArena }) {
  const [mounted, setMounted] = useState(false);
  const [isLinked, setIsLinked] = useState(false);
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const nozzleRef = useRef(null);
  const hasFiredThwip = useRef(false);

  // Mouse & Web Physics State (100% Viewport-Aligned Coordinates)
  const mouseState = useRef({
    cursorX: 0,
    cursorY: 0,
    prevCursorX: 0,
    prevCursorY: 0,
    cursorSpeed: 0,
    isInside: false,
    webProgress: 0.0, // 0 = retracted, 1 = connected to cursor
    sparks: [
      { t: 0.08, speed: 0.75 },
      { t: 0.28, speed: 0.85 },
      { t: 0.48, speed: 0.65 },
      { t: 0.68, speed: 0.90 },
      { t: 0.88, speed: 0.70 },
    ],
    btnOffsetX: 0,
    btnOffsetY: 0,
    btnRotX: 0,
    btnRotY: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track cursor position in viewport coordinates and detect Hero section presence
  useEffect(() => {
    const handlePointerMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const m = mouseState.current;

      // Calculate instantaneous mouse movement speed for tension vibration
      const dx = clientX - m.cursorX;
      const dy = clientY - m.cursorY;
      m.cursorSpeed = Math.min(60, Math.hypot(dx, dy));
      m.prevCursorX = m.cursorX;
      m.prevCursorY = m.cursorY;
      m.cursorX = clientX;
      m.cursorY = clientY;

      const heroSection = document.getElementById('hero');
      if (!heroSection) return;

      const heroRect = heroSection.getBoundingClientRect();
      // Track within the hero bounds with a generous comfort margin
      const inside =
        clientX >= heroRect.left - 20 &&
        clientX <= heroRect.right + 20 &&
        clientY >= heroRect.top - 20 &&
        clientY <= heroRect.bottom + 20;

      if (inside) {
        if (!m.isInside) {
          m.isInside = true;
          setIsLinked(true);
          if (!hasFiredThwip.current) {
            hasFiredThwip.current = true;
            playClickSound('thwip');
          }
        }
      } else {
        if (m.isInside) {
          m.isInside = false;
          hasFiredThwip.current = false;
          setIsLinked(false);
        }
      }
    };

    const handlePointerLeave = () => {
      mouseState.current.isInside = false;
      hasFiredThwip.current = false;
      setIsLinked(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, []);

  // Spider-Man Web Canvas & Magnetic Spring Physics Loop
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let time = 0;

    // High-DPI full-viewport canvas sizing (zero offset from viewport)
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += 0.045;
      const m = mouseState.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Clear full canvas
      ctx.clearRect(0, 0, w, h);

      // Interpolate web shooting / retraction progress
      const targetProgress = m.isInside ? 1.0 : 0.0;
      m.webProgress += (targetProgress - m.webProgress) * (m.isInside ? 0.28 : 0.20);
      if (Math.abs(m.webProgress - targetProgress) < 0.001) {
        m.webProgress = targetProgress;
      }

      // Emitter Nozzle Coordinates in exact viewport coordinates
      let emitterX = w * 0.35;
      let emitterY = h * 0.65;
      let btnCenterX = emitterX;
      let btnCenterY = emitterY;

      if (nozzleRef.current) {
        const nRect = nozzleRef.current.getBoundingClientRect();
        emitterX = nRect.left + nRect.width / 2;
        emitterY = nRect.top + nRect.height / 2;
      }
      if (btnRef.current) {
        const bRect = btnRef.current.getBoundingClientRect();
        btnCenterX = bRect.left + bRect.width / 2;
        btnCenterY = bRect.top + bRect.height / 2;
      }

      // =======================================================================
      // 1. MAGNETIC BUTTON ATTRACTION PHYSICS (Physical pull towards cursor)
      // =======================================================================
      if (btnRef.current) {
        let pullX = 0;
        let pullY = 0;
        let rotX = 0;
        let rotY = 0;

        if (m.isInside && m.webProgress > 0.08) {
          const dx = m.cursorX - btnCenterX;
          const dy = m.cursorY - btnCenterY;
          const dist = Math.hypot(dx, dy);

          if (dist > 2) {
            const maxPull = 30; // Max displacement in pixels
            // Proximity tension: stronger magnetic pull as cursor is in hero area
            const proximityFactor = Math.min(1.0, 500 / (dist + 90));
            pullX = (dx / dist) * maxPull * proximityFactor;
            pullY = (dy / dist) * maxPull * proximityFactor;

            // 3D perspective tilt towards mouse
            rotY = (pullX / maxPull) * 14;
            rotX = -(pullY / maxPull) * 14;
          }
        }

        m.btnOffsetX += (pullX - m.btnOffsetX) * 0.16;
        m.btnOffsetY += (pullY - m.btnOffsetY) * 0.16;
        m.btnRotX += (rotX - m.btnRotX) * 0.16;
        m.btnRotY += (rotY - m.btnRotY) * 0.16;

        btnRef.current.style.transform = `perspective(800px) translate3d(${m.btnOffsetX.toFixed(
          2
        )}px, ${m.btnOffsetY.toFixed(2)}px, 0px) rotateX(${m.btnRotX.toFixed(
          2
        )}deg) rotateY(${m.btnRotY.toFixed(2)}deg)`;
      }

      // =======================================================================
      // 2. SPIDER-MAN WEB LINE RENDERING (100% Pixel-Accurate Pointer Anchor)
      // =======================================================================
      if (m.webProgress > 0.005) {
        // Pixel-perfect target point: Exactly locks to the mouse pointer with zero lag when connected
        const targetTipX = emitterX + (m.cursorX - emitterX) * m.webProgress;
        const targetTipY = emitterY + (m.cursorY - emitterY) * m.webProgress;
        const webDist = Math.hypot(targetTipX - emitterX, targetTipY - emitterY);

        // Dynamic Catenary Sag and Elastic Silk Vibration
        // Sag reduces as distance increases (tautness) and has high-frequency harmonics when moving
        const tautness = Math.min(1.0, webDist / 600);
        const sagAmount = Math.sin(m.webProgress * Math.PI) * (26 * (1.1 - tautness * 0.5));
        const tensionVibration = Math.sin(time * 22) * (m.isInside ? 2.5 + m.cursorSpeed * 0.08 : 0);
        const midX = (emitterX + targetTipX) / 2 + Math.sin(time * 12) * 2;
        const midY = (emitterY + targetTipY) / 2 + sagAmount + tensionVibration;

        // --- A. Base Web-Shooter Anchor Fan (Spider web anchor onto button) ---
        const knotT = 0.09;
        const knotX = emitterX + (midX - emitterX) * knotT;
        const knotY = emitterY + (midY - emitterY) * knotT;

        const anchorOffsets = [
          { dx: -24, dy: -22 },
          { dx: -24, dy: 22 },
          { dx: -42, dy: -12 },
          { dx: -42, dy: 12 },
          { dx: -16, dy: -30 },
          { dx: -16, dy: 30 },
        ];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.1;
        anchorOffsets.forEach((off) => {
          ctx.beginPath();
          ctx.moveTo(emitterX + off.dx, emitterY + off.dy);
          ctx.lineTo(knotX, knotY);
          ctx.stroke();
        });

        // Emitter shockwave glow ring
        ctx.save();
        const pulseR = 8 + (Math.sin(time * 8) * 0.5 + 0.5) * 6;
        ctx.beginPath();
        ctx.arc(emitterX, emitterY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.7)';
        ctx.lineWidth = 1.4;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // --- B. Deep Atmospheric Crimson Web Glow ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.35)';
        ctx.lineWidth = 9.0;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 22;
        ctx.stroke();
        ctx.restore();

        // --- C. Outer Tensile Crimson Sheath ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.9)';
        ctx.lineWidth = 4.2;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        // --- D. Core Brilliant White Synthetic Silk Strand ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2.0;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.stroke();
        ctx.restore();

        // --- E. Double Helical Braided Silk Micro-Filaments ---
        // Samples 28 points along the quadratic curve to draw authentic twisting web fibers
        const steps = 28;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const qx = (1 - t) * (1 - t) * emitterX + 2 * (1 - t) * t * midX + t * t * targetTipX;
          const qy = (1 - t) * (1 - t) * emitterY + 2 * (1 - t) * t * midY + t * t * targetTipY;

          // Derivative for perpendicular normal vector
          const dx = 2 * (1 - t) * (midX - emitterX) + 2 * t * (targetTipX - midX);
          const dy = 2 * (1 - t) * (midY - emitterY) + 2 * t * (targetTipY - midY);
          const len = Math.hypot(dx, dy) || 1;
          const nx = -dy / len;
          const ny = dx / len;

          const wave = Math.sin(t * 28 + time * 14) * 3.2;
          const px = qx + nx * wave;
          const py = qy + ny * wave;

          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(255, 130, 140, 0.75)';
        ctx.lineWidth = 1.1;
        ctx.stroke();

        // --- F. Traveling Bio-Luminescent Dewdrop Energy Pulses ---
        m.sparks.forEach((spark) => {
          spark.t = (spark.t + 0.01 * spark.speed) % 1.0;
          const st = spark.t * m.webProgress;
          const px = (1 - st) * (1 - st) * emitterX + 2 * (1 - st) * st * midX + st * st * targetTipX;
          const py = (1 - st) * (1 - st) * emitterY + 2 * (1 - st) * st * midY + st * st * targetTipY;

          ctx.beginPath();
          ctx.arc(px, py, 2.6, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF1E27';
          ctx.shadowBlur = 9;
          ctx.fill();
        });

        // --- G. Spidey-Sense Cursor Reticle (Anchored with 100% Precision) ---
        if (m.webProgress > 0.85) {
          drawSpiderSenseReticle(ctx, targetTipX, targetTipY, time);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [mounted]);

  // Helper: Renders high-tech Spider-Man web target reticle directly centered on cursor tip
  const drawSpiderSenseReticle = (ctx, x, y, time) => {
    ctx.save();
    ctx.translate(x, y);

    // 1. Spidey-Sense Alert Halo (expands smoothly outward)
    const senseRadius = 16 + (Math.sin(time * 6) * 0.5 + 0.5) * 14;
    const senseAlpha = Math.max(0, 0.55 * (1.0 - (senseRadius - 16) / 14));
    ctx.beginPath();
    ctx.arc(0, 0, senseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 30, 39, ${senseAlpha.toFixed(2)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 2. High-Tech Concentric Spider Web Rings
    // Outer Ring (radius 16)
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 10;
    ctx.stroke();

    // Inner Ring (radius 8)
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 1.2;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 6;
    ctx.stroke();

    // 8 Radial Web Spokes radiating from inner to outer ring
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + time * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 4, Math.sin(angle) * 4);
      ctx.lineTo(Math.cos(angle) * 18, Math.sin(angle) * 18);
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.92)' : 'rgba(255, 60, 70, 0.75)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    // 3. Four Tactical Cyber Corner Brackets framing the cursor
    const bDist = 20 + Math.sin(time * 8) * 1.5;
    const bLen = 5;
    const brackets = [
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
    ];
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 8;
    brackets.forEach(({ dx, dy }) => {
      ctx.beginPath();
      ctx.moveTo(dx * bDist, dy * (bDist - bLen));
      ctx.lineTo(dx * bDist, dy * bDist);
      ctx.lineTo(dx * (bDist - bLen), dy * bDist);
      ctx.stroke();
    });

    // 4. Center Glowing White Pointer Node
    ctx.beginPath();
    ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 14;
    ctx.fill();

    // 5. Crisp Miniature Cyber Spider Silhouette
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 6;

    // Abdomen & Thorax
    ctx.beginPath();
    ctx.ellipse(0, 1.4, 1.8, 2.6, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -1.8, 1.3, 1.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4 Pairs of Arachnid Legs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 0.9;
    ctx.shadowBlur = 4;
    const legs = [
      { y: -1.8, bendX: 6, bendY: -4.5, tipX: 5.5, tipY: -6.5 },
      { y: -0.8, bendX: 7.5, bendY: -1.8, tipX: 8.5, tipY: -2.8 },
      { y: 0.8, bendX: 7.5, bendY: 2.0, tipX: 8.5, tipY: 3.5 },
      { y: 2.2, bendX: 5.5, bendY: 5.2, tipX: 4.8, tipY: 7.2 },
    ];
    legs.forEach(({ y, bendX, bendY, tipX, tipY }) => {
      // Right Leg
      ctx.beginPath();
      ctx.moveTo(1, y);
      ctx.lineTo(bendX, bendY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      // Left Leg (Mirrored)
      ctx.beginPath();
      ctx.moveTo(-1, y);
      ctx.lineTo(-bendX, bendY);
      ctx.lineTo(-tipX, tipY);
      ctx.stroke();
    });

    ctx.restore();
  };

  const handleClick = (e) => {
    e.preventDefault();
    playClickSound('hologram');
    if (onOpenArena) onOpenArena();
  };

  return (
    <>
      {/* Full-Viewport Spider Web Canvas Overlay via Portal (100% precision, zero container offset) */}
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <canvas ref={canvasRef} className="spidey-web-overlay-canvas" />,
          document.body
        )}

      {/* Dominating Spider-Man Magnetic CTA Button Container */}
      <div className="spidey-hero-wrapper">
        {/* Pulsating Spidey-Sense Radar Rings */}
        <div className="spidey-radar-container" aria-hidden="true">
          <div className="spidey-radar-ring ring-1"></div>
          <div className="spidey-radar-ring ring-2"></div>
          <div className="spidey-radar-ring ring-3"></div>
        </div>

        {/* The Dominating Magnetic Button */}
        <button
          ref={btnRef}
          type="button"
          onClick={handleClick}
          className="spidey-magnetic-btn"
          aria-label="Play 3D Character Workspace"
          title="Launch Interactive 3D Character Workspace (Spider-Man Web Linked)"
        >
          {/* Web Lattice Texture Overlay */}
          <div className="spidey-web-pattern-bg" aria-hidden="true"></div>

          {/* Laser Sheen Sweep */}
          <div className="spidey-laser-sheen" aria-hidden="true"></div>

          {/* Left Text Block */}
          <div className="spidey-btn-body">
            <div className="spidey-btn-badge">
              <span className="spidey-badge-dot"></span>
              <span>
                {isLinked ? '🕷️ SPIDEY-WEB LINKED' : '⚡ 3D WORKSPACE ARENA'}
              </span>
            </div>

            <div className="spidey-btn-title">
              <span>PLAY 3D CHARACTER</span>
              <i
                className="fa-solid fa-arrow-up-right-from-square"
                style={{ fontSize: '0.9rem', color: '#FFFFFF' }}
              ></i>
            </div>

            <div className="spidey-btn-sub">
              <span>EXPLORE WORKSPACE</span>
              <span className="spidey-key-pill">WASD</span>
              <span>• FULL 3D FREEDOM</span>
            </div>
          </div>

          {/* Right Emblem & Web-Shooter Nozzle */}
          <div className="spidey-btn-action-zone">
            <div className="spidey-cube-icon-box">
              <i className="fa-solid fa-cube"></i>
            </div>

            {/* Glowing Web-Shooter Nozzle where the Web Line originates */}
            <div
              ref={nozzleRef}
              className="spidey-web-emitter-nozzle"
              aria-hidden="true"
            ></div>
          </div>
        </button>

        {/* Subtle Live Connection Status */}
        <div className="spidey-status-banner">
          <i
            className="fa-solid fa-circle-nodes"
            style={{ color: isLinked ? '#FF1E27' : '#64748b' }}
          ></i>
          <span>
            {isLinked ? (
              <>
                <strong>WEB ANCHOR ACTIVE:</strong> TRACKING POINTER • CLICK TO
                ENTER WORKSPACE
              </>
            ) : (
              <>MOVE CURSOR INTO HERO SECTION TO ACTIVATE WEB ATTRACTION</>
            )}
          </span>
        </div>
      </div>
    </>
  );
}
