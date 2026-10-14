import React from 'react';
import { useInvest } from '../../context/InvestContext';
import {
  LayoutDashboard,
  Compass,
  Briefcase,
  ArrowLeftRight,
  Bookmark,
  GraduationCap,
  Award,
  Sparkles,
  Newspaper,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { currentTab, setCurrentTab } = useInvest();

  const tabs = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'mentor', label: 'Mentor', icon: Sparkles },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'market', label: 'Market', icon: Compass },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'learn', label: 'Learn', icon: GraduationCap },
  ];

  if (currentTab === 'landing') return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-t border-slate-800 px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCurrentTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
              isActive ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon className="w-4 h-4 mb-0.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
