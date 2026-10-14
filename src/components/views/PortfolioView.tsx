import React, { useState, useMemo } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock, Holding, Transaction } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';
import { DonutChart } from '../charts/DonutChart';
import { ExportPortfolioModal } from '../modals/ExportPortfolioModal';
import {
  Briefcase,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Clock,
  History,
  ShieldCheck,
  Search,
  Download,
  Filter,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

interface PortfolioViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  onOpenTrade,
  onOpenStockDetail,
}) => {
  const {
    virtualCash,
    holdings,
    portfolioHoldingsValue,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    todayGainLoss,
    todayGainLossPercent,
    stocks,
    transactions,
    setCurrentTab,
    marketSession,
  } = useInvest();

  // Holdings filtering & sorting state
  const [holdingSearch, setHoldingSearch] = useState<string>('');
  const [holdingFilter, setHoldingFilter] = useState<'ALL' | 'GAINERS' | 'LOSERS'>('ALL');
  const [holdingSort, setHoldingSort] = useState<'valDesc' | 'valAsc' | 'plDesc' | 'plAsc' | 'symAsc'>('valDesc');

  // Transaction history filtering & pagination state
  const [txFilter, setTxFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [txSearch, setTxSearch] = useState<string>('');
  const [txSort, setTxSort] = useState<'newest' | 'oldest' | 'valDesc' | 'plDesc'>('newest');
  const [txPage, setTxPage] = useState<number>(1);
  const TX_PAGE_SIZE = 10;

  // Export modal state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportDefaultTab, setExportDefaultTab] = useState<'summary' | 'transactions' | 'combined'>('summary');

  const holdingsList = Object.values(holdings);
  const isOverallPLPositive = totalUnrealizedPL >= 0;
  const isTotalPLPositive = totalProfitLoss >= 0;

  // Enriched and filtered holdings list
  const processedHoldings = useMemo(() => {
    const list = holdingsList.map((h) => {
      const stock =
        stocks.find((s) => s.symbol === h.symbol && (!h.exchange || s.exchange === h.exchange)) ||
        stocks.find((s) => s.symbol === h.symbol);

      const currentPrice = stock ? stock.price : h.avgPrice;
      const marketValue = h.quantity * currentPrice;
      const unrealizedPL = marketValue - h.totalInvested;
      const unrealizedPLPercent = h.totalInvested > 0 ? (unrealizedPL / h.totalInvested) * 100 : 0;
      const allocationPercent =
        totalPortfolioValue > 0 ? (marketValue / totalPortfolioValue) * 100 : 0;

      return {
        holding: h,
        stock,
        currentPrice,
        marketValue,
        unrealizedPL,
        unrealizedPLPercent,
        allocationPercent,
      };
    });

    // Filter
    let filtered = list;
    if (holdingSearch.trim()) {
      const q = holdingSearch.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.holding.symbol.toLowerCase().includes(q) ||
          (item.stock?.name && item.stock.name.toLowerCase().includes(q))
      );
    }

    if (holdingFilter === 'GAINERS') {
      filtered = filtered.filter((item) => item.unrealizedPL >= 0);
    } else if (holdingFilter === 'LOSERS') {
      filtered = filtered.filter((item) => item.unrealizedPL < 0);
    }

    // Sort
    filtered.sort((a, b) => {
      if (holdingSort === 'valDesc') return b.marketValue - a.marketValue;
      if (holdingSort === 'valAsc') return a.marketValue - b.marketValue;
      if (holdingSort === 'plDesc') return b.unrealizedPLPercent - a.unrealizedPLPercent;
      if (holdingSort === 'plAsc') return a.unrealizedPLPercent - b.unrealizedPLPercent;
      if (holdingSort === 'symAsc') return a.holding.symbol.localeCompare(b.holding.symbol);
      return 0;
    });

    return filtered;
  }, [holdingsList, stocks, totalPortfolioValue, holdingSearch, holdingFilter, holdingSort]);

  // Slices for Donut Chart
  const sectorColors = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#64748B'];
  const allocationSlices = useMemo(() => {
    const slices = holdingsList.map((h, idx) => {
      const stock =
        stocks.find((s) => s.symbol === h.symbol && (!h.exchange || s.exchange === h.exchange)) ||
        stocks.find((s) => s.symbol === h.symbol);
      const val = stock ? h.quantity * stock.price : h.totalInvested;
      return {
        label: h.symbol,
        value: val,
        color: sectorColors[idx % sectorColors.length],
      };
    });

    if (virtualCash > 0) {
      slices.push({
        label: 'Virtual Cash',
        value: virtualCash,
        color: '#334155',
      });
    }

    return slices;
  }, [holdingsList, stocks, virtualCash]);

  // Filtered and sorted transactions
  const processedTransactions = useMemo(() => {
    let list = transactions.filter((tx) => {
      if (txFilter !== 'ALL' && tx.type !== txFilter) return false;
      if (txSearch.trim()) {
        const q = txSearch.toLowerCase().trim();
        return (
          tx.symbol.toLowerCase().includes(q) ||
          tx.stockName.toLowerCase().includes(q) ||
          tx.id.toLowerCase().includes(q)
        );
      }
      return true;
    });

    list.sort((a, b) => {
      if (txSort === 'newest') return b.timestamp - a.timestamp;
      if (txSort === 'oldest') return a.timestamp - b.timestamp;
      if (txSort === 'valDesc') return b.totalAmount - a.totalAmount;
      if (txSort === 'plDesc') return (b.realizedPL || 0) - (a.realizedPL || 0);
      return 0;
    });

    return list;
  }, [transactions, txFilter, txSearch, txSort]);

  // Paged transactions
  const totalTxPages = Math.max(1, Math.ceil(processedTransactions.length / TX_PAGE_SIZE));
  const pagedTransactions = useMemo(() => {
    const start = (txPage - 1) * TX_PAGE_SIZE;
    return processedTransactions.slice(start, start + TX_PAGE_SIZE);
  }, [processedTransactions, txPage]);

  // Helper to filter transaction history for a specific stock
  const handleFilterTradesForStock = (sym: string) => {
    setTxSearch(sym);
    setTxFilter('ALL');
    setTxPage(1);
    // Smooth scroll down to transactions
    const el = document.getElementById('transaction-history-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              My Virtual Portfolio
            </h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800/70 text-emerald-300">
              Verified Market Valuations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time equity holdings, weighted average cost basis, and completed transaction records
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setExportDefaultTab('summary');
              setIsExportOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700/80 rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentTab('market')}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Explore Stocks to Buy</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Value */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Portfolio Value</span>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {formatINR(totalPortfolioValue)}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-between">
            <span>Cash: {formatINR(virtualCash)}</span>
            <span className={isTotalPLPositive ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
              {isTotalPLPositive ? '+' : ''}{formatPercent(totalProfitLossPercent)} net
            </span>
          </div>
        </div>

        {/* Invested Cost Basis */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Total Invested (Cost Basis)</span>
          <div className="text-2xl font-bold font-mono text-slate-200 mt-1">
            {formatINR(totalInvestedAmount)}
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>In {holdingsList.length} companies</span>
            <span className="font-mono text-slate-300">Equity: {formatINR(portfolioHoldingsValue)}</span>
          </div>
        </div>

        {/* Unrealized P&L */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Unrealized P&L (Open Positions)</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              isOverallPLPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPLPositive ? '+' : ''}
            {formatINR(totalUnrealizedPL)}
          </div>
          <div
            className={`text-xs font-mono font-semibold mt-2 ${
              isOverallPLPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isOverallPLPositive ? '+' : ''}
            {formatPercent(totalUnrealizedPLPercent)} return on cost
          </div>
        </div>

        {/* Realized P&L */}
        <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <span className="text-xs text-slate-400">Realized P&L (Closed Trades)</span>
          <div
            className={`text-2xl font-bold font-mono mt-1 ${
              totalRealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {totalRealizedPL >= 0 ? '+' : ''}
            {formatINR(totalRealizedPL)}
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono flex items-center justify-between">
            <span>Overall P&L:</span>
            <span className={`font-semibold ${isTotalPLPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isTotalPLPositive ? '+' : ''}{formatINR(totalProfitLoss)}
            </span>
          </div>
        </div>
      </div>

      {/* Holdings Section */}
      <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">Active Equity Holdings</h2>
              <span className="text-xs text-slate-500 font-mono">({holdingsList.length} Positions)</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Valued using verified official NSE/BSE Bhavcopy quotes from TejHQ
            </p>
          </div>

          {/* Holdings Search, Filter & Sort Controls */}
          {holdingsList.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={holdingSearch}
                  onChange={(e) => setHoldingSearch(e.target.value)}
                  placeholder="Search holdings..."
                  className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 w-36 sm:w-44"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
                {(['ALL', 'GAINERS', 'LOSERS'] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setHoldingFilter(f)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      holdingFilter === f
                        ? 'bg-slate-800 text-white font-semibold shadow-xs'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {f === 'ALL' ? 'All' : f === 'GAINERS' ? 'In Profit' : 'In Loss'}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <select
                value={holdingSort}
                onChange={(e) => setHoldingSort(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-emerald-500"
              >
                <option value="valDesc">Valuation: High to Low</option>
                <option value="valAsc">Valuation: Low to High</option>
                <option value="plDesc">P&L %: Highest First</option>
                <option value="plAsc">P&L %: Lowest First</option>
                <option value="symAsc">Symbol (A-Z)</option>
              </select>
            </div>
          )}
        </div>

        {holdingsList.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <Briefcase className="w-10 h-10 text-slate-600" />
            <div className="text-sm font-semibold text-slate-300">You have no active stock positions</div>
            <p className="text-xs text-slate-500 max-w-sm">
              Use your ₹{virtualCash.toLocaleString('en-IN')} available virtual cash to practice purchasing shares of leading Indian companies.
            </p>
            <button
              type="button"
              onClick={() => setCurrentTab('market')}
              className="mt-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
            >
              Explore Stocks to Invest
            </button>
          </div>
        ) : processedHoldings.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No holdings match your search or filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold text-right">Shares</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg. Cost Basis</th>
                  <th className="py-3 px-4 font-semibold text-right">Market Price (EOD)</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Cost Basis</th>
                  <th className="py-3 px-4 font-semibold text-right">Current Valuation</th>
                  <th className="py-3 px-4 font-semibold text-right">Unrealized P&L</th>
                  <th className="py-3 px-4 font-semibold text-right">Portfolio Alloc.</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {processedHoldings.map(({ holding: h, stock, currentPrice, marketValue, unrealizedPL, unrealizedPLPercent, allocationPercent }) => {
                  const isPos = unrealizedPL >= 0;
                  const exchange = h.exchange || (stock ? stock.exchange : 'NSE');

                  return (
                    <tr
                      key={`${h.symbol}-${exchange}`}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => stock && onOpenStockDetail(stock)}
                    >
                      {/* Stock info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                            {h.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              <span>{h.symbol}</span>
                              <span
                                className={`text-[10px] font-semibold px-1 py-0.2 rounded font-mono ${
                                  exchange === 'BSE'
                                    ? 'bg-blue-950/70 text-blue-300 border border-blue-800/50'
                                    : 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/50'
                                }`}
                              >
                                {exchange}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {stock ? stock.name : h.companyName || h.symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        {h.quantity}
                      </td>

                      {/* Avg Buy Price */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatINR(h.avgPrice)}
                      </td>

                      {/* Current Price */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatINR(currentPrice)}
                      </td>

                      {/* Total Cost Basis */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatINR(h.totalInvested)}
                      </td>

                      {/* Market Value */}
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatINR(marketValue)}
                      </td>

                      {/* P&L */}
                      <td className="py-3 px-4 text-right font-mono">
                        <div className={`font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}
                          {formatINR(unrealizedPL)}
                        </div>
                        <div className={`text-[10px] ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {isPos ? '+' : ''}
                          {formatPercent(unrealizedPLPercent)}
                        </div>
                      </td>

                      {/* Allocation % */}
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatPercent(allocationPercent)}
                      </td>

                      {/* Actions */}
                      <td
                        className="py-3 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-1.5">
                          {stock && (
                            <>
                              <button
                                type="button"
                                onClick={() => onOpenTrade(stock, 'BUY')}
                                className="px-2 py-1 text-[11px] font-semibold bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 rounded-lg transition-colors"
                                title="Buy more shares"
                              >
                                Buy
                              </button>
                              <button
                                type="button"
                                onClick={() => onOpenTrade(stock, 'SELL')}
                                className="px-2 py-1 text-[11px] font-semibold bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-lg transition-colors"
                                title="Sell holdings"
                              >
                                Sell
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            onClick={() => handleFilterTradesForStock(h.symbol)}
                            className="p-1 text-[11px] text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors"
                            title="View trade history for this stock"
                          >
                            <History className="w-3.5 h-3.5 text-cyan-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation breakdown card */}
      {holdingsList.length > 0 && (
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl">
          <div className="pb-3 border-b border-slate-800/80 mb-4">
            <h2 className="text-base font-bold text-white tracking-tight">
              Portfolio Weight Allocation
            </h2>
            <p className="text-xs text-slate-400">
              Proportion of each security in relation to overall net worth
            </p>
          </div>
          <div className="flex justify-center py-2">
            <DonutChart
              slices={allocationSlices}
              totalValue={totalPortfolioValue}
              centerTitle="Allocation"
            />
          </div>
        </div>
      )}

      {/* Transaction History Section */}
      <div id="transaction-history-section" className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight">
                Transaction History
              </h2>
              <span className="text-xs text-slate-500 font-mono">
                ({transactions.length} Total Trades)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Immutable ledger of executed virtual market orders recorded to Cloud Firestore
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
              <input
                type="text"
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
                }}
                placeholder="Search trades..."
                className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 w-32 sm:w-40"
              />
              {txSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setTxSearch('');
                    setTxPage(1);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter buttons */}
            <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-xl">
              {(['ALL', 'BUY', 'SELL'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => {
                    setTxFilter(filter);
                    setTxPage(1);
                  }}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                    txFilter === filter
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Sort selector */}
            <select
              value={txSort}
              onChange={(e) => {
                setTxSort(e.target.value as any);
                setTxPage(1);
              }}
              className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300 outline-none focus:border-cyan-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="valDesc">Value: High to Low</option>
              <option value="plDesc">Realized P&L: High to Low</option>
            </select>

            {/* Export Transactions button */}
            <button
              type="button"
              onClick={() => {
                setExportDefaultTab('transactions');
                setIsExportOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {processedTransactions.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            No transactions found matching criteria.
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                    <th className="py-3 px-4 font-semibold">Tx ID</th>
                    <th className="py-3 px-4 font-semibold">Date & Time</th>
                    <th className="py-3 px-4 font-semibold">Type</th>
                    <th className="py-3 px-4 font-semibold">Security</th>
                    <th className="py-3 px-4 font-semibold text-right">Shares</th>
                    <th className="py-3 px-4 font-semibold text-right">Execution Price</th>
                    <th className="py-3 px-4 font-semibold text-right">Total Value</th>
                    <th className="py-3 px-4 font-semibold text-right">Cash Balance After</th>
                    <th className="py-3 px-4 font-semibold text-right">Realized P&L</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {pagedTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-850/40">
                      <td className="py-3 px-4 text-slate-500 font-mono text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                          {tx.id.slice(0, 10)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {tx.dateFormatted}
                      </td>
                      <td className="py-3 px-4 font-bold font-mono text-[11px]">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            tx.type === 'BUY'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                              : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                          }`}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-xs flex items-center gap-1.5">
                          <span>{tx.symbol}</span>
                          <span className="text-[10px] font-normal px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                            {tx.exchange || 'NSE'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                          {tx.stockName}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                        {tx.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        {formatINR(tx.price)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-white">
                        {formatINR(tx.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-400">
                        {tx.cashAfterTrade !== undefined ? formatINR(tx.cashAfterTrade) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-semibold text-[11px]">
                        {tx.type === 'SELL' && tx.realizedPL !== undefined ? (
                          <span className={tx.realizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {tx.realizedPL >= 0 ? '+' : ''}{formatINR(tx.realizedPL)}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalTxPages > 1 && (
              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <span>
                  Showing {(txPage - 1) * TX_PAGE_SIZE + 1} -{' '}
                  {Math.min(txPage * TX_PAGE_SIZE, processedTransactions.length)} of{' '}
                  {processedTransactions.length} records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                    disabled={txPage === 1}
                    className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-white text-xs">
                    Page {txPage} of {totalTxPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTxPage((p) => Math.min(totalTxPages, p + 1))}
                    disabled={txPage === totalTxPages}
                    className="p-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export Portfolio Modal */}
      <ExportPortfolioModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        defaultTab={exportDefaultTab}
      />
    </div>
  );
};
