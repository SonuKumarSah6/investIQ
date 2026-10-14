import React, { useState } from 'react';
import { useInvest } from '../../context/InvestContext';
import {
  generatePortfolioSummaryCSV,
  generateTransactionsCSV,
  generateCombinedPortfolioJSON,
  downloadFile,
  PortfolioExportData,
} from '../../utils/exportUtils';
import { formatINR, formatPercent } from '../../utils/formatters';
import {
  Download,
  FileSpreadsheet,
  FileText,
  FileCode,
  X,
  Check,
  Copy,
  Info,
  Calendar,
  Layers,
  ArrowDownToLine,
  CheckCircle2,
} from 'lucide-react';

interface ExportPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'summary' | 'transactions' | 'combined';
}

export const ExportPortfolioModal: React.FC<ExportPortfolioModalProps> = ({
  isOpen,
  onClose,
  defaultTab = 'summary',
}) => {
  const {
    virtualCash,
    holdings,
    portfolioHoldingsValue,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    stocks,
    transactions,
    showToast,
  } = useInvest();

  const [activeTab, setActiveTab] = useState<'summary' | 'transactions' | 'combined'>(defaultTab);
  const [txFilter, setTxFilter] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [hasCopied, setHasCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportData: PortfolioExportData = {
    virtualCash,
    portfolioHoldingsValue,
    totalPortfolioValue,
    totalInvestedAmount,
    totalUnrealizedPL,
    totalUnrealizedPLPercent,
    totalRealizedPL,
    totalProfitLoss,
    totalProfitLossPercent,
    holdings,
    stocks,
    transactions,
    initialBalance: 100000,
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const handleDownloadSummaryCSV = () => {
    try {
      const csv = generatePortfolioSummaryCSV(exportData);
      const filename = `investiq-portfolio-summary-${todayStr}.csv`;
      downloadFile(csv, filename, 'text/csv;charset=utf-8;');
      setDownloadSuccess('Portfolio Summary CSV downloaded successfully');
      showToast({
        title: 'Export Downloaded',
        message: `${filename} saved to your device.`,
        type: 'success',
      });
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      showToast({
        title: 'Export Failed',
        message: 'Could not generate portfolio summary export.',
        type: 'error',
      });
    }
  };

  const handleDownloadTransactionsCSV = () => {
    try {
      const csv = generateTransactionsCSV(transactions, txFilter);
      const filename = `investiq-transactions-${txFilter.toLowerCase()}-${todayStr}.csv`;
      downloadFile(csv, filename, 'text/csv;charset=utf-8;');
      setDownloadSuccess('Transactions CSV downloaded successfully');
      showToast({
        title: 'Export Downloaded',
        message: `${filename} saved to your device.`,
        type: 'success',
      });
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      showToast({
        title: 'Export Failed',
        message: 'Could not generate transaction export.',
        type: 'error',
      });
    }
  };

  const handleDownloadCombinedJSON = () => {
    try {
      const json = generateCombinedPortfolioJSON(exportData);
      const filename = `investiq-full-report-${todayStr}.json`;
      downloadFile(json, filename, 'application/json;charset=utf-8;');
      setDownloadSuccess('Combined Report JSON downloaded successfully');
      showToast({
        title: 'Export Downloaded',
        message: `${filename} saved to your device.`,
        type: 'success',
      });
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      showToast({
        title: 'Export Failed',
        message: 'Could not generate combined JSON export.',
        type: 'error',
      });
    }
  };

  const handleCopySummary = async () => {
    try {
      const lines = [
        `INVESTIQ PORTFOLIO REPORT — ${new Date().toLocaleDateString('en-IN')}`,
        `Total Value: ${formatINR(totalPortfolioValue)}`,
        `Cash Available: ${formatINR(virtualCash)}`,
        `Invested Capital: ${formatINR(totalInvestedAmount)}`,
        `Active Holdings: ${Object.keys(holdings).length} companies`,
        `Unrealized P&L: ${totalUnrealizedPL >= 0 ? '+' : ''}${formatINR(totalUnrealizedPL)} (${formatPercent(totalUnrealizedPLPercent)})`,
        `Realized P&L: ${totalRealizedPL >= 0 ? '+' : ''}${formatINR(totalRealizedPL)}`,
        `Net Overall Return: ${totalProfitLoss >= 0 ? '+' : ''}${formatINR(totalProfitLoss)} (${formatPercent(totalProfitLossPercent)})`,
      ];
      await navigator.clipboard.writeText(lines.join('\n'));
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2000);
      showToast({
        title: 'Copied to Clipboard',
        message: 'Portfolio summary copied to clipboard.',
        type: 'info',
      });
    } catch (e) {
      console.error(e);
    }
  };

  const holdingsCount = Object.keys(holdings).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="export-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="w-full max-w-2xl bg-[#0F172A] border border-slate-750 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 id="export-dialog-title" className="text-base font-bold text-white tracking-tight">
                Export Virtual Portfolio Data
              </h2>
              <p className="text-xs text-slate-400">
                Download structured CSV spreadsheets or complete JSON audit logs
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close export dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-[#0B0F19] px-5 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'summary'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Portfolio Summary (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'transactions'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Order History (CSV)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('combined')}
            className={`pb-3 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'combined'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-purple-400" />
            <span>Combined Report (JSON)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-5">
          {downloadSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2.5 text-xs text-emerald-300">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* TAB 1: SUMMARY CSV */}
          {activeTab === 'summary' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-white">
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Dataset Preview
                  </span>
                  <span className="text-slate-400 font-mono text-[11px]">
                    {holdingsCount} Positions · ₹{totalPortfolioValue.toLocaleString('en-IN')} Total
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Value</div>
                    <div className="text-xs font-bold font-mono text-white mt-0.5">
                      {formatINR(totalPortfolioValue)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Cash Available</div>
                    <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                      {formatINR(virtualCash)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Cost Basis</div>
                    <div className="text-xs font-bold font-mono text-slate-200 mt-0.5">
                      {formatINR(totalInvestedAmount)}
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-850">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold">Net P&L</div>
                    <div
                      className={`text-xs font-bold font-mono mt-0.5 ${
                        totalProfitLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {totalProfitLoss >= 0 ? '+' : ''}
                      {formatINR(totalProfitLoss)}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <p className="font-medium text-slate-300">Included Columns:</p>
                  <p className="text-slate-400 font-mono text-[10px] leading-relaxed bg-slate-950 p-2 rounded border border-slate-850">
                    Symbol, Company Name, Quantity Held, Avg Buy Price, Simulated Current Price, Total Cost Basis, Current Market Value, Unrealized P&L, Return %, Allocation %, Sector
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadSummaryCSV}
                  className="w-full sm:flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  <span>Download Summary CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Quick Stats</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TRANSACTIONS CSV */}
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-white flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Transaction Scope Filter
                  </span>

                  <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                    {(['ALL', 'BUY', 'SELL'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setTxFilter(filter)}
                        className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                          txFilter === filter
                            ? 'bg-slate-800 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-slate-950/70 rounded-lg border border-slate-850 text-xs text-slate-300 flex items-center justify-between">
                  <span>Total Matching Orders:</span>
                  <span className="font-mono font-bold text-white">
                    {txFilter === 'ALL'
                      ? transactions.length
                      : transactions.filter((t) => t.type === txFilter).length}{' '}
                    orders
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                  <p className="font-medium text-slate-300">Included Columns:</p>
                  <p className="text-slate-400 font-mono text-[10px] leading-relaxed bg-slate-950 p-2 rounded border border-slate-850">
                    Transaction ID, Execution Timestamp, Order Type, Symbol, Company Name, Quantity, Execution Price, Total Value, Simulated Brokerage Fee, Realized P&L
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadTransactionsCSV}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Download Order History CSV ({txFilter})</span>
              </button>
            </div>
          )}

          {/* TAB 3: COMBINED REPORT JSON */}
          {activeTab === 'combined' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <FileCode className="w-4 h-4 text-purple-400" />
                  <span>Complete Developer & Analytical Payload</span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Full structured JSON schema containing portfolio metadata, account reconciliation, current equity positions with cost basis, and the complete audit log of executed simulated trades.
                </p>

                <div className="p-3 bg-slate-950 rounded-lg border border-slate-850 text-[11px] font-mono text-slate-300 space-y-1">
                  <div>Format: UTF-8 JSON Indented</div>
                  <div>Content: Accounting Summary + Holdings Array + Transactions Array</div>
                  <div>Schema Version: 2.0.0-competition</div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDownloadCombinedJSON}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Download Combined JSON Report</span>
              </button>
            </div>
          )}

          {/* Safety & Educational Notice */}
          <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl flex items-start gap-2.5 text-[11px] text-slate-400">
            <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Export files reflect the real simulated portfolio state computed from your virtual trades. Exported records are intended for personal tracking and educational finance study.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            InvestIQ Paper Simulation Platform
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors font-medium text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
