import React, { useState, useMemo } from 'react';
import { useInvest, HoldingPerformance } from '../../context/InvestContext';
import { Stock, Holding } from '../../types';
import { formatINR, formatPercent, formatKolkataDateTime } from '../../utils/formatters';
import {
  Briefcase,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  ExternalLink,
  Layers,
  ShieldCheck,
  Building2,
  Clock,
  Sparkles,
} from 'lucide-react';

interface HoldingsViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
}

export const HoldingsView: React.FC<HoldingsViewProps> = ({
  onOpenTrade,
  onOpenStockDetail,
}) => {
  const {
    holdings,
    stocks,
    holdingsPerformanceList,
    portfolioHoldingsValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    setCurrentTab,
    marketSession,
    isCloudSynced,
  } = useInvest();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedExchange, setSelectedExchange] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [plFilter, setPlFilter] = useState<'ALL' | 'PROFIT' | 'LOSS'>('ALL');
  const [sortBy, setSortBy] = useState<'marketValue' | 'unrealizedPL' | 'allocation' | 'symbol' | 'quantity'>('marketValue');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  // Filtered and sorted holdings
  const filteredHoldings = useMemo(() => {
    let result = [...holdingsPerformanceList];

    // Exchange filter
    if (selectedExchange !== 'ALL') {
      result = result.filter((item) => (item.stock?.exchange || item.holding.exchange || 'NSE') === selectedExchange);
    }

    // Profit / Loss filter
    if (plFilter === 'PROFIT') {
      result = result.filter((item) => item.unrealizedPL >= 0);
    } else if (plFilter === 'LOSS') {
      result = result.filter((item) => item.unrealizedPL < 0);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.holding.symbol.toLowerCase().includes(q) ||
          (item.stock?.name && item.stock.name.toLowerCase().includes(q)) ||
          (item.holding.companyName && item.holding.companyName.toLowerCase().includes(q))
      );
    }

    // Sorting
    result.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'marketValue') {
        comparison = b.marketValue - a.marketValue;
      } else if (sortBy === 'unrealizedPL') {
        comparison = b.unrealizedPL - a.unrealizedPL;
      } else if (sortBy === 'allocation') {
        comparison = b.allocationPercent - a.allocationPercent;
      } else if (sortBy === 'symbol') {
        comparison = a.holding.symbol.localeCompare(b.holding.symbol);
      } else if (sortBy === 'quantity') {
        comparison = b.holding.quantity - a.holding.quantity;
      }
      return sortAsc ? -comparison : comparison;
    });

    return result;
  }, [holdingsPerformanceList, selectedExchange, plFilter, searchQuery, sortBy, sortAsc]);

  const isOverallPositive = totalUnrealizedPL >= 0;

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Equity Holdings
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              {holdingsPerformanceList.length} Active Positions
            </span>
            {isCloudSynced && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono">
                Cloud Synced
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time valuation of your stock positions using verified TejHQ market data
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('market')}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Explore More Stocks</span>
        </button>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Holdings Market Value</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatINR(portfolioHoldingsValue)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Verified TejHQ Quotes</span>
            <span className="font-mono text-emerald-400 font-semibold">Live EOD</span>
          </div>
        </div>

        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Invested Cost Basis</span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {formatINR(totalInvestedAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Weighted Cost Basis</span>
            <span className="font-mono text-slate-300">{holdingsPerformanceList.length} Stocks</span>
          </div>
        </div>

        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Unrealized P&L</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPositive ? '+' : ''}
            {formatINR(totalUnrealizedPL)}
          </div>
          <div
            className={`text-xs font-mono font-semibold mt-2 ${
              isOverallPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPositive ? '+' : ''}
            {formatPercent(totalUnrealizedPLPercent)} Return on Invested Capital
          </div>
        </div>

        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Active Trading Date</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {marketSession.tradingDate}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>Session:</span>
            <span className="text-slate-200 font-medium">{marketSession.statusLabel}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by symbol or company name..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Exchange Filter */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            {(['ALL', 'NSE', 'BSE'] as const).map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => setSelectedExchange(ex)}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedExchange === ex
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {ex}
              </button>
            ))}
          </div>

          {/* P&L Filter */}
          <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <button
              type="button"
              onClick={() => setPlFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                plFilter === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              All P&L
            </button>
            <button
              type="button"
              onClick={() => setPlFilter('PROFIT')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                plFilter === 'PROFIT' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 shadow-xs' : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Profitable
            </button>
            <button
              type="button"
              onClick={() => setPlFilter('LOSS')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                plFilter === 'LOSS' ? 'bg-rose-950 text-rose-400 border border-rose-800/80 shadow-xs' : 'text-slate-400 hover:text-rose-400'
              }`}
            >
              In Loss
            </button>
          </div>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500"
          >
            <option value="marketValue">Sort: Market Value</option>
            <option value="unrealizedPL">Sort: Unrealized P&L</option>
            <option value="allocation">Sort: Allocation %</option>
            <option value="quantity">Sort: Quantity</option>
            <option value="symbol">Sort: Symbol (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={() => setSortAsc(!sortAsc)}
            title={sortAsc ? 'Sort Ascending' : 'Sort Descending'}
            className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Holdings Table */}
      {filteredHoldings.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <Briefcase className="w-12 h-12 text-slate-600" />
          <div className="text-base font-semibold text-slate-300">
            {holdingsPerformanceList.length === 0 ? 'No active equity positions' : 'No positions match current filter'}
          </div>
          <p className="text-xs text-slate-500 max-w-md">
            {holdingsPerformanceList.length === 0
              ? 'Place your first simulated trade from the Explore Market or Virtual Trade view to start tracking equity holdings.'
              : 'Try clearing your search query or adjusting the exchange and profit/loss filters above.'}
          </p>
          <button
            type="button"
            onClick={() => setCurrentTab('market')}
            className="mt-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
          >
            Explore Equities to Trade
          </button>
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold text-right">Shares Held</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg. Cost Basis</th>
                  <th className="py-3 px-4 font-semibold text-right">Latest Market Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Cost Basis</th>
                  <th className="py-3 px-4 font-semibold text-right">Current Valuation</th>
                  <th className="py-3 px-4 font-semibold text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 font-semibold text-right">Allocation</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredHoldings.map((item) => {
                  const { holding, stock, marketValue, unrealizedPL, unrealizedPLPercent, allocationPercent } = item;
                  const isPos = unrealizedPL >= 0;
                  const currentPrice = stock && stock.price > 0 ? stock.price : holding.avgPrice;
                  const exchange = stock?.exchange || holding.exchange || 'NSE';

                  return (
                    <tr
                      key={`${exchange}-${holding.symbol}`}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => {
                        if (stock) onOpenStockDetail(stock);
                      }}
                    >
                      {/* Instrument */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {holding.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              <span>{holding.symbol}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                {exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">
                              {stock?.name || holding.companyName || holding.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Shares Held */}
                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                        {holding.quantity.toLocaleString('en-IN')}
                      </td>

                      {/* Avg. Cost Basis */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatINR(holding.avgPrice)}
                      </td>

                      {/* Latest Market Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatINR(currentPrice)}
                      </td>

                      {/* Total Cost Basis */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatINR(holding.totalInvested)}
                      </td>

                      {/* Current Valuation */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                        {formatINR(marketValue)}
                      </td>

                      {/* Unrealized P&L */}
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className={`font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}
                          {formatINR(unrealizedPL)}
                        </div>
                        <div className={`text-[10px] font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}
                          {formatPercent(unrealizedPLPercent)}
                        </div>
                      </td>

                      {/* Allocation % */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-200">
                        <div className="flex items-center justify-end gap-1.5">
                          <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.min(100, allocationPercent)}%` }}
                            />
                          </div>
                          <span>{allocationPercent.toFixed(1)}%</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          {stock && (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenTrade(stock, 'BUY')}
                                className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-lg hover:bg-emerald-900/40 transition-colors"
                              >
                                Buy
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenTrade(stock, 'SELL')}
                                className="px-2.5 py-1 text-xs font-semibold text-rose-400 bg-rose-950/40 border border-rose-800/40 rounded-lg hover:bg-rose-900/40 transition-colors"
                              >
                                Sell
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
