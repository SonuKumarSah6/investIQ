import React, { useState, useEffect } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock } from '../../types';
import { formatINR, roundMoney } from '../../utils/formatters';
import { X, ArrowDownRight, ArrowUpRight, AlertCircle, CheckCircle2, ShieldCheck, Clock } from 'lucide-react';

interface TradeModalProps {
  stock: Stock | null;
  isOpen: boolean;
  onClose: () => void;
  defaultAction?: 'BUY' | 'SELL';
}

export const TradeModal: React.FC<TradeModalProps> = ({
  stock,
  isOpen,
  onClose,
  defaultAction = 'BUY',
}) => {
  const { virtualCash, holdings, buyStock, sellStock, marketSession } = useInvest();
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>(defaultAction);
  const [quantity, setQuantity] = useState<number>(1);
  const [isConfirming, setIsConfirming] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ error?: string; success?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOrderType(defaultAction);
      setQuantity(1);
      setIsConfirming(false);
      setStatusMessage(null);
    }
  }, [isOpen, defaultAction]);

  if (!isOpen || !stock) return null;

  const currentHolding = holdings[stock.symbol];
  const sharesOwned = currentHolding ? currentHolding.quantity : 0;
  const isPriceValid = stock.price > 0;
  const estimatedTotal = roundMoney(quantity * stock.price);

  const canAfford = orderType === 'BUY' ? virtualCash >= estimatedTotal : true;
  const canSell = orderType === 'SELL' ? sharesOwned >= quantity && quantity > 0 : true;
  const isValidQuantity = Number.isInteger(quantity) && quantity > 0;

  const maxAffordable = isPriceValid ? Math.floor(virtualCash / stock.price) : 0;

  const handleExecuteTrade = async () => {
    setStatusMessage(null);

    if (!isPriceValid) {
      setStatusMessage({ error: 'Cannot execute trade: Genuine price unavailable for this stock.' });
      setIsConfirming(false);
      return;
    }

    if (orderType === 'BUY') {
      const result = await buyStock(stock.symbol, quantity);
      if (result.success) {
        setStatusMessage({ success: result.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ error: result.message });
        setIsConfirming(false);
      }
    } else {
      const result = await sellStock(stock.symbol, quantity);
      if (result.success) {
        setStatusMessage({ success: result.message });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({ error: result.message });
        setIsConfirming(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-white text-sm">
              {stock.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{stock.symbol}</h3>
                <span className="text-xs px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-mono">
                  {stock.exchange || 'NSE'} · Simulated Fill
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{stock.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Trade Body */}
        <div className="p-5 flex flex-col gap-5">
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
              BUY ORDER
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
              SELL ORDER
            </button>
          </div>

          {/* Genuine Execution Price & Context */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Genuine Execution Price</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                  {stock.priceLabel || 'End-of-day'}
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {isPriceValid ? formatINR(stock.price) : <span className="text-rose-400">Price unavailable</span>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">
                {orderType === 'BUY' ? 'Available Virtual Cash' : 'Shares in Portfolio'}
              </div>
              <div className="text-sm font-semibold font-mono text-emerald-400 mt-0.5">
                {orderType === 'BUY' ? formatINR(virtualCash) : `${sharesOwned} shares`}
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-slate-300">Quantity (Shares)</label>
              {orderType === 'BUY' && maxAffordable > 0 && (
                <span className="text-[11px] text-slate-400">
                  Max Affordable: <span className="text-slate-200 font-mono">{maxAffordable}</span>
                </span>
              )}
              {orderType === 'SELL' && (
                <span className="text-[11px] text-slate-400">
                  Owned: <span className="text-slate-200 font-mono">{sharesOwned}</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
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
                className="flex-1 bg-slate-900 border border-slate-800 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white font-mono text-base outline-none transition-colors"
                placeholder="0"
              />
            </div>

            {/* Quick Quantity Buttons */}
            <div className="flex items-center gap-1.5 mt-2.5">
              {[1, 5, 10, 25, 50].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => {
                    setQuantity(amt);
                    setIsConfirming(false);
                    setStatusMessage(null);
                  }}
                  className="px-2.5 py-1 text-xs font-mono bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-md transition-colors"
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
                className="px-2.5 py-1 text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 text-emerald-400 rounded-md transition-colors"
              >
                Max
              </button>
            </div>
          </div>

          {/* Order Summary Box */}
          <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/60 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Order Execution Type</span>
              <span className="text-slate-200 font-medium">Simulated Market Fill at Latest Price</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Data Source</span>
              <span className="text-slate-300 font-mono text-[11px]">TejHQ Official Bhavcopy ({stock.tradingDate || marketSession.tradingDate})</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Virtual Brokerage Fee</span>
              <span className="text-emerald-400 font-mono">₹0.00 (Zero Commission Sandbox)</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex items-center justify-between text-sm font-semibold">
              <span className="text-white">Estimated Order Total</span>
              <span className="text-white font-mono text-base">{formatINR(estimatedTotal)}</span>
            </div>
          </div>

          {/* Error Message */}
          {(!isValidQuantity || !canAfford || !canSell || !isPriceValid || statusMessage?.error) && (
            <div className="flex items-start gap-2 p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                {!isPriceValid && 'Price is currently unavailable for this security.'}
                {isPriceValid && !isValidQuantity && 'Quantity must be a positive whole number.'}
                {isPriceValid && isValidQuantity && !canAfford && orderType === 'BUY' && (
                  <span>
                    Insufficient virtual cash. You need {formatINR(estimatedTotal - virtualCash)} more capital.
                  </span>
                )}
                {isPriceValid && isValidQuantity && !canSell && orderType === 'SELL' && (
                  <span>
                    You cannot sell {quantity} shares because you only own {sharesOwned} shares.
                  </span>
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

          {/* Honest Simulation Disclaimer Note */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/60">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Simulated execution only. Orders are paper-matched at genuine prices without connecting a real brokerage.</span>
          </div>

          {/* Action Button */}
          {isConfirming ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsConfirming(false)}
                className="flex-1 py-3 text-xs font-semibold text-slate-400 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
              >
                Back
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
                Confirm Simulated {orderType} ({formatINR(estimatedTotal)})
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={!isValidQuantity || !isPriceValid || (orderType === 'BUY' && !canAfford) || (orderType === 'SELL' && !canSell)}
              onClick={() => setIsConfirming(true)}
              className={`w-full py-3 text-xs font-bold text-white rounded-xl shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                orderType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500'
                  : 'bg-rose-600 hover:bg-rose-500'
              }`}
            >
              Review Simulated {orderType} Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
