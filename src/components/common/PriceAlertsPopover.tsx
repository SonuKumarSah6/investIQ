import React, { useState } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock, PriceAlert } from '../../types';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  Bell,
  BellRing,
  X,
  Trash2,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  ExternalLink,
  Clock,
} from 'lucide-react';

interface PriceAlertsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCreateAlert: () => void;
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
}

export const PriceAlertsPopover: React.FC<PriceAlertsPopoverProps> = ({
  isOpen,
  onClose,
  onOpenCreateAlert,
  onOpenTrade,
}) => {
  const {
    stocks,
    activeAlerts,
    triggeredAlerts,
    deletePriceAlert,
    dismissPriceAlert,
    dismissAllTriggeredAlerts,
  } = useInvest();

  const [activeTab, setActiveTab] = useState<'triggered' | 'active'>('triggered');

  if (!isOpen) return null;

  const currentPrices: Record<string, number> = {};
  stocks.forEach((s) => {
    currentPrices[s.symbol] = s.price;
  });

  return (
    <>
      {/* Backdrop overlay for mobile */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-2xs lg:bg-transparent"
        onClick={onClose}
      />

      <div className="absolute right-0 top-full mt-2 w-96 max-w-[95vw] z-50 bg-[#0F172A] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
        {/* Popover Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Price Alerts Center
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenCreateAlert();
              }}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900 border-b border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('triggered')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'triggered'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Triggered</span>
            {triggeredAlerts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-black text-[10px] font-bold flex items-center justify-center font-mono">
                {triggeredAlerts.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Active Watching</span>
            <span className="font-mono text-[11px] text-slate-400">
              ({activeAlerts.length})
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="max-h-80 overflow-y-auto p-3 divide-y divide-slate-800/60">
          {activeTab === 'triggered' ? (
            triggeredAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p>No triggered alerts right now.</p>
                <p className="text-[11px] text-slate-600 mt-1">
                  Active alerts will show here as market prices hit your targets.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[11px] text-slate-400">
                    {triggeredAlerts.length} Target Reached
                  </span>
                  <button
                    type="button"
                    onClick={dismissAllTriggeredAlerts}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                {triggeredAlerts.map((alert) => {
                  const stock = stocks.find((s) => s.symbol === alert.symbol);

                  return (
                    <div
                      key={alert.id}
                      className="p-3 bg-slate-900/80 border border-amber-900/40 rounded-xl space-y-2 text-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs">{alert.symbol}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                                alert.intent === 'BUY'
                                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                  : alert.intent === 'SELL'
                                  ? 'bg-rose-950 text-rose-400 border border-rose-800'
                                  : 'bg-cyan-950 text-cyan-400 border border-cyan-800'
                              }`}
                            >
                              {alert.intent}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Target: <span className="font-mono text-slate-200">{formatINR(alert.targetPrice)}</span>
                            {alert.triggeredPrice && (
                              <span> · Hit at <span className="font-mono text-amber-400 font-bold">{formatINR(alert.triggeredPrice)}</span></span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => dismissPriceAlert(alert.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                          title="Dismiss"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {alert.note && (
                        <div className="text-[11px] text-slate-400 italic">
                          "{alert.note}"
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-mono">
                          {alert.triggeredAt ? new Date(alert.triggeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently'}
                        </span>

                        {stock && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenTrade(stock, alert.intent === 'SELL' ? 'SELL' : 'BUY');
                              dismissPriceAlert(alert.id);
                            }}
                            className={`px-3 py-1 text-xs font-bold rounded-lg shadow-sm transition-all ${
                              alert.intent === 'SELL'
                                ? 'bg-rose-600 hover:bg-rose-500 text-white'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            }`}
                          >
                            Trade Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : activeAlerts.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              <p>No active price alerts set.</p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateAlert();
                }}
                className="mt-2 text-xs font-semibold text-emerald-400 hover:underline"
              >
                + Create your first alert
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {activeAlerts.map((alert) => {
                const current = currentPrices[alert.symbol] || alert.targetPrice;
                const distancePct = ((alert.targetPrice - current) / current) * 100;

                return (
                  <div
                    key={alert.id}
                    className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:bg-slate-850/60 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{alert.symbol}</span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {alert.condition === 'ABOVE' ? '≥' : '≤'} {formatINR(alert.targetPrice)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Current: {formatINR(current)} ({distancePct >= 0 ? '+' : ''}{distancePct.toFixed(1)}% away)
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => deletePriceAlert(alert.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between text-[11px]">
          <span className="text-slate-500">Non-intrusive notifications</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenCreateAlert();
            }}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
          >
            <span>+ Set New Alert</span>
          </button>
        </div>
      </div>
    </>
  );
};
