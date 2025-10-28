import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== BusinessOwner Records ===');
  const owners = await prisma.businessOwner.findMany();
  console.log(JSON.stringify(owners, null, 2));

  console.log('\n=== Business Records ===');
  const businesses = await prisma.business.findMany({
    include: {
      _count: {
        select: {
          services: true,
          staff: true,
          pages: true,
          bookings: true,
        }
      }
    }
  });
  console.log(JSON.stringify(businesses, null, 2));

  console.log('\n=== Service Records ===');
  const services = await prisma.service.findMany();
  console.log(JSON.stringify(services, null, 2));

  console.log('\n=== Staff Records ===');
  const staff = await prisma.staff.findMany();
  console.log(JSON.stringify(staff, null, 2));

  console.log('\n=== Page Records ===');
  const pages = await prisma.page.findMany();
  console.log(JSON.stringify(pages, null, 2));

  console.log('\n=== Customer Records ===');
  const customers = await prisma.customer.findMany();
  console.log(JSON.stringify(customers, null, 2));

  console.log('\n=== Booking Records ===');
  const bookings = await prisma.booking.findMany();
  console.log(JSON.stringify(bookings, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
