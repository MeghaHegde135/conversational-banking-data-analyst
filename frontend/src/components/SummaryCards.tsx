import React from 'react';
import { AnalyticsSummary } from '../types';

interface SummaryCardsProps {
  summary: AnalyticsSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
  const cards = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers.toLocaleString(),
      subtitle: 'Across regional branches',
      icon: '👥',
      accent: 'card-accent-blue',
    },
    {
      title: 'Active Branches',
      value: summary.totalBranches.toLocaleString(),
      subtitle: 'Multi-city financial network',
      icon: '🏛️',
      accent: 'card-accent-purple',
    },
    {
      title: 'Total Transaction Volume',
      value: `$${summary.totalTransactionsAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: `${summary.totalTransactionsCount} recorded transactions`,
      icon: '💰',
      accent: 'card-accent-green',
    },
    {
      title: 'Applications Monitored',
      value: summary.applicationBreakdown.reduce((acc, curr) => acc + curr.count, 0).toString(),
      subtitle: 'Approved, Pending & Rejected',
      icon: '📑',
      accent: 'card-accent-amber',
    },
  ];

  return (
    <div className="kpi-grid">
      {cards.map((card) => (
        <div key={card.title} className={`kpi-card ${card.accent}`}>
          <div className="kpi-header">
            <span className="kpi-title">{card.title}</span>
            <span className="kpi-icon">{card.icon}</span>
          </div>
          <div className="kpi-value">{card.value}</div>
          <div className="kpi-subtitle">{card.subtitle}</div>
        </div>
      ))}
    </div>
  );
};
