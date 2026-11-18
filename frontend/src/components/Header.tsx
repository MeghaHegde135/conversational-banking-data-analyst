import React from 'react';

interface HeaderProps {
  isBackendHealthy: boolean;
  onResetChat: () => void;
  messageCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isBackendHealthy,
  onResetChat,
  messageCount,
}) => {
  return (
    <header className="bank-header">
      <div className="bank-header-left">
        <div className="bank-logo-badge">
          <span className="logo-symbol">⟁</span>
          <span className="logo-text">CBDA</span>
        </div>
        <div className="bank-header-title-group">
          <h1 className="bank-title">Conversational Banking Data Analyst</h1>
          <p className="bank-subtitle">
            Enterprise Financial Intelligence &bull; Strictly Parameterized SQL Engine
          </p>
        </div>
      </div>

      <div className="bank-header-right">
        <div className="system-status-indicator">
          <span
            className={`status-dot ${isBackendHealthy ? 'status-online' : 'status-offline'}`}
          />
          <span className="status-label">
            {isBackendHealthy ? 'SQLite Live' : 'Connecting...'}
          </span>
        </div>

        {messageCount > 0 && (
          <button
            type="button"
            onClick={onResetChat}
            className="bank-btn-secondary"
            title="Start fresh conversation"
          >
            Clear Thread
          </button>
        )}
      </div>
    </header>
  );
};
