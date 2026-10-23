import * as THREE from 'three';

// Utility: Draw rounded rectangle path
function drawRoundRect(ctx, x, y, w, h, r) {
  if (ctx.roundRect) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    return;
  }
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y + w, x, y, r);
  ctx.closePath();
}

// Cache of loaded HTMLImageElement instances to avoid reloading
const imageCache = {};

function loadImage(src, onLoad) {
  if (!src) return null;
  if (imageCache[src]) {
    if (imageCache[src].complete) return imageCache[src];
    imageCache[src].addEventListener('load', onLoad);
    return imageCache[src];
  }
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = src;
  img.addEventListener('load', onLoad);
  imageCache[src] = img;
  return img;
}

// =========================================================================
// 1. MAIN FEATURED PROJECTS DISPLAY TEXTURE (2048 x 1088)
// =========================================================================
export function createProjectsScreenTexture(currentPage, projects, publicUrl, onUpdate) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1088;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dark Cyberpunk Monitor Base Background
    ctx.fillStyle = '#0a0c13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle dark blue radial ambient glow
    const bgRad = ctx.createRadialGradient(1024, 544, 200, 1024, 544, 1100);
    bgRad.addColorStop(0, 'rgba(25, 29, 44, 0.55)');
    bgRad.addColorStop(1, 'rgba(10, 12, 19, 0.98)');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Glowing Red Outer Border
    drawRoundRect(ctx, 16, 16, canvas.width - 32, canvas.height - 32, 28);
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.shadowBlur = 0; // reset shadow

    // Corner Tech Accent Brackets
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    // Top-left
    ctx.beginPath();
    ctx.moveTo(34, 60); ctx.lineTo(34, 34); ctx.lineTo(60, 34);
    ctx.stroke();
    // Top-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 60, 34); ctx.lineTo(canvas.width - 34, 34); ctx.lineTo(canvas.width - 34, 60);
    ctx.stroke();
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(34, canvas.height - 60); ctx.lineTo(34, canvas.height - 34); ctx.lineTo(60, canvas.height - 34);
    ctx.stroke();
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(canvas.width - 60, canvas.height - 34); ctx.lineTo(canvas.width - 34, canvas.height - 34); ctx.lineTo(canvas.width - 34, canvas.height - 60);
    ctx.stroke();

    // 2. Top Header Bar
    // Red Live Beacon Dot
    ctx.fillStyle = '#FF1E27';
    ctx.beginPath();
    ctx.arc(68, 72, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6B72';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(68, 72, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Header Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px "Space Grotesk", sans-serif';
    ctx.fillText('FEATURED PRODUCTION ARCHITECTURE', 96, 82);

    ctx.fillStyle = '#FF4D55';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText('SYS // LIVE_DEPLOYMENTS_MATRIX', 800, 80);

    // Header Right: Pagination Controls
    // "< PREV" Button
    drawRoundRect(ctx, 1600, 48, 140, 48, 10);
    ctx.fillStyle = currentPage === 1 ? 'rgba(255, 30, 39, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = currentPage === 1 ? '#FF1E27' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 20px "Space Grotesk", sans-serif';
    ctx.fillText('‹ PREV', 1632, 80);

    // Page Indicator Badge
    drawRoundRect(ctx, 1756, 48, 128, 48, 10);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.15)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FF6B72';
    ctx.font = '800 18px "Space Grotesk", sans-serif';
    ctx.fillText(`PAGE ${currentPage + 1} / 2`, 1774, 80);

    // "NEXT >" Button
    drawRoundRect(ctx, 1900, 48, 100, 48, 10);
    ctx.fillStyle = currentPage === 0 ? 'rgba(255, 30, 39, 0.25)' : 'rgba(255, 255, 255, 0.08)';
    ctx.fill();
    ctx.strokeStyle = currentPage === 0 ? '#FF1E27' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 20px "Space Grotesk", sans-serif';
    ctx.fillText('NEXT ›', 1916, 80);

    // Header divider line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 118);
    ctx.lineTo(canvas.width - 50, 118);
    ctx.stroke();

    // 3. Render 2x2 Grid of 4 Project Cards
    const displayed = projects.slice(currentPage * 4, currentPage * 4 + 4);
    const cardPositions = [
      { x: 52, y: 142, w: 950, h: 420 },   // Card 0: Top-Left
      { x: 1046, y: 142, w: 950, h: 420 }, // Card 1: Top-Right
      { x: 52, y: 588, w: 950, h: 420 },   // Card 2: Bottom-Left
      { x: 1046, y: 588, w: 950, h: 420 }, // Card 3: Bottom-Right
    ];

    displayed.forEach((proj, idx) => {
      const { x, y, w, h } = cardPositions[idx];

      // Card Background with dark glass gradient
      drawRoundRect(ctx, x, y, w, h, 20);
      const cardGrad = ctx.createLinearGradient(x, y, x + w, y + h);
      cardGrad.addColorStop(0, 'rgba(18, 22, 32, 0.96)');
      cardGrad.addColorStop(1, 'rgba(12, 14, 22, 0.98)');
      ctx.fillStyle = cardGrad;
      ctx.fill();

      // Card Border with subtle red accent
      ctx.strokeStyle = proj.accentColor ? `${proj.accentColor}88` : 'rgba(255, 30, 39, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Left Column: Thumbnail Preview (430 x 270 px)
      const thumbX = x + 24;
      const thumbY = y + 24;
      const thumbW = 430;
      const thumbH = 260;

      drawRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 14);
      ctx.fillStyle = '#080a10';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 2;
      ctx.stroke();

      const img = loadImage(publicUrl + proj.thumbnail, () => {
        redraw();
        if (onUpdate) onUpdate();
      });

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        drawRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 14);
        ctx.clip();
        ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
        ctx.restore();
      } else {
        // Fallback thumbnail tech artwork
        ctx.fillStyle = '#111520';
        ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
        ctx.fillStyle = '#FF1E27';
        ctx.font = '900 24px "Space Grotesk", sans-serif';
        ctx.fillText(proj.id.toUpperCase(), thumbX + 30, thumbY + 130);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 16px monospace';
        ctx.fillText('LIVE_PREVIEW_LOADING...', thumbX + 30, thumbY + 165);
      }

      // Thumbnail Bottom Bar: Live Host Pill
      drawRoundRect(ctx, thumbX + 16, thumbY + thumbH - 46, thumbW - 32, 34, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fill();
      ctx.strokeStyle = proj.accentColor || '#FF1E27';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Green live dot
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(thumbX + 34, thumbY + thumbH - 29, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = '700 15px "JetBrains Mono", monospace';
      ctx.fillText(proj.hostName, thumbX + 48, thumbY + thumbH - 24);

      // Right Column: Spec Details & Actions
      const rightX = x + 476;

      // Spec Tag
      ctx.fillStyle = '#FF4D55';
      ctx.font = '800 15px "JetBrains Mono", monospace';
      ctx.fillText(proj.badgeText || 'SPEC // FULL-STACK', rightX, y + 54);

      // Category Pill
      drawRoundRect(ctx, rightX, y + 68, 220, 26, 6);
      ctx.fillStyle = 'rgba(255, 30, 39, 0.14)';
      ctx.fill();
      ctx.fillStyle = '#FF8B92';
      ctx.font = '800 13px "Space Grotesk", sans-serif';
      ctx.fillText(proj.category, rightX + 10, y + 86);

      // Host Badge
      drawRoundRect(ctx, rightX + 234, y + 68, 130, 26, 6);
      ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.font = '800 13px "Space Grotesk", sans-serif';
      ctx.fillText(proj.hostBadge, rightX + 244, y + 86);

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 27px "Space Grotesk", sans-serif';
      // Truncate if long
      let titleText = proj.title;
      if (titleText.length > 28) titleText = titleText.substring(0, 26) + '...';
      ctx.fillText(titleText, rightX, y + 134);

      // Status Pill
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 15px "Space Grotesk", sans-serif';
      ctx.fillText(`Production Deploy: `, rightX, y + 168);
      ctx.fillStyle = '#22c55e';
      ctx.font = '800 15px "Space Grotesk", sans-serif';
      ctx.fillText(proj.status, rightX + 140, y + 168);

      // Repo reference
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText(`repo: ${proj.repo}`, rightX, y + 200);

      // Action Button 1: "OPEN LIVE APP ↗"
      const btn1Y = y + 236;
      drawRoundRect(ctx, rightX, btn1Y, 210, 48, 10);
      const b1Grad = ctx.createLinearGradient(rightX, btn1Y, rightX + 210, btn1Y + 48);
      b1Grad.addColorStop(0, '#FF2E36');
      b1Grad.addColorStop(1, '#C80810');
      ctx.fillStyle = b1Grad;
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 16px "Space Grotesk", sans-serif';
      ctx.fillText('OPEN LIVE APP ↗', rightX + 26, btn1Y + 31);

      // Action Button 2: "GITHUB REPO"
      drawRoundRect(ctx, rightX + 224, btn1Y, 180, 48, 10);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 16px "Space Grotesk", sans-serif';
      ctx.fillText('GITHUB REPO ⌨', rightX + 242, btn1Y + 31);

      // Bottom Tech Accent Bar of Card
      const techY = y + h - 58;
      drawRoundRect(ctx, x + 24, techY, w - 48, 40, 8);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 14px "JetBrains Mono", monospace';
      ctx.fillText(`STACK // React • TypeScript • Node.js • Express • PostgreSQL`, x + 38, techY + 26);
      ctx.fillStyle = '#FF4D55';
      ctx.font = '700 13px "Space Grotesk", sans-serif';
      ctx.fillText('CLICK TO LAUNCH', x + w - 175, techY + 26);
    });

    // 4. Bottom Footer Info
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 18px "Space Grotesk", sans-serif';
    ctx.fillText('Interactive 3D Command Deck: Click any project button or thumbnail to launch in browser', 68, 1052);

    ctx.fillStyle = '#FF6B72';
    ctx.font = '800 18px "JetBrains Mono", monospace';
    ctx.fillText(`SHOWING ${currentPage * 4 + 1}–${currentPage * 4 + displayed.length} OF ${projects.length} HOSTED APPS`, 1550, 1052);

    texture.needsUpdate = true;
  };

  redraw();
  return { texture, canvas, redraw };
}

// =========================================================================
// 2. WELCOME & REPOSITORIES TELEMETRY DISPLAY TEXTURE (1024 x 880)
// =========================================================================
export function createWelcomeScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 880;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Background
  ctx.fillStyle = '#0a0c13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 440, 100, 512, 440, 600);
  bgGrad.addColorStop(0, 'rgba(25, 29, 44, 0.6)');
  bgGrad.addColorStop(1, 'rgba(10, 12, 19, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red Outer Border
  drawRoundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 24);
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Header Beacon
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(54, 60, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.fillText('WORKSPACE ARCHITECTURE', 76, 70);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText('CYBER_DECK // ONLINE', 640, 68);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 95); ctx.lineTo(canvas.width - 40, 95);
  ctx.stroke();

  // Profile Card
  drawRoundRect(ctx, 40, 120, canvas.width - 80, 220, 16);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Avatar Icon Box
  drawRoundRect(ctx, 68, 148, 80, 80, 12);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FF1E27';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.fillText('⌘', 94, 202);

  // Profile Info
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 34px "Space Grotesk", sans-serif';
  ctx.fillText('Charan', 170, 185);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillText('Full-Stack AI Engineer & Systems Architect', 170, 215);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 17px "Space Grotesk", sans-serif';
  ctx.fillText('Building production-grade web applications, distributed databases,', 68, 275);
  ctx.fillText('and enterprise AI systems with seamless interactive 3D graphics.', 68, 305);

  // 2 Telemetry Stat Cards
  // Stat Card 1: 32 Repos
  drawRoundRect(ctx, 40, 370, 450, 180, 16);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();

  // GitHub badge icon
  drawRoundRect(ctx, 64, 400, 56, 56, 10);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px sans-serif';
  ctx.fillText('⌨', 80, 440);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px "Space Grotesk", sans-serif';
  ctx.fillText('32', 140, 448);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 18px "Space Grotesk", sans-serif';
  ctx.fillText('Public Repositories', 68, 510);

  // Stat Card 2: 18+ Deployments
  drawRoundRect(ctx, 534, 370, 450, 180, 16);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();

  drawRoundRect(ctx, 558, 400, 56, 56, 10);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.font = '900 28px sans-serif';
  ctx.fillText('🌐', 572, 440);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 52px "Space Grotesk", sans-serif';
  ctx.fillText('18+', 634, 448);

  ctx.fillStyle = '#4ade80';
  ctx.font = '700 18px "Space Grotesk", sans-serif';
  ctx.fillText('Live Production Deployments', 562, 510);

  // System Matrix Status Box
  drawRoundRect(ctx, 40, 580, canvas.width - 80, 240, 16);
  ctx.fillStyle = 'rgba(14, 17, 26, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#FF4D55';
  ctx.font = '800 16px "JetBrains Mono", monospace';
  ctx.fillText('CORE RUNTIME & INFRASTRUCTURE', 68, 620);

  const specs = [
    { label: 'Cloud Hosting:', val: 'Vercel / Netlify / AWS' },
    { label: 'Databases:', val: 'PostgreSQL, MongoDB, Supabase' },
    { label: 'AI & ML:', val: 'FAISS Vector Search, LangChain, OpenAI' },
    { label: 'Status:', val: 'All Systems Operational (100% Uptime)' },
  ];

  specs.forEach((s, i) => {
    const rowY = 660 + i * 36;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillText(s.label, 68, rowY);

    ctx.fillStyle = s.label === 'Status:' ? '#22c55e' : '#FFFFFF';
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.fillText(s.val, 240, rowY);
  });

  texture.needsUpdate = true;
  return { texture, canvas };
}

// =========================================================================
// 3. TECH STACK & PHILOSOPHY DISPLAY TEXTURE (1024 x 880)
// =========================================================================
export function createTechStackScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 880;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Background
  ctx.fillStyle = '#0a0c13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 440, 100, 512, 440, 600);
  bgGrad.addColorStop(0, 'rgba(25, 29, 44, 0.6)');
  bgGrad.addColorStop(1, 'rgba(10, 12, 19, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red Outer Border
  drawRoundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 24);
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Header Beacon
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(54, 60, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.fillText('TECH STACK & CORE MATRIX', 76, 70);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 16px "JetBrains Mono", monospace';
  ctx.fillText('FULL_STACK_SKILLS', 660, 68);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 95); ctx.lineTo(canvas.width - 40, 95);
  ctx.stroke();

  // 12 Technologies in a 4-col x 3-row Grid
  const techs = [
    { name: 'React', color: '#61DAFB', symbol: '⚛' },
    { name: 'TypeScript', color: '#3178C6', symbol: 'TS' },
    { name: 'Node.js', color: '#68A063', symbol: '⬢' },
    { name: 'Python', color: '#FFD43B', symbol: '🐍' },
    { name: 'PostgreSQL', color: '#336791', symbol: '🐘' },
    { name: 'Docker', color: '#2496ED', symbol: '🐳' },
    { name: 'FastAPI', color: '#009688', symbol: '⚡' },
    { name: 'Qiskit', color: '#8A2BE2', symbol: '⚛' },
    { name: 'Prisma', color: '#8B5CF6', symbol: '💎' },
    { name: 'TailwindCSS', color: '#38BDF8', symbol: '💨' },
    { name: 'Three.js', color: '#FF1E27', symbol: '🧊' },
    { name: 'Express', color: '#FFFFFF', symbol: 'EX' },
  ];

  const cols = 4;
  const startX = 40;
  const startY = 120;
  const cardW = 220;
  const cardH = 155;
  const gapX = 22;
  const gapY = 20;

  techs.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    drawRoundRect(ctx, x, y, cardW, cardH, 14);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
    ctx.fill();
    ctx.strokeStyle = `${t.color}55`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top color strip
    drawRoundRect(ctx, x + 16, y + 16, 48, 48, 10);
    ctx.fillStyle = `${t.color}22`;
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = t.color;
    ctx.font = '900 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.symbol, x + 40, y + 49);
    ctx.textAlign = 'left';

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 21px "Space Grotesk", sans-serif';
    ctx.fillText(t.name, x + 18, y + 104);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 13px "JetBrains Mono", monospace';
    ctx.fillText('PRODUCTION', x + 18, y + 130);
  });

  // Bottom Philosophy Banner
  const philY = 670;
  drawRoundRect(ctx, 40, philY, canvas.width - 80, 160, 18);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.12)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('“BUILD • INNOVATE • INSPIRE”', canvas.width / 2, philY + 68);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 20px "Space Grotesk", sans-serif';
  ctx.fillText('Continuous Learning • Clean Scalable Code • Modern Cyber Aesthetics', canvas.width / 2, philY + 112);
  ctx.textAlign = 'left';

  texture.needsUpdate = true;
  return { texture, canvas };
}

// =========================================================================
// 4. QUICK ACCESS CONSOLE TEXTURE (1024 x 630)
// =========================================================================
export function createQuickAccessScreenTexture(hoveredBtn) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 630;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const redraw = (hoverIndex = -1) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0a0c13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgGrad = ctx.createRadialGradient(512, 315, 80, 512, 315, 500);
    bgGrad.addColorStop(0, 'rgba(25, 29, 44, 0.65)');
    bgGrad.addColorStop(1, 'rgba(10, 12, 19, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red Outer Border
    drawRoundRect(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 24);
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 24;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header Beacon
    ctx.fillStyle = '#FF1E27';
    ctx.beginPath();
    ctx.arc(58, 62, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#FF2E36';
    ctx.font = '900 32px "Space Grotesk", sans-serif';
    ctx.fillText('QUICK ACCESS CONSOLE', 84, 73);

    ctx.fillStyle = '#FF6B72';
    ctx.font = '700 16px "JetBrains Mono", monospace';
    ctx.fillText('SYS_MENU_V2', 740, 70);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, 104); ctx.lineTo(canvas.width - 40, 104);
    ctx.stroke();

    // 3 Action Buttons
    const buttons = [
      { id: 0, icon: '⧉', title: 'Switch Projects Page', sub: 'Cycle through featured production applications', arrow: '›' },
      { id: 1, icon: '⌨', title: 'GitHub Profile', sub: 'Open github.com/Charan-718 in browser', arrow: '↗' },
      { id: 2, icon: '⚡', title: 'Trigger Hologram Re-Scan', sub: 'Replay avatar red laser scanline materialization', arrow: '›' },
    ];

    buttons.forEach((btn, i) => {
      const btnY = 130 + i * 155;
      const btnH = 135;
      const isHovered = hoverIndex === i;

      drawRoundRect(ctx, 40, btnY, canvas.width - 80, btnH, 16);
      ctx.fillStyle = isHovered ? 'rgba(255, 30, 39, 0.22)' : 'rgba(20, 24, 36, 0.9)';
      ctx.fill();

      ctx.strokeStyle = isHovered ? '#FF1E27' : 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = isHovered ? 3 : 2;
      if (isHovered) {
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 18;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Icon Box
      drawRoundRect(ctx, 64, btnY + 28, 76, 76, 12);
      ctx.fillStyle = isHovered ? '#FF1E27' : 'rgba(255, 30, 39, 0.15)';
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(btn.icon, 102, btnY + 80);
      ctx.textAlign = 'left';

      // Title & Subtitle
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 28px "Space Grotesk", sans-serif';
      ctx.fillText(btn.title, 160, btnY + 66);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 17px "Space Grotesk", sans-serif';
      ctx.fillText(btn.sub, 160, btnY + 100);

      // Trailing Arrow
      ctx.fillStyle = isHovered ? '#FF1E27' : '#FFFFFF';
      ctx.font = '900 42px "Space Grotesk", sans-serif';
      ctx.fillText(btn.arrow, canvas.width - 110, btnY + 82);
    });

    texture.needsUpdate = true;
  };

  redraw();
  return { texture, canvas, redraw };
}
