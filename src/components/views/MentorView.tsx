import React, { useState, useEffect, useRef } from 'react';
import { useInvest } from '../../context/InvestContext';
import { MentorMessage, PortfolioAnalysisResult } from '../../types';
import { askMentorAssistant, analyzePortfolio } from '../../services/mentorService';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  Sparkles,
  Send,
  RotateCcw,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Info,
  TrendingUp,
  PieChart,
  ArrowRight,
  Trash2,
  Copy,
  Check,
  Compass,
  Briefcase,
  GraduationCap,
  Bot,
  Lightbulb,
  ExternalLink,
  HelpCircle,
  BarChart3,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'Analyze my virtual portfolio.',
  'Explain my biggest investment risk.',
  'Am I diversified?',
  'Teach me the difference between stocks and index funds.',
  "What does today's financial news mean?",
  'How can I reduce concentration risk in my simulated portfolio?',
];

export const MentorView: React.FC = () => {
  const {
    virtualCash,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    holdings,
    stocks,
    setCurrentTab,
    savedInsights,
    saveInsight,
    deleteSavedInsight,
    pendingMentorQuestion,
    clearPendingMentorQuestion,
  } = useInvest();

  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MentorMessage[]>(() => {
    // Initial welcome message
    const initialAnalysis = analyzePortfolio({
      virtualCash,
      totalPortfolioValue,
      totalInvestedAmount,
      totalUnrealizedPL,
      totalUnrealizedPLPercent,
      totalRealizedPL,
      totalProfitLoss,
      totalProfitLossPercent,
      holdings,
      stocks,
    });

    return [
      {
        id: 'msg-welcome',
        sender: 'mentor',
        text: `### Namaste! I am your InvestIQ Mentor 📈

I am your personal AI investment companion, designed specifically for Indian university students and beginner investors. 

I can analyze your **₹${formatINR(totalPortfolioValue)}** simulated paper portfolio, diagnose your diversification risks, decode Indian stock market news, and teach you how to think like a disciplined long-term investor.

*How can I assist your financial journey today?*`,
        timestamp: Date.now() - 60000,
        source: 'mentor-engine',
        cards: initialAnalysis,
        suggestedFollowUps: [
          'Analyze my virtual portfolio.',
          'Explain my biggest investment risk.',
          'Am I diversified?',
        ],
      },
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external question dispatch (e.g. from Dashboard or Live News "Explain in Mentor")
  useEffect(() => {
    if (pendingMentorQuestion) {
      handleSendQuestion(pendingMentorQuestion);
      clearPendingMentorQuestion();
    }
  }, [pendingMentorQuestion]);

  const handleSendQuestion = async (questionText: string) => {
    if (!questionText.trim() || isLoading) return;

    const userMsg: MentorMessage = {
      id: `msg-${Date.now()}-u`,
      sender: 'user',
      text: questionText.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setLastFailedQuestion(null);

    const portfolioData = {
      virtualCash,
      totalPortfolioValue,
      totalInvestedAmount,
      totalUnrealizedPL,
      totalUnrealizedPLPercent,
      totalRealizedPL,
      totalProfitLoss,
      totalProfitLossPercent,
      holdings,
      stocks,
    };

    try {
      const history = messages.slice(-6).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const result = await askMentorAssistant({
        question: questionText.trim(),
        portfolioData,
        conversationHistory: history,
      });

      const mentorMsg: MentorMessage = {
        id: `msg-${Date.now()}-m`,
        sender: 'mentor',
        text: result.text,
        timestamp: Date.now(),
        source: result.source,
        cards: result.cards,
        suggestedFollowUps: result.suggestedFollowUps,
      };

      setMessages((prev) => [...prev, mentorMsg]);
    } catch (err: any) {
      setLastFailedQuestion(questionText.trim());
      const errorMsg: MentorMessage = {
        id: `msg-${Date.now()}-err`,
        sender: 'mentor',
        text: 'I ran into a temporary hiccup processing your request. Please click **Retry** below to regenerate the mentor analysis.',
        timestamp: Date.now(),
        isError: true,
        source: 'mentor-engine',
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveInsight = (msg: MentorMessage) => {
    saveInsight({
      title: msg.cards?.diversification.status || 'Portfolio Mentor Insight',
      content: msg.text.substring(0, 400) + (msg.text.length > 400 ? '...' : ''),
      category: 'Portfolio Risk',
      source: msg.source || 'mentor-engine',
    });
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'mentor',
        text: '### Conversation Reset 🔄\n\nYour chat session has been cleared. How can I help you analyze your simulated investments or learn financial concepts?',
        timestamp: Date.now(),
        source: 'mentor-engine',
        suggestedFollowUps: SUGGESTED_QUESTIONS.slice(0, 3),
      },
    ]);
    setShowClearConfirm(false);
  };

  // Render markdown-like sections cleanly
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('### ')) {
        return (
          <h3 key={idx} className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-2">
            {line.replace('### ', '')}
          </h3>
        );
      }
      if (line.startsWith('#### ')) {
        return (
          <h4 key={idx} className="text-sm font-semibold text-emerald-400 mt-2.5 mb-1">
            {line.replace('#### ', '')}
          </h4>
        );
      }
      if (line.startsWith('- **') || line.startsWith('* **')) {
        const parts = line.replace(/^[-*] /, '').split('**');
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
            <div>
              <strong className="text-white">{parts[1]}</strong>
              <span>{parts.slice(2).join('**')}</span>
            </div>
          </div>
        );
      }
      if (line.startsWith('- ') || line.startsWith('* ')) {
        return (
          <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 my-1 pl-1">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" />
            <span>{line.replace(/^[-*] /, '')}</span>
          </div>
        );
      }
      if (line.startsWith('---')) {
        return <hr key={idx} className="border-slate-800 my-3" />;
      }
      if (line.startsWith('*') && line.endsWith('*')) {
        return (
          <p key={idx} className="text-[11px] text-slate-400 italic my-1.5">
            {line.replace(/^\*|\*$/g, '')}
          </p>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-xs text-slate-200 leading-relaxed my-1">
          {line}
        </p>
      );
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0A0E17] max-w-7xl mx-auto w-full p-4 lg:p-6 space-y-4">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                Your Personal Investment Mentor
              </h1>
              <p className="text-xs text-slate-400">
                Understand your portfolio. Learn the market. Make informed decisions.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Saved Insights Button */}
          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-850 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>Saved Insights</span>
            {savedInsights.length > 0 && (
              <span className="font-mono text-[10px] bg-slate-800 px-1.5 py-0.2 rounded-full text-amber-300">
                {savedInsights.length}
              </span>
            )}
          </button>

          {/* Clear Session */}
          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-850 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Reset Mentor Conversation?</h3>
            <p className="text-xs text-slate-400">
              This will clear the current chat messages. Your saved insights and portfolio positions will not be affected.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearHistory}
                className="px-3 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
              >
                Clear History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container Split: Chat Area + Portfolio Insights Summary */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 overflow-hidden">
        {/* Chat Thread (8 cols on lg) */}
        <div className="lg:col-span-8 flex flex-col bg-[#0F172A]/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg h-[640px] lg:h-auto">
          {/* Chat Messages Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isMentor = msg.sender === 'mentor';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMentor ? 'items-start' : 'items-end'} space-y-1.5`}
                >
                  <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                    {isMentor ? (
                      <>
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                          <Bot className="w-2.5 h-2.5" />
                        </div>
                        <span className="font-semibold text-slate-300">InvestIQ Mentor</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded-md font-mono bg-slate-800/80 border border-slate-700/60 text-slate-400">
                          {msg.source === 'gemini' ? 'Gemini 3.8-Flash' : 'InvestIQ Intelligence'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-400">You (Paper Trader)</span>
                      </>
                    )}
                    <span>• {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div
                    className={`max-w-[92%] sm:max-w-[85%] rounded-2xl p-4 text-xs ${
                      isMentor
                        ? 'bg-slate-900 border border-slate-800 text-slate-200'
                        : 'bg-emerald-600 text-white font-medium shadow-md self-end'
                    }`}
                  >
                    {isMentor ? (
                      <div>{renderFormattedText(msg.text)}</div>
                    ) : (
                      <div className="whitespace-pre-wrap">{msg.text}</div>
                    )}

                    {/* Interactive Portfolio Analysis Cards if present in message */}
                    {isMentor && msg.cards && (
                      <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-3">
                        {/* 1. Overview KPIs */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Total Value</span>
                            <span className="font-mono text-xs font-bold text-white">
                              {formatINR(msg.cards.overview.totalValue)}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Virtual Cash</span>
                            <span className="font-mono text-xs font-bold text-emerald-400">
                              {formatINR(msg.cards.overview.cash)}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Invested Basis</span>
                            <span className="font-mono text-xs font-bold text-cyan-400">
                              {formatINR(msg.cards.overview.invested)}
                            </span>
                          </div>
                          <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-xl">
                            <span className="text-[10px] text-slate-400 block">Unrealized P&L</span>
                            <span
                              className={`font-mono text-xs font-bold ${
                                msg.cards.overview.unrealizedPL >= 0 ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {msg.cards.overview.unrealizedPL >= 0 ? '+' : ''}
                              {formatINR(msg.cards.overview.unrealizedPL)}
                            </span>
                          </div>
                        </div>

                        {/* 2. Diversification Meter */}
                        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                              <PieChart className="w-3.5 h-3.5 text-cyan-400" />
                              Diversification Health
                            </span>
                            <span className="font-mono text-[11px] font-bold text-emerald-400">
                              {msg.cards.diversification.score} / 100
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                              style={{ width: `${msg.cards.diversification.score}%` }}
                            />
                          </div>
                          <span className="text-[11px] text-slate-400 block">
                            Status: <strong className="text-white">{msg.cards.diversification.status}</strong>
                          </span>
                        </div>

                        {/* 3. Actionable Next Steps */}
                        {msg.cards.nextSteps && msg.cards.nextSteps.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                              Recommended Practice Steps:
                            </span>
                            <div className="space-y-1.5">
                              {msg.cards.nextSteps.map((step, idx) => (
                                <div
                                  key={idx}
                                  className="p-2 bg-slate-950/50 border border-slate-800/80 rounded-lg flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
                                >
                                  <div>
                                    <span className="font-semibold text-white block">{step.action}</span>
                                    <span className="text-[11px] text-slate-400">{step.rationale}</span>
                                  </div>
                                  {step.targetTab && (
                                    <button
                                      type="button"
                                      onClick={() => setCurrentTab(step.targetTab!)}
                                      className="px-2 py-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-md hover:bg-emerald-900 transition-colors shrink-0 flex items-center gap-1"
                                    >
                                      <span>Go to {step.targetTab}</span>
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Mentor message footer actions */}
                    {isMentor && (
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/60 text-[11px] text-slate-400">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleCopy(msg.text, msg.id)}
                            className="flex items-center gap-1 hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span className="text-emerald-400">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleSaveInsight(msg)}
                            className="flex items-center gap-1 hover:text-amber-300 transition-colors"
                          >
                            <Bookmark className="w-3 h-3 text-amber-400" />
                            <span>Save Insight</span>
                          </button>
                        </div>

                        {msg.isError && lastFailedQuestion && (
                          <button
                            type="button"
                            onClick={() => handleSendQuestion(lastFailedQuestion)}
                            className="px-2 py-0.5 rounded bg-rose-950 border border-rose-800 text-rose-300 hover:bg-rose-900 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Suggested follow-up prompt chips */}
                  {isMentor && msg.suggestedFollowUps && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-2 max-w-[90%]">
                      {msg.suggestedFollowUps.map((chip, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSendQuestion(chip)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-left"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing / Loading state */}
            {isLoading && (
              <div className="flex flex-col items-start space-y-1.5">
                <div className="flex items-center gap-2 px-1 text-[11px] text-slate-500">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">
                    <Bot className="w-2.5 h-2.5" />
                  </div>
                  <span className="font-semibold text-slate-300">InvestIQ Mentor</span>
                  <span className="text-[10px] text-slate-500">Analyzing portfolio metrics...</span>
                </div>
                <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2 text-xs text-slate-400">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-300" />
                  </div>
                  <span className="ml-1 text-[11px]">Evaluating diversification, risk factors, and market data...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Question Chips Bar */}
          <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/60 overflow-x-auto">
            <div className="flex items-center gap-2 text-[11px] whitespace-nowrap">
              <span className="text-slate-500 flex items-center gap-1 shrink-0 font-medium">
                <Lightbulb className="w-3 h-3 text-amber-400" />
                Quick Prompts:
              </span>
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendQuestion(q)}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Area */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuestion(inputMessage);
            }}
            className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about your portfolio, risk, diversification, or Indian market concepts..."
              disabled={isLoading}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Right Sidebar: Real-time Portfolio Health Diagnostic (4 cols on lg) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Snapshot Card */}
          <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Portfolio Health
                </h3>
              </div>
              <button
                type="button"
                onClick={() => handleSendQuestion('Analyze my virtual portfolio.')}
                className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Full Diagnostic →
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Portfolio:</span>
                <span className="font-mono font-bold text-white">{formatINR(totalPortfolioValue)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Available Cash:</span>
                <span className="font-mono font-semibold text-emerald-400">{formatINR(virtualCash)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Positions:</span>
                <span className="font-mono text-slate-300">{Object.keys(holdings).length} stocks</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Net Overall Return:</span>
                <span
                  className={`font-mono font-bold ${
                    totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {totalProfitLoss >= 0 ? '+' : ''}
                  {formatINR(totalProfitLoss)} ({totalProfitLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleSendQuestion('Explain my biggest investment risk.')}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-xs font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>Check Biggest Risk</span>
              </button>
            </div>
          </div>

          {/* Quick Learning Links Card */}
          <div className="p-4 bg-[#0F172A] border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Recommended Academy Topics
              </h3>
            </div>

            <div className="space-y-2">
              <div
                onClick={() => setCurrentTab('learn')}
                className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors"
              >
                <span className="text-xs font-bold text-white block">Asset Allocation 101</span>
                <span className="text-[11px] text-slate-400">
                  How spreading bets across equities, cash, and gold protects your portfolio.
                </span>
              </div>

              <div
                onClick={() => setCurrentTab('learn')}
                className="p-2.5 bg-slate-900/60 border border-slate-800 rounded-xl hover:border-slate-700 cursor-pointer transition-colors"
              >
                <span className="text-xs font-bold text-white block">Rupee-Cost Averaging</span>
                <span className="text-[11px] text-slate-400">
                  Why monthly SIPs beat trying to time market tops and bottoms.
                </span>
              </div>
            </div>
          </div>

          {/* Regulatory & Safety Notice */}
          <div className="p-3.5 bg-slate-950 border border-slate-850 rounded-xl space-y-1.5 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Educational Safety Boundary</span>
            </div>
            <p>
              InvestIQ Mentor operates strictly as an educational financial tutor for paper trading. It does not execute automatic trades or provide SEBI-registered personalized investment advice.
            </p>
          </div>
        </div>
      </div>

      {/* Saved Insights Modal / Drawer */}
      {isSavedDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-lg w-full max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Your Saved Mentor Insights</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSavedDrawerOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {savedInsights.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 space-y-2">
                  <Bookmark className="w-8 h-8 text-slate-700 mx-auto" />
                  <p>No saved insights yet.</p>
                  <p className="text-[11px] text-slate-600">
                    Click "Save Insight" below any mentor response to bookmark it for later reference.
                  </p>
                </div>
              ) : (
                savedInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{insight.title}</span>
                      <button
                        type="button"
                        onClick={() => deleteSavedInsight(insight.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{insight.content}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">
                        {insight.category}
                      </span>
                      <span>{new Date(insight.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
