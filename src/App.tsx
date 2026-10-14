/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { InvestProvider, useInvest } from './context/InvestContext';
import { Stock, Lesson } from './types';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './components/views/LandingPage';
import { DashboardView } from './components/views/DashboardView';
import { ExploreMarketView } from './components/views/ExploreMarketView';
import { PortfolioView } from './components/views/PortfolioView';
import { VirtualTradeView } from './components/views/VirtualTradeView';
import { WatchlistView } from './components/views/WatchlistView';
import { LearnView } from './components/views/LearnView';
import { AchievementsView } from './components/views/AchievementsView';
import { SettingsView } from './components/views/SettingsView';
import { MentorView } from './components/views/MentorView';
import { NewsView } from './components/views/NewsView';
import { TradeModal } from './components/modals/TradeModal';
import { StockDetailModal } from './components/modals/StockDetailModal';
import { LessonQuizModal } from './components/modals/LessonQuizModal';
import { PriceAlertModal } from './components/modals/PriceAlertModal';
import { ToastContainer } from './components/common/ToastContainer';

const MainAppContent: React.FC = () => {
  const { currentTab, stocks } = useInvest();

  // Global modals state
  const [tradeModalStock, setTradeModalStock] = useState<Stock | null>(null);
  const [tradeModalAction, setTradeModalAction] = useState<'BUY' | 'SELL'>('BUY');
  const [isTradeModalOpen, setIsTradeModalOpen] = useState<boolean>(false);

  const [detailModalStock, setDetailModalStock] = useState<Stock | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState<boolean>(false);

  const [alertModalStock, setAlertModalStock] = useState<Stock | null>(null);
  const [alertModalCondition, setAlertModalCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);

  // Handlers
  const handleOpenTrade = (stock: Stock, action: 'BUY' | 'SELL' = 'BUY') => {
    setTradeModalStock(stock);
    setTradeModalAction(action);
    setIsTradeModalOpen(true);
  };

  const handleOpenStockDetail = (stock: Stock) => {
    setDetailModalStock(stock);
    setIsDetailModalOpen(true);
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setIsLessonModalOpen(true);
  };

  const handleOpenCreateAlert = (stock?: Stock, condition: 'ABOVE' | 'BELOW' = 'ABOVE') => {
    setAlertModalStock(stock || stocks[0]);
    setAlertModalCondition(condition);
    setIsAlertModalOpen(true);
  };

  const handleQuickTrade = () => {
    handleOpenTrade(stocks[0], 'BUY');
  };

  if (currentTab === 'landing') {
    return (
      <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col">
        <LandingPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col antialiased">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        onOpenQuickTrade={handleQuickTrade}
        onOpenCreateAlert={handleOpenCreateAlert}
        onOpenTrade={handleOpenTrade}
      />

      {/* Workspace Split: Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto pb-20 lg:pb-8 flex flex-col">
          {currentTab === 'dashboard' && (
            <DashboardView
              onOpenTrade={handleOpenTrade}
              onOpenStockDetail={handleOpenStockDetail}
              onOpenCreateAlert={handleOpenCreateAlert}
            />
          )}

          {currentTab === 'mentor' && <MentorView />}

          {currentTab === 'news' && (
            <NewsView
              onOpenTrade={handleOpenTrade}
              onOpenStockDetail={handleOpenStockDetail}
            />
          )}

          {currentTab === 'market' && (
            <ExploreMarketView
              onOpenTrade={handleOpenTrade}
              onOpenStockDetail={handleOpenStockDetail}
              onOpenCreateAlert={handleOpenCreateAlert}
            />
          )}

          {currentTab === 'portfolio' && (
            <PortfolioView
              onOpenTrade={handleOpenTrade}
              onOpenStockDetail={handleOpenStockDetail}
            />
          )}

          {currentTab === 'trade' && (
            <VirtualTradeView onOpenStockDetail={handleOpenStockDetail} />
          )}

          {currentTab === 'watchlist' && (
            <WatchlistView
              onOpenTrade={handleOpenTrade}
              onOpenStockDetail={handleOpenStockDetail}
              onOpenCreateAlert={handleOpenCreateAlert}
            />
          )}

          {currentTab === 'learn' && (
            <LearnView onOpenLesson={handleOpenLesson} />
          )}

          {currentTab === 'achievements' && <AchievementsView />}

          {currentTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Navigation bar */}
      <MobileNav />

      {/* Modals */}
      <TradeModal
        stock={tradeModalStock}
        isOpen={isTradeModalOpen}
        onClose={() => setIsTradeModalOpen(false)}
        defaultAction={tradeModalAction}
      />

      <StockDetailModal
        stock={detailModalStock}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onOpenTrade={handleOpenTrade}
        onOpenCreateAlert={handleOpenCreateAlert}
      />

      <LessonQuizModal
        lesson={selectedLesson}
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
      />

      <PriceAlertModal
        stock={alertModalStock}
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        defaultCondition={alertModalCondition}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <InvestProvider>
      <MainAppContent />
    </InvestProvider>
  );
}
