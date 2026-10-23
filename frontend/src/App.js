import React, { useState, useEffect } from 'react';
import './index.css';
import CharacterPlayground from './components/CharacterPlayground';
import {
  initGlobalButtonSounds,
  isSoundEnabled,
  toggleSound,
  onSoundStateChange,
  playClickSound,
} from './utils/soundEffects';

const ROLES = [
  'Full-Stack Developer',
  'AI & Deep Learning Enthusiast',
  'B.Tech AIML Student (9.12 CGPA)',
  'React, Node.js & Python Engineer'
];

function InitialBlankCurtain({ onComplete, maskId = 'heroCutoutMask' }) {
  const [isSweeping, setIsSweeping] = useState(false);

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
      if (onComplete) onComplete();
    }, 3200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

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
  const [soundActive, setSoundActive] = useState(() => isSoundEnabled());
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

  // Initialize global button click sounds (< 1s tactile feedback) and subscribe to mute/unmute
  useEffect(() => {
    const cleanupSounds = initGlobalButtonSounds();
    const unsubscribe = onSoundStateChange((enabled) => setSoundActive(enabled));
    return () => {
      cleanupSounds();
      unsubscribe();
    };
  }, []);
  // Image handling for charan_profile.png with fallbacks
  const [imageIndex, setImageIndex] = useState(0);
  const profileImages = [
    `${process.env.PUBLIC_URL}/charan_professional_profile.png`,
    `${process.env.PUBLIC_URL}/profile.jpg`,
    `${process.env.PUBLIC_URL}/profile.png`
  ];

  // Dynamic Typed Text
  const [currentRoleIndex, setCurrentRoleIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Contact Form State
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      title: 'DayFlow — Full-Stack HRMS & Workforce Platform',
      category: 'Web Development',
      filterGroup: 'Web Development',
      badgeText: 'SPEC_01 // HRMS & RBAC',
      description: 'Enterprise full-stack Human Resource Management System engineered for workforce administration, real-time attendance tracking, time-off approvals, and organizational analytics.',
      impact: 'Architected role-based access control (RBAC), JWT security layer, modular REST endpoints, and Docker deployment.',
      tags: ['React.js', 'TypeScript', 'TailwindCSS', 'Node.js', 'Express.js', 'PostgreSQL', 'Prisma', 'Docker'],
      demoLink: 'https://day-flow-six.vercel.app/',
      codeLink: 'https://github.com/Charan-718/Day-Flow',
      features: [
        'Multi-tier RBAC & JSON Web Token authentication system',
        'Attendance lifecycle, time-off approvals & organizational dashboard metrics',
        'Modular REST API layer with PostgreSQL, Prisma ORM & Docker containerization'
      ]
    },
    {
      id: 2,
      index: '02',
      title: 'Traveloop — AI-Powered Smart Travel Planning Platform',
      category: 'AI & Next-Gen',
      filterGroup: 'AI & Machine Learning',
      badgeText: 'SPEC_02 // AI TRAVEL ENGINE',
      description: 'Intelligent trip generation and exploration platform featuring AI-driven custom itinerary synthesis, interactive budget telemetry, and location discovery.',
      impact: 'Constructed responsive map integrations, dynamic planning workflows, and predictive recommendation pipelines.',
      tags: ['React.js', 'JavaScript', 'Node.js', 'Express.js', 'PostgreSQL', 'AI APIs'],
      demoLink: 'https://traveloop-plum.vercel.app/',
      codeLink: 'https://github.com/mounikakorrakuti1/traveloop',
      features: [
        'AI-driven custom multi-day itinerary generation tailored to user preferences',
        'Interactive geospatial map integration for real-time waypoint routing',
        'Dynamic budget forecasting and PostgreSQL transactional database schema'
      ]
    },
    {
      id: 3,
      index: '03',
      title: 'Sahakãrya — Cooperative Gig Services Platform',
      category: 'Web & Mobile',
      filterGroup: 'Mobile & IoT',
      badgeText: 'SPEC_03 // GIG PLATFORM',
      description: 'Decentralized cooperative gig-services platform connecting customers with local service workers through transparent pricing models, intelligent dispatch matching, and worker welfare fund contributions.',
      impact: 'Engineered scalable microservice backends with PostGIS geospatial queries, FastAPI AI service, and Docker containerization.',
      tags: ['React.js', 'React Native', 'Node.js', 'Express.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'Prisma', 'Docker'],
      demoLink: 'https://sahakarya.vercel.app/',
      codeLink: 'https://github.com/Kouhsik33/Cooperative-Gig-Services-Platform',
      features: [
        'Intelligent dispatch matching with geospatial spatial indexing via PostGIS',
        'Real-time job bookings, transparent ledger pricing & worker welfare fund integration',
        'Cross-platform React/React Native clients powered by FastAPI AI microservice'
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
        <CharacterPlayground onClose={closeCharacterArena} />
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
      {/* Top Scroll Progress Indicator */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Top Technical HUD System Strip */}
      <div className="top-system-strip">
        <div className="container">
          <div className="system-strip-inner">
            <div className="system-node-item">
              <span className="live-beacon"></span>
              <span>SYSTEM: ACTIVE // SRKR.AIML.2027</span>
            </div>
            <div className="system-node-item hide-on-mobile">
              <span>LAT: 16.5448° N &nbsp;•&nbsp; LON: 81.5212° E</span>
            </div>
            <div className="system-node-item">
              <span>PORTFOLIO_SPEC // v2.6 [SWISS_GRID]</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Swiss Navigation Header */}
      <header className="header-nav">
        <div className="container">
          <div className="nav-container">
            {/* Brand Logo with Geometric Swiss Square */}
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

              <a
                href="https://github.com/Charan-718"
                target="_blank"
                rel="noreferrer"
                className="btn-nav-action"
                title="GitHub Repository"
              >
                <i className="fa-brands fa-github"></i>
                <span className="hide-on-mobile">GITHUB</span>
              </a>

              {/* Sound Controls Button */}
              <button
                onClick={toggleSound}
                className="btn-nav-action btn-nav-icon-only"
                title={soundActive ? 'UI Sound Effects Active (Click to Mute)' : 'UI Sound Effects Muted (Click to Enable)'}
                style={{
                  cursor: 'pointer',
                  background: soundActive ? 'rgba(255, 30, 39, 0.12)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${soundActive ? '#FF1E27' : 'rgba(255, 255, 255, 0.16)'}`,
                  color: soundActive ? '#FF6B72' : '#94a3b8',
                  transition: 'all 0.2s ease',
                }}
                data-sound="switch"
                aria-label={soundActive ? 'Mute Sound' : 'Enable Sound'}
              >
                <i className={soundActive ? 'fa-solid fa-volume-high' : 'fa-solid fa-volume-xmark'}></i>
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
          <span className="marquee-item">SWISS GRID ARCHITECTURE <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">FULL-STACK HRMS PLATFORM <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">DEEP LEARNING EIS BATTERY MODELING <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">3X NATIONAL HACKATHON CHAMPION <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">REACT & TYPESCRIPT <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">NODE.JS & POSTGRESQL / POSTGIS <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">800+ CODING CHALLENGES SOLVED <span className="marquee-bullet">■</span></span>
          <span className="marquee-item">SWISS GRID ARCHITECTURE <span className="marquee-bullet">■</span></span>
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
            1. HERO SECTION (SWISS MODULAR POSTER GRID)
            ========================================================================== */}
        <section id="hero" className="section-hero">
          <div className="container">
            <div className="hero-grid">
              {/* Left Column: Monumental Typographic Display */}
              <div className="hero-content">
                <div className="spec-header-tag">
                  <span className="spec-code">[SPEC_ID: 718-CHR]</span>
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
                  <button onClick={() => scrollToSection('projects')} className="btn-primary">
                    <span>EXPLORE ARCHITECTURE</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>

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
                  <span className="social-strip-label">NETWORK COORD:</span>
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

              {/* Right Column: Swiss Exhibition Poster Media Frame */}
              <div className="hero-media">
                <div className="swiss-poster-frame">
                  {/* Top Technical Metadata */}
                  <div className="poster-top-bar">
                    <span className="poster-header-code">[PRO_GRID // 01]</span>
                    <span className="poster-header-uid">UID: CHR-718-AIML</span>
                  </div>

                  {/* Main Portrait Canvas with Diagonal Crosshair Guide & Corner Brackets */}
                  <div className="poster-canvas-box">
                    <div className="poster-grid-cross"></div>
                    <div className="poster-corner-mark mark-tl"></div>
                    <div className="poster-corner-mark mark-tr"></div>
                    <div className="poster-corner-mark mark-bl"></div>
                    <div className="poster-corner-mark mark-br"></div>
                    <div className="poster-watermark-text">AIML</div>

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
                        <span style={{ color: 'var(--vermillion)', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>B.TECH AIML • 9.12 CGPA</span>
                      </div>
                    )}
                  </div>

                  {/* Poster Specification Footer */}
                  <div className="poster-spec-footer">
                    <div className="poster-spec-row">
                      <span className="poster-spec-title">CHARAN SAI BARNIKANI</span>
                      <span className="poster-spec-val">CGPA: 9.12</span>
                    </div>
                    <div className="poster-spec-row">
                      <span className="poster-subinfo">SRKR ENGINEERING COLLEGE // AIML</span>
                      <span className="poster-subinfo">2023 — 2027</span>
                    </div>

                    <div className="poster-barcode-wrap">
                      <div className="poster-barcode" aria-hidden="true">
                        <span className="bar"></span>
                        <span className="bar thick"></span>
                        <span className="bar"></span>
                        <span className="bar red"></span>
                        <span className="bar"></span>
                        <span className="bar thick"></span>
                        <span className="bar red"></span>
                        <span className="bar"></span>
                        <span className="bar thick"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar thick red"></span>
                        <span className="bar"></span>
                      </div>
                      <span className="poster-subinfo">BARCODE // 6302695484</span>
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
                  <i className="fa-solid fa-layer-group"></i> SECTION_02 // SYSTEM BUILDS
                </span>
                <h2 className="section-title">ENGINEERED PLATFORMS</h2>
              </div>
              <p className="section-desc">
                Production full-stack web applications, AI planning architectures, and containerized microservices with live deployments.
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
                <div key={proj.id} className="project-card-swiss">
                  <div className="project-card-top">
                    <span className="project-index-num">[{proj.index}]</span>
                    <span className="project-badge-tag">{proj.badgeText}</span>
                  </div>

                  <div className="project-card-body">
                    <span className="project-category-sub">{proj.category}</span>
                    <h3 className="project-title-swiss">{proj.title}</h3>
                    <p className="project-desc-swiss">{proj.description}</p>

                    <ul className="project-features-block">
                      {proj.features.map((feat, fIdx) => (
                        <li key={fIdx}>
                          <i className="fa-solid fa-angle-right"></i>
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

                  <div className="project-card-footer">
                    {proj.demoLink ? (
                      <a
                        href={proj.demoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="project-action-btn btn-demo-swiss"
                      >
                        <span>LAUNCH DEMO</span>
                        <i className="fa-solid fa-arrow-up-right-from-square"></i>
                      </a>
                    ) : (
                      <span
                        className="project-action-btn btn-demo-disabled"
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
                      className="project-action-btn btn-code-swiss"
                    >
                      <i className="fa-brands fa-github"></i>
                      <span>SOURCE CODE</span>
                    </a>
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
                  <i className="fa-solid fa-graduation-cap"></i> SECTION_03 // FOUNDATION
                </span>
                <h2 className="section-title">ACADEMIC FOUNDATION</h2>
              </div>
              <p className="section-desc">
                Rigorous degree curriculum with specialization in Artificial Intelligence, Machine Learning algorithms, and computer science foundations.
              </p>
            </div>

            <div className="education-swiss-card">
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
        </section>

        {/* ==========================================================================
            4. TECHNICAL SKILLS (MODULAR MATRIX)
            ========================================================================== */}
        <section id="skills" className="section-block section-alt">
          <div className="container">
            <div className="section-header-swiss">
              <div>
                <span className="section-eyebrow-tag">
                  <i className="fa-solid fa-sliders"></i> SECTION_04 // TOOLKIT
                </span>
                <h2 className="section-title">CAPABILITIES MATRIX</h2>
              </div>
              <p className="section-desc">
                Organized matrix spanning full-stack frameworks, deep learning, databases, languages, and core computer science.
              </p>
            </div>

            <div className="skills-matrix-grid">
              {skillCategories.map((cat, cIdx) => (
                <div key={cIdx} className="skill-matrix-box">
                  <div className="skill-box-header">
                    <div className="skill-box-icon">
                      <i className={cat.icon}></i>
                    </div>
                    <h3 className="skill-box-title">{cat.category}</h3>
                  </div>

                  <div className="skill-pills-wrap">
                    {cat.skills.map((skill, sIdx) => (
                      <span key={sIdx} className="skill-badge">{skill}</span>
                    ))}
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
                  <i className="fa-solid fa-briefcase"></i> SECTION_05 // TRAJECTORY
                </span>
                <h2 className="section-title">EXPERIENCE & RESEARCH</h2>
              </div>
              <p className="section-desc">
                Hands-on engineering across deep learning battery research, full-stack systems development, and industry fellowship.
              </p>
            </div>

            <div className="timeline-swiss-list">
              {internships.map((item) => (
                <div key={item.id} className="timeline-node-card">
                  <div className="timeline-aside">
                    <span className="timeline-period-tag">{item.period}</span>
                    <span className="timeline-type-tag">{item.type}</span>
                  </div>

                  <div className="timeline-main">
                    <h3 className="timeline-role-title">{item.role}</h3>
                    <span className="timeline-org-name">{item.organization}</span>

                    <ul className="timeline-bullets-list">
                      {item.highlights.map((bullet, bIdx) => (
                        <li key={bIdx} className="timeline-bullet-item">
                          <i className="fa-solid fa-circle-dot"></i>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
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
                  <i className="fa-solid fa-trophy"></i> SECTION_06 // MILESTONES
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
                <div key={aIdx} className="achievement-swiss-box">
                  <div className="achievement-icon-square">
                    <i className={ach.icon}></i>
                  </div>
                  <div>
                    <span className="achievement-tag-pill">{ach.tag}</span>
                    <h4 className="achievement-title-text">{ach.title}</h4>
                    <p className="achievement-desc-text">{ach.desc}</p>
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
                <div key={cIdx} className="cert-swiss-card">
                  <div className="cert-top-row">
                    <i className={`${cert.icon} cert-icon-mini`}></i>
                    <h4 className="cert-name">{cert.title}</h4>
                  </div>
                  <span className="cert-issuer-tag">{cert.issuer}</span>
                  <p className="cert-info-p">{cert.desc}</p>
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
                  <i className="fa-solid fa-terminal"></i> SECTION_07 // COMMUNICATE
                </span>
                <h2 className="section-title">INITIATE CONTACT</h2>
              </div>
              <p className="section-desc">
                Direct communication terminal for software engineering roles, technical internships, and collaborative architecture projects.
              </p>
            </div>

            <div className="contact-swiss-grid">
              {/* Left Coordinates Panel */}
              <div className="contact-spec-panel">
                <div className="contact-coord-card">
                  <div className="coord-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <div>
                    <div className="coord-label">PRIMARY INBOX</div>
                    <div className="coord-val">charan06082004@gmail.com</div>
                    <button onClick={copyEmailToClipboard} className="btn-copy-chip">
                      <i className="fa-regular fa-copy"></i> [CLICK TO COPY]
                    </button>
                  </div>
                </div>

                <div className="contact-coord-card">
                  <div className="coord-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div className="coord-label">TELECOMMUNICATION</div>
                    <div className="coord-val">+91 6302695484</div>
                    <button onClick={copyPhoneToClipboard} className="btn-copy-chip">
                      <i className="fa-regular fa-copy"></i> [CLICK TO COPY]
                    </button>
                  </div>
                </div>

                <div className="contact-coord-card">
                  <div className="coord-icon">
                    <i className="fa-solid fa-location-crosshairs"></i>
                  </div>
                  <div>
                    <div className="coord-label">LOCATION COORD</div>
                    <div className="coord-val">Rajahmundry, AP, 533105</div>
                    <div className="coord-sub">India • Open to Relocation & Remote Engagements</div>
                  </div>
                </div>

                <div className="contact-coord-card">
                  <div className="coord-icon">
                    <i className="fa-solid fa-network-wired"></i>
                  </div>
                  <div>
                    <div className="coord-label">PROFILES & PLATFORMS</div>
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

              {/* Right Form Terminal */}
              <div className="contact-form-swiss">
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
                      MESSAGE TRANSMISSION <span className="req-star">*</span>
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
                        <span>TRANSMITTING...</span>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      </>
                    ) : (
                      <>
                        <span>DISPATCH MESSAGE</span>
                        <i className="fa-solid fa-arrow-right"></i>
                      </>
                    )}
                  </button>
                </form>
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
              <div className="footer-sub-text">B.TECH AIML // S R K R ENGINEERING COLLEGE // 9.12 CGPA</div>
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
            <span>SYSTEM_BUILD // SWISS_GRID_v2.6</span>
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

      {/* FLOATING 3D CHARACTER PLAYGROUND QUICK-LAUNCH PILL */}
      <button
        onClick={openCharacterArena}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 90,
          background: 'linear-gradient(135deg, #FF1E27 0%, #B70A11 100%)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: '50px',
          padding: '12px 22px',
          fontWeight: 800,
          fontSize: '0.92rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(255, 30, 39, 0.45)',
          transition: 'all 0.25s ease',
          fontFamily: 'var(--font-heading)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px) scale(1.03)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 30, 39, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 30, 39, 0.45)';
        }}
        aria-label="Play 3D Character Workspace"
      >
        <i className="fa-solid fa-cube" style={{ fontSize: '1.15rem' }}></i>
        <span>Play 3D Character</span>
      </button>
    </div>
  );
}

export default App;
