/**
 * Analytics Page
 * Dashboard analytics with charts and performance metrics
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function AnalyticsPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="analytics" />;
}
