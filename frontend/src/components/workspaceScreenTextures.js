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

// Utility: High-Tech Cyberpunk Chamfered Polygon Card (45° angle cuts on corners)
function drawCyberCard(ctx, x, y, w, h, chamfer = 16) {
  ctx.beginPath();
  ctx.moveTo(x + chamfer, y);
  ctx.lineTo(x + w - chamfer, y);
  ctx.lineTo(x + w, y + chamfer);
  ctx.lineTo(x + w, y + h - chamfer);
  ctx.lineTo(x + w - chamfer, y + h);
  ctx.lineTo(x + chamfer, y + h);
  ctx.lineTo(x, y + h - chamfer);
  ctx.lineTo(x, y + chamfer);
  ctx.closePath();
}

// Utility: Cyberpunk Corner Targeting Brackets
function drawCyberCornerBrackets(ctx, x, y, w, h, len = 14, color = '#FF1E27', lw = 2) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  ctx.beginPath();
  // Top-Left
  ctx.moveTo(x, y + len); ctx.lineTo(x, y); ctx.lineTo(x + len, y);
  // Top-Right
  ctx.moveTo(x + w - len, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + len);
  // Bottom-Left
  ctx.moveTo(x, y + h - len); ctx.lineTo(x, y + h); ctx.lineTo(x + len, y + h);
  // Bottom-Right
  ctx.moveTo(x + w - len, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
  ctx.restore();
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
// =========================================================================
// 1. MAIN FEATURED PROJECTS DISPLAY TEXTURE (2048 x 1088) WITH HORIZONTAL SWIPING / SCROLLING
// =========================================================================
// =========================================================================
// 1. MAIN FEATURED PROJECTS DISPLAY TEXTURE (2048 x 1088) (MATCHING IMAGE 4)
// =========================================================================
export function createProjectsScreenTexture(initialScrollX = 0, projects, publicUrl, onUpdate) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1088;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  let currentScrollX = initialScrollX || 0;
  const allProjects = projects || [];
  const numPages = Math.max(1, Math.ceil(allProjects.length / 6));
  const maxScrollX = (numPages - 1) * 2048;

  const redraw = (scrollX = currentScrollX) => {
    currentScrollX = Math.max(0, Math.min(maxScrollX, scrollX));
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Deep Cyber Deck Ambient Background (Industrial Dark Gray Palette)
    ctx.fillStyle = '#141316';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgRad = ctx.createRadialGradient(1024, 544, 200, 1024, 544, 1100);
    bgRad.addColorStop(0, 'rgba(40, 39, 42, 0.55)');
    bgRad.addColorStop(1, 'rgba(18, 17, 20, 0.98)');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Outer Cyber Monitor Red Border & Glow Bezel (Chamfered Cyber Deck)
    drawCyberCard(ctx, 16, 16, canvas.width - 32, canvas.height - 32, 28);
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 5;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 20;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corner Tech Accent Brackets (Top & Bottom Corners)
    drawCyberCornerBrackets(ctx, 24, 24, canvas.width - 48, canvas.height - 48, 36, '#FFFFFF', 3.5);

    // 2. Render Project Cards (6 Cards Per Page: 3 Columns x 2 Rows)
    const cardW = 590;
    const cardH = 360;
    const colGap = 44;
    const rowGap = 34;
    const startX = 95;
    const startY = 176;

    allProjects.forEach((proj, idx) => {
      const page = Math.floor(idx / 6);
      const idxInPage = idx % 6;
      const col = idxInPage % 3;
      const row = Math.floor(idxInPage / 3);

      const x = page * 2048 + startX + col * (cardW + colGap) - currentScrollX;
      const y = startY + row * (cardH + rowGap);

      // Culling: only draw if visible inside canvas viewport
      if (x + cardW < -40 || x > canvas.width + 40) return;

      // Card Outer Shell (Chamfered 45° Cyberpunk Angular Frame)
      drawCyberCard(ctx, x, y, cardW, cardH, 18);
      const cardGrad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
      cardGrad.addColorStop(0, 'rgba(18, 22, 34, 0.96)');
      cardGrad.addColorStop(1, 'rgba(10, 12, 20, 0.98)');
      ctx.fillStyle = cardGrad;
      ctx.fill();

      // Card Border & Red Glowing Outline
      ctx.strokeStyle = 'rgba(255, 30, 39, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Corner Crosshair Brackets on each card
      drawCyberCornerBrackets(ctx, x, y, cardW, cardH, 16, '#FF1E27', 2);

      // Top Half: Thumbnail Image Preview (Matching Image 4)
      const thumbX = x + 12;
      const thumbY = y + 12;
      const thumbW = cardW - 24;
      const thumbH = 236;

      drawCyberCard(ctx, thumbX, thumbY, thumbW, thumbH, 12);
      ctx.fillStyle = '#181719';
      ctx.fill();

      const img = loadImage(publicUrl + proj.thumbnail, () => {
        redraw();
        if (onUpdate) onUpdate();
      });

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        drawCyberCard(ctx, thumbX, thumbY, thumbW, thumbH, 12);
        ctx.clip();
        ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
        ctx.restore();
      } else {
        // Fallback tech thumbnail artwork
        ctx.fillStyle = '#111522';
        ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
        ctx.fillStyle = '#FF1E27';
        ctx.font = '900 24px "Space Grotesk", sans-serif';
        ctx.fillText(proj.title, thumbX + 28, thumbY + 115);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '600 15px monospace';
        ctx.fillText('LIVE_SYSTEM_READY', thumbX + 28, thumbY + 150);
      }

      // Thumbnail Image Border
      drawCyberCard(ctx, thumbX, thumbY, thumbW, thumbH, 12);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Bottom Half: Typography & Arrow (Exact Image 4 Details)
      // [01] Red Tag
      const tagText = proj.tag || `[${String(idx + 1).padStart(2, '0')}]`;
      ctx.fillStyle = '#FF1E27';
      ctx.font = '800 16px "Chakra Petch", monospace';
      ctx.fillText(tagText, x + 20, y + 278);

      // Main Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 24px "Space Grotesk", sans-serif';
      let titleText = proj.title;
      if (titleText.length > 25) titleText = titleText.substring(0, 23) + '...';
      ctx.fillText(titleText, x + 20, y + 310);

      // Subtitle
      ctx.fillStyle = '#8F9BB3';
      ctx.font = '600 15px "Chakra Petch", sans-serif';
      ctx.fillText(proj.subtitle || proj.category, x + 20, y + 338);

      // Right Arrow: →
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 28px "Space Grotesk", sans-serif';
      ctx.fillText('→', x + cardW - 46, y + 322);
    });

    // 3. Fixed Top Header (Exact Image 4 Header)
    // Red Vertical Bar Indicator
    drawCyberCard(ctx, 95, 54, 8, 52, 2);
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 14;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Header Main Title
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 42px "Space Grotesk", sans-serif';
    ctx.fillText('Featured Projects', 118, 92);

    // Header Subtitle
    ctx.fillStyle = '#8F9BB3';
    ctx.font = '700 16px "Chakra Petch", monospace';
    ctx.fillText('BUILDING IDEAS INTO REAL-WORLD SOLUTIONS', 118, 126);

    // 4. Fixed Bottom Action Controls (Exact Image 4 & User Request)
    const btnY = 964;
    const btnH = 54;
    const currentPage = Math.round(currentScrollX / 2048);

    // A. Left Swipe Button: "‹ PREV"
    const prevX = 674;
    const prevW = 160;
    drawCyberCard(ctx, prevX, btnY, prevW, btnH, 10);
    ctx.fillStyle = currentScrollX > 100 ? 'rgba(255, 30, 39, 0.16)' : 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.strokeStyle = currentScrollX > 100 ? '#FF1E27' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, prevX, btnY, prevW, btnH, 8, '#FF1E27', 1.5);
    ctx.fillStyle = currentScrollX > 100 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
    ctx.font = '800 18px "Chakra Petch", sans-serif';
    ctx.fillText('‹ PREV', prevX + 46, btnY + 34);

    // B. Middle Centered Action: "VIEW ALL PROJECTS →" (Exact Image 4 Button)
    const viewAllX = 874;
    const viewAllW = 300;
    drawCyberCard(ctx, viewAllX, btnY, viewAllW, btnH, 12);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.12)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 2.2;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;
    drawCyberCornerBrackets(ctx, viewAllX, btnY, viewAllW, btnH, 12, '#FF1E27', 2);
    ctx.fillStyle = '#FF1E27';
    ctx.font = '800 17px "Chakra Petch", sans-serif';
    ctx.fillText('VIEW ALL PROJECTS  →', viewAllX + 44, btnY + 34);

    // C. Right Swipe Button: "NEXT ›"
    const nextX = 1214;
    const nextW = 160;
    drawCyberCard(ctx, nextX, btnY, nextW, btnH, 10);
    ctx.fillStyle = currentScrollX < maxScrollX - 100 ? 'rgba(255, 30, 39, 0.16)' : 'rgba(255, 255, 255, 0.06)';
    ctx.fill();
    ctx.strokeStyle = currentScrollX < maxScrollX - 100 ? '#FF1E27' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, nextX, btnY, nextW, btnH, 8, '#FF1E27', 1.5);
    ctx.fillStyle = currentScrollX < maxScrollX - 100 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.4)';
    ctx.font = '800 18px "Chakra Petch", sans-serif';
    ctx.fillText('NEXT ›', nextX + 48, btnY + 34);

    // D. Page Dots
    for (let p = 0; p < numPages; p++) {
      const dotX = 1024 + (p - (numPages - 1) / 2) * 22;
      const dotY = 1046;
      ctx.beginPath();
      ctx.arc(dotX, dotY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p === currentPage ? '#FF1E27' : 'rgba(255, 255, 255, 0.25)';
      ctx.fill();
    }

    texture.needsUpdate = true;
  };

  const setScrollX = (newScrollX) => {
    redraw(newScrollX);
  };

  redraw(initialScrollX);
  return { texture, canvas, redraw, setScrollX, getMaxScrollX: () => maxScrollX };
}

// =========================================================================
// 2. WELCOME & REPOSITORIES TELEMETRY DISPLAY TEXTURE (1024 x 880)
// Features Charan's GitHub Profile, Live Repositories & Architecture
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
  ctx.fillStyle = '#141316';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 440, 100, 512, 440, 600);
  bgGrad.addColorStop(0, 'rgba(40, 39, 42, 0.6)');
  bgGrad.addColorStop(1, 'rgba(18, 17, 20, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red Outer Border (Chamfered Cyber Deck)
  drawCyberCard(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 24);
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawCyberCornerBrackets(ctx, 22, 22, canvas.width - 44, canvas.height - 44, 30, '#FF1E27', 3);

  // Header Beacon
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(54, 60, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.fillText('WORKSPACE ARCHITECTURE', 76, 70);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 16px "Chakra Petch", monospace';
  ctx.fillText('CYBER_DECK // ONLINE', 640, 68);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 95); ctx.lineTo(canvas.width - 40, 95);
  ctx.stroke();

  // Profile Card (Chamfered Cyberpunk Chassis)
  drawCyberCard(ctx, 40, 115, canvas.width - 80, 205, 18);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.92)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawCyberCornerBrackets(ctx, 40, 115, canvas.width - 80, 205, 16, '#FF1E27', 2);

  // Avatar Icon Box
  drawCyberCard(ctx, 64, 138, 72, 72, 12);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FF1E27';
  ctx.font = '900 34px "Space Grotesk", sans-serif';
  ctx.fillText('⌘', 86, 188);

  // Profile Info
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px "Space Grotesk", sans-serif';
  ctx.fillText('Charan', 156, 172);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '800 17px "Space Grotesk", sans-serif';
  ctx.fillText('Full-Stack AI Engineer & Systems Architect', 156, 198);

  // GitHub Account Direct Handle Pill in Profile Card
  drawCyberCard(ctx, 630, 140, 320, 38, 10);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.15)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 15px "Chakra Petch", monospace';
  ctx.fillText('⌨ github.com/Charan-718 ↗', 646, 164);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '500 16px "Space Grotesk", sans-serif';
  ctx.fillText('Building production-grade web applications, distributed databases,', 64, 252);
  ctx.fillText('and enterprise AI systems with seamless interactive 3D graphics.', 64, 280);

  // 2 Telemetry Stat Cards
  // Stat Card 1: GITHUB PROFILE & REPOSITORIES (Chamfered Cyberpunk Style)
  drawCyberCard(ctx, 40, 340, 450, 205, 16);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawCyberCornerBrackets(ctx, 40, 340, 450, 205, 16, '#FF1E27', 2);

  // GitHub badge icon box
  drawCyberCard(ctx, 64, 362, 54, 54, 10);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.2)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 26px sans-serif';
  ctx.fillText('⌨', 78, 399);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 46px "Space Grotesk", sans-serif';
  ctx.fillText('32', 134, 404);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 14px "Chakra Petch", monospace';
  ctx.fillText('@Charan-718', 214, 400);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '700 16px "Space Grotesk", sans-serif';
  ctx.fillText('Public Repositories • Open Source', 64, 442);

  // GitHub Profile Action Button
  const ghBtnY = 472;
  drawCyberCard(ctx, 64, ghBtnY, 402, 52, 10);
  const ghGrad = ctx.createLinearGradient(64, ghBtnY, 466, ghBtnY + 52);
  ghGrad.addColorStop(0, '#FF2E36');
  ghGrad.addColorStop(1, '#C80810');
  ctx.fillStyle = ghGrad;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 17px "Chakra Petch", sans-serif';
  ctx.fillText('OPEN GITHUB PROFILE ↗', 154, ghBtnY + 33);

  // Stat Card 2: 18+ Deployments (Chamfered Cyberpunk Style)
  drawCyberCard(ctx, 534, 340, 450, 205, 16);
  ctx.fillStyle = 'rgba(18, 22, 34, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawCyberCornerBrackets(ctx, 534, 340, 450, 205, 16, '#22c55e', 2);

  drawCyberCard(ctx, 558, 362, 54, 54, 10);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
  ctx.fill();
  ctx.fillStyle = '#22c55e';
  ctx.font = '900 26px sans-serif';
  ctx.fillText('🌐', 570, 399);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 46px "Space Grotesk", sans-serif';
  ctx.fillText('18+', 626, 404);

  ctx.fillStyle = '#4ade80';
  ctx.font = '700 14px "Chakra Petch", monospace';
  ctx.fillText('VERIFIED HOSTS', 740, 400);

  ctx.fillStyle = '#4ade80';
  ctx.font = '700 16px "Space Grotesk", sans-serif';
  ctx.fillText('Live Production Deployments', 558, 442);

  // Deployments Action Button
  const depBtnY = 472;
  drawCyberCard(ctx, 558, depBtnY, 402, 52, 10);
  ctx.fillStyle = 'rgba(34, 197, 94, 0.18)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 17px "Chakra Petch", sans-serif';
  ctx.fillText('EXPLORE HOSTED REPOS ↗', 636, depBtnY + 33);

  // System Matrix Status Box (Chamfered Cyberpunk Style)
  drawCyberCard(ctx, 40, 565, canvas.width - 80, 260, 18);
  ctx.fillStyle = 'rgba(14, 17, 26, 0.95)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
  drawCyberCornerBrackets(ctx, 40, 565, canvas.width - 80, 260, 18, '#FF1E27', 2);

  ctx.fillStyle = '#FF4D55';
  ctx.font = '800 16px "Chakra Petch", monospace';
  ctx.fillText('CORE RUNTIME & INFRASTRUCTURE', 68, 604);

  const specs = [
    { label: 'Cloud Hosting:', val: 'Vercel / Netlify / AWS' },
    { label: 'Databases:', val: 'PostgreSQL, MongoDB, Supabase' },
    { label: 'AI & ML:', val: 'FAISS Vector Search, LangChain, OpenAI' },
    { label: 'GitHub Ecosystem:', val: 'github.com/Charan-718 (32 Repositories)' },
    { label: 'Status:', val: 'All Systems Operational (100% Uptime)' },
  ];

  specs.forEach((s, i) => {
    const rowY = 642 + i * 36;
    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillText(s.label, 68, rowY);

    ctx.fillStyle = s.label === 'Status:' ? '#22c55e' : (s.label === 'GitHub Ecosystem:' ? '#FF6B72' : '#FFFFFF');
    ctx.font = '800 16px "Chakra Petch", monospace';
    ctx.fillText(s.val, 280, rowY);
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
  ctx.fillStyle = '#141316';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 440, 100, 512, 440, 600);
  bgGrad.addColorStop(0, 'rgba(40, 39, 42, 0.6)');
  bgGrad.addColorStop(1, 'rgba(18, 17, 20, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Red Outer Border (Chamfered Cyber Deck)
  drawCyberCard(ctx, 14, 14, canvas.width - 28, canvas.height - 28, 24);
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 20;
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawCyberCornerBrackets(ctx, 22, 22, canvas.width - 44, canvas.height - 44, 30, '#FF1E27', 3);

  // Header Beacon
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(54, 60, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 28px "Space Grotesk", sans-serif';
  ctx.fillText('TECH STACK & CORE MATRIX', 76, 70);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 16px "Chakra Petch", monospace';
  ctx.fillText('FULL_STACK_SKILLS', 660, 68);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(40, 95); ctx.lineTo(canvas.width - 40, 95);
  ctx.stroke();

  // 12 Technologies in a 4-col x 3-row Grid (Chamfered Cyberpunk Cards)
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

    drawCyberCard(ctx, x, y, cardW, cardH, 14);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.9)';
    ctx.fill();
    ctx.strokeStyle = `${t.color}66`;
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, x, y, cardW, cardH, 10, t.color, 1.5);

    // Top color strip
    drawCyberCard(ctx, x + 16, y + 16, 48, 48, 8);
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
    ctx.font = '700 13px "Chakra Petch", monospace';
    ctx.fillText('PRODUCTION', x + 18, y + 130);
  });

  // Bottom Philosophy Banner (Chamfered Cyberpunk Style)
  const philY = 670;
  drawCyberCard(ctx, 40, philY, canvas.width - 80, 160, 20);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.12)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;
  drawCyberCornerBrackets(ctx, 40, philY, canvas.width - 80, 160, 24, '#FF1E27', 2.5);

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
    ctx.fillStyle = '#141316';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgGrad = ctx.createRadialGradient(512, 315, 80, 512, 315, 500);
    bgGrad.addColorStop(0, 'rgba(40, 39, 42, 0.65)');
    bgGrad.addColorStop(1, 'rgba(18, 17, 20, 0.98)');
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
