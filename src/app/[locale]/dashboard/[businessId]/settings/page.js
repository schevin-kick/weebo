/**
 * Settings Page
 * Entry point for settings view - now uses DashboardContainer
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function SettingsPage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="settings" />;
}
