/**
 * Mobile Booking Detail Page
 * Standalone, authenticated view for a single booking
 * Accessed via LINE notification link
 */

import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import BookingDetailMobile from '@/components/booking/BookingDetailMobile';

export default async function BookingDetailPage({ params }) {
  const { bookingId } = await params;

  // Require authentication
  const session = await getSession();
  if (!session) {
    redirect('/api/auth/login');
  }

  // Fetch booking with all relations
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      business: {
        include: {
          owner: true,
          pages: {
            select: {
              components: true,
            },
          },
        },
      },
      customer: {
        select: {
          displayName: true,
          pictureUrl: true,
        },
      },
      service: {
        select: {
          name: true,
          duration: true,
          price: true,
        },
      },
      staff: {
        select: {
          name: true,
          photoUrl: true,
        },
      },
    },
  });

  if (!booking) {
    notFound();
  }

  // CRITICAL: Verify ownership
  if (booking.business.ownerId !== session.id) {
    redirect('/dashboard');
  }

  return <BookingDetailMobile booking={booking} />;
}
