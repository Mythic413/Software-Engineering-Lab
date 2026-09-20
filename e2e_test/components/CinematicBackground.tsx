import React, { useEffect, useState } from 'react';

interface CinematicBackgroundProps {
  pulse?: boolean;
  variant?: 'login' | 'dashboard' | 'route' | 'queue';
  activeStep?: 'idle' | 'upload' | 'analyze' | 'classify' | 'route' | 'complete';
  targetDept?: string;
  showWorkflowNodes?: boolean;
}

export const CinematicBackground: React.FC<CinematicBackgroundProps> = ({
  pulse = false,
  variant = 'dashboard',
  activeStep = 'idle',
  targetDept,
  showWorkflowNodes = false
}) => {
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [clickPulse, setClickPulse] = useState<{ x: number; y: number; active: boolean } | null>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      const isInteractive = target?.closest('button') || target?.closest('a') || target?.closest('.interactive-click');
      if (isInteractive) {
        setClickPulse({ x: e.clientX, y: e.clientY, active: true });
        setTimeout(() => setClickPulse(null), 600);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('click', handleClick, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  const isLogin = variant === 'login';
  const isRouting = activeStep === 'analyze' || activeStep === 'classify' || activeStep === 'route';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#050403]">
      {/* =========================================================================
          LAYER 1: BASE ENVIRONMENT (#050403 -> #090705 -> #100A07)
          Subtle, non-flat layered radial gradients
          ========================================================================= */}
      <div className="absolute inset-0 bg-[#050403]" />
      
      {/* Subtle base gradient transitions */}
      <div 
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(900px circle at 52% 50%, rgba(120, 65, 25, 0.10), transparent 65%),
            radial-gradient(1200px 800px at 50% 35%, rgba(245, 158, 66, 0.06) 0%, rgba(16, 10, 7, 0.4) 45%, transparent 75%),
            radial-gradient(circle 850px at 82% 25%, rgba(20, 14, 10, 0.8) 0%, transparent 65%),
            radial-gradient(ellipse 1100px 600px at 50% 95%, rgba(245, 158, 66, 0.05) 0%, rgba(16, 10, 7, 0.8) 50%, transparent 80%)
          `
        }}
      />

      {/* =========================================================================
          LAYER 2: ATMOSPHERIC AMBER & DEEP ESPRESSO ILLUMINATION
          Large, extremely soft diffused ambient light fields (blur 80px - 140px)
          No hard edges, no visible circles
          ========================================================================= */}
      <div 
        className="absolute inset-0 transition-opacity duration-1000"
        style={{ opacity: pulse || isRouting ? 1.3 : 1 }}
      >
        {/* Core routing ambient glow behind central area */}
        <div 
          className="absolute top-[28%] left-[42%] -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 158, 66, 0.09) 0%, rgba(200, 117, 42, 0.04) 45%, rgba(110, 59, 28, 0.015) 70%, transparent 85%)',
            filter: 'blur(70px)'
          }}
        />

        {/* Lower flowing light aura across bottom sweep */}
        <div 
          className="absolute bottom-[-10%] left-[30%] w-[900px] h-[350px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(245, 158, 66, 0.06) 0%, rgba(168, 85, 247, 0.02) 40%, transparent 75%)',
            filter: 'blur(80px)'
          }}
        />

        {/* Upper ambient fill */}
        <div 
          className="absolute top-[-5%] right-[20%] w-[650px] h-[400px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(140, 75, 25, 0.05) 0%, transparent 70%)',
            filter: 'blur(90px)'
          }}
        />
      </div>

      {/* =========================================================================
          LAYER 3: TECHNICAL GRID
          Ultra-fine, nearly invisible precision grid (opacity 0.018 - 0.024)
          Fades with radial mask to maintain clean left & right content zones
          ========================================================================= */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'radial-gradient(ellipse 1000px 700px at 50% 50%, black 35%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 1000px 700px at 50% 50%, black 35%, transparent 80%)'
        }}
      />

      {/* =========================================================================
          LAYER 4: FLOATING DOCUMENT SILHOUETTES AT MULTIPLE DEPTHS
          Invoices, PDFs, reports, scanned images floating with amber rims & mock content
          Deep Background (blur 10-18px, opacity 0.025-0.04)
          Midground (blur 2-5px, opacity 0.05-0.08)
          ========================================================================= */}
      <div className={`absolute inset-0 pointer-events-none ${isLogin ? 'opacity-100' : 'opacity-40'} transition-opacity duration-700`}>
        
        {/* Document 1: Top-Left (Behind left copy / above headline) - Deep 3D tilt */}
        <div 
          className="absolute top-[8%] left-[7%] w-48 h-64 rounded-xl border border-[#F59E42]/20 bg-[#140E0A]/40 p-3.5 shadow-2xl backdrop-blur-xs transition-transform duration-1000 hidden md:block"
          style={{
            transform: 'perspective(1200px) rotateX(18deg) rotateY(-22deg) rotateZ(-10deg)',
            filter: 'blur(3px)',
            opacity: 0.075
          }}
        >
          <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
            <div className="w-14 h-2 rounded bg-[#F59E42]/35" />
            <div className="w-4 h-4 rounded bg-[#F59E42]/20" />
          </div>
          <div className="space-y-2 mb-4">
            <div className="w-full h-1.5 rounded bg-[#A8A29E]/25" />
            <div className="w-5/6 h-1.5 rounded bg-[#A8A29E]/20" />
            <div className="w-4/6 h-1.5 rounded bg-[#A8A29E]/20" />
            <div className="w-3/6 h-1.5 rounded bg-[#A8A29E]/15" />
          </div>
          <div className="w-full h-24 rounded-lg bg-[#18110B]/80 border border-[#F59E42]/15 p-2 flex flex-col justify-end">
            <div className="w-16 h-1.5 rounded bg-[#FFB45C]/35 mb-1" />
            <div className="w-24 h-1.5 rounded bg-[#A8A29E]/20" />
          </div>
        </div>

        {/* Document 2: Upper Center (Above central processing node) - Crisp midground */}
        <div 
          className="absolute top-[6%] left-[40%] w-40 h-52 rounded-xl border border-[#FFB45C]/25 bg-[#120B07]/55 p-3 shadow-xl hidden lg:block"
          style={{
            transform: 'perspective(1000px) rotateX(22deg) rotateY(10deg) rotateZ(5deg)',
            filter: 'blur(2px)',
            opacity: 0.08
          }}
        >
          <div className="flex items-center gap-2 mb-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFB45C]/40" />
            <div className="w-20 h-1.5 rounded bg-[#A8A29E]/30" />
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="w-full h-1 rounded bg-[#A8A29E]/25" />
            <div className="w-11/12 h-1 rounded bg-[#A8A29E]/20" />
            <div className="w-8/12 h-1 rounded bg-[#A8A29E]/20" />
            <div className="w-10/12 h-1 rounded bg-[#A8A29E]/15" />
          </div>
          <div className="pt-2 border-t border-white/5 flex justify-between items-center">
            <div className="w-12 h-1.5 rounded bg-[#F59E42]/35" />
            <div className="w-6 h-1.5 rounded bg-[#22C55E]/40" />
          </div>
        </div>

        {/* Document 3: Upper Right Background (Tilted preview card with glowing image) */}
        <div 
          className="absolute top-[14%] right-[22%] w-52 h-64 rounded-xl border border-[#FFB45C]/20 bg-[#160F0A]/50 p-3.5 shadow-2xl hidden lg:block"
          style={{
            transform: 'perspective(1000px) rotateX(16deg) rotateY(-18deg) rotateZ(8deg)',
            filter: 'blur(2px)',
            opacity: 0.075
          }}
        >
          <div className="w-24 h-2 rounded bg-[#FFB45C]/35 mb-3" />
          <div className="space-y-2 mb-4">
            <div className="w-full h-1.5 rounded bg-[#A8A29E]/25" />
            <div className="w-3/4 h-1.5 rounded bg-[#A8A29E]/20" />
            <div className="w-5/6 h-1.5 rounded bg-[#A8A29E]/20" />
          </div>
          {/* Simulated Image preview inside document */}
          <div className="w-full h-24 rounded-lg bg-[#0C0805] border border-[#FFB45C]/15 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-[#F59E42]/15 border border-[#F59E42]/30 flex items-center justify-center">
              <div className="w-4 h-4 rounded bg-[#FFB45C]/40" />
            </div>
            <div className="w-16 h-1 rounded bg-[#A8A29E]/25 mt-2" />
          </div>
        </div>

        {/* Document 4: Deep Background (Heavily blurred document silhouette top far-right) */}
        <div 
          className="absolute top-[5%] right-[6%] w-44 h-56 rounded-xl border border-white/10 bg-[#100B08]/30 p-3 shadow-xl hidden xl:block"
          style={{
            transform: 'perspective(1400px) rotateX(28deg) rotateY(-30deg) rotateZ(12deg)',
            filter: 'blur(12px)',
            opacity: 0.035
          }}
        >
          <div className="w-16 h-2 rounded bg-white/20 mb-3" />
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded bg-white/15" />
            <div className="w-5/6 h-1.5 rounded bg-white/10" />
          </div>
        </div>

        {/* Document 5: Bottom-Left (Subtle floating invoice/report) */}
        <div 
          className="absolute bottom-[8%] left-[10%] w-44 h-56 rounded-xl border border-[#F59E42]/20 bg-[#130D09]/45 p-3.5 shadow-xl hidden md:block"
          style={{
            transform: 'perspective(1000px) rotateX(-16deg) rotateY(18deg) rotateZ(-7deg)',
            filter: 'blur(3px)',
            opacity: 0.07
          }}
        >
          <div className="flex justify-between items-center mb-2.5">
            <div className="w-16 h-2 rounded bg-[#F59E42]/35" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#22C55E]/40" />
          </div>
          <div className="space-y-1.5 mb-3">
            <div className="w-full h-1 rounded bg-[#A8A29E]/25" />
            <div className="w-4/5 h-1 rounded bg-[#A8A29E]/20" />
            <div className="w-3/5 h-1 rounded bg-[#A8A29E]/20" />
          </div>
          <div className="h-24 rounded bg-[#1B130E]/70 border border-white/5 p-2 flex flex-col justify-end">
            <div className="w-14 h-1.5 rounded bg-[#FFB45C]/30 mb-1" />
            <div className="w-20 h-1.5 rounded bg-[#A8A29E]/20" />
          </div>
        </div>

        {/* Document 6: Bottom-Right (Deep blurred manifest) */}
        <div 
          className="absolute bottom-[10%] right-[8%] w-48 h-60 rounded-xl border border-white/10 bg-[#100A07]/40 p-3.5 shadow-2xl hidden lg:block"
          style={{
            transform: 'perspective(1200px) rotateX(-18deg) rotateY(-16deg) rotateZ(9deg)',
            filter: 'blur(5px)',
            opacity: 0.05
          }}
        >
          <div className="w-16 h-2 rounded bg-[#A8A29E]/30 mb-3" />
          <div className="space-y-2">
            <div className="w-full h-1.5 rounded bg-[#A8A29E]/20" />
            <div className="w-5/6 h-1.5 rounded bg-[#A8A29E]/20" />
            <div className="w-2/3 h-1.5 rounded bg-[#A8A29E]/20" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          LAYER 5, 6, 7: SWEEPING CURVED DATA STREAMS & GLOWING FIBER TRAILS
          Continuous, organic curved glowing paths (NO DASHES!) with luminous cores
          and travelling 1-3px glowing data particles
          ========================================================================= */}
      <div className="absolute inset-0 pointer-events-none">
        <svg 
          className="w-full h-full object-cover" 
          viewBox="0 0 1440 900" 
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Luminous Glow Filter for Core Paths */}
            <filter id="vectorLineGlow" x="-30%" y="-50%" width="160%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
              <feGaussianBlur stdDeviation="8" result="wideBlur"/>
              <feMerge>
                <feMergeNode in="wideBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>

            <filter id="softFiberGlow" x="-20%" y="-40%" width="140%" height="180%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Radiant Flow Gradients */}
            <linearGradient id="primaryAmberStream" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E42" stopOpacity="0" />
              <stop offset="25%" stopColor="#F59E42" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#FFB45C" stopOpacity="0.75" />
              <stop offset="85%" stopColor="#E58525" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#9A5B25" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="lowerArcGoldenStream" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F59E42" stopOpacity="0" />
              <stop offset="30%" stopColor="#FFB45C" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#F59E42" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#C8752A" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="wideAtmosphereSweep" x1="0%" y1="50%" x2="100%" y2="50%">
              <stop offset="0%" stopColor="#F59E42" stopOpacity="0" />
              <stop offset="40%" stopColor="#FFB45C" stopOpacity="0.25" />
              <stop offset="75%" stopColor="#F59E42" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#6E3B1C" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Sweeping Luminous Golden Fiber Trails Across Bottom & Mid Canvas (Matching Image 1) */}
          <g opacity={isLogin ? "0.75" : "0.4"}>
            {/* Stream 1: Sweeping bottom-left to bottom-right arc */}
            <path 
              d="M -60 780 C 320 840, 720 740, 1500 810" 
              fill="none" 
              stroke="url(#primaryAmberStream)" 
              strokeWidth="1.6"
              filter="url(#softFiberGlow)"
            />
            {/* Wider soft aura underlay for Stream 1 */}
            <path 
              d="M -60 780 C 320 840, 720 740, 1500 810" 
              fill="none" 
              stroke="#F59E42" 
              strokeWidth="6"
              strokeOpacity="0.1"
              filter="url(#vectorLineGlow)"
            />

            {/* Stream 2: Upper sweeping data flow from left into center matrix */}
            <path 
              d="M -80 320 C 240 280, 480 390, 760 410" 
              fill="none" 
              stroke="url(#wideAtmosphereSweep)" 
              strokeWidth="1.2"
              filter="url(#softFiberGlow)"
            />

            {/* Stream 3: Golden upward curved arc from center-bottom to right-middle */}
            <path 
              d="M 520 820 C 820 720, 1100 580, 1520 520" 
              fill="none" 
              stroke="url(#lowerArcGoldenStream)" 
              strokeWidth="1.4"
              filter="url(#softFiberGlow)"
            />

            {/* Stream 4: Subtle ambient high wave */}
            <path 
              d="M 220 180 C 580 120, 920 220, 1480 160" 
              fill="none" 
              stroke="url(#wideAtmosphereSweep)" 
              strokeWidth="1"
              opacity="0.6"
            />
          </g>

          {/* Traveling Luminous Data Particles (Smooth, subtle, 1-3px glowing particles) */}
          <g opacity={isLogin ? "0.9" : "0.5"}>
            {/* Particle on Stream 1 */}
            <circle r="2.5" fill="#FFE1B3" filter="url(#vectorLineGlow)">
              <animateMotion 
                path="M -60 780 C 320 840, 720 740, 1500 810" 
                dur="8.5s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* Particle on Stream 2 */}
            <circle r="2" fill="#FFB45C" filter="url(#softFiberGlow)">
              <animateMotion 
                path="M -80 320 C 240 280, 480 390, 760 410" 
                dur="6.2s" 
                repeatCount="indefinite" 
              />
            </circle>

            {/* Particle on Stream 3 */}
            <circle r="2.2" fill="#FFB45C" filter="url(#vectorLineGlow)">
              <animateMotion 
                path="M 520 820 C 820 720, 1100 580, 1520 520" 
                dur="7.0s" 
                repeatCount="indefinite" 
              />
            </circle>
          </g>

          {/* Faint Concentric Orbital Rings around AI routing hub (Section 8) */}
          <g transform="translate(680, 410)" opacity={isLogin ? (pulse || isRouting ? "0.65" : "0.4") : "0.2"}>
            <circle r="110" fill="none" stroke="#F59E42" strokeWidth="0.8" strokeOpacity="0.15" />
            <circle r="180" fill="none" stroke="#FFB45C" strokeWidth="0.6" strokeOpacity="0.08" />
            <circle r="270" fill="none" stroke="#9A5B25" strokeWidth="0.5" strokeOpacity="0.04" />
          </g>

          {/* Subtle document-routing network: image -> local model -> department nodes */}
          <g opacity={isLogin ? (pulse || isRouting ? "0.34" : "0.20") : "0.10"}>
            <path d="M 220 470 C 390 430, 500 430, 680 410" fill="none" stroke="#FFB45C" strokeWidth="0.9" />
            <path d="M 680 410 C 860 315, 1040 250, 1230 250" fill="none" stroke="#F59E42" strokeWidth="0.8" />
            <path d="M 680 410 C 900 400, 1050 390, 1260 410" fill="none" stroke="#A855F7" strokeWidth="0.8" />
            <path d="M 680 410 C 870 500, 1050 540, 1230 570" fill="none" stroke="#22C55E" strokeWidth="0.8" />
            <path d="M 680 410 C 820 560, 980 650, 1130 690" fill="none" stroke="#06B6D4" strokeWidth="0.8" />
            <circle cx="220" cy="470" r="3" fill="#FFB45C" />
            <circle cx="680" cy="410" r="6" fill="#FFB45C" filter="url(#vectorLineGlow)" />
            <circle cx="1230" cy="250" r="3" fill="#F59E42" />
            <circle cx="1260" cy="410" r="3" fill="#A855F7" />
            <circle cx="1230" cy="570" r="3" fill="#22C55E" />
            <circle cx="1130" cy="690" r="3" fill="#06B6D4" />
            <circle r="2.4" fill="#FFE1B3" filter="url(#softFiberGlow)">
              <animateMotion path="M 220 470 C 390 430, 500 430, 680 410" dur="5.5s" repeatCount="indefinite" />
            </circle>
            <circle r="2" fill="#FFB45C" filter="url(#softFiberGlow)">
              <animateMotion path="M 680 410 C 860 315, 1040 250, 1230 250" dur="7.2s" repeatCount="indefinite" />
            </circle>
            <circle r="2" fill="#A855F7" filter="url(#softFiberGlow)">
              <animateMotion path="M 680 410 C 900 400, 1050 390, 1260 410" dur="6.5s" repeatCount="indefinite" />
            </circle>
          </g>
        </svg>
      </div>

      {/* =========================================================================
          LAYER 6: WORKFLOW MATRIX IN BACKGROUND (Analyze / Classify / Route / Automate)
          Matches target reference Image 1 right-hand background text & nodes
          ========================================================================= */}
      {isLogin && (
        <div className="absolute top-[20%] right-[23%] z-0 hidden xl:flex flex-col space-y-14 pointer-events-none opacity-30 select-none font-mono tracking-[0.3em] text-[11px] text-[#A8A29E]">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFB45C] shadow-[0_0_8px_#FFB45C]" />
            <span className="text-[#D6D3D1]">ANALYZE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#A855F7] shadow-[0_0_8px_#A855F7]" />
            <span className="text-[#D6D3D1]">CLASSIFY</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            <span className="text-[#D6D3D1]">ROUTE</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] shadow-[0_0_8px_#06B6D4]" />
            <span className="text-[#D6D3D1]">AUTOMATE</span>
          </div>
        </div>
      )}

      {/* =========================================================================
          LAYER 7: INTERACTIVE CURSOR SPOTLIGHT
          Soft 240px amber glow following the mouse
          ========================================================================= */}
      {cursorPos && (
        <div 
          className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(240px circle at ${cursorPos.x}px ${cursorPos.y}px, rgba(245, 158, 66, 0.045), transparent 75%)`
          }}
        />
      )}

      {/* =========================================================================
          LAYER 8: CLICK REACTION PULSE (400-700ms radial wave)
          ========================================================================= */}
      {clickPulse && (
        <div 
          className="absolute rounded-full pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: clickPulse.x - 240,
            top: clickPulse.y - 240,
            width: 480,
            height: 480,
            background: 'radial-gradient(circle, rgba(255, 180, 92, 0.18) 0%, rgba(245, 158, 66, 0.06) 45%, transparent 70%)',
            filter: 'blur(35px)',
            animation: 'pulseExpand 600ms ease-out forwards'
          }}
        />
      )}
    </div>
  );
};

export default CinematicBackground;
