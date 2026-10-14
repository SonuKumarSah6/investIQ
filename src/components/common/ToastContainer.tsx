import React from 'react';
import { useInvest } from '../../context/InvestContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useInvest();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let borderClass = 'border-slate-800 bg-[#0F172A]';
        let icon = <Info className="w-4 h-4 text-cyan-400 shrink-0" />;

        if (toast.type === 'success') {
          borderClass = 'border-emerald-800/80 bg-[#062016]';
          icon = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'warning' || toast.type === 'error') {
          borderClass = 'border-rose-800/80 bg-[#250d12]';
          icon = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-xl border shadow-xl flex items-start justify-between gap-3 text-xs animate-in slide-in-from-bottom-2 duration-200 ${borderClass}`}
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5">{icon}</span>
              <div>
                <div className="font-bold text-white tracking-tight">{toast.title}</div>
                <div className="text-slate-300 mt-0.5 leading-relaxed">{toast.message}</div>
              </div>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
