import React from 'react';

/**
 * HeroCircuitBackground — Cybernetic Red PCB Circuit Lines for Hero Section
 * Inspired by cyberpunk vector schematics, high-tech PCB trace lines, and technical blueprint aesthetics.
 * Preserves the Obsidian (#080808) & Swiss Vermillion (#FF1E27) palette.
 */
export default function HeroCircuitBackground() {
  return (
    <div className="hero-circuit-container" aria-hidden="true">
      <svg
        className="hero-circuit-svg"
        viewBox="0 0 1440 900"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle Ambient Radial Vermillion Glow */}
          <radialGradient id="circuitAmbientGlow" cx="60%" cy="48%" r="55%">
            <stop offset="0%" stopColor="rgba(255, 30, 39, 0.08)" />
            <stop offset="40%" stopColor="rgba(255, 30, 39, 0.02)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          {/* Neon Vermillion Glow Filter */}
          <filter id="circuitGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Ambient Glow Backdrop */}
        <rect width="100%" height="100%" fill="url(#circuitAmbientGlow)" />

        {/* ==========================================================================
            1. TOP LEFT: INDUCTOR COIL & MAIN HIGH-SPEED TRACE BUS
            ========================================================================== */}
        {/* Spring Inductor Coil Pattern (Matching Reference Cyberpunk Schematic) */}
        <g transform="translate(170, 48)">
          <path
            d="M 0,16 Q 6,0 12,16 Q 18,32 24,16 Q 30,0 36,16 Q 42,32 48,16 Q 54,0 60,16 Q 66,32 72,16 Q 78,0 84,16 Q 90,32 96,16 Q 102,0 108,16"
            fill="none"
            stroke="#FF1E27"
            strokeOpacity="0.35"
            strokeWidth="1.5"
          />
          <line x1="-28" y1="16" x2="0" y2="16" stroke="#FF1E27" strokeOpacity="0.3" strokeWidth="1.2" />
          <line x1="108" y1="16" x2="136" y2="16" stroke="#FF1E27" strokeOpacity="0.3" strokeWidth="1.2" />
          <circle cx="-28" cy="16" r="2.8" className="circuit-node-dot" />
          <circle cx="136" cy="16" r="2.8" className="circuit-node-dot" />
        </g>

        {/* Top Left Primary Circuit Highway (45-degree angle chamfered path) */}
        <path
          className="circuit-trace-accent"
          d="M 0,84 L 140,84 L 180,124 L 360,124 L 390,94 L 560,94 L 590,124 L 680,124"
        />
        {/* Continuous Animated Data Packet Pulse 1 */}
        <path
          className="circuit-pulse pulse-fast"
          d="M 0,84 L 140,84 L 180,124 L 360,124 L 390,94 L 560,94 L 590,124 L 680,124"
        />

        {/* Parallel Secondary Traces (multi-lane bus) */}
        <path
          className="circuit-trace-base"
          d="M 0,100 L 130,100 L 165,135 L 330,135 L 355,110 L 510,110"
        />
        <path
          className="circuit-trace-base"
          d="M 0,116 L 120,116 L 150,146 L 270,146 L 295,171 L 440,171"
        />

        {/* Branch Lines with Terminal Pads */}
        <path className="circuit-trace-base" d="M 360,124 L 385,149 L 470,149" />
        <circle cx="470" cy="149" r="3.5" className="circuit-node-dot" />
        <circle cx="560" cy="94" r="3.2" className="circuit-node-ring" />
        <circle cx="680" cy="124" r="4" className="circuit-node-dot" />
        <circle cx="510" cy="110" r="3.2" className="circuit-node-ring" />
        <circle cx="440" cy="171" r="3.5" className="circuit-node-dot" />

        {/* Micro-Via Pin Array (Vertical Column of Test Pads) */}
        <g transform="translate(54, 210)">
          <line x1="0" y1="0" x2="0" y2="160" stroke="#FF1E27" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="0" cy="0" r="2.8" className="circuit-node-dot" />
          <circle cx="0" cy="20" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="40" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="60" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="80" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="100" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="120" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="140" r="2.2" className="circuit-node-dot" />
          <circle cx="0" cy="160" r="2.8" className="circuit-node-dot" />
          {/* Branching trace from pin 4 */}
          <path className="circuit-trace-base" d="M 0,60 L 26,60 L 46,80 L 120,80" />
          <circle cx="120" cy="80" r="3.2" className="circuit-node-ring" />
        </g>

        {/* Top Technical Metadata Markings */}
        <text x="64" y="74" className="circuit-label-text">{"// SYS_BUS.01 [CLK 48MHz]"}</text>
        <text x="480" y="86" className="circuit-label-text">{"0x718 // CHARAN.CORE"}</text>

        {/* ==========================================================================
            2. CENTER SECTION: 3-LANE PARALLEL INTERCONNECT HIGHWAY
            ========================================================================== */}
        <g>
          {/* Lane 1 (Accent with animated pulse) */}
          <path
            className="circuit-trace-accent"
            d="M 510,310 L 640,310 L 700,370 L 810,370 L 850,330 L 950,330"
          />
          <path
            className="circuit-pulse pulse-mid"
            d="M 510,310 L 640,310 L 700,370 L 810,370 L 850,330 L 950,330"
          />

          {/* Lane 2 (Mid) */}
          <path
            className="circuit-trace-base"
            d="M 495,325 L 630,325 L 685,380 L 800,380 L 835,345 L 935,345"
          />

          {/* Lane 3 (Inner) */}
          <path
            className="circuit-trace-base"
            d="M 480,340 L 620,340 L 670,390 L 790,390 L 820,360 L 920,360"
          />

          {/* Terminal Pads */}
          <circle cx="950" cy="330" r="4" className="circuit-node-dot" />
          <circle cx="935" cy="345" r="3.2" className="circuit-node-ring" />
          <circle cx="920" cy="360" r="3.5" className="circuit-node-dot" />
        </g>

        {/* Center Alignment Crosshairs */}
        <g transform="translate(670, 240)">
          <line x1="-14" y1="0" x2="14" y2="0" stroke="#FF1E27" strokeOpacity="0.32" strokeWidth="1" />
          <line x1="0" y1="-14" x2="0" y2="14" stroke="#FF1E27" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="0" cy="0" r="6.5" stroke="#FF1E27" strokeOpacity="0.22" fill="none" strokeWidth="0.9" />
        </g>
        <g transform="translate(780, 520)">
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#FF1E27" strokeOpacity="0.25" strokeWidth="0.8" />
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#FF1E27" strokeOpacity="0.25" strokeWidth="0.8" />
        </g>

        {/* ==========================================================================
            3. BOTTOM LEFT: METRICS BOUNDARY TECH BRACKET & BUSES
            ========================================================================== */}
        {/* Chamfered 45-degree Technical Framing Box (Cyberpunk Card Perimeter) */}
        <path
          className="circuit-trace-subtle"
          d="M 48,465 L 78,435 L 485,435 L 515,465 L 515,720 L 485,750 L 78,750 L 48,720 Z"
          strokeDasharray="16, 7, 5, 7"
        />

        {/* High-Contrast Chamfered Corner Chevrons */}
        <path d="M 42,488 L 42,460 L 68,434 L 105,434" fill="none" stroke="#FF1E27" strokeOpacity="0.48" strokeWidth="1.8" />
        <path d="M 521,488 L 521,460 L 495,434 L 458,434" fill="none" stroke="#FF1E27" strokeOpacity="0.48" strokeWidth="1.8" />
        <path d="M 42,698 L 42,725 L 68,751 L 105,751" fill="none" stroke="#FF1E27" strokeOpacity="0.48" strokeWidth="1.8" />
        <path d="M 521,698 L 521,725 L 495,751 L 458,751" fill="none" stroke="#FF1E27" strokeOpacity="0.48" strokeWidth="1.8" />

        {/* Bottom Bus Traces Running Along Footer */}
        <path
          className="circuit-trace-base"
          d="M 0,815 L 160,815 L 210,765 L 390,765 L 420,795 L 630,795"
        />
        <circle cx="630" cy="795" r="4" className="circuit-node-dot" />
        <path className="circuit-trace-base" d="M 210,765 L 240,735 L 330,735" />
        <circle cx="330" cy="735" r="3.2" className="circuit-node-ring" />

        <text x="76" y="774" className="circuit-label-text">{"// CORE.METRICS.SPEC [CGPA_9.12]"}</text>

        {/* ==========================================================================
            4. RIGHT SIDE: CYBERPUNK MOTHERBOARD FRAME & ID BADGE CONTOUR
            ========================================================================== */}
        {/* Large Chamfered Motherboard Frame with 45° Notched Corners */}
        <path
          className="circuit-trace-subtle"
          d="M 915,75 L 1345,75 L 1385,115 L 1385,765 L 1345,805 L 915,805 L 875,765 L 875,115 Z"
          strokeDasharray="22, 8, 8, 8"
        />

        {/* Heavy Corner L-Chevrons */}
        <path d="M 865,150 L 865,110 L 905,70 L 955,70" fill="none" stroke="#FF1E27" strokeOpacity="0.55" strokeWidth="2.2" />
        <path d="M 1395,150 L 1395,110 L 1355,70 L 1305,70" fill="none" stroke="#FF1E27" strokeOpacity="0.55" strokeWidth="2.2" />
        <path d="M 865,725 L 865,770 L 905,810 L 955,810" fill="none" stroke="#FF1E27" strokeOpacity="0.55" strokeWidth="2.2" />
        <path d="M 1395,725 L 1395,770 L 1355,810 L 1305,810" fill="none" stroke="#FF1E27" strokeOpacity="0.55" strokeWidth="2.2" />

        {/* IC Chip Lead Pinout Arrays (Matching Reference Image 2) */}
        <g transform="translate(1385, 235)">
          {[0, 14, 28, 42, 56, 70, 84, 98, 112, 126, 140].map((y) => (
            <line
              key={y}
              x1="0"
              y1={y}
              x2="18"
              y2={y}
              stroke="#FF1E27"
              strokeOpacity="0.32"
              strokeWidth="1.5"
            />
          ))}
        </g>

        {/* Upper Right Sweeping Circuit Trace into Badge Zone */}
        <path
          className="circuit-trace-accent"
          d="M 1440,105 L 1250,105 L 1200,155 L 1070,155 L 1030,195 L 990,195"
        />
        {/* Animated Pulse 3 */}
        <path
          className="circuit-pulse pulse-slow"
          d="M 1440,105 L 1250,105 L 1200,155 L 1070,155 L 1030,195 L 990,195"
        />
        <circle cx="990" cy="195" r="4.2" className="circuit-node-dot" />

        {/* Parallel Secondary Traces */}
        <path
          className="circuit-trace-base"
          d="M 1440,121 L 1260,121 L 1215,166 L 1090,166 L 1060,196 L 1010,196"
        />
        <circle cx="1010" cy="196" r="3.2" className="circuit-node-ring" />

        {/* Trace Contouring the Right of the Hanging Badge */}
        <path
          className="circuit-trace-accent"
          d="M 1320,255 L 1270,255 L 1240,285 L 1240,540 L 1210,570 L 1060,570 L 1020,610 L 975,610"
        />
        <circle cx="1320" cy="255" r="3.5" className="circuit-node-dot" />
        <circle cx="975" cy="610" r="4.2" className="circuit-node-dot" />

        {/* Lower Right PCB Bus Highway Entering from Screen Border */}
        <path
          className="circuit-trace-accent"
          d="M 1440,705 L 1300,705 L 1240,765 L 1040,765 L 1000,805 L 870,805"
        />
        <path
          className="circuit-trace-base"
          d="M 1440,721 L 1310,721 L 1255,776 L 1055,776 L 1015,816 L 885,816"
        />
        <path
          className="circuit-trace-base"
          d="M 1440,737 L 1320,737 L 1270,787 L 1070,787 L 1030,827 L 900,827"
        />
        <circle cx="870" cy="805" r="4.2" className="circuit-node-dot" />
        <circle cx="885" cy="816" r="3.2" className="circuit-node-ring" />
        <circle cx="900" cy="827" r="3.2" className="circuit-node-dot" />

        {/* Technical Barcode / Scale Markings (Reference Image 2) */}
        <g transform="translate(1120, 782)">
          <line x1="0" y1="0" x2="0" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="1.2" />
          <line x1="4" y1="0" x2="4" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="2.6" />
          <line x1="10" y1="0" x2="10" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="15" y1="0" x2="15" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="3.2" />
          <line x1="22" y1="0" x2="22" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="1.5" />
          <line x1="28" y1="0" x2="28" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="1" />
          <line x1="33" y1="0" x2="33" y2="9" stroke="#FF1E27" strokeOpacity="0.45" strokeWidth="2.2" />
        </g>

        {/* Right Technical Annotations */}
        <text x="960" y="65" className="circuit-label-text">{"// NEURAL_ARCH [SRKR-AIML]"}</text>
        <text x="1250" y="695" className="circuit-label-text">{"PCB_CORE // REV 4.2"}</text>
        <text x="1400" y="390" className="circuit-label-text" transform="rotate(90, 1400, 390)">
          DATA_BUS // 12-LANE
        </text>

        {/* Technical Crosshairs on Right */}
        <g transform="translate(1200, 155)">
          <circle cx="0" cy="0" r="5.5" stroke="#FF1E27" strokeOpacity="0.42" fill="none" strokeWidth="1" />
          <line x1="-9" y1="0" x2="9" y2="0" stroke="#FF1E27" strokeOpacity="0.35" strokeWidth="0.8" />
          <line x1="0" y1="-9" x2="0" y2="9" stroke="#FF1E27" strokeOpacity="0.35" strokeWidth="0.8" />
        </g>
      </svg>
    </div>
  );
}
