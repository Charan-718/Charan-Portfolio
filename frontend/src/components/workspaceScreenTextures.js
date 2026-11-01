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
  ctx.arcTo(x, y, x + w, y, r);
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

// Utility: Draw Cyberpunk Banner Frame with Notches, Chamfers & Corner Bracket Tabs (Matching Image 5)
function drawCyberBannerFrame(ctx, x, y, w, h, { glow = true, color = '#FF1E27', lw = 4.5, hasHazard = true } = {}) {
  ctx.save();
  const r = 18;
  const notch = 22;
  const chamfer = 36;

  // 1. Dark Cyber Panel Body
  ctx.fillStyle = '#0a0b12';
  ctx.beginPath();
  ctx.moveTo(x + r + notch, y);
  ctx.lineTo(x + w - r - notch, y);
  // Top-right stepped corner
  ctx.lineTo(x + w - r - notch, y + 8);
  ctx.lineTo(x + w - r, y + 8);
  ctx.arcTo(x + w, y + 8, x + w, y + r + 8, r);
  // Right side down to 45-deg chamfer cut (Image 5)
  ctx.lineTo(x + w, y + h - chamfer);
  ctx.lineTo(x + w - chamfer, y + h);
  // Bottom side to bottom-left stepped corner
  ctx.lineTo(x + r + notch, y + h);
  ctx.lineTo(x + r + notch, y + h - 8);
  ctx.lineTo(x + r, y + h - 8);
  ctx.arcTo(x, y + h - 8, x, y + h - r - 8, r);
  // Left side up to top-left
  ctx.lineTo(x, y + r + 8);
  ctx.arcTo(x, y, x + r + notch, y, r);
  ctx.closePath();
  ctx.fill();

  // 2. Glowing Neon Cyber Border
  ctx.strokeStyle = color;
  ctx.lineWidth = lw;
  if (glow) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 24;
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 3. Image 5 Specific Corner Brackets & Tabs
  // Top-Left outer L-bracket
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 42);
  ctx.lineTo(x - 6, y - 6);
  ctx.lineTo(x + 42, y - 6);
  ctx.stroke();

  // Bottom-Right chamfer outer bracket
  ctx.beginPath();
  ctx.moveTo(x + w + 6, y + h - chamfer - 20);
  ctx.lineTo(x + w + 6, y + h - chamfer + 8);
  ctx.lineTo(x + w - chamfer + 8, y + h + 6);
  ctx.lineTo(x + w - chamfer - 20, y + h + 6);
  ctx.stroke();

  // Top-Right notch tab
  ctx.fillStyle = color;
  ctx.fillRect(x + w - 52, y - 4, 24, 6);
  // Bottom-Left notch tab
  ctx.fillRect(x + 28, y + h - 2, 24, 6);

  // 4. Diagonal Telemetry Hazard Stripes in Bottom-Right Corner (Image 5)
  if (hasHazard) {
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
    ctx.lineWidth = 3.5;
    const hx = x + w - 120;
    const hy = y + h - 42;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(hx + i * 16, hy);
      ctx.lineTo(hx + i * 16 + 18, hy - 28);
      ctx.stroke();
    }
  }

  // 5. Inner subtle secondary trace border
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.3)';
  ctx.lineWidth = 1.5;
  const ip = 12;
  ctx.beginPath();
  ctx.moveTo(x + ip + 18, y + ip);
  ctx.lineTo(x + w - ip - 18, y + ip);
  ctx.lineTo(x + w - ip, y + ip + 18);
  ctx.lineTo(x + w - ip, y + h - chamfer);
  ctx.lineTo(x + w - chamfer, y + h - ip);
  ctx.lineTo(x + ip + 18, y + h - ip);
  ctx.lineTo(x + ip, y + h - ip - 18);
  ctx.lineTo(x + ip, y + ip + 18);
  ctx.closePath();
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
// 1. MAIN FEATURED PROJECTS DISPLAY TEXTURE (2048 x 1088)
// Interactive Carousel: 4 Projects per Page, Navigation Buttons, App Launch
// Page 1: DayFlow, QuantumCodeHub, TwinAero, Sahakārya (at last)
// =========================================================================
export function createProjectsScreenTexture(projects, publicUrl, onUpdate) {
  const canvas = document.createElement('canvas');
  canvas.width = 2048;
  canvas.height = 1088;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Full catalog of verified applications with Sahakārya at last of featured page
  const allProjects = [
    // Page 1: Matching Reference Image (DayFlow, QuantumCodeHub, TwinAero, Sahakārya at last)
    {
      id: 'dayflow',
      title: 'DayFlow',
      tag: 'HRMS',
      subtitle: 'HRMS • Workforce Platform',
      thumbnail: `${publicUrl}/thumbnails/dayflow.jpg`,
      liveUrl: 'https://day-flow-six.vercel.app/',
      repo: 'Charan-718/Day-Flow',
    },
    {
      id: 'quantumcodehub',
      title: 'QuantumCodeHub',
      tag: 'Quantum AI',
      subtitle: 'Quantum Computing • AI',
      thumbnail: `${publicUrl}/thumbnails/quantumcodehub.jpg`,
      liveUrl: 'https://charan-718.github.io/Quantum-Keydistribution/',
      repo: 'Charan-718/QuantumCodeHub',
    },
    {
      id: 'twinaero',
      title: 'TwinAero',
      tag: 'Digital Twin',
      subtitle: 'Digital Twin • Aerospace',
      thumbnail: `${publicUrl}/thumbnails/twinaero.jpg`,
      liveUrl: 'https://charan-718.github.io/Extinct-Era/dino_landing_page.html',
      repo: 'Charan-718/TwinAreo',
    },
    {
      id: 'sahakarya',
      title: 'Sahakārya',
      tag: 'Community',
      subtitle: 'Cooperative Gig Platform',
      thumbnail: `${publicUrl}/thumbnails/sahakarya.jpg`,
      liveUrl: 'https://sahakarya.vercel.app/',
      repo: 'Kouhsik33/Cooperative-Gig-Services-Platform',
    },

    // Page 2: Verified Live Deployed Applications
    {
      id: 'traveloop',
      title: 'Traveloop',
      tag: 'AI Travel',
      subtitle: 'AI Travel Planning Engine',
      thumbnail: `${publicUrl}/thumbnails/traveloop.jpg`,
      liveUrl: 'https://traveloop-plum.vercel.app/',
      repo: 'mounikakorrakuti1/traveloop',
    },
    {
      id: 'freshmart',
      title: 'FreshMart',
      tag: 'E-Commerce',
      subtitle: 'Full-Stack E-Commerce',
      thumbnail: `${publicUrl}/thumbnails/freshmart.png`,
      liveUrl: 'https://freshmart-fsd.netlify.app/',
      repo: 'Charan-718/freshmart-fsd',
    },
    {
      id: 'greenova',
      title: 'Greenova',
      tag: 'Clean-Tech',
      subtitle: 'Sustainability & Clean-Tech',
      thumbnail: `${publicUrl}/thumbnails/greenova.png`,
      liveUrl: 'https://greenova-csp.netlify.app',
      repo: 'Charan-718/greenova-csp',
    },
    {
      id: 'medireport',
      title: 'MediReport',
      tag: 'Clinical AI',
      subtitle: 'Healthcare Diagnostics AI',
      thumbnail: `${publicUrl}/thumbnails/medireport.png`,
      liveUrl: 'https://medi-report.netlify.app',
      repo: 'Charan-718/medi-report',
    },

    // Page 3: Additional Production Applications & Systems
    {
      id: 'furnexa',
      title: 'Furnexa',
      tag: 'Mini-ERP',
      subtitle: 'Logistics & Mini-ERP System',
      thumbnail: `${publicUrl}/thumbnails/furnexa.png`,
      liveUrl: 'https://mini-erp-furnexa.netlify.app',
      repo: 'Charan-718/mini-erp-furnexa',
    },
    {
      id: 'learnloop',
      title: 'LearnLoop',
      tag: 'EdTech',
      subtitle: 'Interactive Learning Platform',
      thumbnail: `${publicUrl}/thumbnails/learnloop.png`,
      liveUrl: 'https://charan-718.github.io/LearnLoop/',
      repo: 'Charan-718/LearnLoop',
    },
    {
      id: 'aqvh',
      title: 'AQVH',
      tag: 'Quantum AI',
      subtitle: 'Quantum Stock Prediction',
      thumbnail: `${publicUrl}/thumbnails/aqvh.jpg`,
      liveUrl: 'https://charan-718.github.io/Schrodinger-Cat/',
      repo: 'Charan-718',
    },
  ];

  let currentPage = 0;
  const cardsPerPage = 4;
  const totalPages = Math.ceil(allProjects.length / cardsPerPage);

  let hoveredCard = -1;
  let isViewAllHovered = false;
  let isPrevHovered = false;
  let isNextHovered = false;
  let isLeftChevHovered = false;
  let isRightChevHovered = false;

  const getCurrentProjects = () => {
    const start = currentPage * cardsPerPage;
    return allProjects.slice(start, start + cardsPerPage);
  };

  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Deep Cyber Deck Ambient Background with Red Glow Vignette
    ctx.fillStyle = '#0a0a0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgRad = ctx.createRadialGradient(1024, 544, 250, 1024, 544, 1150);
    bgRad.addColorStop(0, 'rgba(28, 14, 18, 0.7)');
    bgRad.addColorStop(0.65, 'rgba(12, 10, 14, 0.95)');
    bgRad.addColorStop(1, 'rgba(6, 6, 8, 1)');
    ctx.fillStyle = bgRad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Outer Screen Double Border (Chamfered / Rounded with Red Neon Glow)
    const framePad = 18;
    drawRoundRect(ctx, framePad, framePad, canvas.width - framePad * 2, canvas.height - framePad * 2, 28);
    ctx.fillStyle = 'rgba(10, 10, 14, 0.55)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 28;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner subtle secondary neon trace line
    drawRoundRect(ctx, framePad + 8, framePad + 8, canvas.width - (framePad + 8) * 2, canvas.height - (framePad + 8) * 2, 22);
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Corner targeting brackets
    drawCyberCornerBrackets(ctx, framePad + 14, framePad + 14, canvas.width - (framePad + 14) * 2, canvas.height - (framePad + 14) * 2, 34, '#FFFFFF', 3);

    // 3. Top Header Bar
    // Glowing Red Beacon Dot
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(88, 86, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Header Title: "MY PROJECTS" (Matching Reference Image)
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 38px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '0.04em';
    ctx.fillText('MY PROJECTS', 114, 98);

    // Page Badge Pill: e.g. "01 / 03"
    ctx.fillStyle = 'rgba(255, 30, 39, 0.15)';
    drawRoundRect(ctx, 420, 68, 120, 38, 19);
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.fillStyle = '#FFA3A7';
    ctx.font = '800 16px "Chakra Petch", monospace';
    ctx.fillText(`0${currentPage + 1} / 0${totalPages}`, 444, 92);

    // "VIEW ALL →" Pill Button on Top Right (Matching Reference Image)
    const btnX = canvas.width - 275;
    const btnY = 62;
    const btnW = 200;
    const btnH = 48;
    drawRoundRect(ctx, btnX, btnY, btnW, btnH, 24);
    ctx.fillStyle = isViewAllHovered ? 'rgba(255, 30, 39, 0.32)' : 'rgba(255, 30, 39, 0.12)';
    ctx.fill();
    ctx.strokeStyle = isViewAllHovered ? '#FF3840' : '#FF1E27';
    ctx.lineWidth = isViewAllHovered ? 2.5 : 2;
    if (isViewAllHovered) {
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 16;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = isViewAllHovered ? '#FFFFFF' : '#FF6B72';
    ctx.font = '800 18px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '0.06em';
    ctx.fillText('VIEW ALL  →', btnX + 38, btnY + 31);

    // 4. Render 4 Project Cards for Current Page
    const currentList = getCurrentProjects();
    const cardW = 440;
    const cardH = 780;
    const colGap = 42;
    const startX = 74;
    const startY = 150;

    currentList.forEach((proj, idx) => {
      const x = startX + idx * (cardW + colGap);
      const y = startY;
      const isHov = hoveredCard === idx;

      // Card Background (Sleek Dark Panel with Subtle Red Glow)
      drawRoundRect(ctx, x, y, cardW, cardH, 22);
      ctx.fillStyle = isHov ? 'rgba(24, 22, 32, 0.98)' : 'rgba(15, 14, 20, 0.96)';
      ctx.fill();
      ctx.strokeStyle = isHov ? '#FF1E27' : 'rgba(255, 30, 39, 0.38)';
      ctx.lineWidth = isHov ? 3 : 2;
      if (isHov) {
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 22;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Card Corner Target Brackets
      drawCyberCornerBrackets(ctx, x, y, cardW, cardH, 18, isHov ? '#FF3840' : '#FF1E27', isHov ? 2.5 : 1.8);

      // Card Top Image Thumbnail Box (Matching Reference Image)
      const thumbPad = 16;
      const thumbX = x + thumbPad;
      const thumbY = y + thumbPad;
      const thumbW = cardW - thumbPad * 2;
      const thumbH = 550;

      drawRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 16);
      ctx.fillStyle = '#08080a';
      ctx.fill();

      const img = loadImage(proj.thumbnail, () => {
        redraw();
        if (onUpdate) onUpdate();
      });

      if (img && img.complete && img.naturalWidth > 0) {
        ctx.save();
        drawRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 16);
        ctx.clip();
        ctx.drawImage(img, thumbX, thumbY, thumbW, thumbH);
        ctx.restore();
      } else {
        // Fallback Tech Graphic
        ctx.fillStyle = '#10121a';
        ctx.fillRect(thumbX, thumbY, thumbW, thumbH);
        ctx.fillStyle = '#FF1E27';
        ctx.font = '900 32px "Space Grotesk", sans-serif';
        ctx.fillText(proj.title, thumbX + 32, thumbY + 280);
      }

      // Thumbnail Inner Border
      drawRoundRect(ctx, thumbX, thumbY, thumbW, thumbH, 16);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Project Title (Bold Crisp White)
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 34px "Space Grotesk", sans-serif';
      ctx.letterSpacing = '-0.02em';
      ctx.fillText(proj.title, x + 24, y + 630);

      // Project Category Pill Tag (Matching Reference Image)
      const pillX = x + 24;
      const pillY = y + 665;
      const pillW = 150;
      const pillH = 44;
      drawRoundRect(ctx, pillX, pillY, pillW, pillH, 22);
      ctx.fillStyle = 'rgba(255, 30, 39, 0.12)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 30, 39, 0.55)';
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.fillStyle = '#FF4D55';
      ctx.font = '800 17px "Chakra Petch", sans-serif';
      ctx.letterSpacing = '0.04em';
      ctx.fillText(proj.tag, pillX + 22, pillY + 28);

      // Subtitle Micro-Descriptor
      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 16px "Space Grotesk", sans-serif';
      ctx.fillText(proj.subtitle || 'Production Deployment', x + 24, y + 744);
    });

    // 5. Bottom Carousel Controls Bar (y = 970..1035)
    // A. ‹ PREV Button
    const prevX = 720;
    const prevY = 980;
    const prevW = 150;
    const prevH = 50;
    const canPrev = currentPage > 0;
    drawRoundRect(ctx, prevX, prevY, prevW, prevH, 25);
    ctx.fillStyle = !canPrev
      ? 'rgba(25, 25, 35, 0.5)'
      : isPrevHovered
      ? 'rgba(255, 30, 39, 0.35)'
      : 'rgba(255, 30, 39, 0.12)';
    ctx.fill();
    ctx.strokeStyle = !canPrev ? 'rgba(255, 30, 39, 0.2)' : isPrevHovered ? '#FF3840' : '#FF1E27';
    ctx.lineWidth = 2;
    if (canPrev && isPrevHovered) {
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 14;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = !canPrev ? '#555566' : isPrevHovered ? '#FFFFFF' : '#FF6B72';
    ctx.font = '800 18px "Space Grotesk", sans-serif';
    ctx.fillText('‹  PREV', prevX + 38, prevY + 32);

    // B. Page Indicator Dots in Center
    for (let p = 0; p < totalPages; p++) {
      const dotX = 980 + p * 44;
      const dotY = 1005;
      const isCur = p === currentPage;
      ctx.beginPath();
      ctx.arc(dotX, dotY, isCur ? 8 : 5, 0, Math.PI * 2);
      ctx.fillStyle = isCur ? '#FF1E27' : 'rgba(255, 30, 39, 0.35)';
      if (isCur) {
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 12;
      }
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // C. NEXT › Button
    const nextX = 1178;
    const nextY = 980;
    const nextW = 150;
    const nextH = 50;
    const canNext = currentPage < totalPages - 1;
    drawRoundRect(ctx, nextX, nextY, nextW, nextH, 25);
    ctx.fillStyle = !canNext
      ? 'rgba(25, 25, 35, 0.5)'
      : isNextHovered
      ? 'rgba(255, 30, 39, 0.35)'
      : 'rgba(255, 30, 39, 0.12)';
    ctx.fill();
    ctx.strokeStyle = !canNext ? 'rgba(255, 30, 39, 0.2)' : isNextHovered ? '#FF3840' : '#FF1E27';
    ctx.lineWidth = 2;
    if (canNext && isNextHovered) {
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 14;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = !canNext ? '#555566' : isNextHovered ? '#FFFFFF' : '#FF6B72';
    ctx.font = '800 18px "Space Grotesk", sans-serif';
    ctx.fillText('NEXT  ›', nextX + 42, nextY + 32);

    // D. Left & Right Floating Edge Chevrons
    // Left edge chevron (x = 36, y = 540)
    ctx.beginPath();
    ctx.arc(42, 540, 24, 0, Math.PI * 2);
    ctx.fillStyle = canPrev && isLeftChevHovered ? 'rgba(255, 30, 39, 0.4)' : 'rgba(18, 16, 24, 0.85)';
    ctx.fill();
    ctx.strokeStyle = canPrev ? '#FF1E27' : 'rgba(255, 30, 39, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = canPrev ? '#FFFFFF' : '#666';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('‹', 34, 548);

    // Right edge chevron (x = 2006, y = 540)
    ctx.beginPath();
    ctx.arc(2006, 540, 24, 0, Math.PI * 2);
    ctx.fillStyle = canNext && isRightChevHovered ? 'rgba(255, 30, 39, 0.4)' : 'rgba(18, 16, 24, 0.85)';
    ctx.fill();
    ctx.strokeStyle = canNext ? '#FF1E27' : 'rgba(255, 30, 39, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = canNext ? '#FFFFFF' : '#666';
    ctx.font = '900 24px sans-serif';
    ctx.fillText('›', 1999, 548);

    texture.needsUpdate = true;
  };

  const setPage = (p) => {
    if (p >= 0 && p < totalPages && p !== currentPage) {
      currentPage = p;
      hoveredCard = -1;
      redraw();
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages - 1) {
      currentPage++;
      hoveredCard = -1;
      redraw();
      return true;
    }
    return false;
  };

  const prevPage = () => {
    if (currentPage > 0) {
      currentPage--;
      hoveredCard = -1;
      redraw();
      return true;
    }
    return false;
  };

  const setHoveredState = (cardIdx, viewAllHover, prevHover, nextHover, leftChev, rightChev) => {
    let changed = false;
    if (hoveredCard !== cardIdx) { hoveredCard = cardIdx; changed = true; }
    if (isViewAllHovered !== viewAllHover) { isViewAllHovered = viewAllHover; changed = true; }
    if (isPrevHovered !== prevHover) { isPrevHovered = prevHover; changed = true; }
    if (isNextHovered !== nextHover) { isNextHovered = nextHover; changed = true; }
    if (isLeftChevHovered !== leftChev) { isLeftChevHovered = leftChev; changed = true; }
    if (isRightChevHovered !== rightChev) { isRightChevHovered = rightChev; changed = true; }
    if (changed) redraw();
  };

  redraw();

  return {
    texture,
    canvas,
    redraw,
    allProjects,
    getCurrentProjects,
    setPage,
    nextPage,
    prevPage,
    getCurrentPage: () => currentPage,
    getTotalPages: () => totalPages,
    setHoveredState,
  };
}

// =========================================================================
// 2. LEFT TOP SCREEN: "WORKSPACE ARCHITECTURE & PROFILE" (1024 x 620)
// Rich matter from previous iteration with new Futuristic C Emblem logo!
// =========================================================================
export function createWelcomeTopScreenTexture(publicUrl = '', onUpdate = null) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const redraw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Dark Base Background
    ctx.fillStyle = '#0a0c13';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgGrad = ctx.createRadialGradient(512, 310, 80, 512, 310, 600);
    bgGrad.addColorStop(0, 'rgba(32, 16, 22, 0.7)');
    bgGrad.addColorStop(1, 'rgba(10, 12, 18, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Cyberpunk Outer Banner Frame (Matching Image 5)
    drawCyberBannerFrame(ctx, 16, 16, canvas.width - 32, canvas.height - 32, {
      glow: true,
      color: '#FF1E27',
      lw: 5,
      hasHazard: true,
    });

    // 3. Header Bar Zone
    // Red Live Beacon Dot
    ctx.fillStyle = '#FF1E27';
    ctx.beginPath();
    ctx.arc(58, 62, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FF6B72';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(58, 62, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px "Space Grotesk", sans-serif';
    ctx.fillText('WORKSPACE ARCHITECTURE', 80, 72);

    ctx.fillStyle = '#FF6B72';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText('CYBER_DECK // ONLINE [PORTFOLIO_V2.6]', 620, 70);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(40, 96);
    ctx.lineTo(canvas.width - 40, 96);
    ctx.stroke();

    // 4. Profile Card (Chamfered Cyber Deck)
    const profY = 114;
    const profH = 188;
    drawCyberCard(ctx, 40, profY, canvas.width - 80, profH, 16);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.94)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.35)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, 40, profY, canvas.width - 80, profH, 16, '#FF1E27', 2);

    // --- SHINING CYBER EMBLEM (Replaces dark/shadowed box with radiant specular light) ---
    const emblemCenterY = profY + profH / 2;
    const emblemCenterX = 135;
    const emblemRadius = 66;

    // 1. Radiant Background Sunburst / Bloom Flare
    const bloomGrad = ctx.createRadialGradient(
      emblemCenterX, emblemCenterY, 6,
      emblemCenterX, emblemCenterY, emblemRadius * 1.55
    );
    bloomGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // brilliant white core
    bloomGrad.addColorStop(0.2, 'rgba(255, 75, 85, 0.85)'); // vibrant red radiance
    bloomGrad.addColorStop(0.55, 'rgba(255, 30, 39, 0.35)'); // outer halo
    bloomGrad.addColorStop(1, 'rgba(255, 30, 39, 0)');
    ctx.fillStyle = bloomGrad;
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, emblemRadius * 1.55, 0, Math.PI * 2);
    ctx.fill();

    // 2. Concentric Polished Glowing Halo Rings
    ctx.save();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 22;
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, emblemRadius * 0.92, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 80, 90, 0.9)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, emblemRadius * 1.08, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // 3. 8 Satellite Laser Compass Ticks
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1.6;
    for (let a = 0; a < 8; a++) {
      const ang = (a * Math.PI) / 4;
      const r1 = emblemRadius * 1.02;
      const r2 = emblemRadius * 1.15;
      ctx.beginPath();
      ctx.moveTo(emblemCenterX + Math.cos(ang) * r1, emblemCenterY + Math.sin(ang) * r1);
      ctx.lineTo(emblemCenterX + Math.cos(ang) * r2, emblemCenterY + Math.sin(ang) * r2);
      ctx.stroke();
    }
    ctx.restore();

    // 4. Draw Emblem Image with High-Intensity Chrome Glow
    const emblemImg = loadImage(`${publicUrl}/Futuristic_Silver_and_Red_C_Emblem.png`, () => {
      redraw();
      onUpdate && onUpdate();
    });

    const imgSize = 106;
    const imgX = emblemCenterX - imgSize / 2;
    const imgY = emblemCenterY - imgSize / 2;

    if (emblemImg && emblemImg.complete && emblemImg.naturalWidth > 0) {
      ctx.save();
      ctx.shadowColor = '#FF2E36';
      ctx.shadowBlur = 28;
      ctx.drawImage(emblemImg, imgX, imgY, imgSize, imgSize);
      ctx.restore();
    } else {
      // Fallback stylized shining 'C' Cyber Mark
      ctx.save();
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = '#FF1E27';
      ctx.shadowBlur = 24;
      ctx.font = '900 64px "Space Grotesk", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('C', emblemCenterX, emblemCenterY + 22);
      ctx.restore();
    }

    // 5. Specular Glare / Lens Flare Sheen Across Emblem
    ctx.save();
    ctx.beginPath();
    ctx.arc(emblemCenterX, emblemCenterY, emblemRadius * 0.9, 0, Math.PI * 2);
    ctx.clip();

    ctx.translate(emblemCenterX, emblemCenterY);
    ctx.rotate(-Math.PI / 4);
    const sheenGrad = ctx.createLinearGradient(-emblemRadius, 0, emblemRadius, 0);
    sheenGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
    sheenGrad.addColorStop(0.48, 'rgba(255, 255, 255, 0.7)');
    sheenGrad.addColorStop(0.52, 'rgba(255, 255, 255, 0.95)');
    sheenGrad.addColorStop(0.56, 'rgba(255, 255, 255, 0.7)');
    sheenGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sheenGrad;
    ctx.fillRect(-emblemRadius * 1.2, -8, emblemRadius * 2.4, 16);
    ctx.restore();

    // --- RIGHT CONTENT BESIDE THE SHINING LOGO (NO Name, NO AIML) ---
    const textStartX = 236;

    // A. Futuristic Emblem Identifier Badge & Live Status
    drawCyberCard(ctx, textStartX, profY + 24, 340, 36, 8);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.16)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 13px "JetBrains Mono", monospace';
    ctx.fillText('✦ EMBLEM_V2.6  //  PRIME IDENTIFIER', textStartX + 14, profY + 47);

    // Green Live System Status Tag
    ctx.fillStyle = '#22c55e';
    ctx.font = '800 12px "JetBrains Mono", monospace';
    ctx.fillText('● ACTIVE', textStartX + 270, profY + 47);

    // B. GitHub Account Direct Handle Pill in Profile Card
    drawCyberCard(ctx, 620, profY + 24, 310, 36, 8);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 14px "JetBrains Mono", monospace';
    ctx.fillText('⌨ github.com/Charan-718 ↗', 636, profY + 48);

    // C. Prime Architectural Tenets
    ctx.fillStyle = '#FF6B72';
    ctx.font = '800 15px "JetBrains Mono", monospace';
    ctx.fillText('CORE PLATFORMS  •  DISTRIBUTED SYSTEMS  •  INTERACTIVE 3D', textStartX, profY + 92);

    // D. Profile Summary Text
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 16px "Space Grotesk", sans-serif';
    ctx.fillText('Architecting production-grade full-stack platforms, distributed databases,', textStartX, profY + 124);
    ctx.fillText('and enterprise AI systems with seamless real-time WebGL graphics.', textStartX, profY + 152);

    // 5. Two Telemetry Stat Cards
    const statY = 322;
    const statH = 248;
    const statW = 450;

    // Stat Card 1: 32 Public Repositories (Left)
    drawCyberCard(ctx, 40, statY, statW, statH, 16);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 30, 39, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, 40, statY, statW, statH, 16, '#FF1E27', 2);

    // Badge icon box
    drawCyberCard(ctx, 64, statY + 22, 58, 58, 10);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.2)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('⌨', 78, statY + 62);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.fillText('32', 140, statY + 68);

    ctx.fillStyle = '#FF6B72';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText('@Charan-718', 228, statY + 64);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillText('Public Repositories • Open Source Ecosystem', 64, statY + 118);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('800+ LeetCode DSA • 3x National Hackathon Champion', 64, statY + 144);

    // Action Button: Open GitHub Profile
    const ghBtnY = statY + 168;
    drawCyberCard(ctx, 64, ghBtnY, statW - 48, 56, 12);
    const ghGrad = ctx.createLinearGradient(64, ghBtnY, statW + 16, ghBtnY + 56);
    ghGrad.addColorStop(0, '#FF2E36');
    ghGrad.addColorStop(1, '#C80810');
    ctx.fillStyle = ghGrad;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 16;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 18px "Space Grotesk", sans-serif';
    ctx.fillText('OPEN GITHUB PROFILE ↗', 144, ghBtnY + 36);

    // Stat Card 2: 18+ Deployments (Right)
    const stat2X = 534;
    drawCyberCard(ctx, stat2X, statY, statW, statH, 16);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
    drawCyberCornerBrackets(ctx, stat2X, statY, statW, statH, 16, '#22c55e', 2);

    drawCyberCard(ctx, stat2X + 24, statY + 22, 58, 58, 10);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
    ctx.fill();
    ctx.fillStyle = '#22c55e';
    ctx.font = '900 28px sans-serif';
    ctx.fillText('🌐', stat2X + 36, statY + 62);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 52px "Space Grotesk", sans-serif';
    ctx.fillText('18+', stat2X + 104, statY + 68);

    ctx.fillStyle = '#4ade80';
    ctx.font = '700 15px "JetBrains Mono", monospace';
    ctx.fillText('VERIFIED HOSTS', stat2X + 218, statY + 64);

    ctx.fillStyle = '#4ade80';
    ctx.font = '700 16px "Space Grotesk", sans-serif';
    ctx.fillText('Live Production Deployments Active', stat2X + 24, statY + 118);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 13px "JetBrains Mono", monospace';
    ctx.fillText('Vercel • Netlify • Render • AWS Microservices', stat2X + 24, statY + 144);

    // Action Button: Explore Hosted Repos
    drawCyberCard(ctx, stat2X + 24, ghBtnY, statW - 48, 56, 12);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.22)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.7)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 18px "Space Grotesk", sans-serif';
    ctx.fillText('EXPLORE HOSTED REPOS ↗', stat2X + 96, ghBtnY + 36);

    texture.needsUpdate = true;
  };

  redraw();
  return { texture, canvas, redraw };
}

// =========================================================================
// 3. LEFT BOTTOM SCREEN: "CORE RUNTIME & INFRASTRUCTURE MATRIX" (1024 x 420)
// Rich matter filling the lower left panel with engineering infrastructure
// =========================================================================
export function createWelcomeBottomScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 420;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Background
  ctx.fillStyle = '#0a0c13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 210, 60, 512, 210, 480);
  bgGrad.addColorStop(0, 'rgba(28, 14, 18, 0.65)');
  bgGrad.addColorStop(1, 'rgba(10, 12, 18, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Cyberpunk Banner Frame
  drawCyberBannerFrame(ctx, 14, 14, canvas.width - 28, canvas.height - 28, {
    glow: true,
    color: '#FF1E27',
    lw: 4.5,
    hasHazard: false,
  });

  // Header Beacon
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(54, 52, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 24px "Space Grotesk", sans-serif';
  ctx.fillText('CORE RUNTIME & INFRASTRUCTURE MATRIX', 72, 60);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 14px "JetBrains Mono", monospace';
  ctx.fillText('SYS_SPECS // 100% OPERATIONAL', 700, 59);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(36, 82);
  ctx.lineTo(canvas.width - 36, 82);
  ctx.stroke();

  // 2 Columns of System Infrastructure Specs
  const specsCol1 = [
    { label: 'Cloud Hosting:', val: 'Vercel / Netlify / AWS' },
    { label: 'Databases:', val: 'PostgreSQL, MongoDB, Supabase' },
    { label: 'AI & Deep Learning:', val: 'FAISS Vector Search, LangChain, PyTorch' },
    { label: 'Architecture:', val: 'Modular Microservices & WebGL 3D Engine' },
  ];

  const specsCol2 = [
    { label: 'GitHub Ecosystem:', val: 'github.com/Charan-718 (32 Repositories)' },
    { label: 'Security & Auth:', val: 'HTTPS SSL, OAuth 2.0, JWT Session Tokens' },
    { label: 'CI/CD Pipeline:', val: 'GitHub Actions Automated Production Builds' },
    { label: 'System Health:', val: '● ALL SYSTEMS ONLINE (100% UPTIME)', isStatus: true },
  ];

  // Column 1
  specsCol1.forEach((s, i) => {
    const rowY = 126 + i * 58;
    drawCyberCard(ctx, 42, rowY - 26, 456, 48, 8);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.fillText(s.label, 56, rowY + 4);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 14px "JetBrains Mono", monospace';
    ctx.fillText(s.val, 56, rowY + 22);
  });

  // Column 2
  specsCol2.forEach((s, i) => {
    const rowY = 126 + i * 58;
    drawCyberCard(ctx, 526, rowY - 26, 456, 48, 8);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.85)';
    ctx.fill();
    ctx.strokeStyle = s.isStatus ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = s.isStatus ? 1.6 : 1.2;
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '700 15px "Space Grotesk", sans-serif';
    ctx.fillText(s.label, 540, rowY + 4);

    ctx.fillStyle = s.isStatus ? '#22c55e' : (s.label.includes('GitHub') ? '#FF6B72' : '#FFFFFF');
    ctx.font = '800 14px "JetBrains Mono", monospace';
    ctx.fillText(s.val, 540, rowY + 22);
  });

  // Bottom Telemetry Spec Bar
  const btmY = 368;
  drawCyberCard(ctx, 42, btmY, canvas.width - 84, 30, 6);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.1)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 30, 39, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('LATENCY: < 22ms  •  PACKET BUFFER: 100% OK  •  GRAPHICS: THREE.JS WEBGL GLTF  •  HARDWARE ACCELERATED', canvas.width / 2, btmY + 20);
  ctx.textAlign = 'left';

  texture.needsUpdate = true;
  return { texture, canvas };
}

// Backward compatibility helper
export function createWelcomeScreenTexture() {
  return createWelcomeTopScreenTexture();
}

// =========================================================================
// 4. RIGHT TOP SCREEN: "TECH STACK & CORE MATRIX" (1024 x 880)
// Complete 12-Technology Matrix from earlier iteration matching Image 5 shape
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
  bgGrad.addColorStop(0, 'rgba(28, 14, 18, 0.7)');
  bgGrad.addColorStop(1, 'rgba(10, 12, 18, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Cyberpunk Outer Banner Frame
  drawCyberBannerFrame(ctx, 16, 16, canvas.width - 32, canvas.height - 32, {
    glow: true,
    color: '#FF1E27',
    lw: 5,
    hasHazard: true,
  });

  // Top Header: "● TECH STACK & CORE MATRIX"
  ctx.fillStyle = '#FF1E27';
  ctx.beginPath();
  ctx.arc(62, 66, 9, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 32px "Space Grotesk", sans-serif';
  ctx.fillText('TECH STACK & CORE MATRIX', 84, 76);

  ctx.fillStyle = '#FF6B72';
  ctx.font = '700 15px "JetBrains Mono", monospace';
  ctx.fillText('12_ENTERPRISE_FRAMEWORKS', 680, 74);

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(40, 100);
  ctx.lineTo(canvas.width - 40, 100);
  ctx.stroke();

  // 12 Technologies in a 4-Column x 3-Row Grid
  const techs = [
    { name: 'React', color: '#00D8FF', symbol: '⚛', cat: 'FRONTEND' },
    { name: 'TypeScript', color: '#3178C6', symbol: 'TS', cat: 'LANGUAGE' },
    { name: 'Node.js', color: '#68A063', symbol: '⬢', cat: 'BACKEND' },
    { name: 'Python', color: '#FFD43B', symbol: '🐍', cat: 'AI / ML' },
    { name: 'PostgreSQL', color: '#336791', symbol: '🐘', cat: 'DATABASE' },
    { name: 'Docker', color: '#2496ED', symbol: '🐳', cat: 'DEVOPS' },
    { name: 'FastAPI', color: '#009688', symbol: '⚡', cat: 'API ENGINE' },
    { name: 'Qiskit', color: '#8A2BE2', symbol: '⚛', cat: 'QUANTUM' },
    { name: 'Prisma', color: '#8B5CF6', symbol: '💎', cat: 'ORM LAYER' },
    { name: 'TailwindCSS', color: '#38BDF8', symbol: '💨', cat: 'UI DESIGN' },
    { name: 'Three.js', color: '#FF1E27', symbol: '🧊', cat: '3D GRAPHICS' },
    { name: 'Express', color: '#FFFFFF', symbol: 'EX', cat: 'REST SERVER' },
  ];

  const cols = 4;
  const startX = 46;
  const startY = 124;
  const cardW = 218;
  const cardH = 208;
  const gapX = 20;
  const gapY = 20;

  techs.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    drawCyberCard(ctx, x, y, cardW, cardH, 14);
    ctx.fillStyle = 'rgba(18, 22, 34, 0.92)';
    ctx.fill();
    ctx.strokeStyle = `${t.color}55`;
    ctx.lineWidth = 1.8;
    ctx.stroke();

    drawCyberCornerBrackets(ctx, x, y, cardW, cardH, 12, t.color, 1.5);

    // Tech Icon Box
    const iconW = 56;
    const iconH = 56;
    const iconX = x + (cardW - iconW) / 2;
    const iconY = y + 20;
    drawCyberCard(ctx, iconX, iconY, iconW, iconH, 10);
    ctx.fillStyle = `${t.color}18`;
    ctx.fill();
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1.8;
    ctx.shadowColor = t.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Symbol Inside Box
    ctx.fillStyle = t.color;
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.symbol, iconX + iconW / 2, iconY + 39);

    // Technology Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 21px "Space Grotesk", sans-serif';
    ctx.fillText(t.name, x + cardW / 2, y + 120);

    // Category Tag
    ctx.fillStyle = '#FF6B72';
    ctx.font = '700 11px "JetBrains Mono", monospace';
    ctx.fillText(`[${t.cat}]`, x + cardW / 2, y + 144);

    // Production Pill Badge
    const pillW = 120;
    const pillH = 24;
    const pillX = x + (cardW - pillW) / 2;
    const pillY = y + 162;
    drawCyberCard(ctx, pillX, pillY, pillW, pillH, 6);
    ctx.fillStyle = 'rgba(34, 197, 94, 0.16)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#4ade80';
    ctx.font = '800 11px "JetBrains Mono", monospace';
    ctx.fillText('● PRODUCTION', pillX + pillW / 2, pillY + 16);
    ctx.textAlign = 'left';
  });

  // Bottom Footer Strip
  const btmY = 818;
  drawCyberCard(ctx, 46, btmY, canvas.width - 92, 38, 8);
  ctx.fillStyle = 'rgba(255, 30, 39, 0.12)';
  ctx.fill();
  ctx.strokeStyle = '#FF1E27';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '800 14px "Space Grotesk", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✦ HIGH-THROUGHPUT FULL-STACK & AI MATRIX • 100% PRODUCTION VERIFIED ↗', canvas.width / 2, btmY + 24);
  ctx.textAlign = 'left';

  texture.needsUpdate = true;
  return { texture, canvas };
}

// =========================================================================
// 5. RIGHT BOTTOM SCREEN: "BUILD • INNOVATE • INSPIRE" (1024 x 260)
// Complete engineering manifesto and architecture philosophy
// =========================================================================
export function createPhilosophyScreenTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 260;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  // Background
  ctx.fillStyle = '#0a0c13';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const bgGrad = ctx.createRadialGradient(512, 130, 60, 512, 130, 480);
  bgGrad.addColorStop(0, 'rgba(32, 14, 18, 0.7)');
  bgGrad.addColorStop(1, 'rgba(10, 12, 18, 0.98)');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer Cyberpunk Banner Frame
  drawCyberBannerFrame(ctx, 12, 12, canvas.width - 24, canvas.height - 24, {
    glow: true,
    color: '#FF1E27',
    lw: 4,
    hasHazard: false,
  });

  // Centered Monumental Philosophy Quote
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 36px "Space Grotesk", sans-serif';
  ctx.letterSpacing = '0.04em';
  ctx.shadowColor = '#FF1E27';
  ctx.shadowBlur = 18;
  ctx.textAlign = 'center';
  ctx.fillText('“ BUILD  •  INNOVATE  •  INSPIRE ”', canvas.width / 2, 80);
  ctx.shadowBlur = 0;

  // Subtitle
  ctx.fillStyle = '#FF6B72';
  ctx.font = '800 18px "Space Grotesk", sans-serif';
  ctx.fillText('Continuous Learning  •  Clean Scalable Code  •  Modern Cyber Aesthetics', canvas.width / 2, 126);

  // 4 Architectural Tenet Badges
  const tenets = [
    '[ZERO_LATENCY]',
    '[DISTRIBUTED_SCALE]',
    '[AI_FIRST_SYSTEMS]',
    '[CLEAN_ENGINEERING]',
  ];

  const pillW = 190;
  const pillH = 34;
  const gap = 16;
  const totalW = tenets.length * pillW + (tenets.length - 1) * gap;
  const startX = (canvas.width - totalW) / 2;
  const pillY = 166;

  tenets.forEach((t, i) => {
    const x = startX + i * (pillW + gap);
    drawCyberCard(ctx, x, pillY, pillW, pillH, 8);
    ctx.fillStyle = 'rgba(255, 30, 39, 0.14)';
    ctx.fill();
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13px "JetBrains Mono", monospace';
    ctx.fillText(t, x + pillW / 2, pillY + 22);
  });
  ctx.textAlign = 'left';

  texture.needsUpdate = true;
  return { texture, canvas };
}

// =========================================================================
// 6. QUICK ACCESS CONSOLE TEXTURE (1024 x 720)
// Matches Exact Card in Foreground Near the Human Model
// =========================================================================
export function createQuickAccessScreenTexture(hoverIndex = -1) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = true;

  const redraw = (hovered = hoverIndex) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = '#0a0a0e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bgGrad = ctx.createRadialGradient(512, 360, 80, 512, 360, 560);
    bgGrad.addColorStop(0, 'rgba(32, 16, 20, 0.7)');
    bgGrad.addColorStop(1, 'rgba(8, 8, 12, 0.98)');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Red Outer Glowing Bezel
    const pad = 16;
    drawRoundRect(ctx, pad, pad, canvas.width - pad * 2, canvas.height - pad * 2, 24);
    ctx.strokeStyle = '#FF1E27';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 26;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header Beacon Dot + "QUICK ACCESS"
    ctx.fillStyle = '#FF1E27';
    ctx.shadowColor = '#FF1E27';
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(68, 76, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 36px "Space Grotesk", sans-serif';
    ctx.letterSpacing = '0.04em';
    ctx.fillText('QUICK ACCESS', 94, 88);

    // Top Right Cyber Diagonal Accent
    ctx.fillStyle = '#FF1E27';
    ctx.font = '900 24px monospace';
    ctx.fillText('⤢', canvas.width - 82, 86);

    // 3 Action Rows (Matching Reference Image)
    const rows = [
      { id: 0, title: 'View Projects', icon: '⌘' },
      { id: 1, title: 'GitHub Profile', icon: '⌨' },
      { id: 2, title: 'Contact Me', icon: '✉' },
    ];

    const rowX = 48;
    const rowW = canvas.width - 96;
    const rowH = 150;
    const gapY = 24;
    const startY = 140;

    rows.forEach((r, i) => {
      const y = startY + i * (rowH + gapY);
      const isHov = hovered === i;

      // Row Container Box
      drawRoundRect(ctx, rowX, y, rowW, rowH, 18);
      ctx.fillStyle = isHov ? 'rgba(255, 30, 39, 0.24)' : 'rgba(18, 20, 28, 0.92)';
      ctx.fill();
      ctx.strokeStyle = isHov ? '#FF3840' : 'rgba(255, 30, 39, 0.45)';
      ctx.lineWidth = isHov ? 3 : 2;
      if (isHov) {
        ctx.shadowColor = '#FF1E27';
        ctx.shadowBlur = 20;
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Left Red Rounded Badge with Icon
      const iconX = rowX + 24;
      const iconY = y + 25;
      const iconSize = 100;
      drawRoundRect(ctx, iconX, iconY, iconSize, iconSize, 16);
      ctx.fillStyle = isHov ? '#FF1E27' : 'rgba(255, 30, 39, 0.16)';
      ctx.fill();
      ctx.strokeStyle = '#FF1E27';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(r.icon, iconX + iconSize / 2, iconY + 66);
      ctx.textAlign = 'left';

      // Row Action Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '900 36px "Space Grotesk", sans-serif';
      ctx.fillText(r.title, iconX + iconSize + 32, y + 86);

      // Right Trailing Arrow (Red)
      ctx.fillStyle = isHov ? '#FFFFFF' : '#FF1E27';
      ctx.font = '900 42px "Space Grotesk", sans-serif';
      ctx.fillText('>', rowX + rowW - 60, y + 90);
    });

    texture.needsUpdate = true;
  };

  redraw();
  return { texture, canvas, redraw };
}
