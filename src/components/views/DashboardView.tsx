import React from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';
import { PortfolioTrendChart } from '../charts/PortfolioTrendChart';
import { DonutChart } from '../charts/DonutChart';
import { MiniSparkline } from '../charts/MiniSparkline';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PlusCircle,
  Lightbulb,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Bookmark,
  ShieldCheck,
  Compass,
  Bell,
  BellRing,
  Trash2,
  Sparkles,
  Newspaper,
  BookOpen,
  RefreshCw,
} from 'lucide-react';

interface DashboardViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
  onOpenCreateAlert?: (stock?: Stock) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenTrade,
  onOpenStockDetail,
  onOpenCreateAlert,
}) => {
  const {
    userProfile,
    virtualCash,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    todayGainLoss,
    todayGainLossPercent,
    portfolioHoldingsValue,
    initialStartingBalance,
    portfolioSnapshots,
    bestHolding,
    worstHolding,
    holdings,
    stocks,
    transactions,
    watchlist,
    setCurrentTab,
    activeAlerts,
    triggeredAlerts,
    dismissPriceAlert,
    deletePriceAlert,
    newsArticles,
    askMentor,
    marketSession,
    refreshRealMarketPrices,
    isLoadingMarketData,
  } = useInvest();

  const isTotalPLPositive = totalProfitLoss >= 0;
  const isTodayPositive = todayGainLoss >= 0;

  // Watchlist items preview
  const watchlistStocks = stocks.filter((s) => watchlist.includes(s.symbol)).slice(0, 4);

  // Popular / Trending stocks
  const popularStocks = stocks.slice(0, 6);

  // Sector asset allocation calculation
  const sectorColors = [
    '#10B981', // Emerald
    '#06B6D4', // Cyan
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EC4899', // Pink
    '#64748B', // Slate
  ];

  const sectorSlices = React.useMemo(() => {
    const sectorTotals: Record<string, number> = {};
    let equityTotal = 0;

    Object.values(holdings).forEach((h) => {
      const stock = stocks.find((s) => s.symbol === h.symbol);
      if (stock) {
        const val = h.quantity * stock.price;
        sectorTotals[stock.sector] = (sectorTotals[stock.sector] || 0) + val;
        equityTotal += val;
      }
    });

    const slices = Object.entries(sectorTotals).map(([sector, val], idx) => ({
      label: sector.split('&')[0].trim(),
      value: val,
      color: sectorColors[idx % sectorColors.length],
    }));

    // Add Cash slice
    if (virtualCash > 0) {
      slices.push({
        label: 'Virtual Cash',
        value: virtualCash,
        color: '#334155',
      });
    }

    return slices;
  }, [holdings, stocks, virtualCash]);

  // Rotated Daily Investing Tips
  const dailyTips = [
    {
      title: 'The Power of Rupee-Cost Averaging',
      tip: 'By investing small fixed amounts regularly via SIPs rather than timing market peaks and troughs, you buy more shares when prices are cheap and lower your long-term average cost.',
    },
    {
      title: 'Diversification Reduces Risk',
      tip: 'Never concentrate your entire portfolio in one stock or single sector. Holding across Banking, IT, Pharma, and Energy protects you from industry-specific downturns.',
    },
    {
      title: 'Time in the Market > Timing the Market',
      tip: 'Historical Nifty data shows that missing the 10 best market days over a 15-year period cuts total compounded returns by more than half. Stay invested.',
    },
  ];

  const currentTip = dailyTips[0];

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Welcome & Simulator Mode Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {userProfile.name}
            </h1>
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded-md font-semibold">
              Paper Portfolio
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulated Indian Equity Sandbox · Genuine Market Data Powered by TejHQ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refreshRealMarketPrices()}
            disabled={isLoadingMarketData}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-all flex items-center gap-1.5"
            title="Refresh Indian equity market quotes"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMarketData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">Refresh Prices</span>
          </button>

          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
            marketSession.isOpen
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${marketSession.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>{marketSession.statusLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => onOpenTrade(stocks[0], 'BUY')}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Virtual Trade</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Portfolio Value</span>
            <div className="text-2xl font-bold font-mono text-white mt-1">
              {formatINR(totalPortfolioValue)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Starting Balance:</span>
            <span className="font-mono text-slate-300">{formatINR(initialStartingBalance)}</span>
          </div>
        </div>

        {/* Available Virtual Cash */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Available Virtual Cash</span>
              <Wallet className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
              {formatINR(virtualCash)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-500">Deployable:</span>
            <span className="font-mono text-slate-300">
              {((virtualCash / totalPortfolioValue) * 100).toFixed(1)}% of total
            </span>
          </div>
        </div>

        {/* Total Profit / Loss */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Net P&L</span>
              {totalRealizedPL !== 0 && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Realized: {totalRealizedPL >= 0 ? '+' : ''}{formatINR(totalRealizedPL)}
                </span>
              )}
            </div>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                isTotalPLPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isTotalPLPositive ? '+' : ''}
              {formatINR(totalProfitLoss)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Unrealized: {totalUnrealizedPL >= 0 ? '+' : ''}{formatINR(totalUnrealizedPL)}</span>
            <span
              className={`font-semibold ${
                isTotalPLPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isTotalPLPositive ? '+' : ''}
              {formatPercent(totalProfitLossPercent)}
            </span>
          </div>
        </div>

        {/* Today's Simulated Change */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Today's Performance</span>
              {isTodayPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div
              className={`text-2xl font-bold font-mono mt-1 ${
                isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isTodayPositive ? '+' : ''}
              {formatINR(todayGainLoss)}
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Day Change:</span>
            <span
              className={`font-semibold ${
                isTodayPositive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isTodayPositive ? '+' : ''}
              {formatPercent(todayGainLossPercent)}
            </span>
          </div>
        </div>
      </div>

      {/* Portfolio Core Holdings & Extremes Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Holdings Cost Basis vs Current Value */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Holdings Cost Basis vs Market Value</span>
              <Compass className="w-4 h-4 text-slate-400" />
            </div>
            <div className="mt-2.5 flex items-baseline justify-between font-mono">
              <div>
                <div className="text-[11px] text-slate-400">Total Cost Basis</div>
                <div className="text-base font-bold text-slate-200">{formatINR(totalInvestedAmount)}</div>
              </div>
              <div className="text-right">
                <div className="text-[11px] text-slate-400">Current Market Value</div>
                <div className="text-base font-bold text-white">{formatINR(portfolioHoldingsValue)}</div>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Positions: <strong className="text-white">{Object.keys(holdings).length}</strong></span>
            <span>Completed Trades: <strong className="text-white">{transactions.length}</strong></span>
            <span>Watchlist: <strong className="text-white">{watchlist.length}</strong></span>
          </div>
        </div>

        {/* Best Performing Holding */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Best-Performing Holding</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 font-semibold">
              Top Gainer
            </span>
          </div>
          {bestHolding ? (
            <div
              className="mt-2.5 cursor-pointer group"
              onClick={() => bestHolding.stock && onOpenStockDetail(bestHolding.stock)}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                  <span>{bestHolding.holding.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {bestHolding.holding.exchange || 'NSE'}
                  </span>
                </div>
                <div className="text-right font-mono text-emerald-400 font-bold text-sm">
                  +{formatPercent(bestHolding.unrealizedPLPercent)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>{bestHolding.holding.quantity} shares</span>
                <span className="text-emerald-400 font-semibold">+{formatINR(bestHolding.unrealizedPL)}</span>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 text-xs text-slate-500 py-1.5">
              No active holdings yet. Buy stocks to view performance rankings.
            </div>
          )}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-500 font-mono">
            {bestHolding ? `Weight: ${bestHolding.allocationPercent.toFixed(1)}% of equities` : 'Awaiting virtual positions'}
          </div>
        </div>

        {/* Worst Performing Holding */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Worst-Performing Holding</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 border border-rose-800/60 font-semibold">
              Lagging
            </span>
          </div>
          {worstHolding ? (
            <div
              className="mt-2.5 cursor-pointer group"
              onClick={() => worstHolding.stock && onOpenStockDetail(worstHolding.stock)}
            >
              <div className="flex items-center justify-between">
                <div className="font-bold text-white text-sm group-hover:text-rose-400 transition-colors flex items-center gap-1.5">
                  <span>{worstHolding.holding.symbol}</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">
                    {worstHolding.holding.exchange || 'NSE'}
                  </span>
                </div>
                <div className={`text-right font-mono font-bold text-sm ${worstHolding.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {worstHolding.unrealizedPL >= 0 ? '+' : ''}{formatPercent(worstHolding.unrealizedPLPercent)}
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-1 font-mono">
                <span>{worstHolding.holding.quantity} shares</span>
                <span className={worstHolding.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {worstHolding.unrealizedPL >= 0 ? '+' : ''}{formatINR(worstHolding.unrealizedPL)}
                </span>
              </div>
            </div>
          ) : (
            <div className="mt-2.5 text-xs text-slate-500 py-1.5">
              {bestHolding ? 'Single holding in portfolio.' : 'No active holdings yet.'}
            </div>
          )}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-xs text-slate-500 font-mono">
            {worstHolding ? `Weight: ${worstHolding.allocationPercent.toFixed(1)}% of equities` : 'Awaiting virtual positions'}
          </div>
        </div>
      </div>

      {/* InvestIQ Intelligence — Compact AI Insights Card */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0F172A] via-slate-900 to-[#0B1528] border border-emerald-900/40 rounded-2xl space-y-3.5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-32 bg-emerald-500/5 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  InvestIQ Intelligence — AI Portfolio Mentor
                </h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/70 text-emerald-400 font-mono">
                  Gemini 3.8-Flash
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous risk analysis, sector concentration diagnostics, and beginner financial literacy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('mentor')}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <span>Consult AI Mentor</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Diagnostic Snapshot & Quick Prompt Chips */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Quick Portfolio Health Metric */}
          <div className="md:col-span-5 p-3 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">Diversification Diagnosis:</span>
              <span className="font-bold text-emerald-400">
                {Object.keys(holdings).length === 0
                  ? 'All-Cash Position'
                  : Object.keys(holdings).length >= 3
                  ? 'Healthy Allocation'
                  : 'Concentrated Portfolio'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {Object.keys(holdings).length === 0
                ? '₹1,00,000 sitting in paper cash. Place your first virtual trade to unlock tailored risk insights.'
                : `Active investments in ${Object.keys(holdings).length} companies with ${formatINR(virtualCash)} available in cash reserves.`}
            </p>
          </div>

          {/* Quick Prompts Bar */}
          <div className="md:col-span-7 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-medium text-slate-400 w-full sm:w-auto">
              Ask Mentor:
            </span>
            <button
              type="button"
              onClick={() => askMentor('Analyze my virtual portfolio.')}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>📊 Analyze my portfolio</span>
            </button>
            <button
              type="button"
              onClick={() => askMentor('Explain my biggest investment risk.')}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>⚠️ What is my biggest risk?</span>
            </button>
            <button
              type="button"
              onClick={() => askMentor('Am I diversified?')}
              className="px-3 py-1.5 text-xs rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>🧩 Am I diversified?</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Charts Row: Portfolio Performance & Asset Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Portfolio Equity Curve */}
        <div className="lg:col-span-2 p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Portfolio Performance Trajectory
              </h2>
              <p className="text-xs text-slate-400">
                Simulated net worth progression against {formatINR(initialStartingBalance)} initial capital
              </p>
            </div>
            <div className="text-xs text-slate-500 font-mono">SIMULATED</div>
          </div>

          <div className="py-4">
            <PortfolioTrendChart
              currentValue={totalPortfolioValue}
              initialValue={initialStartingBalance}
              totalGain={totalProfitLoss}
              totalGainPercent={totalProfitLossPercent}
              snapshots={portfolioSnapshots}
            />
          </div>
        </div>

        {/* Right 1 Col: Asset Allocation Donut */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-bold text-white tracking-tight">
              Asset & Sector Allocation
            </h2>
            <p className="text-xs text-slate-400">
              Breakdown of active equities vs cash reserves
            </p>
          </div>

          <div className="py-4 flex-1 flex items-center justify-center">
            <DonutChart
              slices={sectorSlices}
              totalValue={totalPortfolioValue}
              centerTitle="Invested"
            />
          </div>
        </div>
      </div>

      {/* Daily Investing Tip Callout Card */}
      <div className="p-4 bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-800/40 rounded-2xl flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-emerald-900/50 border border-emerald-700/60 flex items-center justify-center text-emerald-400 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
              Daily Investor Principle
            </span>
            <span className="text-xs text-slate-400">· {currentTip.title}</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 leading-relaxed">{currentTip.tip}</p>
        </div>
        <button
          type="button"
          onClick={() => setCurrentTab('learn')}
          className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors whitespace-nowrap self-center px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60"
        >
          <span>Open Academy</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popular Demo Indian Stocks Strip */}
      <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Genuine Indian Equities (TejHQ Feed)
            </h2>
            <p className="text-xs text-slate-400">
              Official Bhavcopy end-of-day market quotes with 1-click simulated orders
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCurrentTab('market')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            <span>View All ({stocks.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {popularStocks.map((stock) => {
            const isPos = stock.change >= 0;
            const history1M = stock.history['1M']?.map((p) => p.price) || [];

            return (
              <div
                key={`${stock.exchange || 'NSE'}-${stock.symbol}`}
                className="p-3.5 bg-slate-900/60 hover:bg-slate-850/80 border border-slate-800 rounded-xl transition-all flex flex-col justify-between gap-3 group"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="cursor-pointer"
                    onClick={() => onOpenStockDetail(stock)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {stock.symbol}
                      </span>
                      <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                        {stock.exchange || 'NSE'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 truncate max-w-[150px]">
                      {stock.name}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-bold font-mono text-white">
                      {stock.price > 0 ? formatINR(stock.price) : 'Price unavailable'}
                    </div>
                    <div
                      className={`text-xs font-semibold font-mono ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? '+' : ''}
                      {formatPercent(stock.changePercent)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <MiniSparkline
                    data={history1M.length > 0 ? history1M : [stock.previousClose, stock.price]}
                    isPositive={isPos}
                    width={80}
                    height={24}
                  />
                  <div className="flex items-center gap-1.5">
                    {onOpenCreateAlert && (
                      <button
                        type="button"
                        onClick={() => onOpenCreateAlert(stock)}
                        title="Set Price Alert"
                        className="p-1 text-slate-500 hover:text-amber-400 rounded-md hover:bg-slate-800 transition-colors"
                      >
                        <Bell className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenStockDetail(stock)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                    >
                      Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenTrade(stock, 'BUY')}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md transition-colors"
                    >
                      Buy
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Section: Recent Transactions & Watchlist Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions Table */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Transactions</h2>
              <p className="text-xs text-slate-400">Order execution ledger</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('portfolio')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              All Records →
            </button>
          </div>

          <div className="py-2 flex-1">
            {transactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No simulated transactions executed yet. Click "Virtual Trade" above to place your first trade!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400">
                      <th className="py-2.5 font-medium">Type</th>
                      <th className="py-2.5 font-medium">Stock</th>
                      <th className="py-2.5 font-medium text-right">Shares</th>
                      <th className="py-2.5 font-medium text-right">Price</th>
                      <th className="py-2.5 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.slice(0, 5).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-850/40">
                        <td className="py-2.5">
                          <span
                            className={`font-mono font-bold text-[11px] ${
                              tx.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-white">{tx.symbol}</td>
                        <td className="py-2.5 text-right font-mono text-slate-300">
                          {tx.quantity}
                        </td>
                        <td className="py-2.5 text-right font-mono text-slate-400">
                          {formatINR(tx.price)}
                        </td>
                        <td className="py-2.5 text-right font-mono font-semibold text-white">
                          {formatINR(tx.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Quick Snapshot */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Watchlist Snapshot</h2>
              <p className="text-xs text-slate-400">Pinned stocks under active tracking</p>
            </div>
            <button
              type="button"
              onClick={() => setCurrentTab('watchlist')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Manage Watchlist →
            </button>
          </div>

          <div className="py-2 flex-1">
            {watchlistStocks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Your watchlist is empty. Go to Explore Market to bookmark stocks.
              </div>
            ) : (
              <div className="space-y-2.5">
                {watchlistStocks.map((stock) => {
                  const isPos = stock.change >= 0;
                  return (
                    <div
                      key={`${stock.exchange || 'NSE'}-${stock.symbol}`}
                      className="flex items-center justify-between p-2.5 bg-slate-900/60 rounded-xl hover:bg-slate-850/60 transition-colors"
                    >
                      <div
                        className="cursor-pointer"
                        onClick={() => onOpenStockDetail(stock)}
                      >
                        <div className="font-bold text-white text-xs">{stock.symbol}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {stock.name}
                        </div>
                      </div>

                      <div className="text-right font-mono">
                        <div className="text-xs font-bold text-white">{formatINR(stock.price)}</div>
                        <div
                          className={`text-[11px] font-semibold ${
                            isPos ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPos ? '+' : ''}
                          {formatPercent(stock.changePercent)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 ml-2">
                        <button
                          type="button"
                          onClick={() => onOpenTrade(stock, 'BUY')}
                          className="px-2 py-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 rounded-md hover:bg-emerald-900/40 transition-colors"
                        >
                          Trade
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* InvestIQ Live News Wire — Latest Financial Developments */}
      <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  InvestIQ Live News Wire
                </h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Market Pulse</span>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Top Indian business headlines, policy decisions, and company developments
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setCurrentTab('news')}
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <span>Explore All News ({newsArticles.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsArticles.slice(0, 3).map((article) => (
            <div
              key={article.id}
              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl flex flex-col justify-between space-y-3 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-850 px-1.5 py-0.5 rounded">
                    {article.category}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      article.sentiment === 'Bullish'
                        ? 'text-emerald-400 bg-emerald-950/60'
                        : article.sentiment === 'Bearish'
                        ? 'text-rose-400 bg-rose-950/60'
                        : 'text-slate-300 bg-slate-800'
                    }`}
                  >
                    {article.sentiment}
                  </span>
                </div>

                <h3
                  onClick={() => setCurrentTab('news')}
                  className="text-xs font-bold text-white hover:text-emerald-400 cursor-pointer line-clamp-2 leading-snug"
                >
                  {article.title}
                </h3>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-500 font-mono">
                  {article.publishedAt}
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const question = `Explain this financial news to a beginner investor: "${article.title}". Summary: "${article.summary}". What does it mean for the Indian economy?`;
                    askMentor(question);
                  }}
                  className="px-2 py-0.8 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 rounded-md transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Explain with AI</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Price Alerts Section */}
      <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">
                Simulated Market Price Alerts
              </h2>
              <p className="text-xs text-slate-400">
                Non-intrusive triggers when equities reach your target buy or sell prices
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateAlert && (
              <button
                type="button"
                onClick={() => onOpenCreateAlert()}
                className="px-3 py-1.5 text-xs font-bold text-amber-300 bg-amber-950/50 border border-amber-800/60 hover:bg-amber-900/50 rounded-xl transition-all flex items-center gap-1.5"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Set Price Alert</span>
              </button>
            )}
          </div>
        </div>

        {triggeredAlerts.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider block">
              Recently Triggered Milestones
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {triggeredAlerts.map((alert) => {
                const stock = stocks.find((s) => s.symbol === alert.symbol);

                return (
                  <div
                    key={alert.id}
                    className="p-3.5 bg-amber-950/20 border border-amber-800/50 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{alert.symbol}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${
                            alert.intent === 'BUY'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : alert.intent === 'SELL'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                          }`}
                        >
                          {alert.intent === 'BUY' ? 'BUY Target' : alert.intent === 'SELL' ? 'SELL Target' : 'Alert'}
                        </span>
                      </div>
                      <div className="text-slate-400 mt-1">
                        Target <span className="font-mono text-slate-200">{formatINR(alert.targetPrice)}</span> reached!
                        {alert.triggeredPrice && (
                          <span className="text-amber-400 font-mono font-semibold ml-1">
                            (Hit at {formatINR(alert.triggeredPrice)})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {stock && (
                        <button
                          type="button"
                          onClick={() => {
                            onOpenTrade(stock, alert.intent === 'SELL' ? 'SELL' : 'BUY');
                            dismissPriceAlert(alert.id);
                          }}
                          className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm transition-all ${
                            alert.intent === 'SELL'
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          Trade
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => dismissPriceAlert(alert.id)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Active Watch Targets ({activeAlerts.length})
          </span>
          {activeAlerts.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
              No active price alerts set. Pick a stock to monitor key price thresholds.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeAlerts.map((alert) => {
                const stock = stocks.find((s) => s.symbol === alert.symbol);
                const current = stock ? stock.price : alert.targetPrice;
                const distancePct = ((alert.targetPrice - current) / current) * 100;

                return (
                  <div
                    key={alert.id}
                    className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white">{alert.symbol}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {alert.condition === 'ABOVE' ? '≥' : '≤'} {formatINR(alert.targetPrice)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Now {formatINR(current)} ({distancePct >= 0 ? '+' : ''}{distancePct.toFixed(1)}% away)
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {stock && (
                        <button
                          type="button"
                          onClick={() => onOpenTrade(stock, alert.intent === 'SELL' ? 'SELL' : 'BUY')}
                          className="px-2 py-0.8 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 rounded-md transition-colors"
                        >
                          Trade
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => deletePriceAlert(alert.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Delete alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
