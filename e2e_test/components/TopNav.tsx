import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, User, ShieldCheck, LogOut, ExternalLink } from 'lucide-react';
import { UserProfile } from '../types';

interface TopNavProps {
  user: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onLogout: () => void;
  onOpenProfile: () => void;
  unreadNotifications?: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  user,
  searchQuery,
  onSearchChange,
  onLogout,
  onOpenProfile,
  unreadNotifications = 2
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // User initials (PB for Piyush Bale)
  const displayName = user.name || (user.email.includes('piyush') ? 'Piyush Bale' : user.email.split('@')[0]);
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PB';

  return (
    <header className="h-16 bg-[rgba(10,7,5,0.85)] border-b border-[rgba(245,158,66,0.18)] px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 backdrop-blur-md">
      {/* Search Input matching screenshot */}
      <div className="relative w-72 sm:w-96">
        <Search className="w-4 h-4 text-[#77706A] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search images, departments..."
          className="w-full bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-xl pl-9 pr-4 py-2 text-xs text-[#F5F5F5] placeholder:text-[#77706A] focus:outline-none focus:border-[#F59E42] focus:ring-1 focus:ring-[#F59E42]/30 transition-all backdrop-blur-sm"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#77706A] hover:text-[#A8A29E]"
          >
            ×
          </button>
        )}
      </div>

      {/* Right Controls: Notifications & User profile pill */}
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-[#A8A29E] hover:text-[#F5F5F5] hover:bg-[rgba(26,18,13,0.6)] transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadNotifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F59E42] shadow-[0_0_8px_#F59E42]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[rgba(18,12,8,0.95)] border border-[rgba(245,158,66,0.25)] rounded-2xl p-4 shadow-2xl z-30 backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[rgba(245,158,66,0.15)]">
                <span className="text-xs font-bold text-[#F5F5F5]">Notifications</span>
                <span className="text-[10px] text-[#FFB45C] font-semibold">2 New</span>
              </div>
              <div className="mt-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.15)]">
                  <p className="font-semibold text-[#F5F5F5]">invoice_2048.jpg routed to Finance</p>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">2 min ago • 96% confidence</p>
                </div>
                <div className="p-2.5 rounded-lg bg-[#F59E42]/10 border border-[#F59E42]/20">
                  <p className="font-semibold text-[#FFB45C]">Image requires operator review</p>
                  <p className="text-[10px] text-[#A8A29E] mt-0.5">blurry_doc.png • 62% confidence</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User profile dropdown pill matching reference */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[rgba(20,13,9,0.72)] hover:bg-[rgba(26,18,13,0.85)] border border-[rgba(245,158,66,0.20)] hover:border-[#F59E42]/50 transition-all group shadow-sm"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#FFB45C] to-[#F59E42] text-[#120D09] font-black text-xs flex items-center justify-center shadow-sm">
              {initials}
            </div>
            <span className="text-xs font-semibold text-[#F5F5F5] group-hover:text-white max-w-[120px] truncate">
              {displayName}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#77706A] group-hover:text-[#A8A29E] transition-transform" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[rgba(18,12,8,0.95)] border border-[rgba(245,158,66,0.25)] rounded-2xl p-2 shadow-2xl z-30 backdrop-blur-xl">
              <div className="px-3 py-2 border-b border-[rgba(245,158,66,0.15)] mb-1">
                <p className="text-xs font-bold text-[#F5F5F5] truncate">{displayName}</p>
                <p className="text-[10px] text-[#A8A29E] truncate">{user.email}</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#F59E42]/20 text-[#FFB45C] border border-[#F59E42]/30">
                  {user.role}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onOpenProfile();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A8A29E] hover:text-[#F5F5F5] hover:bg-[rgba(26,18,13,0.75)] rounded-lg transition-colors text-left"
              >
                <User className="w-3.5 h-3.5 text-[#F59E42]" />
                <span>Account Profile</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-left mt-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopNav;
