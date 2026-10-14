import React, { useState, useEffect } from 'react';
import { Stock, CorporateAction } from '../../types';
import { useInvest } from '../../context/InvestContext';
import { formatINR, formatPercent, formatTradingDate } from '../../utils/formatters';
import { InteractiveStockChart } from '../charts/InteractiveStockChart';
import { marketDataService } from '../../services/marketDataService';
import {
  X,
  Bookmark,
  BookmarkCheck,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Bell,
  Clock,
  ExternalLink,
  Award,
  Layers,
} from 'lucide-react';

interface StockDetailModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenCreateAlert?: (stock: Stock) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  isOpen,
  onClose,
  onOpenTrade,
  onOpenCreateAlert,
}) => {
  const { holdings, isInWatchlist, toggleWatchlist, activeAlerts, marketSession } = useInvest();
  const [actions, setActions] = useState<CorporateAction[]>([]);
  const [loadingActions, setLoadingActions] = useState<boolean>(false);

  useEffect(() => {
    if (stock && isOpen) {
      setLoadingActions(true);
      marketDataService
        .getCorporateActions(stock.symbol)
        .then((res) => {
          setActions(res);
        })
        .catch(() => {
          setActions([]);
        })
        .finally(() => {
          setLoadingActions(false);
        });
    }
  }, [stock, isOpen]);

  if (!isOpen || !stock) return null;

  const inWatchlist = isInWatchlist(stock.symbol);
  const holding = holdings[stock.symbol];
  const isPositive = stock.change >= 0;
  const hasActiveAlert = activeAlerts.some((a) => a.symbol === stock.symbol);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-6 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700/60 flex items-center justify-center font-bold text-white text-base">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">{stock.symbol}</h2>
                <span className="text-xs px-2 py-0.5 rounded font-mono font-semibold bg-emerald-950 border border-emerald-800/80 text-emerald-400">
                  {stock.exchange || 'NSE'} Listed
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">· {stock.sector}</span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>{stock.name}</span>
                {stock.isin && <span className="font-mono text-slate-500">ISIN: {stock.isin}</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCreateAlert && (
              <button
                onClick={() => {
                  onOpenCreateAlert(stock);
                }}
                title={hasActiveAlert ? 'Active Price Alert Set' : 'Set Price Alert'}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold ${
                  hasActiveAlert
                    ? 'bg-amber-950/60 border-amber-700/80 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Set Alert</span>
              </button>
            )}

            <button
              onClick={() => toggleWatchlist(stock.symbol)}
              title={inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              className={`p-2 rounded-xl border transition-colors ${
                inWatchlist
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
            >
              {inWatchlist ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] flex flex-col gap-6">
          {/* Price & Change Banner */}
          <div className="flex flex-wrap items-baseline justify-between gap-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Genuine Market Price ({stock.priceLabel || 'End-of-day'})</span>
                <span className="text-[10px] bg-slate-800 px-1.5 py-0.2 rounded font-mono text-emerald-400">
                  {stock.tradingDate || marketSession.tradingDate}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-extrabold text-white font-mono">
                  {stock.price > 0 ? formatINR(stock.price) : 'Price unavailable'}
                </span>
                <span
                  className={`text-sm font-bold font-mono ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {formatINR(stock.change)} ({formatPercent(stock.changePercent)})
                </span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Data Source: {stock.dataProvider || 'TejHQ'} · Official Exchange Bhavcopy Archive
              </div>
            </div>

            {/* Quick Buy/Sell Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTrade(stock, 'BUY');
                }}
                className="px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
              >
                <ArrowDownRight className="w-4 h-4" />
                SIMULATE BUY
              </button>
              {holding && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenTrade(stock, 'SELL');
                  }}
                  className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  SIMULATE SELL
                </button>
              )}
            </div>
          </div>

          {/* Interactive Chart */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-200">Historical Price Candles (OHLCV)</span>
              <span className="text-[11px] text-slate-500">Source: TejHQ End-of-day series</span>
            </div>
            <InteractiveStockChart
              historyMap={stock.history}
              currentPrice={stock.price}
              symbol={stock.symbol}
            />
          </div>

          {/* Current Portfolio Position Callout (if owned) */}
          {holding && (
            <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
              <div className="text-xs font-semibold text-emerald-400 mb-2">
                YOUR SIMULATED POSITION IN {stock.symbol}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400">Shares Owned</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{holding.quantity}</div>
                </div>
                <div>
                  <span className="text-slate-400">Average Buy Price</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">{formatINR(holding.avgPrice)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Current Valuation</span>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">
                    {formatINR(holding.quantity * stock.price)}
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Unrealized P&L</span>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      holding.quantity * stock.price >= holding.totalInvested
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {holding.quantity * stock.price >= holding.totalInvested ? '+' : ''}
                    {formatINR(holding.quantity * stock.price - holding.totalInvested)}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Key Fundamentals & Genuine Exchange Metrics */}
          <div>
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Official Market Metrics & Key Ratios
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Market Cap</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{stock.marketCap}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">P/E Ratio</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{stock.peRatio}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Day High / Low</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {formatINR(stock.dayLow, false)} - {formatINR(stock.dayHigh, false)}
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">52 Week High / Low</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {formatINR(stock.week52Low, false)} - {formatINR(stock.week52High, false)}
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Volume (Bhavcopy)</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{stock.volume}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Previous Close</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">{formatINR(stock.previousClose)}</div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Primary Exchange</span>
                <div className="text-sm font-bold text-white font-mono mt-0.5">
                  {stock.exchange || 'NSE'} (Series {stock.series || 'EQ'})
                </div>
              </div>
              <div className="p-3 bg-slate-900/60 border border-slate-800/60 rounded-xl">
                <span className="text-[11px] text-slate-400">Data License</span>
                <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">MIT (TejHQ Open)</div>
              </div>
            </div>
          </div>

          {/* Genuine Corporate Actions Timeline (Dividends, Splits) */}
          {actions.length > 0 && (
            <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Recorded Corporate Actions ({stock.symbol})</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">{actions.length} Events Logged</span>
              </div>
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {actions.slice(0, 5).map((act, idx) => (
                  <div
                    key={`${act.exDate}-${idx}`}
                    className="p-2.5 bg-slate-850/60 rounded-lg border border-slate-800 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                        <span className="uppercase text-[10px] px-1 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800/60">
                          {act.type}
                        </span>
                        <span>{act.rawSubject || `${act.type} announced`}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Ex-Date: {formatTradingDate(act.exDate)} {act.recordDate ? `· Record Date: ${formatTradingDate(act.recordDate)}` : ''}
                      </div>
                    </div>
                    {act.cashAmount !== undefined && (
                      <span className="font-mono text-emerald-400 font-bold text-xs">
                        ₹{act.cashAmount.toFixed(2)}/sh
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* About Company */}
          <div className="p-4 bg-slate-900/40 border border-slate-800/60 rounded-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span>About {stock.name}</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">{stock.about}</p>
          </div>

          {/* Virtual Execution Disclaimer */}
          <div className="flex items-center gap-2 p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Real quotes provided by TejHQ. All virtual buy and sell orders are paper executions within the InvestIQ simulator — no actual broker or exchange orders are placed.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
