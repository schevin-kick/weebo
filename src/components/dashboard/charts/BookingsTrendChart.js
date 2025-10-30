/**
 * BookingsTrendChart Component
 * Line/Area chart showing booking trends over time
 */

'use client';

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export default function BookingsTrendChart({ data, groupBy = 'day' }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        No data available for the selected period
      </div>
    );
  }

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    if (groupBy === 'day') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'week') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else if (groupBy === 'month') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    }
    return dateStr;
  };

  const formattedData = data.map(item => ({
    ...item,
    dateFormatted: formatDate(item.date),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="dateFormatted"
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={{ stroke: '#e2e8f0' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Legend
          wrapperStyle={{ paddingTop: '20px' }}
          iconType="circle"
        />
        <Area
          type="monotone"
          dataKey="total"
          stroke="#f97316"
          strokeWidth={2}
          fill="url(#colorTotal)"
          name="Total Bookings"
        />
        <Area
          type="monotone"
          dataKey="completed"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#colorCompleted)"
          name="Completed"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
