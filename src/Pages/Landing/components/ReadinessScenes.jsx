import React from "react";

// Bespoke animated vector scenes tailored for the Business Readiness expanded bento cards.
// Proportional, expressive, and optimized to fit the expanded card with subtle CSS keyframe animations.

export function CacRegistrationScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 260 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <style>{`
          @keyframes cac-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes seal-glow {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(195,156,85,0)); }
            50% { transform: scale(1.06); filter: drop-shadow(0 0 8px rgba(195,156,85,0.7)); }
          }
          @keyframes doc-glide {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(2px, -3px) rotate(1deg); }
          }
          .cac-char { animation: cac-float 3.8s ease-in-out infinite; }
          .cac-seal { animation: seal-glow 3s ease-in-out infinite; transform-origin: 195px 65px; }
          .cac-doc { animation: doc-glide 4s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="130" cy="110" r="95" fill="url(#cac-glow)" opacity="0.5" />
        <defs>
          <radialGradient id="cac-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C39C55" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floating CAC Certificate Document (Right/Center) */}
        <g className="cac-doc" transform="translate(130, 40)">
          {/* Document Sheet */}
          <rect x="0" y="0" width="115" height="135" rx="10" fill="#0A1C14" stroke="#C39C55" strokeWidth="1.5" />
          <rect x="8" y="8" width="99" height="119" rx="6" fill="#132B20" fillOpacity="0.7" stroke="#295F41" strokeWidth="1" />

          {/* Certificate Header Banner */}
          <rect x="22" y="18" width="70" height="6" rx="2" fill="#E0C489" />
          <rect x="32" y="28" width="50" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.85" />

          {/* Registration Number Badge */}
          <rect x="18" y="38" width="78" height="16" rx="4" fill="#0E211A" stroke="#295F41" strokeWidth="0.8" />
          <text x="57" y="49" fill="#10B981" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            RC: 1894022
          </text>

          {/* Lines representing registered business articles */}
          <rect x="18" y="62" width="78" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          <rect x="18" y="70" width="65" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          <rect x="18" y="78" width="70" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.8" />
          <rect x="18" y="86" width="55" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.8" />

          {/* Verified Official Seal */}
          <g className="cac-seal" transform="translate(65, 88)">
            <circle cx="20" cy="20" r="16" fill="#C39C55" />
            <circle cx="20" cy="20" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M14 20 L18 24 L26 16" fill="none" stroke="#132B20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>

        {/* Corporate Registrar Character (Left) */}
        <g className="cac-char" transform="translate(30, 35)">
          {/* Chair / Podium Backdrop */}
          <rect x="35" y="60" width="60" height="90" rx="10" fill="#0A1812" stroke="#1D4230" strokeWidth="1.5" />

          {/* Smart Blazer */}
          <path d="M35 155 C35 105 50 88 68 88 C86 88 101 105 101 155 Z" fill="#163325" />
          {/* White inner collar & gold tie */}
          <polygon points="62,88 68,110 74,88" fill="#FFFFFF" />
          <polygon points="66,96 70,96 71,120 68,126 65,120" fill="#C39C55" />

          {/* Neck */}
          <rect x="63" y="72" width="10" height="18" rx="3" fill="#6B3F23" />

          {/* Head & Rich Complexion */}
          <ellipse cx="68" cy="58" rx="18" ry="20" fill="#784728" />

          {/* Modern Crop Hair */}
          <path d="M50 52 C50 38 58 35 68 35 C78 35 86 38 86 52 C80 44 74 42 68 42 C62 42 56 44 50 52 Z" fill="#111827" />

          {/* Wireframe Gold Glasses */}
          <rect x="56" y="53" width="10" height="7" rx="2" fill="none" stroke="#E0C489" strokeWidth="1.2" />
          <rect x="70" y="53" width="10" height="7" rx="2" fill="none" stroke="#E0C489" strokeWidth="1.2" />
          <line x1="66" y1="56" x2="70" y2="56" stroke="#E0C489" strokeWidth="1.2" />

          {/* Eyes & Warm Expression */}
          <circle cx="61" cy="56" r="1.5" fill="#111827" />
          <circle cx="75" cy="56" r="1.5" fill="#111827" />
          <path d="M64 66 Q68 70 72 66" fill="none" stroke="#3D1D09" strokeWidth="1.5" strokeLinecap="round" />

          {/* Hand presenting document */}
          <path d="M90 120 L115 110 L125 112" stroke="#163325" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="125" cy="112" r="4.5" fill="#784728" />
        </g>
      </svg>
    </div>
  );
}

export function TaxProfileScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 260 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <style>{`
          @keyframes tax-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes pulse-dot {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.3); }
          }
          @keyframes bar-anim {
            0%, 100% { transform: scaleX(1); }
            50% { transform: scaleX(1.05); }
          }
          .tax-char { animation: tax-float 4s ease-in-out infinite; }
          .tax-pulse { animation: pulse-dot 2s ease-in-out infinite; transform-origin: 195px 55px; }
          .tax-bar { animation: bar-anim 3s ease-in-out infinite; transform-origin: left; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="130" cy="110" r="95" fill="url(#tax-glow)" opacity="0.5" />
        <defs>
          <radialGradient id="tax-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Tax Officer Character (Left) */}
        <g className="tax-char" transform="translate(25, 35)">
          {/* Torso & Elegant Ochre Blazer */}
          <path d="M40 155 C40 105 55 90 75 90 C95 90 110 105 110 155 Z" fill="#C39C55" />
          <path d="M68 90 Q75 105 82 90" fill="none" stroke="#163325" strokeWidth="2.5" />

          {/* Neck */}
          <rect x="70" y="74" width="10" height="18" rx="3" fill="#844B29" />

          {/* Head */}
          <ellipse cx="75" cy="60" rx="18" ry="19" fill="#8F532E" />

          {/* Braided Topknot Hair */}
          <circle cx="75" cy="38" r="11" fill="#17120E" />
          <path d="M57 56 C57 42 65 39 75 39 C85 39 93 42 93 56 C88 47 82 45 75 45 C68 45 62 47 57 56 Z" fill="#17120E" />

          {/* Gold Stud Earrings */}
          <circle cx="56" cy="61" r="1.8" fill="#E0C489" />
          <circle cx="94" cy="61" r="1.8" fill="#E0C489" />

          {/* Eyes & Smile */}
          <circle cx="68" cy="58" r="1.5" fill="#111827" />
          <circle cx="82" cy="58" r="1.5" fill="#111827" />
          <path d="M71 67 Q75 70 79 67" fill="none" stroke="#45210D" strokeWidth="1.5" strokeLinecap="round" />

          {/* Arm holding tablet */}
          <path d="M45 125 L65 140 L90 135" stroke="#C39C55" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* FIRS / TIN Status Terminal (Right) */}
        <g transform="translate(125, 40)">
          {/* Main Card */}
          <rect x="0" y="0" width="120" height="135" rx="10" fill="#0A1812" stroke="#10B981" strokeWidth="1.2" />

          {/* Header Bar */}
          <rect x="10" y="12" width="55" height="5" rx="2" fill="#FFFFFF" />
          
          {/* Live TIN Status Pill */}
          <rect x="10" y="24" width="100" height="24" rx="6" fill="#132B20" stroke="#295F41" strokeWidth="1" />
          <circle cx="22" cy="36" r="4" fill="#10B981" className="tax-pulse" />
          <text x="32" y="34" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">TIN ACTIVE</text>
          <text x="32" y="42" fill="#E0C489" fontSize="5.5" fontFamily="monospace">24901824-0001</text>

          {/* Tax Breakdown Bars */}
          <g transform="translate(10, 58)">
            <text x="0" y="8" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">VAT Filing (FIRS)</text>
            <text x="100" y="8" fill="#10B981" fontSize="5.5" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">UP TO DATE</text>
            <rect x="0" y="13" width="100" height="4" rx="2" fill="#1A3326" />
            <rect x="0" y="13" width="100" height="4" rx="2" fill="#10B981" className="tax-bar" />

            <text x="0" y="30" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Withholding Tax (WHT)</text>
            <text x="100" y="30" fill="#E0C489" fontSize="5.5" fontWeight="bold" textAnchor="end" fontFamily="sans-serif">RECONCILED</text>
            <rect x="0" y="35" width="100" height="4" rx="2" fill="#1A3326" />
            <rect x="0" y="35" width="85" height="4" rx="2" fill="#C39C55" />

            {/* Total Annual Tax Clearance Badge */}
            <rect x="0" y="48" width="100" height="16" rx="4" fill="#163325" stroke="#C39C55" strokeWidth="0.8" />
            <text x="50" y="58" fill="#F4E4BF" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">
              ✓ TAX COMPLIANT 2026
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function WorkforceScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 260 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <style>{`
          @keyframes team-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes node-pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.08); }
          }
          .work-char { animation: team-bob 4.2s ease-in-out infinite; }
          .work-node { animation: node-pulse 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="130" cy="110" r="95" fill="url(#work-glow)" opacity="0.5" />
        <defs>
          <radialGradient id="work-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C39C55" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Workforce Manager Character (Left) */}
        <g className="work-char" transform="translate(25, 35)">
          {/* Torso & Senator Kaftan */}
          <path d="M40 155 C40 105 55 90 75 90 C95 90 110 105 110 155 Z" fill="#0A1812" stroke="#1D4230" strokeWidth="1.5" />
          <rect x="73" y="90" width="4" height="65" fill="#C39C55" />

          {/* Neck */}
          <rect x="70" y="74" width="10" height="18" rx="3" fill="#6B3F23" />

          {/* Head */}
          <ellipse cx="75" cy="60" rx="18" ry="19" fill="#784728" />

          {/* Fade Hair */}
          <path d="M57 53 C57 39 65 36 75 36 C85 36 93 39 93 53 C88 44 82 42 75 42 C68 42 62 44 57 53 Z" fill="#111827" />

          {/* Round Glasses */}
          <circle cx="68" cy="58" r="5" stroke="#E0C489" strokeWidth="1.2" fill="none" />
          <circle cx="82" cy="58" r="5" stroke="#E0C489" strokeWidth="1.2" fill="none" />
          <line x1="73" y1="58" x2="77" y2="58" stroke="#E0C489" strokeWidth="1.2" />
          <circle cx="68" cy="58" r="1.5" fill="#111827" />
          <circle cx="82" cy="58" r="1.5" fill="#111827" />

          {/* Confident Smile */}
          <path d="M71 68 Q75 71 79 68" fill="none" stroke="#3D1D09" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Team Org Chart & Headcount Node Network (Right) */}
        <g transform="translate(125, 40)">
          <rect x="0" y="0" width="120" height="135" rx="10" fill="#0E211A" stroke="#C39C55" strokeWidth="1.2" />

          {/* Headcount Banner */}
          <rect x="10" y="12" width="100" height="22" rx="6" fill="#163325" stroke="#295F41" strokeWidth="1" />
          <text x="20" y="24" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">HEADCOUNT</text>
          <text x="20" y="31" fill="#E0C489" fontSize="5" fontFamily="sans-serif">12 Active Team Members</text>
          <rect x="78" y="16" width="26" height="14" rx="4" fill="#295F41" />
          <text x="91" y="25.5" fill="#FFFFFF" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">100%</text>

          {/* Org Tree Connecting Lines */}
          <line x1="60" y1="46" x2="60" y2="60" stroke="#C39C55" strokeWidth="1.5" strokeDasharray="2 2" />
          <line x1="28" y1="60" x2="92" y2="60" stroke="#C39C55" strokeWidth="1.5" />
          <line x1="28" y1="60" x2="28" y2="72" stroke="#C39C55" strokeWidth="1.5" />
          <line x1="60" y1="60" x2="60" y2="72" stroke="#C39C55" strokeWidth="1.5" />
          <line x1="92" y1="60" x2="92" y2="72" stroke="#C39C55" strokeWidth="1.5" />

          {/* Leader Node */}
          <g className="work-node" style={{ transformOrigin: "60px 42px" }}>
            <circle cx="60" cy="42" r="10" fill="#1D4230" stroke="#C39C55" strokeWidth="1.5" />
            <circle cx="60" cy="40" r="4" fill="#C39C55" />
            <path d="M53 49 C53 46 56 44 60 44 C64 44 67 46 67 49 Z" fill="#C39C55" />
          </g>

          {/* Subordinate Team Nodes */}
          <g transform="translate(16, 74)">
            <rect x="0" y="0" width="25" height="46" rx="5" fill="#163325" stroke="#295F41" strokeWidth="0.8" />
            <circle cx="12.5" cy="12" r="6" fill="#8F532E" />
            <text x="12.5" y="26" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Ops</text>
            <rect x="4" y="32" width="17" height="8" rx="2" fill="#295F41" />
            <text x="12.5" y="38" fill="#FFFFFF" fontSize="4.5" textAnchor="middle" fontFamily="sans-serif">4</text>
          </g>

          <g transform="translate(48, 74)">
            <rect x="0" y="0" width="25" height="46" rx="5" fill="#163325" stroke="#C39C55" strokeWidth="0.8" />
            <circle cx="12.5" cy="12" r="6" fill="#784728" />
            <text x="12.5" y="26" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Finance</text>
            <rect x="4" y="32" width="17" height="8" rx="2" fill="#C39C55" />
            <text x="12.5" y="38" fill="#0E211A" fontSize="4.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">5</text>
          </g>

          <g transform="translate(80, 74)">
            <rect x="0" y="0" width="25" height="46" rx="5" fill="#163325" stroke="#295F41" strokeWidth="0.8" />
            <circle cx="12.5" cy="12" r="6" fill="#6B3F23" />
            <text x="12.5" y="26" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Legal</text>
            <rect x="4" y="32" width="17" height="8" rx="2" fill="#295F41" />
            <text x="12.5" y="38" fill="#FFFFFF" fontSize="4.5" textAnchor="middle" fontFamily="sans-serif">3</text>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function DocumentsVaultScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 260 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <style>{`
          @keyframes vault-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes doc-stack {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .doc-char { animation: vault-bob 4s ease-in-out infinite; }
          .doc-stack { animation: doc-stack 3.2s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="130" cy="110" r="95" fill="url(#doc-glow)" opacity="0.5" />
        <defs>
          <radialGradient id="doc-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Document Custodian Character (Left) */}
        <g className="doc-char" transform="translate(25, 35)">
          {/* Torso & Smart Uniform */}
          <path d="M40 155 C40 105 55 90 75 90 C95 90 110 105 110 155 Z" fill="#1D4230" />
          <polygon points="70,90 75,108 80,90" fill="#FFFFFF" />

          {/* Neck */}
          <rect x="70" y="74" width="10" height="18" rx="3" fill="#844B29" />

          {/* Head */}
          <ellipse cx="75" cy="60" rx="18" ry="19" fill="#8F532E" />

          {/* Clean Fade Haircut */}
          <path d="M57 53 C57 39 65 36 75 36 C85 36 93 39 93 53 C88 44 82 42 75 42 C68 42 62 44 57 53 Z" fill="#111827" />

          {/* Eyes & Focused Expression */}
          <circle cx="68" cy="58" r="1.5" fill="#111827" />
          <circle cx="82" cy="58" r="1.5" fill="#111827" />
          <path d="M71 67 Q75 70 79 67" fill="none" stroke="#45210D" strokeWidth="1.5" strokeLinecap="round" />

          {/* Arms holding filing binder */}
          <path d="M45 125 L65 140 L95 130" stroke="#1D4230" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Document Vault Storage Terminal (Right) */}
        <g transform="translate(125, 40)">
          <rect x="0" y="0" width="120" height="135" rx="10" fill="#0A1812" stroke="#F59E0B" strokeWidth="1.2" />

          {/* Progress Header */}
          <g transform="translate(12, 14)">
            <text x="0" y="8" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">DOCUMENTS VAULT</text>
            <text x="0" y="16" fill="#F59E0B" fontSize="6" fontWeight="bold" fontFamily="monospace">8 OF 10 ON FILE</text>

            {/* Circular Progress Gauge */}
            <circle cx="85" cy="12" r="10" fill="none" stroke="#1D4230" strokeWidth="3" />
            <circle cx="85" cy="12" r="10" fill="none" stroke="#F59E0B" strokeWidth="3" strokeDasharray="50 15" strokeLinecap="round" />
            <text x="85" y="14" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">80%</text>
          </g>

          {/* Document Slots */}
          <g transform="translate(12, 42)" className="doc-stack">
            {/* Doc 1 (Uploaded) */}
            <rect x="0" y="0" width="96" height="22" rx="4" fill="#163325" stroke="#10B981" strokeWidth="0.8" />
            <text x="8" y="11" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">CAC MemArt & Status</text>
            <text x="8" y="18" fill="#10B981" fontSize="4.5" fontFamily="sans-serif">Verified Upload ✓</text>
            <rect x="76" y="5" width="14" height="12" rx="3" fill="#10B981" />
            <text x="83" y="13.5" fill="#0A1812" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">✓</text>

            {/* Doc 2 (Uploaded) */}
            <g transform="translate(0, 26)">
              <rect x="0" y="0" width="96" height="22" rx="4" fill="#163325" stroke="#10B981" strokeWidth="0.8" />
              <text x="8" y="11" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">FIRS Tax Clearance</text>
              <text x="8" y="18" fill="#10B981" fontSize="4.5" fontFamily="sans-serif">Verified Upload ✓</text>
              <rect x="76" y="5" width="14" height="12" rx="3" fill="#10B981" />
              <text x="83" y="13.5" fill="#0A1812" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">✓</text>
            </g>

            {/* Doc 3 (Pending Attention) */}
            <g transform="translate(0, 52)">
              <rect x="0" y="0" width="96" height="22" rx="4" fill="#2E1C0A" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="3 2" />
              <text x="8" y="11" fill="#F4E4BF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">SCUML / AML Certificate</text>
              <text x="8" y="18" fill="#F59E0B" fontSize="4.5" fontFamily="sans-serif">Upload Required ⚠</text>
              <rect x="76" y="5" width="14" height="12" rx="3" fill="#F59E0B" />
              <text x="83" y="13.5" fill="#0A1812" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">!</text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}

export function SectorObligationsScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 260 210"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-xl"
      >
        <style>{`
          @keyframes shield-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes alert-pulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(245,158,11,0)); }
            50% { transform: scale(1.06); filter: drop-shadow(0 0 8px rgba(245,158,11,0.6)); }
          }
          .sect-char { animation: shield-float 4s ease-in-out infinite; }
          .sect-alert { animation: alert-pulse 2.5s ease-in-out infinite; transform-origin: 185px 55px; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="130" cy="110" r="95" fill="url(#sect-glow)" opacity="0.5" />
        <defs>
          <radialGradient id="sect-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C39C55" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Compliance Officer Character with Shield (Left) */}
        <g className="sect-char" transform="translate(25, 35)">
          {/* Smart Blazer */}
          <path d="M40 155 C40 105 55 90 75 90 C95 90 110 105 110 155 Z" fill="#163325" />
          <polygon points="70,90 75,110 80,90" fill="#FFFFFF" />

          {/* Neck */}
          <rect x="70" y="74" width="10" height="18" rx="3" fill="#5C3419" />

          {/* Head & Beard */}
          <ellipse cx="75" cy="60" rx="18" ry="19" fill="#6A3B1C" />
          <path d="M57 53 C57 39 65 36 75 36 C85 36 93 39 93 53 C88 44 82 42 75 42 C68 42 62 44 57 53 Z" fill="#111827" />
          <path d="M66 68 C66 76 70 80 75 80 C80 80 84 76 84 68 Z" fill="#111827" />

          {/* Eyes */}
          <circle cx="68" cy="58" r="1.5" fill="#111827" />
          <circle cx="82" cy="58" r="1.5" fill="#111827" />

          {/* Arm holding protective gold badge */}
          <path d="M45 125 L65 140 L90 135" stroke="#163325" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Sector Regulatory Obligations Terminal (Right) */}
        <g transform="translate(125, 40)">
          <rect x="0" y="0" width="120" height="135" rx="10" fill="#0A1812" stroke="#C39C55" strokeWidth="1.2" />

          {/* Header */}
          <g transform="translate(12, 14)">
            <text x="0" y="8" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">SECTOR OBLIGATIONS</text>
            <text x="0" y="16" fill="#F59E0B" fontSize="6" fontWeight="bold" fontFamily="monospace">3 FLAGGED FOR REVIEW</text>
          </g>

          {/* Compliance Checklist Items */}
          <g transform="translate(12, 38)">
            {/* Item 1 */}
            <rect x="0" y="0" width="96" height="24" rx="4" fill="#163325" stroke="#1D4230" strokeWidth="0.8" />
            <circle cx="12" cy="12" r="5" fill="#295F41" />
            <path d="M10 12 L11.5 13.5 L14.5 10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="22" y="11" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">Data Protection (NDPR)</text>
            <text x="22" y="18" fill="#10B981" fontSize="4.5" fontFamily="sans-serif">Annual Audit Filed ✓</text>

            {/* Item 2 (Flagged) */}
            <g transform="translate(0, 28)">
              <rect x="0" y="0" width="96" height="24" rx="4" fill="#2E1C0A" stroke="#F59E0B" strokeWidth="0.8" />
              <circle cx="12" cy="12" r="5" fill="#F59E0B" className="sect-alert" />
              <text x="12" y="14" fill="#0A1812" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">!</text>
              <text x="22" y="11" fill="#F4E4BF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">SCUML Anti-Money Laundering</text>
              <text x="22" y="18" fill="#F59E0B" fontSize="4.5" fontFamily="sans-serif">Review required for threshold</text>
            </g>

            {/* Item 3 */}
            <g transform="translate(0, 56)">
              <rect x="0" y="0" width="96" height="24" rx="4" fill="#163325" stroke="#1D4230" strokeWidth="0.8" />
              <circle cx="12" cy="12" r="5" fill="#295F41" />
              <path d="M10 12 L11.5 13.5 L14.5 10.5" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
              <text x="22" y="11" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" fontFamily="sans-serif">State Business Premises</text>
              <text x="22" y="18" fill="#10B981" fontSize="4.5" fontFamily="sans-serif">Valid for current year ✓</text>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
