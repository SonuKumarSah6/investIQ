import React, { useState, useEffect } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, roundMoney, formatPercent } from '../../utils/formatters';
import { InteractiveStockChart } from '../charts/InteractiveStockChart';
import {
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Search,
  Wallet,
  Briefcase,
  ChevronDown,
} from 'lucide-react';

interface VirtualTradeViewProps {
  onOpenStockDetail: (stock: Stock) => void;
}

export const VirtualTradeView: React.FC<VirtualTradeViewProps> = ({ onOpenStockDetail }) => {
  const {
    stocks,
    selectedStockSymbol,
    setSelectedStockSymbol,
    selectedStock,
    virtualCash,
    holdings,
    buyStock,
    sellStock,
  } = useInvest();

  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ error?: string; success?: string } | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const stock = selectedStock || stocks[0];
  const holding = holdings[stock.symbol];
  const sharesOwned = holding ? holding.quantity : 0;
  const estimatedTotal = roundMoney(quantity * stock.price);

  const canAfford = orderType === 'BUY' ? virtualCash >= estimatedTotal : true;
  const canSell = orderType === 'SELL' ? sharesOwned >= quantity && quantity > 0 : true;
  const isValidQuantity = Number.isInteger(quantity) && quantity > 0;
  const maxAffordable = Math.floor(virtualCash / stock.price);

  const filteredStockList = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExecuteTrade = async () => {
    setStatusMessage(null);

    if (orderType === 'BUY') {
      const result = await buyStock(stock.symbol, quantity);
      if (result.success) {
        setStatusMessage({ success: result.message });
        setIsConfirming(false);
      } else {
        setStatusMessage({ error: result.message });
      }
    } else {
      const result = await sellStock(stock.symbol, quantity);
      if (result.success) {
        setStatusMessage({ success: result.message });
        setIsConfirming(false);
      } else {
        setStatusMessage({ error: result.message });
      }
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Virtual Trading Terminal
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Simulated market order execution with live price calculations and position sizing
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>ZERO REAL FINANCIAL RISK · 100% SIMULATED</span>
        </div>
      </div>

      {/* Main Split: Left 2 Cols (Stock Analytics & Chart) / Right 1 Col (Order Slip) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Stock Picker & Interactive Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stock Selection Bar */}
          <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative">
              <button
                type="button"
                onClick={() => setSearchOpen(!searchOpen)}
                className="flex items-center gap-3 px-3.5 py-2 bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs">
                  {stock.symbol.slice(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{stock.symbol}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400 truncate max-w-[180px] block">
                    {stock.name}
                  </span>
                </div>
              </button>

              {/* Stock Search Dropdown Popover */}
              {searchOpen && (
                <div className="absolute top-full left-0 mt-2 w-80 max-h-72 bg-[#0F172A] border border-slate-700 rounded-xl shadow-2xl z-30 overflow-hidden flex flex-col">
                  <div className="p-2 border-b border-slate-800">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stock..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-900 text-xs text-white rounded-lg outline-none border border-slate-800"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="overflow-y-auto max-h-60 p-1 divide-y divide-slate-800/40">
                    {filteredStockList.map((s) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedStockSymbol(s.symbol);
                          setSearchOpen(false);
                          setIsConfirming(false);
                          setStatusMessage(null);
                        }}
                        className="w-full text-left p-2 hover:bg-slate-800 rounded-lg flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <div className="font-bold text-white">{s.symbol}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                            {s.name}
                          </div>
                        </div>
                        <div className="font-mono text-right text-slate-200">
                          {formatINR(s.price)}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Price & Day Stats */}
            <div className="flex items-center justify-between sm:justify-end gap-6">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>Market Price</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                    {stock.priceLabel || 'End-of-day'}
                  </span>
                </div>
                <div className="text-xl font-bold font-mono text-white mt-0.5">
                  {stock.price > 0 ? formatINR(stock.price) : <span className="text-rose-400">Price unavailable</span>}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-400">Session P&L</span>
                <div
                  className={`text-sm font-semibold font-mono mt-0.5 ${
                    stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {stock.change >= 0 ? '+' : ''}
                  {formatINR(stock.change)} ({formatPercent(stock.changePercent)})
                </div>
              </div>
            </div>
          </div>

          {/* High-Resolution Interactive Chart */}
          <InteractiveStockChart
            historyMap={stock.history}
            currentPrice={stock.price}
            symbol={stock.symbol}
          />

          {/* Company Brief & Sector */}
          <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
            <div>
              <span className="text-slate-400">Industry:</span>{' '}
              <span className="text-slate-200 font-medium">{stock.sector}</span>
              <span className="text-slate-500 mx-2">·</span>
              <span className="text-slate-400">Market Cap:</span>{' '}
              <span className="text-slate-200 font-medium">{stock.marketCap}</span>
              <span className="text-slate-500 mx-2">·</span>
              <span className="text-slate-400">P/E:</span>{' '}
              <span className="text-slate-200 font-medium">{stock.peRatio}</span>
            </div>
            <button
              type="button"
              onClick={() => onOpenStockDetail(stock)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors shrink-0"
            >
              Full Profile & Ratios →
            </button>
          </div>
        </div>

        {/* Right: Order Slip */}
        <div className="p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between gap-5 shadow-lg">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white tracking-tight">Order Slip</h2>
              <span className="text-xs text-slate-500 font-mono">NSE-EQ</span>
            </div>

            {/* Buy / Sell Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setOrderType('BUY');
                  setIsConfirming(false);
                  setStatusMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                BUY
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrderType('SELL');
                  setIsConfirming(false);
                  setStatusMessage(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                SELL
              </button>
            </div>

            {/* Balances Display */}
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400">Available Virtual Cash:</span>
              </div>
              <span className="font-mono font-bold text-emerald-400">
                {formatINR(virtualCash)}
              </span>
            </div>

            {holding && (
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-400">Owned Shares:</span>
                </div>
                <span className="font-mono font-bold text-white">
                  {sharesOwned} shares (@ {formatINR(holding.avgPrice)})
                </span>
              </div>
            )}

            {/* Quantity Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5 text-xs">
                <label className="font-medium text-slate-300">Quantity of Shares</label>
                {orderType === 'BUY' && maxAffordable > 0 && (
                  <span className="text-[11px] text-slate-400">
                    Max: <span className="font-mono text-slate-200">{maxAffordable}</span>
                  </span>
                )}
                {orderType === 'SELL' && (
                  <span className="text-[11px] text-slate-400">
                    Owned: <span className="font-mono text-slate-200">{sharesOwned}</span>
                  </span>
                )}
              </div>

              <input
                type="number"
                min="1"
                step="1"
                value={quantity || ''}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 0 : val);
                  setIsConfirming(false);
                  setStatusMessage(null);
                }}
                className="w-full bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                placeholder="0"
              />

              {/* Quick increment buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 5, 10, 25, 50].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setQuantity(amt);
                      setIsConfirming(false);
                      setStatusMessage(null);
                    }}
                    className="px-2 py-1 text-xs font-mono bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-md transition-colors"
                  >
                    +{amt}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (orderType === 'BUY') {
                      setQuantity(Math.max(1, maxAffordable));
                    } else {
                      setQuantity(sharesOwned);
                    }
                    setIsConfirming(false);
                    setStatusMessage(null);
                  }}
                  className="px-2 py-1 text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-emerald-400 rounded-md transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>Unit Price</span>
                <span className="font-mono text-slate-200">{formatINR(stock.price)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Execution Type</span>
                <span className="text-slate-200 font-medium">Market Order</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Brokerage & Tax</span>
                <span className="font-mono text-emerald-400">₹0.00 (Simulator Free)</span>
              </div>
              <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm font-semibold">
                <span className="text-white">Estimated Order Total</span>
                <span className="font-mono text-white text-base font-bold">
                  {formatINR(estimatedTotal)}
                </span>
              </div>
            </div>

            {/* Error Message */}
            {(!isValidQuantity || !canAfford || !canSell || statusMessage?.error) && (
              <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  {!isValidQuantity && 'Quantity must be a positive integer.'}
                  {isValidQuantity && !canAfford && orderType === 'BUY' && (
                    <span>
                      Insufficient cash. Need {formatINR(estimatedTotal - virtualCash)} more virtual capital.
                    </span>
                  )}
                  {isValidQuantity && !canSell && orderType === 'SELL' && (
                    <span>You own only {sharesOwned} shares of {stock.symbol}.</span>
                  )}
                  {statusMessage?.error && statusMessage.error}
                </div>
              </div>
            )}

            {/* Success Message */}
            {statusMessage?.success && (
              <div className="flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{statusMessage.success}</span>
              </div>
            )}
          </div>

          {/* Action execution buttons */}
          <div className="pt-2">
            {isConfirming ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-3 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTrade}
                  className={`flex-2 py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all ${
                    orderType === 'BUY'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  Confirm {orderType} ({formatINR(estimatedTotal)})
                </button>
              </div>
            ) : (
              <button
                type="button"
                disabled={!isValidQuantity || (orderType === 'BUY' && !canAfford) || (orderType === 'SELL' && !canSell)}
                onClick={() => setIsConfirming(true)}
                className={`w-full py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                Review {orderType} Order
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
