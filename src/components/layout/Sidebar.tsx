import React from 'react';
import { useInvest } from '../../context/InvestContext';
import { formatINR } from '../../utils/formatters';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  ArrowLeftRight,
  Bookmark,
  GraduationCap,
  Award,
  Settings,
  ShieldCheck,
  Home,
  BellRing,
  Sparkles,
  Newspaper,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentTab, setCurrentTab, virtualCash, holdings, activeAlerts, unreadTriggeredCount } = useInvest();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mentor', label: 'InvestIQ Mentor', icon: Sparkles, badge: 'AI' },
    { id: 'news', label: 'Live Financial News', icon: Newspaper },
    { id: 'market', label: 'Explore Market', icon: Compass },
    { id: 'portfolio', label: 'My Portfolio', icon: Briefcase, count: Object.keys(holdings).length },
    { id: 'trade', label: 'Virtual Trade', icon: ArrowLeftRight },
    { id: 'watchlist', label: 'Watchlist', icon: Bookmark },
    { id: 'learn', label: 'Learn Academy', icon: GraduationCap },
    { id: 'achievements', label: 'Achievements', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-[#0B0F19] border-r border-slate-800/80 shrink-0 select-none">
      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Platform Menu
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-slate-800/90 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {'badge' in item && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="font-mono text-[11px] text-slate-400 tabular-nums">
                    {item.count}
                  </span>
                )}
              </div>
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Public Website
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('landing')}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 transition-colors"
        >
          <Home className="w-4 h-4 text-slate-500" />
          <span>Landing Page</span>
        </button>
      </div>

      {/* Cash Reserves Mini Card */}
      <div className="p-4 mx-3 mb-4 bg-slate-900/80 border border-slate-800/80 rounded-xl space-y-2">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Available Cash</span>
            <span className="text-emerald-400 font-medium">Virtual</span>
          </div>
          <div className="text-base font-bold font-mono text-white">
            {formatINR(virtualCash)}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-400">
            <BellRing className="w-3.5 h-3.5 text-amber-400" />
            <span>Price Alerts:</span>
          </div>
          <span className="font-mono text-slate-200 font-semibold">
            {activeAlerts.length} Active
            {unreadTriggeredCount > 0 && ` (${unreadTriggeredCount} hit)`}
          </span>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-1.5 text-[10px] text-slate-500">
          <ShieldCheck className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Simulated Paper Trading</span>
        </div>
      </div>
    </aside>
  );
};
