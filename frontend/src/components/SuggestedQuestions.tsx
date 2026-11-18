import React from 'react';

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void;
  isLoading: boolean;
}

const SUGGESTIONS = [
  { label: 'Customer Count', text: 'How many customers do we have?', icon: '👥' },
  { label: 'Pending Files', text: 'Show pending onboarding applications', icon: '⏳' },
  { label: 'Application Status', text: 'Show applications by status', icon: '📊' },
  { label: 'Top Branches', text: 'Which branches have the most customers?', icon: '🏛️' },
  { label: 'Total Volume', text: 'What is the total transaction amount?', icon: '💵' },
  { label: 'Monthly Trends', text: 'Show monthly transaction trends', icon: '📈' },
];

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  onSelectQuestion,
  isLoading,
}) => {
  return (
    <div className="suggested-questions-tray">
      <span className="suggested-label">Suggested Inquiries:</span>
      <div className="suggested-chips-wrapper">
        {SUGGESTIONS.map((s) => (
          <button
            key={s.label}
            type="button"
            className="suggested-chip"
            onClick={() => onSelectQuestion(s.text)}
            disabled={isLoading}
            title={s.text}
          >
            <span className="chip-icon">{s.icon}</span>
            <span className="chip-text">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
