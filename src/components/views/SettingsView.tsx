import React, { useState } from 'react';
import { useInvest } from '../../context/InvestContext';
import { formatINR } from '../../utils/formatters';
import {
  User,
  RotateCcw,
  ShieldCheck,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  Activity,
  RefreshCw,
  Database,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    resetAccount,
    virtualCash,
    initialStartingBalance,
    holdings,
    transactions,
    marketSession,
    refreshRealMarketPrices,
    isLoadingMarketData,
    stocks,
  } = useInvest();

  const [nameInput, setNameInput] = useState<string>(userProfile.name);
  const [levelInput, setLevelInput] = useState<'Beginner' | 'Intermediate' | 'Advanced'>(userProfile.experienceLevel);
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: nameInput.trim() || 'Investor',
      experienceLevel: levelInput,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleConfirmReset = () => {
    resetAccount();
    setShowResetConfirm(false);
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          Simulator Settings & Preferences
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage your demo profile, local storage preferences, and simulation controls
        </p>
      </div>

      {/* Demo Profile Section */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Demo Profile Information</h2>
            <p className="text-xs text-slate-400">
              Personalize your simulated trader identity
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Investor Display Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white outline-none focus:border-emerald-500 transition-colors"
                placeholder="Your Name"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Experience Level
              </label>
              <select
                value={levelInput}
                onChange={(e) => setLevelInput(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="Beginner">Beginner (College Student / First-Time Investor)</option>
                <option value="Intermediate">Intermediate (Familiar with stocks & mutual funds)</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Joined InvestIQ: {userProfile.joinedDate}
            </span>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSaved ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Profile</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Genuine Market Data Provider & Connection Status */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Indian Market Data Infrastructure</h2>
              <p className="text-xs text-slate-400">
                Connected to TejHQ Open Financial Bhavcopy Infrastructure
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => refreshRealMarketPrices()}
            disabled={isLoadingMarketData}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingMarketData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
            <span>{isLoadingMarketData ? 'Syncing...' : 'Sync Prices Now'}</span>
          </button>
        </div>

        <div className="p-4 bg-slate-900/60 border border-slate-800/60 rounded-xl space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Active Primary Provider:</span>
            <span className="text-white font-semibold">TejHQ (NSE & BSE End-of-Day)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Trading Date in Force:</span>
            <span className="font-mono text-emerald-400 font-semibold">{marketSession.tradingDate}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Exchange Session State:</span>
            <span className="font-semibold text-slate-200">{marketSession.statusLabel} ({marketSession.sessionName})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Verified Monitored Stocks:</span>
            <span className="font-mono text-white">{stocks.length} Instruments Loaded</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Price Movement Policy:</span>
            <span className="text-slate-300">Strictly Authentic EOD (Random Micro-Ticks Disabled)</span>
          </div>
        </div>
      </div>

      {/* Local Browser Storage Transparency */}
      <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-purple-400">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Local Browser Persistence</h2>
            <p className="text-xs text-slate-400">
              Data privacy and storage architecture
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          InvestIQ stores 100% of your demo portfolio, holdings, transactions, watchlist, and learning academy progress directly in your web browser's <code className="bg-slate-800 px-1.5 py-0.5 rounded text-emerald-400 font-mono">localStorage</code>. No personal data or trades are sent to external servers or sold to third parties.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-400">Transactions Logged</span>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{transactions.length}</div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-400">Active Positions</span>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{Object.keys(holdings).length}</div>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
            <span className="text-slate-400">Virtual Cash</span>
            <div className="text-sm font-bold font-mono text-white mt-0.5">{formatINR(virtualCash, false)}</div>
          </div>
        </div>
      </div>

      {/* Reset Account Danger Zone */}
      <div className="p-6 bg-rose-950/20 border border-rose-900/40 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-950/60 border border-rose-800/50 flex items-center justify-center text-rose-400">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Reset Account & Simulator</h2>
              <p className="text-xs text-slate-400">
                Restore virtual cash to {formatINR(initialStartingBalance)} and clear active stock holdings
              </p>
            </div>
          </div>

          {!showResetConfirm && (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2 text-xs font-bold text-rose-300 bg-rose-950/60 border border-rose-800 hover:bg-rose-900/60 rounded-xl transition-colors"
            >
              Reset Account
            </button>
          )}
        </div>

        {showResetConfirm && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl space-y-3">
            <div className="flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Are you sure you want to reset?</span>
                <p className="mt-0.5 text-rose-300">
                  This will restore your virtual cash balance to {formatINR(initialStartingBalance)} and clear active positions and transaction histories. Learning academy progress will be preserved.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-sm transition-colors"
              >
                Yes, Reset My Simulator
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimers */}
      <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-start gap-3 text-xs text-slate-500">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p>
          InvestIQ is purely an educational simulation product for Indian college students and young adults. It is not affiliated with the National Stock Exchange of India (NSE), the Bombay Stock Exchange (BSE), or the Securities and Exchange Board of India (SEBI). All market quotes and trade executions are strictly simulated.
        </p>
      </div>
    </div>
  );
};
