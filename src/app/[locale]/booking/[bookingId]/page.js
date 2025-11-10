/**
 * Mobile Booking Detail Page
 * Public view for a single booking (no authentication required)
 * Accessed via LINE notification link
 * Security: Booking ID acts as access key (UUID is unguessable)
 */

import { notFound } from 'next/navigation';
import prisma from '@/lib/prisma';
import BookingDetailMobile from '@/components/booking/BookingDetailMobile';

export default async function BookingDetailPage({ params }) {
  const { bookingId } = await params;

  // Fetch booking with all relations (no auth required)
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

  return <BookingDetailMobile booking={booking} />;
}
