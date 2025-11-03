/**
 * Dashboard Home/Metrics Page
 * Entry point for dashboard home view - now uses DashboardContainer
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from './DashboardContainer';

export default function DashboardHomePage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="home" />;
}
