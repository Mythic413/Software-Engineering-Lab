import React from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7 p-1.5 rounded-lg',
    md: 'w-8 h-8 p-1.5 rounded-xl',
    lg: 'w-10 h-10 p-2 rounded-xl'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Amber/Orange icon badge matching reference screenshot */}
      <div className={`${iconSizes[size]} bg-gradient-to-br from-[#FFB45C] via-[#F59E42] to-[#D97706] shadow-lg shadow-[#F59E42]/25 flex items-center justify-center text-[#120D09] ring-1 ring-[#FFB45C]/40 shrink-0`}>
        <ImageIcon className="w-full h-full text-[#120D09] drop-shadow-sm stroke-[2.2]" />
      </div>

      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-extrabold tracking-tight text-[#F5F5F5] flex items-center leading-none`}>
          <span>Image</span><span className="text-[#F59E42]">Route</span>
        </span>
        {showTagline && (
          <span className="text-[8px] sm:text-[9px] font-bold tracking-[0.18em] text-[#A8A29E] uppercase mt-1">
            RIGHT IMAGE. RIGHT DEPARTMENT. <span className="text-[#F59E42]">ALWAYS.</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default BrandLogo;

