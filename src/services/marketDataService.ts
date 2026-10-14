import { Stock, MarketSessionInfo, CorporateAction } from '../types';

export interface MarketDataSummary {
  tradingDate: string;
  stage?: string;
  pricesPublishedAt?: string;
  source: string;
  provider: string;
  license: string;
  fetchedAt: number;
  totalSymbols: number;
}

export interface MarketDataResponse {
  stocks: Stock[];
  session: MarketSessionInfo;
  summary: MarketDataSummary;
  corporateActions: Record<string, CorporateAction[]>;
}

class MarketDataService {
  private cachedData: MarketDataResponse | null = null;
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;
  private fetchPromise: Promise<MarketDataResponse> | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute in-memory cache

  /**
   * Fetch complete authentic market quotes from server-side TejHQ proxy
   */
  async getMarketData(forceRefresh: boolean = false): Promise<MarketDataResponse> {
    const now = Date.now();
    if (!forceRefresh && this.cachedData && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cachedData;
    }

    if (this.isFetching && this.fetchPromise) {
      return this.fetchPromise;
    }

    this.isFetching = true;
    this.fetchPromise = (async () => {
      try {
        const url = forceRefresh ? '/api/market/quotes?force=true' : '/api/market/quotes';
        const res = await fetch(url);
        if (!res.ok) {
          throw new Error(`Failed to fetch real market data: ${res.status} ${res.statusText}`);
        }
        const data: MarketDataResponse = await res.json();
        if (!data || !Array.isArray(data.stocks) || data.stocks.length === 0) {
          throw new Error('Invalid market data payload received from server');
        }

        this.cachedData = data;
        this.lastFetchTime = Date.now();

        // Also save to localStorage as safe offline fallback
        try {
          localStorage.setItem('investiq_real_market_cache', JSON.stringify({
            data,
            timestamp: this.lastFetchTime,
          }));
        } catch {
          // localStorage quota or private mode
        }

        return data;
      } catch (err) {
        console.warn('Real market data service warning:', err);

        // Check if cachedData exists in memory
        if (this.cachedData) {
          return this.cachedData;
        }

        // Check localStorage backup
        try {
          const stored = localStorage.getItem('investiq_real_market_cache');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed?.data?.stocks?.length > 0) {
              this.cachedData = parsed.data;
              return parsed.data;
            }
          }
        } catch {
          // ignore
        }

        throw err;
      } finally {
        this.isFetching = false;
        this.fetchPromise = null;
      }
    })();

    return this.fetchPromise;
  }

  /**
   * Fetch single symbol historical candles for interactive charting
   */
  async getSymbolHistory(symbol: string, exchange: 'NSE' | 'BSE' = 'NSE') {
    const res = await fetch(`/api/market/history?symbol=${encodeURIComponent(symbol)}&exchange=${exchange}`);
    if (!res.ok) {
      throw new Error(`Failed to load historical data for ${symbol}`);
    }
    return res.json();
  }

  /**
   * Fetch corporate actions for a symbol
   */
  async getCorporateActions(symbol: string) {
    const res = await fetch(`/api/market/actions?symbol=${encodeURIComponent(symbol)}`);
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json.data || [];
  }
}

export const marketDataService = new MarketDataService();
