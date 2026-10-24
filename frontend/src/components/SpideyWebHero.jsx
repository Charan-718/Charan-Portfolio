import React, { useRef, useEffect, useState } from 'react';
import { playClickSound } from '../utils/soundEffects';
import './SpideyWebHero.css';

/**
 * SpideyWebHero Component
 * Dominating Spider-Man styled CTA button that shoots an elastic spider web
 * anchoring to the user's mouse cursor across the hero section with magnetic attraction physics.
 */
export default function SpideyWebHero({ onOpenArena }) {
  const wrapperRef = useRef(null);
  const btnRef = useRef(null);
  const canvasRef = useRef(null);
  const nozzleRef = useRef(null);

  const [isLinked, setIsLinked] = useState(false);
  const hasFiredThwip = useRef(false);

  // Mouse & Web Physics State
  const mouseState = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    isInside: false,
    webProgress: 0.0, // 0 = fully retracted, 1 = connected to cursor
    sparks: [
      { t: 0.1, speed: 0.55 },
      { t: 0.4, speed: 0.65 },
      { t: 0.7, speed: 0.6 },
    ],
    btnOffsetX: 0,
    btnOffsetY: 0,
    btnRotX: 0,
    btnRotY: 0,
  });

  // Track Hero Section bounds & handle mouse movements
  useEffect(() => {
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    const handlePointerMove = (e) => {
      const heroRect = heroSection.getBoundingClientRect();
      const clientX = e.clientX;
      const clientY = e.clientY;

      const inside =
        clientX >= heroRect.left &&
        clientX <= heroRect.right &&
        clientY >= heroRect.top &&
        clientY <= heroRect.bottom;

      mouseState.current.isInside = inside;
      if (inside) {
        mouseState.current.targetX = clientX - heroRect.left;
        mouseState.current.targetY = clientY - heroRect.top;

        if (!hasFiredThwip.current) {
          hasFiredThwip.current = true;
          setIsLinked(true);
          playClickSound('thwip');
        }
      } else {
        hasFiredThwip.current = false;
        setIsLinked(false);
      }
    };

    const handlePointerLeave = () => {
      mouseState.current.isInside = false;
      hasFiredThwip.current = false;
      setIsLinked(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    heroSection.addEventListener('pointerleave', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      heroSection.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  // Web Canvas & Magnetic Spring Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const heroSection = document.getElementById('hero');
    if (!heroSection) return;

    let animId;
    let time = 0;

    // Handle high-DPI canvas resizing
    const resizeCanvas = () => {
      const rect = heroSection.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const render = () => {
      time += 0.04;
      const m = mouseState.current;
      const heroRect = heroSection.getBoundingClientRect();

      // Clear canvas
      ctx.clearRect(0, 0, heroRect.width, heroRect.height);

      // Smooth mouse coordinates
      m.x += (m.targetX - m.x) * 0.22;
      m.y += (m.targetY - m.y) * 0.22;

      // Animate Web Progress (Shooting / Retraction)
      const targetProgress = m.isInside ? 1.0 : 0.0;
      m.webProgress += (targetProgress - m.webProgress) * (m.isInside ? 0.24 : 0.18);

      // Get Web Emitter Nozzle Coordinates relative to Hero Section
      let emitterX = heroRect.width * 0.35;
      let emitterY = 480;
      let btnCenterX = emitterX;
      let btnCenterY = emitterY;

      if (nozzleRef.current && btnRef.current) {
        const nozzleRect = nozzleRef.current.getBoundingClientRect();
        emitterX = nozzleRect.left - heroRect.left + nozzleRect.width / 2;
        emitterY = nozzleRect.top - heroRect.top + nozzleRect.height / 2;

        const btnRect = btnRef.current.getBoundingClientRect();
        btnCenterX = btnRect.left - heroRect.left + btnRect.width / 2;
        btnCenterY = btnRect.top - heroRect.top + btnRect.height / 2;
      }

      // =======================================================================
      // 1. MAGNETIC ATTRACTION PHYSICS (Pull button toward mouse)
      // =======================================================================
      if (btnRef.current) {
        let pullX = 0;
        let pullY = 0;
        let rotX = 0;
        let rotY = 0;

        if (m.isInside && m.webProgress > 0.05) {
          const dx = m.x - btnCenterX;
          const dy = m.y - btnCenterY;
          const dist = Math.hypot(dx, dy);

          if (dist > 1) {
            // Elastic tension pull: stronger as cursor approaches button
            const maxPull = 26; // pixels
            const proximityFactor = Math.min(1.0, 420 / (dist + 90));
            pullX = (dx / dist) * maxPull * proximityFactor;
            pullY = (dy / dist) * maxPull * proximityFactor;

            // 3D perspective tilt towards mouse
            rotY = (pullX / maxPull) * 12;
            rotX = -(pullY / maxPull) * 12;
          }
        }

        m.btnOffsetX += (pullX - m.btnOffsetX) * 0.14;
        m.btnOffsetY += (pullY - m.btnOffsetY) * 0.14;
        m.btnRotX += (rotX - m.btnRotX) * 0.14;
        m.btnRotY += (rotY - m.btnRotY) * 0.14;

        btnRef.current.style.transform = `perspective(600px) translate3d(${m.btnOffsetX.toFixed(
          2
        )}px, ${m.btnOffsetY.toFixed(2)}px, 0px) rotateX(${m.btnRotX.toFixed(
          2
        )}deg) rotateY(${m.btnRotY.toFixed(2)}deg)`;
      }

      // =======================================================================
      // 2. SPIDER-MAN WEB LINE RENDERING
      // =======================================================================
      if (m.webProgress > 0.01) {
        const targetTipX = emitterX + (m.x - emitterX) * m.webProgress;
        const targetTipY = emitterY + (m.y - emitterY) * m.webProgress;
        const webDist = Math.hypot(targetTipX - emitterX, targetTipY - emitterY);

        // Dynamic Catenary Sag and Tension Vibration
        const sagAmount = Math.sin(m.webProgress * Math.PI) * Math.min(55, webDist * 0.08);
        const vibration = Math.sin(time * 16) * (m.isInside ? 3.5 : 0);
        const midX = (emitterX + targetTipX) / 2 + Math.sin(time * 10) * 2;
        const midY = (emitterY + targetTipY) / 2 + sagAmount + vibration;

        // A. Base Anchor Filaments (Web Fan at the Web-Shooter)
        const knotT = 0.08;
        const knotX = emitterX + (midX - emitterX) * knotT;
        const knotY = emitterY + (midY - emitterY) * knotT;

        const anchorOffsets = [
          { dx: -18, dy: -24 },
          { dx: -18, dy: 24 },
          { dx: -38, dy: -14 },
          { dx: -38, dy: 14 },
        ];

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.0;
        anchorOffsets.forEach((off) => {
          ctx.beginPath();
          ctx.moveTo(emitterX + off.dx, emitterY + off.dy);
          ctx.lineTo(knotX, knotY);
          ctx.stroke();
        });

        // B. Outer Glowing Crimson Web Aura
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.55)';
        ctx.lineWidth = 5.5;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 14;
        ctx.stroke();
        ctx.restore();

        // C. Core White Silk Cord
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.96)';
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();

        // D. Secondary Twisted Braided Micro-Filament
        const offsetMidX = midX + Math.sin(time * 22) * 2.2;
        const offsetMidY = midY + Math.cos(time * 22) * 2.2;
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(offsetMidX, offsetMidY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 120, 130, 0.65)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // E. Traveling Energy Sparks (Silk Dewdrops along the web line)
        m.sparks.forEach((spark) => {
          spark.t = (spark.t + 0.008 * spark.speed) % 1.0;
          const st = spark.t * m.webProgress;
          // Calculate quadratic bezier point at parameter st
          const px =
            (1 - st) * (1 - st) * emitterX +
            2 * (1 - st) * st * midX +
            st * st * targetTipX;
          const py =
            (1 - st) * (1 - st) * emitterY +
            2 * (1 - st) * st * midY +
            st * st * targetTipY;

          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF1E27';
          ctx.shadowBlur = 8;
          ctx.fill();
        });

        // F. Cursor Web Reticle (Spider Web Anchor around mouse pointer)
        if (m.webProgress > 0.85) {
          ctx.save();
          // Glowing center node
          ctx.beginPath();
          ctx.arc(targetTipX, targetTipY, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF1E27';
          ctx.shadowBlur = 12;
          ctx.fill();

          // Outer pulsing web ring
          const ringRadius = 12 + Math.sin(time * 8) * 2.5;
          ctx.beginPath();
          ctx.arc(targetTipX, targetTipY, ringRadius, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 30, 39, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // 4 radial web crosshairs
          for (let i = 0; i < 4; i++) {
            const ang = (i * Math.PI) / 2 + time * 0.6;
            ctx.beginPath();
            ctx.moveTo(
              targetTipX + Math.cos(ang) * 6,
              targetTipY + Math.sin(ang) * 6
            );
            ctx.lineTo(
              targetTipX + Math.cos(ang) * (ringRadius + 7),
              targetTipY + Math.sin(ang) * (ringRadius + 7)
            );
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  const handleClick = (e) => {
    e.preventDefault();
    playClickSound('hologram');
    if (onOpenArena) onOpenArena();
  };

  return (
    <>
      {/* Full-Bleed Spider Web Canvas Overlay in Hero Section */}
      <canvas ref={canvasRef} className="spidey-web-overlay-canvas" />

      {/* Dominating Spider-Man Magnetic CTA Button Container */}
      <div ref={wrapperRef} className="spidey-hero-wrapper">
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
              <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: '0.9rem', color: '#FFFFFF' }}></i>
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

            {/* Glowing Web-Shooter Nozzle where the Web Line attaches */}
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
