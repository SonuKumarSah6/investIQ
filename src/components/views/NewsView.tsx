import React, { useState, useMemo } from 'react';
import { useInvest } from '../../context/InvestContext';
import { Stock, NewsArticle } from '../../types';
import { formatINR } from '../../utils/formatters';
import {
  Newspaper,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  BookOpen,
  ArrowRight,
  Clock,
  HelpCircle,
  X,
  Radio,
  Tag,
  Building2,
} from 'lucide-react';

interface NewsViewProps {
  onOpenTrade: (stock: Stock, action?: 'BUY' | 'SELL') => void;
  onOpenStockDetail: (stock: Stock) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ onOpenTrade, onOpenStockDetail }) => {
  const {
    newsArticles,
    savedNewsIds,
    toggleSaveNews,
    isNewsSaved,
    refreshNewsFeed,
    askMentor,
    stocks,
  } = useInvest();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [activeArticleModal, setActiveArticleModal] = useState<NewsArticle | null>(null);

  const categories = ['All', 'Markets', 'Economy', 'Earnings', 'Corporate', 'Policy', 'Explainer'];
  const sentiments = ['All', 'Bullish', 'Bearish', 'Neutral'];

  const filteredArticles = useMemo(() => {
    return newsArticles.filter((article) => {
      // Category filter
      if (selectedCategory !== 'All' && article.category !== selectedCategory) {
        return false;
      }
      // Sentiment filter
      if (selectedSentiment !== 'All' && article.sentiment !== selectedSentiment) {
        return false;
      }
      // Saved filter
      if (showSavedOnly && !savedNewsIds.includes(article.id)) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = article.title.toLowerCase().includes(q);
        const matchesSummary = article.summary.toLowerCase().includes(q);
        const matchesSymbols = article.relatedSymbols.some((s) => s.toLowerCase().includes(q));
        const matchesTerms = article.keyTerms?.some((t) => t.term.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSummary && !matchesSymbols && !matchesTerms) {
          return false;
        }
      }
      return true;
    });
  }, [newsArticles, selectedCategory, selectedSentiment, showSavedOnly, searchQuery, savedNewsIds]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshNewsFeed();
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleExplainInMentor = (article: NewsArticle) => {
    const question = `Explain this financial news to a beginner investor: "${article.title}". Summary: "${article.summary}". What does it mean for the Indian economy and related stocks (${article.relatedSymbols.join(', ')})?`;
    askMentor(question);
  };

  const getSentimentBadge = (sentiment: NewsArticle['sentiment']) => {
    switch (sentiment) {
      case 'Bullish':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            <span>Bullish Impact</span>
          </span>
        );
      case 'Bearish':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-950/70 border border-rose-800/70 text-rose-400">
            <TrendingDown className="w-3 h-3" />
            <span>Bearish Impact</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300">
            <Minus className="w-3 h-3" />
            <span>Neutral / Watch</span>
          </span>
        );
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
      {/* Top Banner & Simulated Live Ticker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Newspaper className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                InvestIQ Live Financial Wire
              </h1>
              <p className="text-xs text-slate-400">
                Indian markets, RBI monetary announcements, corporate earnings, and beginner explainers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="text-slate-300 font-medium">Simulated Live Feed</span>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Breaking News Marquee / Ticker */}
      <div className="p-3 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-slate-800 rounded-2xl flex items-center gap-3 overflow-hidden">
        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-black shrink-0">
          BREAKING
        </span>
        <div className="text-xs text-slate-200 truncate flex-1 font-medium">
          {newsArticles[0]?.title} • {newsArticles[0]?.publishedAt}
        </div>
        <button
          type="button"
          onClick={() => setActiveArticleModal(newsArticles[0])}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 shrink-0"
        >
          Read Story →
        </button>
      </div>

      {/* Controls Bar: Search + Category Filters + Sentiment + Saved Toggle */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search news, topics, or symbols (e.g. RELIANCE, Repo, EV)..."
              className="w-full bg-[#0F172A] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Sentiment dropdown */}
            <select
              value={selectedSentiment}
              onChange={(e) => setSelectedSentiment(e.target.value)}
              className="bg-[#0F172A] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="All">All Sentiments</option>
              <option value="Bullish">Bullish Only</option>
              <option value="Neutral">Neutral Only</option>
              <option value="Bearish">Bearish Only</option>
            </select>

            {/* Saved Toggle */}
            <button
              type="button"
              onClick={() => setShowSavedOnly((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors border ${
                showSavedOnly
                  ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                  : 'bg-[#0F172A] border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved ({savedNewsIds.length})</span>
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-2xl space-y-3">
          <Newspaper className="w-10 h-10 text-slate-700 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Matching Financial News</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing your filters, or toggling off the saved filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSelectedSentiment('All');
              setSearchQuery('');
              setShowSavedOnly(false);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 rounded-xl hover:bg-emerald-900 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredArticles.map((article) => {
            const isSaved = isNewsSaved(article.id);

            return (
              <div
                key={article.id}
                className="bg-[#0F172A] border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 group shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  {/* Card Header: Category & Sentiment & Bookmark */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
                        {article.category}
                      </span>
                      {getSentimentBadge(article.sentiment)}
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSaveNews(article.id)}
                      className={`p-1.5 rounded-lg transition-colors ${
                        isSaved
                          ? 'text-amber-400 hover:text-amber-300 bg-amber-950/40'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                      }`}
                      title={isSaved ? 'Remove bookmark' : 'Bookmark article'}
                    >
                      <Bookmark className="w-4 h-4 fill-current" />
                    </button>
                  </div>

                  {/* Title */}
                  <h3
                    onClick={() => setActiveArticleModal(article)}
                    className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors cursor-pointer leading-snug line-clamp-2"
                  >
                    {article.title}
                  </h3>

                  {/* Summary */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Related Stocks Interactive Chips */}
                  {article.relatedSymbols.length > 0 && (
                    <div className="pt-1">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-cyan-400" />
                        <span>Tagged Stocks:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {article.relatedSymbols.map((sym) => {
                          const stock = stocks.find((s) => s.symbol === sym);
                          return (
                            <button
                              key={sym}
                              type="button"
                              onClick={() => {
                                if (stock) onOpenStockDetail(stock);
                              }}
                              className="px-2 py-0.8 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1 transition-colors"
                            >
                              <span className="font-bold">{sym}</span>
                              {stock && (
                                <span
                                  className={stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}
                                >
                                  {formatINR(stock.price)}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Key Financial Terms Preview */}
                  {article.keyTerms && article.keyTerms.length > 0 && (
                    <div className="p-2.5 bg-slate-950/60 border border-slate-850 rounded-xl text-[11px] space-y-1">
                      <div className="text-slate-400 font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-400" />
                        <span>Key Term: {article.keyTerms[0].term}</span>
                      </div>
                      <p className="text-slate-500 line-clamp-2 leading-relaxed">
                        {article.keyTerms[0].explanation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    <span>{article.publishedAt}</span>
                    <span>• {article.readTime}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Explain in Mentor Button */}
                    <button
                      type="button"
                      onClick={() => handleExplainInMentor(article)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-800/70 rounded-lg transition-colors flex items-center gap-1"
                      title="Ask InvestIQ Mentor to explain this news in simple terms"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Explain with AI</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveArticleModal(article)}
                      className="px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white"
                    >
                      Full Story →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Article Detail Reader Modal */}
      {activeArticleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-850 px-2 py-0.5 rounded border border-slate-750">
                  {activeArticleModal.category}
                </span>
                {getSentimentBadge(activeArticleModal.sentiment)}
                <span className="text-slate-500">• {activeArticleModal.publishedAt}</span>
              </div>
              <button
                type="button"
                onClick={() => setActiveArticleModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug">
                {activeArticleModal.title}
              </h2>

              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Source: {activeArticleModal.source}</span>
                <span>• {activeArticleModal.readTime}</span>
              </div>

              {/* AI Key Takeaway Box */}
              {activeArticleModal.aiTakeaway && (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800/60 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>InvestIQ Intelligence Takeaway for Beginner Investors:</span>
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    {activeArticleModal.aiTakeaway}
                  </p>
                </div>
              )}

              {/* Full Content */}
              <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-3">
                {activeArticleModal.content}
              </div>

              {/* Financial Terms Glossary */}
              {activeArticleModal.keyTerms && activeArticleModal.keyTerms.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>Beginner Term Explainer Glossary:</span>
                  </h4>
                  <div className="space-y-2">
                    {activeArticleModal.keyTerms.map((term, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-xs space-y-1"
                      >
                        <span className="font-bold text-amber-300 block">{term.term}</span>
                        <p className="text-slate-400 leading-relaxed">{term.explanation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tagged Stocks Actions */}
              {activeArticleModal.relatedSymbols.length > 0 && (
                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white block">
                    Trade or Inspect Mentioned Companies:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeArticleModal.relatedSymbols.map((sym) => {
                      const stock = stocks.find((s) => s.symbol === sym);
                      if (!stock) return null;
                      return (
                        <div
                          key={sym}
                          className="p-2 bg-slate-900 border border-slate-800 rounded-xl flex items-center gap-3 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white">{stock.symbol}</span>
                            <span className="text-slate-400 font-mono ml-2">
                              {formatINR(stock.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setActiveArticleModal(null);
                                onOpenStockDetail(stock);
                              }}
                              className="px-2 py-1 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 rounded-md"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveArticleModal(null);
                                onOpenTrade(stock, 'BUY');
                              }}
                              className="px-2 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-md"
                            >
                              Buy
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => toggleSaveNews(activeArticleModal.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors border ${
                  isNewsSaved(activeArticleModal.id)
                    ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {isNewsSaved(activeArticleModal.id) ? 'Bookmarked' : 'Bookmark Article'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const art = activeArticleModal;
                  setActiveArticleModal(null);
                  handleExplainInMentor(art);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Mentor to Explain This</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
