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
