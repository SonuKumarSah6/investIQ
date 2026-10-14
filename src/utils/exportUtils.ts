import { Stock, Holding, Transaction } from '../types';
import { formatINR, formatPercent } from './formatters';

export interface PortfolioExportData {
  virtualCash: number;
  portfolioHoldingsValue: number;
  totalPortfolioValue: number;
  totalInvestedAmount: number;
  totalUnrealizedPL: number;
  totalUnrealizedPLPercent: number;
  totalRealizedPL: number;
  totalProfitLoss: number;
  totalProfitLossPercent: number;
  holdings: Record<string, Holding>;
  stocks: Stock[];
  transactions: Transaction[];
  initialBalance?: number;
}

/**
 * Escapes a CSV cell value to handle commas, newlines, and double quotes safely.
 */
function escapeCSVCell(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '""';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Generates CSV content for Portfolio Summary
 */
export function generatePortfolioSummaryCSV(data: PortfolioExportData): string {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const holdingsList = Object.values(data.holdings);

  const lines: string[] = [];

  // Metadata & Summary header
  lines.push('INVESTIQ VIRTUAL INVESTMENT SIMULATOR — PORTFOLIO SUMMARY REPORT');
  lines.push(`Generated On (IST),${escapeCSVCell(timestamp)}`);
  lines.push(`Export Mode,Simulated Paper Trading Portfolio`);
  lines.push('');

  // Portfolio Overview Totals
  lines.push('PORTFOLIO FINANCIAL KPI OVERVIEW');
  lines.push(`Total Portfolio Value,INR ${data.totalPortfolioValue.toFixed(2)}`);
  lines.push(`Available Virtual Cash,INR ${data.virtualCash.toFixed(2)}`);
  lines.push(`Total Invested Cost Basis,INR ${data.totalInvestedAmount.toFixed(2)}`);
  lines.push(`Total Holdings Market Value,INR ${data.portfolioHoldingsValue.toFixed(2)}`);
  lines.push(`Unrealized Profit/Loss,INR ${data.totalUnrealizedPL.toFixed(2)} (${data.totalUnrealizedPLPercent.toFixed(2)}%)`);
  lines.push(`Realized Profit/Loss (Closed Orders),INR ${data.totalRealizedPL.toFixed(2)}`);
  lines.push(`Net Cumulative Return,INR ${data.totalProfitLoss.toFixed(2)} (${data.totalProfitLossPercent.toFixed(2)}%)`);
  lines.push(`Starting Capital Balance,INR ${(data.initialBalance || 100000).toFixed(2)}`);
  lines.push(`Active Positions Count,${holdingsList.length}`);
  lines.push('');

  // Holdings Breakdown Table Header
  lines.push('EQUITY HOLDINGS BREAKDOWN');
  const headers = [
    'Symbol',
    'Company Name',
    'Quantity Held',
    'Avg Buy Price (INR)',
    'Simulated Current Price (INR)',
    'Total Cost Basis (INR)',
    'Current Market Value (INR)',
    'Unrealized P&L (INR)',
    'Unrealized Return (%)',
    'Portfolio Allocation (%)',
    'Sector',
  ];
  lines.push(headers.map(escapeCSVCell).join(','));

  if (holdingsList.length === 0) {
    lines.push(escapeCSVCell('No active holdings. Portfolio is 100% Cash reserves.'));
  } else {
    for (const h of holdingsList) {
      const stock = data.stocks.find((s) => s.symbol === h.symbol);
      const stockName = stock?.name || h.symbol;
      const currentPrice = stock ? stock.price : h.avgPrice;
      const marketVal = h.quantity * currentPrice;
      const unrlPL = marketVal - h.totalInvested;
      const unrlPercent = h.totalInvested > 0 ? (unrlPL / h.totalInvested) * 100 : 0;
      const allocPercent = data.totalPortfolioValue > 0 ? (marketVal / data.totalPortfolioValue) * 100 : 0;
      const sector = stock?.sector || 'Unknown';

      const row = [
        h.symbol,
        stockName,
        h.quantity,
        h.avgPrice.toFixed(2),
        currentPrice.toFixed(2),
        h.totalInvested.toFixed(2),
        marketVal.toFixed(2),
        unrlPL.toFixed(2),
        unrlPercent.toFixed(2),
        allocPercent.toFixed(2),
        sector,
      ];
      lines.push(row.map(escapeCSVCell).join(','));
    }
  }

  lines.push('');
  lines.push('NOTE: All financial figures are virtual demo simulations for educational purposes only.');

  return lines.join('\r\n');
}

/**
 * Generates CSV content for Transaction History
 */
export function generateTransactionsCSV(
  transactions: Transaction[],
  filterType: 'ALL' | 'BUY' | 'SELL' = 'ALL'
): string {
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const lines: string[] = [];

  const filtered = filterType === 'ALL' ? transactions : transactions.filter((t) => t.type === filterType);

  lines.push('INVESTIQ VIRTUAL INVESTMENT SIMULATOR — TRANSACTION AUDIT LOG');
  lines.push(`Generated On (IST),${escapeCSVCell(timestamp)}`);
  lines.push(`Filter Mode,${escapeCSVCell(filterType)}`);
  lines.push(`Total Executed Orders,${filtered.length}`);
  lines.push('');

  const headers = [
    'Transaction ID',
    'Execution Timestamp',
    'Order Type',
    'Stock Symbol',
    'Company Name',
    'Shares Executed',
    'Execution Price (INR)',
    'Total Transaction Amount (INR)',
    'Simulated Brokerage Fee (INR)',
    'Realized Profit/Loss (INR)',
    'Realized P&L (%)',
  ];
  lines.push(headers.map(escapeCSVCell).join(','));

  if (filtered.length === 0) {
    lines.push(escapeCSVCell('No transactions recorded for the selected filter.'));
  } else {
    for (const tx of filtered) {
      const simulatedFee = 0; // Zero commission virtual trading
      const realizedPLStr =
        tx.type === 'SELL' && tx.realizedPL !== undefined ? tx.realizedPL.toFixed(2) : 'N/A';
      const realizedPercentStr =
        tx.type === 'SELL' && tx.realizedPL !== undefined && tx.totalAmount > 0
          ? ((tx.realizedPL / (tx.totalAmount - tx.realizedPL)) * 100).toFixed(2)
          : 'N/A';

      const row = [
        tx.id,
        tx.dateFormatted || new Date(tx.timestamp).toLocaleString('en-IN'),
        tx.type,
        tx.symbol,
        tx.stockName,
        tx.quantity,
        tx.price.toFixed(2),
        tx.totalAmount.toFixed(2),
        simulatedFee.toFixed(2),
        realizedPLStr,
        realizedPercentStr,
      ];
      lines.push(row.map(escapeCSVCell).join(','));
    }
  }

  lines.push('');
  lines.push('NOTE: All orders were executed within InvestIQ paper simulated trading environment.');

  return lines.join('\r\n');
}

/**
 * Generates Combined JSON Report
 */
export function generateCombinedPortfolioJSON(data: PortfolioExportData): string {
  const exportPayload = {
    application: 'InvestIQ — Virtual Investment Simulator',
    version: '2.0.0-competition',
    exportTimestampISO: new Date().toISOString(),
    exportTimestampIST: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    currency: 'INR',
    accountingSummary: {
      initialCapital: data.initialBalance || 100000,
      totalPortfolioValue: data.totalPortfolioValue,
      availableVirtualCash: data.virtualCash,
      totalHoldingsMarketValue: data.portfolioHoldingsValue,
      totalCostBasis: data.totalInvestedAmount,
      totalUnrealizedPL: data.totalUnrealizedPL,
      totalUnrealizedPLPercent: data.totalUnrealizedPLPercent,
      totalRealizedPL: data.totalRealizedPL,
      netTotalProfitLoss: data.totalProfitLoss,
      netTotalProfitLossPercent: data.totalProfitLossPercent,
      activePositionsCount: Object.keys(data.holdings).length,
      totalTransactionsExecuted: data.transactions.length,
    },
    holdings: Object.values(data.holdings).map((h) => {
      const stock = data.stocks.find((s) => s.symbol === h.symbol);
      const stockName = stock?.name || h.symbol;
      const currentPrice = stock ? stock.price : h.avgPrice;
      const marketVal = h.quantity * currentPrice;
      const unrlPL = marketVal - h.totalInvested;
      const unrlPercent = h.totalInvested > 0 ? (unrlPL / h.totalInvested) * 100 : 0;
      const allocPercent =
        data.totalPortfolioValue > 0 ? (marketVal / data.totalPortfolioValue) * 100 : 0;

      return {
        symbol: h.symbol,
        stockName,
        quantity: h.quantity,
        averageBuyPrice: h.avgPrice,
        currentSimulatedPrice: currentPrice,
        costBasis: h.totalInvested,
        currentMarketValue: marketVal,
        unrealizedPL: unrlPL,
        unrealizedPLPercent: unrlPercent,
        allocationPercent: allocPercent,
        sector: stock?.sector || 'Unknown',
      };
    }),
    transactions: data.transactions.map((tx) => ({
      id: tx.id,
      timestampISO: new Date(tx.timestamp).toISOString(),
      timestampFormatted: tx.dateFormatted,
      type: tx.type,
      symbol: tx.symbol,
      stockName: tx.stockName,
      quantity: tx.quantity,
      price: tx.price,
      totalAmount: tx.totalAmount,
      simulatedBrokerageFee: 0,
      realizedPL: tx.realizedPL ?? null,
    })),
    disclaimer:
      'InvestIQ is a virtual financial learning environment. All trades, portfolios, and figures are simulated.',
  };

  return JSON.stringify(exportPayload, null, 2);
}

/**
 * Downloads a string content as a file via a Blob anchor click.
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.setAttribute('download', filename);
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
