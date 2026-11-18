import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MonthlyVolume } from '../types';

interface MonthlyVolumeChartProps {
  data: MonthlyVolume[];
}

export const MonthlyVolumeChart: React.FC<MonthlyVolumeChartProps> = ({ data }) => {
  const formattedData = data.map((d) => ({
    ...d,
    formattedAmount: `$${d.total_amount.toLocaleString()}`,
  }));

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3 className="chart-title">Monthly Transaction Volume & Trends</h3>
          <p className="chart-description">Aggregated transaction values across multiple months</p>
        </div>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={formattedData} margin={{ top: 10, right: 20, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#64748b' }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(val: number) => `$${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Total Volume']}
              labelFormatter={(label: string) => `Month: ${label}`}
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
            />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="total_amount" name="Volume ($)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
