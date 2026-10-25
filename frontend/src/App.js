import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import CharacterPlayground from './components/CharacterPlayground';
import SpideyWebHero from './components/SpideyWebHero';
import HeroCircuitBackground from './components/HeroCircuitBackground';
import {
  initGlobalButtonSounds,
  playClickSound,
} from './utils/soundEffects';

const ROLES = [
  'Full-Stack Systems Engineer',
  'AI & Deep Learning Developer',
  'B.Tech in Artificial Intelligence',
  'React, TypeScript & Node.js Architect'
];

function InitialBlankCurtain({ onComplete, maskId = 'heroCutoutMask' }) {
  const [isSweeping, setIsSweeping] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    try {
      sessionStorage.setItem('charan_intro_shown', 'true');
    } catch (e) {}

    // Hold completely fixed for 2.0 seconds
    const holdTimer = setTimeout(() => {
      setIsSweeping(true);
    }, 2000);

    // After 1.2s constant-speed zoom, unmount overlay cleanly
    const finishTimer = setTimeout(() => {
      if (onCompleteRef.current) onCompleteRef.current();
      try {
        window.dispatchEvent(new CustomEvent('charan-curtain-complete'));
      } catch (e) {}
    }, 3200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  return (
    <div
      className={`initial-blank-curtain ${isSweeping ? 'sweep-active' : ''}`}
      aria-hidden="true"
    >
      <div className="initial-curtain-gpu-stage">
        <svg
          className="initial-cutout-svg"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <mask id={maskId}>
              {/* White reveals the solid black curtain */}
              <rect x="0" y="0" width="1920" height="1080" fill="#FFFFFF" />
              {/* Black cuts out transparent text so the hero section underneath is visible */}
              <text
                x="960"
                y="480"
                textAnchor="middle"
                className="cutout-text-line-1"
                fill="#000000"
                fontSize="155"
                fontWeight="900"
              >
                CHARAN
              </text>
              <text
                x="960"
                y="630"
                textAnchor="middle"
                className="cutout-text-line-2"
                fill="#000000"
                fontSize="155"
                fontWeight="900"
              >
                PORTFOLIO
              </text>
            </mask>
          </defs>

          {/* Black curtain with masked transparent text cutout */}
          <rect
            x="0"
            y="0"
            width="1920"
            height="1080"
            fill="#000000"
            mask={`url(#${maskId})`}
          />

          {/* Crisp outline strokes around the transparent text cutout */}
          <text
            x="960"
            y="480"
            textAnchor="middle"
            className="cutout-stroke-line-1"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fontSize="155"
            fontWeight="900"
          >
            CHARAN
          </text>
          <text
            x="960"
            y="630"
            textAnchor="middle"
            className="cutout-stroke-line-2"
            fill="none"
            stroke="#FF1E27"
            strokeWidth="2.5"
            fontSize="155"
            fontWeight="900"
          >
            PORTFOLIO
          </text>
        </svg>
      </div>
    </div>
  );
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeFilter, setActiveFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Initial 2-second black screen hold & cinematic transparent cutout zoom (only on initial load, never on reloads)
  const [showInitialIntro, setShowInitialIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    try {
      if (sessionStorage.getItem('charan_intro_shown')) {
        return false; // Skip completely on all reloads!
      }
    } catch (e) {}
    return true;
  });

  const [isCharacterArenaOpen, setIsCharacterArenaOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const searchParams = new URLSearchParams(window.location.search);
    const arenaParam = searchParams.get('arena');
    const hasArenaQuery = arenaParam === 'true' || arenaParam === '3d' || arenaParam === 'character';
    const hasArenaHash = window.location.hash === '#arena' || window.location.hash === '#3d-character';
    const storedView = localStorage.getItem('charan_portfolio_active_view');
    return Boolean(hasArenaQuery || hasArenaHash || storedView === 'arena');
  });

  const openCharacterArena = () => {
    setIsCharacterArenaOpen(true);
    try {
      localStorage.setItem('charan_portfolio_active_view', 'arena');
      const url = new URL(window.location.href);
      url.searchParams.set('arena', '3d');
      window.history.pushState({ arena: true }, '', url.toString());
    } catch (e) {}
  };

  const closeCharacterArena = () => {
    setIsCharacterArenaOpen(false);
    try {
      localStorage.removeItem('charan_portfolio_active_view');
      const url = new URL(window.location.href);
      url.searchParams.delete('arena');
      if (url.hash === '#arena' || url.hash === '#3d-character') {
        url.hash = '';
      }
      window.history.pushState({ arena: false }, '', url.toString());
    } catch (e) {}
  };

  // Keep URL in sync on browser back/forward and initial load
  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const arenaParam = searchParams.get('arena');
      const shouldOpen = Boolean(
        arenaParam === 'true' || arenaParam === '3d' || arenaParam === 'character' || window.location.hash === '#arena'
      );
      setIsCharacterArenaOpen(shouldOpen);
      if (shouldOpen) {
        localStorage.setItem('charan_portfolio_active_view', 'arena');
      } else {
        localStorage.removeItem('charan_portfolio_active_view');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (isCharacterArenaOpen) {
      try {
        localStorage.setItem('charan_portfolio_active_view', 'arena');
        const url = new URL(window.location.href);
        if (!url.searchParams.has('arena')) {
          url.searchParams.set('arena', '3d');
          window.history.replaceState({ arena: true }, '', url.toString());
        }
      } catch (e) {}
    }
  }, [isCharacterArenaOpen]);

  // Initialize global button click sounds (< 1s tactile feedback)
  useEffect(() => {
    const cleanupSounds = initGlobalButtonSounds();
    return () => {
      cleanupSounds();
    };
  }, []);
  // Image handling for charan_id_profile.png with fallbacks
  const [imageIndex, setImageIndex] = useState(0);
  const profileImages = [
    `${process.env.PUBLIC_URL}/charan_professional_profile.png`,
    `${process.env.PUBLIC_URL}/charan_professional_profile.png`,
    `${process.env.PUBLIC_URL}/charan_profile.jpg`,
    `${process.env.PUBLIC_URL}/charan_profile.png`
  ];

  // Dynamic Typed Text
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Real Physical Pendulum & Aerodynamic Dynamics for Hanging ID Badge
  const idCardRef = useRef(null);
  const cardPhysics = useRef({
    theta: -3.5,        // Current swing angle (degrees)
    omega_z: 0.0,       // Angular velocity (deg/s)
    targetTheta: -3.5,  // Natural resting tilt (degrees)
    phi_y: 0.0,         // Swivel rotation (degrees)
    omega_y: 0.0,       // Swivel velocity (deg/s)
    phi_x: 0.0,         // Pitch/lift rotation (degrees)
    omega_x: 0.0,       // Pitch velocity (deg/s)
    windEnvelope: 0.0,  // Continuous wind intensity envelope [0..1]
    isHovered: false,
    isDragging: false,
    dragStartX: 0,
    dragStartTheta: 0,
    lastMouseX: null,
    lastMouseTime: null,
    windTime: 0,
    lastTime: null,
    rafId: null,
  });

  const updateCardPhysics = useCallback((now) => {
    const p = cardPhysics.current;
    if (!p.lastTime) p.lastTime = now;
    const dt = Math.min((now - p.lastTime) / 1000, 0.06);
    p.lastTime = now;

    // Sub-stepping for rock-solid stability and zero numerical drift across all frame rates (60Hz / 120Hz / 144Hz)
    const subSteps = 3;
    const subDt = dt / subSteps;

    // Physical pendulum constants
    const w0_z = 8.2;                // Natural angular frequency ~8.2 rad/s (period ~ 0.77s)
    const k_z = w0_z * w0_z;         // ~67.24 (restoring torque stiffness)
    const zeta_z = 0.50;             // Smooth, organic underdamped settling ratio
    const c_z = 2.0 * zeta_z * w0_z; // ~8.20 (linear air damping)
    const c_z_quad = 0.012;          // Quadratic aerodynamic drag robing high velocity energy

    // Y-axis swivel torsional spring
    const w0_y = 10.5;
    const k_y = w0_y * w0_y;
    const c_y = 8.5;

    // X-axis pitch/lift spring
    const w0_x = 12.0;
    const k_x = w0_x * w0_x;
    const c_x = 10.5;

    for (let s = 0; s < subSteps; s++) {
      // Continuous wind envelope: ramps up smoothly on hover and decays gracefully on unhover
      const targetW = (p.isHovered && !p.isDragging) ? 1.0 : 0.0;
      const tau = (targetW > p.windEnvelope) ? 0.28 : 0.42;
      p.windEnvelope += (targetW - p.windEnvelope) * (subDt / tau);

      // Accumulate aerodynamic wind clock
      if (p.windEnvelope > 0.001) {
        p.windTime += subDt;
      }
      const wt = p.windTime;

      // Realistic aero wind forces:
      // - Steady breeze deflection (+14 deg/s^2 equivalent bias)
      // - Primary aerodynamic vortex shedding oscillation (w = 3.9 rad/s, f = 0.62 Hz)
      // - Secondary harmonic turbulence
      const windForceZ = p.windEnvelope * 3.6 * (
        15.0 + 
        42.0 * Math.sin(3.9 * wt) + 
        16.0 * Math.sin(6.4 * wt + 1.2) + 
        10.0 * Math.cos(2.2 * wt)
      );

      const windForceY = p.windEnvelope * (34.0 * Math.sin(4.8 * wt + 0.8));
      const windForceX = p.windEnvelope * (26.0 + 16.0 * Math.cos(3.6 * wt));

      if (!p.isDragging) {
        // Equation of motion for physical pendulum
        const accZ = -k_z * (p.theta - p.targetTheta)
                     - c_z * p.omega_z
                     - c_z_quad * p.omega_z * Math.abs(p.omega_z)
                     + windForceZ;
        
        p.omega_z += accZ * subDt;
        p.theta += p.omega_z * subDt;
      }

      // Coupled Y-axis swivel
      const driveY = -0.26 * p.omega_z + windForceY;
      const accY = -k_y * p.phi_y - c_y * p.omega_y + driveY;
      p.omega_y += accY * subDt;
      p.phi_y += p.omega_y * subDt;

      // Coupled X-axis lift
      const driveX = 0.16 * Math.abs(p.omega_z) + windForceX;
      const accX = -k_x * p.phi_x - c_x * p.omega_x + driveX;
      p.omega_x += accX * subDt;
      p.phi_x += p.omega_x * subDt;
    }

    // Apply 3D transform directly to DOM node for silky-smooth 120 FPS execution
    if (idCardRef.current) {
      idCardRef.current.style.transform = `rotate(${p.theta.toFixed(3)}deg) rotateY(${p.phi_y.toFixed(3)}deg) rotateX(${p.phi_x.toFixed(3)}deg)`;
    }

    // Natural settling: seamlessly continue animating until naturally damped to rest
    const isStationary = !p.isHovered && !p.isDragging &&
      p.windEnvelope < 0.005 &&
      Math.abs(p.theta - p.targetTheta) < 0.008 &&
      Math.abs(p.omega_z) < 0.01 &&
      Math.abs(p.phi_y) < 0.008 &&
      Math.abs(p.phi_x) < 0.008;

    if (!isStationary) {
      p.rafId = requestAnimationFrame(updateCardPhysics);
    } else {
      p.theta = p.targetTheta;
      p.omega_z = 0;
      p.phi_y = 0;
      p.omega_y = 0;
      p.phi_x = 0;
      p.omega_x = 0;
      p.windEnvelope = 0;
      p.rafId = null;
      p.lastTime = null;
      if (idCardRef.current) {
        idCardRef.current.style.transform = `rotate(${p.targetTheta}deg) rotateY(0deg) rotateX(0deg)`;
      }
    }
  }, []);

  const startIdCardPhysicsLoop = useCallback(() => {
    const p = cardPhysics.current;
    if (!p.rafId) {
      p.lastTime = performance.now();
      p.rafId = requestAnimationFrame(updateCardPhysics);
    }
  }, [updateCardPhysics]);

  const handleIdCardPointerEnter = useCallback((e) => {
    const p = cardPhysics.current;
    p.isHovered = true;
    p.lastMouseX = e.clientX;
    p.lastMouseTime = performance.now();
    startIdCardPhysicsLoop();
  }, [startIdCardPhysicsLoop]);

  const handleIdCardPointerMove = useCallback((e) => {
    const p = cardPhysics.current;
    const now = performance.now();

    if (p.isDragging) {
      const dx = e.clientX - p.dragStartX;
      const targetDragTheta = p.dragStartTheta + dx * 0.08;
      const dtDrag = Math.max(0.01, (now - p.lastMouseTime) / 1000);
      const dragVel = (targetDragTheta - p.theta) / dtDrag;
      p.theta = targetDragTheta;
      p.omega_z = Math.max(-60, Math.min(60, dragVel * 0.5));
      p.lastMouseTime = now;
      startIdCardPhysicsLoop();
      return;
    }

    if (p.lastMouseX !== null && p.lastMouseTime !== null) {
      const dx = e.clientX - p.lastMouseX;
      const dtMouse = Math.max(0.008, Math.min(0.08, (now - p.lastMouseTime) / 1000));
      const mouseSpeed = dx / dtMouse;
      const impulse = Math.max(-16, Math.min(16, mouseSpeed * 0.018));
      p.omega_z = Math.max(-45, Math.min(45, p.omega_z + impulse * 0.4));
      p.omega_y = Math.max(-25, Math.min(25, p.omega_y + impulse * 0.2));
    }
    p.lastMouseX = e.clientX;
    p.lastMouseTime = now;
    startIdCardPhysicsLoop();
  }, [startIdCardPhysicsLoop]);

  const handleIdCardPointerLeave = useCallback(() => {
    const p = cardPhysics.current;
    p.isHovered = false;
    p.lastMouseX = null;
    p.lastMouseTime = null;
    // Seamlessly continue physics loop to naturally damp into resting tilt
    startIdCardPhysicsLoop();
  }, [startIdCardPhysicsLoop]);

  const handleIdCardPointerDown = useCallback((e) => {
    const p = cardPhysics.current;
    p.isDragging = true;
    p.dragStartX = e.clientX;
    p.dragStartTheta = p.theta;
    p.lastMouseTime = performance.now();
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch (_) {}
    startIdCardPhysicsLoop();
  }, [startIdCardPhysicsLoop]);

  const handleIdCardPointerUp = useCallback((e) => {
    const p = cardPhysics.current;
    if (p.isDragging) {
      p.isDragging = false;
      try {
        e.currentTarget.releasePointerCapture?.(e.pointerId);
      } catch (_) {}
      startIdCardPhysicsLoop();
    }
  }, [startIdCardPhysicsLoop]);

  useEffect(() => {
    const physics = cardPhysics.current;
    return () => {
      if (physics.rafId) {
        cancelAnimationFrame(physics.rafId);
      }
    };
  }, []);

  // Track Scroll Progress & Active Section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (scrollY / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      const sectionIds = ['hero', 'projects', 'education', 'skills', 'experience', 'achievements', 'contact'];
      for (const sId of sectionIds) {
        const el = document.getElementById(sId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= window.innerHeight * 0.4 && rect.bottom >= window.innerHeight * 0.4) {
            setActiveSection(sId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Dynamic Role Typing Effect
  useEffect(() => {
    const currentRole = ROLES[currentRoleIndex];
    let typingSpeed = isDeleting ? 25 : 65;

    if (!isDeleting && displayedText === currentRole) {
      typingSpeed = 2000;
      const timer = setTimeout(() => setIsDeleting(true), typingSpeed);
      return () => clearTimeout(timer);
    } else if (isDeleting && displayedText === '') {
      setIsDeleting(false);
      setCurrentRoleIndex((prev) => (prev + 1) % ROLES.length);
      typingSpeed = 200;
    }

    const timer = setTimeout(() => {
      setDisplayedText((prev) =>
        isDeleting
          ? currentRole.substring(0, prev.length - 1)
          : currentRole.substring(0, prev.length + 1)
      );
    }, typingSpeed);

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, currentRoleIndex]);

  // Copy Email to Clipboard
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('charan06082004@gmail.com');
    showToast('SYS_ACTION: Email copied [charan06082004@gmail.com]');
  };

  // Copy Phone to Clipboard
  const copyPhoneToClipboard = () => {
    navigator.clipboard.writeText('+91 6302695484');
    showToast('SYS_ACTION: Phone number copied [+91 6302695484]');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3800);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('SYS_ERROR: Please fill all mandatory parameters.');
      return;
    }

    setIsSubmitting(true);
    try {
      let endpoint = '/api/contact';
      let response;
      
      try {
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } catch (e) {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          endpoint = 'http://localhost:5001/api/contact';
          response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
        } else {
          throw e;
        }
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('application/json') && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        endpoint = 'http://localhost:5001/api/contact';
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const data = await response.json();

      if (response.ok && data.success !== false) {
        playClickSound('success');
        showToast('SYS_STATUS: Transmission dispatched to Charan successfully.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        showToast(data.error || 'SYS_ERROR: Message delivery failed. Please send direct email.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      showToast('SYS_NOTICE: Make sure local backend server is running on port 5001, or email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Projects from Charan's Portfolio
  const allProjects = [
    // -------------------------------------------------------------------------
    // EXISTING CARDS (PRESERVED INTACT)
    // -------------------------------------------------------------------------
    {
      id: 1,
      index: '01',
      title: 'DayFlow — Full-Stack HRMS Platform',
      category: 'Web Development',
      filterGroup: 'Web Development',
      badgeText: 'SPEC_01 // HRMS & RBAC',
      description: 'Enterprise full-stack HRMS platform engineered for workforce administration and attendance tracking.',
      impact: 'Architected role-based access control (RBAC), JWT security layer, modular REST endpoints, and Docker deployment.',
      tags: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
      demoLink: 'https://day-flow-six.vercel.app/',
      codeLink: 'https://github.com/Charan-718/Day-Flow',
      features: [
        'Multi-tier RBAC & JWT authentication',
        'Attendance tracking & approvals',
        'REST API with PostgreSQL & Docker'
      ]
    },
    {
      id: 2,
      index: '02',
      title: 'Traveloop — AI Travel Planning Platform',
      category: 'AI & Next-Gen',
      filterGroup: 'AI & Machine Learning',
      badgeText: 'SPEC_02 // AI TRAVEL ENGINE',
      description: 'Intelligent trip generation platform featuring AI itinerary synthesis and location discovery.',
      impact: 'Constructed responsive map integrations, dynamic planning workflows, and predictive recommendation pipelines.',
      tags: ['React.js', 'Node.js', 'PostgreSQL', 'AI APIs'],
      demoLink: 'https://traveloop-plum.vercel.app/',
      codeLink: 'https://github.com/mounikakorrakuti1/traveloop',
      features: [
        'AI custom multi-day itinerary generation',
        'Interactive geospatial map routing',
        'Dynamic budget forecasting & PostgreSQL'
      ]
    },
    {
      id: 3,
      index: '03',
      title: 'Sahakārya — Gig Services Platform',
      category: 'Web & Mobile',
      filterGroup: 'Mobile & IoT',
      badgeText: 'SPEC_03 // GIG PLATFORM',
      description: 'Decentralized gig-services platform connecting customers with local service workers transparently.',
      impact: 'Engineered scalable microservice backends with PostGIS geospatial queries, FastAPI AI service, and Docker containerization.',
      tags: ['React Native', 'FastAPI', 'PostgreSQL', 'Docker'],
      demoLink: 'https://sahakarya.vercel.app/',
      codeLink: 'https://github.com/Kouhsik33/Cooperative-Gig-Services-Platform',
      features: [
        'Intelligent dispatch with PostGIS indexing',
        'Real-time bookings & transparent pricing',
        'React Native client & FastAPI microservice'
      ]
    },

    // -------------------------------------------------------------------------
    // REMAINING PROJECTS WITH CONFIGURED DEMO URLS
    // -------------------------------------------------------------------------
    {
      id: 'chatbot',
      index: '04',
      spec: 'SPEC_05 // CONVERSATIONAL AI',
      badgeText: 'SPEC_05 // CONVERSATIONAL AI',
      category: 'AI APPLICATIONS',
      filterGroup: 'AI & Machine Learning',
      title: 'Chatbot — AI Conversational Assistant',
      description: 'A chat-based AI application that provides an interface for conversational interaction and AI-powered responses.',
      features: [
        'Interactive conversational interface',
        'AI API integration',
        'Conversation workflows and response handling'
      ],
      tags: ['JavaScript', 'AI APIs', 'Web Development'],
      demoLink: 'https://quantum-chatbot-green.vercel.app/',
      codeLink: 'https://github.com/Charan-718/Chatbot'
    },
    {
      id: 'critique-improve',
      index: '05',
      spec: 'SPEC_06 // AI CONTENT REVIEW',
      badgeText: 'SPEC_06 // AI CONTENT REVIEW',
      category: 'AI & WEB DEVELOPMENT',
      filterGroup: 'AI & Machine Learning',
      title: 'Critique and Improve',
      description: 'A web application focused on reviewing user-provided content and helping improve its quality.',
      features: [
        'Content input and review workflow',
        'Improvement-oriented feedback experience',
        'Interactive web application interface'
      ],
      tags: ['Web Development', 'JavaScript', 'AI Integration'],
      demoLink: 'https://critique-and-improve.vercel.app',
      codeLink: 'https://github.com/Charan-718/critique-and-improve'
    },
    {
      id: 'error-404',
      index: '06',
      spec: 'SPEC_09 // WEB EXPERIENCE',
      badgeText: 'SPEC_09 // WEB EXPERIENCE',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Error-404 — Web Experience',
      description: 'A deployed web project whose specific purpose and core functionality should be confirmed from its source code.',
      features: [
        'Browser-accessible web experience',
        'Project-specific interface and interactions',
        'Implementation details to be verified'
      ],
      tags: ['Web Development', 'Frontend'],
      demoLink: 'https://error-404-1c95.onrender.com',
      codeLink: 'https://github.com/Charan-718/Error-404'
    },
    {
      id: 'extinct-era',
      index: '07',
      spec: 'SPEC_10 // INTERACTIVE EXPERIENCE',
      badgeText: 'SPEC_10 // INTERACTIVE EXPERIENCE',
      category: 'FRONTEND DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Extinct Era — Dinosaur Experience',
      description: 'A dinosaur-themed web experience built around an immersive landing page and visual presentation.',
      features: [
        'Dinosaur-themed visual storytelling',
        'Dedicated landing page',
        'Browser-based interactive experience'
      ],
      tags: ['HTML', 'CSS', 'JavaScript'],
      demoLink: 'https://charan-718.github.io/Extinct-Era/dino_landing_page.html',
      codeLink: 'https://github.com/Charan-718/Extinct-Era'
    },
    {
      id: 'eyesight-adjuster',
      index: '08',
      spec: 'SPEC_11 // VISUAL ACCESSIBILITY',
      badgeText: 'SPEC_11 // VISUAL ACCESSIBILITY',
      category: 'ACCESSIBILITY & WEB',
      filterGroup: 'Web Development',
      title: 'EyeSight Adjuster',
      description: 'A visual-adjustment project intended to explore ways of modifying the on-screen viewing experience.',
      features: [
        'Visual adjustment experience',
        'Interactive interface',
        'Specific adjustment options to be verified'
      ],
      tags: ['JavaScript', 'HTML', 'CSS', 'Accessibility'],
      demoLink: 'https://charan-718.github.io/EyeSight-Adjuster/',
      codeLink: 'https://github.com/Charan-718/EyeSight-Adjuster'
    },
    {
      id: 'flam',
      index: '09',
      spec: 'SPEC_12 // WEB APPLICATION',
      badgeText: 'SPEC_12 // WEB APPLICATION',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Flam Assignment',
      description: 'A deployed web project created as part of an assignment, with functionality to be confirmed from the repository.',
      features: [
        'Assignment-specific application workflow',
        'Web interface and user interaction',
        'Implementation details to be verified'
      ],
      tags: ['Web Development'],
      demoLink: 'https://flam-assignment-e9d9.onrender.com/',
      codeLink: 'https://github.com/Charan-718/Flam-Assignment'
    },
    {
      id: 'freshmart',
      index: '10',
      spec: 'SPEC_13 // DIGITAL COMMERCE',
      badgeText: 'SPEC_13 // DIGITAL COMMERCE',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'FreshMart — Grocery Platform',
      description: 'A grocery-oriented web project designed around an online shopping experience.',
      features: [
        'Grocery-focused web interface',
        'Product discovery experience',
        'Cart and checkout functionality to be verified'
      ],
      tags: ['Web Development', 'JavaScript', 'E-commerce'],
      demoLink: 'https://freshmart-fsd.netlify.app/',
      codeLink: 'https://github.com/Charan-718/FreshMart'
    },
    {
      id: 'greenova',
      index: '11',
      spec: 'SPEC_14 // SUSTAINABILITY',
      badgeText: 'SPEC_14 // SUSTAINABILITY',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Greenova — Sustainability Platform',
      description: 'A sustainability-oriented web project focused on environmentally themed digital experiences.',
      features: [
        'Sustainability-focused presentation',
        'Web-based user experience',
        'Core features to be confirmed from the README'
      ],
      tags: ['Web Development', 'Frontend', 'Sustainability'],
      demoLink: 'https://greenova-csp.netlify.app',
      codeLink: 'https://github.com/Charan-718/Greenova'
    },
    {
      id: 'learnloop',
      index: '12',
      spec: 'SPEC_16 // DIGITAL LEARNING',
      badgeText: 'SPEC_16 // DIGITAL LEARNING',
      category: 'EDTECH & WEB',
      filterGroup: 'Web Development',
      title: 'LearnLoop — Learning Platform',
      description: 'An education-oriented web project designed to provide a digital learning experience.',
      features: [
        'Learning-focused user interface',
        'Educational content experience',
        'Course and progress functionality to be verified'
      ],
      tags: ['Web Development', 'EdTech'],
      demoLink: 'https://charan-718.github.io/LearnLoop/',
      codeLink: 'https://github.com/Charan-718/LearnLoop'
    },
    {
      id: 'medi-report',
      index: '13',
      spec: 'SPEC_17 // HEALTHCARE TECHNOLOGY',
      badgeText: 'SPEC_17 // HEALTHCARE TECHNOLOGY',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Medi-Report — Medical Reporting Project',
      description: 'A healthcare-oriented reporting application whose report generation and data-processing features need README verification.',
      features: [
        'Medical-reporting-oriented workflow',
        'Web-based application experience',
        'Report processing capabilities to be confirmed'
      ],
      tags: ['Web Development', 'Healthcare Technology'],
      demoLink: 'https://medi-report.netlify.app',
      codeLink: 'https://github.com/Charan-718/Medi-Report'
    },
    {
      id: 'mini-erp',
      index: '14',
      spec: 'SPEC_18 // BUSINESS OPERATIONS',
      badgeText: 'SPEC_18 // BUSINESS OPERATIONS',
      category: 'FULL-STACK DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Mini-ERP — Business Management Platform',
      description: 'A business-management application intended to organize operational workflows through a centralized web interface.',
      features: [
        'Business-oriented application workflows',
        'Centralized operational interface',
        'Specific ERP modules to be confirmed'
      ],
      tags: ['React', 'Web Development', 'Business Software'],
      demoLink: 'https://mini-erp-furnexa.netlify.app',
      codeLink: 'https://github.com/Charan-718/Mini-ERP'
    },
    {
      id: 'outbox',
      index: '15',
      spec: 'SPEC_21 // WEB APPLICATION',
      badgeText: 'SPEC_21 // WEB APPLICATION',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Outbox Assignment',
      description: 'A deployed assignment project. Its main purpose and implementation details should be confirmed from the repository.',
      features: [
        'Assignment-specific workflow',
        'Browser-based application interface',
        'Core functionality to be verified'
      ],
      tags: ['Web Development'],
      demoLink: 'https://outbox-assignment-plum.vercel.app',
      codeLink: 'https://github.com/Charan-718/Outbox-Assignment'
    },
    {
      id: 'prakalp',
      index: '16',
      spec: 'SPEC_22 // WEB INTERFACE',
      badgeText: 'SPEC_22 // WEB INTERFACE',
      category: 'FRONTEND DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Prakalp Frontend',
      description: 'A frontend project deployed through GitHub Pages. Its specific application domain and features require README verification.',
      features: [
        'Browser-based frontend',
        'Project-specific interface',
        'Detailed functionality to be confirmed'
      ],
      tags: ['Frontend Development', 'Web Technologies'],
      demoLink: 'https://charan-718.github.io/PrakalpFrontend/',
      codeLink: 'https://github.com/Charan-718/PrakalpFrontend'
    },
    {
      id: 'pranathi-portfolio',
      index: '17',
      spec: 'SPEC_23 // PERSONAL PORTFOLIO',
      badgeText: 'SPEC_23 // PERSONAL PORTFOLIO',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Pranathi Portfolio',
      description: 'A personal portfolio website created to present an individual\'s profile, work, and professional information.',
      features: [
        'Personal profile presentation',
        'Portfolio-oriented layout',
        'Project and professional information display'
      ],
      tags: ['Web Development', 'Frontend', 'UI/UX'],
      demoLink: 'https://pranathi-portfolio-alpha.vercel.app',
      codeLink: 'https://github.com/Charan-718/Pranathi-Portfolio'
    },
    {
      id: 'quantum-chatbot',
      index: '18',
      spec: 'SPEC_25 // AI ASSISTANT',
      badgeText: 'SPEC_25 // AI ASSISTANT',
      category: 'AI & QUANTUM COMPUTING',
      filterGroup: 'Quantum Computing',
      title: 'Quantum Chatbot',
      description: 'A conversational AI project associated with quantum-computing interests. Its precise relationship to the Chatbot repository should be verified.',
      features: [
        'Conversational AI interface',
        'AI-powered response workflow',
        'Quantum-specific capabilities to be confirmed'
      ],
      tags: ['AI', 'JavaScript', 'Quantum Computing'],
      demoLink: 'https://quantum-chatbot-green.vercel.app/',
      codeLink: 'https://github.com/Charan-718/Quantum-Chatbot'
    },
    {
      id: 'quantum-keydistribution',
      index: '19',
      spec: 'SPEC_26 // QUANTUM CRYPTOGRAPHY',
      badgeText: 'SPEC_26 // QUANTUM CRYPTOGRAPHY',
      category: 'QUANTUM COMPUTING',
      filterGroup: 'Quantum Computing',
      title: 'Quantum Key Distribution',
      description: 'A quantum-computing project exploring quantum key distribution and concepts related to secure communication.',
      features: [
        'Quantum communication concepts',
        'Key-distribution workflow',
        'Specific protocol and simulation details to be verified'
      ],
      tags: ['Quantum Computing', 'Cryptography', 'Python'],
      demoLink: 'https://charan-718.github.io/Quantum-Keydistribution/',
      codeLink: 'https://github.com/Charan-718/Quantum-Keydistribution'
    },
    {
      id: 'schrodinger-cat',
      index: '20',
      spec: 'SPEC_28 // QUANTUM CONCEPTS',
      badgeText: 'SPEC_28 // QUANTUM CONCEPTS',
      category: 'QUANTUM COMPUTING',
      filterGroup: 'Quantum Computing',
      title: 'Schrödinger Cat',
      description: 'A quantum-themed web project centered on the Schrödinger\'s cat thought experiment.',
      features: [
        'Quantum-mechanics-inspired concept',
        'Browser-based presentation',
        'Specific interactive elements to be confirmed'
      ],
      tags: ['HTML', 'CSS', 'JavaScript', 'Quantum Concepts'],
      demoLink: 'https://charan-718.github.io/Schrodinger-Cat/',
      codeLink: 'https://github.com/Charan-718/Schrodinger-Cat'
    },
    {
      id: 'skyline',
      index: '21',
      spec: 'SPEC_29 // DEVELOPER TOOLING',
      badgeText: 'SPEC_29 // DEVELOPER TOOLING',
      category: 'SOFTWARE ENGINEERING',
      filterGroup: 'Web Development',
      title: 'Skyline',
      description: 'A software project with a deployed web experience. Its precise purpose and core functionality should be derived from the repository README.',
      features: [
        'Project-specific development workflow',
        'Deployed web experience',
        'Core features to be verified'
      ],
      tags: ['Web Development', 'Software Engineering'],
      demoLink: 'https://skyline-chi-orcin.vercel.app',
      codeLink: 'https://github.com/Charan-718/skyline'
    },

    // -------------------------------------------------------------------------
    // PROJECTS WITH DEMO URL NULL / NOT CONFIGURED (PLACED AT THE LAST)
    // -------------------------------------------------------------------------
    {
      id: 'amazon-ml',
      index: '22',
      spec: 'SPEC_01 // ENTITY RESOLUTION',
      badgeText: 'SPEC_01 // ENTITY RESOLUTION',
      category: 'MACHINE LEARNING',
      filterGroup: 'AI & Machine Learning',
      title: 'Amazon ML Challenge — Business Entity Resolution',
      description: 'A large-scale entity matching pipeline designed to identify duplicate business records across datasets using candidate retrieval, structural features, and machine learning.',
      features: [
        'Hybrid lexical and semantic retrieval for candidate generation',
        'Entity matching with address, name, and structural similarity features',
        'DuckDB-based blocking and XGBoost scoring pipeline'
      ],
      tags: ['Python', 'XGBoost', 'DuckDB', 'FAISS', 'MiniLM', 'Pandas'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Amazon-ML-Challenge-2026'
    },
    {
      id: 'ble-gatt',
      index: '23',
      spec: 'SPEC_02 // BLUETOOTH CONNECTIVITY',
      badgeText: 'SPEC_02 // BLUETOOTH CONNECTIVITY',
      category: 'MOBILE & IOT',
      filterGroup: 'Mobile & IoT',
      title: 'BLE GATT App',
      description: 'A Bluetooth Low Energy application project centered on GATT-based device communication.',
      features: [
        'Bluetooth Low Energy communication workflows',
        'GATT service and characteristic interaction',
        'Device connectivity functionality to be confirmed from the README'
      ],
      tags: ['BLE', 'GATT', 'Mobile Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/BLE-GATT-App'
    },
    {
      id: 'ble-gatt-2',
      index: '24',
      spec: 'SPEC_03 // BLUETOOTH CONNECTIVITY',
      badgeText: 'SPEC_03 // BLUETOOTH CONNECTIVITY',
      category: 'MOBILE & IOT',
      filterGroup: 'Mobile & IoT',
      title: 'BLE GATT App 2',
      description: 'A second Bluetooth Low Energy application repository for device communication workflows.',
      features: [
        'BLE connectivity and communication',
        'GATT service interaction',
        'Implementation differences from the first version need verification'
      ],
      tags: ['BLE', 'GATT', 'Mobile Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/BLE-GATT-App-2'
    },
    {
      id: 'portfolio',
      index: '25',
      spec: 'SPEC_04 // PERSONAL BRAND',
      badgeText: 'SPEC_04 // PERSONAL BRAND',
      category: 'FRONTEND DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Charan Portfolio — Developer Portfolio',
      description: 'A personal portfolio website for presenting software projects, technical skills, and development experience.',
      features: [
        'Project showcase and technical profile',
        'Repository and deployment links',
        'Visual presentation of development work'
      ],
      tags: ['Web Development', 'Frontend', 'UI/UX'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Charan-Portfolio'
    },
    {
      id: 'day-trix',
      index: '26',
      spec: 'SPEC_07 // PRODUCTIVITY',
      badgeText: 'SPEC_07 // PRODUCTIVITY',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Day-Trix — Productivity Project',
      description: 'A productivity-oriented project. Its specific workflow and capabilities should be confirmed against the repository README.',
      features: [
        'Project-specific productivity workflow',
        'Application interface and interaction',
        'Core functionality to be verified'
      ],
      tags: ['Web Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Day-Trix'
    },
    {
      id: 'idea-lab',
      index: '27',
      spec: 'SPEC_15 // EXPERIMENTAL PROJECT',
      badgeText: 'SPEC_15 // EXPERIMENTAL PROJECT',
      category: 'SOFTWARE DEVELOPMENT',
      filterGroup: 'Digital Twin & Systems',
      title: 'Idea Lab — Innovation Project',
      description: 'An experimental project repository. Its purpose, target users, and implemented functionality need source verification.',
      features: [
        'Project-specific concept and workflow',
        'Implementation to be reviewed',
        'Core capabilities to be confirmed'
      ],
      tags: ['Software Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Idea-Lab'
    },
    {
      id: 'ml-xplore',
      index: '28',
      spec: 'SPEC_19 // MACHINE LEARNING',
      badgeText: 'SPEC_19 // MACHINE LEARNING',
      category: 'AI & DATA SCIENCE',
      filterGroup: 'AI & Machine Learning',
      title: 'ML Xplore 6115',
      description: 'A machine-learning-oriented project repository. The specific model, dataset, and application objective require source verification.',
      features: [
        'Machine-learning project workflow',
        'Model and dataset to be identified',
        'Evaluation methodology to be confirmed'
      ],
      tags: ['Machine Learning', 'Python'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/ML-Xplore-6115'
    },
    {
      id: 'my-app',
      index: '29',
      spec: 'SPEC_20 // APPLICATION DEVELOPMENT',
      badgeText: 'SPEC_20 // APPLICATION DEVELOPMENT',
      category: 'SOFTWARE DEVELOPMENT',
      filterGroup: 'Mobile & IoT',
      title: 'My App — Application Project',
      description: 'An application repository whose intended use and implemented capabilities need confirmation from the source.',
      features: [
        'Application-specific workflow',
        'User interface and interactions',
        'Core implementation to be reviewed'
      ],
      tags: ['Application Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/My-App'
    },
    {
      id: 'qkrishi',
      index: '30',
      spec: 'SPEC_24 // AGRITECH',
      badgeText: 'SPEC_24 // AGRITECH',
      category: 'WEB DEVELOPMENT',
      filterGroup: 'Web Development',
      title: 'Qkrishi Assignment',
      description: 'An assignment repository associated with the Qkrishi name. Its precise objective and implemented features need source verification.',
      features: [
        'Assignment-specific implementation',
        'Application workflow to be reviewed',
        'Technical details to be confirmed'
      ],
      tags: ['Software Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Qkrishi-Assignment'
    },
    {
      id: 'quantumcodehub',
      index: '31',
      spec: 'SPEC_27 // AUTONOMOUS QUANTUM RESEARCH',
      badgeText: 'SPEC_27 // AUTONOMOUS QUANTUM RESEARCH',
      category: 'QUANTUM AI & RESEARCH',
      filterGroup: 'Quantum Computing',
      title: 'QuantumCodeHub — Autonomous Quantum Research Platform',
      description: 'An AI-assisted quantum research platform combining quantum-programming support, technical documentation retrieval, and language-model-based assistance.',
      features: [
        'Quantum programming and Qiskit-focused workflows',
        'Retrieval-augmented generation over technical documentation',
        'Local Granite model integration with a FastAPI-backed service'
      ],
      tags: ['Python', 'Qiskit', 'FastAPI', 'Granite 8B', 'RAG', 'ChromaDB'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/QuantumCodeHub'
    },
    {
      id: 'slot-parking',
      index: '32',
      spec: 'SPEC_30 // SMART PARKING',
      badgeText: 'SPEC_30 // SMART PARKING',
      category: 'SOFTWARE DEVELOPMENT',
      filterGroup: 'Digital Twin & Systems',
      title: 'Slot Parking System',
      description: 'A parking-system project focused on managing parking slots and related workflows.',
      features: [
        'Parking-slot management concept',
        'Parking availability workflow',
        'Booking and allocation features to be confirmed'
      ],
      tags: ['Software Development', 'Database Systems'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/Slot-Parking-System'
    },
    {
      id: 'twinaero',
      index: '33',
      spec: 'SPEC_31 // AEROSPACE DIGITAL TWIN',
      badgeText: 'SPEC_31 // AEROSPACE DIGITAL TWIN',
      category: 'AI & PREDICTIVE MAINTENANCE',
      filterGroup: 'Digital Twin & Systems',
      title: 'TwinAero — Aerospace Engine Digital Twin',
      description: 'A digital-twin project concept for aerospace-engine health monitoring and predictive maintenance using engine sensor data and remaining useful life estimation.',
      features: [
        'NASA C-MAPSS FD004-based engine degradation analysis',
        'Remaining Useful Life prediction and condition monitoring',
        'Engine health visualization and maintenance insights'
      ],
      tags: ['Python', 'Machine Learning', 'NASA C-MAPSS', 'Predictive Maintenance', 'Digital Twin', 'Data Visualization'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/TwinAreo'
    },
    {
      id: 'twinops-tactix',
      index: '34',
      spec: 'SPEC_32 // DIGITAL TWIN OPERATIONS',
      badgeText: 'SPEC_32 // DIGITAL TWIN OPERATIONS',
      category: 'DIGITAL TWIN & OPERATIONS',
      filterGroup: 'Digital Twin & Systems',
      title: 'TwinOps Tactix',
      description: 'A digital-twin and operations-oriented project. Its target system, simulation model, and implemented capabilities require README verification.',
      features: [
        'Operations-focused project concept',
        'Digital-twin functionality to be confirmed',
        'Simulation and monitoring capabilities to be verified'
      ],
      tags: ['Digital Twin', 'Simulation', 'Software Development'],
      demoLink: null,
      codeLink: 'https://github.com/Charan-718/TwinOps-Tactix'
    }
  ];

  const filteredProjects = activeFilter === 'All'
    ? allProjects
    : allProjects.filter((p) => p.category === activeFilter || p.filterGroup === activeFilter);

  // Technical Competencies
  const skillCategories = [
    {
      category: 'Frontend Architecture',
      icon: 'fa-solid fa-code',
      skills: ['React.js', 'React Native', 'TypeScript', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'TailwindCSS', 'Bootstrap', 'Responsive Systems']
    },
    {
      category: 'Backend & Microservices',
      icon: 'fa-solid fa-server',
      skills: ['Node.js', 'Express.js', 'Python', 'FastAPI', 'RESTful APIs', 'Prisma ORM', 'JWT Security']
    },
    {
      category: 'AI / ML & Deep Learning',
      icon: 'fa-solid fa-brain',
      skills: ['Machine Learning', 'Deep Learning', 'EIS Data Modeling', 'Feature Extraction', 'Nyquist Visualizations', 'Multi-Agent AI Systems']
    },
    {
      category: 'Databases & Spatial Storage',
      icon: 'fa-solid fa-database',
      skills: ['PostgreSQL', 'PostGIS', 'MongoDB', 'SQL', 'Schema Architecture']
    },
    {
      category: 'Programming Languages',
      icon: 'fa-solid fa-terminal',
      skills: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'SQL']
    },
    {
      category: 'DevOps, Tooling & CS Core',
      icon: 'fa-solid fa-screwdriver-wrench',
      skills: ['Docker', 'Git & GitHub', 'Vercel', 'Postman', 'DSA', 'OOP & DBMS', 'Computer Networks']
    }
  ];

  // Internships & Research
  const internships = [
    {
      id: 1,
      period: 'JUN 2025 — AUG 2025',
      role: 'Deep Learning Intern',
      organization: 'AICTE IdeaLab',
      type: 'RESEARCH & DL INTERNSHIP',
      highlights: [
        'Engineered ML and deep learning architectures for battery State of Charge (SOC) and State of Health (SOH) estimation using Electrochemical Impedance Spectroscopy (EIS) datasets.',
        'Extracted high-order frequency-domain features and designed Nyquist spectrum visualization pipelines to evaluate degradation signatures across discharge cycles.',
        'Developed predictive regression workflows optimizing electrochemical feature selection for accelerated battery diagnosis.'
      ]
    },
    {
      id: 2,
      period: 'JAN 2024 — PRESENT',
      role: 'Full-Stack & AI/ML Fellow',
      organization: 'NxtWave Disruptive Technologies',
      type: 'CCBP 4.0 INDUSTRY READY PROGRAM',
      highlights: [
        'Completed intensive industry-ready training in Full-Stack Web Development, Data Structures & Algorithms, and AI/ML paradigms.',
        'Solved 800+ algorithmic coding challenges across Python, C++, and JavaScript, and built 300+ full-stack and frontend production exercises.'
      ]
    }
  ];

  // Certifications
  const certifications = [
    {
      title: 'Industry Ready Certification in Full-Stack & AI/ML',
      issuer: 'NxtWave Disruptive Technologies',
      icon: 'fa-solid fa-certificate',
      desc: 'Rigorous engineering training covering React, Node.js, Express, PostgreSQL, SQL, Python, and Data Structures & Algorithms.'
    },
    {
      title: 'Deep Learning & EIS Modeling Credential',
      issuer: 'AICTE IdeaLab',
      icon: 'fa-solid fa-brain',
      desc: 'Credential for experimental research in electrochemical impedance feature extraction and battery degradation neural models.'
    },
    {
      title: '1st Prize Winner – Prakalp Hackathon 2026',
      issuer: 'Prakalp 2026, Eluru',
      icon: 'fa-solid fa-trophy',
      desc: 'Awarded 1st place for architecting Critique & Improve (IDEA ARENA), a real-time multi-agent AI system for iterative refinement.'
    },
    {
      title: 'Grand Finals Winner – AQVH 2025',
      issuer: 'Amaravati Quantum Valley Hackathon',
      icon: 'fa-solid fa-award',
      desc: 'Secured 1st place in Grand Finals for creating an innovative quantum computing solution addressing complex problem statements.'
    }
  ];

  // Achievements
  const achievements = [
    {
      title: '1st Prize – Prakalp Hackathon 2026, Eluru',
      tag: '1st Place Champion',
      icon: 'fa-solid fa-trophy',
      desc: 'Won 1st place for developing Critique & Improve — IDEA ARENA, a real-time multi-agent AI platform for iterative idea refinement.'
    },
    {
      title: 'Winner – Amaravati Quantum Valley Hackathon (AQVH) 2025',
      tag: 'Grand Finals Winner',
      icon: 'fa-solid fa-award',
      desc: 'Secured 1st place at the Grand Finals for building a novel quantum computing solution addressing real-world problem statements.'
    },
    {
      title: 'Best Innovator Award – Prajawalan National Hackathon 2026',
      tag: 'National Innovation Honor',
      icon: 'fa-solid fa-lightbulb',
      desc: 'Recognized with Best Innovator Award for presenting QuantumCodeHub, an AI-powered quantum coding assistant accelerating circuit development.'
    },
    {
      title: 'NxtWave CCBP 4.0 Coding Excellence (800+ Solved)',
      tag: 'DSA & Full-Stack Mastery',
      icon: 'fa-solid fa-code',
      desc: 'Solved 800+ Coding Challenges (DSA/Programming), developed 300+ full-stack exercises, and executed 100+ SQL queries.'
    }
  ];

  // Navigation Items with Swiss Numbering
  const navLinks = [
    { id: 'hero', num: '01', label: 'Overview' },
    { id: 'projects', num: '02', label: 'Projects' },
    { id: 'education', num: '03', label: 'Education' },
    { id: 'skills', num: '04', label: 'Skills' },
    { id: 'experience', num: '05', label: 'Experience' },
    { id: 'achievements', num: '06', label: 'Awards' },
    { id: 'contact', num: '07', label: 'Contact' }
  ];

  if (isCharacterArenaOpen) {
    return (
      <>
        {showInitialIntro && (
          <InitialBlankCurtain
            onComplete={() => setShowInitialIntro(false)}
            maskId="characterCutoutMask"
          />
        )}
        <CharacterPlayground isCurtainActive={showInitialIntro} onClose={closeCharacterArena} />
      </>
    );
  }

  return (
    <div className="portfolio-app-swiss">
      {/* Initial 2-Second Black Blank Screen & Transparent Cutout Zoom Reveal */}
      {showInitialIntro && (
        <InitialBlankCurtain
          onComplete={() => setShowInitialIntro(false)}
          maskId="heroCutoutMask"
        />
      )}
      {/* Top Cyberpunk HUD Scroll Progress */}
      <div className="cyber-scroll-track" aria-hidden="true">
        <div className="cyber-scroll-bar" style={{ width: `${scrollProgress}%` }}>
          <div className="cyber-scroll-head">
            <span className="cyber-scroll-laser"></span>
          </div>
        </div>
      </div>

      {/* Top Technical HUD System Strip */}
      <div className="top-system-strip">
        <div className="container">
          <div className="system-strip-inner">
            <div className="system-node-item">
              <span className="live-beacon"></span>
              <span>AVAILABLE FOR HIRE • 2026 / 2027 ROLES</span>
            </div>
            <div className="system-node-item hide-on-mobile">
              <span>RAJAHMUNDRY, INDIA &nbsp;•&nbsp; OPEN TO RELOCATION & REMOTE</span>
            </div>
            <div className="system-node-item">
              <span>B.TECH IN ARTIFICIAL INTELLIGENCE & MACHINE LEARNING</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="header-nav">
        <div className="container">
          <div className="nav-container">
            {/* Brand Logo */}
            <button
              onClick={() => scrollToSection('hero')}
              className="logo-brand"
              aria-label="Charan Sai Barnikani Portfolio"
            >
              <div className="logo-badge" title="Charan Sai Barnikani">
                718
              </div>
              <div>
                <div className="logo-text">
                  CHARAN<span className="logo-dot">.</span>
                </div>
                <span className="logo-sub">AIML & FULL-STACK</span>
              </div>
            </button>

            {/* Navigation Menu */}
            <nav className={`nav-menu ${mobileMenuOpen ? 'mobile-open' : ''}`}>
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    scrollToSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`nav-item-link ${activeSection === item.id ? 'active' : ''}`}
                >
                  <span className="nav-item-index">{item.num}.</span>
                  {item.label}
                </button>
              ))}
            </nav>

            {/* Action CTA */}
            <div className="nav-actions">
              <button
                onClick={openCharacterArena}
                className="btn-nav-action btn-nav-icon-only"
                title="Play 3D Character Workspace"
                style={{
                  background: 'linear-gradient(135deg, #FF1E27 0%, #D40C14 100%)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 30, 39, 0.4)',
                }}
                aria-label="Play 3D Character Workspace"
              >
                <i className="fa-solid fa-cube"></i>
              </button>

              <button
                className="mobile-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle Navigation Menu"
              >
                <i className={mobileMenuOpen ? 'fa-solid fa-xmark' : 'fa-solid fa-bars'}></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* High-Velocity Marquee Spec Strip */}
      <div className="marquee-ticker" aria-hidden="true">
        <div className="marquee-track">
          <span className="marquee-item">PRODUCTION FULL-STACK ARCHITECTURE <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">FULL-STACK HRMS PLATFORM <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">DEEP LEARNING EIS BATTERY MODELING <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">3X NATIONAL HACKATHON CHAMPION <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">REACT & TYPESCRIPT <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">NODE.JS & POSTGRESQL / POSTGIS <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">800+ CODING CHALLENGES SOLVED <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">PRODUCTION FULL-STACK ARCHITECTURE <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">FULL-STACK HRMS PLATFORM <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">DEEP LEARNING EIS BATTERY MODELING <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">3X NATIONAL HACKATHON CHAMPION <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">REACT & TYPESCRIPT <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">NODE.JS & POSTGRESQL / POSTGIS <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">800+ CODING CHALLENGES SOLVED <span className="marquee-bullet">■</span></span>
        </div>
      </div>

      {/* MAIN BODY */}
      <main>
        {/* ==========================================================================
            1. HERO SECTION
            ========================================================================== */}
        <section id="hero" className="section-hero">
          {/* Cybernetic Red Circuit Lines Background Canvas */}
          <HeroCircuitBackground />

          <div className="container">
            <div className="hero-grid">
              {/* Left Column: Monumental Typographic Display */}
              <div className="hero-content">
                <div className="spec-header-tag">
                  <span className="spec-code" style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', borderColor: 'rgba(34, 197, 94, 0.3)' }}>AVAILABLE</span>
                  <span>OPEN TO SOFTWARE ENGINEERING & INTERNSHIP ROLES</span>
                </div>

                <h1 className="hero-title">
                  CHARAN SAI
                  <span className="hero-name-highlight">BARNIKANI</span>
                </h1>

                {/* Dynamic Terminal Role Indicator */}
                <div className="hero-typed-role">
                  <span className="role-tag">[ROLE]:</span>
                  <span>{displayedText}</span>
                  <span className="role-cursor">█</span>
                </div>

                <p className="hero-summary">
                  Artificial Intelligence & Machine Learning undergraduate at <strong>S R K R Engineering College</strong> with a <strong>9.12 CGPA</strong>. 
                  Focused on architecting scalable full-stack web platforms (React, TypeScript, Node.js, PostgreSQL), engineering deep learning models for electrochemical feature analysis, and multi-agent AI systems.
                </p>

                {/* 4-Column Technical Metrics Modular Grid */}
                <div className="hero-metrics-grid">
                  <div className="metric-cell">
                    <span className="metric-index">[01]</span>
                    <span className="metric-number">9.12</span>
                    <span className="metric-label">CGPA / SRKR AIML</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-index">[02]</span>
                    <span className="metric-number">3X</span>
                    <span className="metric-label">HACKATHON WINNER</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-index">[03]</span>
                    <span className="metric-number">800+</span>
                    <span className="metric-label">DSA SOLVED</span>
                  </div>
                  <div className="metric-cell">
                    <span className="metric-index">[04]</span>
                    <span className="metric-number">03</span>
                    <span className="metric-label">CORE PLATFORMS</span>
                  </div>
                </div>

                {/* Action CTAs */}
                <div className="hero-actions">
                  <a
                    href="https://leetcode.com/u/Charan_0608/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    <i className="fa-solid fa-terminal"></i>
                    <span>LEETCODE PROFILE</span>
                  </a>

                  <button onClick={copyEmailToClipboard} className="btn-outline" title="Copy Email">
                    <i className="fa-regular fa-copy"></i>
                    <span>COPY EMAIL</span>
                  </button>
                </div>

                {/* Social Connect Coordinates */}
                <div className="hero-social-strip">
                  <span className="social-strip-label">NETWORK:</span>
                  <div className="social-links-row">
                    <a href="https://github.com/Charan-718" target="_blank" rel="noreferrer" className="social-node-link" title="GitHub">
                      <i className="fa-brands fa-github"></i>
                    </a>
                    <a href="https://www.linkedin.com/in/charan-sai-barnikani/" target="_blank" rel="noreferrer" className="social-node-link" title="LinkedIn">
                      <i className="fa-brands fa-linkedin-in"></i>
                    </a>
                    <a href="https://leetcode.com/u/Charan_0608/" target="_blank" rel="noreferrer" className="social-node-link" title="LeetCode">
                      <i className="fa-solid fa-code"></i>
                    </a>
                    <a href="mailto:charan06082004@gmail.com" className="social-node-link" title="Email">
                      <i className="fa-regular fa-envelope"></i>
                    </a>
                  </div>
                </div>
              </div>

              {/* Right Column: Poster Media Frame as Hanging ID Card */}
              <div className="hero-media">
                <div className="id-card-assembly">
                  {/* 1. Upper Lanyard Strap (Anchored to top) */}
                  <svg className="id-card-strap-svg" viewBox="0 0 380 56" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <defs>
                      <linearGradient id="strapGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#FF1E27" />
                        <stop offset="10%" stopColor="#FF1E27" />
                        <stop offset="16%" stopColor="#0F0F14" />
                        <stop offset="50%" stopColor="#262634" />
                        <stop offset="84%" stopColor="#0F0F14" />
                        <stop offset="90%" stopColor="#FF1E27" />
                        <stop offset="100%" stopColor="#FF1E27" />
                      </linearGradient>
                      <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#48485C" />
                        <stop offset="30%" stopColor="#262632" />
                        <stop offset="70%" stopColor="#5C5C74" />
                        <stop offset="100%" stopColor="#1A1A24" />
                      </linearGradient>
                      <linearGradient id="metalShine" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                      </linearGradient>
                    </defs>

                    {/* Lanyard Strap (Length: 46px, Width: 32px, X: 174..206) */}
                    <rect x="174" y="0" width="32" height="46" fill="url(#strapGrad)" />
                    <line x1="180" y1="0" x2="180" y2="46" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="1" />
                    <line x1="200" y1="0" x2="200" y2="46" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="1" />

                    {/* Lanyard Crimp Buckle / Metal Anchor */}
                    <rect x="171" y="38" width="38" height="11" rx="2.5" fill="url(#metalGrad)" stroke="#6E6E8A" strokeWidth="0.8" />
                    <rect x="171" y="38" width="38" height="5.5" rx="2.5" fill="url(#metalShine)" />
                    <line x1="174" y1="43.5" x2="206" y2="43.5" stroke="#0C0C12" strokeWidth="1.2" />

                    {/* Anchor D-Ring loop where hook connects */}
                    <path d="M 182 48 L 198 48 Q 201 56 190 56 Q 179 56 182 48 Z" fill="none" stroke="url(#metalGrad)" strokeWidth="2.6" />
                  </svg>

                  {/* 2. Swinging Unit: Clasp Hook, Top Badge Tab & Card (Swings from hook at top) */}
                  <div
                    className="id-card-swinging-unit"
                    ref={idCardRef}
                    onPointerEnter={handleIdCardPointerEnter}
                    onPointerMove={handleIdCardPointerMove}
                    onPointerLeave={handleIdCardPointerLeave}
                    onPointerDown={handleIdCardPointerDown}
                    onPointerUp={handleIdCardPointerUp}
                    onPointerCancel={handleIdCardPointerUp}
                  >
                    <svg className="id-card-clasp-tag-svg" viewBox="0 0 380 94" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <defs>
                        <linearGradient id="metalGrad2" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#48485C" />
                          <stop offset="30%" stopColor="#262632" />
                          <stop offset="70%" stopColor="#5C5C74" />
                          <stop offset="100%" stopColor="#1A1A24" />
                        </linearGradient>
                        <linearGradient id="tabGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1C1C26" />
                          <stop offset="100%" stopColor="#0D0D11" />
                        </linearGradient>
                      </defs>

                      {/* Hook / Clasp Assembly (Origin pivot: Y=6) */}
                      <path d="M 186 2 L 194 2 Q 196 8 190 8 Q 184 8 186 2 Z" fill="none" stroke="url(#metalGrad2)" strokeWidth="2.4" />

                      {/* Swivel Joint Collar */}
                      <rect x="184" y="7" width="12" height="8" rx="2" fill="url(#metalGrad2)" stroke="#767692" strokeWidth="0.8" />
                      <circle cx="190" cy="11" r="1.5" fill="#FF1E27" />

                      {/* Main Clasp Body */}
                      <path d="M 183 15 L 197 15 L 195 32 L 185 32 Z" fill="url(#metalGrad2)" stroke="#666680" strokeWidth="0.8" />
                      <line x1="186" y1="19" x2="194" y2="19" stroke="#12121A" strokeWidth="1" />
                      <line x1="186" y1="22" x2="194" y2="22" stroke="#12121A" strokeWidth="1" />
                      <line x1="186" y1="25" x2="194" y2="25" stroke="#12121A" strokeWidth="1" />

                      {/* Side thumb release lever */}
                      <path d="M 183 18 L 177 23 L 183 26 Z" fill="#2A2A38" stroke="#FF1E27" strokeWidth="0.8" />

                      {/* ID Badge Top Tab (Centered at X=190, Width=168, Y: 40..94) */}
                      <path d="M 106 94 L 134 44 Q 136 40 142 40 L 238 40 Q 244 40 246 44 L 274 94 Z"
                            fill="url(#tabGrad)" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />

                      {/* Vermillion Accent along top edge of tab */}
                      <path d="M 142 40 L 238 40" stroke="#FF1E27" strokeWidth="2.2" strokeLinecap="round" />

                      {/* Left Circular Hole */}
                      <circle cx="156" cy="55" r="5" fill="#080808" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
                      {/* Right Circular Hole */}
                      <circle cx="224" cy="55" r="5" fill="#080808" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />

                      {/* Center Oblong Slot */}
                      <rect x="172" y="48.5" width="36" height="13" rx="6.5" fill="#080808" stroke="rgba(255,255,255,0.28)" strokeWidth="1" />

                      {/* Hook looping through center slot */}
                      <path d="M 187 32 L 187 50 Q 187 56 190 56 Q 193 56 193 50 L 193 32" fill="none" stroke="#14141E" strokeWidth="3.2" />
                      <path d="M 187 36 L 187 54 Q 187 58 190 58 Q 193 58 193 54 L 193 36" fill="none" stroke="url(#metalGrad2)" strokeWidth="3.2" strokeLinecap="round" />
                      <path d="M 188.5 44 L 188.5 54" stroke="rgba(255,255,255,0.7)" strokeWidth="1" strokeLinecap="round" />
                    </svg>

                  <div className="swiss-poster-frame">
                    {/* Top Technical Metadata */}
                    <div className="poster-top-bar">
                      <span className="poster-header-code">PROFILE SPOTLIGHT</span>
                      <span className="poster-header-uid">● VERIFIED PORTFOLIO</span>
                    </div>

                    {/* Main Portrait Canvas with Crisp Corner Brackets */}
                    <div className="poster-canvas-box">
                      <div className="poster-corner-mark mark-tl"></div>
                      <div className="poster-corner-mark mark-tr"></div>
                      <div className="poster-corner-mark mark-bl"></div>
                      <div className="poster-corner-mark mark-br"></div>

                      {imageIndex < profileImages.length ? (
                        <img
                          src={profileImages[imageIndex]}
                          alt="Charan Sai Barnikani"
                          className="poster-profile-img"
                          onError={() => setImageIndex((prev) => prev + 1)}
                        />
                      ) : (
                        <div className="poster-fallback-box">
                          <i className="fa-solid fa-user-gear poster-fallback-icon"></i>
                          <h4 style={{ color: '#fff', fontFamily: 'var(--font-heading)' }}>CHARAN SAI BARNIKANI</h4>
                          <span style={{ color: 'var(--vermillion)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>B.TECH AIML</span>
                        </div>
                      )}
                    </div>

                    {/* Poster Specification Footer */}
                    <div className="poster-spec-footer">
                      <div className="poster-spec-row">
                        <span className="poster-spec-title">CHARAN SAI BARNIKANI</span>
                        <span className="poster-spec-title" style={{ color: 'var(--vermillion)' }}>B.TECH AIML</span>
                      </div>
                      <div className="poster-spec-row">
                        <span className="poster-subinfo">SRKR ENGINEERING COLLEGE</span>
                        <span className="poster-subinfo">CLASS OF 2027</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            2. FEATURED PROJECTS SECTION (ARCHITECTURAL SPEC POSTERS)
            ========================================================================== */}
        <section id="projects" className="section-block section-alt">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-layer-group"></i> 02 // BUILDS &amp; PLATFORMS
                </span>
                <h2 className="section-title">FEATURED PROJECTS</h2>
              </div>
              <p className="section-desc">
                Production full-stack web applications, AI systems, and cloud deployments built for real-world impact.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="filter-tab-bar">
              {['All', 'Web Development', 'AI & Machine Learning', 'Quantum Computing', 'Digital Twin & Systems', 'Mobile & IoT'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  [{cat.toUpperCase()}]
                </button>
              ))}
            </div>

            {/* Swiss Poster Project Cards Grid */}
            <div className="projects-grid">
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="project-card-swiss cyber-card-frame">
                  <div className="cyber-card-inner">
                    {/* Corner Targeting Crosshairs (Images 1 & 2) */}
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    {/* Top Angled Cyber Ribbon Header */}
                    <div className="cyber-card-header">
                      <div className="cyber-header-banner">
                        <span className="project-index-num">[{proj.index}]</span>
                      </div>
                      <div className="cyber-header-badge-col">
                        <span className="project-badge-tag">{proj.badgeText}</span>
                        <div className="cyber-hazard-stripes" aria-hidden="true"></div>
                      </div>
                    </div>

                    <div className="project-card-body">
                      <div className="project-category-row">
                        <span className="project-category-sub">{proj.category}</span>
                      </div>
                      <h3 className="project-title-swiss">{proj.title}</h3>
                      <p className="project-desc-swiss">{proj.description}</p>

                      <ul className="project-features-block">
                        {proj.features.map((feat, fIdx) => (
                          <li key={fIdx}>
                            <i className="fa-solid fa-angles-right" style={{ color: '#FF1E27', fontSize: '0.72rem' }}></i>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="project-tags-matrix">
                        {proj.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="tech-pill">{tag}</span>
                        ))}
                      </div>
                    </div>

                    <div className="project-card-footer cyber-card-footer">
                      {proj.demoLink ? (
                        <a
                          href={proj.demoLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-action-btn btn-demo-swiss cyber-btn-left"
                        >
                          <span>LAUNCH DEMO</span>
                          <i className="fa-solid fa-arrow-up-right-from-square"></i>
                        </a>
                      ) : (
                        <span
                          className="project-action-btn btn-demo-disabled cyber-btn-left"
                          title="Live demonstration not configured for this repository"
                        >
                          <span>NOT CONFIGURED</span>
                          <i className="fa-solid fa-ban"></i>
                        </span>
                      )}
                      <a
                        href={proj.codeLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-action-btn btn-code-swiss cyber-btn-right"
                      >
                        <i className="fa-brands fa-github"></i>
                        <span>SOURCE CODE</span>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            3. EDUCATION & FOUNDATION
            ========================================================================== */}
        <section id="education" className="section-block">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-graduation-cap"></i> 03 // EDUCATION
                </span>
                <h2 className="section-title">ACADEMIC FOUNDATION</h2>
              </div>
              <p className="section-desc">
                Rigorous degree curriculum with specialization in Artificial Intelligence, Machine Learning algorithms, and computer science foundations.
              </p>
            </div>

            <div className="education-swiss-card cyber-card-frame cyber-card-wide">
              <div className="cyber-card-inner">
                {/* 4 Corner Targeting Crosshairs */}
                <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                {/* Top Cyber Ribbon */}
                <div className="cyber-card-header">
                  <div className="cyber-header-banner">
                    <span className="project-index-num">[ACAD_03]</span>
                  </div>
                  <div className="cyber-header-badge-col">
                    <span className="project-badge-tag">AIML // 2023-2027</span>
                    <div className="cyber-hazard-stripes" aria-hidden="true"></div>
                  </div>
                </div>

                <div className="edu-grid-content">
                  <div className="edu-primary-info">
                    <div className="edu-badge-tag">
                      <i className="fa-solid fa-certificate"></i> B.TECH DEGREE PROGRAM
                    </div>
                    <h3 className="edu-degree-title">Artificial Intelligence & Machine Learning</h3>
                    <div className="edu-institution">S R K R Engineering College, Bhimavaram</div>
                    <div className="edu-cgpa-box">
                      <span>ACADEMIC PERFORMANCE:</span>
                      <span className="cgpa-highlight">9.12 CGPA / 10</span>
                    </div>
                  </div>

                  <div className="edu-disciplines-list">
                    <div className="discipline-item">
                      <i className="fa-solid fa-microchip"></i>
                      <span>Artificial Intelligence & ML</span>
                    </div>
                    <div className="discipline-item">
                      <i className="fa-solid fa-network-wired"></i>
                      <span>Deep Learning & Neural Nets</span>
                    </div>
                    <div className="discipline-item">
                      <i className="fa-solid fa-code-merge"></i>
                      <span>Data Structures & Algorithms</span>
                    </div>
                    <div className="discipline-item">
                      <i className="fa-solid fa-database"></i>
                      <span>Database Management (DBMS)</span>
                    </div>
                    <div className="discipline-item">
                      <i className="fa-solid fa-cubes"></i>
                      <span>Object-Oriented Programming</span>
                    </div>
                    <div className="discipline-item">
                      <i className="fa-solid fa-server"></i>
                      <span>Computer Networks (CN)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            4. TECHNICAL SKILLS (MODULAR MATRIX)
            ========================================================================== */}
        <section id="skills" className="section-block section-alt">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-sliders"></i> 04 // SKILLS &amp; STACK
                </span>
                <h2 className="section-title">CAPABILITIES MATRIX</h2>
              </div>
              <p className="section-desc">
                Organized matrix spanning full-stack frameworks, deep learning, databases, languages, and core computer science.
              </p>
            </div>

            <div className="skills-matrix-grid">
              {skillCategories.map((cat, cIdx) => (
                <div key={cIdx} className="skill-matrix-box cyber-card-frame">
                  <div className="cyber-card-inner skill-box-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="skill-box-header">
                      <div className="skill-box-icon">
                        <i className={cat.icon}></i>
                      </div>
                      <h3 className="skill-box-title">{cat.category}</h3>
                      <div className="cyber-hazard-stripes" style={{ width: '32px', marginLeft: 'auto' }} aria-hidden="true"></div>
                    </div>

                    <div className="skill-pills-wrap">
                      {cat.skills.map((skill, sIdx) => (
                        <span key={sIdx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            5. EXPERIENCE & RESEARCH TIMELINE
            ========================================================================== */}
        <section id="experience" className="section-block">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-briefcase"></i> 05 // EXPERIENCE &amp; RESEARCH
                </span>
                <h2 className="section-title">EXPERIENCE & RESEARCH</h2>
              </div>
              <p className="section-desc">
                Hands-on engineering across deep learning battery research, full-stack systems development, and industry fellowship.
              </p>
            </div>

            <div className="timeline-swiss-list">
              {internships.map((item) => (
                <div key={item.id} className="timeline-node-card cyber-card-frame">
                  <div className="cyber-card-inner timeline-node-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="timeline-aside">
                      <span className="timeline-period-tag">{item.period}</span>
                      <span className="timeline-type-tag">{item.type}</span>
                      <div className="cyber-hazard-stripes" style={{ width: '42px', marginTop: '12px' }} aria-hidden="true"></div>
                    </div>

                    <div className="timeline-main">
                      <h3 className="timeline-role-title">{item.role}</h3>
                      <span className="timeline-org-name">{item.organization}</span>

                      <ul className="timeline-bullets-list">
                        {item.highlights.map((bullet, bIdx) => (
                          <li key={bIdx} className="timeline-bullet-item">
                            <i className="fa-solid fa-angles-right" style={{ color: '#FF1E27', fontSize: '0.72rem' }}></i>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            6. ACHIEVEMENTS & RECOGNITION
            ========================================================================== */}
        <section id="achievements" className="section-block section-alt">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-trophy"></i> 06 // HONORS &amp; AWARDS
                </span>
                <h2 className="section-title">RECOGNITION & HONORS</h2>
              </div>
              <p className="section-desc">
                National hackathon victories, innovation citations, competitive milestones, and verified credentials.
              </p>
            </div>

            {/* Achievements Grid */}
            <div className="achievements-swiss-grid">
              {achievements.map((ach, aIdx) => (
                <div key={aIdx} className="achievement-swiss-box cyber-card-frame">
                  <div className="cyber-card-inner achievement-box-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="achievement-icon-square">
                      <i className={ach.icon}></i>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span className="achievement-tag-pill">{ach.tag}</span>
                        <div className="cyber-hazard-stripes" style={{ width: '32px' }} aria-hidden="true"></div>
                      </div>
                      <h4 className="achievement-title-text">{ach.title}</h4>
                      <p className="achievement-desc-text">{ach.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications Sub-Grid */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', color: '#fff', marginBottom: '20px', textTransform: 'uppercase' }}>
              <i className="fa-solid fa-file-shield" style={{ color: 'var(--vermillion)', marginRight: '8px' }}></i>
              VERIFIED CREDENTIALS
            </h3>
            <div className="certifications-swiss-grid">
              {certifications.map((cert, cIdx) => (
                <div key={cIdx} className="cert-swiss-card cyber-card-frame">
                  <div className="cyber-card-inner cert-card-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="cert-top-row">
                      <i className={`${cert.icon} cert-icon-mini`}></i>
                      <h4 className="cert-name">{cert.title}</h4>
                    </div>
                    <span className="cert-issuer-tag">{cert.issuer}</span>
                    <p className="cert-info-p">{cert.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            7. CONTACT & COMMUNICATE SECTION
            ========================================================================== */}
        <section id="contact" className="section-block">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-regular fa-paper-plane"></i> 07 // DIRECT CONTACT
                </span>
                <h2 className="section-title">GET IN TOUCH</h2>
              </div>
              <p className="section-desc">
                Open to software engineering roles, technical internships, and impactful collaborative projects.
              </p>
            </div>

            <div className="contact-swiss-grid">
              {/* Left Coordinates Panel */}
              <div className="contact-spec-panel">
                <div className="contact-coord-card cyber-card-frame">
                  <div className="cyber-card-inner contact-coord-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="coord-icon">
                      <i className="fa-regular fa-envelope"></i>
                    </div>
                    <div>
                      <div className="coord-label">DIRECT EMAIL</div>
                      <div className="coord-val">charan06082004@gmail.com</div>
                      <button onClick={copyEmailToClipboard} className="btn-copy-chip">
                        <i className="fa-regular fa-copy"></i> COPY EMAIL
                      </button>
                    </div>
                  </div>
                </div>

                <div className="contact-coord-card cyber-card-frame">
                  <div className="cyber-card-inner contact-coord-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="coord-icon">
                      <i className="fa-solid fa-phone"></i>
                    </div>
                    <div>
                      <div className="coord-label">PHONE</div>
                      <div className="coord-val">+91 6302695484</div>
                      <button onClick={copyPhoneToClipboard} className="btn-copy-chip">
                        <i className="fa-regular fa-copy"></i> COPY PHONE
                      </button>
                    </div>
                  </div>
                </div>

                <div className="contact-coord-card cyber-card-frame">
                  <div className="cyber-card-inner contact-coord-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="coord-icon">
                      <i className="fa-solid fa-location-crosshairs"></i>
                    </div>
                    <div>
                      <div className="coord-label">LOCATION</div>
                      <div className="coord-val">Rajahmundry, AP, 533105</div>
                      <div className="coord-sub">India • Open to Relocation & Remote Engagements</div>
                    </div>
                  </div>
                </div>

                <div className="contact-coord-card cyber-card-frame">
                  <div className="cyber-card-inner contact-coord-inner">
                    <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                    <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                    <div className="coord-icon">
                      <i className="fa-solid fa-network-wired"></i>
                    </div>
                    <div>
                      <div className="coord-label">PROFILES &amp; SOCIALS</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <a href="https://www.linkedin.com/in/charan-sai-barnikani/" target="_blank" rel="noreferrer" className="skill-badge" style={{ color: 'var(--vermillion)' }}>
                          <i className="fa-brands fa-linkedin-in"></i> LinkedIn
                        </a>
                        <a href="https://github.com/Charan-718" target="_blank" rel="noreferrer" className="skill-badge" style={{ color: 'var(--vermillion)' }}>
                          <i className="fa-brands fa-github"></i> GitHub
                        </a>
                        <a href="https://leetcode.com/u/Charan_0608/" target="_blank" rel="noreferrer" className="skill-badge" style={{ color: 'var(--vermillion)' }}>
                          <i className="fa-solid fa-code"></i> LeetCode
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Form Terminal */}
              <div className="contact-form-swiss cyber-card-frame cyber-card-wide">
                <div className="cyber-card-inner">
                  {/* 4 Corner Targeting Crosshairs */}
                  <span className="cyber-corner-bracket bracket-tl" aria-hidden="true"></span>
                  <span className="cyber-corner-bracket bracket-tr" aria-hidden="true"></span>
                  <span className="cyber-corner-bracket bracket-bl" aria-hidden="true"></span>
                  <span className="cyber-corner-bracket bracket-br" aria-hidden="true"></span>

                  {/* Form Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-hairline)',
                    background: 'rgba(0, 0, 0, 0.45)',
                    position: 'relative',
                    zIndex: 2
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 10px #22c55e', flexShrink: 0 }}></span>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.08em', color: '#ffffff', whiteSpace: 'nowrap' }}>
                        SEND A DIRECT MESSAGE
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <span className="project-badge-tag">FAST RESPONSE</span>
                    </div>
                  </div>

                  <div className="contact-form-body">
                    <form onSubmit={handleFormSubmit}>
                      <div className="form-row">
                        <div className="form-group">
                          <label className="form-label-swiss" htmlFor="name">
                            YOUR NAME <span className="req-star">*</span>
                          </label>
                          <input
                            id="name"
                            type="text"
                            required
                            placeholder="e.g. Hiring Lead / Recruiter"
                            className="form-control-swiss"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label-swiss" htmlFor="email">
                            YOUR EMAIL <span className="req-star">*</span>
                          </label>
                          <input
                            id="email"
                            type="email"
                            required
                            placeholder="e.g. recruiter@company.com"
                            className="form-control-swiss"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label-swiss" htmlFor="subject">
                          SUBJECT / TOPIC
                        </label>
                        <input
                          id="subject"
                          type="text"
                          placeholder="e.g. Software Engineering Opportunity / Collaboration"
                          className="form-control-swiss"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label-swiss" htmlFor="message">
                          YOUR MESSAGE <span className="req-star">*</span>
                        </label>
                        <textarea
                          id="message"
                          required
                          rows="4"
                          placeholder="Hi Charan, we would like to discuss an engineering opportunity regarding your background in Full-Stack and AI/ML..."
                          className="form-control-swiss textarea-swiss"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        ></textarea>
                      </div>

                      <button type="submit" className="btn-submit-swiss" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span>SENDING MESSAGE...</span>
                            <i className="fa-solid fa-spinner fa-spin"></i>
                          </>
                        ) : (
                          <>
                            <span>SEND MESSAGE</span>
                            <i className="fa-solid fa-arrow-right"></i>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==========================================================================
          FOOTER (SWISS ARCHITECTURAL BASELINE)
          ========================================================================== */}
      <footer className="site-footer-swiss">
        <div className="container">
          <div className="footer-flex-row">
            <div>
              <div className="footer-logo-title">CHARAN SAI BARNIKANI</div>
              <div className="footer-sub-text">B.TECH IN ARTIFICIAL INTELLIGENCE &amp; MACHINE LEARNING • SRKR ENGINEERING COLLEGE</div>
            </div>

            <div className="footer-nav-items">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="footer-link-btn"
                >
                  [{item.label}]
                </button>
              ))}
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© {new Date().getFullYear()} CHARAN SAI BARNIKANI. ALL SPECIFICATIONS RESERVED.</span>
            <span>CHARAN SAI BARNIKANI // PORTFOLIO v2.6</span>
          </div>
        </div>
      </footer>

      {/* Technical HUD Toast Notification */}
      {toastMessage && (
        <div className="toast-swiss-hud">
          <i className="fa-solid fa-terminal"></i>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FLOATING 3D CHARACTER QUICK-LAUNCH CARD (MINIMAL 1:1 SQUARE WITH SPIDER-WEB LINK) */}
      <SpideyWebHero onOpenArena={openCharacterArena} />
    </div>
  );
}

export default App;
