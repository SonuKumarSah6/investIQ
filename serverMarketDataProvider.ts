import type { Stock, StockHistoricalPoint, MarketSessionInfo, CorporateAction } from './src/types/index.ts';

interface TejSnapshotRow {
  symbol: string;
  series: string;
  isin: string;
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  last: number;
  prev_close: number;
  volume: number;
  turnover: number;
  trades: number;
}

interface TejOhlcvRow {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  last: number;
  prev_close: number;
  volume: number;
  turnover?: number;
  trades?: number;
}

interface TejStatus {
  trading_date: string;
  stage?: string;
  prices_published_at?: string;
  derived_published_at?: string;
  generated_at?: string;
}

// Curated list of verified NSE Indian stocks with sectors & company descriptions
const MONITORED_NSE_STOCKS: Array<{
  symbol: string;
  name: string;
  sector: Stock['sector'];
  peRatio: number;
  marketCap: string;
  about: string;
}> = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy & Conglomerate',
    peRatio: 28.4,
    marketCap: '₹19.92 Lakh Cr',
    about: 'Reliance Industries is India\'s largest private sector conglomerate with leading market presence across petrochemicals, refining, oil & gas exploration, telecom (Jio), and organized retail (Reliance Retail).',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    sector: 'Information Technology',
    peRatio: 30.2,
    marketCap: '₹14.91 Lakh Cr',
    about: 'Tata Consultancy Services is a global leader in IT services, digital transformation, consulting, and business solutions, operating across 50+ countries with world-class operational margins.',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    sector: 'Banking & Finance',
    peRatio: 19.5,
    marketCap: '₹12.78 Lakh Cr',
    about: 'HDFC Bank is India\'s largest private sector bank following its historic merger with parent HDFC Ltd, offering nationwide retail and corporate banking with industry-leading asset quality.',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    sector: 'Information Technology',
    peRatio: 26.8,
    marketCap: '₹7.87 Lakh Cr',
    about: 'Infosys is an iconic Indian multinational information technology pioneer providing next-generation digital services, enterprise cloud transformations, and AI applications.',
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    sector: 'Banking & Finance',
    peRatio: 17.8,
    marketCap: '₹8.65 Lakh Cr',
    about: 'ICICI Bank is one of India\'s premier private sector financial institutions, renowned for its strong digital banking franchises (iMobile Pay), retail loan growth, and expanding NIMs.',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    sector: 'Banking & Finance',
    peRatio: 10.4,
    marketCap: '₹7.45 Lakh Cr',
    about: 'State Bank of India is a Fortune 500 public sector banking and financial services statutory body holding a dominant one-fourth market share in Indian loans and deposits.',
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    sector: 'Infrastructure',
    peRatio: 52.3,
    marketCap: '₹9.40 Lakh Cr',
    about: 'Bharti Airtel is a leading global telecommunications giant serving over 500 million subscribers across India and 14 African nations, boasting industry-highest ARPU in domestic 5G.',
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 27.1,
    marketCap: '₹6.10 Lakh Cr',
    about: 'ITC is a diversified multi-business conglomerate spanning branded FMCG foods, personal care, paperboards, packaging, agri-business, and luxury hotels.',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    sector: 'Infrastructure',
    peRatio: 33.6,
    marketCap: '₹5.15 Lakh Cr',
    about: 'Larsen & Toubro is an Indian multinational conglomerate executing high-impact engineering, procurement, construction (EPC), heavy manufacturing, and hi-tech defense projects.',
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 54.2,
    marketCap: '₹5.85 Lakh Cr',
    about: 'Hindustan Unilever is India\'s largest fast-moving consumer goods company with household brands reaching 9 out of 10 Indian households every single day.',
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    sector: 'Banking & Finance',
    peRatio: 29.5,
    marketCap: '₹4.35 Lakh Cr',
    about: 'Bajaj Finance is a premier Indian non-banking financial company (NBFC) dominating consumer durables financing, omnichannel retail credit, and MSME lending.',
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    sector: 'Healthcare & Pharma',
    peRatio: 36.4,
    marketCap: '₹4.10 Lakh Cr',
    about: 'Sun Pharma is the world\'s 4th largest specialty generic pharmaceutical powerhouse and India\'s top pharma company by domestic market share.',
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    sector: 'Automobile',
    peRatio: 28.1,
    marketCap: '₹3.92 Lakh Cr',
    about: 'Maruti Suzuki is India\'s passenger vehicle market leader, pioneering fuel-efficient hybrid vehicles, SUVs, and an unparalleled nationwide service network.',
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    sector: 'Information Technology',
    peRatio: 21.4,
    marketCap: '₹2.88 Lakh Cr',
    about: 'Wipro is a prominent tech innovator specializing in cloud architecture, cognitive computing, robotics, cybersecurity, and digital consulting.',
  },
  {
    symbol: 'HCLTECH',
    name: 'HCL Technologies Ltd.',
    sector: 'Information Technology',
    peRatio: 25.1,
    marketCap: '₹4.20 Lakh Cr',
    about: 'HCLTech is a next-generation global technology company helping enterprises reimagine businesses for the digital age through its supercharged digital and engineering services.',
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank Ltd.',
    sector: 'Banking & Finance',
    peRatio: 21.2,
    marketCap: '₹3.80 Lakh Cr',
    about: 'Kotak Mahindra Bank is a tier-one Indian banking conglomerate offering bespoke wealth management, commercial banking, mutual funds, and retail financial services.',
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    sector: 'Banking & Finance',
    peRatio: 14.6,
    marketCap: '₹3.75 Lakh Cr',
    about: 'Axis Bank is one of India\'s largest private sector banks offering a comprehensive suite of financial services across large and mid-corporates, MSME, and retail businesses.',
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 48.7,
    marketCap: '₹2.65 Lakh Cr',
    about: 'Asian Paints is India\'s largest and Asia\'s third largest paints corporation, known for decorative coatings and integrated home decor solutions.',
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 82.5,
    marketCap: '₹3.68 Lakh Cr',
    about: 'Titan Company, a Tata enterprise, leads India\'s organized lifestyle retail market through flagship brands Tanishq, Titan watches, Fastrack, and Mia.',
  },
  {
    symbol: 'NTPC',
    name: 'NTPC Ltd.',
    sector: 'Infrastructure',
    peRatio: 16.2,
    marketCap: '₹3.45 Lakh Cr',
    about: 'NTPC is India\'s largest energy conglomerate with installed capacity exceeding 73 GW, accelerating rapid transition toward renewable green hydrogen and solar energy.',
  },
  {
    symbol: 'ONGC',
    name: 'Oil & Natural Gas Corporation',
    sector: 'Energy & Conglomerate',
    peRatio: 7.8,
    marketCap: '₹3.10 Lakh Cr',
    about: 'ONGC is the largest government-owned oil and gas exploration and production corporation in India, producing around 70% of India\'s domestic crude oil.',
  },
  {
    symbol: 'POWERGRID',
    name: 'Power Grid Corp. of India',
    sector: 'Infrastructure',
    peRatio: 18.5,
    marketCap: '₹2.85 Lakh Cr',
    about: 'Power Grid Corporation of India is a Maharatna central public sector enterprise operating roughly 85% of India\'s interstate electricity transmission network.',
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Ltd.',
    sector: 'Energy & Conglomerate',
    peRatio: 8.2,
    marketCap: '₹2.70 Lakh Cr',
    about: 'Coal India is the world\'s largest coal producer, operating over 300 mines across eight Indian states and ensuring energy security for the subcontinent.',
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    sector: 'Infrastructure',
    peRatio: 41.2,
    marketCap: '₹2.15 Lakh Cr',
    about: 'Tata Steel is among the top global steel companies with an annual crude steel capacity of 35 million tonnes, operating state-of-the-art facilities in India and Europe.',
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Ltd.',
    sector: 'Infrastructure',
    peRatio: 88.0,
    marketCap: '₹3.15 Lakh Cr',
    about: 'Adani Enterprises is the flagship incubator of the Adani Group, pioneering infrastructure investments in airports, roads, data centers, green hydrogen, and defense.',
  },
  {
    symbol: 'ADANIPORTS',
    name: 'Adani Ports & SEZ Ltd.',
    sector: 'Infrastructure',
    peRatio: 33.4,
    marketCap: '₹3.40 Lakh Cr',
    about: 'Adani Ports & Special Economic Zone is India\'s largest private port operator and integrated logistics provider, handling over 25% of the nation\'s maritime trade.',
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Ltd.',
    sector: 'Infrastructure',
    peRatio: 42.1,
    marketCap: '₹3.20 Lakh Cr',
    about: 'UltraTech Cement is the largest manufacturer of grey cement, ready mix concrete, and white cement in India with a consolidated capacity exceeding 150 MTPA.',
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 65.4,
    marketCap: '₹2.40 Lakh Cr',
    about: 'Nestle India is a premier food company with iconic brands such as Maggi noodles, Nescafe, KitKat, and Cerelac, deeply trusted by Indian consumers for over a century.',
  },
  {
    symbol: 'GRASIM',
    name: 'Grasim Industries Ltd.',
    sector: 'Infrastructure',
    peRatio: 31.8,
    marketCap: '₹1.85 Lakh Cr',
    about: 'Grasim Industries, the flagship of the Aditya Birla Group, is a global leader in viscose staple fibre and chemicals, recently launching Birla Opus decorative paints.',
  },
  {
    symbol: 'TECHM',
    name: 'Tech Mahindra Ltd.',
    sector: 'Information Technology',
    peRatio: 44.5,
    marketCap: '₹1.50 Lakh Cr',
    about: 'Tech Mahindra is a leading digital transformation specialist and IT provider with deep historical expertise in 5G telecommunications, networking, and enterprise AI.',
  },
  {
    symbol: 'JSWSTEEL',
    name: 'JSW Steel Ltd.',
    sector: 'Infrastructure',
    peRatio: 24.3,
    marketCap: '₹2.50 Lakh Cr',
    about: 'JSW Steel is the flagship business of the diversified JSW Group, recognized as one of India\'s largest private steel manufacturers with advanced eco-friendly blast furnaces.',
  },
  {
    symbol: 'CIPLA',
    name: 'Cipla Ltd.',
    sector: 'Healthcare & Pharma',
    peRatio: 26.5,
    marketCap: '₹1.25 Lakh Cr',
    about: 'Cipla is a global healthcare giant recognized for expanding access to affordable medicine, respiratory therapies, and antiretrovirals across 80+ markets.',
  },
  {
    symbol: 'DRREDDY',
    name: 'Dr. Reddy\'s Laboratories',
    sector: 'Healthcare & Pharma',
    peRatio: 18.2,
    marketCap: '₹1.15 Lakh Cr',
    about: 'Dr. Reddy\'s is an integrated global pharmaceutical company offering APIs, custom pharmaceutical services, generics, biosimilars, and differentiated formulations.',
  },
  {
    symbol: 'HEROMOTOCO',
    name: 'Hero MotoCorp Ltd.',
    sector: 'Automobile',
    peRatio: 22.8,
    marketCap: '₹1.10 Lakh Cr',
    about: 'Hero MotoCorp is the world\'s largest manufacturer of two-wheelers by volume, delivering dependable commuter motorcycles and Vida electric scooters.',
  },
  {
    symbol: 'TATAPOWER',
    name: 'Tata Power Company Ltd.',
    sector: 'Infrastructure',
    peRatio: 34.2,
    marketCap: '₹1.25 Lakh Cr',
    about: 'Tata Power is India\'s largest integrated power company, spearheading clean energy generation, rooftop solar, and the nation\'s premier EV charging network.',
  },
  {
    symbol: 'TMCV',
    name: 'Tata Motors Commercial Vehicles',
    sector: 'Automobile',
    peRatio: 15.2,
    marketCap: '₹1.65 Lakh Cr',
    about: 'Tata Motors Limited is a pioneer in Indian commercial transport, supplying light, medium, and heavy-duty trucks, buses, and defense mobility platforms.',
  },
  {
    symbol: 'TMPV',
    name: 'Tata Motors Passenger Vehicles',
    sector: 'Automobile',
    peRatio: 18.4,
    marketCap: '₹1.15 Lakh Cr',
    about: 'Tata Motors Passenger Vehicles produces popular safe SUVs including the Nexon, Harrier, and Safari, leading India\'s domestic electric vehicle adoption.',
  },
  {
    symbol: 'TATACONSUM',
    name: 'Tata Consumer Products Ltd.',
    sector: 'Consumer Goods & FMCG',
    peRatio: 72.0,
    marketCap: '₹1.05 Lakh Cr',
    about: 'Tata Consumer Products combines Tata Tea, Tata Salt, Tetley, Himalayan water, Sampann organics, and the Starbucks coffee joint venture in India.',
  },
  {
    symbol: 'ETERNAL',
    name: 'Eternal Ltd. (Zomato Group)',
    sector: 'Fintech & Tech',
    peRatio: 95.0,
    marketCap: '₹2.80 Lakh Cr',
    about: 'Eternal Limited (formerly Zomato) is India\'s preeminent consumer tech conglomerate operating Zomato food delivery, Blinkit quick commerce, and Hyperpure B2B supply.',
  },
];

// Curated list of verified BSE Indian stocks for exchange exploration
const MONITORED_BSE_STOCKS: Array<{
  symbol: string;
  name: string;
  sector: Stock['sector'];
  peRatio: number;
  marketCap: string;
  about: string;
}> = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd. (BSE: 500325)',
    sector: 'Energy & Conglomerate',
    peRatio: 28.4,
    marketCap: '₹19.92 Lakh Cr',
    about: 'Reliance Industries traded on the Bombay Stock Exchange (BSE Scrip Code: 500325). Official daily closing price from BSE Bhavcopy records.',
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd. (BSE: 532540)',
    sector: 'Information Technology',
    peRatio: 30.2,
    marketCap: '₹14.91 Lakh Cr',
    about: 'Tata Consultancy Services on BSE (Scrip Code: 532540), India\'s oldest and premier stock exchange at Dalal Street.',
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd. (BSE: 500209)',
    sector: 'Information Technology',
    peRatio: 26.8,
    marketCap: '₹7.87 Lakh Cr',
    about: 'Infosys Limited BSE listing (Scrip Code: 500209), reflecting authentic Bombay Stock Exchange trading records.',
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd. (BSE: 500180)',
    sector: 'Banking & Finance',
    peRatio: 19.5,
    marketCap: '₹12.78 Lakh Cr',
    about: 'HDFC Bank Limited traded on BSE (Scrip Code: 500180), India\'s premier banking heavyweight.',
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India (BSE: 500112)',
    sector: 'Banking & Finance',
    peRatio: 10.4,
    marketCap: '₹7.45 Lakh Cr',
    about: 'State Bank of India BSE listing (Scrip Code: 500112), India\'s largest public sector lender.',
  },
  {
    symbol: 'ITC',
    name: 'ITC Ltd. (BSE: 500875)',
    sector: 'Consumer Goods & FMCG',
    peRatio: 27.1,
    marketCap: '₹6.10 Lakh Cr',
    about: 'ITC Limited listed on BSE (Scrip Code: 500875), diversified consumer FMCG and hospitality powerhouse.',
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd. (BSE: 500510)',
    sector: 'Infrastructure',
    peRatio: 33.6,
    marketCap: '₹5.15 Lakh Cr',
    about: 'Larsen & Toubro Limited on BSE (Scrip Code: 500510), infrastructure and engineering pioneer.',
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd. (BSE: 532454)',
    sector: 'Infrastructure',
    peRatio: 52.3,
    marketCap: '₹9.40 Lakh Cr',
    about: 'Bharti Airtel Limited listed on BSE (Scrip Code: 532454), telecommunications and digital infrastructure leader.',
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd. (BSE: 500034)',
    sector: 'Banking & Finance',
    peRatio: 29.5,
    marketCap: '₹4.35 Lakh Cr',
    about: 'Bajaj Finance Limited listed on BSE (Scrip Code: 500034), prominent non-banking retail finance giant.',
  },
];

// Helper to provide headers including server-side secret API keys if configured
function getTejHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };
  const key = process.env.TEJHQ_API_KEY || process.env.TEJ_API_KEY;
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
    headers['X-API-Key'] = key;
  }
  return headers;
}


// Helper to format volume numbers into readable human format (e.g. 13.96M, 428k)
function formatVolumeCompact(vol: number): string {
  if (!vol || isNaN(vol)) return '0';
  if (vol >= 10000000) return `${(vol / 10000000).toFixed(2)} Cr`;
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(2)}M`;
  if (vol >= 100000) return `${(vol / 100000).toFixed(2)} L`;
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}k`;
  return vol.toLocaleString('en-IN');
}

// Convert a single historical Tej OHLCV row to StockHistoricalPoint
function convertTejRowToPoint(row: TejOhlcvRow): StockHistoricalPoint {
  return {
    date: row.date,
    price: Number(row.close),
    open: Number(row.open),
    high: Number(row.high),
    low: Number(row.low),
    close: Number(row.close),
    volume: Number(row.volume || 0),
  };
}

// Segment full historical candles into 1D, 1W, 1M, 1Y, ALL slices without generating fake points
function buildHistoryMapFromRealRows(rows: TejOhlcvRow[], latestSnapshotRow?: TejSnapshotRow) {
  // Sort ascending by date
  const sorted = [...rows].sort((a, b) => a.date.localeCompare(b.date));

  // If latest snapshot date is not yet in history, append it
  if (latestSnapshotRow && sorted.length > 0) {
    const lastHist = sorted[sorted.length - 1];
    // Check if snapshot is for today's date
    if (latestSnapshotRow.close && lastHist.date < '2026-10-08') {
      sorted.push({
        date: '2026-10-08',
        open: latestSnapshotRow.open,
        high: latestSnapshotRow.high,
        low: latestSnapshotRow.low,
        close: latestSnapshotRow.close,
        last: latestSnapshotRow.last,
        prev_close: latestSnapshotRow.prev_close,
        volume: latestSnapshotRow.volume,
      });
    }
  }

  const allPoints: StockHistoricalPoint[] = sorted.map(convertTejRowToPoint);

  if (allPoints.length === 0) {
    return {
      '1D': [],
      '1W': [],
      '1M': [],
      '1Y': [],
      'ALL': [],
    };
  }

  // Slice historical ranges based on real dates
  const latestDateStr = sorted[sorted.length - 1].date;
  const latestDateObj = new Date(latestDateStr);

  const getPointsAfter = (daysAgo: number) => {
    const cutoff = new Date(latestDateObj);
    cutoff.setDate(cutoff.getDate() - daysAgo);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const filtered = allPoints.filter(p => p.date >= cutoffStr);
    return filtered.length > 0 ? filtered : allPoints.slice(-Math.min(daysAgo, allPoints.length));
  };

  // 1D: Last trading day. For EOD data, display the most recent OHLC candle
  const oneDayPoints = allPoints.slice(-1);

  // 1W: Last 7 calendar days (~5 trading sessions)
  const oneWeekPoints = getPointsAfter(7);

  // 1M: Last 30 calendar days (~22 trading sessions)
  const oneMonthPoints = getPointsAfter(30);

  // 1Y: Last 365 calendar days (~250 trading sessions)
  const oneYearPoints = getPointsAfter(365);

  // ALL: Complete available historical record
  const allHistoryPoints = allPoints;

  return {
    '1D': oneDayPoints,
    '1W': oneWeekPoints,
    '1M': oneMonthPoints,
    '1Y': oneYearPoints,
    'ALL': allHistoryPoints,
  };
}

export class ServerMarketDataProvider {
  private cachedStocks: Stock[] = [];
  private cachedRawSnapshot: Map<string, TejSnapshotRow> = new Map();
  private cachedHistoryBySymbol: Map<string, TejOhlcvRow[]> = new Map();
  private cachedActionsBySymbol: Map<string, CorporateAction[]> = new Map();
  private lastSnapshotDate: string = '';
  private lastSnapshotFetchTimestamp: number = 0;
  private isInitializing: boolean = false;
  private initPromise: Promise<void> | null = null;
  private readonly TEJ_API_BASE = 'https://api.tejhq.dev';

  /**
   * Determine live market session status in Asia/Kolkata timezone
   */
  getMarketSessionInfo(): MarketSessionInfo {
    const now = new Date();
    // Format to Asia/Kolkata time
    const kolkataFormatter = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const parts = kolkataFormatter.formatToParts(now);
    const partMap: Record<string, string> = {};
    parts.forEach(p => { partMap[p.type] = p.value; });

    const hour = parseInt(partMap.hour || '0', 10);
    const minute = parseInt(partMap.minute || '0', 10);
    const weekday = partMap.weekday || '';
    const isWeekend = weekday === 'Sat' || weekday === 'Sun';

    const currentMinutes = hour * 60 + minute;
    const marketOpenMinutes = 9 * 60 + 15; // 09:15 IST
    const marketCloseMinutes = 15 * 60 + 30; // 15:30 IST
    const preOpenMinutes = 9 * 60; // 09:00 IST

    let isOpen = false;
    let statusLabel: MarketSessionInfo['statusLabel'] = 'Market Closed';
    let sessionName = 'Regular Trading Closed';

    if (!isWeekend) {
      if (currentMinutes >= marketOpenMinutes && currentMinutes <= marketCloseMinutes) {
        isOpen = true;
        statusLabel = 'Market Open';
        sessionName = 'Normal Trading Session (09:15 – 15:30 IST)';
      } else if (currentMinutes >= preOpenMinutes && currentMinutes < marketOpenMinutes) {
        isOpen = false;
        statusLabel = 'Pre-Open';
        sessionName = 'NSE Pre-Open Order Collection (09:00 – 09:15 IST)';
      } else if (currentMinutes > marketCloseMinutes && currentMinutes <= marketCloseMinutes + 30) {
        isOpen = false;
        statusLabel = 'Post-Closing';
        sessionName = 'Post-Market Closing Run (15:30 – 16:00 IST)';
      }
    } else {
      statusLabel = 'Market Closed';
      sessionName = 'Weekend — Markets Reopen Monday 09:15 IST';
    }

    const kolkataFullStr = new Intl.DateTimeFormat('en-IN', {
      timeZone: 'Asia/Kolkata',
      dateStyle: 'full',
      timeStyle: 'medium',
    }).format(now);

    return {
      isOpen,
      statusLabel,
      sessionName,
      tradingDate: this.lastSnapshotDate || '2026-10-08',
      timezone: 'Asia/Kolkata',
      kolkataTime: kolkataFullStr,
      lastUpdatedText: `End-of-day market snapshot dated ${this.lastSnapshotDate || '2026-10-08'} (TejHQ NSE/BSE Bhavcopy)`,
      provider: 'TejHQ Open Indian Market Data Infrastructure',
    };
  }

  /**
   * Initialize server data provider by downloading the official TejHQ snapshot & historical candles
   */
  async initialize(force: boolean = false): Promise<void> {
    const now = Date.now();
    // Cache for 5 minutes server-side
    if (!force && this.cachedStocks.length > 0 && now - this.lastSnapshotFetchTimestamp < 5 * 60 * 1000) {
      return;
    }

    if (this.isInitializing && this.initPromise) {
      return this.initPromise;
    }

    this.isInitializing = true;
    this.initPromise = (async () => {
      try {
        console.log('[MarketData] Syncing genuine Indian equity quotes from TejHQ...');

        // 1. Check pipeline freshness to get latest available trading date
        let tradingDate = '2026-10-08';
        try {
          const statusRes = await fetch(`${this.TEJ_API_BASE}/v1/status`);
          if (statusRes.ok) {
            const status: TejStatus = await statusRes.json();
            if (status.trading_date) {
              tradingDate = status.trading_date;
            }
          }
        } catch (e) {
          console.warn('[MarketData] Failed to fetch pipeline status, defaulting to 2026-10-08:', e);
        }

        this.lastSnapshotDate = tradingDate;

        // 2. Fetch full NSE and BSE bhavcopy snapshots
        const headers = getTejHeaders();
        const [snapRes, bseSnapRes] = await Promise.all([
          fetch(`${this.TEJ_API_BASE}/v1/snapshot/NSE?date=${tradingDate}`, { headers }),
          fetch(`${this.TEJ_API_BASE}/v1/snapshot/BSE?date=${tradingDate}`, { headers }).catch(() => null),
        ]);

        if (!snapRes.ok) {
          throw new Error(`TejHQ NSE snapshot returned status ${snapRes.status}`);
        }
        const snapData = await snapRes.json();
        const rawRows: TejSnapshotRow[] = snapData.data || [];

        // Build NSE symbol index
        const rowMap = new Map<string, TejSnapshotRow>();
        rawRows.forEach(r => {
          if (r.series === 'EQ' || !rowMap.has(r.symbol)) {
            rowMap.set(r.symbol, r);
            rowMap.set(`NSE:${r.symbol}`, r);
          }
        });

        // Build BSE symbol index if available
        const bseRowMap = new Map<string, TejSnapshotRow>();
        if (bseSnapRes && bseSnapRes.ok) {
          try {
            const bseData = await bseSnapRes.json();
            const bseRows: TejSnapshotRow[] = bseData.data || [];
            bseRows.forEach(r => {
              bseRowMap.set(r.symbol, r);
              rowMap.set(`BSE:${r.symbol}`, r);
            });
          } catch (e) {
            console.warn('[MarketData] Warning parsing BSE snapshot:', e);
          }
        }
        this.cachedRawSnapshot = rowMap;

        // 3. Preload historical OHLCV candles in batches for the curated NSE stocks
        const symbolsToLoad = MONITORED_NSE_STOCKS.map(s => s.symbol);
        const batchSize = 6;
        for (let i = 0; i < symbolsToLoad.length; i += batchSize) {
          const batch = symbolsToLoad.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async sym => {
              try {
                const histRes = await fetch(`${this.TEJ_API_BASE}/v1/ohlcv/NSE/${sym}?from=2024-01-01&to=${tradingDate}`, { headers });
                if (histRes.ok) {
                  const histJson = await histRes.json();
                  if (Array.isArray(histJson.data)) {
                    this.cachedHistoryBySymbol.set(sym, histJson.data);
                    this.cachedHistoryBySymbol.set(`NSE:${sym}`, histJson.data);
                  }
                }
              } catch (err) {
                console.warn(`[MarketData] Warning fetching history for ${sym}:`, err);
              }
            })
          );
        }

        // Preload historical candles for BSE stocks
        const bseSymbols = MONITORED_BSE_STOCKS.map(s => s.symbol);
        for (let i = 0; i < bseSymbols.length; i += batchSize) {
          const batch = bseSymbols.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async sym => {
              try {
                const histRes = await fetch(`${this.TEJ_API_BASE}/v1/ohlcv/BSE/${sym}?from=2024-01-01&to=${tradingDate}`, { headers });
                if (histRes.ok) {
                  const histJson = await histRes.json();
                  if (Array.isArray(histJson.data)) {
                    this.cachedHistoryBySymbol.set(`BSE:${sym}`, histJson.data);
                  }
                }
              } catch (err) {
                console.warn(`[MarketData] Warning fetching BSE history for ${sym}:`, err);
              }
            })
          );
        }

        // 4. Assemble pristine Stock instances with real numbers for NSE
        const stockInstances: Stock[] = [];
        for (const meta of MONITORED_NSE_STOCKS) {
          const row = rowMap.get(meta.symbol);
          if (!row || !row.close) {
            console.warn(`[MarketData] Skipping ${meta.symbol} because no genuine quote was returned by TejHQ.`);
            continue;
          }

          const realPrice = Number(row.close);
          const realPrevClose = Number(row.prev_close || row.close);
          const realChange = Math.round((realPrice - realPrevClose) * 100) / 100;
          const realChangePercent = realPrevClose > 0 ? Math.round(((realChange / realPrevClose) * 100) * 100) / 100 : 0;
          const realDayHigh = Number(row.high || realPrice);
          const realDayLow = Number(row.low || realPrice);
          const historyRows = this.cachedHistoryBySymbol.get(`NSE:${meta.symbol}`) || this.cachedHistoryBySymbol.get(meta.symbol) || [];

          // Compute 52-week high & low from actual historical points
          let week52High = realDayHigh;
          let week52Low = realDayLow;
          if (historyRows.length > 0) {
            const lastYearRows = historyRows.slice(-250);
            const highs = lastYearRows.map(r => Number(r.high || r.close));
            const lows = lastYearRows.map(r => Number(r.low || r.close));
            week52High = Math.max(...highs, realDayHigh);
            week52Low = Math.min(...lows, realDayLow);
          }

          const stockObj: Stock = {
            symbol: meta.symbol,
            name: meta.name || row.name,
            sector: meta.sector,
            price: realPrice,
            previousClose: realPrevClose,
            change: realChange,
            changePercent: realChangePercent,
            dayHigh: realDayHigh,
            dayLow: realDayLow,
            peRatio: meta.peRatio,
            marketCap: meta.marketCap,
            week52High: Math.round(week52High * 100) / 100,
            week52Low: Math.round(week52Low * 100) / 100,
            volume: formatVolumeCompact(row.volume),
            about: meta.about,
            exchange: 'NSE',
            isin: row.isin,
            series: row.series,
            dataProvider: 'TejHQ',
            priceLabel: 'End-of-day',
            dataTimestamp: `${tradingDate}T18:30:00+05:30`,
            tradingDate: tradingDate,
            isStale: false,
            isAvailable: true,
            turnover: row.turnover,
            trades: row.trades,
            history: buildHistoryMapFromRealRows(historyRows, row),
          };

          stockInstances.push(stockObj);
        }

        // Assemble verified BSE stocks
        for (const meta of MONITORED_BSE_STOCKS) {
          const row = bseRowMap.get(meta.symbol);
          if (!row || !row.close) continue;

          const realPrice = Number(row.close);
          const realPrevClose = Number(row.prev_close || row.close);
          const realChange = Math.round((realPrice - realPrevClose) * 100) / 100;
          const realChangePercent = realPrevClose > 0 ? Math.round(((realChange / realPrevClose) * 100) * 100) / 100 : 0;
          const realDayHigh = Number(row.high || realPrice);
          const realDayLow = Number(row.low || realPrice);
          const historyRows = this.cachedHistoryBySymbol.get(`BSE:${meta.symbol}`) || [];

          let week52High = realDayHigh;
          let week52Low = realDayLow;
          if (historyRows.length > 0) {
            const lastYearRows = historyRows.slice(-250);
            const highs = lastYearRows.map(r => Number(r.high || r.close));
            const lows = lastYearRows.map(r => Number(r.low || r.close));
            week52High = Math.max(...highs, realDayHigh);
            week52Low = Math.min(...lows, realDayLow);
          }

          const stockObj: Stock = {
            symbol: meta.symbol,
            name: meta.name || row.name,
            sector: meta.sector,
            price: realPrice,
            previousClose: realPrevClose,
            change: realChange,
            changePercent: realChangePercent,
            dayHigh: realDayHigh,
            dayLow: realDayLow,
            peRatio: meta.peRatio,
            marketCap: meta.marketCap,
            week52High: Math.round(week52High * 100) / 100,
            week52Low: Math.round(week52Low * 100) / 100,
            volume: formatVolumeCompact(row.volume),
            about: meta.about,
            exchange: 'BSE',
            isin: row.isin,
            series: row.series || 'A',
            dataProvider: 'TejHQ',
            priceLabel: 'End-of-day',
            dataTimestamp: `${tradingDate}T18:30:00+05:30`,
            tradingDate: tradingDate,
            isStale: false,
            isAvailable: true,
            turnover: row.turnover,
            trades: row.trades,
            history: buildHistoryMapFromRealRows(historyRows, row),
          };

          stockInstances.push(stockObj);
        }

        this.cachedStocks = stockInstances;
        this.lastSnapshotFetchTimestamp = Date.now();
        console.log(`[MarketData] Successfully loaded ${this.cachedStocks.length} genuine NSE/BSE stocks for trading date ${tradingDate}`);
      } catch (err) {
        console.error('[MarketData] Error syncing market data:', err);
        throw err;
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
  }

  /**
   * Return verified genuine stocks
   */
  async getStocks(force: boolean = false): Promise<Stock[]> {
    if (this.cachedStocks.length === 0 || force) {
      await this.initialize(force);
    }
    return this.cachedStocks;
  }

  /**
   * Return detailed historical candles for a specific symbol
   */
  async getSymbolHistory(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE') {
    const sym = symbol.toUpperCase();
    const cacheKey = `${exchange}:${sym}`;
    let history = this.cachedHistoryBySymbol.get(cacheKey) || (exchange === 'NSE' ? this.cachedHistoryBySymbol.get(sym) : undefined);

    if (!history || history.length === 0) {
      try {
        const headers = getTejHeaders();
        const res = await fetch(`${this.TEJ_API_BASE}/v1/ohlcv/${exchange}/${sym}?from=2024-01-01&to=${this.lastSnapshotDate || '2026-10-08'}`, { headers });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json.data)) {
            const rows: TejOhlcvRow[] = json.data;
            history = rows;
            this.cachedHistoryBySymbol.set(cacheKey, rows);
          }
        }
      } catch (e) {
        console.warn(`[MarketData] Failed to load history for ${sym} on ${exchange}:`, e);
      }
    }

    const row = this.cachedRawSnapshot.get(cacheKey) || this.cachedRawSnapshot.get(sym);
    return {
      symbol: sym,
      exchange,
      historyMap: buildHistoryMapFromRealRows(history || [], row),
      rowsCount: history ? history.length : 0,
    };
  }

  /**
   * Return corporate actions recorded for a symbol
   */
  async getCorporateActions(symbol: string): Promise<CorporateAction[]> {
    const sym = symbol.toUpperCase();
    if (this.cachedActionsBySymbol.has(sym)) {
      return this.cachedActionsBySymbol.get(sym)!;
    }

    try {
      const res = await fetch(`${this.TEJ_API_BASE}/v1/actions/${sym}`);
      if (res.ok) {
        const json = await res.json();
        const actions: CorporateAction[] = (json.data || []).map((a: any) => ({
          exchange: a.exchange,
          symbol: a.symbol,
          isin: a.isin,
          company: a.company,
          exDate: a.ex_date,
          recordDate: a.record_date,
          type: a.type,
          cashAmount: a.cash_amount,
          rawSubject: a.raw_subject,
        }));
        this.cachedActionsBySymbol.set(sym, actions);
        return actions;
      }
    } catch (e) {
      console.warn(`[MarketData] Failed to load corporate actions for ${sym}:`, e);
    }
    return [];
  }
}

export const serverMarketDataProvider = new ServerMarketDataProvider();
