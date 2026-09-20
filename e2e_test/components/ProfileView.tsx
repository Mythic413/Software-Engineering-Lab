import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Building, 
  ShieldCheck, 
  KeyRound, 
  LogOut, 
  CheckCircle2, 
  Lock, 
  Smartphone, 
  Globe, 
  Edit3,
  Layers,
  ChevronRight,
  Database
} from 'lucide-react';
import { UserProfile } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onLogout: () => void;
  onUpdateName?: (newName: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onLogout,
  onUpdateName
}) => {
  const displayName = user.name || 'Piyush Bale';
  const email = user.email || 'piyush.bale23b@iiitg.ac.in';
  const [isEditing, setIsEditing] = useState(false);
  const [nameInput, setNameInput] = useState(displayName);

  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'PB';

  const handleSave = () => {
    if (onUpdateName) {
      onUpdateName(nameInput);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 page-enter max-w-5xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F5F5F5] tracking-tight">
          Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#A8A29E] mt-1 font-medium">
          Manage your account settings and enterprise credentials.
        </p>
      </div>

      {/* Profile Header & Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Avatar & Account Details Card */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Avatar & Quick Info */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-[rgba(245,158,66,0.15)]">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFB45C] to-[#E58525] text-[#120D09] font-black text-xl flex items-center justify-center shadow-lg shadow-[#F59E42]/20 ring-1 ring-[#FFB45C]/50">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#F5F5F5]">{displayName}</h2>
                  <p className="text-xs text-[#A8A29E] mt-0.5">{email}</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-3 py-1.5 rounded-xl bg-[rgba(26,18,13,0.85)] hover:bg-[rgba(36,24,17,0.95)] border border-[rgba(245,158,66,0.30)] hover:border-[#F59E42]/60 text-xs font-semibold text-[#FFB45C] flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel' : 'Edit Profile'}</span>
              </button>
            </div>

            {/* Inline Name Edit Field */}
            {isEditing && (
              <div className="p-4 rounded-xl bg-[rgba(26,18,13,0.9)] border border-[#F59E42]/40 shadow-inner space-y-3">
                <label className="text-[11px] font-bold text-[#FFB45C] uppercase tracking-wider block">
                  Update Full Name
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="flex-1 px-3 py-2 bg-[#140D08] border border-[rgba(245,158,66,0.25)] rounded-lg text-xs text-[#F5F5F5] focus:outline-none focus:border-[#F59E42]"
                  />
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-gradient-to-r from-[#FFB45C] to-[#F59E42] text-[#120D09] font-bold text-xs rounded-lg hover:brightness-105"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Identity Details List */}
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-[rgba(245,158,66,0.10)]">
                <span className="text-[#A8A29E]">Name</span>
                <span className="font-semibold text-[#F5F5F5]">{displayName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(245,158,66,0.10)]">
                <span className="text-[#A8A29E]">Email</span>
                <span className="font-semibold text-[#F5F5F5]">{email}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(245,158,66,0.10)]">
                <span className="text-[#A8A29E]">Organization</span>
                <span className="font-semibold text-[#F5F5F5]">IIIT Guwahati</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[rgba(245,158,66,0.10)]">
                <span className="text-[#A8A29E]">Role</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F59E42]/15 text-[#FFB45C] border border-[#F59E42]/30">
                  {user.role || 'Enterprise Operator'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-[#A8A29E]">Member Since</span>
                <span className="font-semibold text-[#F5F5F5]">January 2025</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(245,158,66,0.12)] text-[11px] text-[#716B66] text-center">
            Managed by Enterprise Single Sign-On
          </div>
        </div>

        {/* Right Column: Security, Connected Apps & Privacy (Section 23) */}
        <div className="lg:col-span-6 bg-[rgba(20,13,9,0.72)] border border-[rgba(245,158,66,0.20)] rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <h3 className="text-base font-bold text-[#F5F5F5] pb-3 border-b border-[rgba(245,158,66,0.15)] flex items-center justify-between">
              <span>Security & Access</span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Protected
              </span>
            </h3>

            {/* Authentication Item */}
            <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#F5F5F5]">Authentication</h4>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Auth0 (Single Sign-On)</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0E2018] text-emerald-400 border border-emerald-500/30">
                Active
              </span>
            </div>

            {/* Session Management */}
            <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] flex items-center justify-between hover:border-[rgba(245,158,66,0.35)] transition-colors cursor-pointer group">
              <div>
                <h4 className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Session Management</h4>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">1 active device • Chrome on macOS</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#716B66] group-hover:text-[#FFB45C] transition-colors" />
            </div>

            {/* Connected Apps */}
            <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] flex items-center justify-between hover:border-[rgba(245,158,66,0.35)] transition-colors cursor-pointer group">
              <div>
                <h4 className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Connected Apps</h4>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Auth0 Identity Provider, Vision Pipeline</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#716B66] group-hover:text-[#FFB45C] transition-colors" />
            </div>

            {/* Data & Privacy */}
            <div className="p-3.5 rounded-xl bg-[rgba(26,18,13,0.75)] border border-[rgba(245,158,66,0.18)] flex items-center justify-between hover:border-[rgba(245,158,66,0.35)] transition-colors cursor-pointer group">
              <div>
                <h4 className="text-xs font-bold text-[#F5F5F5] group-hover:text-white">Data & Privacy</h4>
                <p className="text-[11px] text-[#A8A29E] mt-0.5">Manage data retention & export logs</p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#716B66] group-hover:text-[#FFB45C] transition-colors" />
            </div>
          </div>

          {/* Sign Out Button & Auth0 Attribution matching Screen 7 */}
          <div className="pt-4 border-t border-[rgba(245,158,66,0.15)] space-y-3">
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-red-950/30 hover:bg-red-950/60 border border-red-800/40 hover:border-red-600/60 text-red-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out from ImageRoute</span>
            </button>

            <p className="text-[11px] text-[#716B66] text-center">
              Built with Next.js • Powered by Auth0
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfileView;
