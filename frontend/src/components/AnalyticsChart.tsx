import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { VisualizationType } from '../types';

interface AnalyticsChartProps {
  intent: string;
  defaultVisualization: VisualizationType;
  data: Record<string, unknown>[];
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#10b981', // green
  PENDING: '#f59e0b',  // amber
  REJECTED: '#ef4444', // red
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  intent,
  defaultVisualization,
  data,
}) => {
  // Allow toggling between bar and line chart when applicable
  const [chartMode, setChartMode] = useState<'bar' | 'line' | 'pie'>(() => {
    if (defaultVisualization === 'pie') return 'pie';
    if (defaultVisualization === 'line') return 'line';
    return 'bar';
  });

  if (!data || data.length === 0) {
    return <div className="chart-empty-state">No chart data available.</div>;
  }

  // 1. Pie Chart: For application_status
  if (chartMode === 'pie' || defaultVisualization === 'pie') {
    const totalCount = data.reduce((acc, row) => acc + Number(row['count'] || 0), 0);

    return (
      <div className="bank-chart-card">
        <div className="bank-chart-header">
          <div>
            <h4 className="chart-title">Onboarding Applications Breakdown</h4>
            <span className="chart-subtitle">Distribution across approval lifecycle</span>
          </div>
        </div>

        <div className="chart-render-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, idx) => {
                  const statusKey = String(entry['status'] || '');
                  const fill = STATUS_COLORS[statusKey] || (idx === 0 ? '#3b82f6' : '#8b5cf6');
                  return <Cell key={`cell-${idx}`} fill={fill} />;
                })}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [
                  `${val} files (${((val / (totalCount || 1)) * 100).toFixed(1)}%)`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 2. Monthly Transactions Trend: Supports both Bar and Line charts
  if (intent === 'monthly_transactions') {
    return (
      <div className="bank-chart-card">
        <div className="bank-chart-header">
          <div>
            <h4 className="chart-title">Monthly Transaction Activity Trends</h4>
            <span className="chart-subtitle">Settlement volume ($) and transaction count across timeline</span>
          </div>
          <div className="chart-mode-toggle">
            <button
              type="button"
              className={`toggle-btn ${chartMode === 'bar' ? 'active' : ''}`}
              onClick={() => setChartMode('bar')}
            >
              Bar View
            </button>
            <button
              type="button"
              className={`toggle-btn ${chartMode === 'line' ? 'active' : ''}`}
              onClick={() => setChartMode('line')}
            >
              Line Trend
            </button>
          </div>
        </div>

        <div className="chart-render-wrapper">
          <ResponsiveContainer width="100%" height={320}>
            {chartMode === 'line' ? (
              <LineChart data={data} margin={{ top: 10, right: 25, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} angle={-30} textAnchor="end" />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Monthly Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Line
                  type="monotone"
                  dataKey="total_amount"
                  name="Volume ($)"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#2563eb' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart data={data} margin={{ top: 10, right: 25, left: 10, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} angle={-30} textAnchor="end" />
                <YAxis
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(val: number) => [`$${val.toLocaleString()}`, 'Monthly Volume']}
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="total_amount" name="Volume ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // 3. Branch Customers Distribution: Bar Chart
  if (intent === 'branch_customers') {
    return (
      <div className="bank-chart-card">
        <div className="bank-chart-header">
          <div>
            <h4 className="chart-title">Customer Distribution by Branch</h4>
            <span className="chart-subtitle">Active clients registered across regional banking hubs</span>
          </div>
        </div>

        <div className="chart-render-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 40, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
              <YAxis
                dataKey="branch_name"
                type="category"
                width={160}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip
                formatter={(val: number) => [`${val} customers`, 'Registered Clients']}
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px' }}
              />
              <Legend verticalAlign="top" height={30} />
              <Bar dataKey="customer_count" name="Customers" fill="#0284c7" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  }

  // Fallback Generic Bar Chart
  const sample = data[0] || {};
  const numericKey = Object.keys(sample).find((k) => typeof sample[k] === 'number') || '';
  const labelKey = Object.keys(sample).find((k) => typeof sample[k] === 'string') || '';

  return (
    <div className="bank-chart-card">
      <div className="chart-render-wrapper">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey={labelKey} tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey={numericKey} fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
