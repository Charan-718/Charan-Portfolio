import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { playClickSound } from '../utils/soundEffects';
import './CyberChevronAttraction.css';

/**
 * CyberChevronAttraction Component
 * Replaces spider-man web aesthetics with a high-tech cyberpunk vector attraction system.
 * When the user interacts in the Hero section, it dynamically locks onto the 3D Workspace
 * button (#navCubeArenaBtn) and streams pulsing, neon-red directional chevrons (>>>>)
 * along a tactical laser vector, guiding attention directly to the 3D Workspace.
 */
export default function CyberChevronAttraction({
  onOpenArena,
  targetId = 'navCubeArenaBtn',
  enabled = true,
}) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);
  const hasFiredChirp = useRef(false);

  // Mouse & Cyber Attraction Physics State
  const mouseState = useRef({
    cursorX: 0,
    cursorY: 0,
    prevCursorX: 0,
    prevCursorY: 0,
    velX: 0,
    velY: 0,
    isInside: false,
    progress: 0.0, // 0 = inactive, 1 = locked on
    btnOffsetX: 0,
    btnOffsetY: 0,
    btnRotX: 0,
    btnRotY: 0,
    // Packets of chevrons flowing along the laser beam
    packets: [
      { t: 0.12, speed: 0.22 },
      { t: 0.45, speed: 0.26 },
      { t: 0.78, speed: 0.24 },
    ],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Track cursor position and detect hero section presence
  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!enabled) {
        mouseState.current.isInside = false;
        hasFiredChirp.current = false;
        return;
      }

      const clientX = e.clientX;
      const clientY = e.clientY;
      const m = mouseState.current;

      const dx = clientX - m.cursorX;
      const dy = clientY - m.cursorY;
      m.velX = m.velX * 0.4 + dx * 0.6;
      m.velY = m.velY * 0.4 + dy * 0.6;
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
          if (!hasFiredChirp.current) {
            hasFiredChirp.current = true;
            playClickSound('telemetry');
          }
        }
      } else {
        if (m.isInside) {
          m.isInside = false;
          hasFiredChirp.current = false;
        }
      }
    };

    const handlePointerLeave = () => {
      mouseState.current.isInside = false;
      hasFiredChirp.current = false;
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('blur', handlePointerLeave, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('blur', handlePointerLeave);
    };
  }, [targetId, enabled]);

  // Click feedback on target navbar button
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

  // Main Canvas Animation Loop
  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let time = 0;

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

    // Helper: Draw a single 3D-beveled neon chevron
    const drawChevron = (x, y, width, height, thickness, angle, alpha = 1.0, glow = true) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

      if (glow) {
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 10;
      }

      const halfH = height / 2;
      const hw = width;
      const t = thickness;

      ctx.beginPath();
      ctx.moveTo(-hw / 2, -halfH);
      ctx.lineTo(-hw / 2 + t, -halfH);
      ctx.lineTo(hw / 2, 0);
      ctx.lineTo(-hw / 2 + t, halfH);
      ctx.lineTo(-hw / 2, halfH);
      ctx.lineTo(hw / 2 - t, 0);
      ctx.closePath();

      // Multi-stop linear gradient for authentic 3D embossed look matching reference
      const grad = ctx.createLinearGradient(0, -halfH, 0, halfH);
      grad.addColorStop(0, '#FF525B');
      grad.addColorStop(0.35, '#FF1E27');
      grad.addColorStop(0.7, '#D40C14');
      grad.addColorStop(1, '#660005');

      ctx.fillStyle = grad;
      ctx.fill();

      // Subtle edge highlight stroke
      ctx.strokeStyle = 'rgba(255, 140, 150, 0.65)';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      ctx.restore();
    };

    // Helper: Draw a group of 4 chevrons (>>>>) with sequential illumination
    const drawChevronGroup = (cx, cy, spacing, width, height, thickness, angle, baseAlpha, timeOffset = 0) => {
      const totalWidth = 3 * spacing;
      const startOffset = -totalWidth / 2;

      for (let i = 0; i < 4; i++) {
        const offsetAlong = startOffset + i * spacing;
        const px = cx + Math.cos(angle) * offsetAlong;
        const py = cy + Math.sin(angle) * offsetAlong;

        // Wave phase along the 4 chevrons
        const wave = Math.sin(time * 5 - i * 0.7 + timeOffset);
        const chevAlpha = baseAlpha * (0.65 + 0.35 * Math.max(0, wave));
        const chevScale = 1.0 + 0.08 * Math.max(0, wave);

        drawChevron(
          px,
          py,
          width * chevScale,
          height * chevScale,
          thickness * chevScale,
          angle,
          chevAlpha,
          true
        );
      }
    };

    const render = () => {
      time += 0.035;
      const m = mouseState.current;
      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      // Smooth progress interpolation
      const targetProgress = m.isInside && enabled ? 1.0 : 0.0;
      m.progress += (targetProgress - m.progress) * (m.isInside ? 0.22 : 0.16);
      if (Math.abs(m.progress - targetProgress) < 0.001) {
        m.progress = targetProgress;
      }

      // Coordinates of Navbar 3D Target Button
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

      // Magnetic Pull on the Target Button
      if (targetBtn) {
        let pullX = 0;
        let pullY = 0;
        let rotX = 0;
        let rotY = 0;

        if (m.isInside && m.progress > 0.05) {
          const dx = m.cursorX - emitterX;
          const dy = m.cursorY - emitterY;
          const dist = Math.hypot(dx, dy);

          if (dist > 5) {
            const maxPull = 12;
            const factor = Math.min(1.0, 450 / (dist + 60));
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

      // Render Vector Attraction Telemetry & Flowing Chevrons (>>>>)
      if (m.progress > 0.005) {
        const targetTipX = emitterX + (m.cursorX - emitterX) * m.progress;
        const targetTipY = emitterY + (m.cursorY - emitterY) * m.progress;

        const vecDx = emitterX - targetTipX;
        const vecDy = emitterY - targetTipY;
        const totalDist = Math.hypot(vecDx, vecDy) || 1;
        const angleToTarget = Math.atan2(vecDy, vecDx);

        const currentAlpha = m.progress;

        // 1. Holographic Laser Vector Line
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 30, 39, 0.4)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([8, 8]);
        ctx.lineDashOffset = -time * 40;
        ctx.beginPath();
        ctx.moveTo(targetTipX, targetTipY);
        ctx.lineTo(emitterX, emitterY);
        ctx.stroke();

        // Core thin beam
        ctx.setLineDash([]);
        ctx.strokeStyle = `rgba(255, 120, 130, ${(0.35 * currentAlpha).toFixed(2)})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(targetTipX, targetTipY);
        ctx.lineTo(emitterX, emitterY);
        ctx.stroke();
        ctx.restore();

        // 2. Continuous Flowing Packets of Neon-Red Chevrons (>>>>) along Vector
        m.packets.forEach((pkt, pIdx) => {
          pkt.t = (pkt.t + pkt.speed * 0.02) % 1.0;

          // Only render along the active segment of the line
          if (totalDist > 80) {
            const margin = 50 / totalDist;
            const clampedT = margin + pkt.t * (1 - 2 * margin);

            // Interpolated position along vector (flowing towards button)
            const px = targetTipX + vecDx * clampedT;
            const py = targetTipY + vecDy * clampedT;

            // Packet fade near ends
            const edgeFade = Math.sin(clampedT * Math.PI);
            const pktAlpha = currentAlpha * edgeFade * 0.95;

            // Draw group of 4 chevrons (>>>>) pointing along vector towards target button
            drawChevronGroup(
              px,
              py,
              12, // spacing between chevrons
              13, // chevron width
              17, // chevron height
              5.5, // chevron thickness
              angleToTarget,
              pktAlpha,
              pIdx * 1.5
            );
          }
        });

        // 3. Cyber Lock-On Reticle at Cursor
        ctx.save();
        ctx.translate(targetTipX, targetTipY);

        const reticleAlpha = currentAlpha;

        // Rotating Tactical Segmented HUD Ring
        ctx.save();
        ctx.rotate(time * 0.4);
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 30, 39, ${(0.6 * reticleAlpha).toFixed(2)})`;
        ctx.lineWidth = 1.4;
        ctx.setLineDash([6, 12]);
        ctx.stroke();
        ctx.restore();

        // Tactical Cyber Corner Brackets [ ]
        const bDist = 28 + Math.sin(time * 6) * 1.5;
        const bLen = 8;
        const brackets = [
          { dx: -1, dy: -1 },
          { dx: 1, dy: -1 },
          { dx: 1, dy: 1 },
          { dx: -1, dy: 1 },
        ];
        ctx.save();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.6;
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

        // 4. Highlight Attraction Emblem (>>>>) in Reticle Center
        // Rotated towards target button direction
        drawChevronGroup(
          0,
          0,
          11, // spacing
          12, // width
          16, // height
          5, // thickness
          angleToTarget,
          reticleAlpha * 0.98,
          0
        );

        // Center Pulsing Core Dot
        ctx.save();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // 5. Tactical Telemetry HUD Readout Label
        ctx.save();
        ctx.font = '700 9px "JetBrains Mono", monospace';
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 8;
        const labelText = `3D WORKSPACE [ >>>> ]`;
        ctx.fillText(labelText, 36, -8);

        ctx.font = '600 8px "JetBrains Mono", monospace';
        ctx.fillStyle = 'rgba(255, 60, 70, 0.85)';
        ctx.fillText(`VECTOR: ${Math.round(totalDist)}PX // LOCK`, 36, 6);
        ctx.restore();

        ctx.restore();

        // 6. Emitter Radar Pulse at Target Button
        ctx.save();
        ctx.translate(emitterX, emitterY);
        for (let r = 0; r < 2; r++) {
          const rPhase = (time * 2.2 + r * 1.5) % 3.0;
          const rRadius = Math.max(btnWidth, btnHeight) * 0.6 + rPhase * 18;
          const rAlpha = Math.max(0, (1 - rPhase / 3.0) * 0.7 * currentAlpha);

          ctx.beginPath();
          ctx.arc(0, 0, rRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(255, 30, 39, ${rAlpha.toFixed(2)})`;
          ctx.lineWidth = 1.4;
          ctx.shadowColor = '#FF1E27';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      const targetBtn = document.getElementById(targetId);
      if (targetBtn) targetBtn.style.transform = '';
    };
  }, [mounted, targetId, enabled]);

  return (
    <>
      {mounted &&
        typeof document !== 'undefined' &&
        createPortal(
          <canvas ref={canvasRef} className="cyber-chevron-overlay-canvas" />,
          document.body
        )}
    </>
  );
}
