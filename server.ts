import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { serverMarketDataProvider } from './serverMarketDataProvider.ts';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini if key exists
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Gemini client init note:', err);
  }
}

// Mentor Chat Proxy Route
app.post('/api/mentor/chat', async (req, res) => {
  try {
    const { message, portfolioSummary, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (geminiClient && process.env.GEMINI_API_KEY) {
      const systemInstruction = `You are InvestIQ Mentor, an expert, encouraging, and highly ethical virtual financial educator for Indian beginner investors and university students.
You guide users through simulated stock trading on the Indian market (NSE/BSE).

CRITICAL SAFETY & EDUCATIONAL GUIDELINES:
1. You are an educational simulator guide, NOT a SEBI-registered financial advisor. Never provide guaranteed return claims, speculative price predictions, or definitive buy/sell recommendations.
2. Ground all portfolio feedback in the user's ACTUAL portfolio data provided below. Never hallucinate holdings or fictional cash amounts.
3. If portfolio is empty, encourage placing a first simulated paper trade and explain beginner concepts (e.g., SIP, Rupee Cost Averaging, Diversification).
4. Explain Indian financial concepts simply (e.g., Nifty 50, Sensex, PE Ratio, RBI Repo Rate, Capex, Index Funds).
5. Always emphasize risk management, long-term wealth building, and diversification.
6. Format your answer with clean headings, bullet points, and clear distinctions between calculated portfolio facts and general educational suggestions.

CURRENT USER SIMULATED PORTFOLIO CONTEXT:
${portfolioSummary ? JSON.stringify(portfolioSummary, null, 2) : 'No portfolio active yet'}`;

      try {
        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
            },
          ],
        });

        const replyText = response.text || '';
        if (replyText.trim()) {
          return res.json({
            text: replyText,
            source: 'gemini',
          });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call returned status or error:', geminiError?.message || geminiError);
        // Fall back gracefully to local engine response
        return res.json({
          text: '',
          source: 'mentor-engine',
          fallbackNeeded: true,
          error: geminiError?.message || 'Gemini service busy',
        });
      }
    }

    return res.json({
      text: '',
      source: 'mentor-engine',
      fallbackNeeded: true,
    });
  } catch (error: any) {
    console.error('Mentor route error:', error);
    return res.status(500).json({
      error: 'Failed to process mentor request',
      source: 'mentor-engine',
      fallbackNeeded: true,
    });
  }
});

// Real Market Data Route: All Monitored Indian Stocks
app.get('/api/market/quotes', async (req, res) => {
  try {
    const force = req.query.force === 'true';
    const stocks = await serverMarketDataProvider.getStocks(force);
    const session = serverMarketDataProvider.getMarketSessionInfo();

    return res.json({
      stocks,
      session,
      summary: {
        tradingDate: session.tradingDate,
        source: 'NSE / BSE Bhavcopy Official Records',
        provider: 'TejHQ Indian Financial Data Infrastructure',
        license: 'MIT',
        fetchedAt: Date.now(),
        totalSymbols: stocks.length,
      },
    });
  } catch (error: any) {
    console.error('Market quotes route error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve genuine market quotes',
      message: error?.message || 'Upstream provider unavailable',
    });
  }
});

// Single Symbol Real Historical OHLCV Route
app.get('/api/market/history', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'RELIANCE';
    const exchange = ((req.query.exchange as string) || 'NSE').toUpperCase() as 'NSE' | 'BSE';
    const result = await serverMarketDataProvider.getSymbolHistory(symbol, exchange);
    return res.json(result);
  } catch (error: any) {
    console.error('Market history route error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve historical data',
      message: error?.message,
    });
  }
});

// Corporate Actions Route
app.get('/api/market/actions', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'RELIANCE';
    const actions = await serverMarketDataProvider.getCorporateActions(symbol);
    return res.json({
      symbol,
      data: actions,
    });
  } catch (error: any) {
    console.error('Corporate actions route error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve corporate actions',
      message: error?.message,
    });
  }
});

// Market Session Status Route
app.get('/api/market/session', (req, res) => {
  try {
    const session = serverMarketDataProvider.getMarketSessionInfo();
    return res.json(session);
  } catch (error: any) {
    return res.status(500).json({ error: error?.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    timestamp: Date.now(),
  });
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`InvestIQ server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
