import React, { useState, useEffect } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, roundMoney } from '../../utils/formatters';
import {
  X,
  Bell,
  BellRing,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Percent,
} from 'lucide-react';

interface PriceAlertModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  defaultCondition?: 'ABOVE' | 'BELOW';
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  stock,
  isOpen,
  onClose,
  defaultCondition = 'ABOVE',
}) => {
  const { stocks, createPriceAlert } = useInvest();
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>(
    stock?.symbol || 'RELIANCE'
  );
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>(defaultCondition);
  const [intent, setIntent] = useState<'BUY' | 'SELL' | 'ALERT'>('BUY');
  const [note, setNote] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeStock = stocks.find((s) => s.symbol === selectedStockSymbol) || stocks[0];

  useEffect(() => {
    if (isOpen) {
      if (stock) {
        setSelectedStockSymbol(stock.symbol);
        const defaultTarget =
          defaultCondition === 'ABOVE'
            ? roundMoney(stock.price * 1.02)
            : roundMoney(stock.price * 0.98);
        setTargetPrice(defaultTarget.toString());
      } else if (activeStock) {
        setSelectedStockSymbol(activeStock.symbol);
        setTargetPrice(roundMoney(activeStock.price * 1.02).toString());
      }
      setCondition(defaultCondition);
      setIntent(defaultCondition === 'BELOW' ? 'BUY' : 'SELL');
      setNote('');
      setErrorMessage(null);
    }
  }, [isOpen, stock, defaultCondition]);

  if (!isOpen || !activeStock) return null;

  const currentPrice = activeStock.price;
  const numTargetPrice = parseFloat(targetPrice);

  const applyOffsetPercentage = (pct: number) => {
    const calculated = roundMoney(currentPrice * (1 + pct / 100));
    setTargetPrice(calculated.toString());
    if (pct > 0) {
      setCondition('ABOVE');
      setIntent('SELL');
    } else {
      setCondition('BELOW');
      setIntent('BUY');
    }
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isNaN(numTargetPrice) || numTargetPrice <= 0) {
      setErrorMessage('Please enter a valid target price greater than ₹0.');
      return;
    }

    if (condition === 'ABOVE' && numTargetPrice <= currentPrice) {
      setErrorMessage(
        `Target price for "Rises Above" should be higher than the current price of ${formatINR(currentPrice)}.`
      );
      return;
    }

    if (condition === 'BELOW' && numTargetPrice >= currentPrice) {
      setErrorMessage(
        `Target price for "Drops Below" should be lower than the current price of ${formatINR(currentPrice)}.`
      );
      return;
    }

    const res = createPriceAlert({
      symbol: activeStock.symbol,
      stockName: activeStock.name,
      targetPrice: numTargetPrice,
      condition,
      intent,
      note: note.trim() || undefined,
    });

    if (res.success) {
      onClose();
    } else {
      setErrorMessage(res.message);
    }
  };

  const distancePercent = !isNaN(numTargetPrice) && numTargetPrice > 0
    ? ((numTargetPrice - currentPrice) / currentPrice) * 100
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Create Price Alert</h3>
              <p className="text-xs text-slate-400">
                Receive non-intrusive alerts when market target is reached
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          {/* Stock Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Select Indian Equity
            </label>
            <select
              value={selectedStockSymbol}
              onChange={(e) => {
                const sym = e.target.value;
                setSelectedStockSymbol(sym);
                const s = stocks.find((st) => st.symbol === sym);
                if (s) {
                  setTargetPrice(roundMoney(s.price * 1.02).toString());
                }
              }}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-amber-500 transition-colors"
            >
              {stocks.map((s) => (
                <option key={s.symbol} value={s.symbol}>
                  {s.symbol} — {s.name} ({formatINR(s.price)})
                </option>
              ))}
            </select>
          </div>

          {/* Current Price Reference */}
          <div className="p-3 bg-slate-900/80 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400">Current Simulated Price:</span>
              <div className="text-base font-bold font-mono text-white mt-0.5">
                {formatINR(currentPrice)}
              </div>
            </div>
            <div className="text-right">
              <span className="text-slate-400">Target Distance:</span>
              <div
                className={`text-xs font-mono font-semibold mt-0.5 ${
                  distancePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {distancePercent >= 0 ? '+' : ''}
                {distancePercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Condition Selector */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Trigger Condition
            </label>
            <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setCondition('ABOVE');
                  if (numTargetPrice <= currentPrice) {
                    setTargetPrice(roundMoney(currentPrice * 1.02).toString());
                  }
                  setIntent('SELL');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  condition === 'ABOVE'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                <span>Rises To or Above (≥)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCondition('BELOW');
                  if (numTargetPrice >= currentPrice) {
                    setTargetPrice(roundMoney(currentPrice * 0.98).toString());
                  }
                  setIntent('BUY');
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  condition === 'BELOW'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                <span>Drops To or Below (≤)</span>
              </button>
            </div>
          </div>

          {/* Target Price Input */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Target Price in ₹ (INR)
            </label>
            <input
              type="number"
              step="0.05"
              min="1"
              value={targetPrice}
              onChange={(e) => {
                setTargetPrice(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-amber-500 rounded-xl text-white font-mono text-base outline-none transition-colors"
              placeholder="e.g. 2950.00"
              required
            />

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[11px] text-slate-500 mr-1">Quick Sets:</span>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(-5)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-rose-400 border border-slate-800 rounded-md transition-colors"
              >
                -5%
              </button>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(-2)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-rose-300 border border-slate-800 rounded-md transition-colors"
              >
                -2%
              </button>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(-1)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
              >
                -1%
              </button>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(1)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-md transition-colors"
              >
                +1%
              </button>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(2)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-emerald-300 border border-slate-800 rounded-md transition-colors"
              >
                +2%
              </button>
              <button
                type="button"
                onClick={() => applyOffsetPercentage(5)}
                className="px-2 py-1 text-xs font-mono bg-slate-850 hover:bg-slate-800 text-emerald-400 border border-slate-800 rounded-md transition-colors"
              >
                +5%
              </button>
            </div>
          </div>

          {/* Intended Action / Recommendation */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Trading Intent on Trigger
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setIntent('BUY')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  intent === 'BUY'
                    ? 'bg-emerald-950/60 border-emerald-600 text-emerald-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Buy Signal
              </button>
              <button
                type="button"
                onClick={() => setIntent('SELL')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  intent === 'SELL'
                    ? 'bg-rose-950/60 border-rose-600 text-rose-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Sell Signal
              </button>
              <button
                type="button"
                onClick={() => setIntent('ALERT')}
                className={`py-2 px-2 text-xs font-semibold rounded-xl border text-center transition-all ${
                  intent === 'ALERT'
                    ? 'bg-cyan-950/60 border-cyan-600 text-cyan-200'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Watch Milestone
              </button>
            </div>
          </div>

          {/* Note (Optional) */}
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1.5">
              Strategy Note (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Accumulate 10 shares at support level..."
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
            />
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg hover:shadow-amber-900/30 transition-all flex items-center justify-center gap-2"
            >
              <Bell className="w-4 h-4" />
              <span>Set Alert for {activeStock.symbol}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
