/**
 * Dashboard Layout
 * Wraps all dashboard pages with subscription check
 */

import SubscriptionCheck from '@/components/SubscriptionCheck';

export default function DashboardLayout({ children }) {
  return <SubscriptionCheck>{children}</SubscriptionCheck>;
}
