/**
 * RevenueBarChart Component
 * Bar chart showing revenue by service or staff
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#eab308', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

export default function RevenueBarChart({ data, dataKey, labelKey, title }) {
  const t = useTranslations('dashboard.analytics.charts.revenue');
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        {t('noData')}
      </div>
    );
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Truncate long labels
  const truncateLabel = (label) => {
    if (!label) return '';
    return label.length > 15 ? label.substring(0, 12) + '...' : label;
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-lg">
          <p className="font-semibold text-slate-900 mb-1">{data[labelKey]}</p>
          <p className="text-sm text-slate-600">
            {t('revenue')}: {formatCurrency(data.revenue)}
          </p>
          <p className="text-sm text-slate-600">
            {t('bookings')}: {data.bookingCount}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey={labelKey}
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={{ stroke: '#e2e8f0' }}
          angle={-45}
          textAnchor="end"
          height={80}
          tickFormatter={truncateLabel}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={{ stroke: '#e2e8f0' }}
          tickFormatter={formatCurrency}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
