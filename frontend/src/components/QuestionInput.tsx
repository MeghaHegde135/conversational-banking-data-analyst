import React, { useState } from 'react';

interface QuestionInputProps {
  onSubmit: (question: string) => void;
  isLoading: boolean;
}

const MAX_CHAR_LIMIT = 500;

export const QuestionInput: React.FC<QuestionInputProps> = ({ onSubmit, isLoading }) => {
  const [inputVal, setInputVal] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.length <= MAX_CHAR_LIMIT) {
      setInputVal(val);
      if (validationError && val.trim().length > 0) {
        setValidationError(null);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputVal.trim();

    if (!trimmed) {
      setValidationError('Please enter a question to analyze.');
      return;
    }

    if (trimmed.length > MAX_CHAR_LIMIT) {
      setValidationError(`Question cannot exceed ${MAX_CHAR_LIMIT} characters.`);
      return;
    }

    setValidationError(null);
    onSubmit(trimmed);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="bank-input-panel">
      {validationError && (
        <div className="input-validation-tooltip">
          ⚠️ {validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bank-input-form">
        <div className="bank-input-wrapper">
          <input
            type="text"
            value={inputVal}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask a banking analytics inquiry (e.g., 'What is the total transaction amount?')"
            disabled={isLoading}
            className={`bank-chat-input ${validationError ? 'input-error-border' : ''}`}
            maxLength={MAX_CHAR_LIMIT}
          />
          <span className="char-counter">
            {inputVal.length}/{MAX_CHAR_LIMIT}
          </span>
        </div>

        <button
          type="submit"
          disabled={isLoading || inputVal.trim().length === 0}
          className="bank-send-button"
        >
          {isLoading ? (
            <span className="btn-spinner" />
          ) : (
            <>
              <span>Ask Analyst</span>
              <span className="send-arrow">➔</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
