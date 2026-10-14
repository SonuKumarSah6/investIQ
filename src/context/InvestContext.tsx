import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Stock,
  Holding,
  Transaction,
  Lesson,
  Achievement,
  UserProfile,
  PriceAlert,
  NewsArticle,
  SavedInsight,
  MarketSessionInfo,
  CorporateAction,
  PortfolioSnapshot,
} from '../types';
import { INITIAL_LESSONS } from '../data/mockLessons';
import { INITIAL_ACHIEVEMENTS } from '../data/mockAchievements';
import { INITIAL_NEWS_ARTICLES } from '../data/mockNews';
import { roundMoney, formatINR, formatKolkataDateTime } from '../utils/formatters';
import { marketDataService } from '../services/marketDataService';
import {
  auth,
  db,
  signInWithGoogle,
  logOutUser,
  OperationType,
  handleFirestoreError,
} from '../services/firebase';
import {
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  writeBatch,
} from 'firebase/firestore';

export interface ToastNotification {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

export interface HoldingPerformance {
  holding: Holding;
  stock?: Stock;
  marketValue: number;
  unrealizedPL: number;
  unrealizedPLPercent: number;
  allocationPercent: number;
}

interface InvestContextType {
  // Authentication & Cloud Sync
  currentUser: FirebaseUser | null;
  isAuthLoading: boolean;
  authError: string | null;
  isCloudSynced: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  hasPendingDemoData: boolean;
  migrateDemoToCloud: () => Promise<void>;
  dismissDemoMigration: () => void;

  // Real Market Data (NSE / BSE via TejHQ)
  stocks: Stock[];
  selectedStockSymbol: string;
  setSelectedStockSymbol: (symbol: string) => void;
  selectedStock: Stock | undefined;
  isLoadingMarketData: boolean;
  marketDataError: string | null;
  lastPricesUpdated: number;
  marketSession: MarketSessionInfo;
  corporateActions: Record<string, CorporateAction[]>;
  refreshRealMarketPrices: () => Promise<void>;

  // User & Portfolio
  userProfile: UserProfile;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  virtualCash: number;
  holdings: Record<string, Holding>;
  transactions: Transaction[];
  watchlist: string[];
  portfolioSnapshots: PortfolioSnapshot[];

  // Computed Portfolio Metrics
  portfolioHoldingsValue: number;
  totalPortfolioValue: number;
  totalInvestedAmount: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  totalRealizedPL: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  initialStartingBalance: number;
  todayGainLoss: number;
  todayGainLossPercent: number;
  bestHolding: HoldingPerformance | null;
  worstHolding: HoldingPerformance | null;
  holdingsPerformanceList: HoldingPerformance[];

  // Actions (Virtual simulated orders with real market prices)
  buyStock: (symbol: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  sellStock: (symbol: string, quantity: number) => Promise<{ success: boolean; message: string }>;
  toggleWatchlist: (symbol: string) => Promise<boolean>;
  isInWatchlist: (symbol: string) => boolean;
  resetAccount: () => Promise<void>;

  // Education
  lessons: Lesson[];
  completedLessons: string[];
  quizScores: Record<string, number>;
  completeLessonQuiz: (lessonId: string, score: number) => void;

  // Gamification & Achievements
  achievements: Achievement[];

  // Price Alerts System
  priceAlerts: PriceAlert[];
  createPriceAlert: (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'status'>) => { success: boolean; message: string };
  deletePriceAlert: (id: string) => void;
  dismissPriceAlert: (id: string) => void;
  dismissAllTriggeredAlerts: () => void;
  activeAlerts: PriceAlert[];
  triggeredAlerts: PriceAlert[];
  unreadTriggeredCount: number;

  // Toasts
  toasts: ToastNotification[];
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastNotification, 'id'>) => void;

  // Live News System
  newsArticles: NewsArticle[];
  savedNewsIds: string[];
  toggleSaveNews: (newsId: string) => void;
  isNewsSaved: (newsId: string) => boolean;
  refreshNewsFeed: () => void;

  // InvestIQ Mentor & Intelligence
  savedInsights: SavedInsight[];
  saveInsight: (insight: Omit<SavedInsight, 'id' | 'timestamp'>) => void;
  deleteSavedInsight: (id: string) => void;
  pendingMentorQuestion: string | null;
  askMentor: (question: string) => void;
  clearPendingMentorQuestion: () => void;

  // Active Navigation Tab
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

const STORAGE_KEY_PREFIX = 'investiq_app_v2_';
const CLOUD_STARTING_BALANCE = 1000000; // ₹10,00,000 for each new user account

const DEFAULT_SESSION: MarketSessionInfo = {
  isOpen: false,
  statusLabel: 'Market Closed',
  sessionName: 'End-of-day market snapshot',
  tradingDate: '2026-10-08',
  timezone: 'Asia/Kolkata',
  kolkataTime: new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'medium',
  }).format(new Date()),
  lastUpdatedText: 'End-of-day market snapshot dated 2026-10-08 (TejHQ NSE/BSE Bhavcopy)',
  provider: 'TejHQ Open Indian Market Data Infrastructure',
};

const InvestContext = createContext<InvestContextType | undefined>(undefined);

export const InvestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasPendingDemoData, setHasPendingDemoData] = useState<boolean>(false);

  // Real Market Data States
  const [stocks, setStocks] = useState<Stock[]>(() => {
    try {
      const cached = localStorage.getItem('investiq_real_market_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data?.stocks?.length > 0) return parsed.data.stocks;
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isLoadingMarketData, setIsLoadingMarketData] = useState<boolean>(true);
  const [marketDataError, setMarketDataError] = useState<string | null>(null);
  const [lastPricesUpdated, setLastPricesUpdated] = useState<number>(Date.now());
  const [marketSession, setMarketSession] = useState<MarketSessionInfo>(() => {
    try {
      const cached = localStorage.getItem('investiq_real_market_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data?.session) return parsed.data.session;
      }
    } catch {
      // ignore
    }
    return DEFAULT_SESSION;
  });
  const [corporateActions, setCorporateActions] = useState<Record<string, CorporateAction[]>>({});
  const [selectedStockSymbol, setSelectedStockSymbol] = useState<string>('RELIANCE');

  // Portfolio Cash, Cost Basis & Balances
  const [startingBalance, setStartingBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}starting_balance`);
      return saved ? JSON.parse(saved) : CLOUD_STARTING_BALANCE;
    } catch {
      return CLOUD_STARTING_BALANCE;
    }
  });

  const [virtualCash, setVirtualCash] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}cash`);
      return saved ? JSON.parse(saved) : CLOUD_STARTING_BALANCE;
    } catch {
      return CLOUD_STARTING_BALANCE;
    }
  });

  const [realizedPL, setRealizedPL] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}realized_pl`);
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  // Holdings & Transactions
  const [holdings, setHoldings] = useState<Record<string, Holding>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}holdings`);
      if (saved) return JSON.parse(saved);
      return {
        RELIANCE: {
          symbol: 'RELIANCE',
          companyName: 'Reliance Industries Ltd.',
          exchange: 'NSE',
          quantity: 25,
          avgPrice: 1178.0,
          totalInvested: 29450.0,
          updatedAt: new Date().toISOString(),
        },
        TMCV: {
          symbol: 'TMCV',
          companyName: 'Tata Motors Commercial Vehicles',
          exchange: 'NSE',
          quantity: 50,
          avgPrice: 413.2,
          totalInvested: 20660.0,
          updatedAt: new Date().toISOString(),
        },
      };
    } catch {
      return {};
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
      if (saved) return JSON.parse(saved);
      return [
        {
          id: 'tx-init-1',
          symbol: 'RELIANCE',
          stockName: 'Reliance Industries Ltd.',
          exchange: 'NSE',
          type: 'BUY',
          quantity: 25,
          price: 1178.0,
          totalAmount: 29450.0,
          cashAfterTrade: 970550.0,
          timestamp: Date.now() - 86400000 * 2,
          dateFormatted: new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          simulated: true,
        },
        {
          id: 'tx-init-2',
          symbol: 'TMCV',
          stockName: 'Tata Motors Commercial Vehicles',
          exchange: 'NSE',
          type: 'BUY',
          quantity: 50,
          price: 413.2,
          totalAmount: 20660.0,
          cashAfterTrade: 949890.0,
          timestamp: Date.now() - 86400000,
          dateFormatted: new Date(Date.now() - 86400000).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          simulated: true,
        },
      ];
    } catch {
      return [];
    }
  });

  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}watchlist`);
      return saved ? JSON.parse(saved) : ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TMCV', 'ETERNAL'];
    } catch {
      return ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TMCV', 'ETERNAL'];
    }
  });

  const [portfolioSnapshots, setPortfolioSnapshots] = useState<PortfolioSnapshot[]>([]);

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
      if (saved) return JSON.parse(saved);
      return {
        name: 'Arjun Sharma',
        email: 'investor@investiq.dev',
        avatarId: 'student_1',
        experienceLevel: 'Beginner',
        joinedDate: 'October 2026',
        currency: 'INR',
      };
    } catch {
      return {
        name: 'Arjun Sharma',
        avatarId: 'student_1',
        experienceLevel: 'Beginner',
        joinedDate: 'October 2026',
        currency: 'INR',
      };
    }
  });

  // Learning & Achievements
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}completed_lessons`);
      return saved ? JSON.parse(saved) : ['lesson-1'];
    } catch {
      return ['lesson-1'];
    }
  });

  const [quizScores, setQuizScores] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}quiz_scores`);
      return saved ? JSON.parse(saved) : { 'lesson-1': 100 };
    } catch {
      return { 'lesson-1': 100 };
    }
  });

  const [unlockedAchievements, setUnlockedAchievements] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}unlocked_achievements`);
      return saved ? JSON.parse(saved) : { 'ach-first-trade': Date.now() - 86400000 };
    } catch {
      return { 'ach-first-trade': Date.now() - 86400000 };
    }
  });

  // Price Alerts & Toasts
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}price_alerts`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [newsArticles] = useState<NewsArticle[]>(INITIAL_NEWS_ARTICLES);
  const [savedNewsIds, setSavedNewsIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}saved_news`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [savedInsights, setSavedInsights] = useState<SavedInsight[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY_PREFIX}saved_insights`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [pendingMentorQuestion, setPendingMentorQuestion] = useState<string | null>(null);

  // Unsubscribe listeners ref
  const unsubscribersRef = useRef<Array<() => void>>([]);

  // Toast dispatch helpers
  const showToast = useCallback((toast: Omit<ToastNotification, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch real market prices from server-side TejHQ proxy
  const loadMarketQuotes = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingMarketData(true);
    setMarketDataError(null);
    try {
      const res = await marketDataService.getMarketData(forceRefresh);
      if (res && res.stocks && res.stocks.length > 0) {
        setStocks(res.stocks);
        if (res.session) setMarketSession(res.session);
        if (res.corporateActions) setCorporateActions(res.corporateActions);
        setLastPricesUpdated(Date.now());
        if (forceRefresh) {
          showToast({
            type: 'success',
            title: 'Market Prices Refreshed',
            message: `Retrieved genuine quotes for ${res.stocks.length} Indian equities dated ${res.session.tradingDate} from TejHQ.`,
          });
        }
      } else {
        throw new Error('No equity quotes returned from data provider');
      }
    } catch (err: any) {
      console.error('Failed to load authentic market quotes:', err);
      setMarketDataError(err?.message || 'Market data provider temporarily unavailable');
    } finally {
      setIsLoadingMarketData(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadMarketQuotes(false);
  }, [loadMarketQuotes]);

  // Clean up Firestore listeners
  const cleanupFirestoreListeners = useCallback(() => {
    unsubscribersRef.current.forEach((unsub) => {
      try {
        unsub();
      } catch (e) {
        console.warn('Listener cleanup notice:', e);
      }
    });
    unsubscribersRef.current = [];
  }, []);

  // Check and setup user account in Firestore
  const setupFirestoreUserAccount = useCallback(
    async (firebaseUser: FirebaseUser) => {
      cleanupFirestoreListeners();
      const uid = firebaseUser.uid;
      const userDocRef = doc(db, 'users', uid);
      const portfolioDocRef = doc(db, 'users', uid, 'portfolio', 'current');

      try {
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          // New User Registration: One-time starting balance initialization of ₹10,00,000
          console.log(`[Firebase] Initializing new account for UID: ${uid}`);

          const newProfile: UserProfile = {
            uid,
            name: firebaseUser.displayName || 'Investor',
            email: firebaseUser.email || '',
            photoURL: firebaseUser.photoURL || '',
            avatarId: 'student_1',
            experienceLevel: 'Beginner',
            joinedDate: new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(new Date()),
            currency: 'INR',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Initialize user profile
          await setDoc(userDocRef, newProfile);

          // Initialize portfolio document with exact starting balance of ₹10,00,000
          await setDoc(portfolioDocRef, {
            userId: uid,
            startingBalance: CLOUD_STARTING_BALANCE,
            cashBalance: CLOUD_STARTING_BALANCE,
            realizedPL: 0,
            initialized: true,
            updatedAt: new Date().toISOString(),
          });

          // Check if local demo holdings exist to offer migration
          const localDemoHoldings = localStorage.getItem(`${STORAGE_KEY_PREFIX}holdings`);
          const localDemoTx = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
          if (localDemoHoldings || localDemoTx) {
            setHasPendingDemoData(true);
          }

          showToast({
            type: 'success',
            title: 'Welcome to InvestIQ!',
            message: `Account activated with ${formatINR(CLOUD_STARTING_BALANCE)} in virtual trading capital. All activity will now sync to Cloud Firestore.`,
          });
        }

        // Attach Realtime Listener: User Profile
        const unsubProfile = onSnapshot(
          userDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const data = docSnap.data() as UserProfile;
              setUserProfile({
                ...data,
                photoURL: firebaseUser.photoURL || data.photoURL,
              });
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}`);
          }
        );
        unsubscribersRef.current.push(unsubProfile);

        // Attach Realtime Listener: Portfolio Cash & Balances
        const unsubPortfolio = onSnapshot(
          portfolioDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              const pData = docSnap.data();
              if (pData.startingBalance !== undefined) setStartingBalance(pData.startingBalance);
              if (pData.cashBalance !== undefined) setVirtualCash(pData.cashBalance);
              if (pData.realizedPL !== undefined) setRealizedPL(pData.realizedPL);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, `users/${uid}/portfolio/current`);
          }
        );
        unsubscribersRef.current.push(unsubPortfolio);

        // Attach Realtime Listener: Holdings
        const holdingsColRef = collection(db, 'users', uid, 'holdings');
        const unsubHoldings = onSnapshot(
          holdingsColRef,
          (snapshot) => {
            const hMap: Record<string, Holding> = {};
            snapshot.forEach((docSnap) => {
              const d = docSnap.data() as Holding;
              hMap[d.symbol] = d;
            });
            setHoldings(hMap);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/holdings`);
          }
        );
        unsubscribersRef.current.push(unsubHoldings);

        // Attach Realtime Listener: Transactions (Ordered newest first)
        const txColRef = collection(db, 'users', uid, 'transactions');
        const txQuery = query(txColRef, orderBy('timestamp', 'desc'));
        const unsubTransactions = onSnapshot(
          txQuery,
          (snapshot) => {
            const txList: Transaction[] = [];
            snapshot.forEach((docSnap) => {
              txList.push(docSnap.data() as Transaction);
            });
            setTransactions(txList);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/transactions`);
          }
        );
        unsubscribersRef.current.push(unsubTransactions);

        // Attach Realtime Listener: Watchlist
        const watchColRef = collection(db, 'users', uid, 'watchlist');
        const unsubWatchlist = onSnapshot(
          watchColRef,
          (snapshot) => {
            const wList: string[] = [];
            snapshot.forEach((docSnap) => {
              const d = docSnap.data();
              if (d.symbol) wList.push(d.symbol);
            });
            if (wList.length > 0) {
              setWatchlist(wList);
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/watchlist`);
          }
        );
        unsubscribersRef.current.push(unsubWatchlist);

        // Attach Realtime Listener: Portfolio Snapshots
        const snapColRef = collection(db, 'users', uid, 'portfolioSnapshots');
        const snapQuery = query(snapColRef, orderBy('timestamp', 'desc'));
        const unsubSnapshots = onSnapshot(
          snapQuery,
          (snapshot) => {
            const sList: PortfolioSnapshot[] = [];
            snapshot.forEach((docSnap) => {
              sList.push({ ...docSnap.data(), id: docSnap.id } as PortfolioSnapshot);
            });
            setPortfolioSnapshots(sList);
          },
          (err) => {
            handleFirestoreError(err, OperationType.LIST, `users/${uid}/portfolioSnapshots`);
          }
        );
        unsubscribersRef.current.push(unsubSnapshots);
      } catch (err: any) {
        console.error('[Firebase] Error setting up user account:', err);
        setAuthError(err?.message || 'Failed to sync with cloud account');
        showToast({
          type: 'error',
          title: 'Cloud Sync Notice',
          message: 'Unable to connect to Cloud Firestore. Operating in local mode.',
        });
      }
    },
    [cleanupFirestoreListeners, showToast]
  );

  // Monitor Firebase Auth State Changes
  useEffect(() => {
    setIsAuthLoading(true);
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      setAuthError(null);

      if (firebaseUser) {
        await setupFirestoreUserAccount(firebaseUser);
      } else {
        cleanupFirestoreListeners();
        // Load demo local state when logged out
        try {
          const savedCash = localStorage.getItem(`${STORAGE_KEY_PREFIX}cash`);
          if (savedCash) setVirtualCash(JSON.parse(savedCash));
          const savedHoldings = localStorage.getItem(`${STORAGE_KEY_PREFIX}holdings`);
          if (savedHoldings) setHoldings(JSON.parse(savedHoldings));
          const savedTx = localStorage.getItem(`${STORAGE_KEY_PREFIX}transactions`);
          if (savedTx) setTransactions(JSON.parse(savedTx));
          const savedProfile = localStorage.getItem(`${STORAGE_KEY_PREFIX}profile`);
          if (savedProfile) setUserProfile(JSON.parse(savedProfile));
        } catch {
          // ignore
        }
      }

      setIsAuthLoading(false);
    });

    return () => {
      unsubscribeAuth();
      cleanupFirestoreListeners();
    };
  }, [setupFirestoreUserAccount, cleanupFirestoreListeners]);

  // Login handler
  const loginWithGoogle = useCallback(async () => {
    setAuthError(null);
    try {
      const user = await signInWithGoogle();
      showToast({
        type: 'success',
        title: 'Signed in with Google',
        message: `Welcome back, ${user.displayName || user.email}! Connected to Firestore.`,
      });
      setIsAuthModalOpen(false);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in error:', err);
        setAuthError(err?.message || 'Failed to sign in with Google');
        showToast({
          type: 'error',
          title: 'Sign In Failed',
          message: err?.message || 'Could not complete Google authentication.',
        });
      }
    }
  }, [showToast]);

  // Logout handler
  const logout = useCallback(async () => {
    try {
      await logOutUser();
      showToast({
        type: 'info',
        title: 'Signed Out',
        message: 'You have signed out of your cloud account. Switched to demo mode.',
      });
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  }, [showToast]);

  // Migrate Demo Data to Cloud Account
  const migrateDemoToCloud = useCallback(async () => {
    if (!currentUser) return;
    const uid = currentUser.uid;

    try {
      const batch = writeBatch(db);

      // 1. Update Portfolio Cash
      const portfolioRef = doc(db, 'users', uid, 'portfolio', 'current');
      batch.set(portfolioRef, {
        userId: uid,
        startingBalance,
        cashBalance: virtualCash,
        realizedPL,
        initialized: true,
        updatedAt: new Date().toISOString(),
      });

      // 2. Copy Holdings
      Object.values(holdings).forEach((h) => {
        const hRef = doc(db, 'users', uid, 'holdings', h.symbol);
        batch.set(hRef, {
          userId: uid,
          symbol: h.symbol,
          companyName: h.companyName || h.symbol,
          exchange: h.exchange || 'NSE',
          quantity: h.quantity,
          avgPrice: h.avgPrice,
          totalInvested: h.totalInvested,
          updatedAt: new Date().toISOString(),
        });
      });

      // 3. Copy Transactions
      transactions.forEach((tx) => {
        const txRef = doc(db, 'users', uid, 'transactions', tx.id);
        batch.set(txRef, {
          ...tx,
          userId: uid,
          simulated: true,
        });
      });

      // 4. Copy Watchlist
      watchlist.forEach((sym) => {
        const wRef = doc(db, 'users', uid, 'watchlist', sym);
        batch.set(wRef, {
          symbol: sym,
          userId: uid,
          addedAt: Date.now(),
        });
      });

      await batch.commit();
      setHasPendingDemoData(false);

      showToast({
        type: 'success',
        title: 'Demo Portfolio Migrated',
        message: 'Your local simulator trades and holdings have been saved to your Cloud Firestore account.',
      });
    } catch (err: any) {
      console.error('Migration failed:', err);
      showToast({
        type: 'error',
        title: 'Migration Failed',
        message: 'Could not migrate demo data to Firestore.',
      });
    }
  }, [currentUser, startingBalance, virtualCash, realizedPL, holdings, transactions, watchlist, showToast]);

  const dismissDemoMigration = useCallback(() => {
    setHasPendingDemoData(false);
  }, []);

  // Update User Profile (Cloud synced if logged in)
  const updateUserProfile = useCallback(
    async (updated: Partial<UserProfile>) => {
      const merged = { ...userProfile, ...updated, updatedAt: new Date().toISOString() };
      setUserProfile(merged);

      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          await updateDoc(userDocRef, {
            ...updated,
            updatedAt: new Date().toISOString(),
          });
          showToast({
            type: 'success',
            title: 'Profile Updated',
            message: 'Your display name and preferences have been saved to Firestore.',
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
        }
      } else {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(merged));
      }
    },
    [currentUser, userProfile, showToast]
  );

  // Local storage sync when in guest/demo mode
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}cash`, JSON.stringify(virtualCash));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}starting_balance`, JSON.stringify(startingBalance));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}realized_pl`, JSON.stringify(realizedPL));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}holdings`, JSON.stringify(holdings));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}transactions`, JSON.stringify(transactions));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}watchlist`, JSON.stringify(watchlist));
        localStorage.setItem(`${STORAGE_KEY_PREFIX}profile`, JSON.stringify(userProfile));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }
    }
  }, [currentUser, virtualCash, startingBalance, realizedPL, holdings, transactions, watchlist, userProfile]);

  // Selected Stock lookup
  const selectedStock = useMemo(() => {
    if (stocks.length === 0) return undefined;
    return stocks.find((s) => s.symbol === selectedStockSymbol) || stocks[0];
  }, [stocks, selectedStockSymbol]);

  // Lookup map for fast pricing
  const stockPriceMap = useMemo(() => {
    const map: Record<string, Stock> = {};
    stocks.forEach((s) => {
      map[s.symbol] = s;
      if (s.exchange) {
        map[`${s.exchange}:${s.symbol}`] = s;
      }
    });
    return map;
  }, [stocks]);

  // Computed Portfolio Metrics
  const portfolioHoldingsValue = useMemo(() => {
    let total = 0;
    Object.values(holdings).forEach((holding) => {
      const stock = stockPriceMap[holding.symbol];
      if (stock && stock.price > 0) {
        total += holding.quantity * stock.price;
      } else {
        total += holding.totalInvested;
      }
    });
    return roundMoney(total);
  }, [holdings, stockPriceMap]);

  const totalInvestedAmount = useMemo(() => {
    let total = 0;
    Object.values(holdings).forEach((holding) => {
      total += holding.totalInvested;
    });
    return roundMoney(total);
  }, [holdings]);

  const totalUnrealizedPL = useMemo(() => {
    return roundMoney(portfolioHoldingsValue - totalInvestedAmount);
  }, [portfolioHoldingsValue, totalInvestedAmount]);

  const totalUnrealizedPLPercent = useMemo(() => {
    if (totalInvestedAmount <= 0) return 0;
    return roundMoney((totalUnrealizedPL / totalInvestedAmount) * 100);
  }, [totalUnrealizedPL, totalInvestedAmount]);

  const totalPortfolioValue = useMemo(() => {
    return roundMoney(virtualCash + portfolioHoldingsValue);
  }, [virtualCash, portfolioHoldingsValue]);

  const totalRealizedPL = useMemo(() => {
    return roundMoney(realizedPL);
  }, [realizedPL]);

  const initialStartingBalance = useMemo(() => {
    return startingBalance || CLOUD_STARTING_BALANCE;
  }, [startingBalance]);

  const totalProfitLoss = useMemo(() => {
    return roundMoney(totalPortfolioValue - initialStartingBalance);
  }, [totalPortfolioValue, initialStartingBalance]);

  const totalProfitLossPercent = useMemo(() => {
    if (initialStartingBalance <= 0) return 0;
    return roundMoney((totalProfitLoss / initialStartingBalance) * 100);
  }, [totalProfitLoss, initialStartingBalance]);

  const todayGainLoss = useMemo(() => {
    let dayPL = 0;
    Object.values(holdings).forEach((holding) => {
      const stock = stockPriceMap[holding.symbol];
      if (stock && stock.change !== undefined) {
        dayPL += holding.quantity * stock.change;
      }
    });
    return roundMoney(dayPL);
  }, [holdings, stockPriceMap]);

  const todayGainLossPercent = useMemo(() => {
    const previousPortfolioTotal = totalPortfolioValue - todayGainLoss;
    if (previousPortfolioTotal <= 0) return 0;
    return roundMoney((todayGainLoss / previousPortfolioTotal) * 100);
  }, [todayGainLoss, totalPortfolioValue]);

  // Holdings performance analytics (Best & Worst performers)
  const holdingsPerformanceList = useMemo<HoldingPerformance[]>(() => {
    const list: HoldingPerformance[] = [];
    const totalEqVal = portfolioHoldingsValue > 0 ? portfolioHoldingsValue : 1;

    Object.values(holdings).forEach((holding) => {
      const stock = stockPriceMap[holding.symbol];
      const mVal = stock && stock.price > 0 ? holding.quantity * stock.price : holding.totalInvested;
      const unPL = roundMoney(mVal - holding.totalInvested);
      const unPLPct = holding.totalInvested > 0 ? roundMoney((unPL / holding.totalInvested) * 100) : 0;
      const allocPct = roundMoney((mVal / totalEqVal) * 100);

      list.push({
        holding,
        stock,
        marketValue: mVal,
        unrealizedPL: unPL,
        unrealizedPLPercent: unPLPct,
        allocationPercent: allocPct,
      });
    });

    return list.sort((a, b) => b.unrealizedPLPercent - a.unrealizedPLPercent);
  }, [holdings, stockPriceMap, portfolioHoldingsValue]);

  const bestHolding = useMemo(() => {
    return holdingsPerformanceList.length > 0 ? holdingsPerformanceList[0] : null;
  }, [holdingsPerformanceList]);

  const worstHolding = useMemo(() => {
    return holdingsPerformanceList.length > 1
      ? holdingsPerformanceList[holdingsPerformanceList.length - 1]
      : null;
  }, [holdingsPerformanceList]);

  // Periodic Portfolio Snapshot recorder (once per session/day into Firestore)
  useEffect(() => {
    if (!currentUser || portfolioHoldingsValue === 0) return;

    const timer = setTimeout(async () => {
      try {
        const snapshotId = `snap-${Date.now()}`;
        const snapDocRef = doc(db, 'users', currentUser.uid, 'portfolioSnapshots', snapshotId);
        await setDoc(snapDocRef, {
          userId: currentUser.uid,
          timestamp: Date.now(),
          dateFormatted: new Date().toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          cash: virtualCash,
          holdingsMarketValue: portfolioHoldingsValue,
          totalPortfolioValue,
          totalProfitLoss,
          totalProfitLossPercent,
          totalUnrealizedPL,
          totalRealizedPL,
        });
      } catch (e) {
        // quiet snapshot save
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [currentUser, virtualCash, portfolioHoldingsValue, totalPortfolioValue, totalProfitLoss, totalProfitLossPercent, totalUnrealizedPL, totalRealizedPL]);

  // Dynamic Achievements
  const achievements = useMemo(() => {
    const holdingSymbols = Object.keys(holdings);
    const sectorsHeld = new Set<string>();
    holdingSymbols.forEach((sym) => {
      const stock = stockPriceMap[sym];
      if (stock) sectorsHeld.add(stock.sector);
    });

    return INITIAL_ACHIEVEMENTS.map((ach) => {
      let progress = 0;
      let unlocked = Boolean(unlockedAchievements[ach.id]);

      if (ach.id === 'ach-first-trade') {
        progress = Math.min(1, transactions.length);
        if (transactions.length >= 1) unlocked = true;
      } else if (ach.id === 'ach-watchlist') {
        progress = Math.min(3, watchlist.length);
        if (watchlist.length >= 3) unlocked = true;
      } else if (ach.id === 'ach-diversified') {
        progress = Math.min(3, sectorsHeld.size);
        if (sectorsHeld.size >= 3) unlocked = true;
      } else if (ach.id === 'ach-learner') {
        progress = Math.min(1, completedLessons.length);
        if (completedLessons.length >= 1) unlocked = true;
      } else if (ach.id === 'ach-scholar') {
        progress = Math.min(5, completedLessons.length);
        if (completedLessons.length >= 5) unlocked = true;
      } else if (ach.id === 'ach-green') {
        progress = totalProfitLoss > 0 ? 1 : 0;
        if (totalProfitLoss > 0) unlocked = true;
      }

      return {
        ...ach,
        progress,
        unlocked,
      };
    });
  }, [holdings, stockPriceMap, transactions, watchlist, completedLessons, totalProfitLoss, unlockedAchievements]);

  // Price Alerts trigger check
  useEffect(() => {
    if (priceAlerts.length === 0 || stocks.length === 0) return;

    const currentPrices: Record<string, number> = {};
    stocks.forEach((s) => {
      if (s.price > 0) currentPrices[s.symbol] = s.price;
    });

    let triggeredAny = false;
    const updated = priceAlerts.map((alert) => {
      if (alert.status !== 'ACTIVE') return alert;
      const currentPrice = currentPrices[alert.symbol];
      if (currentPrice === undefined) return alert;

      let triggered = false;
      if (alert.condition === 'ABOVE' && currentPrice >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'BELOW' && currentPrice <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        triggeredAny = true;
        const conditionText = alert.condition === 'ABOVE' ? 'reached target above' : 'dropped to target below';
        showToast({
          type: 'info',
          title: `🔔 Price Alert: ${alert.symbol}`,
          message: `${alert.symbol} ${conditionText} ${formatINR(alert.targetPrice)} (Real Market Price: ${formatINR(currentPrice)}).`,
        });

        return {
          ...alert,
          status: 'TRIGGERED' as const,
          triggeredAt: Date.now(),
          triggeredPrice: currentPrice,
        };
      }

      return alert;
    });

    if (triggeredAny) {
      setPriceAlerts(updated);
    }
  }, [stocks, priceAlerts, showToast]);

  // Alert management handlers
  const createPriceAlert = useCallback(
    (alertData: Omit<PriceAlert, 'id' | 'createdAt' | 'status'>) => {
      if (alertData.targetPrice <= 0 || isNaN(alertData.targetPrice)) {
        return { success: false, message: 'Target price must be greater than zero.' };
      }

      const newAlert: PriceAlert = {
        ...alertData,
        id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: Date.now(),
        status: 'ACTIVE',
      };

      setPriceAlerts((prev) => [newAlert, ...prev]);

      showToast({
        type: 'success',
        title: `🔔 Price Alert Set for ${alertData.symbol}`,
        message: `Alert set at ${formatINR(alertData.targetPrice)} (${alertData.condition === 'ABOVE' ? '≥' : '≤'}).`,
      });

      return {
        success: true,
        message: `Alert created for ${alertData.symbol} at ${formatINR(alertData.targetPrice)}`,
      };
    },
    [showToast]
  );

  const deletePriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const dismissPriceAlert = useCallback((id: string) => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'DISMISSED' as const } : a))
    );
  }, []);

  const dismissAllTriggeredAlerts = useCallback(() => {
    setPriceAlerts((prev) =>
      prev.map((a) => (a.status === 'TRIGGERED' ? { ...a, status: 'DISMISSED' as const } : a))
    );
  }, []);

  const activeAlerts = useMemo(() => priceAlerts.filter((a) => a.status === 'ACTIVE'), [priceAlerts]);
  const triggeredAlerts = useMemo(() => priceAlerts.filter((a) => a.status === 'TRIGGERED'), [priceAlerts]);
  const unreadTriggeredCount = triggeredAlerts.length;

  // Buy Order Execution: Atomic Firestore write when logged in, or local state when guest
  const buyStock = useCallback(
    async (symbol: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return { success: false, message: 'Quantity must be a positive whole number.' };
      }

      const stock = stockPriceMap[symbol];
      if (!stock || !stock.price || stock.price <= 0) {
        return {
          success: false,
          message: `Cannot execute simulated trade for ${symbol}: Valid real market price is unavailable from provider.`,
        };
      }

      const totalCost = roundMoney(quantity * stock.price);

      if (totalCost > virtualCash) {
        return {
          success: false,
          message: `Insufficient virtual cash. Needed: ${formatINR(totalCost)}, Available: ${formatINR(virtualCash)}`,
        };
      }

      const newCash = roundMoney(virtualCash - totalCost);
      const existingHolding = holdings[symbol];
      const newQty = (existingHolding ? existingHolding.quantity : 0) + quantity;
      const newInvested = roundMoney((existingHolding ? existingHolding.totalInvested : 0) + totalCost);
      const newAvg = roundMoney(newInvested / newQty);

      const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const txData: Transaction = {
        id: txId,
        symbol,
        stockName: stock.name,
        exchange: stock.exchange || 'NSE',
        type: 'BUY',
        quantity,
        price: stock.price,
        totalAmount: totalCost,
        cashAfterTrade: newCash,
        timestamp: Date.now(),
        dateFormatted: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        simulated: true,
      };

      if (currentUser) {
        try {
          const batch = writeBatch(db);
          const uid = currentUser.uid;

          // 1. Update Portfolio Cash
          const portfolioRef = doc(db, 'users', uid, 'portfolio', 'current');
          batch.set(portfolioRef, {
            userId: uid,
            startingBalance: initialStartingBalance,
            cashBalance: newCash,
            realizedPL,
            initialized: true,
            updatedAt: new Date().toISOString(),
          });

          // 2. Set / Update Holding
          const holdingRef = doc(db, 'users', uid, 'holdings', symbol);
          batch.set(holdingRef, {
            userId: uid,
            symbol,
            companyName: stock.name,
            exchange: stock.exchange || 'NSE',
            quantity: newQty,
            avgPrice: newAvg,
            totalInvested: newInvested,
            updatedAt: new Date().toISOString(),
          });

          // 3. Record Transaction
          const txRef = doc(db, 'users', uid, 'transactions', txId);
          batch.set(txRef, {
            ...txData,
            userId: uid,
          });

          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/holdings/${symbol}`);
        }
      } else {
        // Guest mode state updates
        setVirtualCash(newCash);
        setHoldings((prev) => ({
          ...prev,
          [symbol]: {
            symbol,
            companyName: stock.name,
            exchange: stock.exchange || 'NSE',
            quantity: newQty,
            avgPrice: newAvg,
            totalInvested: newInvested,
            updatedAt: new Date().toISOString(),
          },
        }));
        setTransactions((prev) => [txData, ...prev]);
      }

      showToast({
        type: 'success',
        title: 'Simulated Order Filled',
        message: `Bought ${quantity} shares of ${symbol} at real market price ${formatINR(stock.price)} (Total: ${formatINR(totalCost)})`,
      });

      return {
        success: true,
        message: `Simulated order executed: ${quantity} shares of ${symbol} bought at ${formatINR(stock.price)}.`,
      };
    },
    [currentUser, virtualCash, holdings, stockPriceMap, initialStartingBalance, realizedPL, showToast]
  );

  // Sell Order Execution: Atomic Firestore write when logged in, or local state when guest
  const sellStock = useCallback(
    async (symbol: string, quantity: number) => {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return { success: false, message: 'Quantity must be a positive whole number.' };
      }

      const holding = holdings[symbol];
      if (!holding || holding.quantity < quantity) {
        const available = holding ? holding.quantity : 0;
        return {
          success: false,
          message: `Insufficient shares. You only own ${available} shares of ${symbol}.`,
        };
      }

      const stock = stockPriceMap[symbol];
      if (!stock || !stock.price || stock.price <= 0) {
        return {
          success: false,
          message: `Cannot execute simulated trade for ${symbol}: Valid real market price is unavailable from provider.`,
        };
      }

      const totalProceeds = roundMoney(quantity * stock.price);
      const costOfSharesSold = roundMoney(holding.avgPrice * quantity);
      const tradePL = roundMoney(totalProceeds - costOfSharesSold);

      const newCash = roundMoney(virtualCash + totalProceeds);
      const newRealizedPL = roundMoney(realizedPL + tradePL);
      const remainingQty = holding.quantity - quantity;
      const remainingInvested = roundMoney(holding.avgPrice * remainingQty);

      const txId = `tx-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const txData: Transaction = {
        id: txId,
        symbol,
        stockName: stock.name,
        exchange: stock.exchange || 'NSE',
        type: 'SELL',
        quantity,
        price: stock.price,
        totalAmount: totalProceeds,
        cashAfterTrade: newCash,
        realizedPL: tradePL,
        timestamp: Date.now(),
        dateFormatted: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        simulated: true,
      };

      if (currentUser) {
        try {
          const batch = writeBatch(db);
          const uid = currentUser.uid;

          // 1. Update Portfolio Cash & Realized P&L
          const portfolioRef = doc(db, 'users', uid, 'portfolio', 'current');
          batch.set(portfolioRef, {
            userId: uid,
            startingBalance: initialStartingBalance,
            cashBalance: newCash,
            realizedPL: newRealizedPL,
            initialized: true,
            updatedAt: new Date().toISOString(),
          });

          // 2. Delete holding if 0, or update remaining
          const holdingRef = doc(db, 'users', uid, 'holdings', symbol);
          if (remainingQty === 0) {
            batch.delete(holdingRef);
          } else {
            batch.set(holdingRef, {
              userId: uid,
              symbol,
              companyName: stock.name,
              exchange: stock.exchange || 'NSE',
              quantity: remainingQty,
              avgPrice: holding.avgPrice,
              totalInvested: remainingInvested,
              updatedAt: new Date().toISOString(),
            });
          }

          // 3. Record Transaction
          const txRef = doc(db, 'users', uid, 'transactions', txId);
          batch.set(txRef, {
            ...txData,
            userId: uid,
          });

          await batch.commit();
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/holdings/${symbol}`);
        }
      } else {
        // Guest mode state updates
        setVirtualCash(newCash);
        setRealizedPL(newRealizedPL);
        setHoldings((prev) => {
          const copy = { ...prev };
          if (remainingQty === 0) {
            delete copy[symbol];
          } else {
            copy[symbol] = {
              ...holding,
              quantity: remainingQty,
              totalInvested: remainingInvested,
              updatedAt: new Date().toISOString(),
            };
          }
          return copy;
        });
        setTransactions((prev) => [txData, ...prev]);
      }

      showToast({
        type: 'success',
        title: 'Simulated Order Filled',
        message: `Sold ${quantity} shares of ${symbol} for ${formatINR(totalProceeds)} (${tradePL >= 0 ? '+' : ''}${formatINR(tradePL)} Realized P&L).`,
      });

      return {
        success: true,
        message: `Simulated order executed: ${quantity} shares of ${symbol} sold for ${formatINR(totalProceeds)}.`,
      };
    },
    [currentUser, virtualCash, realizedPL, holdings, stockPriceMap, initialStartingBalance, showToast]
  );

  // Watchlist Toggle
  const toggleWatchlist = useCallback(
    async (symbol: string) => {
      const isCurrentlyIn = watchlist.includes(symbol);
      const stock = stockPriceMap[symbol];

      if (currentUser) {
        try {
          const watchDocRef = doc(db, 'users', currentUser.uid, 'watchlist', symbol);
          if (isCurrentlyIn) {
            await deleteDoc(watchDocRef);
            showToast({
              type: 'info',
              title: 'Removed from Watchlist',
              message: `${symbol} removed from your pinned stocks.`,
            });
            return false;
          } else {
            await setDoc(watchDocRef, {
              symbol,
              exchange: stock?.exchange || 'NSE',
              userId: currentUser.uid,
              addedAt: Date.now(),
            });
            showToast({
              type: 'success',
              title: 'Added to Watchlist',
              message: `${symbol} pinned to your watchlist.`,
            });
            return true;
          }
        } catch (err) {
          handleFirestoreError(err, isCurrentlyIn ? OperationType.DELETE : OperationType.WRITE, `users/${currentUser.uid}/watchlist/${symbol}`);
        }
      } else {
        let added = false;
        setWatchlist((prev) => {
          if (prev.includes(symbol)) {
            return prev.filter((s) => s !== symbol);
          } else {
            added = true;
            return [...prev, symbol];
          }
        });
        showToast({
          type: isCurrentlyIn ? 'info' : 'success',
          title: isCurrentlyIn ? 'Removed from Watchlist' : 'Added to Watchlist',
          message: `${symbol} ${isCurrentlyIn ? 'removed from' : 'added to'} watchlist.`,
        });
        return !isCurrentlyIn;
      }
    },
    [currentUser, watchlist, stockPriceMap, showToast]
  );

  const isInWatchlist = useCallback((symbol: string) => watchlist.includes(symbol), [watchlist]);

  // Reset Account (Restore cash to initial balance and clear holdings)
  const resetAccount = useCallback(async () => {
    if (currentUser) {
      try {
        const batch = writeBatch(db);
        const uid = currentUser.uid;

        // Reset portfolio doc
        const portfolioRef = doc(db, 'users', uid, 'portfolio', 'current');
        batch.set(portfolioRef, {
          userId: uid,
          startingBalance: CLOUD_STARTING_BALANCE,
          cashBalance: CLOUD_STARTING_BALANCE,
          realizedPL: 0,
          initialized: true,
          updatedAt: new Date().toISOString(),
        });

        // Delete all holdings
        Object.keys(holdings).forEach((sym) => {
          batch.delete(doc(db, 'users', uid, 'holdings', sym));
        });

        await batch.commit();

        showToast({
          type: 'success',
          title: 'Cloud Account Reset',
          message: `Portfolio restored to ${formatINR(CLOUD_STARTING_BALANCE)} virtual cash. Active holdings cleared.`,
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/portfolio/current`);
      }
    } else {
      setStartingBalance(CLOUD_STARTING_BALANCE);
      setVirtualCash(CLOUD_STARTING_BALANCE);
      setRealizedPL(0);
      setHoldings({});
      setTransactions([]);
      showToast({
        type: 'success',
        title: 'Demo Simulator Reset',
        message: `Simulator restored to ${formatINR(CLOUD_STARTING_BALANCE)} virtual cash.`,
      });
    }
  }, [currentUser, holdings, showToast]);

  // Lessons
  const [lessons] = useState<Lesson[]>(INITIAL_LESSONS);
  const completeLessonQuiz = useCallback(
    (lessonId: string, score: number) => {
      setCompletedLessons((prev) => (prev.includes(lessonId) ? prev : [...prev, lessonId]));
      setQuizScores((prev) => ({ ...prev, [lessonId]: score }));
      showToast({
        type: 'success',
        title: 'Lesson Completed!',
        message: `Scored ${score}% on lesson quiz!`,
      });
    },
    [showToast]
  );

  // News
  const toggleSaveNews = useCallback((newsId: string) => {
    setSavedNewsIds((prev) =>
      prev.includes(newsId) ? prev.filter((id) => id !== newsId) : [...prev, newsId]
    );
  }, []);

  const isNewsSaved = useCallback((newsId: string) => savedNewsIds.includes(newsId), [savedNewsIds]);

  const refreshNewsFeed = useCallback(() => {
    showToast({
      type: 'info',
      title: 'News Feed Synced',
      message: 'Latest Indian business news and market developments updated.',
    });
  }, [showToast]);

  // Insights
  const saveInsight = useCallback(
    (insight: Omit<SavedInsight, 'id' | 'timestamp'>) => {
      const newInsight: SavedInsight = {
        ...insight,
        id: `insight-${Date.now()}`,
        timestamp: Date.now(),
      };
      setSavedInsights((prev) => [newInsight, ...prev]);
      showToast({
        type: 'success',
        title: 'Insight Saved',
        message: 'Saved to your personal mentor insights notebook.',
      });
    },
    [showToast]
  );

  const deleteSavedInsight = useCallback((id: string) => {
    setSavedInsights((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const askMentor = useCallback((question: string) => {
    setPendingMentorQuestion(question);
    setCurrentTab('mentor');
  }, []);

  const clearPendingMentorQuestion = useCallback(() => {
    setPendingMentorQuestion(null);
  }, []);

  const value = {
    currentUser,
    isAuthLoading,
    authError,
    isCloudSynced: Boolean(currentUser),
    loginWithGoogle,
    logout,
    isAuthModalOpen,
    setIsAuthModalOpen,
    hasPendingDemoData,
    migrateDemoToCloud,
    dismissDemoMigration,

    stocks,
    selectedStockSymbol,
    setSelectedStockSymbol,
    selectedStock,
    isLoadingMarketData,
    marketDataError,
    lastPricesUpdated,
    marketSession,
    corporateActions,
    refreshRealMarketPrices: () => loadMarketQuotes(true),

    userProfile,
    updateUserProfile,
    virtualCash,
    holdings,
    transactions,
    watchlist,
    portfolioSnapshots,

    portfolioHoldingsValue,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    initialStartingBalance,
    todayGainLoss,
    todayGainLossPercent,
    bestHolding,
    worstHolding,
    holdingsPerformanceList,

    buyStock,
    sellStock,
    toggleWatchlist,
    isInWatchlist,
    resetAccount,

    lessons,
    completedLessons,
    quizScores,
    completeLessonQuiz,

    achievements,

    priceAlerts,
    createPriceAlert,
    deletePriceAlert,
    dismissPriceAlert,
    dismissAllTriggeredAlerts,
    activeAlerts,
    triggeredAlerts,
    unreadTriggeredCount,

    toasts,
    dismissToast,
    showToast,

    newsArticles,
    savedNewsIds,
    toggleSaveNews,
    isNewsSaved,
    refreshNewsFeed,

    savedInsights,
    saveInsight,
    deleteSavedInsight,
    pendingMentorQuestion,
    askMentor,
    clearPendingMentorQuestion,

    currentTab,
    setCurrentTab,
  };

  return <InvestContext.Provider value={value}>{children}</InvestContext.Provider>;
};

export const useInvest = () => {
  const context = useContext(InvestContext);
  if (!context) {
    throw new Error('useInvest must be used within an InvestProvider');
  }
  return context;
};
