/**
 * Holiday Hours Page
 * Entry point for holiday hours view - now uses DashboardContainer
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function HolidayHoursPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="holiday-hours" />;
}
