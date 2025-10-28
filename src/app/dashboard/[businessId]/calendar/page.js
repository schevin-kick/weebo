/**
 * Calendar Page
 * Entry point for calendar view - now uses DashboardContainer
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function CalendarPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="calendar" />;
}
