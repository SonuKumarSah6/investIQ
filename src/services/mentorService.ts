import { Stock, Holding, PortfolioAnalysisResult, SavedInsight } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

export interface PortfolioDataInput {
  virtualCash: number;
  totalPortfolioValue: number;
  totalInvestedAmount: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  totalRealizedPL: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdings: Record<string, Holding>;
  stocks: Stock[];
}

/**
 * Deterministically analyzes the virtual portfolio state with zero hallucination.
 * Computes exact mathematical weights, concentration factors, and risk alerts.
 */
export function analyzePortfolio(data: PortfolioDataInput): PortfolioAnalysisResult {
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
  } = data;

  const holdingsList = Object.values(holdings);
  const holdingsCount = holdingsList.length;

  // Calculate market value per holding & identify top holding
  let highestHoldingValue = 0;
  let topHoldingSymbol = '';
  let topHoldingName = '';

  const sectorTotals: Record<string, number> = {};
  let totalEquitiesMarketValue = 0;

  holdingsList.forEach((h) => {
    const stock = stocks.find((s) => s.symbol === h.symbol);
    const price = stock ? stock.price : h.avgPrice;
    const value = h.quantity * price;
    totalEquitiesMarketValue += value;

    if (value > highestHoldingValue) {
      highestHoldingValue = value;
      topHoldingSymbol = h.symbol;
      topHoldingName = stock ? stock.name : h.symbol;
    }

    const sector = stock ? stock.sector : 'Other';
    sectorTotals[sector] = (sectorTotals[sector] || 0) + value;
  });

  const topHoldingPercent =
    totalEquitiesMarketValue > 0
      ? (highestHoldingValue / totalEquitiesMarketValue) * 100
      : 0;

  // Sector allocation breakdown
  const sectorAllocation = Object.entries(sectorTotals).map(([sector, value]) => ({
    sector,
    value,
    percentage:
      totalEquitiesMarketValue > 0
        ? (value / totalEquitiesMarketValue) * 100
        : 0,
  }));

  // Calculate Diversification Score (0 - 100)
  let diversificationScore = 0;
  let diversificationStatus: PortfolioAnalysisResult['diversification']['status'] =
    'No Holdings (Cash Only)';

  if (holdingsCount === 0) {
    diversificationScore = 10;
    diversificationStatus = 'No Holdings (Cash Only)';
  } else {
    // Scoring criteria:
    // 1. Number of stocks (up to 30 pts)
    const stockCountScore = Math.min(30, holdingsCount * 7.5);

    // 2. Number of unique sectors (up to 40 pts)
    const uniqueSectorsCount = Object.keys(sectorTotals).length;
    const sectorCountScore = Math.min(40, uniqueSectorsCount * 10);

    // 3. Concentration penalty (up to 30 pts)
    let concentrationScore = 30;
    if (topHoldingPercent > 60) {
      concentrationScore = 5;
    } else if (topHoldingPercent > 40) {
      concentrationScore = 15;
    } else if (topHoldingPercent > 25) {
      concentrationScore = 22;
    }

    diversificationScore = Math.round(stockCountScore + sectorCountScore + concentrationScore);

    if (diversificationScore >= 75) {
      diversificationStatus = 'Excellent Diversification';
    } else if (diversificationScore >= 45) {
      diversificationStatus = 'Moderately Diversified';
    } else {
      diversificationStatus = 'High Concentration Risk';
    }
  }

  // Detect Risks
  const risks: PortfolioAnalysisResult['risks'] = [];

  if (holdingsCount === 0) {
    risks.push({
      severity: 'Info',
      title: '100% Cash Drag (Zero Market Participation)',
      description:
        'All ₹1,00,000 is sitting in simulated cash. While your principal is safe from market fluctuations, cash loses purchasing power to inflation over time.',
      dataPoint: `Cash: ${formatINR(virtualCash)} (100% of portfolio)`,
    });
  } else {
    // Single holding risk
    if (topHoldingPercent > 40) {
      risks.push({
        severity: 'High',
        title: `Over-Concentration in ${topHoldingSymbol}`,
        description: `${topHoldingName} accounts for ${topHoldingPercent.toFixed(1)}% of your total equity investments. An adverse company event or sector downturn could impact your portfolio disproportionately.`,
        dataPoint: `${topHoldingSymbol}: ${formatINR(highestHoldingValue)} (${topHoldingPercent.toFixed(1)}% of equities)`,
      });
    }

    // Sector concentration risk
    const concentratedSector = sectorAllocation.find((s) => s.percentage > 50);
    if (concentratedSector) {
      risks.push({
        severity: 'Medium',
        title: `Heavy Exposure to ${concentratedSector.sector}`,
        description: `Over half of your equity holdings (${concentratedSector.percentage.toFixed(1)}%) belong to a single industry sector. Industry regulatory changes or economic cycles can drag all these holdings simultaneously.`,
        dataPoint: `${concentratedSector.sector}: ${concentratedSector.percentage.toFixed(1)}%`,
      });
    }

    // Cash liquidity risk
    const cashRatio = totalPortfolioValue > 0 ? (virtualCash / totalPortfolioValue) * 100 : 0;
    if (cashRatio < 5) {
      risks.push({
        severity: 'Low',
        title: 'Limited Buying Liquidity (Low Cash Buffer)',
        description:
          'Your available virtual cash is under 5%. If a sudden market dip creates an attractive buying opportunity in Indian blue chips, you will have to sell existing holdings to free up capital.',
        dataPoint: `Available Cash: ${formatINR(virtualCash)} (${cashRatio.toFixed(1)}% of portfolio)`,
      });
    } else if (cashRatio > 60) {
      risks.push({
        severity: 'Info',
        title: 'High Cash Allocation',
        description:
          `You have ${cashRatio.toFixed(1)}% of your virtual wealth unallocated in cash. Consider deploying small systematic tranches into diversified sectors.`,
        dataPoint: `Cash: ${formatINR(virtualCash)} (${cashRatio.toFixed(1)}%)`,
      });
    }
  }

  // Learning Opportunities
  const learningOpportunities: PortfolioAnalysisResult['learningOpportunities'] = [];

  if (holdingsCount < 3) {
    learningOpportunities.push({
      topic: 'Asset Allocation & The Core-Satellite Strategy',
      reason: 'Helps beginner investors split capital between defensive large-cap foundation stocks and selective high-growth companies.',
      suggestedAction: 'Explore the "Market Basics" module in the Learn Academy.',
      lessonCategory: 'Fundamentals',
    });
  }

  if (topHoldingPercent > 35) {
    learningOpportunities.push({
      topic: 'Mitigating Idiosyncratic (Company-Specific) Risk',
      reason: 'Learn why even the strongest companies in India (e.g. Tata, Reliance, Infosys) go through multi-year consolidation phases.',
      suggestedAction: 'Read about position sizing and risk management.',
      lessonCategory: 'Risk & Strategy',
    });
  }

  learningOpportunities.push({
    topic: 'Understanding Rupee-Cost Averaging (SIP)',
    reason: 'Mathematical strategy to eliminate market timing anxiety by buying shares across market cycles.',
    suggestedAction: 'Review the SIP vs Lump-sum lesson.',
    lessonCategory: 'Mindset',
  });

  // Next Steps
  const nextSteps: PortfolioAnalysisResult['nextSteps'] = [];

  if (holdingsCount === 0) {
    nextSteps.push({
      action: 'Execute your first simulated trade',
      rationale: 'Search for blue-chip Indian companies (e.g., RELIANCE, TCS, HDFCBANK) on Explore Market and buy a small quantity.',
      targetTab: 'market',
    });
    nextSteps.push({
      action: 'Complete Lesson 1 in Learn Academy',
      rationale: 'Learn how stock exchanges (NSE/BSE) function and how virtual orders get matched.',
      targetTab: 'learn',
    });
  } else {
    if (topHoldingPercent > 40) {
      nextSteps.push({
        action: 'Diversify into an unrepresented sector',
        rationale: `Balance your ${topHoldingSymbol} weighting by exploring non-correlated industries like Pharma, Automobile, or Infrastructure.`,
        targetTab: 'market',
      });
    }
    nextSteps.push({
      action: 'Set a Target Price Alert',
      rationale: 'Create a non-intrusive alert on one of your active holdings to practice monitoring exit or accumulation levels.',
      targetTab: 'market',
    });
    nextSteps.push({
      action: 'Review Transaction Ledger',
      rationale: 'Check your average cost basis and realized profit/loss on the Portfolio page.',
      targetTab: 'portfolio',
    });
  }

  return {
    overview: {
      totalValue: totalPortfolioValue,
      cash: virtualCash,
      invested: totalInvestedAmount,
      unrealizedPL: totalUnrealizedPL,
      unrealizedPLPercent: totalUnrealizedPLPercent,
      realizedPL: totalRealizedPL,
      netPL: totalProfitLoss,
      netPLPercent: totalProfitLossPercent,
      holdingsCount,
    },
    diversification: {
      score: diversificationScore,
      status: diversificationStatus,
      topHoldingSymbol: topHoldingSymbol || undefined,
      topHoldingPercent: topHoldingPercent > 0 ? topHoldingPercent : undefined,
      topHoldingName: topHoldingName || undefined,
      sectorAllocation,
    },
    risks,
    learningOpportunities,
    nextSteps,
  };
}

/**
 * High-quality deterministic mentor response generator.
 * Produces structured, educational explanations grounded strictly in portfolio facts.
 */
export function generateLocalMentorResponse(
  question: string,
  data: PortfolioDataInput
): { text: string; cards?: PortfolioAnalysisResult; suggestedFollowUps: string[] } {
  const qLower = question.toLowerCase();
  const analysis = analyzePortfolio(data);
  const { overview, diversification, risks } = analysis;

  // Scenario 1: Portfolio Analysis
  if (
    qLower.includes('analyze') ||
    qLower.includes('portfolio') ||
    qLower.includes('review my') ||
    qLower.includes('how is my portfolio')
  ) {
    if (overview.holdingsCount === 0) {
      return {
        text: `### 📊 Virtual Portfolio Diagnostic

**Current Status:** All-Cash Position (Simulated Paper Account)
- **Total Portfolio Value:** ${formatINR(overview.totalValue)}
- **Available Virtual Cash:** ${formatINR(overview.cash)} (100%)
- **Active Equity Holdings:** 0 positions

#### 💡 Mentor Observation:
Your demo account currently has 100% of its capital in virtual cash. While your capital is safe from market fluctuations, you are not participating in the wealth-building potential of Indian equities.

**Recommended Educational First Step:**
1. Head to the **Explore Market** tab.
2. Select a reliable large-cap Indian company (such as **Reliance**, **TCS**, or **HDFC Bank**).
3. Place a small test virtual purchase (e.g. 5 to 10 shares) to see how average cost basis, live price movements, and portfolio weighting work in real-time.

*Note: InvestIQ is an educational simulator for learning. Paper trading results do not constitute SEBI-registered financial advice.*`,
        cards: analysis,
        suggestedFollowUps: [
          'Am I diversified?',
          'Teach me the difference between stocks and index funds.',
          'Explain my biggest investment risk.',
        ],
      };
    }

    const plPrefix = overview.unrealizedPL >= 0 ? '+' : '';
    const netPlPrefix = overview.netPL >= 0 ? '+' : '';

    return {
      text: `### 📊 Virtual Portfolio Diagnostic & Health Check

Here is a fact-based breakdown of your simulated portfolio based on live market prices:

- **Total Portfolio Net Worth:** ${formatINR(overview.totalValue)}
- **Available Virtual Cash:** ${formatINR(overview.cash)} (${((overview.cash / overview.totalValue) * 100).toFixed(1)}% liquidity reserve)
- **Total Invested Cost Basis:** ${formatINR(overview.invested)} across ${overview.holdingsCount} stock${overview.holdingsCount > 1 ? 's' : ''}
- **Unrealized Gain / Loss:** ${plPrefix}${formatINR(overview.unrealizedPL)} (${plPrefix}${overview.unrealizedPLPercent.toFixed(2)}%)
- **Realized P&L from Sales:** ${formatINR(overview.realizedPL)}
- **Net Combined P&L:** ${netPlPrefix}${formatINR(overview.netPL)} (${netPlPrefix}${overview.netPLPercent.toFixed(2)}% vs initial ₹1,00,000)

---

#### 🛡️ Diversification Assessment: ${diversification.status} (Score: ${diversification.score}/100)
${
  diversification.topHoldingSymbol
    ? `- **Largest Position:** **${diversification.topHoldingSymbol}** (${diversification.topHoldingPercent?.toFixed(1)}% of your equities)`
    : ''
}
- **Sector Coverage:** ${diversification.sectorAllocation.length} industry sectors (${diversification.sectorAllocation.map((s) => `${s.sector}: ${s.percentage.toFixed(0)}%`).join(', ')})

#### ⚠️ Key Risk Factors Identified:
${risks.map((r) => `- **${r.title}:** ${r.description}`).join('\n')}

#### 🎓 Mentor Suggested Next Move:
${analysis.nextSteps.map((s, idx) => `${idx + 1}. **${s.action}:** ${s.rationale}`).join('\n')}

*Educational Reminder: Calculations represent simulated market conditions for learning purposes.*`,
      cards: analysis,
      suggestedFollowUps: [
        'Explain my biggest investment risk.',
        'Am I diversified?',
        'How can I reduce concentration risk in my simulated portfolio?',
      ],
    };
  }

  // Scenario 2: Investment Risk
  if (qLower.includes('risk') || qLower.includes('biggest risk') || qLower.includes('danger')) {
    if (overview.holdingsCount === 0) {
      return {
        text: `### ⚠️ Understanding Your Primary Investment Risk

In your current simulated account state, your biggest risk is **Inflation Risk (Cash Drag)**.

- **What is it?** With 100% of your funds (₹1,00,000) in cash, you take zero stock volatility risk. However, in the real Indian economy with an average retail inflation rate of 5% - 6% annually, cash sitting idle loses its real purchasing power every year.
- **The Solution:** Financial literacy teaches building an emergency cash fund first, and then steadily investing surplus capital into productive equity assets that historically beat inflation over 5+ year horizons.

*Try buying 2 or 3 blue-chip stocks in Explore Market to observe how market volatility feels in a risk-free paper trading environment!*`,
        cards: analysis,
        suggestedFollowUps: [
          'Analyze my virtual portfolio.',
          'Am I diversified?',
          'Teach me the difference between stocks and index funds.',
        ],
      };
    }

    const topRisk = risks[0];
    return {
      text: `### ⚠️ Your Top Portfolio Risk Analysis

Based on your current simulated positions, your primary investment risk is:

#### 1. ${topRisk ? topRisk.title : 'Market Volatility Risk'}
${topRisk ? topRisk.description : 'Your holdings fluctuate with broader Indian market sentiment.'}

#### 2. Systematic vs. Unsystematic Risk
- **Unsystematic (Company-Specific) Risk:** The risk that an individual company (e.g. ${diversification.topHoldingSymbol || 'a single holding'}) faces unexpected earnings misses, regulatory penalties, or management hurdles. You can diversify this risk away by owning 8 to 12 stocks across different industries!
- **Systematic (Market-Wide) Risk:** The risk that geopolitical events, RBI repo rate spikes, or global recessions pull down the entire Nifty 50. This risk cannot be diversified away with Indian stocks alone—it requires holding cash buffers or gold.

#### 💡 Mentor Rule of Thumb:
No single company should ideally make up more than **15% to 20%** of your total portfolio if your goal is sustainable, stress-free compounding.`,
      cards: analysis,
      suggestedFollowUps: [
        'Am I diversified?',
        'How can I reduce concentration risk in my simulated portfolio?',
        'What does today\'s financial news mean?',
      ],
    };
  }

  // Scenario 3: Diversification
  if (qLower.includes('diversif') || qLower.includes('balanced') || qLower.includes('allocation')) {
    if (overview.holdingsCount === 0) {
      return {
        text: `### 🧩 Are You Diversified?

**Status: Not yet diversified (Zero equity holdings)**

Currently, you hold 100% virtual cash. True financial diversification involves spreading your capital across:
1. **Asset Classes:** Equities (growth), Fixed Deposits / Debt (safety), Cash (liquidity).
2. **Economic Sectors:** Banking & Finance (HDFC Bank, SBI), Technology (TCS, Infosys), Energy & Consumer (Reliance, ITC, HUL).
3. **Market Caps:** Large-cap (stability) and Mid-cap (higher growth potential).

*Take action: Open the "Explore Market" tab, use the Sector filter, and pick 1 stock from IT and 1 stock from Banking to build your first diversified base!*`,
        cards: analysis,
        suggestedFollowUps: [
          'Analyze my virtual portfolio.',
          'Explain my biggest investment risk.',
          'Teach me the difference between stocks and index funds.',
        ],
      };
    }

    return {
      text: `### 🧩 Diversification Diagnostic: ${diversification.status}

Your Diversification Score is **${diversification.score} out of 100**.

#### Sector Breakdown:
${
  diversification.sectorAllocation.length > 0
    ? diversification.sectorAllocation
        .map((s) => `- **${s.sector}:** ${s.percentage.toFixed(1)}% (${formatINR(s.value)})`)
        .join('\n')
    : '- No sector allocations'
}

#### 🎯 Why Diversification Matters:
- Different sectors perform well in different economic seasons. For example, when interest rates fluctuate, **Banking** stocks react differently than **IT Software** companies that depend on overseas US/European tech spending.
- By holding positions across 3 or more sectors, a bad quarter for one industry does not sink your overall returns.

#### 🚀 How to Improve Your Score:
${
  diversification.topHoldingPercent && diversification.topHoldingPercent > 35
    ? `- Reduce your heavy reliance on **${diversification.topHoldingSymbol}** by investing upcoming cash into under-represented sectors.`
    : `- Add 1 or 2 new sectors (such as Healthcare or Automobile) to achieve a score above 85.`
}`,
      cards: analysis,
      suggestedFollowUps: [
        'How can I reduce concentration risk in my simulated portfolio?',
        'Analyze my virtual portfolio.',
        'Explain my biggest investment risk.',
      ],
    };
  }

  // Scenario 4: Stocks vs Index Funds
  if (
    qLower.includes('index fund') ||
    qLower.includes('difference between stocks') ||
    qLower.includes('etf') ||
    qLower.includes('mutual fund')
  ) {
    return {
      text: `### 📚 Stocks vs. Index Funds: The Fundamental Difference

Understanding this distinction is the bedrock of intelligent investing in India:

| Feature | Individual Stocks (Direct Equity) | Index Funds (e.g., Nifty 50) |
| :--- | :--- | :--- |
| **What you own** | A fractional piece of a single company (e.g. Tata Motors) | A basket containing India's top 50 largest companies |
| **Risk Level** | Higher — company mistakes hurt your capital | Lower — risk is spread over 50 market leaders |
| **Effort Needed** | High — you must read quarterly reports, track P/E ratios, and monitor management | Low — fund tracks the index passively with low expense ratio |
| **Potential Return** | Can dramatically beat the market, or lag behind it | Delivers the exact average return of India's growth (~12-14% CAGR historically) |
| **Best For** | Active investors looking to master business analysis | Passive long-term wealth builders via monthly SIPs |

#### 💡 The Legendary Warren Buffett Advice:
*"For 99% of people, consistently buying an index fund through thick and thin will outperform picking individual stocks."*

In InvestIQ, practicing with individual stocks gives you deep insight into how business balance sheets and market sentiment work without risking real money!`,
      suggestedFollowUps: [
        'Analyze my virtual portfolio.',
        'What does today\'s financial news mean?',
        'Am I diversified?',
      ],
    };
  }

  // Scenario 5: Financial News Meaning
  if (
    qLower.includes('news') ||
    qLower.includes('headline') ||
    qLower.includes('rbi') ||
    qLower.includes('inflation') ||
    qLower.includes('what does today\'s')
  ) {
    return {
      text: `### 📰 How to Read Financial News Like a Seasoned Investor

Financial news often sounds intimidating with complex jargon. Here is how professional analysts decode news events for Indian markets:

#### 1. RBI Interest Rate & Repo Rate News:
- **When RBI holds or cuts rates:** Borrowing is cheaper, EMIs are stable, corporate loans expand. This is generally positive for **Banking**, **Automobiles**, and **Real Estate**.
- **When RBI hikes rates:** Borrowing is costlier, used to cool inflation. High rates can slow down corporate expansion.

#### 2. Corporate Earnings & Mega Order Wins:
- When firms like **TCS**, **Infosys**, or **L&T** announce billion-dollar contracts, it indicates revenue visibility for the next 2-3 years, reassuring long-term shareholders.

#### 3. SEBI Regulatory Updates:
- When SEBI tightens derivative trading rules, its goal is protecting beginner retail investors from losing hard-earned capital in high-leverage gambles.

#### 💡 Golden Rule for Beginners:
Never make impulsive buy or sell decisions based on a single sensational headline. Focus on a company's competitive moat, profitability, and long-term economic demand!`,
      suggestedFollowUps: [
        'Analyze my virtual portfolio.',
        'Teach me the difference between stocks and index funds.',
        'Explain my biggest investment risk.',
      ],
    };
  }

  // Scenario 6: Concentration Risk
  if (qLower.includes('concentration') || qLower.includes('reduce risk')) {
    return {
      text: `### 🎯 How to Reduce Concentration Risk in Your Portfolio

Concentration risk occurs when too many eggs are in one basket. Here is the step-by-step blueprint to balance your holdings:

1. **Rule of 20% Max Allocation:**
   Ensure no single company exceeds 20% of your total equity capital. If ${diversification.topHoldingSymbol || 'a single stock'} is dominating your portfolio, refrain from buying more of it for now.

2. **Spread Across 3+ Uncorrelated Sectors:**
   - **Defensive Sectors:** FMCG (Hindustan Unilever, ITC), Pharma (Sun Pharma) — people buy soap, food, and medicine even during recessions.
   - **Cyclical Sectors:** Automobiles (Tata Motors), Infrastructure (L&T) — boom during economic expansions.
   - **Growth Engines:** IT (TCS, Infosys), Banking (HDFC Bank) — power national digitization and credit growth.

3. **Deploy Surplus Cash Gradually:**
   You currently have **${formatINR(overview.cash)}** in available virtual cash. Allocate small slices (e.g. ₹10,000 to ₹15,000 each) into sectors you do not currently own.

4. **Use Trailing Stop-Losses and Price Alerts:**
   Set alert triggers so you are alerted if your largest holding drops or reaches an exit valuation target.`,
      cards: analysis,
      suggestedFollowUps: [
        'Analyze my virtual portfolio.',
        'Am I diversified?',
        'Explain my biggest investment risk.',
      ],
    };
  }

  // Generic fallback with personalized portfolio context
  return {
    text: `### 💡 InvestIQ Mentor Response

Thank you for your question: **"${question}"**

#### Financial Literacy Insight:
In the Indian stock market (NSE & BSE), successful investing is built upon three pillars:
1. **Understanding Valuation:** Looking at metrics like P/E Ratio (Price to Earnings) to avoid paying an exorbitant price for popular stocks.
2. **Patience & Compounding:** Giving your investments 3 to 5+ years to weather short-term macroeconomic cycles.
3. **Emotional Discipline:** Never panic-selling during routine market corrections, and never buying out of FOMO (Fear Of Missing Out) when a stock is hitting all-time highs.

#### Your Current Simulated Portfolio Status:
- **Net Portfolio Value:** ${formatINR(overview.totalValue)}
- **Available Cash:** ${formatINR(overview.cash)}
- **Holdings:** ${overview.holdingsCount} stock${overview.holdingsCount > 1 ? 's' : ''} (${diversification.status})

Feel free to ask me to analyze your portfolio, explain any complex financial term, or evaluate market risks!`,
    cards: analysis,
    suggestedFollowUps: [
      'Analyze my virtual portfolio.',
      'Explain my biggest investment risk.',
      'Am I diversified?',
      'Teach me the difference between stocks and index funds.',
    ],
  };
}

/**
 * Main Mentor Assistant Dispatcher
 * Calls the secure server-side Gemini API endpoint first, and automatically falls back
 * to the robust deterministic mentor engine if Gemini is busy, rate-limited, or unreachable.
 */
export async function askMentorAssistant(params: {
  question: string;
  portfolioData: PortfolioDataInput;
  conversationHistory?: Array<{ sender: 'user' | 'mentor'; text: string }>;
}): Promise<{
  text: string;
  source: 'gemini' | 'mentor-engine';
  cards?: PortfolioAnalysisResult;
  suggestedFollowUps: string[];
}> {
  const { question, portfolioData, conversationHistory } = params;

  // Generate deterministic cards and baseline answer
  const localResult = generateLocalMentorResponse(question, portfolioData);

  try {
    const response = await fetch('/api/mentor/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: question,
        portfolioSummary: {
          totalPortfolioValue: portfolioData.totalPortfolioValue,
          virtualCash: portfolioData.virtualCash,
          totalInvestedAmount: portfolioData.totalInvestedAmount,
          totalUnrealizedPL: portfolioData.totalUnrealizedPL,
          totalUnrealizedPLPercent: portfolioData.totalUnrealizedPLPercent,
          holdings: Object.values(portfolioData.holdings).map((h) => ({
            symbol: h.symbol,
            quantity: h.quantity,
            avgPrice: h.avgPrice,
          })),
        },
        conversationHistory: conversationHistory?.slice(-4),
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.text && data.text.trim() && data.source === 'gemini') {
        return {
          text: data.text,
          source: 'gemini',
          cards: localResult.cards,
          suggestedFollowUps: localResult.suggestedFollowUps,
        };
      }
    }
  } catch (err) {
    // Network or server offline; proceed smoothly with local engine
    console.warn('API call to Gemini proxy fell back to local engine:', err);
  }

  // Graceful deterministic response with zero delay
  return {
    text: localResult.text,
    source: 'mentor-engine',
    cards: localResult.cards,
    suggestedFollowUps: localResult.suggestedFollowUps,
  };
}
