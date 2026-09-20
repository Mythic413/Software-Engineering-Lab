import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Users2, 
  Scale, 
  Headphones, 
  Settings as SettingsIcon, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Lock, 
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  KeyRound,
  HelpCircle,
  Shield,
  Info,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import CinematicBackground from './CinematicBackground';

interface LandingLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onSignup: (email: string, password: string, name?: string) => Promise<void>;
  onSsoLogin: (email?: string, name?: string) => Promise<void>;
}

export const LandingLogin: React.FC<LandingLoginProps> = ({ 
  onLogin, 
  onSignup, 
  onSsoLogin 
}) => {
  const [ssoLoading, setSsoLoading] = useState(false);
  const [activeModal, setActiveModal] = useState<'about' | 'security' | 'help' | 'contact' | null>(null);
  const [showAltLogin, setShowAltLogin] = useState(false);
  
  // Custom Ripple & Click Animation State (Section 8 & 9)
  const [ripple, setRipple] = useState<{ x: number; y: number; active: boolean } | null>(null);
  const [cardGlowActive, setCardGlowActive] = useState(false);
  const [isButtonPressed, setIsButtonPressed] = useState(false);
  const [bgPulseActive, setBgPulseActive] = useState(false);

  // Mouse Parallax coordinates (Section 16)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Alt Form State (Optional fallback modal)
  const [email, setEmail] = useState('piyush.bale23b@iiitg.ac.in');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Piyush Bale');
  const [isSignUp, setIsSignUp] = useState(false);
  const [altLoading, setAltLoading] = useState(false);
  const [altError, setAltError] = useState<string | null>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setMousePos({ x, y });
  };

  // Section 8 & 9: Button interaction with origin-based ripple, card glow, button compression & bg reaction
  const handleAuth0Click = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (ssoLoading) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Trigger visual ripple
    setRipple({ x, y, active: true });
    setIsButtonPressed(true);
    setCardGlowActive(true);
    setBgPulseActive(true);

    // Briefly compress button then release
    setTimeout(() => {
      setIsButtonPressed(false);
    }, 180);

    // Auth0 redirection animation duration (550ms)
    setSsoLoading(true);
    setTimeout(async () => {
      try {
        await onSsoLogin('piyush.bale23b@iiitg.ac.in', 'Piyush Bale');
      } catch (err) {
        console.error('SSO error:', err);
      } finally {
        setSsoLoading(false);
        setRipple(null);
        setCardGlowActive(false);
        setBgPulseActive(false);
      }
    }, 550);
  };

  const handleAltSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAltLoading(true);
    setAltError(null);
    try {
      if (isSignUp) {
        await onSignup(email, password, name);
      } else {
        await onLogin(email, password);
      }
      setShowAltLogin(false);
    } catch (err: any) {
      setAltError(err.message || 'Authentication failed');
    } finally {
      setAltLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="min-h-screen bg-[#070605] text-[#F5F5F5] flex flex-col relative overflow-hidden select-none font-sans"
    >
      {/* Multi-Layer Technical Document-Routing Background */}
      <CinematicBackground 
        variant="login" 
        pulse={bgPulseActive} 
      />

      {/* Top Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-20 shrink-0">
        <BrandLogo size="md" showTagline={false} />

        <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-medium text-[#A8A29E]">
          <button 
            onClick={() => setActiveModal('about')}
            className="hover:text-[#F5F5F5] transition-colors"
          >
            About
          </button>
          <button 
            onClick={() => setActiveModal('security')}
            className="hover:text-[#F5F5F5] transition-colors"
          >
            Security
          </button>
          <button 
            onClick={() => setActiveModal('contact')}
            className="hover:text-[#F5F5F5] transition-colors"
          >
            Contact
          </button>
        </nav>
      </header>

      {/* Main Responsive Grid Layout */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-4 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center z-10">
        
        {/* Left Marketing Message (Section 3 & 4) */}
        <div className="lg:col-span-4 flex flex-col space-y-7">
          <div>
            {/* Small uppercase eyebrow */}
            <div className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-[#A8A29E] uppercase mb-4">
              <span className="w-2 h-2 rounded-full bg-[#F59E42] shadow-[0_0_8px_#F59E42]" />
              <span>AUTOMATE • ROUTE • GET THINGS DONE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#F5F5F5] leading-[1.12]">
              Right Image.<br />
              Right Department.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFB45C] via-[#F59E42] to-[#E58525] drop-shadow-[0_0_35px_rgba(245,158,66,0.35)]">
                Always.
              </span>
            </h1>

            {/* Description */}
            <p className="mt-5 text-sm sm:text-base text-[#A8A29E] font-normal leading-relaxed max-w-md">
              Upload documents or images and let AI route them to the right team — securely, quickly, and effortlessly.
            </p>
          </div>

          {/* Feature Row (Section 4) */}
          <div className="space-y-3.5 pt-1">
            {/* Feature 1 */}
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#120D09]/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#F59E42]/10 border border-[#F59E42]/30 flex items-center justify-center shrink-0 shadow-sm shadow-[#F59E42]/10">
                <Zap className="w-4 h-4 text-[#F59E42]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F5F5F5]">Faster Processing</h3>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Save time and reduce manual work</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#120D09]/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center shrink-0 shadow-sm shadow-[#A855F7]/10">
                <Users2 className="w-4 h-4 text-[#C084FC]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F5F5F5]">Less Manual Work</h3>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Let AI handle the sorting</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-[#120D09]/60 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 flex items-center justify-center shrink-0 shadow-sm shadow-[#10B981]/10">
                <ShieldCheck className="w-4 h-4 text-[#34D399]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#F5F5F5]">Secure & Trusted</h3>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Enterprise-ready workflow</p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Routing Visualization (Section 5) */}
        <div className="lg:col-span-4 flex items-center justify-center relative py-6">
          <div 
            className="relative w-full max-w-[360px] h-[380px] flex items-center justify-center transition-transform duration-500 ease-out"
            style={{
              transform: `perspective(1000px) rotateY(${mousePos.x * 12}deg) rotateX(${-mousePos.y * 12}deg)`
            }}
          >
            {/* SVG Connecting Curved Glowing Lines with Animated Particles (NO DASHED LINES) */}
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
              viewBox="0 0 360 380"
            >
              <defs>
                <linearGradient id="amberPathCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB45C" stopOpacity="0.95" />
                  <stop offset="50%" stopColor="#F59E42" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#E58525" stopOpacity="0.75" />
                </linearGradient>
                <linearGradient id="purplePathCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB45C" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#C084FC" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#A855F7" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="greenPathCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB45C" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#4ADE80" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="redPathCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB45C" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#F87171" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#EF4444" stopOpacity="0.8" />
                </linearGradient>
                <linearGradient id="bluePathCore" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#FFB45C" stopOpacity="0.9" />
                  <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.8" />
                </linearGradient>

                {/* Soft glow filter for optical network effect */}
                <filter id="centerRouteGlow" x="-25%" y="-45%" width="150%" height="190%">
                  <feGaussianBlur stdDeviation="3.5" result="glowBlur"/>
                  <feGaussianBlur stdDeviation="1.5" result="sharpBlur"/>
                  <feMerge>
                    <feMergeNode in="glowBlur"/>
                    <feMergeNode in="sharpBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>

                <filter id="pathParticleGlow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="pBlur"/>
                  <feMerge>
                    <feMergeNode in="pBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>

              {/* ROUTE 1: Central -> Finance (Curved upward arc) */}
              {/* Wide ambient underlay */}
              <path 
                d="M 135 175 C 175 145, 215 75, 265 52" 
                fill="none" 
                stroke="#F59E42" 
                strokeWidth="6"
                strokeOpacity="0.18"
                filter="url(#centerRouteGlow)"
              />
              {/* Illuminated core line */}
              <path 
                d="M 135 175 C 175 145, 215 75, 265 52" 
                fill="none" 
                stroke="url(#amberPathCore)" 
                strokeWidth={bgPulseActive ? "2.6" : "1.8"}
                filter="url(#centerRouteGlow)"
              />
              {/* Traveling Particle */}
              <circle r="2.5" fill="#FFE1B3" filter="url(#pathParticleGlow)">
                <animateMotion 
                  path="M 135 175 C 175 145, 215 75, 265 52" 
                  dur="2.8s" 
                  repeatCount="indefinite" 
                />
              </circle>
              {/* Extension tracer to right matrix */}
              <path 
                d="M 322 52 C 342 52, 354 44, 365 38" 
                fill="none" 
                stroke="#F59E42" 
                strokeWidth="1"
                strokeOpacity="0.35"
              />

              {/* ROUTE 2: Central -> HR (Smooth upper curve) */}
              <path 
                d="M 140 182 C 185 170, 225 138, 275 125" 
                fill="none" 
                stroke="#A855F7" 
                strokeWidth="6"
                strokeOpacity="0.18"
                filter="url(#centerRouteGlow)"
              />
              <path 
                d="M 140 182 C 185 170, 225 138, 275 125" 
                fill="none" 
                stroke="url(#purplePathCore)" 
                strokeWidth={bgPulseActive ? "2.6" : "1.8"}
                filter="url(#centerRouteGlow)"
              />
              <circle r="2.5" fill="#E9D5FF" filter="url(#pathParticleGlow)">
                <animateMotion 
                  path="M 140 182 C 185 170, 225 138, 275 125" 
                  dur="3.3s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <path 
                d="M 315 125 C 335 125, 348 118, 365 110" 
                fill="none" 
                stroke="#A855F7" 
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* ROUTE 3: Central -> Legal (Horizontal gentle wave) */}
              <path 
                d="M 145 190 C 190 190, 225 195, 278 194" 
                fill="none" 
                stroke="#22C55E" 
                strokeWidth="6"
                strokeOpacity="0.18"
                filter="url(#centerRouteGlow)"
              />
              <path 
                d="M 145 190 C 190 190, 225 195, 278 194" 
                fill="none" 
                stroke="url(#greenPathCore)" 
                strokeWidth={bgPulseActive ? "2.6" : "1.8"}
                filter="url(#centerRouteGlow)"
              />
              <circle r="2.5" fill="#BBF7D0" filter="url(#pathParticleGlow)">
                <animateMotion 
                  path="M 145 190 C 190 190, 225 195, 278 194" 
                  dur="3.7s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <path 
                d="M 324 194 C 342 194, 352 190, 365 186" 
                fill="none" 
                stroke="#22C55E" 
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* ROUTE 4: Central -> Support (Downward smooth arc) */}
              <path 
                d="M 140 198 C 185 220, 225 252, 268 262" 
                fill="none" 
                stroke="#EF4444" 
                strokeWidth="6"
                strokeOpacity="0.18"
                filter="url(#centerRouteGlow)"
              />
              <path 
                d="M 140 198 C 185 220, 225 252, 268 262" 
                fill="none" 
                stroke="url(#redPathCore)" 
                strokeWidth={bgPulseActive ? "2.6" : "1.8"}
                filter="url(#centerRouteGlow)"
              />
              <circle r="2.5" fill="#FECACA" filter="url(#pathParticleGlow)">
                <animateMotion 
                  path="M 140 198 C 185 220, 225 252, 268 262" 
                  dur="3.0s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <path 
                d="M 326 262 C 344 262, 355 255, 365 250" 
                fill="none" 
                stroke="#EF4444" 
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* ROUTE 5: Central -> Operations (Sweeping lower curve) */}
              <path 
                d="M 130 212 C 150 268, 185 315, 228 335" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="6"
                strokeOpacity="0.18"
                filter="url(#centerRouteGlow)"
              />
              <path 
                d="M 130 212 C 150 268, 185 315, 228 335" 
                fill="none" 
                stroke="url(#bluePathCore)" 
                strokeWidth={bgPulseActive ? "2.6" : "1.8"}
                filter="url(#centerRouteGlow)"
              />
              <circle r="2.5" fill="#BAE6FD" filter="url(#pathParticleGlow)">
                <animateMotion 
                  path="M 130 212 C 150 268, 185 315, 228 335" 
                  dur="3.5s" 
                  repeatCount="indefinite" 
                />
              </circle>
              <path 
                d="M 305 335 C 328 335, 348 325, 365 315" 
                fill="none" 
                stroke="#06B6D4" 
                strokeWidth="1"
                strokeOpacity="0.3"
              />
            </svg>

            {/* Central Glowing Image Squircle Card (Matching Target Screenshot) */}
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 animate-float-slow">
              <div className="relative group cursor-pointer">
                {/* Outer concentric ambient aura rings */}
                <div className="absolute -inset-5 rounded-full border border-[#FFB45C]/15 pointer-events-none" />
                <div className="absolute -inset-10 rounded-full border border-[#F59E42]/08 pointer-events-none" />

                {/* Outer amber radial glow */}
                <div className="absolute -inset-2 rounded-3xl bg-[#F59E42]/30 blur-xl group-hover:bg-[#F59E42]/45 transition-all duration-300 pointer-events-none" />
                
                {/* Squircle Container */}
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#21160F] via-[#140D08] to-[#0E0906] border-2 border-[#FFB45C] shadow-[0_0_45px_rgba(245,158,66,0.5)] flex flex-col items-center justify-center relative backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
                  <ImageIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#FFB45C] stroke-[1.8] group-hover:rotate-2 transition-transform duration-300 drop-shadow-[0_0_14px_rgba(245,158,66,0.6)]" />
                  <span className="text-[9px] font-bold text-[#FFB45C] tracking-wider uppercase mt-1">
                    IMAGE
                  </span>
                </div>
              </div>
            </div>

            {/* Department Destination Nodes (Matching Target Screenshot) */}
            {/* Finance (top right) */}
            <div className="absolute right-2 top-8 z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#140E0A]/95 border border-[#F59E42] shadow-[0_0_20px_rgba(245,158,66,0.35)] text-xs font-bold text-[#F5F5F5] backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Building2 className="w-3.5 h-3.5 text-[#F59E42]" />
                <span>Finance</span>
              </div>
            </div>

            {/* HR (upper right) */}
            <div className="absolute right-0 top-[115px] z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#140E0A]/95 border border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.35)] text-xs font-bold text-[#F5F5F5] backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Users2 className="w-3.5 h-3.5 text-[#C084FC]" />
                <span>HR</span>
              </div>
            </div>

            {/* Legal (middle right) */}
            <div className="absolute right-1 top-[182px] z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#140E0A]/95 border border-[#22C55E] shadow-[0_0_20px_rgba(34,197,94,0.35)] text-xs font-bold text-[#F5F5F5] backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Scale className="w-3.5 h-3.5 text-[#4ADE80]" />
                <span>Legal</span>
              </div>
            </div>

            {/* Support (lower right) */}
            <div className="absolute right-4 top-[252px] z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#140E0A]/95 border border-[#EF4444] shadow-[0_0_20px_rgba(239,68,68,0.35)] text-xs font-bold text-[#F5F5F5] backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <Headphones className="w-3.5 h-3.5 text-[#F87171]" />
                <span>Support</span>
              </div>
            </div>

            {/* Operations (bottom right) */}
            <div className="absolute right-14 bottom-3 z-10">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#140E0A]/95 border border-[#06B6D4] shadow-[0_0_20px_rgba(6,182,212,0.35)] text-xs font-bold text-[#F5F5F5] backdrop-blur-md hover:scale-105 transition-all duration-200 cursor-pointer">
                <SettingsIcon className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Operations</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Hero Column: Compact Glassmorphic Login Card (Section 4, 8) */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end">
          <div 
            className={`w-full max-w-[360px] bg-[rgba(16,11,8,0.88)] hover:bg-[rgba(24,16,11,0.92)] border border-[rgba(245,158,66,0.22)] hover:border-[rgba(245,158,66,0.45)] rounded-[20px] p-7 backdrop-blur-xl shadow-2xl shadow-black/90 relative transition-all duration-300 ease-out group hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(245,158,66,0.18)] ${
              cardGlowActive ? 'ring-2 ring-[#FFB45C]/60 shadow-[0_0_50px_rgba(245,158,66,0.4)]' : ''
            }`}
          >
            {/* Top golden edge hairline */}
            <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[#FFB45C]/50 to-transparent" />

            {/* Logo Badge in Login Card */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFB45C] to-[#F59E42] shadow-lg shadow-[#F59E42]/30 flex items-center justify-center text-[#120D09] ring-1 ring-[#FFB45C]/50 mb-3">
                <ImageIcon className="w-6 h-6 text-[#120D09] stroke-[2.4]" />
              </div>
              
              <span className="text-xl font-black text-[#F5F5F5] tracking-tight">
                Image<span className="text-[#F59E42]">Route</span>
              </span>

              <h2 className="text-lg font-bold text-[#F5F5F5] tracking-tight mt-3">
                Welcome Back
              </h2>
              <p className="text-xs text-[#A8A29E] mt-1 px-2 font-normal leading-relaxed">
                Sign in with your organization account to continue
              </p>
            </div>

            {/* Continue with Auth0 Button with Click Interaction (Section 7) */}
            <div className="relative">
              <button
                type="button"
                onClick={handleAuth0Click}
                disabled={ssoLoading}
                className={`w-full relative overflow-hidden py-3.5 px-4 bg-gradient-to-r from-[#FFB45C] via-[#F59E42] to-[#E58525] hover:brightness-105 text-[#120D09] font-bold rounded-xl shadow-lg shadow-[#F59E42]/25 transition-all duration-200 flex items-center justify-center gap-2 text-sm tracking-tight active:scale-95 ${
                  isButtonPressed ? 'scale-95 brightness-95' : ''
                }`}
              >
                {/* Circular Expanding Ripple Effect */}
                {ripple && (
                  <span 
                    className="absolute rounded-full bg-white/40 pointer-events-none animate-ping"
                    style={{
                      left: ripple.x - 20,
                      top: ripple.y - 20,
                      width: 40,
                      height: 40,
                      animationDuration: '550ms'
                    }}
                  />
                )}

                {ssoLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#120D09] border-t-transparent rounded-full animate-spin" />
                    <span>Connecting to Auth0...</span>
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 text-[#120D09] fill-[#120D09]" />
                    <span>Continue with Auth0</span>
                    <ArrowRight className="w-4 h-4 text-[#120D09] ml-1 stroke-[2.5]" />
                  </>
                )}
              </button>
            </div>

            {/* Divider OR */}
            <div className="relative my-5 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#2D1F16]" />
              </div>
              <span className="relative px-3 bg-[#120D09] text-[10px] font-bold text-[#716B66] uppercase tracking-widest">
                OR
              </span>
            </div>

            {/* Security badges row */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-[#A8A29E] font-medium py-1">
              <div className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#F59E42]" />
                <span>Secure</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Users2 className="w-3.5 h-3.5 text-[#F59E42]" />
                <span>Single Sign-On</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F59E42]" />
                <span>Trusted</span>
              </div>
            </div>

            {/* Secondary login helper for test accounts without clutter */}
            <div className="mt-4 pt-3 border-t border-[#2D1F16]/60 text-center">
              <button
                type="button"
                onClick={() => setShowAltLogin(!showAltLogin)}
                className="text-[11px] text-[#A8A29E] hover:text-[#FFB45C] transition-colors inline-flex items-center gap-1"
              >
                <span>Demo or Password Login</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer bar matching reference (without mountain landscape) */}
      <footer className="w-full mt-auto relative z-10 border-t border-[rgba(255,255,255,0.06)] bg-[#050505]/80 backdrop-blur-xs">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="font-script text-xl sm:text-2xl text-transparent bg-clip-text bg-gradient-to-r from-[#FFB45C] to-[#E58525]">
              Images move work forward.
            </span>
            <span className="hidden md:inline text-[10px] font-bold tracking-[0.2em] text-[#716B66] uppercase">
              • NEXT.JS & AUTH0
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#716B66]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#22C55E]" />
              <span className="text-[#A8A29E]">All systems operational</span>
            </span>
            <span>•</span>
            <span>ImageRoute v1.0</span>
          </div>
        </div>
      </footer>

      {/* Modal Dialog: About, Security, Help */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120D09] border border-[#2D1F16] rounded-2xl max-w-lg w-full p-6 text-[#F5F5F5] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D1F16]">
              <h3 className="text-lg font-bold text-[#F5F5F5] capitalize flex items-center gap-2">
                {activeModal === 'about' && <Info className="w-4 h-4 text-[#F59E42]" />}
                {activeModal === 'security' && <ShieldCheck className="w-4 h-4 text-[#10B981]" />}
                {(activeModal === 'help' || activeModal === 'contact') && <HelpCircle className="w-4 h-4 text-[#06B6D4]" />}
                <span>{activeModal === 'about' ? 'About ImageRoute' : activeModal === 'security' ? 'Enterprise Security' : 'Contact & Support'}</span>
              </h3>
              <button 
                onClick={() => setActiveModal(null)}
                className="text-[#716B66] hover:text-[#F5F5F5] text-xs font-bold px-2 py-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="py-4 text-xs sm:text-sm text-[#A8A29E] leading-relaxed space-y-3">
              {activeModal === 'about' && (
                <>
                  <p>
                    ImageRoute is a high-precision enterprise routing engine designed to eliminate manual classification of invoices, employee resumes, NDAs, complaints, and warehouse orders.
                  </p>
                  <p>
                    With automated multi-model vision and OCR extraction, images are categorized and forwarded to the target department in under 300 milliseconds with verified audit records.
                  </p>
                </>
              )}

              {activeModal === 'security' && (
                <>
                  <p>
                    ImageRoute enforces zero-trust architecture. All document payloads are processed in isolated sandboxes and encrypted in flight with TLS 1.3 and at rest with AES-256.
                  </p>
                  <p>
                    Authentication is secured through verified Auth0 enterprise single sign-on with token rotation, role-based access control, and granular session invalidation.
                  </p>
                </>
              )}

              {(activeModal === 'help' || activeModal === 'contact') && (
                <>
                  <p>
                    Need assistance connecting your company's Auth0 tenant, configuring webhook dispatch pipelines, or fine-tuning routing confidence thresholds?
                  </p>
                  <p>
                    Contact our solutions desk at <span className="text-[#FFB45C] font-mono">support@imageroute.ai</span> or check the documentation.
                  </p>
                </>
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 bg-[#2D1F16] hover:bg-[#3D291C] text-[#F5F5F5] font-semibold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alternative Login Modal for local testing / custom credentials */}
      {showAltLogin && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#120D09] border border-[#2D1F16] rounded-2xl max-w-md w-full p-6 text-[#F5F5F5] shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#2D1F16]">
              <span className="text-sm font-bold text-[#F5F5F5]">
                {isSignUp ? 'Create Test Account' : 'Direct / Password Access'}
              </span>
              <button 
                onClick={() => setShowAltLogin(false)}
                className="text-[#716B66] hover:text-[#F5F5F5] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {altError && (
              <div className="my-3 p-2.5 rounded-lg bg-red-950/50 border border-red-800 text-xs text-red-300">
                {altError}
              </div>
            )}

            <form onSubmit={handleAltSubmit} className="space-y-3 mt-4 text-xs">
              {isSignUp && (
                <div>
                  <label className="block text-[#A8A29E] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#1A120D] border border-[#2D1F16] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#F59E42]"
                  />
                </div>
              )}

              <div>
                <label className="block text-[#A8A29E] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A120D] border border-[#2D1F16] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#F59E42]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#A8A29E] mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#1A120D] border border-[#2D1F16] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-[#F59E42]"
                  required
                />
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={altLoading}
                  className="w-full py-2.5 bg-[#F59E42] hover:bg-[#FFB45C] text-[#120D09] font-bold rounded-xl transition-colors"
                >
                  {altLoading ? 'Signing In...' : isSignUp ? 'Create & Sign In' : 'Sign In'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSsoLogin('piyush.bale23b@iiitg.ac.in', 'Piyush Bale');
                    setShowAltLogin(false);
                  }}
                  className="w-full py-2 bg-[#1A120D] hover:bg-[#251A13] border border-[#2D1F16] text-[#FFB45C] font-semibold rounded-xl text-[11px] transition-colors"
                >
                  ⚡ Instant Demo Sign In as Piyush Bale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingLogin;
