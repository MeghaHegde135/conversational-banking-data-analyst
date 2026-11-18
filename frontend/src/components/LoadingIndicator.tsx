import React from 'react';

export const LoadingIndicator: React.FC = () => {
  return (
    <div className="bank-loading-bubble">
      <div className="loading-avatar">⟁</div>
      <div className="loading-content-box">
        <div className="loading-dots-row">
          <span className="pulsing-dot" />
          <span className="pulsing-dot" />
          <span className="pulsing-dot" />
        </div>
        <span className="loading-status-text">
          Classifying inquiry &bull; Executing parameterized SQL query...
        </span>
      </div>
    </div>
  );
};
