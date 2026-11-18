import React, { useState } from 'react';
import { ChatMessageItem } from '../types';
import { KpiCard } from './KpiCard';
import { DataTable } from './DataTable';
import { AnalyticsChart } from './AnalyticsChart';
import { ErrorMessage } from './ErrorMessage';

interface ChatMessageProps {
  message: ChatMessageItem;
  onSelectSuggestedQuestion: (question: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSelectSuggestedQuestion,
}) => {
  const [copyAnswerSuccess, setCopyAnswerSuccess] = useState(false);
  const [copyDataSuccess, setCopyDataSuccess] = useState(false);

  const isUser = message.sender === 'user';

  const handleCopyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopyAnswerSuccess(true);
      setTimeout(() => setCopyAnswerSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy answer:', err);
    }
  };

  const handleCopyData = async () => {
    if (!message.response?.data) return;
    try {
      const dataStr = JSON.stringify(message.response.data, null, 2);
      await navigator.clipboard.writeText(dataStr);
      setCopyDataSuccess(true);
      setTimeout(() => setCopyDataSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy data JSON:', err);
    }
  };

  if (isUser) {
    return (
      <div className="message-wrapper message-user-wrapper">
        <div className="message-bubble message-user-bubble">
          <div className="message-text">{message.content}</div>
          <span className="message-time">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  // Assistant Message
  const res = message.response;
  const hasData = res && Array.isArray(res.data) && res.data.length > 0;

  return (
    <div className="message-wrapper message-assistant-wrapper">
      <div className="assistant-avatar">⟁</div>

      <div className="message-assistant-body">
        {/* Assistant Header Metadata */}
        <div className="assistant-meta-row">
          <span className="assistant-label">Banking Analyst Intelligence</span>
          {res?.intent && res.intent !== 'unsupported' && (
            <span className="intent-badge">Intent: {res.intent}</span>
          )}
          {res?.dataset && res.dataset !== 'none' && (
            <span className="dataset-badge">Dataset: {res.dataset}</span>
          )}
          <span className="message-time">{message.timestamp}</span>
        </div>

        {/* Natural Language Answer / Error */}
        {message.error ? (
          <ErrorMessage
            error={message.error}
            supportedIntents={message.supportedIntents}
            onSelectIntent={onSelectSuggestedQuestion}
          />
        ) : (
          <div className="assistant-answer-text">{message.content}</div>
        )}

        {/* Dynamic Visualization Container: dynamically selected from backend response */}
        {hasData && res && (
          <div className="visualization-wrapper">
            {res.visualization === 'kpi' && (
              <KpiCard intent={res.intent} data={res.data} />
            )}

            {res.visualization === 'table' && (
              <DataTable
                data={res.data}
                title={`Onboarding Records (${res.data.length} files)`}
              />
            )}

            {(res.visualization === 'bar' ||
              res.visualization === 'line' ||
              res.visualization === 'pie') && (
              <AnalyticsChart
                intent={res.intent}
                defaultVisualization={res.visualization}
                data={res.data}
              />
            )}
          </div>
        )}

        {/* Message Actions Toolbar (Copy Answer / Copy Data) */}
        {!message.error && (
          <div className="assistant-actions-toolbar">
            <button
              type="button"
              className="action-btn"
              onClick={handleCopyAnswer}
              title="Copy narrative answer to clipboard"
            >
              {copyAnswerSuccess ? '✓ Copied Answer' : '📋 Copy Answer'}
            </button>

            {hasData && (
              <button
                type="button"
                className="action-btn"
                onClick={handleCopyData}
                title="Copy underlying dataset as JSON"
              >
                {copyDataSuccess ? '✓ Copied JSON Data' : '💾 Copy Raw Data'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
