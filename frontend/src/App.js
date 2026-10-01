import React, { useState, useEffect } from 'react';
import './index.css';

const ROLES = [
  'Full-Stack Developer',
  'AI & Deep Learning Enthusiast',
  'B.Tech AIML Student (9.12 CGPA)',
  'React, Node.js & Python Engineer'
];

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [activeFilter, setActiveFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Image error handling to support charan_profile.png or fallback
  const [imageIndex, setImageIndex] = useState(0);
  const profileImages = [
    `${process.env.PUBLIC_URL}/charan_profile.png`,
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
    let typingSpeed = isDeleting ? 30 : 75;

    if (!isDeleting && displayedText === currentRole) {
      typingSpeed = 2200;
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

  // Copy Email to Clipboard with Toast Notification
  const copyEmailToClipboard = () => {
    navigator.clipboard.writeText('charan06082004@gmail.com');
    showToast('Email copied to clipboard: charan06082004@gmail.com');
  };

  // Copy Phone to Clipboard
  const copyPhoneToClipboard = () => {
    navigator.clipboard.writeText('+91 6302695484');
    showToast('Phone number copied to clipboard: +91 6302695484');
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showToast('Please fill in all required fields.');
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
        showToast('Thank you! Your message has been sent directly to Charan.');
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        showToast(data.error || 'Failed to deliver message. Please email directly.');
      }
    } catch (err) {
      console.error('Contact form submission error:', err);
      showToast('Note: Make sure backend server is running, or email directly.');
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

  // The 3 Projects from Charan's Resume with Live Links & Repositories
  const allProjects = [
    {
      id: 1,
      title: 'DayFlow — Full-Stack Employee Management and HRMS Platform',
      category: 'Web Development',
      badgeText: 'FULL-STACK HRMS & RBAC',
      description: 'Comprehensive enterprise HRMS platform designed for streamlined employee administration, attendance tracking, time-off requests, and workforce analytics.',
      impact: 'Implemented role-based access control (RBAC), JWT authentication, modular REST API architecture, and Docker containerization.',
      tags: ['React.js', 'TypeScript', 'TailwindCSS', 'Node.js', 'Express.js', 'PostgreSQL', 'Prisma', 'Docker'],
      demoLink: 'https://day-flow-six.vercel.app/',
      codeLink: 'https://github.com/Charan-718/Day-Flow',
      features: [
        'Role-based access control (RBAC) & secure JWT authentication',
        'Employee profile management, attendance workflows & time-off approvals',
        'Scalable REST APIs with PostgreSQL, Prisma ORM, and Docker deployment'
      ]
    },
    {
      id: 2,
      title: 'Traveloop — AI-Powered Smart Travel Planning Platform',
      category: 'AI & Next-Gen',
      badgeText: 'AI TRAVEL PLATFORM',
      description: 'React-based intelligent travel planning platform featuring AI-powered personalized itinerary generation, interactive budget dashboards, and curated destination discovery.',
      impact: 'Built dynamic map integrations, responsive UI components, and API-driven personalized travel planning flows.',
      tags: ['React.js', 'JavaScript', 'Node.js', 'Express.js', 'PostgreSQL', 'AI APIs'],
      demoLink: 'https://traveloop-plum.vercel.app/',
      codeLink: 'https://github.com/mounikakorrakuti1/traveloop',
      features: [
        'AI-driven custom itinerary generation based on user preferences',
        'Interactive map integration for real-time location and route discovery',
        'Budget tracking dashboards and robust PostgreSQL backend workflows'
      ]
    },
    {
      id: 3,
      title: 'Sahakãrya — Cooperative Gig Services Platform',
      category: 'Web & Mobile',
      badgeText: 'COOPERATIVE GIG PLATFORM',
      description: 'Decentralized cooperative gig-services platform connecting customers with local service workers through transparent pricing, intelligent worker matching, and welfare-fund contributions.',
      impact: 'Engineered role-based workflows and scalable backend services using REST APIs, PostgreSQL/PostGIS, Prisma, and an AI service with Docker containerization.',
      tags: ['React.js', 'React Native', 'Node.js', 'Express.js', 'TypeScript', 'Python', 'FastAPI', 'PostgreSQL', 'PostGIS', 'Prisma', 'Docker'],
      demoLink: 'https://sahakarya.vercel.app/',
      codeLink: 'https://github.com/Kouhsik33/Cooperative-Gig-Services-Platform',
      features: [
        'Intelligent worker matching and geospatial location search using PostGIS',
        'Real-time service booking, transparent pricing, and worker welfare fund system',
        'FastAPI AI microservice and Express backend containerized with Docker'
      ]
    }
  ];

  const filteredProjects = activeFilter === 'All'
    ? allProjects
    : allProjects.filter((p) => p.category === activeFilter);

  // Technical Skills from Charan's Resume
  const skillCategories = [
    {
      category: 'Frontend Development',
      icon: 'fa-solid fa-code',
      skills: ['React.js', 'React Native', 'TypeScript', 'JavaScript (ES6+)', 'HTML5 & CSS3', 'TailwindCSS', 'Bootstrap', 'Responsive Design']
    },
    {
      category: 'Backend & Microservices',
      icon: 'fa-solid fa-server',
      skills: ['Node.js', 'Express.js', 'Python', 'FastAPI', 'RESTful APIs', 'Prisma ORM', 'JWT Authentication']
    },
    {
      category: 'AI / ML & Deep Learning',
      icon: 'fa-solid fa-brain',
      skills: ['Machine Learning', 'Deep Learning', 'EIS Data Modeling', 'Feature Engineering', 'Nyquist Visualizations', 'Multi-Agent AI Systems']
    },
    {
      category: 'Databases & Storage',
      icon: 'fa-solid fa-database',
      skills: ['PostgreSQL', 'PostGIS', 'MongoDB', 'SQL', 'Database Schema Design']
    },
    {
      category: 'Programming Languages',
      icon: 'fa-solid fa-terminal',
      skills: ['Python', 'JavaScript', 'TypeScript', 'C', 'C++', 'Java', 'SQL']
    },
    {
      category: 'Tools, DevOps & Platforms',
      icon: 'fa-solid fa-screwdriver-wrench',
      skills: ['Docker', 'Git & GitHub', 'Vercel', 'Postman', 'VS Code', 'Linux']
    },
    {
      category: 'Computer Science Fundamentals',
      icon: 'fa-solid fa-network-wired',
      skills: ['Data Structures & Algorithms (DSA)', 'Object-Oriented Programming (OOP)', 'Database Management (DBMS)', 'Computer Networks (CN)']
    }
  ];

  // Internships & Experience from Charan's Resume
  const internships = [
    {
      id: 1,
      period: 'Jun 2025 — Aug 2025',
      role: 'Deep Learning Intern',
      organization: 'AICTE IdeaLab',
      type: 'Deep Learning Internship',
      highlights: [
        'Built machine learning and deep learning models for battery State of Charge (SOC) and State of Health (SOH) estimation using Electrochemical Impedance Spectroscopy (EIS) data.',
        'Extracted key frequency-domain features and developed Nyquist spectrum visualizations to analyze complex degradation patterns across discharge cycles.',
        'Engineered predictive regression pipelines optimizing electrochemical feature representation for real-time battery analytics.'
      ]
    },
    {
      id: 2,
      period: 'Jan 2024 — Present',
      role: 'Full-Stack & AI/ML Fellow',
      organization: 'NxtWave Disruptive Technologies',
      type: 'CCBP 4.0 Industry Ready Program',
      highlights: [
        'Completed intensive industry-ready certification in Full-Stack Web Development, Data Structures & Algorithms, and AI/ML.',
        'Solved 800+ algorithmic coding challenges across Python, C++, and JavaScript, and developed 300+ full-stack hands-on exercises and web modules.'
      ]
    }
  ];

  // Certifications from Charan's Resume
  const certifications = [
    {
      title: 'Industry Ready Certification in Full-Stack & AI/ML',
      issuer: 'NxtWave Disruptive Technologies',
      icon: 'fa-solid fa-certificate',
      desc: 'Comprehensive credential covering React, Node.js, Express, PostgreSQL, SQL, Python, and Data Structures & Algorithms.'
    },
    {
      title: 'Deep Learning & EIS Modeling Credential',
      issuer: 'AICTE IdeaLab',
      icon: 'fa-solid fa-brain',
      desc: 'Research and engineering credential for battery SOC/SOH estimation models and Nyquist frequency-domain feature analysis.'
    },
    {
      title: '1st Prize Winner – Prakalp Hackathon 2026',
      issuer: 'Prakalp 2026, Eluru',
      icon: 'fa-solid fa-trophy',
      desc: 'Recognized for engineering Critique & Improve (IDEA ARENA), a real-time multi-agent AI platform for iterative idea refinement.'
    },
    {
      title: 'Grand Finals Winner – AQVH 2025',
      issuer: 'Amaravati Quantum Valley Hackathon',
      icon: 'fa-solid fa-award',
      desc: 'Secured 1st place in Grand Finals for creating an innovative quantum computing solution addressing real-world challenges.'
    }
  ];

  // Achievements from Charan's Resume
  const achievements = [
    {
      title: '1st Prize – Prakalp Hackathon 2026, Eluru',
      tag: '1st Place Winner',
      icon: 'fa-solid fa-trophy',
      desc: 'Won 1st place for developing Critique & Improve — IDEA ARENA, a real-time multi-agent AI platform for iterative idea refinement.'
    },
    {
      title: 'Winner – Amaravati Quantum Valley Hackathon (AQVH) 2025',
      tag: 'Grand Finals Champion',
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

  // Navigation Links
  const navLinks = [
    { id: 'hero', label: 'Home' },
    { id: 'projects', label: 'Projects' },
    { id: 'education', label: 'Education' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'contact', label: 'Contact' }
  ];

  return (
    <div className="portfolio-app">
      {/* Scroll Progress Bar at Top */}
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }}></div>

      {/* Clean Navbar */}
      <header className="header-nav">
        <div className="container">
          <div className="nav-container">
            <button
              onClick={() => scrollToSection('hero')}
              className="logo-brand"
              aria-label="Charan Sai Barnikani Portfolio"
            >
              <div className="logo-badge" title="Charan Sai Barnikani — AI/ML & Full-Stack Engineer">
                <i className="fa-solid fa-code" style={{ fontSize: '15px', color: 'var(--text-primary)' }}></i>
              </div>
              <div className="logo-text">
                Charan<span className="logo-dot">.</span>
              </div>
            </button>

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
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="nav-actions">
              <a
                href="https://github.com/Charan-718"
                target="_blank"
                rel="noreferrer"
                className="btn-outline-sm"
                title="GitHub Profile"
              >
                <i className="fa-brands fa-github"></i>
                <span className="hide-on-mobile">GitHub</span>
              </a>

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

      {/* MAIN CONTENT */}
      <main className="main-content">
        {/* ==========================================================================
            1. HERO SECTION (Charan Sai Barnikani Profile)
            ========================================================================== */}
        <section id="hero" className="section-hero">
          <div className="container">
            <div className="hero-grid">
              {/* Left Column: Bio & Value Proposition */}
              <div className="hero-content">
                <div className="status-pill">
                  <span className="status-dot"></span>
                  <span className="status-text">Open to Tech Internships & Software Engineering Roles</span>
                </div>

                <h1 className="hero-title">
                  Charan Sai <span className="hero-name-highlight">Barnikani</span>
                </h1>

                <div className="hero-typed-role">
                  <span className="role-prefix">I am a</span>
                  <span className="role-text">{displayedText}</span>
                  <span className="role-cursor">|</span>
                </div>

                <p className="hero-summary">
                  Artificial Intelligence & Machine Learning undergraduate at <strong>S R K R Engineering College</strong> with a <strong>9.12 CGPA</strong>. 
                  Passionate about engineering scalable full-stack applications with React, TypeScript, Node.js, and PostgreSQL, building predictive deep learning models, and architecting multi-agent AI systems.
                </p>

                {/* Key Impact Metrics Strip */}
                <div className="hero-metrics-strip">
                  <div className="metric-item">
                    <span className="metric-value">9.12</span>
                    <span className="metric-label">CGPA / 10</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-value">3x</span>
                    <span className="metric-label">Hackathon Winner</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-value">800+</span>
                    <span className="metric-label">DSA Solved</span>
                  </div>
                  <div className="metric-divider"></div>
                  <div className="metric-item">
                    <span className="metric-value">3+</span>
                    <span className="metric-label">Core Projects</span>
                  </div>
                </div>

                {/* Hero CTAs */}
                <div className="hero-actions">
                  <button onClick={() => scrollToSection('projects')} className="btn-primary">
                    <span>View Projects</span>
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>

                  <a
                    href="https://leetcode.com/u/Charan_0608/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                  >
                    <i className="fa-solid fa-code"></i>
                    <span>LeetCode Profile</span>
                  </a>

                  <button onClick={copyEmailToClipboard} className="btn-outline" title="Copy Email">
                    <i className="fa-regular fa-copy"></i>
                    <span>Copy Email</span>
                  </button>
                </div>

                {/* Direct Social & Technical Links */}
                <div className="hero-social-links">
                  <span className="social-label">Connect:</span>
                  <a href="https://github.com/Charan-718" target="_blank" rel="noreferrer" className="social-link" title="GitHub (Charan-718)">
                    <i className="fa-brands fa-github"></i>
                  </a>
                  <a href="https://www.linkedin.com/in/charan-sai-barnikani/" target="_blank" rel="noreferrer" className="social-link" title="LinkedIn (charan-sai-barnikani)">
                    <i className="fa-brands fa-linkedin-in"></i>
                  </a>
                  <a href="https://leetcode.com/u/Charan_0608/" target="_blank" rel="noreferrer" className="social-link" title="LeetCode (Charan_0608)">
                    <i className="fa-solid fa-terminal"></i>
                  </a>
                  <a href="mailto:charan06082004@gmail.com" className="social-link" title="Email (charan06082004@gmail.com)">
                    <i className="fa-regular fa-envelope"></i>
                  </a>
                </div>
              </div>

              {/* Right Column: Hero Photo Container */}
              <div className="hero-media">
                <div className="photo-frame-container">
                  <div className="photo-card">
                    {/* Portrait Image with Dynamic Fallback */}
                    {imageIndex < profileImages.length ? (
                      <img
                        src={profileImages[imageIndex]}
                        alt="Charan Sai Barnikani"
                        className="hero-profile-image"
                        onError={() => setImageIndex((prev) => prev + 1)}
                      />
                    ) : (
                      <div className="photo-placeholder-fallback">
                        <div className="placeholder-avatar">
                          <i className="fa-solid fa-user-graduate"></i>
                        </div>
                        <p className="placeholder-text">Charan Sai Barnikani</p>
                        <span className="placeholder-subtext">B.Tech AIML • 9.12 CGPA</span>
                      </div>
                    )}

                    {/* Overlay Info Card */}
                    <div className="photo-badge-overlay">
                      <div className="photo-badge-dot"></div>
                      <div>
                        <div className="photo-badge-title">Charan Sai Barnikani</div>
                        <div className="photo-badge-subtitle">B.Tech AIML • S R K R Engineering College</div>
                      </div>
                    </div>

                    {/* Floating Exp Pill */}
                    <div className="floating-exp-tag">
                      <i className="fa-solid fa-award"></i>
                      <span>CGPA: 9.12 / 10</span>
                    </div>
                  </div>

                  {/* Clean Background Frame Accent */}
                  <div className="photo-frame-backdrop"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            2. FEATURED PROJECTS SECTION
            ========================================================================== */}
        <section id="projects" className="section-block section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Featured Work</span>
              <h2 className="section-title">Core Engineered Projects</h2>
              <p className="section-desc">
                Full-stack web applications, AI platforms, and microservices with live deployments and repositories.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="filter-tab-bar">
              {['All', 'Web Development', 'AI & Next-Gen', 'Web & Mobile'].map((cat) => (
                <button
                  key={cat}
                  className={`filter-tab-btn ${activeFilter === cat ? 'active' : ''}`}
                  onClick={() => setActiveFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* The 3 Featured Projects Grid */}
            <div className="projects-grid">
              {filteredProjects.map((proj) => (
                <div key={proj.id} className="project-card">
                  <div className="project-card-header">
                    <span className="project-badge">{proj.badgeText}</span>
                    <span className="project-category-label">{proj.category}</span>
                  </div>

                  <div className="project-card-body">
                    <h3 className="project-title">{proj.title}</h3>
                    <p className="project-desc">{proj.description}</p>

                    {proj.impact && (
                      <div className="project-impact-box">
                        <i className="fa-solid fa-award"></i>
                        <span>{proj.impact}</span>
                      </div>
                    )}

                    {proj.features && (
                      <ul className="project-feature-list">
                        {proj.features.map((feat, fIdx) => (
                          <li key={fIdx}>
                            <i className="fa-solid fa-circle-dot"></i>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="project-tags-wrap">
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="project-tech-tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  <div className="project-card-footer">
                    <a
                      href={proj.demoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-primary"
                    >
                      <span>Live Demo</span>
                      <i className="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                    <a
                      href={proj.codeLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="project-link-secondary"
                    >
                      <i className="fa-brands fa-github"></i>
                      <span>Source Code</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            3. EDUCATION SECTION
            ========================================================================== */}
        <section id="education" className="section-block">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Academic Background</span>
              <h2 className="section-title">Education & Foundation</h2>
              <p className="section-desc">
                Solid academic excellence and deep theoretical foundation in Artificial Intelligence and Machine Learning.
              </p>
            </div>

            <div className="education-card-wrapper">
              <div className="education-main-card">
                <div className="education-header">
                  <div className="edu-icon-badge">
                    <i className="fa-solid fa-graduation-cap"></i>
                  </div>
                  <div className="edu-header-text">
                    <h3 className="edu-degree">B.Tech in Artificial Intelligence and Machine Learning</h3>
                    <div className="edu-college">S R K R Engineering College, Bhimavaram</div>
                  </div>
                  <div className="edu-meta-badge">
                    <span className="edu-period">2023 — 2027</span>
                    <span className="edu-cgpa-pill">
                      <i className="fa-solid fa-star"></i> CGPA: 9.12 / 10
                    </span>
                  </div>
                </div>

                <div className="edu-details-body">
                  <h4 className="edu-subheading">Core Academic & Technical Disciplines:</h4>
                  <div className="edu-tags-grid">
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Artificial Intelligence & Machine Learning (AI/ML)</span>
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Deep Learning & Neural Networks</span>
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Data Structures & Algorithms (DSA)</span>
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Database Management Systems (DBMS)</span>
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Object-Oriented Programming (OOP)</span>
                    <span className="edu-tag"><i className="fa-solid fa-check"></i> Computer Networks (CN)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================================================
            4. TECHNICAL SKILLS SECTION
            ========================================================================== */}
        <section id="skills" className="section-block section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Technical Competencies</span>
              <h2 className="section-title">Skills & Technologies</h2>
              <p className="section-desc">
                Organized technical toolkit spanning full-stack web engineering, AI/ML models, databases, and languages.
              </p>
            </div>

            <div className="skills-categorized-grid">
              {skillCategories.map((group, gIdx) => (
                <div key={gIdx} className="skill-category-card">
                  <div className="category-header">
                    <div className="category-icon">
                      <i className={group.icon}></i>
                    </div>
                    <h3 className="category-title">{group.category}</h3>
                  </div>

                  <div className="skill-tags-list">
                    {group.skills.map((skill, sIdx) => (
                      <div key={sIdx} className="skill-pill-item">
                        <i className="fa-solid fa-check"></i>
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            5. INTERNSHIPS & EXPERIENCE
            ========================================================================== */}
        <section id="experience" className="section-block">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Industry Experience</span>
              <h2 className="section-title">Internships & Fellowships</h2>
              <p className="section-desc">
                Hands-on development experience across deep learning research, full-stack architectures, and industry programs.
              </p>
            </div>

            <div className="timeline-container">
              {internships.map((exp) => (
                <div key={exp.id} className="timeline-card">
                  <div className="timeline-meta">
                    <span className="timeline-period">{exp.period}</span>
                    <span className="timeline-type-badge">{exp.type}</span>
                  </div>

                  <div className="timeline-content">
                    <div className="timeline-header-row">
                      <h3 className="timeline-role">{exp.role}</h3>
                      <span className="timeline-company">{exp.organization}</span>
                    </div>

                    <ul className="timeline-bullets">
                      {exp.highlights.map((bullet, bIdx) => (
                        <li key={bIdx} className="timeline-bullet-item">
                          <i className="fa-solid fa-circle-check"></i>
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
            6. ACHIEVEMENTS & CERTIFICATIONS
            ========================================================================== */}
        <section id="achievements" className="section-block section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Recognition & Credentials</span>
              <h2 className="section-title">Achievements & Certifications</h2>
              <p className="section-desc">
                National hackathon victories, innovation awards, competitive milestones, and verified credentials.
              </p>
            </div>

            {/* Achievements Grid */}
            <h3 className="sub-section-title">
              <i className="fa-solid fa-trophy"></i> Key Achievements
            </h3>
            <div className="achievements-grid">
              {achievements.map((ach, aIdx) => (
                <div key={aIdx} className="achievement-card">
                  <div className="achievement-icon-wrap">
                    <i className={ach.icon}></i>
                  </div>
                  <div>
                    <span className="achievement-tag">{ach.tag}</span>
                    <h4 className="achievement-title">{ach.title}</h4>
                    <p className="achievement-desc">{ach.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications Grid */}
            <h3 className="sub-section-title" style={{ marginTop: '3rem' }}>
              <i className="fa-solid fa-file-shield"></i> Verified Certifications
            </h3>
            <div className="certifications-grid">
              {certifications.map((cert, cIdx) => (
                <div key={cIdx} className="cert-card">
                  <div className="cert-header">
                    <div className="cert-icon">
                      <i className={cert.icon}></i>
                    </div>
                    <div>
                      <h4 className="cert-title">{cert.title}</h4>
                      <span className="cert-issuer">{cert.issuer}</span>
                    </div>
                  </div>
                  <p className="cert-desc">{cert.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ==========================================================================
            7. CONTACT SECTION
            ========================================================================== */}
        <section id="contact" className="section-block">
          <div className="container">
            <div className="section-header">
              <span className="section-eyebrow">Contact Charan</span>
              <h2 className="section-title">Let's Connect & Collaborate</h2>
              <p className="section-desc">
                Feel free to reach out directly for internships, collaborative engineering projects, or full-time opportunities.
              </p>
            </div>

            <div className="contact-grid">
              {/* Left Contact Info */}
              <div className="contact-info-panel">
                <div className="contact-card">
                  <div className="contact-card-icon">
                    <i className="fa-regular fa-envelope"></i>
                  </div>
                  <div>
                    <div className="contact-card-label">Email Address</div>
                    <div className="contact-card-value">charan06082004@gmail.com</div>
                    <button onClick={copyEmailToClipboard} className="btn-copy-inline">
                      <i className="fa-regular fa-copy"></i>
                      <span>Click to copy email</span>
                    </button>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <i className="fa-solid fa-phone"></i>
                  </div>
                  <div>
                    <div className="contact-card-label">Contact Number</div>
                    <div className="contact-card-value">+91 6302695484</div>
                    <button onClick={copyPhoneToClipboard} className="btn-copy-inline">
                      <i className="fa-regular fa-copy"></i>
                      <span>Click to copy phone</span>
                    </button>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <i className="fa-solid fa-location-dot"></i>
                  </div>
                  <div>
                    <div className="contact-card-label">Location</div>
                    <div className="contact-card-value">Rajahmundry, Andhra Pradesh, 533105</div>
                    <div className="contact-card-sub">India • Open to Relocation & Remote Roles</div>
                  </div>
                </div>

                <div className="contact-card">
                  <div className="contact-card-icon">
                    <i className="fa-solid fa-globe"></i>
                  </div>
                  <div>
                    <div className="contact-card-label">Profiles & Coding Platforms</div>
                    <div className="social-pill-row">
                      <a href="https://www.linkedin.com/in/charan-sai-barnikani/" target="_blank" rel="noreferrer" className="contact-social-pill">
                        <i className="fa-brands fa-linkedin-in"></i>
                        <span>LinkedIn</span>
                      </a>
                      <a href="https://github.com/Charan-718" target="_blank" rel="noreferrer" className="contact-social-pill">
                        <i className="fa-brands fa-github"></i>
                        <span>GitHub</span>
                      </a>
                      <a href="https://leetcode.com/u/Charan_0608/" target="_blank" rel="noreferrer" className="contact-social-pill">
                        <i className="fa-solid fa-terminal"></i>
                        <span>LeetCode</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Contact Form */}
              <div className="contact-form-panel">
                <form onSubmit={handleFormSubmit} className="contact-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label" htmlFor="name">Your Name <span className="req">*</span></label>
                      <input
                        id="name"
                        type="text"
                        required
                        placeholder="e.g. Hiring Manager / Recruiter"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="email">Your Email <span className="req">*</span></label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="e.g. recruiter@company.com"
                        className="form-control"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="e.g. Software Engineering Opportunity / Internship"
                      className="form-control"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>

                  <div className="form-group form-group-message">
                    <label className="form-label" htmlFor="message">Message <span className="req">*</span></label>
                    <textarea
                      id="message"
                      required
                      rows="4"
                      placeholder="Hi Charan, we would like to discuss an engineering opportunity regarding your background in Full-Stack and AI/ML..."
                      className="form-control textarea"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary btn-submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <span>Sending...</span>
                        <i className="fa-solid fa-spinner fa-spin"></i>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <i className="fa-solid fa-paper-plane"></i>
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
          FOOTER
          ========================================================================== */}
      <footer className="site-footer">
        <div className="container">
          <div className="footer-flex">
            <div className="footer-left">
              <div className="footer-logo">Charan Sai Barnikani<span>.</span></div>
              <p className="footer-tagline">B.Tech AIML • S R K R Engineering College</p>
            </div>

            <div className="footer-links">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="footer-nav-link"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="footer-copy">
              © {new Date().getFullYear()} Charan Sai Barnikani.
            </div>
          </div>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <i className="fa-solid fa-circle-check"></i>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
