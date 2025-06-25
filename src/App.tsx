import React, { useState, useEffect, useContext } from 'react';
import { WorkerUrlProvider, WorkerUrlContext } from './contexts/WorkerUrlContext';
import { ToastProvider, ToastContext } from './contexts/ToastContext';
import UserView from './views/UserView';
import AdminView from './views/AdminView';
import ConfigPanel from './components/ConfigPanel';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<'user' | 'admin'>('user');
  const [showConfigPanel, setShowConfigPanel] = useState<boolean>(false);
  const workerUrlCtx = useContext(WorkerUrlContext);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      setCurrentView('admin');
    } else {
      setCurrentView('user');
    }
    // Listen to popstate for browser back/forward navigation
    const handlePopState = () => {
        const newPath = window.location.pathname;
        if (newPath.startsWith('/admin')) {
            setCurrentView('admin');
        } else {
            setCurrentView('user');
        }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!workerUrlCtx) return <div>Loading configuration...</div>; // Should not happen if provider is set up
  const { workerUrl } = workerUrlCtx;


  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-section">
          <span className="icon" role="img" aria-label="key icon">🔑</span>
          <h1>FuClaude Pool Manager</h1>
        </div>
        <div className="controls-section">
          <span className="current-worker-url-display" aria-label={`Current Worker URL: ${workerUrl}`}>
            当前URL: {workerUrl}
          </span>
          <button
            onClick={() => setShowConfigPanel(!showConfigPanel)}
            className="config-toggle-button"
            aria-label="服务配置"
            aria-expanded={showConfigPanel}
            title="服务配置"
          >
            ⚙️
          </button>
        </div>
      </header>

      {showConfigPanel && <ConfigPanel onClose={() => setShowConfigPanel(false)} />}
      
      {currentView === 'user' ? <UserView /> : <AdminView />}
      
      <footer className="main-footer">
        <a href="https://github.com/f14XuanLv/fuclaude-pool-manager-ui" target="_blank" rel="noopener noreferrer" aria-label="Frontend Source Code">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="github-icon">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Frontend Project
        </a>
        <span className="footer-separator">|</span>
        <a href="https://github.com/f14XuanLv/fuclaude-pool-manager" target="_blank" rel="noopener noreferrer" aria-label="Backend Source Code">
          Backend Project
        </a>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <WorkerUrlProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </WorkerUrlProvider>
  );
};

export default App;
