import React from 'react';
import { SupportedIntentGuide } from '../types';

interface ErrorMessageProps {
  error: string;
  supportedIntents?: SupportedIntentGuide[];
  onSelectIntent?: (example: string) => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  supportedIntents,
  onSelectIntent,
}) => {
  return (
    <div className="bank-error-box">
      <div className="error-header-row">
        <span className="error-icon">⚠️</span>
        <span className="error-title">Inquiry Notice</span>
      </div>
      <p className="error-message-text">{error}</p>

      {supportedIntents && supportedIntents.length > 0 && (
        <div className="supported-intents-recovery">
          <span className="recovery-title">You can ask questions such as:</span>
          <div className="recovery-pills-grid">
            {supportedIntents.map((item) => (
              <button
                key={item.intent}
                type="button"
                className="recovery-pill-btn"
                onClick={() => onSelectIntent?.(item.example)}
              >
                &ldquo;{item.example}&rdquo;
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
