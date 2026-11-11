import React from "react";

// Rich, full-scene animated vector illustrations tailored for the full-screen "Who It Serves" scroll swiper.
// Proportional, expressive, bespoke Nigerian corporate scenes with subtle SVG & CSS animations.

export function FounderScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 420 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <style>{`
          @keyframes founder-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes rocket-trail {
            0%, 100% { transform: translate(0, 0) rotate(0deg); }
            50% { transform: translate(3px, -6px) rotate(4deg); }
          }
          @keyframes steam-rise {
            0% { transform: translateY(0) scaleX(1); opacity: 0.6; }
            50% { transform: translateY(-8px) scaleX(1.3); opacity: 0.2; }
            100% { transform: translateY(-16px) scaleX(1.6); opacity: 0; }
          }
          @keyframes glow-pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 0.85; }
          }
          .scene-founder { animation: founder-float 4s ease-in-out infinite; }
          .scene-rocket { animation: rocket-trail 3s ease-in-out infinite; }
          .scene-steam { animation: steam-rise 2.5s ease-out infinite; transform-origin: 320px 220px; }
          .scene-glow { animation: glow-pulse 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient Studio Lighting Backdrop */}
        <circle cx="210" cy="160" r="140" fill="url(#founder-glow)" className="scene-glow" opacity="0.6" />
        <defs>
          <radialGradient id="founder-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#1D4230" stopOpacity="0.45" />
            <stop offset="70%" stopColor="#C39C55" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1D4230" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Floating Background Desk Surface */}
        <rect x="50" y="230" width="320" height="12" rx="6" fill="#163325" />
        <line x1="80" y1="236" x2="340" y2="236" stroke="#C39C55" strokeWidth="1.5" strokeOpacity="0.4" />

        {/* Coffee Mug with Animated Steam */}
        <g transform="translate(315, 205)">
          <rect x="0" y="8" width="18" height="18" rx="4" fill="#C39C55" />
          <path d="M18 12 Q24 16 18 20" fill="none" stroke="#C39C55" strokeWidth="2.5" />
          <path d="M6 3 Q9 0 6 -4" stroke="#F4E4BF" strokeWidth="1.5" strokeLinecap="round" className="scene-steam" fill="none" />
          <path d="M12 4 Q15 1 12 -3" stroke="#F4E4BF" strokeWidth="1.5" strokeLinecap="round" className="scene-steam" style={{ animationDelay: "-1.2s" }} fill="none" />
        </g>

        {/* Desk Succulent Plant */}
        <g transform="translate(75, 200)">
          <polygon points="4,30 20,30 22,18 2,18" fill="#C39C55" />
          <ellipse cx="12" cy="14" rx="6" ry="10" fill="#3D7856" />
          <ellipse cx="7" cy="16" rx="5" ry="8" fill="#295F41" />
          <ellipse cx="17" cy="16" rx="5" ry="8" fill="#295F41" />
        </g>

        {/* The Founder (Sitting & Smiling at Laptop) */}
        <g className="scene-founder">
          {/* Chair back */}
          <rect x="160" y="90" width="100" height="120" rx="16" fill="#0E211A" stroke="#1D4230" strokeWidth="2" />
          <rect x="175" y="105" width="70" height="90" rx="8" fill="#163325" fillOpacity="0.6" />

          {/* Torso & Smart Blazer */}
          <path d="M165 230 C165 170 185 150 210 150 C235 150 255 170 255 230 Z" fill="#1D4230" />
          {/* Inner Shirt with gold button */}
          <polygon points="202,150 210,180 218,150" fill="#FFFFFF" />
          <circle cx="210" cy="190" r="1.5" fill="#C39C55" />

          {/* Arms typing forward */}
          <path d="M172 185 L190 220 L210 220" stroke="#1D4230" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M248 185 L230 220 L215 220" stroke="#1D4230" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

          {/* Neck */}
          <rect x="203" y="130" width="14" height="24" rx="4" fill="#6B3F23" />

          {/* Head & Rich Nigerian Complexion */}
          <ellipse cx="210" cy="110" rx="25" ry="28" fill="#784728" />

          {/* Sharp Modern Fade Haircut */}
          <path d="M185 102 C185 80 196 74 210 74 C224 74 235 80 235 102 C226 90 218 88 210 88 C202 88 194 90 185 102 Z" fill="#15110E" />

          {/* Wireframe Gold Glasses */}
          <rect x="193" y="103" width="14" height="10" rx="2.5" fill="none" stroke="#E0C489" strokeWidth="1.5" />
          <rect x="213" y="103" width="14" height="10" rx="2.5" fill="none" stroke="#E0C489" strokeWidth="1.5" />
          <line x1="207" y1="108" x2="213" y2="108" stroke="#E0C489" strokeWidth="1.5" />

          {/* Eyes & Smile */}
          <circle cx="200" cy="108" r="2" fill="#111827" />
          <circle cx="220" cy="108" r="2" fill="#111827" />
          <path d="M204 122 Q210 127 216 122" fill="none" stroke="#381D0D" strokeWidth="1.8" strokeLinecap="round" />

          {/* Open Modern Laptop on Desk */}
          <g transform="translate(180, 200)">
            {/* Screen */}
            <polygon points="10,0 50,0 55,25 5,25" fill="#0E211A" stroke="#C39C55" strokeWidth="1.5" />
            <polygon points="12,2 48,2 52,23 8,23" fill="#1D4230" />
            {/* Glowing screen lines */}
            <line x1="16" y1="8" x2="44" y2="8" stroke="#F4E4BF" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="16" y1="13" x2="36" y2="13" stroke="#F4E4BF" strokeWidth="1.2" strokeOpacity="0.7" strokeLinecap="round" />
            <circle cx="44" cy="15" r="2" fill="#C39C55" />
            {/* Base */}
            <polygon points="0,25 60,25 56,28 4,28" fill="#E2E8F0" />
          </g>
        </g>

        {/* Floating Glassmorphic Milestone Document */}
        <g transform="translate(48, 65)" className="scene-founder">
          <rect x="0" y="0" width="105" height="70" rx="8" fill="#163325" fillOpacity="0.85" stroke="#C39C55" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="6" fill="#C39C55" />
          <path d="M14 16 L15.5 17.5 L18.5 14.5" fill="none" stroke="#1D4230" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="28" y="13" width="60" height="5" rx="2" fill="#FFFFFF" fillOpacity="0.9" />
          <rect x="12" y="28" width="76" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.5" />
          <rect x="12" y="36" width="65" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.5" />
          <rect x="12" y="44" width="50" height="3" rx="1.5" fill="#FFFFFF" fillOpacity="0.5" />
          <rect x="12" y="54" width="40" height="7" rx="3.5" fill="#295F41" />
          <text x="32" y="59.5" fill="#E0C489" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">DAY 1 PASS</text>
        </g>

        {/* Floating Rocket Launch Badge with Stardust */}
        <g className="scene-rocket" transform="translate(290, 60)">
          <circle cx="30" cy="30" r="26" fill="#1D4230" stroke="#C39C55" strokeWidth="2" />
          {/* Rocket body */}
          <path d="M30 14 C36 19 38 27 37 36 L23 36 C22 27 24 19 30 14 Z" fill="#C39C55" />
          <path d="M23 36 L19 41 H41 L37 36 Z" fill="#E0C489" />
          <circle cx="30" cy="24" r="3" fill="#1D4230" />
          {/* Thrust flame */}
          <polygon points="26,41 30,48 34,41" fill="#F59E0B" />
          {/* Sparkles */}
          <circle cx="12" cy="18" r="1.5" fill="#F4E4BF" />
          <circle cx="50" cy="26" r="1.5" fill="#F4E4BF" />
          <circle cx="44" cy="46" r="1" fill="#F4E4BF" />
        </g>
      </svg>
    </div>
  );
}

export function GrowthScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 420 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <style>{`
          @keyframes growth-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes bar-grow {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(1.08); }
          }
          .scene-growth { animation: growth-bob 3.8s ease-in-out infinite; }
          .scene-bar { transform-origin: bottom; animation: bar-grow 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="210" cy="160" r="140" fill="url(#growth-glow)" opacity="0.6" />
        <defs>
          <radialGradient id="growth-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C39C55" stopOpacity="0.35" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Operations Lead Character (Standing with Tablet) */}
        <g className="scene-growth" transform="translate(45, 30)">
          {/* Torso & Elegant Ochre Blouse */}
          <path d="M120 230 C120 165 138 145 165 145 C192 145 210 165 210 230 Z" fill="#C39C55" />
          <path d="M155 145 Q165 160 175 145" fill="none" stroke="#1D4230" strokeWidth="3" />

          {/* Neck with gold chain */}
          <rect x="158" y="125" width="14" height="22" rx="4" fill="#844B29" />
          <path d="M159 136 Q165 142 171 136" fill="none" stroke="#F4E4BF" strokeWidth="1.5" />

          {/* Head */}
          <ellipse cx="165" cy="105" rx="25" ry="27" fill="#8F532E" />

          {/* High Crown Braids */}
          <circle cx="165" cy="74" r="17" fill="#17120E" />
          <path d="M140 100 C140 78 151 74 165 74 C179 74 190 78 190 100 C183 88 175 84 165 84 C155 84 147 88 140 100 Z" fill="#17120E" />

          {/* Gold Studs */}
          <circle cx="139" cy="106" r="2.5" fill="#E0C489" />
          <circle cx="191" cy="106" r="2.5" fill="#E0C489" />

          {/* Eyes & Friendly Expression */}
          <circle cx="156" cy="102" r="2.2" fill="#111827" />
          <circle cx="174" cy="102" r="2.2" fill="#111827" />
          <path d="M159 116 Q165 121 171 116" fill="none" stroke="#45210D" strokeWidth="1.8" strokeLinecap="round" />

          {/* Arms holding illuminated tablet */}
          <path d="M125 180 L145 205 L170 195" stroke="#C39C55" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M205 180 L185 205 L160 195" stroke="#C39C55" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />

          {/* Digital Tablet */}
          <rect x="140" y="178" width="50" height="38" rx="5" fill="#0E211A" stroke="#E0C489" strokeWidth="1.5" />
          <rect x="144" y="182" width="42" height="30" rx="3" fill="#1D4230" />
          <polyline points="148,204 156,196 164,200 174,188 182,192" fill="none" stroke="#C39C55" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="174" cy="188" r="1.5" fill="#FFFFFF" />
        </g>

        {/* Live Kanban & Operations Glass Board (Right side) */}
        <g transform="translate(230, 60)">
          {/* Main Board Panel */}
          <rect x="0" y="0" width="165" height="195" rx="14" fill="#0E211A" fillOpacity="0.8" stroke="#C39C55" strokeWidth="1.5" />
          
          {/* Board Header */}
          <rect x="12" y="12" width="60" height="6" rx="2" fill="#FFFFFF" fillOpacity="0.8" />
          <rect x="125" y="10" width="28" height="10" rx="5" fill="#1D4230" stroke="#C39C55" strokeWidth="1" />
          <text x="139" y="17.5" fill="#E0C489" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">96% ON TRACK</text>

          {/* Operational Task Card 1 (Completed) */}
          <g transform="translate(12, 30)">
            <rect x="0" y="0" width="141" height="42" rx="8" fill="#163325" stroke="#1D4230" strokeWidth="1" />
            <circle cx="14" cy="15" r="5" fill="#295F41" />
            <path d="M12 15 L13.5 16.5 L16.5 13.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="25" y="12" width="75" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.9" />
            <rect x="25" y="22" width="50" height="3" rx="1" fill="#E0C489" fillOpacity="0.7" />
            <rect x="105" y="25" width="28" height="10" rx="5" fill="#295F41" />
            <text x="119" y="32" fill="#FFFFFF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">DONE ✓</text>
          </g>

          {/* Operational Task Card 2 (In Progress) */}
          <g transform="translate(12, 80)">
            <rect x="0" y="0" width="141" height="42" rx="8" fill="#163325" stroke="#1D4230" strokeWidth="1" />
            <circle cx="14" cy="15" r="5" fill="#C39C55" />
            <circle cx="14" cy="15" r="2" fill="#1D4230" />
            <rect x="25" y="12" width="85" height="5" rx="1.5" fill="#FFFFFF" fillOpacity="0.9" />
            <rect x="25" y="22" width="60" height="3" rx="1" fill="#E0C489" fillOpacity="0.7" />
            <rect x="95" y="25" width="38" height="10" rx="5" fill="#C39C55" fillOpacity="0.25" stroke="#C39C55" strokeWidth="0.8" />
            <text x="114" y="32" fill="#F4E4BF" fontSize="5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">IN PROGRESS</text>
          </g>

          {/* Transform Banner: "Outgrown spreadsheets" */}
          <g transform="translate(12, 134)">
            <rect x="0" y="0" width="141" height="46" rx="8" fill="#1D4230" fillOpacity="0.6" stroke="#C39C55" strokeWidth="1" strokeDasharray="3 3" />
            <text x="10" y="16" fill="#E0C489" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">NO MORE MESSY SPREADSHEETS</text>
            <text x="10" y="28" fill="#FFFFFF" fillOpacity="0.75" fontSize="5.5" fontFamily="sans-serif">Every action links to verified approvals</text>
            <path d="M10 38 L130 38" stroke="#C39C55" strokeWidth="1" strokeOpacity="0.4" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function EnterpriseScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 420 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <style>{`
          @keyframes chair-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes seal-spin {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(195,156,85,0)); }
            50% { transform: scale(1.05); filter: drop-shadow(0 0 10px rgba(195,156,85,0.7)); }
          }
          .scene-chair { animation: chair-float 4s ease-in-out infinite; }
          .scene-seal { animation: seal-spin 3.2s ease-in-out infinite; transform-origin: 325px 95px; }
        `}</style>

        {/* Ambient Corporate Glow */}
        <circle cx="210" cy="160" r="140" fill="url(#enterprise-glow)" opacity="0.6" />
        <defs>
          <radialGradient id="enterprise-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#1D4230" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#C39C55" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Boardroom Architecture Pillars */}
        <g stroke="#C39C55" strokeWidth="1" strokeOpacity="0.25">
          <line x1="30" y1="40" x2="30" y2="280" />
          <line x1="42" y1="40" x2="42" y2="280" />
          <line x1="378" y1="40" x2="378" y2="280" />
          <line x1="390" y1="40" x2="390" y2="280" />
        </g>

        {/* Executive Leader (Charcoal & Emerald 3-Piece Suit) */}
        <g className="scene-chair" transform="translate(60, 20)">
          {/* Executive Chair */}
          <rect x="80" y="70" width="110" height="150" rx="18" fill="#0A1812" stroke="#1D4230" strokeWidth="2.5" />
          <rect x="95" y="85" width="80" height="110" rx="10" fill="#163325" fillOpacity="0.5" />

          {/* Torso & Suit */}
          <path d="M85 240 C85 165 105 140 135 140 C165 140 185 165 185 240 Z" fill="#163325" />
          {/* Crisp shirt & gold tie */}
          <polygon points="125,140 135,170 145,140" fill="#FFFFFF" />
          <polygon points="132,152 138,152 140,185 135,195 130,185" fill="#C39C55" />
          {/* Pocket square */}
          <polygon points="160,185 168,180 172,185" fill="#C39C55" />

          {/* Neck */}
          <rect x="128" y="120" width="14" height="24" rx="4" fill="#5C3419" />

          {/* Head & Trim Hair with Beard */}
          <ellipse cx="135" cy="100" rx="25" ry="28" fill="#6A3B1C" />
          <path d="M110 92 C110 74 121 70 135 70 C149 70 160 74 160 92 C151 80 143 78 135 78 C127 78 119 80 110 92 Z" fill="#111827" />
          <path d="M121 108 C121 122 127 127 135 127 C143 127 149 122 149 108 C145 118 139 120 135 120 C131 120 125 118 121 108 Z" fill="#111827" />

          {/* Eyes */}
          <circle cx="126" cy="97" r="2.2" fill="#111827" />
          <circle cx="144" cy="97" r="2.2" fill="#111827" />
          <path d="M130 108 Q135 111 140 108" fill="none" stroke="#2B150A" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Board Resolution & Maker-Checker Card (Right side) */}
        <g transform="translate(225, 55)">
          <rect x="0" y="0" width="165" height="195" rx="14" fill="#0E211A" fillOpacity="0.9" stroke="#C39C55" strokeWidth="1.5" />

          {/* Header */}
          <text x="14" y="22" fill="#E0C489" fontSize="7" fontWeight="bold" fontFamily="sans-serif">BOARD GOVERNANCE SEAL</text>
          <text x="14" y="32" fill="#FFFFFF" fillOpacity="0.6" fontSize="5.5" fontFamily="sans-serif">Maker-Checker Authorization Model</text>

          {/* Dual-Signatory Badges */}
          <g transform="translate(14, 42)">
            <rect x="0" y="0" width="137" height="34" rx="6" fill="#163325" stroke="#1D4230" strokeWidth="1" />
            <circle cx="16" cy="17" r="8" fill="#1D4230" stroke="#C39C55" strokeWidth="1" />
            <text x="16" y="20" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">M1</text>
            <text x="32" y="15" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Maker (Initiator)</text>
            <text x="32" y="24" fill="#C39C55" fontSize="5" fontFamily="sans-serif">Recorded & Documented ✓</text>
          </g>

          <g transform="translate(14, 82)">
            <rect x="0" y="0" width="137" height="34" rx="6" fill="#163325" stroke="#1D4230" strokeWidth="1" />
            <circle cx="16" cy="17" r="8" fill="#C39C55" />
            <text x="16" y="20" fill="#0E211A" fontSize="6.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">C2</text>
            <text x="32" y="15" fill="#FFFFFF" fontSize="6" fontWeight="bold" fontFamily="sans-serif">Checker (Signatory)</text>
            <text x="32" y="24" fill="#E0C489" fontSize="5" fontFamily="sans-serif">Approved & Countersigned ✓</text>
          </g>

          {/* Immutable Audit Hash Footer */}
          <g transform="translate(14, 126)">
            <rect x="0" y="0" width="137" height="24" rx="5" fill="#1D4230" fillOpacity="0.5" stroke="#C39C55" strokeWidth="0.8" />
            <text x="8" y="12" fill="#E0C489" fontSize="5.5" fontWeight="mono" fontFamily="monospace">SHA-256: 9e4f2a...81c3</text>
            <text x="8" y="20" fill="#FFFFFF" fillOpacity="0.7" fontSize="5" fontFamily="sans-serif">Immutable audit record locked</text>
          </g>

          {/* Official Stamped Seal */}
          <g className="scene-seal" transform="translate(95, 145)">
            <circle cx="18" cy="18" r="16" fill="#C39C55" />
            <circle cx="18" cy="18" r="13" fill="none" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2 2" />
            <path d="M12 18 L16 22 L24 14" fill="none" stroke="#1D4230" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      </svg>
    </div>
  );
}

export function MultiEntityScene({ className = "w-full h-full" }) {
  return (
    <div className={`relative ${className} flex items-center justify-center select-none`}>
      <svg
        viewBox="0 0 420 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-2xl"
      >
        <style>{`
          @keyframes multi-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes entity-pulse {
            0%, 100% { transform: scale(1); opacity: 0.95; }
            50% { transform: scale(1.02); opacity: 1; }
          }
          .scene-multi { animation: multi-bob 4s ease-in-out infinite; }
          .scene-entity-l { animation: entity-pulse 3.5s ease-in-out infinite; transform-origin: 80px 150px; }
          .scene-entity-r { animation: entity-pulse 3.5s ease-in-out infinite; transform-origin: 340px 150px; animation-delay: -1.75s; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="210" cy="160" r="140" fill="url(#multi-glow)" opacity="0.6" />
        <defs>
          <radialGradient id="multi-glow" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="#C39C55" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#1D4230" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#0E211A" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Holographic Firewall Barrier separating entities */}
        <g stroke="#C39C55" strokeWidth="1.2" strokeDasharray="4 4" strokeOpacity="0.4">
          <line x1="210" y1="40" x2="210" y2="280" />
        </g>
        <rect x="175" y="45" width="70" height="16" rx="8" fill="#1D4230" stroke="#C39C55" strokeWidth="1" />
        <text x="210" y="56" fill="#F4E4BF" fontSize="6" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">TENANT ISOLATED</text>

        {/* Entity Card A (Left) */}
        <g className="scene-entity-l" transform="translate(20, 90)">
          <rect x="0" y="0" width="125" height="140" rx="12" fill="#0E211A" fillOpacity="0.9" stroke="#1D4230" strokeWidth="1.8" />
          <rect x="0" y="0" width="125" height="30" rx="12" fill="#163325" />
          <circle cx="16" cy="15" r="7" fill="#295F41" />
          <text x="16" y="18" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">A</text>
          <text x="30" y="18" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">Enterprise Alpha</text>
          
          <rect x="12" y="42" width="70" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
          <text x="12" y="62" fill="#C39C55" fontSize="10" fontWeight="bold" fontFamily="monospace">₦42,850,000</text>
          
          <rect x="12" y="75" width="101" height="22" rx="4" fill="#1D4230" fillOpacity="0.5" />
          <text x="18" y="86" fill="#FFFFFF" fillOpacity="0.8" fontSize="5" fontFamily="sans-serif">Database: tavora_tenant</text>
          <text x="18" y="93" fill="#E0C489" fontSize="5" fontFamily="sans-serif">Decisions: 14 Active</text>

          <rect x="12" y="108" width="50" height="14" rx="4" fill="#295F41" />
          <text x="37" y="117" fill="#FFFFFF" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">INDEPENDENT</text>
        </g>

        {/* Entity Card B (Right) */}
        <g className="scene-entity-r" transform="translate(275, 90)">
          <rect x="0" y="0" width="125" height="140" rx="12" fill="#0E211A" fillOpacity="0.9" stroke="#C39C55" strokeWidth="1.8" />
          <rect x="0" y="0" width="125" height="30" rx="12" fill="#2E2210" />
          <circle cx="16" cy="15" r="7" fill="#C39C55" />
          <text x="16" y="18" fill="#0E211A" fontSize="7" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">B</text>
          <text x="30" y="18" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif">Enterprise Beta</text>
          
          <rect x="12" y="42" width="70" height="4" rx="2" fill="#FFFFFF" fillOpacity="0.7" />
          <text x="12" y="62" fill="#E0C489" fontSize="10" fontWeight="bold" fontFamily="monospace">₦28,150,000</text>
          
          <rect x="12" y="75" width="101" height="22" rx="4" fill="#3D2E15" fillOpacity="0.5" />
          <text x="18" y="86" fill="#FFFFFF" fillOpacity="0.8" fontSize="5" fontFamily="sans-serif">Database: knit_tenant</text>
          <text x="18" y="93" fill="#E0C489" fontSize="5" fontFamily="sans-serif">Decisions: 8 Active</text>

          <rect x="12" y="108" width="50" height="14" rx="4" fill="#C39C55" />
          <text x="37" y="117" fill="#0E211A" fontSize="5.5" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">INDEPENDENT</text>
        </g>

        {/* Multi-Business Owner in Center (Embroidered Kaftan) */}
        <g className="scene-multi" transform="translate(155, 65)">
          {/* Torso & Senator Kaftan */}
          <path d="M25 180 C25 125 35 110 55 110 C75 110 85 125 85 180 Z" fill="#091712" stroke="#1D4230" strokeWidth="1.5" />
          <rect x="52" y="110" width="6" height="70" fill="#C39C55" />

          {/* Neck */}
          <rect x="48" y="92" width="14" height="22" rx="4" fill="#6B3F23" />

          {/* Head */}
          <ellipse cx="55" cy="74" rx="23" ry="26" fill="#784728" />

          {/* Clean Trim Fade */}
          <path d="M33 66 C33 48 43 44 55 44 C67 44 77 48 77 66 C69 54 62 52 55 52 C48 52 41 54 33 66 Z" fill="#111827" />

          {/* Gold Glasses */}
          <circle cx="45" cy="72" r="6" stroke="#E0C489" strokeWidth="1.5" fill="none" />
          <circle cx="65" cy="72" r="6" stroke="#E0C489" strokeWidth="1.5" fill="none" />
          <line x1="51" y1="72" x2="59" y2="72" stroke="#E0C489" strokeWidth="1.5" />
          <circle cx="45" cy="72" r="2" fill="#111827" />
          <circle cx="65" cy="72" r="2" fill="#111827" />

          {/* Confident Smile */}
          <path d="M50 86 Q55 90 60 86" fill="none" stroke="#3D1D09" strokeWidth="1.8" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
