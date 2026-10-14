import { Lesson } from '../types';

export const INITIAL_LESSONS: Lesson[] = [
  {
    id: 'lesson-1',
    title: 'What is the Stock Market?',
    subtitle: 'Understand how public companies raise capital and how ownership changes hands',
    readTime: '4 min',
    category: 'Market Basics',
    summary: 'The stock market is an organized marketplace connecting businesses needing capital with investors seeking long-term wealth creation.',
    keyTakeaways: [
      'Companies issue shares to raise money for expansion, hiring, and research.',
      'Primary market is where new shares are born (IPOs); secondary market is where existing shares trade between investors.',
      'A Demat account holds your shares digitally, while a Trading account executes the transactions.',
    ],
    sections: [
      {
        title: '1. The Supermarket for Business Equity',
        content: 'Imagine a vibrant marketplace, but instead of buying groceries or gadgets, people buy fractions of real businesses. When a company needs capital to expand factories, build technology, or enter new countries, it can either borrow money from banks or sell small fractional slices of ownership known as shares to the general public.',
        tip: 'Did you know? In India, shares are held electronically in depository accounts (CDSL or NSDL), eliminating physical share paper certificates.',
      },
      {
        title: '2. Primary vs. Secondary Market',
        content: 'When a company offers shares to the public for the very first time, it conducts an Initial Public Offering (IPO). This transaction occurs in the Primary Market, and the money goes directly to the company. Once listed, when investors buy or sell shares between each other on an exchange, this occurs in the Secondary Market.',
      },
      {
        title: '3. Why Do People Invest in the Stock Market?',
        content: 'Over decades, businesses grow profits. By owning equity, investors participate in two wealth-generating streams: Capital Appreciation (share price increases over time) and Dividends (share of company net profits paid directly to shareholders in cash).',
      },
    ],
    quiz: [
      {
        id: 'q1-1',
        question: 'Where do existing investors trade shares among each other on a day-to-day basis?',
        options: ['The Primary Market', 'The Secondary Market', 'The Commodity Vault', 'The Reserve Bank Repo Window'],
        correctIndex: 1,
        explanation: 'The secondary market (NSE/BSE) is where day-to-day trading takes place between individual and institutional investors.',
      },
      {
        id: 'q1-2',
        question: 'What is the primary function of an Initial Public Offering (IPO)?',
        options: ['To repay investor personal loans', 'For a company to raise fresh capital by selling shares to the public', 'To fix the stock price for 10 years', 'To convert equity into physical gold'],
        correctIndex: 1,
        explanation: 'An IPO is the first sale of stock by a private company to the public to raise growth funds.',
      },
      {
        id: 'q1-3',
        question: 'Which account holds your shares electronically in India?',
        options: ['Savings Account', 'Current Account', 'Demat Account', 'Fixed Deposit Account'],
        correctIndex: 2,
        explanation: 'A Demat (Dematerialized) account securely stores your financial securities in digital form with CDSL or NSDL.',
      },
    ],
  },
  {
    id: 'lesson-2',
    title: 'Stocks & Shares Explained',
    subtitle: 'What it actually means to be a shareholder in an Indian company',
    readTime: '5 min',
    category: 'Fundamentals',
    summary: 'Buying a single share makes you a legal part-owner of the company, entitled to corporate voting rights and proportional profits.',
    keyTakeaways: [
      'A share represents fractional legal ownership in a business.',
      'Market capitalization = Total outstanding shares × Current market price.',
      'Stock price fluctuations in the short run reflect supply and demand, but track business fundamentals in the long run.',
    ],
    sections: [
      {
        title: '1. What Does Owning a Share Mean?',
        content: 'If you buy 10 shares of Tata Motors, you own a tiny fractional slice of its factories, electric vehicles, technology patents, and worldwide operations. You are not a customer; you are an owner. As the business sells more vehicles and increases its earnings, your slice becomes more valuable.',
      },
      {
        title: '2. Market Capitalization: Measuring Company Size',
        content: 'Companies are classified by their market capitalization (Market Cap): Large-cap companies (top 100 Indian companies like Reliance, TCS, HDFC Bank) offer stability; Mid-cap companies (ranks 101-250) offer high growth potential with moderate risk; Small-cap companies (rank 251+) offer explosive potential but higher volatility.',
        tip: 'Formula: Market Cap = Total Number of Shares Issued × Current Price per Share.',
      },
      {
        title: '3. Dividends vs. Growth Reinvestment',
        content: 'Some mature companies (like ITC or TCS) pay out a substantial portion of their annual profits to shareholders as dividends. Other high-growth companies (like Zomato) reinvest almost all profits back into hiring, R&D, and expansion rather than paying dividends.',
      },
    ],
    quiz: [
      {
        id: 'q2-1',
        question: 'What does Market Capitalization represent?',
        options: ['The total bank debt of a company', 'Total shares multiplied by current share price', 'The annual sales revenue of a firm', 'The maximum salary of company executives'],
        correctIndex: 1,
        explanation: 'Market Cap is calculated as total outstanding shares multiplied by the current share price.',
      },
      {
        id: 'q2-2',
        question: 'What is a dividend?',
        options: ['A penalty paid to stock exchanges', 'A portion of company profits distributed to shareholders', 'The fee paid to your stockbroker', 'A government capital gains tax'],
        correctIndex: 1,
        explanation: 'Dividends are payments made by corporations to share profits directly with their shareholders.',
      },
    ],
  },
  {
    id: 'lesson-3',
    title: 'NSE, BSE & Market Indices (Nifty 50 & Sensex)',
    subtitle: 'Decoding the economic barometers of the Indian stock market',
    readTime: '4 min',
    category: 'Market Basics',
    summary: 'The NSE and BSE are India\'s primary exchanges, tracked by benchmark indices Nifty 50 and Sensex.',
    keyTakeaways: [
      'BSE (Bombay Stock Exchange) was founded in 1875; NSE (National Stock Exchange) pioneered digital screen trading in 1994.',
      'Sensex tracks the top 30 established companies on the BSE.',
      'Nifty 50 tracks the top 50 diversified bluechip companies on the NSE representing ~60% of India\'s market capitalization.',
    ],
    sections: [
      {
        title: '1. The Two Pillars: NSE and BSE',
        content: 'India is home to two major stock exchanges: The Bombay Stock Exchange (BSE), Asia\'s oldest exchange established in 1875 on Dalal Street, and the National Stock Exchange (NSE), incorporated in 1992 which introduced seamless electronic screen-based trading and is the largest exchange in India by trading volume.',
      },
      {
        title: '2. What is an Index?',
        content: 'With thousands of listed companies, nobody can check every stock each morning. An index acts as a representative basket or thermometer of the overall market. When news anchors say "The Indian market rose 1% today", they are usually referring to the Nifty 50 or Sensex.',
        tip: 'Both Nifty 50 and Sensex use free-float market capitalization weighting, meaning larger companies have a higher weight in the index calculation.',
      },
    ],
    quiz: [
      {
        id: 'q3-1',
        question: 'How many companies comprise the flagship NIFTY 50 index?',
        options: ['30', '50', '100', '500'],
        correctIndex: 1,
        explanation: 'The Nifty 50 index tracks 50 of the largest and most liquid Indian bluechip companies listed on the NSE.',
      },
      {
        id: 'q3-2',
        question: 'Which index is the benchmark for the Bombay Stock Exchange (BSE)?',
        options: ['Bank Nifty', 'Sensex', 'Nasdaq', 'Dow Jones'],
        correctIndex: 1,
        explanation: 'The BSE Sensex (Sensitive Index) tracks 30 large, financially sound companies on the BSE.',
      },
    ],
  },
  {
    id: 'lesson-4',
    title: 'Mutual Funds and ETFs',
    subtitle: 'Pooled investing for instant diversification without picking individual stocks',
    readTime: '6 min',
    category: 'Vehicles & Instruments',
    summary: 'Mutual Funds and Exchange Traded Funds (ETFs) allow beginner investors to own hundreds of stocks through a single instrument.',
    keyTakeaways: [
      'Mutual funds pool money from millions of investors to invest in a diversified portfolio.',
      'ETFs trade on stock exchanges throughout the day like individual shares.',
      'Systematic Investment Plans (SIPs) enforce disciplined investing regardless of market highs or lows.',
    ],
    sections: [
      {
        title: '1. What is a Mutual Fund?',
        content: 'A mutual fund collects money from thousands of investors and hires professional fund managers to build a portfolio of stocks, bonds, or government securities. You own "units" of the fund, and your value increases as the underlying holdings grow.',
      },
      {
        title: '2. The Difference Between Mutual Funds and ETFs',
        content: 'Mutual funds calculate their Net Asset Value (NAV) once a day at market close. Exchange Traded Funds (ETFs) track an index and trade live on the stock exchange throughout market hours (9:15 AM to 3:30 PM IST), allowing you to buy or sell instantaneously at live market prices.',
      },
      {
        title: '3. Systematic Investment Plan (SIP)',
        content: 'Instead of trying to time the market with a large lump sum, a SIP automatically invests a fixed amount (such as ₹1,000 every month). When prices drop, your ₹1,000 buys more units; when prices rise, your accumulated units grow. This is called Rupee Cost Averaging.',
        tip: 'Rupee Cost Averaging takes the emotion out of investing and prevents panic buying at market tops.',
      },
    ],
    quiz: [
      {
        id: 'q4-1',
        question: 'What is the key practical difference in buying an ETF compared to a regular Mutual Fund?',
        options: ['ETFs cannot hold stocks', 'ETFs trade live throughout the day on the stock exchange', 'Mutual funds can only be purchased once a year', 'ETFs require zero Demat account'],
        correctIndex: 1,
        explanation: 'ETFs trade on stock exchanges just like individual stocks with real-time price updates.',
      },
      {
        id: 'q4-2',
        question: 'What does SIP stand for in Indian investing?',
        options: ['Single Investment Portfolio', 'Systematic Investment Plan', 'State Insurance Plan', 'Stock Index Purchase'],
        correctIndex: 1,
        explanation: 'SIP stands for Systematic Investment Plan, which automates periodic investments.',
      },
    ],
  },
  {
    id: 'lesson-5',
    title: 'Index Funds vs. Active Stock Picking',
    subtitle: 'Why low-cost passive index funds beat most professional fund managers',
    readTime: '5 min',
    category: 'Vehicles & Instruments',
    summary: 'Index funds mirror the entire market rather than trying to outsmart it, offering low expense ratios and dependable returns.',
    keyTakeaways: [
      'Active funds try to beat the market; passive index funds simply mirror market indices.',
      'Over a 10-15 year horizon, over 70% of active mutual funds fail to beat their benchmark index after fees.',
      'Low expense ratios (0.1% vs 1.5%) save hundreds of thousands of rupees over compounding decades.',
    ],
    sections: [
      {
        title: '1. The Cost of Active Management',
        content: 'Active mutual fund managers analyze balance sheets, conduct company visits, and trade frequently to beat the Nifty 50. In return, they charge an Expense Ratio of 1% to 2% annually. Index funds simply hold all 50 stocks in the exact proportion of the Nifty 50 with expense ratios as low as 0.05% to 0.2%.',
      },
      {
        title: '2. The Warren Buffett Challenge',
        content: 'Legendary investor Warren Buffett famously bet $1 million that an unmanaged S&P 500 index fund would beat a collection of top hedge fund managers over a 10-year period. Buffett won handily, proving that high fees drag down long-term returns.',
      },
    ],
    quiz: [
      {
        id: 'q5-1',
        question: 'What is the primary objective of a passive index fund?',
        options: ['To beat the market by 20% every year', 'To replicate the performance and composition of a specific market index', 'To pick only penny stocks', 'To short sell falling companies'],
        correctIndex: 1,
        explanation: 'Passive index funds seek to mirror an index like Nifty 50 or Sensex with minimal management fees.',
      },
    ],
  },
  {
    id: 'lesson-6',
    title: 'Understanding Risk vs. Return',
    subtitle: 'The golden rule of finance: No excess reward without proportionate risk',
    readTime: '5 min',
    category: 'Risk & Strategy',
    summary: 'Higher potential returns always come with greater volatility and potential drawdowns. Understanding your risk tolerance is essential.',
    keyTakeaways: [
      'Risk is not just the chance of losing money; it is also the volatility you must endure.',
      'Inflation is a hidden risk: leaving cash in a 3% savings account guarantees loss of purchasing power if inflation is 6%.',
      'Never invest money in stocks that you need in the next 1 to 3 years.',
    ],
    sections: [
      {
        title: '1. The Risk Spectrum',
        content: 'From lowest risk to highest risk: Government Treasury Bills (G-Secs) < Fixed Deposits (FD) < Large-Cap Bluechip Stocks < Mid/Small-Cap Stocks < Futures & Options (F&O). If someone promises you "high returns with zero risk", it is almost certainly a scam or unsustainable scheme.',
      },
      {
        title: '2. Volatility vs. Permanent Loss of Capital',
        content: 'A temporary 15% drop during a market correction is normal volatility, not permanent loss, as long as you own financially healthy businesses and do not panic-sell at the bottom. Permanent loss happens when a bankrupt company dissolves or when traders get wiped out on leveraged derivatives.',
        tip: 'Emergency Fund rule: Keep 3 to 6 months of living expenses in liquid savings or FD before investing heavily in equities.',
      },
    ],
    quiz: [
      {
        id: 'q6-1',
        question: 'If inflation in India is 6% per year and your bank savings account earns 3%, what is happening to your wealth?',
        options: ['You are gaining 3% real wealth', 'Your real purchasing power is decreasing by ~3% per year', 'You are completely immune to inflation', 'Your money doubles every 10 years'],
        correctIndex: 1,
        explanation: 'When inflation exceeds your interest rate, your real purchasing power declines over time.',
      },
    ],
  },
  {
    id: 'lesson-7',
    title: 'Diversification & Asset Allocation',
    subtitle: 'The only true free lunch in finance: Don\'t put all your eggs in one basket',
    readTime: '4 min',
    category: 'Risk & Strategy',
    summary: 'Spreading investments across different sectors and asset classes reduces overall portfolio volatility without sacrificing long-term returns.',
    keyTakeaways: [
      'Sector diversification protects you when one specific industry faces cyclical downturns.',
      'Asset allocation divides your capital among equities, debt, gold, and cash.',
      'Holding 15-20 stocks across 5-6 uncorrelated industries provides optimal company-specific risk reduction.',
    ],
    sections: [
      {
        title: '1. Why One Stock is Dangerous',
        content: 'Even great companies can suffer scandals, regulatory changes, or technological disruption. If 100% of your portfolio is in a single IT stock and tech hiring slows down, your entire net worth takes a hit. If you hold 10 stocks across Banking, Energy, Pharma, FMCG, and IT, the impact of one stock\'s bad quarter is buffered by the others.',
      },
      {
        title: '2. Sector Correlation in the Indian Economy',
        content: 'Notice how when oil prices rise, consumer paints and aviation may face margin pressure, but energy explorers benefit. Diversification harnesses these offsets so your total portfolio stays resilient.',
      },
    ],
    quiz: [
      {
        id: 'q7-1',
        question: 'Why is portfolio diversification often called the "only free lunch" in investing?',
        options: ['Stockbrokers give you free snacks', 'It lowers your portfolio risk without necessarily sacrificing expected returns', 'You do not have to pay capital gains tax', 'It guarantees 100% profits every day'],
        correctIndex: 1,
        explanation: 'Diversification reduces unsystematic (company-specific) risk without reducing the portfolio\'s expected overall return.',
      },
    ],
  },
  {
    id: 'lesson-8',
    title: 'The Magic of Long-Term Compounding',
    subtitle: 'Albert Einstein called it the 8th wonder of the world: Time is the investor\'s greatest ally',
    readTime: '5 min',
    category: 'Fundamentals',
    summary: 'Compounding occurs when your investment earnings begin earning their own earnings, creating an exponential growth curve over decades.',
    keyTakeaways: [
      'Compounding formula: A = P(1 + r/n)^(nt). Small early additions matter more than large late ones.',
      'The "Rule of 72": Divide 72 by your expected annual return to find how many years it takes your money to double.',
      'Starting at age 20 with ₹5,000/month generates vastly more wealth than starting at age 35 with ₹15,000/month.',
    ],
    sections: [
      {
        title: '1. The Snowball Effect',
        content: 'In year 1, an investment of ₹1,00,000 at 12% annual return makes ₹12,000. In year 2, you earn 12% on ₹1,12,000 (making ₹13,440). By year 20, that initial ₹1,00,000 turns into ~₹9,64,000 without adding another single rupee! Time does the heavy lifting.',
      },
      {
        title: '2. The Rule of 72 Shortcut',
        content: 'Want to know how fast your money doubles? Divide 72 by the annual return percentage. At a 12% return (historical Nifty long-term average), your money doubles every 6 years (72 ÷ 12 = 6). In a 6% FD, it takes 12 years to double!',
        tip: 'The most important factor in compounding is not having the highest return in one year, but staying invested continuously for 15+ years.',
      },
    ],
    quiz: [
      {
        id: 'q8-1',
        question: 'According to the Rule of 72, roughly how many years will it take an investment to double at a 12% annual return rate?',
        options: ['12 years', '6 years', '24 years', '3 years'],
        correctIndex: 1,
        explanation: '72 divided by 12 = 6 years to double your capital.',
      },
      {
        id: 'q8-2',
        question: 'What is the most critical ingredient required for compounding to create exponential wealth?',
        options: ['Trading 20 times every day', 'Time and consistency over many years', 'Borrowing maximum margin loans', 'Predicting the exact tomorrow\'s news'],
        correctIndex: 1,
        explanation: 'Time allows the reinvested earnings to compound exponentially over 10, 20, and 30 years.',
      },
    ],
  },
  {
    id: 'lesson-9',
    title: 'Fundamental vs. Technical Analysis',
    subtitle: 'Evaluating business health vs. studying price action and market psychology',
    readTime: '6 min',
    category: 'Market Basics',
    summary: 'Learn the two primary schools of market analysis: evaluating company balance sheets vs reading chart patterns and volume.',
    keyTakeaways: [
      'Fundamental Analysis evaluates business revenue, profit margins, P/E ratio, and debt.',
      'Technical Analysis examines price action, support/resistance levels, moving averages, and volume.',
      'Long-term investors rely heavily on fundamental analysis; short-term swing traders focus on technicals.',
    ],
    sections: [
      {
        title: '1. Fundamental Analysis: The Detective Work',
        content: 'Fundamental analysts examine whether a stock is fairly valued relative to its business earning power. Key metrics include Price-to-Earnings (P/E) ratio (how much you pay for ₹1 of annual earnings), Price-to-Book (P/B), Return on Equity (ROE), and Debt-to-Equity ratio.',
      },
      {
        title: '2. Technical Analysis: The Market Psychology',
        content: 'Technical analysts believe all known information is already reflected in the stock price. They study candlestick charts, volume trends, and indicators like 50-day and 200-day moving averages to identify trends and entry points.',
      },
    ],
    quiz: [
      {
        id: 'q9-1',
        question: 'What does a Price-to-Earnings (P/E) ratio of 25 mean?',
        options: ['The company has 25 employees', 'Investors are paying ₹25 for every ₹1 of company net profit', 'The stock is guaranteed to rise 25%', 'The company has 25 crores in debt'],
        correctIndex: 1,
        explanation: 'The P/E ratio measures how much investors are willing to pay per rupee of current earnings.',
      },
    ],
  },
  {
    id: 'lesson-10',
    title: 'Top 7 Beginner Mistakes to Avoid',
    subtitle: 'The psychological traps that ruin new investors and how to protect your portfolio',
    readTime: '5 min',
    category: 'Mindset',
    summary: 'Investing success is 20% knowledge and 80% emotional discipline. Avoid these proven pitfalls.',
    keyTakeaways: [
      'Never trade on Telegram or WhatsApp "tips" — unregulated tipsters often run pump-and-dump schemes.',
      'Avoid FOMO (Fear Of Missing Out) when a stock has already surged 200%.',
      'Checking your portfolio every 10 minutes leads to emotional overtrading and panic selling.',
    ],
    sections: [
      {
        title: '1. The Deadly Telegram "Multibagger" Tip',
        content: 'Unscrupulous operators buy illiquid penny stocks, post viral messages in student WhatsApp and Telegram channels claiming "Guaranteed 10x target tomorrow!", and dump their shares on unsuspecting beginners as soon as the price spikes. Never buy a stock you haven\'t researched yourself.',
      },
      {
        title: '2. Revenge Trading & Averaging Down on Bad Businesses',
        content: 'When a trade goes red, beginners often double down to "break even faster", pouring good money after bad. If a company\'s fundamental business model is deteriorating, selling at a small disciplined loss is far better than holding a collapsing zombie stock.',
        tip: 'Remember: In the stock market, being patient and doing nothing during market noise is often the highest-return action you can take.',
      },
    ],
    quiz: [
      {
        id: 'q10-1',
        question: 'What should you do when you see a viral social media message promising "Guaranteed 500% profit stock tip"?',
        options: ['Invest your entire savings immediately', 'Ignore it and report it — legitimate investing does not guarantee risk-free returns', 'Forward it to all your friends', 'Borrow money to buy on leverage'],
        correctIndex: 1,
        explanation: 'Guaranteed return claims are hallmark indicators of scams and pump-and-dump schemes.',
      },
      {
        id: 'q10-2',
        question: 'Why is checking your portfolio 20 times a day counterproductive for a long-term investor?',
        options: ['It drains the phone battery', 'It amplifies emotional anxiety and tempts you to make impulsive panic trades', 'It changes the stock price negatively', 'It causes SEBI account suspension'],
        correctIndex: 1,
        explanation: 'Obsessive portfolio monitoring increases emotional stress and frequently leads to impulsive, irrational trading decisions.',
      },
    ],
  },
];
