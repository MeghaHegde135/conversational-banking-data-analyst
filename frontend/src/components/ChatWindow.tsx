import React, { useEffect, useRef } from 'react';
import { ChatMessageItem } from '../types';
import { ChatMessage } from './ChatMessage';
import { LoadingIndicator } from './LoadingIndicator';

interface ChatWindowProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
  onSelectSuggestedQuestion: (question: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  onSelectSuggestedQuestion,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="bank-chat-window">
      {messages.length === 0 ? (
        <div className="bank-welcome-screen">
          <div className="welcome-icon-box">🏦</div>
          <h2 className="welcome-title">Financial Intelligence & Data Analysis</h2>
          <p className="welcome-text">
            Ask conversational questions against the banking SQLite database. Queries
            are classified, verified against the approved registry, and visualized dynamically.
          </p>

          <div className="welcome-capabilities-grid">
            <div
              className="capability-card"
              onClick={() => onSelectSuggestedQuestion('How many customers do we have?')}
            >
              <div className="cap-icon">👥</div>
              <div className="cap-title">Customer Portfolio</div>
              <div className="cap-desc">Total registered client counts and metrics</div>
            </div>

            <div
              className="capability-card"
              onClick={() => onSelectSuggestedQuestion('Show pending onboarding applications')}
            >
              <div className="cap-icon">⏳</div>
              <div className="cap-title">Onboarding Pipeline</div>
              <div className="cap-desc">Review pending compliance and risk files</div>
            </div>

            <div
              className="capability-card"
              onClick={() => onSelectSuggestedQuestion('Which branches have the most customers?')}
            >
              <div className="cap-icon">🏛️</div>
              <div className="cap-title">Branch Performance</div>
              <div className="cap-desc">Multi-city branch distribution analytics</div>
            </div>

            <div
              className="capability-card"
              onClick={() => onSelectSuggestedQuestion('Show monthly transaction trends')}
            >
              <div className="cap-icon">📈</div>
              <div className="cap-title">Transaction Trends</div>
              <div className="cap-desc">Time-series volume and settlement trends</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="messages-stream">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectSuggestedQuestion={onSelectSuggestedQuestion}
            />
          ))}

          {isLoading && <LoadingIndicator />}

          <div ref={bottomRef} className="scroll-anchor" />
        </div>
      )}
    </div>
  );
};
