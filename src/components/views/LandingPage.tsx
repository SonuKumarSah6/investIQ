import React from 'react';
import { useInvest } from '../../context/InvestContext';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  BookOpen,
  PieChart,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  BarChart3,
  Award,
  Newspaper,
  Download,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentTab, totalPortfolioValue, stocks } = useInvest();

  const previewStocks = stocks.slice(0, 4);

  const scrollToFeatures = () => {
    const el = document.getElementById('features-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Top Header conforming to Top Bar Contract */}
      <header className="sticky top-0 z-40 bg-[#0A0E17]/90 backdrop-blur-md border-b border-slate-800/80 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark (single element) */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setCurrentTab('landing');
            }}
            className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <span>InvestIQ</span>
          </a>

          {/* Zone 2: 4-5 single line nav links with subtle hover underlines */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <a
              href="#features-section"
              onClick={(e) => {
                e.preventDefault();
                scrollToFeatures();
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Platform Features
            </a>
            <a
              href="#simulator-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('simulator-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              How It Works
            </a>
            <a
              href="#academy-section"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('academy-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0"
            >
              Learning Academy
            </a>
            <button
              onClick={() => setCurrentTab('market')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 text-left"
            >
              Live Market Demo
            </button>
          </nav>

          {/* Zone 3: 1 primary action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md hover:shadow-emerald-900/30 transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <span>Start Investing</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 lg:pt-20 pb-16 px-6 lg:px-12 border-b border-slate-800/60">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-6xl mx-auto flex flex-col items-center text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Virtual Stock Simulator for Indian Beginners & College Students</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl leading-[1.15] text-balance">
            Your First Investment.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Zero Real-World Risk.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed text-balance">
            Master stock trading and portfolio management with ₹1,00,000 in virtual capital.
            Practice with realistic Indian-listed companies like Reliance, TCS, and HDFC Bank before risking a single real rupee.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg hover:shadow-emerald-900/40 transition-all flex items-center justify-center gap-2"
            >
              <span>Launch Simulator (₹1,00,000 Demo)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={scrollToFeatures}
              className="w-full sm:w-auto px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-xl transition-all"
            >
              Explore Features
            </button>
          </div>

          {/* Quick trust metrics strip (Quiet unboxed typography) */}
          <div className="mt-12 pt-8 border-t border-slate-800/80 w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <div className="text-xs text-slate-400">Virtual Starting Balance</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">₹1,00,000</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Risk-free paper money</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Indian Market Stocks</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">16 Bluechips</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Nifty & Sensex leaders</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Financial Academy</div>
              <div className="text-xl font-bold font-mono text-white mt-0.5">10 Lessons</div>
              <div className="text-[11px] text-slate-500 mt-0.5">With interactive quizzes</div>
            </div>
            <div>
              <div className="text-xs text-slate-400">Trading Brokerage</div>
              <div className="text-xl font-bold font-mono text-cyan-400 mt-0.5">₹0 Fees</div>
              <div className="text-[11px] text-slate-500 mt-0.5">100% free learning</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Mockup Card */}
        <div className="mt-14 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-slate-800 bg-[#0F172A]/90 p-5 sm:p-7 shadow-2xl backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-800 gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                  Live Simulator Terminal
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  Arjun's Simulated Portfolio Overview
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setCurrentTab('dashboard')}
                className="px-3.5 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 rounded-lg hover:bg-emerald-900/40 transition-colors"
              >
                Open Full Dashboard →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-5">
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Total Portfolio Value</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">
                  {formatINR(totalPortfolioValue)}
                </div>
                <span className="text-xs text-emerald-400 font-mono mt-1 inline-block">
                  +₹4,220.50 (+4.22%) Overall P&L
                </span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Available Virtual Cash</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">₹76,700.00</div>
                <span className="text-xs text-slate-500 mt-1 inline-block">
                  Ready to deploy in fresh trades
                </span>
              </div>
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <span className="text-xs text-slate-400">Current Active Holdings</span>
                <div className="text-2xl font-bold font-mono text-white mt-1">2 Companies</div>
                <span className="text-xs text-slate-400 mt-1 inline-block">
                  RELIANCE (10 shares) · TMCV (15)
                </span>
              </div>
            </div>

            {/* Quick table preview */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2.5 font-medium">Symbol</th>
                    <th className="py-2.5 font-medium">Company</th>
                    <th className="py-2.5 font-medium text-right">EOD Market Price</th>
                    <th className="py-2.5 font-medium text-right">Day Change</th>
                    <th className="py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {previewStocks.map((stock) => (
                    <tr key={stock.symbol} className="hover:bg-slate-850/40">
                      <td className="py-3 font-bold text-white">{stock.symbol}</td>
                      <td className="py-3 text-slate-300">{stock.name}</td>
                      <td className="py-3 text-right font-mono text-white">
                        {formatINR(stock.price)}
                      </td>
                      <td
                        className={`py-3 text-right font-mono font-semibold ${
                          stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {stock.change >= 0 ? '+' : ''}
                        {formatPercent(stock.changePercent)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('trade');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 rounded-md hover:bg-emerald-900/40 transition-colors"
                        >
                          Trade
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How the Simulator Works (3 Simple Steps) */}
      <section id="simulator-section" className="py-16 px-6 lg:px-12 border-b border-slate-800/60 bg-[#0B0F19]/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Simulation Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              How InvestIQ Works
            </h2>
            <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Three straightforward steps designed to build financial confidence and practical investing intuition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 font-mono font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-white mb-2">Claim Demo Capital</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start instantly with ₹1,00,000 in virtual cash. No credit cards, bank accounts, or KYC required.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-emerald-400 font-semibold">
                Instant Demo Activation
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-800/50 flex items-center justify-center text-teal-400 font-mono font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-white mb-2">Practice Market Orders</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Place simulated Buy and Sell market orders on leading Indian equities. Track real-time weighted average purchase price and unrealized returns.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-teal-400 font-semibold">
                Real Trade Execution Logic
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 font-mono font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-white mb-2">Analyze & Level Up</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Review sector allocation, complete learning modules, take quizzes, and unlock gamified badges as your skills expand.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-800 text-xs text-cyan-400 font-semibold">
                Portfolio Analytics & Badges
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features-section" className="py-16 px-6 lg:px-12 border-b border-slate-800/60">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Built for Modern Learners
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Everything You Need to Master Investing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Virtual Trading Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Execute virtual Buy & Sell orders with instant validation, cash checks, and average cost calculations. No delays, no real financial exposure.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-emerald-400 font-semibold">
                Zero Risk · ₹1 Lakh Virtual Capital
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-4">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">AI Investment Mentor</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Context-aware assistant analyzing your exact simulated portfolio, asset concentration, risk profile, and beginner financial concepts in plain English.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-purple-400 font-semibold">
                InvestIQ Intelligence · Gemini Powered
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4">
                  <Newspaper className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Live Financial News Wire</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time Indian market news covering NSE/BSE developments, RBI monetary policy, company earnings, sentiment analysis, and 1-click AI explanations.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-cyan-400 font-semibold">
                Sentiment Tags · Stock Mentions
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-teal-950/60 border border-teal-800/60 flex items-center justify-center text-teal-400 mb-4">
                  <PieChart className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Portfolio Analytics & Export</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive SVG donut charts, allocation breakdowns, and one-click export of portfolio summaries and transaction history to CSV and JSON formats.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-teal-400 font-semibold">
                CSV & JSON Downloads · Audit Ready
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Learn Academy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  10 bite-sized modules on Indian equities, Demat accounts, Nifty vs Sensex, SIPs, and risk management with interactive knowledge checks.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-blue-400 font-semibold">
                Quizzes · Progress Tracking
              </div>
            </div>

            <div className="p-6 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Price Alerts & Watchlist</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Set target price notifications with buy/sell triggers. Real-time background simulation checks alert conditions automatically and notifies you.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-850 text-[11px] text-amber-400 font-semibold">
                Automated Triggers · In-App Toasts
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Academy Preview Section */}
      <section id="academy-section" className="py-16 px-6 lg:px-12 border-b border-slate-800/60 bg-[#0B0F19]/50">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="max-w-lg">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Educational Focus
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 leading-snug">
              From Beginner to Confident Investor
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-3 leading-relaxed">
              Every lesson is broken down into bite-sized explanations with real-world analogies, vocabulary tips, and interactive multiple-choice tests with instant answers.
            </p>

            <div className="mt-6 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero complex jargon — straightforward plain English</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Indian market focus (SEBI, NSE, BSE, CDSL, Demat, SIPs)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Earn badges and track your progress in your browser</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCurrentTab('learn')}
              className="mt-6 px-5 py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Explore All 10 Lessons</span>
            </button>
          </div>

          <div className="w-full md:w-auto p-5 bg-[#0F172A] border border-slate-800 rounded-2xl flex flex-col gap-3 min-w-[300px]">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Popular Lessons
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-emerald-400 font-semibold">Lesson 01</span>
              <div className="text-xs font-bold text-white mt-0.5">What is the Stock Market?</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-cyan-400 font-semibold">Lesson 03</span>
              <div className="text-xs font-bold text-white mt-0.5">NSE, BSE & Benchmark Indices</div>
            </div>
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
              <span className="text-[11px] text-purple-400 font-semibold">Lesson 08</span>
              <div className="text-xs font-bold text-white mt-0.5">The Magic of Long-Term Compounding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Disclaimer Banner */}
      <section className="py-8 px-6 lg:px-12 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-300">SIMULATED TRADING & EDUCATIONAL USE NOTICE: </span>
            InvestIQ is an interactive simulation and financial literacy environment. All prices, trades, portfolios, and account balances are completely virtual and simulated. No real money is deposited, risked, or earned. InvestIQ does not provide personalized investment advice or execute trades on real financial exchanges.
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-10 px-6 lg:px-12 bg-[#080C14] text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-emerald-600 to-cyan-500 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white">InvestIQ</span>
            <span className="text-slate-500">· Learn. Invest. Grow.</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="hover:text-slate-300 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentTab('market')}
              className="hover:text-slate-300 transition-colors"
            >
              Markets
            </button>
            <button
              onClick={() => setCurrentTab('learn')}
              className="hover:text-slate-300 transition-colors"
            >
              Academy
            </button>
            <button
              onClick={() => setCurrentTab('settings')}
              className="hover:text-slate-300 transition-colors"
            >
              Preferences
            </button>
          </div>

          <div>
            © {new Date().getFullYear()} InvestIQ Simulator · Dedicated to Indian student financial literacy.
          </div>
        </div>
      </footer>
    </div>
  );
};
