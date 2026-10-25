import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playClickSound } from '../utils/soundEffects';
import './SpideyWebHero.css';

/**
 * SpideyWebHero Component
 * Dominating Spider-Man styled Web-Shooter that anchors directly to the
 * Navbar 3D Play Cube Button (#navCubeArenaBtn) and shoots an authentic multi-strand
 * elastic spider web anchoring to the user's mouse cursor with 100% pixel-perfect precision
 * and dynamic magnetic attraction physics.
 */
export default function SpideyWebHero({ onOpenArena, targetId = 'navCubeArenaBtn' }) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);
  const hasFiredThwip = useRef(false);

  // Mouse & Web Physics State (100% Viewport-Aligned Coordinates)
  const mouseState = useRef({
    cursorX: 0,
    cursorY: 0,
    prevCursorX: 0,
    prevCursorY: 0,
    velX: 0,
    velY: 0,
    cursorSpeed: 0,
    isInside: false,
    webProgress: 0.0, // 0 = retracted, 1 = connected to cursor
    sparks: [
      { t: 0.05, speed: 0.72 },
      { t: 0.18, speed: 0.86 },
      { t: 0.32, speed: 0.65 },
      { t: 0.46, speed: 0.92 },
      { t: 0.60, speed: 0.78 },
      { t: 0.74, speed: 0.84 },
      { t: 0.88, speed: 0.68 },
    ],
    btnOffsetX: 0,
    btnOffsetY: 0,
    btnRotX: 0,
    btnRotY: 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track cursor position in viewport coordinates and detect presence
  useEffect(() => {
    const handlePointerMove = (e) => {
      const clientX = e.clientX;
      const clientY = e.clientY;
      const m = mouseState.current;

      // Calculate instantaneous mouse movement speed and velocity vector for whip/tension
      const dx = clientX - m.cursorX;
      const dy = clientY - m.cursorY;
      m.velX = m.velX * 0.4 + dx * 0.6;
      m.velY = m.velY * 0.4 + dy * 0.6;
      m.cursorSpeed = Math.min(70, Math.hypot(dx, dy));
      m.prevCursorX = m.cursorX;
      m.prevCursorY = m.cursorY;
      m.cursorX = clientX;
      m.cursorY = clientY;

      // Check if user is in Hero section or near the top navbar
      const heroSection = document.getElementById('hero');
      let insideHero = false;
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect();
        const heroVisible = heroRect.bottom > 80 && heroRect.top < window.innerHeight;
        if (heroVisible) {
          insideHero = clientY <= heroRect.bottom + 40 && clientY >= 0;
        }
      }

      // Check proximity to the navbar target button
      const targetBtn = document.getElementById(targetId);
      let nearBtn = false;
      if (targetBtn) {
        const br = targetBtn.getBoundingClientRect();
        const dist = Math.hypot(
          clientX - (br.left + br.width / 2),
          clientY - (br.top + br.height / 2)
        );
        nearBtn = dist < 320;
      }

      const active = insideHero || nearBtn;

      if (active) {
        if (!m.isInside) {
          m.isInside = true;
          if (!hasFiredThwip.current) {
            hasFiredThwip.current = true;
            playClickSound('thwip');
          }
        }
      } else {
        if (m.isInside) {
          m.isInside = false;
          hasFiredThwip.current = false;
        }
      }
    };

    const handlePointerLeave = () => {
      mouseState.current.isInside = false;
      hasFiredThwip.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [targetId]);

  // Audio click feedback on target navbar button
  useEffect(() => {
    const btn = document.getElementById(targetId);
    if (!btn) return;
    const handleClick = () => {
      playClickSound('hologram');
      if (onOpenArena) onOpenArena();
    };
    btn.addEventListener('click', handleClick);
    return () => {
      btn.removeEventListener('click', handleClick);
    };
  }, [targetId, onOpenArena]);

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
      m.webProgress += (targetProgress - m.webProgress) * (m.isInside ? 0.26 : 0.18);
      if (Math.abs(m.webProgress - targetProgress) < 0.001) {
        m.webProgress = targetProgress;
      }

      // Emitter Coordinates directly mapped to the Navbar Cube Button
      const targetBtn = document.getElementById(targetId);
      let emitterX = w - 48;
      let emitterY = 28;
      let btnWidth = 36;
      let btnHeight = 36;

      if (targetBtn) {
        const bRect = targetBtn.getBoundingClientRect();
        emitterX = bRect.left + bRect.width / 2;
        emitterY = bRect.top + bRect.height / 2;
        btnWidth = bRect.width;
        btnHeight = bRect.height;
      }

      // =======================================================================
      // 1. MAGNETIC NAVBAR BUTTON ATTRACTION PHYSICS (Physical pull towards cursor)
      // =======================================================================
      if (targetBtn) {
        let pullX = 0;
        let pullY = 0;
        let rotX = 0;
        let rotY = 0;

        if (m.isInside && m.webProgress > 0.05) {
          const dx = m.cursorX - emitterX;
          const dy = m.cursorY - emitterY;
          const dist = Math.hypot(dx, dy);

          if (dist > 3) {
            const maxPull = 12; // 12px responsive magnetic displacement in navbar
            const factor = Math.min(1.0, 420 / (dist + 60));
            pullX = (dx / dist) * maxPull * factor;
            pullY = (dy / dist) * maxPull * factor;

            rotY = (pullX / maxPull) * 16;
            rotX = -(pullY / maxPull) * 16;
          }
        }

        m.btnOffsetX += (pullX - m.btnOffsetX) * 0.18;
        m.btnOffsetY += (pullY - m.btnOffsetY) * 0.18;
        m.btnRotX += (rotX - m.btnRotX) * 0.18;
        m.btnRotY += (rotY - m.btnRotY) * 0.18;

        if (Math.abs(m.btnOffsetX) > 0.04 || Math.abs(m.btnOffsetY) > 0.04 || m.isInside) {
          targetBtn.style.transform = `perspective(600px) translate3d(${m.btnOffsetX.toFixed(
            2
          )}px, ${m.btnOffsetY.toFixed(2)}px, 0px) rotateX(${m.btnRotX.toFixed(
            2
          )}deg) rotateY(${m.btnRotY.toFixed(2)}deg)`;
        } else {
          targetBtn.style.transform = '';
        }
      }

      // =======================================================================
      // 2. EXTENT-LEVEL SPIDER-MAN WEB LINE RENDERING
      // =======================================================================
      if (m.webProgress > 0.005) {
        // Pixel-perfect target point: Exactly locks to the mouse pointer
        const targetTipX = emitterX + (m.cursorX - emitterX) * m.webProgress;
        const targetTipY = emitterY + (m.cursorY - emitterY) * m.webProgress;
        const dirX = targetTipX - emitterX;
        const dirY = targetTipY - emitterY;
        const webDist = Math.hypot(dirX, dirY) || 1;

        // Normal vector perpendicular to the main web line
        const nx = -dirY / webDist;
        const ny = dirX / webDist;

        // Dynamic Catenary Sag and Elastic Silk Vibration
        // Sag reduces as distance increases (tautness) and has high-frequency harmonics when moving
        const tautness = Math.min(1.0, webDist / 700);
        const sagAmount = Math.sin(m.webProgress * Math.PI) * (26 * (1.1 - tautness * 0.5));
        const tensionVibration = Math.sin(time * 26) * (m.isInside ? 2.0 + m.cursorSpeed * 0.12 : 0);
        const whipLagX = -m.velX * 0.22 * Math.sin(m.webProgress * Math.PI);
        const whipLagY = -m.velY * 0.22 * Math.sin(m.webProgress * Math.PI);

        const midX = (emitterX + targetTipX) / 2 + nx * tensionVibration + whipLagX;
        const midY = (emitterY + targetTipY) / 2 + sagAmount + ny * tensionVibration + whipLagY;

        // --- A. Base Web-Shooter Anchor Fan (Spider web anchor onto navbar button) ---
        const knotT = 0.08;
        const knotX = emitterX + (midX - emitterX) * knotT;
        const knotY = emitterY + (midY - emitterY) * knotT;

        const halfW = btnWidth * 0.5;
        const halfH = btnHeight * 0.5;
        const anchorOffsets = [
          { dx: -halfW, dy: -halfH },
          { dx: halfW, dy: -halfH },
          { dx: -halfW - 6, dy: 0 },
          { dx: halfW + 6, dy: 0 },
          { dx: -halfW, dy: halfH },
          { dx: halfW, dy: halfH },
          { dx: -halfW - 14, dy: -6 },
          { dx: -halfW - 14, dy: 6 },
        ];

        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.2;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 8;
        anchorOffsets.forEach((off) => {
          ctx.beginPath();
          ctx.moveTo(emitterX + off.dx, emitterY + off.dy);
          ctx.lineTo(knotX, knotY);
          ctx.stroke();
        });

        // 2 concentric transverse web arcs bridging the anchor threads
        [0.45, 0.75].forEach((arcT) => {
          ctx.beginPath();
          anchorOffsets.forEach((off, idx) => {
            const ax = emitterX + off.dx * (1 - arcT) + (knotX - emitterX) * arcT;
            const ay = emitterY + off.dy * (1 - arcT) + (knotY - emitterY) * arcT;
            if (idx === 0) ctx.moveTo(ax, ay);
            else ctx.lineTo(ax, ay);
          });
          ctx.closePath();
          ctx.strokeStyle = 'rgba(255, 60, 70, 0.5)';
          ctx.lineWidth = 0.9;
          ctx.stroke();
        });
        ctx.restore();

        // Emitter shockwave glow ring & core
        ctx.save();
        const pulseR = 8 + (Math.sin(time * 9) * 0.5 + 0.5) * 6;
        ctx.beginPath();
        ctx.arc(emitterX, emitterY, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.85)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 12;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(emitterX, emitterY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();

        // --- B. Deep Atmospheric Crimson Web Glow ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.32)';
        ctx.lineWidth = 14.0;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 32;
        ctx.stroke();
        ctx.restore();

        // --- C. Outer Tensile Crimson Sheath ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 25, 35, 0.95)';
        ctx.lineWidth = 4.8;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.restore();

        // --- D. Radiant Vermillion Core ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = 'rgba(255, 140, 150, 0.9)';
        ctx.lineWidth = 2.8;
        ctx.stroke();
        ctx.restore();

        // --- E. Diamond-White Laser Synthetic Silk Core ---
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(emitterX, emitterY);
        ctx.quadraticCurveTo(midX, midY, targetTipX, targetTipY);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.6;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 6;
        ctx.stroke();
        ctx.restore();

        // --- F. Tri-Filament Braided Silk Micro-Fibrils & Stray Wisps ---
        const steps = 36;
        ctx.save();
        // Fibril 1: Glowing White clockwise twist
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const qx = (1 - t) * (1 - t) * emitterX + 2 * (1 - t) * t * midX + t * t * targetTipX;
          const qy = (1 - t) * (1 - t) * emitterY + 2 * (1 - t) * t * midY + t * t * targetTipY;

          const ddx = 2 * (1 - t) * (midX - emitterX) + 2 * t * (targetTipX - midX);
          const ddy = 2 * (1 - t) * (midY - emitterY) + 2 * t * (targetTipY - midY);
          const slen = Math.hypot(ddx, ddy) || 1;
          const snx = -ddy / slen;
          const sny = ddx / slen;

          const taper = Math.sin(t * Math.PI);
          const wave1 = Math.sin(t * 38 - time * 16) * 4.2 * taper;
          const px1 = qx + snx * wave1;
          const py1 = qy + sny * wave1;

          if (i === 0) ctx.moveTo(px1, py1);
          else ctx.lineTo(px1, py1);
        }
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.1;
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 5;
        ctx.stroke();

        // Fibril 2: Scarlet counter-clockwise twist (180deg out of phase)
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const qx = (1 - t) * (1 - t) * emitterX + 2 * (1 - t) * t * midX + t * t * targetTipX;
          const qy = (1 - t) * (1 - t) * emitterY + 2 * (1 - t) * t * midY + t * t * targetTipY;

          const ddx = 2 * (1 - t) * (midX - emitterX) + 2 * t * (targetTipX - midX);
          const ddy = 2 * (1 - t) * (midY - emitterY) + 2 * t * (targetTipY - midY);
          const slen = Math.hypot(ddx, ddy) || 1;
          const snx = -ddy / slen;
          const sny = ddx / slen;

          const taper = Math.sin(t * Math.PI);
          const wave2 = Math.sin(t * 38 - time * 16 + Math.PI) * 4.2 * taper;
          const px2 = qx + snx * wave2;
          const py2 = qy + sny * wave2;

          if (i === 0) ctx.moveTo(px2, py2);
          else ctx.lineTo(px2, py2);
        }
        ctx.strokeStyle = 'rgba(255, 170, 180, 0.85)';
        ctx.lineWidth = 1.1;
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 6;
        ctx.stroke();

        // Fibril 3: Long-wave undulating crimson silk filament
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const qx = (1 - t) * (1 - t) * emitterX + 2 * (1 - t) * t * midX + t * t * targetTipX;
          const qy = (1 - t) * (1 - t) * emitterY + 2 * (1 - t) * t * midY + t * t * targetTipY;

          const ddx = 2 * (1 - t) * (midX - emitterX) + 2 * t * (targetTipX - midX);
          const ddy = 2 * (1 - t) * (midY - emitterY) + 2 * t * (targetTipY - midY);
          const slen = Math.hypot(ddx, ddy) || 1;
          const snx = -ddy / slen;
          const sny = ddx / slen;

          const taper = Math.sin(t * Math.PI);
          const wave3 = Math.cos(t * 22 + time * 12) * 2.8 * taper;
          const px3 = qx + snx * wave3;
          const py3 = qy + sny * wave3;

          if (i === 0) ctx.moveTo(px3, py3);
          else ctx.lineTo(px3, py3);
        }
        ctx.strokeStyle = 'rgba(255, 60, 70, 0.75)';
        ctx.lineWidth = 1.0;
        ctx.stroke();

        // Secondary stray silk wisps peeling off the bundle
        const wispRanges = [
          { tStart: 0.16, tEnd: 0.36, bow: 8.5 },
          { tStart: 0.42, tEnd: 0.62, bow: -9.0 },
          { tStart: 0.68, tEnd: 0.88, bow: 7.5 },
        ];
        wispRanges.forEach((wisp) => {
          ctx.beginPath();
          const wSteps = 12;
          for (let j = 0; j <= wSteps; j++) {
            const u = j / wSteps;
            const t = wisp.tStart + u * (wisp.tEnd - wisp.tStart);
            const qx = (1 - t) * (1 - t) * emitterX + 2 * (1 - t) * t * midX + t * t * targetTipX;
            const qy = (1 - t) * (1 - t) * emitterY + 2 * (1 - t) * t * midY + t * t * targetTipY;

            const ddx = 2 * (1 - t) * (midX - emitterX) + 2 * t * (targetTipX - midX);
            const ddy = 2 * (1 - t) * (midY - emitterY) + 2 * t * (targetTipY - midY);
            const slen = Math.hypot(ddx, ddy) || 1;
            const snx = -ddy / slen;
            const sny = ddx / slen;

            const bulge = Math.sin(u * Math.PI) * wisp.bow;
            const wx = qx + snx * bulge;
            const wy = qy + sny * bulge;

            if (j === 0) ctx.moveTo(wx, wy);
            else ctx.lineTo(wx, wy);
          }
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        });
        ctx.restore();

        // --- G. Traveling Bio-Luminescent Dewdrop Energy Pulses ---
        m.sparks.forEach((spark) => {
          spark.t = (spark.t + 0.012 * spark.speed) % 1.0;
          const st = spark.t * m.webProgress;
          const px = (1 - st) * (1 - st) * emitterX + 2 * (1 - st) * st * midX + st * st * targetTipX;
          const py = (1 - st) * (1 - st) * emitterY + 2 * (1 - st) * st * midY + st * st * targetTipY;

          ctx.save();
          ctx.beginPath();
          ctx.arc(px, py, 2.8, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.shadowColor = '#FF1E27';
          ctx.shadowBlur = 10;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 4.5, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(255, 50, 60, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        });

        // Electrostatic crackle micro-lightning arcs
        if (Math.random() < 0.35 && m.webProgress > 0.4) {
          const arcT = Math.random() * 0.8 + 0.1;
          const ax = (1 - arcT) * (1 - arcT) * emitterX + 2 * (1 - arcT) * arcT * midX + arcT * arcT * targetTipX;
          const ay = (1 - arcT) * (1 - arcT) * emitterY + 2 * (1 - arcT) * arcT * midY + arcT * arcT * targetTipY;

          ctx.save();
          ctx.strokeStyle = 'rgba(220, 245, 255, 0.95)';
          ctx.lineWidth = 1.2;
          ctx.shadowColor = '#00F0FF';
          ctx.shadowBlur = 8;
          ctx.beginPath();
          ctx.moveTo(ax, ay);
          const seg1X = ax + (Math.random() - 0.5) * 14;
          const seg1Y = ay + (Math.random() - 0.5) * 14;
          ctx.lineTo(seg1X, seg1Y);
          ctx.lineTo(seg1X + (Math.random() - 0.5) * 12, seg1Y + (Math.random() - 0.5) * 12);
          ctx.stroke();
          ctx.restore();
        }

        // --- H. Spidey-Sense Cursor Reticle (Anchored with 100% Precision) ---
        if (m.webProgress > 0.82) {
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
  }, [mounted, targetId]);

  // Helper: Renders high-tech Spider-Man web target reticle directly centered on cursor tip
  const drawSpiderSenseReticle = (ctx, x, y, time) => {
    ctx.save();
    ctx.translate(x, y);

    // 1. Micro Web Impact Splatter (Anchors on Cursor)
    const splatPoints = [
      { r: 24, a: 0 },
      { r: 20, a: Math.PI / 4 },
      { r: 26, a: Math.PI / 2 },
      { r: 19, a: (3 * Math.PI) / 4 },
      { r: 25, a: Math.PI },
      { r: 21, a: (5 * Math.PI) / 4 },
      { r: 27, a: (3 * Math.PI) / 2 },
      { r: 20, a: (7 * Math.PI) / 4 },
    ];

    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1.0;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 6;
    splatPoints.forEach((pt) => {
      const px = Math.cos(pt.a) * pt.r;
      const py = Math.sin(pt.a) * pt.r;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(px, py);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(px, py, 1.8, 0, Math.PI * 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.fill();
    });

    [0.45, 0.8].forEach((rFactor) => {
      ctx.beginPath();
      splatPoints.forEach((pt, idx) => {
        const px = Math.cos(pt.a) * (pt.r * rFactor);
        const py = Math.sin(pt.a) * (pt.r * rFactor);
        if (idx === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255, 60, 70, 0.6)';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });
    ctx.restore();

    // 2. Iconic Spider-Man Danger "Tingle" Waves (Pulsing Wavy Arcs)
    for (let wave = 0; wave < 3; wave++) {
      const wavePhase = (time * 4 + wave * 1.8) % 4.5;
      const waveRadius = 16 + wavePhase * 10;
      const waveAlpha = Math.max(0, 0.75 * (1.0 - (waveRadius - 16) / 32));

      ctx.save();
      ctx.beginPath();
      const waveSteps = 24;
      for (let w = 0; w <= waveSteps; w++) {
        const wa = (w / waveSteps) * Math.PI * 2;
        const crinkles = Math.sin(wa * 12 + time * 8) * 1.6;
        const r = waveRadius + crinkles;
        const wx = Math.cos(wa) * r;
        const wy = Math.sin(wa) * r;
        if (w === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(255, 40, 50, ${waveAlpha.toFixed(2)})`;
      ctx.lineWidth = 1.4;
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 8;
      ctx.stroke();
      ctx.restore();
    }

    // 3. Rotating Tactical Compass HUD Ring
    ctx.save();
    ctx.rotate(time * 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, 18, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 10;
    ctx.stroke();

    for (let deg = 0; deg < 8; deg++) {
      const angle = (deg * Math.PI) / 4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * 15, Math.sin(angle) * 15);
      ctx.lineTo(Math.cos(angle) * 21, Math.sin(angle) * 21);
      ctx.strokeStyle = deg % 2 === 0 ? '#FFFFFF' : 'rgba(255, 50, 60, 0.7)';
      ctx.lineWidth = deg % 2 === 0 ? 1.5 : 1.0;
      ctx.stroke();
    }
    ctx.restore();

    // 4. Tactical Cyber Corner Brackets framing cursor
    const bDist = 22 + Math.sin(time * 7) * 1.5;
    const bLen = 6;
    const brackets = [
      { dx: -1, dy: -1 },
      { dx: 1, dy: -1 },
      { dx: 1, dy: 1 },
      { dx: -1, dy: 1 },
    ];
    ctx.save();
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
    ctx.restore();

    // 5. Precision Cyber Spider Silhouette Emblem
    ctx.save();
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 8;

    // Abdomen & Thorax
    ctx.beginPath();
    ctx.ellipse(0, 1.6, 2.0, 3.0, 0, 0, Math.PI * 2);
    ctx.ellipse(0, -2.0, 1.4, 1.4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing White Eyes
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(-0.6, -2.2, 0.5, 0, Math.PI * 2);
    ctx.arc(0.6, -2.2, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 4 Pairs of Arachnid Legs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.lineWidth = 1.0;
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 4;
    const legs = [
      { y: -2.0, bendX: 7.0, bendY: -5.0, tipX: 6.2, tipY: -7.5 },
      { y: -0.8, bendX: 8.8, bendY: -2.0, tipX: 9.8, tipY: -3.2 },
      { y: 0.8, bendX: 8.8, bendY: 2.2, tipX: 9.8, tipY: 4.0 },
      { y: 2.4, bendX: 6.5, bendY: 6.0, tipX: 5.5, tipY: 8.2 },
    ];
    legs.forEach(({ y, bendX, bendY, tipX, tipY }) => {
      // Right Leg
      ctx.beginPath();
      ctx.moveTo(1.2, y);
      ctx.lineTo(bendX, bendY);
      ctx.lineTo(tipX, tipY);
      ctx.stroke();
      // Left Leg (Mirrored)
      ctx.beginPath();
      ctx.moveTo(-1.2, y);
      ctx.lineTo(-bendX, bendY);
      ctx.lineTo(-tipX, tipY);
      ctx.stroke();
    });
    ctx.restore();

    // 6. Center Blinding Laser Core Dot
    ctx.save();
    ctx.beginPath();
    ctx.arc(0, 0, 3.8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowColor = '#FFFFFF';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.restore();

    ctx.restore();
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
    </>
  );
}
