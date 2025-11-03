/**
 * QR Code Page
 * Entry point for QR code generator view - now uses DashboardContainer
 */

'use client';

import { useParams } from 'next/navigation';
import DashboardContainer from '../DashboardContainer';

export default function QRCodePage() {
  const params = useParams();
  const businessId = params.businessId;

  return <DashboardContainer businessId={businessId} view="qr-code" />;
}
