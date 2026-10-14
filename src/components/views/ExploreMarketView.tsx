import React, { useState, useMemo } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, formatPercent, formatKolkataDateTime, formatTradingDate } from '../../utils/formatters';
import { MiniSparkline } from '../charts/MiniSparkline';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  LayoutGrid,
  List,
  ShieldCheck,
  Bell,
  RefreshCw,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
} from 'lucide-react';

interface ExploreMarketViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
  onOpenCreateAlert?: (stock?: Stock) => void;
}

export const ExploreMarketView: React.FC<ExploreMarketViewProps> = ({
  onOpenTrade,
  onOpenStockDetail,
  onOpenCreateAlert,
}) => {
  const {
    stocks,
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    activeAlerts,
    isLoadingMarketData,
    marketDataError,
    refreshRealMarketPrices,
    marketSession,
    lastPricesUpdated,
  } = useInvest();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [selectedExchange, setSelectedExchange] = useState<'ALL' | 'NSE' | 'BSE'>('ALL');
  const [sortBy, setSortBy] = useState<'default' | 'gainers' | 'losers' | 'priceHigh' | 'priceLow'>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const sectors = [
    'All',
    'Information Technology',
    'Banking & Finance',
    'Energy & Conglomerate',
    'Automobile',
    'Consumer Goods & FMCG',
    'Infrastructure',
    'Healthcare & Pharma',
    'Fintech & Tech',
  ];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshRealMarketPrices();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    // Exchange filter
    if (selectedExchange !== 'ALL') {
      result = result.filter((s) => s.exchange === selectedExchange);
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (s) =>
          s.symbol.toLowerCase().includes(q) ||
          s.name.toLowerCase().includes(q) ||
          (s.isin && s.isin.toLowerCase().includes(q))
      );
    }

    // Sector filter
    if (selectedSector !== 'All') {
      result = result.filter((s) => s.sector === selectedSector);
    }

    // Sort order
    if (sortBy === 'gainers') {
      result.sort((a, b) => b.changePercent - a.changePercent);
    } else if (sortBy === 'losers') {
      result.sort((a, b) => a.changePercent - b.changePercent);
    } else if (sortBy === 'priceHigh') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'priceLow') {
      result.sort((a, b) => a.price - b.price);
    }

    return result;
  }, [stocks, searchQuery, selectedSector, selectedExchange, sortBy]);

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header and Honest Market Status Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Explore Indian Equities
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
              NSE / BSE Quotes
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Genuine end-of-day market prices and official bhavcopy snapshots powered by TejHQ
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Refresh Action */}
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoadingMarketData}
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
            title="Refresh Indian equity market quotes from TejHQ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing || isLoadingMarketData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{isRefreshing || isLoadingMarketData ? 'Updating...' : 'Refresh Prices'}</span>
          </button>

          {/* Market Session Pill */}
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${
            marketSession.isOpen
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
              : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
          }`}>
            <span className={`w-2 h-2 rounded-full ${marketSession.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            <span className="font-semibold">{marketSession.statusLabel}</span>
            <span className="text-[11px] text-slate-400 hidden md:inline">· {marketSession.sessionName}</span>
          </div>
        </div>
      </div>

      {/* Honest Data Source & Timezone Disclosure Card */}
      <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-300">
          <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Market Trading Date: <strong className="text-white font-mono">{marketSession.tradingDate}</strong> · Asia/Kolkata Time: <span className="font-mono text-slate-300">{marketSession.kolkataTime}</span>
          </span>
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
            Provider: <strong className="text-slate-200">TejHQ (Free EOD Infrastructure)</strong>
          </span>
          <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2 py-0.5 rounded text-[11px] border border-slate-700/60">
            Pricing: <strong className="text-emerald-400">End-of-day</strong>
          </span>
        </div>
      </div>

      {/* Error state if API call failed */}
      {marketDataError && (
        <div className="p-4 bg-rose-950/30 border border-rose-800/50 rounded-xl flex items-center justify-between text-xs text-rose-200">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Market Provider Notice: {marketDataError}. Displaying last verified cached quotes.</span>
          </div>
          <button
            onClick={handleRefresh}
            className="px-2.5 py-1 bg-rose-900/60 hover:bg-rose-800 rounded-lg text-rose-100 font-semibold text-[11px] transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search, Sector Tabs & Controls */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Indian stocks (e.g. RELIANCE, TCS, INFY, SBIN)..."
              className="w-full pl-10 pr-4 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-emerald-500 outline-none transition-colors"
            />
          </div>

          {/* Controls: Exchange selector, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Exchange Toggle */}
            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setSelectedExchange('ALL')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedExchange === 'ALL' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedExchange('NSE')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedExchange === 'NSE' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                NSE
              </button>
              <button
                type="button"
                onClick={() => setSelectedExchange('BSE')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  selectedExchange === 'BSE' ? 'bg-blue-950 text-blue-400 border border-blue-800/80 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                BSE
              </button>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 bg-[#0F172A] border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500"
            >
              <option value="default">Sort: Default Index</option>
              <option value="gainers">Sort: Top Gainers</option>
              <option value="losers">Sort: Top Losers</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="priceLow">Price: Low to High</option>
            </select>

            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-slate-800 text-white shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {sectors.map((sector) => {
            const isSelected = selectedSector === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setSelectedSector(sector)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-[#0F172A] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                }`}
              >
                {sector}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoadingMarketData && stocks.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center justify-center gap-3 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
          <div className="text-sm font-semibold text-white">Loading Genuine Market Quotes...</div>
          <p className="text-xs text-slate-400 max-w-sm">
            Fetching official end-of-day quotes and bhavcopy archives directly from TejHQ infrastructure.
          </p>
        </div>
      ) : filteredStocks.length === 0 ? (
        <div className="py-16 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-2">
          <p className="text-sm font-semibold text-slate-300">No stocks matching your criteria</p>
          <p className="text-xs text-slate-500">
            Try adjusting your search query, exchange filter, or sector selection.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedSector('All');
              setSelectedExchange('ALL');
            }}
            className="mt-2 px-3 py-1.5 text-xs text-emerald-400 hover:underline font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Exchange</th>
                  <th className="py-3 px-4 font-semibold hidden sm:table-cell">Sector</th>
                  <th className="py-3 px-4 font-semibold text-right">EOD Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Day Change</th>
                  <th className="py-3 px-4 font-semibold text-center hidden md:table-cell">
                    30D Trend
                  </th>
                  <th className="py-3 px-4 font-semibold text-right hidden lg:table-cell">
                    Volume
                  </th>
                  <th className="py-3 px-4 font-semibold text-right hidden lg:table-cell">
                    P/E Ratio
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredStocks.map((stock) => {
                  const isPos = stock.change >= 0;
                  const inWatch = isInWatchlist(stock.symbol);
                  const history1M = stock.history['1M']?.map((p) => p.price) || [];

                  return (
                    <tr
                      key={`${stock.exchange || 'NSE'}-${stock.symbol}`}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => onOpenStockDetail(stock)}
                    >
                      {/* Symbol & Name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              <span>{stock.symbol}</span>
                              <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                                {stock.priceLabel || 'End-of-day'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Exchange */}
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60">
                          {stock.exchange || 'NSE'}
                        </span>
                      </td>

                      {/* Sector */}
                      <td className="py-3 px-4 text-slate-400 hidden sm:table-cell">{stock.sector}</td>

                      {/* Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white text-sm">
                        {stock.price > 0 ? formatINR(stock.price) : <span className="text-slate-500 font-sans">Price unavailable</span>}
                      </td>

                      {/* Day Change */}
                      <td className="py-3 px-4 text-right font-mono font-semibold">
                        <div className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPos ? '+' : ''}
                          {formatPercent(stock.changePercent)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isPos ? '+' : ''}
                          {formatINR(stock.change)}
                        </div>
                      </td>

                      {/* Mini Sparkline */}
                      <td className="py-3 px-4 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <MiniSparkline
                            data={history1M.length > 0 ? history1M : [stock.previousClose, stock.price]}
                            isPositive={isPos}
                            width={90}
                            height={26}
                          />
                        </div>
                      </td>

                      {/* Volume */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300 hidden lg:table-cell">
                        {stock.volume}
                      </td>

                      {/* P/E Ratio */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300 hidden lg:table-cell">
                        {stock.peRatio.toFixed(1)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => toggleWatchlist(stock.symbol)}
                            className={`p-1.5 rounded-lg border transition-colors ${
                              inWatch
                                ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                                : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                            }`}
                            title={inWatch ? 'Remove from Watchlist' : 'Add to Watchlist'}
                          >
                            {inWatch ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenStockDetail(stock)}
                            className="px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenTrade(stock, 'BUY')}
                            className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm transition-colors"
                          >
                            Simulate Buy
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredStocks.map((stock) => {
            const isPos = stock.change >= 0;
            const inWatch = isInWatchlist(stock.symbol);
            const history1M = stock.history['1M']?.map((p) => p.price) || [];

            return (
              <div
                key={`${stock.exchange || 'NSE'}-${stock.symbol}`}
                className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between gap-4 hover:border-slate-700 transition-all cursor-pointer group"
                onClick={() => onOpenStockDetail(stock)}
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                          {stock.exchange || 'NSE'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate max-w-[170px] mt-0.5">
                        {stock.name}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(stock.symbol);
                      }}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        inWatch
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                      }`}
                    >
                      {inWatch ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="flex items-baseline justify-between mt-4">
                    <span className="text-lg font-bold font-mono text-white">
                      {stock.price > 0 ? formatINR(stock.price) : <span className="text-xs font-normal text-rose-400">Price unavailable</span>}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold flex items-center ${
                        isPos ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
                      {formatPercent(stock.changePercent)}
                    </span>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                    <span>{stock.sector}</span>
                    <span className="font-mono">{stock.priceLabel || 'End-of-day'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onOpenStockDetail(stock)}
                    className="flex-1 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-700 rounded-xl transition-colors text-center"
                  >
                    View Chart
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenTrade(stock, 'BUY')}
                    className="flex-1 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-colors text-center"
                  >
                    Simulate Buy
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
