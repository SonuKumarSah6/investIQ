import React, { useState } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR } from '../../utils/formatters';
import { Wallet, TrendingUp, Sparkles, PlusCircle, ArrowLeft, Bell, RefreshCw } from 'lucide-react';
import { PriceAlertsPopover } from '../common/PriceAlertsPopover';

interface NavbarProps {
  onOpenQuickTrade: () => void;
  onOpenCreateAlert: (stock?: Stock) => void;
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickTrade,
  onOpenCreateAlert,
  onOpenTrade,
}) => {
  const {
    currentTab,
    setCurrentTab,
    virtualCash,
    totalPortfolioValue,
    totalProfitLoss,
    userProfile,
    unreadTriggeredCount,
    activeAlerts,
    marketSession,
    refreshRealMarketPrices,
    isLoadingMarketData,
  } = useInvest();

  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);

  const isPositive = totalProfitLoss >= 0;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0E17]/95 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark / Back to Landing */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left group"
            title="Return to Landing Page"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center shadow-sm">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                InvestIQ
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 font-medium ml-2">
                Learn · Invest · Grow
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Live Portfolio Metric Strip (Quiet unboxed tabular figures) */}
        <div className="hidden md:flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Virtual Portfolio:</span>
            <span className="font-mono font-bold text-white tabular-nums">
              {formatINR(totalPortfolioValue)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Return:</span>
            <span
              className={`font-mono font-semibold tabular-nums ${
                isPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isPositive ? '+' : ''}
              {formatINR(totalProfitLoss)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400">Cash:</span>
            <span className="font-mono text-slate-200 tabular-nums">
              {formatINR(virtualCash)}
            </span>
          </div>

          {/* Genuine Market Data Refresh & Session */}
          <button
            type="button"
            onClick={() => refreshRealMarketPrices()}
            disabled={isLoadingMarketData}
            title={`Indian Market Session: ${marketSession.statusLabel} (${marketSession.tradingDate}). Click to refresh prices from TejHQ.`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-850 hover:bg-slate-800 border border-slate-750 text-[11px] text-slate-300 hover:text-white transition-all disabled:opacity-50"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                marketSession.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-medium">{marketSession.statusLabel}</span>
            <RefreshCw className={`w-3 h-3 ml-1 ${isLoadingMarketData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Zone 3: Quick Action, Alerts Center & Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative">
          {/* Price Alerts Bell Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              title="Price Alerts Center"
              className={`p-2 rounded-xl border transition-all relative ${
                unreadTriggeredCount > 0
                  ? 'bg-amber-950/50 border-amber-800 text-amber-400 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Bell className="w-4 h-4" />
              {unreadTriggeredCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold font-mono flex items-center justify-center animate-pulse">
                  {unreadTriggeredCount}
                </span>
              )}
            </button>

            {/* Price Alerts Popover */}
            <PriceAlertsPopover
              isOpen={isAlertsOpen}
              onClose={() => setIsAlertsOpen(false)}
              onOpenCreateAlert={() => onOpenCreateAlert()}
              onOpenTrade={onOpenTrade}
            />
          </div>

          <button
            type="button"
            onClick={onOpenQuickTrade}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-all flex items-center gap-1.5 whitespace-nowrap"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Virtual Trade</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('settings')}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              {userProfile.name.charAt(0)}
            </div>
            <span className="hidden xl:inline text-xs font-medium text-slate-300">
              {userProfile.name}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
