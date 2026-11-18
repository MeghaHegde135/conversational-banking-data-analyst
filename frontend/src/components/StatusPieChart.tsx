import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { StatusBreakdown } from '../types';

interface StatusPieChartProps {
  data: StatusBreakdown[];
}

const STATUS_COLORS: Record<string, string> = {
  APPROVED: '#10b981', // emerald green
  PENDING: '#f59e0b',  // warm amber
  REJECTED: '#ef4444', // crimson red
};

export const StatusPieChart: React.FC<StatusPieChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Onboarding Applications Status</h3>
          <p className="chart-description">Distribution of Approved, Pending, and Rejected files</p>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={100}
              paddingAngle={5}
              dataKey="count"
              nameKey="status"
            >
              {data.map((entry) => (
                <Cell
                  key={`cell-${entry.status}`}
                  fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [
                `${value} applications (${((value / (total || 1)) * 100).toFixed(1)}%)`,
                name,
              ]}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend verticalAlign="bottom" height={36} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
