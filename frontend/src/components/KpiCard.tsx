import React from 'react';

interface KpiCardProps {
  intent: string;
  data: Record<string, unknown>[];
}

export const KpiCard: React.FC<KpiCardProps> = ({ intent, data }) => {
  const row = data[0] || {};

  // Formatter helpers with explicit en-US locale for consistent standard banking formatting
  const formatCurrency = (val: unknown): string => {
    const num = typeof val === 'number' ? val : Number(val);
    if (isNaN(num)) return '$0.00';
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (val: unknown): string => {
    const num = typeof val === 'number' ? val : Number(val);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US');
  };

  if (intent === 'customer_count') {
    const totalCustomers = row['total_customers'];
    return (
      <div className="kpi-display-container">
        <div className="kpi-main-box">
          <span className="kpi-stat-label">Total Registered Customers</span>
          <div className="kpi-stat-primary-value">{formatNumber(totalCustomers)}</div>
          <span className="kpi-stat-subtext">Active accounts across regional branch locations</span>
        </div>
      </div>
    );
  }

  if (intent === 'total_transactions') {
    const totalAmount = row['total_amount'];
    const totalCount = row['total_count'];
    const avgAmount = row['average_amount'];
    const minAmount = row['min_amount'];
    const maxAmount = row['max_amount'];

    return (
      <div className="kpi-display-container">
        <div className="kpi-main-box kpi-highlight-green">
          <span className="kpi-stat-label">Total Transaction Volume</span>
          <div className="kpi-stat-primary-value">{formatCurrency(totalAmount)}</div>
          <span className="kpi-stat-subtext">Cumulative sum of all settled transactions</span>
        </div>

        <div className="kpi-submetrics-grid">
          <div className="kpi-submetric-card">
            <span className="submetric-label">Transaction Count</span>
            <span className="submetric-val">{formatNumber(totalCount)}</span>
          </div>
          <div className="kpi-submetric-card">
            <span className="submetric-label">Average Transaction</span>
            <span className="submetric-val">{formatCurrency(avgAmount)}</span>
          </div>
          <div className="kpi-submetric-card">
            <span className="submetric-label">Min / Max Range</span>
            <span className="submetric-val">
              {formatCurrency(minAmount)} - {formatCurrency(maxAmount)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for general single-record KPI responses
  const keys = Object.keys(row);
  return (
    <div className="kpi-display-container">
      <div className="kpi-main-box">
        {keys.map((key) => (
          <div key={key} className="kpi-fallback-row">
            <span className="kpi-stat-label">{key.replace(/_/g, ' ').toUpperCase()}</span>
            <div className="kpi-stat-primary-value">
              {typeof row[key] === 'number' ? formatNumber(row[key]) : String(row[key])}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
