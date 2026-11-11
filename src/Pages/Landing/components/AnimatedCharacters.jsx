import React from "react";

// Modern, lightweight, bespoke SVG animated characters tailored for a Nigerian corporate context.
// Zero AI artifacts, infinitely crisp, fast, and interactive with subtle CSS animations.

export function ApproverCharacter({ className = "w-28 h-28" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes gentle-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          @keyframes eye-blink {
            0%, 94%, 98%, 100% { transform: scaleY(1); }
            96% { transform: scaleY(0.1); }
          }
          @keyframes badge-pulse {
            0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(195,156,85,0)); }
            50% { transform: scale(1.08); filter: drop-shadow(0 0 6px rgba(195,156,85,0.6)); }
          }
          .anim-bob { animation: gentle-bob 4s ease-in-out infinite; }
          .anim-blink { transform-origin: 80px 65px; animation: eye-blink 5s infinite; }
          .anim-badge { transform-origin: 125px 125px; animation: badge-pulse 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="80" cy="80" r="72" className="fill-brand-500/10 dark:fill-brand-400/20" />
        <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-gold-500/40" />

        <g className="anim-bob">
          {/* Torso & Suit (Emerald corporate jacket + gold tie) */}
          <path d="M40 148 C40 116 54 104 80 104 C106 104 120 116 120 148 Z" fill="#1D4230" />
          {/* White Shirt collar */}
          <polygon points="68,104 80,126 92,104 86,104 80,116 74,104" fill="#F8FAFC" />
          {/* Gold Tie */}
          <polygon points="77,114 83,114 85,138 80,146 75,138" fill="#C39C55" />

          {/* Neck */}
          <rect x="73" y="86" width="14" height="20" rx="3" fill="#6A3B1C" />

          {/* Head & Rich Nigerian Complexion */}
          <ellipse cx="80" cy="66" rx="26" ry="29" fill="#784221" />

          {/* Crisp Fade Hairline */}
          <path d="M54 62 C54 42 64 36 80 36 C96 36 106 42 106 62 C106 50 96 44 80 44 C64 44 54 50 54 62 Z" fill="#17120E" />

          {/* Modern Slim Wire Glasses (Gold) */}
          <rect x="62" y="58" width="15" height="11" rx="3" fill="none" stroke="#E0C489" strokeWidth="1.8" />
          <rect x="83" y="58" width="15" height="11" rx="3" fill="none" stroke="#E0C489" strokeWidth="1.8" />
          <line x1="77" y1="63" x2="83" y2="63" stroke="#E0C489" strokeWidth="1.8" />

          {/* Eyes (Animated blink) */}
          <g className="anim-blink">
            <circle cx="69.5" cy="63.5" r="2.2" fill="#111827" />
            <circle cx="90.5" cy="63.5" r="2.2" fill="#111827" />
            <circle cx="70.5" cy="62.5" r="0.8" fill="#FFFFFF" />
            <circle cx="91.5" cy="62.5" r="0.8" fill="#FFFFFF" />
          </g>

          {/* Warm confident smile */}
          <path d="M73 78 Q80 84 87 78" fill="none" stroke="#381D0D" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* Floating "Approved" Gold Seal Badge */}
        <g className="anim-badge">
          <circle cx="124" cy="122" r="16" fill="#C39C55" />
          <circle cx="124" cy="122" r="13" stroke="#FBF3E2" strokeWidth="1" strokeDasharray="2 2" fill="none" />
          <path d="M118 122 L122 126 L130 118" fill="none" stroke="#1D4230" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export function OperatorCharacter({ className = "w-28 h-28" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes checkmark-slide {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          .anim-operator { animation: checkmark-slide 3.5s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="80" cy="80" r="72" className="fill-gold-500/10 dark:fill-gold-400/15" />
        <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" className="text-brand-500/30" />

        <g className="anim-operator">
          {/* Contemporary Gold/Ochre Top */}
          <path d="M42 148 C42 118 56 106 80 106 C104 106 118 118 118 148 Z" fill="#C39C55" />
          {/* Minimalist emerald collar highlight */}
          <path d="M72 106 Q80 116 88 106" fill="none" stroke="#1D4230" strokeWidth="3" />

          {/* Neck with subtle gold chain */}
          <rect x="73" y="88" width="14" height="20" rx="3" fill="#844B29" />
          <path d="M74 98 Q80 104 86 98" fill="none" stroke="#F4E4BF" strokeWidth="1.5" />

          {/* Head */}
          <ellipse cx="80" cy="68" rx="25" ry="27" fill="#8F532E" />

          {/* Elegant High Braided Bun / Afro crown */}
          <circle cx="80" cy="36" r="18" fill="#17120E" />
          <path d="M55 64 C55 42 66 38 80 38 C94 38 105 42 105 64 C98 52 90 48 80 48 C70 48 62 52 55 64 Z" fill="#17120E" />

          {/* Expressive Eyes */}
          <circle cx="71" cy="66" r="2.2" fill="#111827" />
          <circle cx="89" cy="66" r="2.2" fill="#111827" />
          <circle cx="72" cy="65" r="0.8" fill="#FFFFFF" />
          <circle cx="90" cy="65" r="0.8" fill="#FFFFFF" />

          {/* Gold Stud Earrings */}
          <circle cx="54" cy="70" r="2.5" fill="#E0C489" />
          <circle cx="106" cy="70" r="2.5" fill="#E0C489" />

          {/* Focused, pleasant smile */}
          <path d="M74 80 Q80 85 86 80" fill="none" stroke="#45210D" strokeWidth="1.8" strokeLinecap="round" />
        </g>

        {/* Task Clipboard with Verified Checkmark */}
        <g transform="translate(16, 95)">
          <rect x="0" y="0" width="30" height="38" rx="5" fill="#1D4230" stroke="#E0C489" strokeWidth="1.5" />
          <rect x="8" y="-3" width="14" height="6" rx="2" fill="#C39C55" />
          <line x1="6" y1="12" x2="22" y2="12" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <line x1="6" y1="18" x2="18" y2="18" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.7" />
          <circle cx="20" cy="28" r="6" fill="#3D7856" />
          <path d="M18 28 L19.5 29.5 L22.5 26.5" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export function FinanceCharacter({ className = "w-28 h-28" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes coin-hover {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-5px) rotate(4deg); }
          }
          .anim-coin { animation: coin-hover 3s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="80" cy="80" r="72" className="fill-brand-500/10 dark:fill-brand-400/20" />
        <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-brand-500/40" />

        {/* Crisp Executive Senator Attire (Dark Charcoal & Emerald Trim) */}
        <path d="M40 148 C40 116 54 104 80 104 C106 104 120 116 120 148 Z" fill="#163325" />
        {/* Embroidered Placket */}
        <rect x="77" y="104" width="6" height="44" fill="#C39C55" />

        {/* Neck */}
        <rect x="73" y="86" width="14" height="20" rx="3" fill="#5C3419" />

        {/* Head */}
        <ellipse cx="80" cy="66" rx="25" ry="28" fill="#6A3B1C" />

        {/* Trim haircut with neat beard */}
        <path d="M55 58 C55 40 66 36 80 36 C94 36 105 40 105 58 C96 46 88 44 80 44 C72 44 64 46 55 58 Z" fill="#111827" />
        {/* Groomed Beard */}
        <path d="M66 74 C66 88 72 93 80 93 C88 93 94 88 94 74 C90 84 84 86 80 86 C76 86 70 84 66 74 Z" fill="#111827" />

        {/* Eyes */}
        <circle cx="71" cy="63" r="2.2" fill="#111827" />
        <circle cx="89" cy="63" r="2.2" fill="#111827" />
        <circle cx="72" cy="62" r="0.8" fill="#FFFFFF" />
        <circle cx="90" cy="62" r="0.8" fill="#FFFFFF" />

        {/* Confident expression */}
        <path d="M75 74 Q80 77 85 74" fill="none" stroke="#2B150A" strokeWidth="1.8" strokeLinecap="round" />

        {/* Floating Nigerian Naira ₦ Gold Coin */}
        <g className="anim-coin" transform="translate(108, 38)">
          <circle cx="16" cy="16" r="16" fill="#C39C55" />
          <circle cx="16" cy="16" r="13" stroke="#FDF8ED" strokeWidth="1.2" fill="none" />
          <text
            x="16"
            y="21"
            textAnchor="middle"
            fill="#1D4230"
            fontSize="14"
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            ₦
          </text>
        </g>
      </svg>
    </div>
  );
}

export function LegalAdvisorCharacter({ className = "w-28 h-28" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes shield-float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }
          .anim-shield { animation: shield-float 3.8s ease-in-out infinite; }
        `}</style>

        {/* Ambient Halo */}
        <circle cx="80" cy="80" r="72" className="fill-gold-500/10 dark:fill-gold-400/20" />
        <circle cx="80" cy="80" r="64" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" className="text-gold-500/50" />

        {/* Formal Legal Attire (Silk Blouse + Emerald Blazer) */}
        <path d="M38 148 C38 116 52 104 80 104 C108 104 122 116 122 148 Z" fill="#1D4230" />
        <path d="M68 104 L80 128 L92 104 Z" fill="#F4E4BF" />

        {/* Neck */}
        <rect x="73" y="86" width="14" height="20" rx="3" fill="#784221" />

        {/* Head */}
        <ellipse cx="80" cy="65" rx="25" ry="28" fill="#844B29" />

        {/* Modern styled Bob / Gel wrap */}
        <path d="M52 64 C52 38 64 34 80 34 C96 34 108 38 108 64 C104 46 94 42 80 42 C66 42 56 46 52 64 Z" fill="#17120E" />

        {/* Gold Frame Glasses */}
        <circle cx="69" cy="62" r="7" stroke="#E0C489" strokeWidth="1.5" fill="none" />
        <circle cx="91" cy="62" r="7" stroke="#E0C489" strokeWidth="1.5" fill="none" />
        <line x1="76" y1="62" x2="84" y2="62" stroke="#E0C489" strokeWidth="1.5" />

        {/* Eyes */}
        <circle cx="69" cy="62" r="2" fill="#111827" />
        <circle cx="91" cy="62" r="2" fill="#111827" />

        {/* Friendly smile */}
        <path d="M74 78 Q80 83 86 78" fill="none" stroke="#3D1D09" strokeWidth="1.8" strokeLinecap="round" />

        {/* Floating CAC/Legal Shield badge */}
        <g className="anim-shield" transform="translate(14, 28)">
          <path
            d="M16 2 L28 8 V18 C28 26 21 31 16 34 C11 31 4 26 4 18 V8 Z"
            fill="#C39C55"
            stroke="#1D4230"
            strokeWidth="1.5"
          />
          <path
            d="M11 16 L14.5 19.5 L21 12"
            fill="none"
            stroke="#1D4230"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}

// ==========================================
// AUDIENCE CHARACTERS (For "Who It Serves")
// ==========================================

export function FounderCharacter({ className = "w-32 h-32" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes rocket-float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(5deg); }
          }
          .anim-rocket { animation: rocket-float 3s ease-in-out infinite; }
        `}</style>
        {/* Glow Halo */}
        <circle cx="80" cy="80" r="74" className="fill-brand-500/20 dark:fill-brand-400/30" />
        <circle cx="80" cy="80" r="66" stroke="#C39C55" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />

        {/* Torso: Modern Founder Smart Casual Blazer */}
        <path d="M40 148 C40 116 54 104 80 104 C106 104 120 116 120 148 Z" fill="#1D4230" />
        <path d="M68 104 L80 132 L92 104 Z" fill="#FFFFFF" />

        {/* Neck */}
        <rect x="73" y="86" width="14" height="20" rx="3" fill="#6B3F23" />

        {/* Head */}
        <ellipse cx="80" cy="65" rx="25" ry="28" fill="#784728" />

        {/* Sharp High Top Fade */}
        <path d="M55 58 C55 36 66 30 80 30 C94 30 105 36 105 58 C96 46 88 44 80 44 C72 44 64 46 55 58 Z" fill="#15110E" />

        {/* Modern Minimal Glasses */}
        <rect x="63" y="58" width="14" height="10" rx="2.5" fill="none" stroke="#E0C489" strokeWidth="1.5" />
        <rect x="83" y="58" width="14" height="10" rx="2.5" fill="none" stroke="#E0C489" strokeWidth="1.5" />
        <line x1="77" y1="63" x2="83" y2="63" stroke="#E0C489" strokeWidth="1.5" />

        {/* Eyes & Smile */}
        <circle cx="70" cy="63" r="2" fill="#111827" />
        <circle cx="90" cy="63" r="2" fill="#111827" />
        <path d="M74 77 Q80 82 86 77" fill="none" stroke="#381D0D" strokeWidth="1.8" strokeLinecap="round" />

        {/* Floating Rocket Launch Badge */}
        <g className="anim-rocket" transform="translate(106, 26)">
          <circle cx="18" cy="18" r="16" fill="#C39C55" />
          <path d="M18 7 C21 11 23 16 23 21 L13 21 C13 16 15 11 18 7 Z" fill="#1D4230" />
          <path d="M13 21 L10 24 H26 L23 21 Z" fill="#163325" />
          <circle cx="18" cy="14" r="2" fill="#F4E4BF" />
        </g>
      </svg>
    </div>
  );
}

export function GrowthCharacter({ className = "w-32 h-32" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes trend-pulse {
            0%, 100% { transform: translateY(0); filter: drop-shadow(0 0 0 rgba(195,156,85,0)); }
            50% { transform: translateY(-4px); filter: drop-shadow(0 0 8px rgba(195,156,85,0.7)); }
          }
          .anim-trend { animation: trend-pulse 3s ease-in-out infinite; }
        `}</style>
        {/* Glow Halo */}
        <circle cx="80" cy="80" r="74" className="fill-gold-500/20 dark:fill-gold-400/30" />
        <circle cx="80" cy="80" r="66" stroke="#3D7856" strokeWidth="1.5" strokeDasharray="4 4" strokeOpacity="0.6" />

        {/* Torso: Contemporary Ochre & Gold Business Top */}
        <path d="M42 148 C42 118 56 106 80 106 C104 106 118 118 118 148 Z" fill="#C39C55" />
        <path d="M72 106 Q80 118 88 106" fill="none" stroke="#1D4230" strokeWidth="2.5" />

        {/* Neck */}
        <rect x="73" y="88" width="14" height="20" rx="3" fill="#844B29" />

        {/* Head */}
        <ellipse cx="80" cy="68" rx="25" ry="27" fill="#8F532E" />

        {/* Elegant Crown Braids */}
        <circle cx="80" cy="38" r="17" fill="#17120E" />
        <path d="M55 64 C55 42 66 38 80 38 C94 38 105 42 105 64 C98 52 90 48 80 48 C70 48 62 52 55 64 Z" fill="#17120E" />

        {/* Earrings */}
        <circle cx="54" cy="70" r="2.5" fill="#E0C489" />
        <circle cx="106" cy="70" r="2.5" fill="#E0C489" />

        {/* Eyes & Warm Smile */}
        <circle cx="71" cy="66" r="2.2" fill="#111827" />
        <circle cx="89" cy="66" r="2.2" fill="#111827" />
        <path d="M74 80 Q80 85 86 80" fill="none" stroke="#45210D" strokeWidth="1.8" strokeLinecap="round" />

        {/* Floating Growth Trend Chart Badge */}
        <g className="anim-trend" transform="translate(18, 28)">
          <rect x="0" y="0" width="32" height="26" rx="6" fill="#1D4230" stroke="#E0C489" strokeWidth="1.5" />
          <polyline points="6,19 13,13 19,16 26,7" fill="none" stroke="#C39C55" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="26" cy="7" r="2" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

export function EnterpriseCharacter({ className = "w-32 h-32" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes crest-bob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .anim-crest { animation: crest-bob 3.6s ease-in-out infinite; }
        `}</style>
        {/* Glow Halo */}
        <circle cx="80" cy="80" r="74" className="fill-brand-600/20 dark:fill-brand-400/30" />
        <circle cx="80" cy="80" r="66" stroke="#C39C55" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.7" />

        {/* Torso: Executive Formal Suit & Gold Lapel */}
        <path d="M38 148 C38 114 52 102 80 102 C108 102 122 114 122 148 Z" fill="#163325" />
        <polygon points="68,102 80,128 92,102" fill="#F8FAFC" />
        <polygon points="77,112 83,112 85,138 80,146 75,138" fill="#C39C55" />

        {/* Neck */}
        <rect x="73" y="84" width="14" height="20" rx="3" fill="#5A341A" />

        {/* Head */}
        <ellipse cx="80" cy="64" rx="25" ry="28" fill="#6A3B1C" />

        {/* Trim Silver-flecked Executive Hair & Groomed Beard */}
        <path d="M55 56 C55 38 66 34 80 34 C94 34 105 38 105 56 C96 44 88 42 80 42 C72 42 64 44 55 56 Z" fill="#111827" />
        <path d="M66 72 C66 86 72 91 80 91 C88 91 94 86 94 72 C90 82 84 84 80 84 C76 84 70 82 66 72 Z" fill="#1A1F2C" />

        {/* Eyes */}
        <circle cx="71" cy="61" r="2.2" fill="#111827" />
        <circle cx="89" cy="61" r="2.2" fill="#111827" />
        <path d="M75 72 Q80 75 85 72" fill="none" stroke="#2B150A" strokeWidth="1.8" strokeLinecap="round" />

        {/* Floating Enterprise Landmark Pillar Badge */}
        <g className="anim-crest" transform="translate(108, 30)">
          <circle cx="16" cy="16" r="16" fill="#1D4230" stroke="#C39C55" strokeWidth="1.8" />
          <path d="M10 23 H22 M16 9 L22 12 H10 L16 9 Z M12 12 V20 M16 12 V20 M20 12 V20 M10 20 H22" stroke="#F4E4BF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}

export function MultiEntityCharacter({ className = "w-32 h-32" }) {
  return (
    <div className={`relative inline-block ${className} group`}>
      <svg
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xl transition-transform duration-300 group-hover:scale-105"
      >
        <style>{`
          @keyframes shield-left {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes shield-right {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(5px); }
          }
          .anim-shield-l { animation: shield-left 3.4s ease-in-out infinite; }
          .anim-shield-r { animation: shield-right 3.4s ease-in-out infinite; }
        `}</style>
        {/* Glow Halo */}
        <circle cx="80" cy="80" r="74" className="fill-gold-500/15 dark:fill-brand-400/25" />
        <circle cx="80" cy="80" r="66" stroke="#C39C55" strokeWidth="1.5" strokeDasharray="3 3" strokeOpacity="0.7" />

        {/* Torso: Embroidered Senator Executive Kaftan */}
        <path d="M40 148 C40 114 54 102 80 102 C106 102 120 114 120 148 Z" fill="#0E211A" />
        <rect x="77" y="102" width="6" height="46" fill="#C39C55" />

        {/* Neck */}
        <rect x="73" y="84" width="14" height="20" rx="3" fill="#6B3F23" />

        {/* Head */}
        <ellipse cx="80" cy="64" rx="25" ry="28" fill="#784728" />

        {/* Smart Trim Fade */}
        <path d="M55 56 C55 38 66 34 80 34 C94 34 105 38 105 56 C96 44 88 42 80 42 C72 42 64 44 55 56 Z" fill="#111827" />

        {/* Glasses */}
        <circle cx="69" cy="61" r="7" stroke="#E0C489" strokeWidth="1.5" fill="none" />
        <circle cx="91" cy="61" r="7" stroke="#E0C489" strokeWidth="1.5" fill="none" />
        <line x1="76" y1="61" x2="84" y2="61" stroke="#E0C489" strokeWidth="1.5" />
        <circle cx="69" cy="61" r="2" fill="#111827" />
        <circle cx="91" cy="61" r="2" fill="#111827" />

        {/* Smile */}
        <path d="M74 76 Q80 81 86 76" fill="none" stroke="#3D1D09" strokeWidth="1.8" strokeLinecap="round" />

        {/* Entity Shield 1 (Left: Co. A) */}
        <g className="anim-shield-l" transform="translate(12, 40)">
          <rect x="0" y="0" width="26" height="28" rx="6" fill="#1D4230" stroke="#C39C55" strokeWidth="1.5" />
          <text x="13" y="18" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold" fontFamily="Inter, sans-serif">A</text>
        </g>

        {/* Entity Shield 2 (Right: Co. B) */}
        <g className="anim-shield-r" transform="translate(122, 40)">
          <rect x="0" y="0" width="26" height="28" rx="6" fill="#C39C55" stroke="#1D4230" strokeWidth="1.5" />
          <text x="13" y="18" textAnchor="middle" fill="#0E211A" fontSize="10" fontWeight="bold" fontFamily="Inter, sans-serif">B</text>
        </g>
      </svg>
    </div>
  );
}
