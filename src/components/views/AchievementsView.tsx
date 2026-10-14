import React from 'react';
import { useInvest } from '../../context/InvestContext';
import {
  Award,
  Rocket,
  Eye,
  BookOpen,
  PieChart,
  TrendingUp,
  ShieldCheck,
  Briefcase,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { achievements, userProfile } = useInvest();

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  // Icon mapping
  const getIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-emerald-400' : 'text-slate-500'}`;
    switch (iconName) {
      case 'Rocket':
        return <Rocket className={iconClass} />;
      case 'Eye':
        return <Eye className={iconClass} />;
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'PieChart':
        return <PieChart className={iconClass} />;
      case 'TrendingUp':
        return <TrendingUp className={iconClass} />;
      case 'Briefcase':
        return <Briefcase className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Investor Achievements & Badges
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Milestones unlocked through real hands-on trading, portfolio diversification, and academy quizzes
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs self-start sm:self-auto font-mono">
          <Award className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{unlockedCount} / {totalCount} UNLOCKED</span>
        </div>
      </div>

      {/* Hero Level Banner */}
      <div className="p-6 bg-gradient-to-r from-[#0F172A] via-[#131d33] to-[#0F172A] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Investor Status Tier
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
            {unlockedCount >= 6
              ? 'Senior Market Strategist'
              : unlockedCount >= 3
              ? 'Apprentice Equity Analyst'
              : 'Novice Market Explorer'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md">
            Keep trading and completing lessons to unlock advanced achievement badges and expand your simulated market footprint.
          </p>

          <div className="w-full sm:w-72 h-2 bg-slate-800 rounded-full overflow-hidden mt-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-800 w-full md:w-auto">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] text-slate-400">Total Badges</span>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{unlockedCount}</div>
          </div>
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-center min-w-[110px]">
            <span className="text-[11px] text-slate-400">Completion</span>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">
              {progressPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {achievements.map((ach) => {
          const isUnlocked = ach.unlocked;

          return (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isUnlocked
                  ? 'bg-[#0F172A] border-emerald-800/40 shadow-sm'
                  : 'bg-slate-900/40 border-slate-800/60 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                      isUnlocked
                        ? 'bg-emerald-950/60 border-emerald-800/60'
                        : 'bg-slate-800/40 border-slate-700/40'
                    }`}
                  >
                    {getIcon(ach.icon, isUnlocked)}
                  </div>

                  {isUnlocked ? (
                    <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white">{ach.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {ach.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5 font-mono">
                  <span>Requirement</span>
                  <span>
                    {ach.progress} / {ach.maxProgress}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isUnlocked ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    style={{
                      width: `${Math.min(100, (ach.progress / ach.maxProgress) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
