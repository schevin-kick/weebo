/**
 * Messaging Settings Page
 * Entry point for messaging configuration view
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function MessagingPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="messaging" />;
}
