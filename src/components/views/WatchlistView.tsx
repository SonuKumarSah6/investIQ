import React from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';
import { MiniSparkline } from '../charts/MiniSparkline';
import {
  Bookmark,
  BookmarkX,
  Trash2,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ShieldCheck,
  Eye,
  Bell,
} from 'lucide-react';

interface WatchlistViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
  onOpenCreateAlert?: (stock?: Stock) => void;
}

export const WatchlistView: React.FC<WatchlistViewProps> = ({
  onOpenTrade,
  onOpenStockDetail,
  onOpenCreateAlert,
}) => {
  const { watchlist, toggleWatchlist, stocks, setCurrentTab, activeAlerts } = useInvest();

  const watchedStocks = stocks.filter((s) => watchlist.includes(s.symbol));

  const popularAddSuggestions = stocks
    .filter((s) => !watchlist.includes(s.symbol))
    .slice(0, 4);

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Personal Watchlist
            </h1>
            <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md font-mono">
              {watchedStocks.length} Tracked
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracked Indian companies with real-time price updates and quick trade execution
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCurrentTab('market')}
          className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition-all flex items-center gap-2 self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add More Stocks</span>
        </button>
      </div>

      {watchedStocks.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4">
          <Bookmark className="w-12 h-12 text-slate-600" />
          <div>
            <h3 className="text-base font-bold text-white">Your Watchlist is Empty</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Pin top Indian equities to your watchlist to monitor day-to-day price movements and jump on buying opportunities.
            </p>
          </div>

          {/* Quick Suggestions to add */}
          {popularAddSuggestions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800 w-full max-w-md">
              <span className="text-xs text-slate-400 mb-3 block">
                Quick Add Popular Bluechips:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-2">
                {popularAddSuggestions.map((s) => (
                  <button
                    key={s.symbol}
                    type="button"
                    onClick={() => toggleWatchlist(s.symbol)}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>+ {s.symbol}</span>
                    <span className="font-mono text-emerald-400 text-[11px]">
                      ({formatINR(s.price, false)})
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                  <th className="py-3 px-4 font-semibold">Instrument</th>
                  <th className="py-3 px-4 font-semibold">Sector</th>
                  <th className="py-3 px-4 font-semibold text-right">EOD Price</th>
                  <th className="py-3 px-4 font-semibold text-right">Day Change</th>
                  <th className="py-3 px-4 font-semibold text-center hidden md:table-cell">
                    30D Trend
                  </th>
                  <th className="py-3 px-4 font-semibold text-right hidden lg:table-cell">
                    Day High / Low
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {watchedStocks.map((stock) => {
                  const isPos = stock.change >= 0;
                  const history1M = stock.history['1M']?.map((p) => p.price) || [];

                  return (
                    <tr
                      key={stock.symbol}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => onOpenStockDetail(stock)}
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                            {stock.symbol.slice(0, 3)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                              <span>{stock.symbol}</span>
                              <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono">
                                {stock.exchange || 'NSE'}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">{stock.sector}</td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-white text-sm">
                        {stock.price > 0 ? formatINR(stock.price) : <span className="text-slate-500 font-sans">Price unavailable</span>}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold">
                        <div className={isPos ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPos ? '+' : ''}
                          {formatPercent(stock.changePercent)}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {isPos ? '+' : ''}
                          {formatINR(stock.change)}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-center hidden md:table-cell">
                        <div className="flex justify-center">
                          <MiniSparkline
                            data={history1M.length > 0 ? history1M : [stock.previousClose, stock.price]}
                            isPositive={isPos}
                            width={80}
                            height={22}
                          />
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-400 hidden lg:table-cell">
                        <div>{formatINR(stock.dayHigh, false)}</div>
                        <div className="text-[10px] text-slate-500">{formatINR(stock.dayLow, false)}</div>
                      </td>

                      <td
                        className="py-3.5 px-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-end gap-2">
                          {onOpenCreateAlert && (
                            <button
                              type="button"
                              onClick={() => onOpenCreateAlert(stock)}
                              title={activeAlerts.some((a) => a.symbol === stock.symbol) ? 'Price Alert Active' : 'Set Price Alert'}
                              className={`p-1.5 rounded-lg border transition-colors ${
                                activeAlerts.some((a) => a.symbol === stock.symbol)
                                  ? 'bg-amber-950/60 border-amber-800 text-amber-300'
                                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:text-white'
                              }`}
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleWatchlist(stock.symbol)}
                            title="Remove from Watchlist"
                            className="p-1.5 rounded-lg border border-slate-700/60 bg-slate-800/60 text-slate-400 hover:text-rose-400 hover:border-rose-800/60 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
                            Buy
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
      )}
    </div>
  );
};
