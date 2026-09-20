import React from 'react';
import { 
  LayoutDashboard, 
  FileUp, 
  Layers, 
  Clock, 
  User, 
  Sparkles,
  LogOut,
  Sliders,
  ChevronRight
} from 'lucide-react';
import BrandLogo from './BrandLogo';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  pendingCount?: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  pendingCount = 4,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'route', icon: FileUp, label: 'Route Image' },
    { 
      id: 'queue', 
      icon: Layers, 
      label: 'Routing Queue',
      badge: pendingCount > 0 ? pendingCount : undefined
    },
    { id: 'history', icon: Clock, label: 'History' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="w-64 bg-[#070605] border-r border-[rgba(255,255,255,0.07)] flex flex-col shrink-0 select-none z-30 relative overflow-hidden">
      {/* Brand logo in sidebar header */}
      <div className="p-6 border-b border-[rgba(255,255,255,0.07)]">
        <BrandLogo size="md" showTagline={false} />
      </div>

      {/* Main navigation list */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-[rgba(245,158,66,0.14)] text-[#F5F5F5] border border-[rgba(245,158,66,0.35)] shadow-[0_0_16px_rgba(245,158,66,0.14)]'
                  : 'text-[#A8A29E] hover:text-[#F5F5F5] hover:bg-[rgba(28,18,11,0.6)] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-[#FFB45C]' : 'text-[#716B66] group-hover:text-[#FFB45C]'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[rgba(245,158,66,0.20)] text-[#FFB45C] border border-[rgba(245,158,66,0.35)] shadow-sm">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom: SYSTEM ● Operational */}
      <div className="mt-auto px-5 py-4 border-t border-[rgba(255,255,255,0.07)] relative z-10 bg-[#070605]/80 backdrop-blur-xs">
        <div className="flex items-center justify-between text-[11px] text-[#716B66]">
          <span className="tracking-wider uppercase text-[10px] text-[#716B66] font-semibold">SYSTEM</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-[11px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_#22C55E]" />
            Operational
          </span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
