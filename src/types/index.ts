export interface StockHistoricalPoint {
  date: string;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Stock {
  symbol: string;
  name: string;
  sector: 'Information Technology' | 'Banking & Finance' | 'Energy & Conglomerate' | 'Automobile' | 'Consumer Goods & FMCG' | 'Infrastructure' | 'Healthcare & Pharma' | 'Fintech & Tech';
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  peRatio: number;
  marketCap: string;
  week52High: number;
  week52Low: number;
  volume: string;
  about: string;
  exchange?: 'NSE' | 'BSE';
  isin?: string;
  series?: string;
  dataProvider?: string;
  priceLabel?: 'End-of-day' | 'Delayed' | 'Live';
  dataTimestamp?: string;
  tradingDate?: string;
  isStale?: boolean;
  isAvailable?: boolean;
  turnover?: number;
  trades?: number;
  history: {
    '1D': StockHistoricalPoint[];
    '1W': StockHistoricalPoint[];
    '1M': StockHistoricalPoint[];
    '1Y': StockHistoricalPoint[];
    'ALL': StockHistoricalPoint[];
  };
}

export interface Holding {
  symbol: string;
  companyName?: string;
  exchange?: 'NSE' | 'BSE';
  quantity: number;
  avgPrice: number;
  totalInvested: number;
  updatedAt?: string;
}

export interface Transaction {
  id: string;
  symbol: string;
  stockName: string;
  exchange?: 'NSE' | 'BSE';
  type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  totalAmount: number;
  cashAfterTrade?: number;
  realizedPL?: number;
  timestamp: number;
  dateFormatted: string;
  simulated?: boolean;
}

export interface PortfolioSnapshot {
  id?: string;
  timestamp: number;
  dateFormatted: string;
  cash: number;
  holdingsMarketValue: number;
  totalPortfolioValue: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  totalUnrealizedPL: number;
  totalRealizedPL: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  readTime: string;
  category: 'Fundamentals' | 'Market Basics' | 'Vehicles & Instruments' | 'Risk & Strategy' | 'Mindset';
  summary: string;
  keyTakeaways: string[];
  sections: Array<{
    title: string;
    content: string;
    tip?: string;
  }>;
  quiz: QuizQuestion[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'trading' | 'learning' | 'portfolio';
  icon: string;
  requirement: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email?: string;
  photoURL?: string;
  avatarId: string;
  experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  joinedDate: string;
  currency?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MarketSessionInfo {
  isOpen: boolean;
  statusLabel: 'Market Open' | 'Market Closed' | 'Pre-Open' | 'Post-Closing';
  sessionName: string;
  tradingDate: string;
  timezone: string;
  kolkataTime: string;
  lastUpdatedText: string;
  provider: string;
}

export interface CorporateAction {
  exchange: 'NSE' | 'BSE';
  symbol: string;
  isin: string;
  company: string;
  exDate: string;
  recordDate?: string;
  type: string;
  cashAmount?: number;
  rawSubject: string;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  stockName: string;
  targetPrice: number;
  condition: 'ABOVE' | 'BELOW';
  intent: 'BUY' | 'SELL' | 'ALERT';
  createdAt: number;
  status: 'ACTIVE' | 'TRIGGERED' | 'DISMISSED';
  triggeredAt?: number;
  triggeredPrice?: number;
  note?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'Markets' | 'Economy' | 'Earnings' | 'Corporate' | 'Policy' | 'Explainer';
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impactLevel: 'High' | 'Medium' | 'Low';
  publishedAt: string;
  timestamp: number;
  readTime: string;
  source: string;
  relatedSymbols: string[];
  keyTerms?: Array<{
    term: string;
    explanation: string;
  }>;
  aiTakeaway?: string;
}

export interface PortfolioAnalysisResult {
  overview: {
    totalValue: number;
    cash: number;
    invested: number;
    unrealizedPL: number;
    unrealizedPLPercent: number;
    realizedPL: number;
    netPL: number;
    netPLPercent: number;
    holdingsCount: number;
  };
  diversification: {
    score: number; // 0 to 100
    status: 'Excellent Diversification' | 'Moderately Diversified' | 'High Concentration Risk' | 'No Holdings (Cash Only)';
    topHoldingSymbol?: string;
    topHoldingPercent?: number;
    topHoldingName?: string;
    sectorAllocation: Array<{
      sector: string;
      value: number;
      percentage: number;
    }>;
  };
  risks: Array<{
    severity: 'High' | 'Medium' | 'Low' | 'Info';
    title: string;
    description: string;
    dataPoint?: string;
  }>;
  learningOpportunities: Array<{
    topic: string;
    reason: string;
    suggestedAction: string;
    lessonCategory?: string;
  }>;
  nextSteps: Array<{
    action: string;
    rationale: string;
    targetTab?: string;
  }>;
}

export interface MentorMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: number;
  source?: 'gemini' | 'mentor-engine';
  isError?: boolean;
  cards?: PortfolioAnalysisResult;
  suggestedFollowUps?: string[];
}

export interface SavedInsight {
  id: string;
  title: string;
  content: string;
  category: 'Portfolio Risk' | 'Diversification' | 'Concept' | 'Market Strategy';
  timestamp: number;
  source: 'gemini' | 'mentor-engine';
}

