import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ThemeToggle from './components/ThemeToggle';
import URADashboard from './pages/URADashboard';
import SankeyDiagramPage from './pages/SankeyDiagramPage';
import CallAnalysisPage from './pages/CallAnalysisPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('ura-dashboard');

  return (
    <div className="app">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <div className="app-content">
        <header className="app-header">
          <div className="header-actions">
            <ThemeToggle />
          </div>
        </header>

        <main className="app-main">
          {currentView === 'ura-dashboard' && <URADashboard />}
          {currentView === 'sankey-custom' && <SankeyDiagramPage />}
          {currentView === 'call-analysis' && <CallAnalysisPage />}
        </main>

        <footer className="app-footer">
          <p>Dashboard Analytics - Processamento In-Memory com React e D3.js</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
