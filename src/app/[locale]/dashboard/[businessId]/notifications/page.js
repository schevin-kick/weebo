/**
 * Notifications Settings Page
 * Route: /dashboard/[businessId]/notifications
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function NotificationsPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="notifications" />;
}
