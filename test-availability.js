// Quick test script to verify the availability API endpoint
const BASE_URL = 'http://localhost:3000';

async function testAvailabilityAPI() {
  console.log('Testing Availability API...\n');

  // You'll need to replace these with actual values from your database
  const testBusinessId = 'YOUR_BUSINESS_ID_HERE'; // Replace with actual business ID
  const testDate = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD format

  try {
    console.log(`Fetching availability for business: ${testBusinessId}`);
    console.log(`Date: ${testDate}\n`);

    const url = new URL('/api/bookings/availability', BASE_URL);
    url.searchParams.set('businessId', testBusinessId);
    url.searchParams.set('date', testDate);

    const response = await fetch(url);

    if (!response.ok) {
      console.error('❌ API Error:', response.status, response.statusText);
      const error = await response.json();
      console.error('Error details:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    console.log(`\nFound ${data.bookings?.length || 0} bookings for this date`);

    if (data.bookings && data.bookings.length > 0) {
      console.log('\nBooking details:');
      data.bookings.forEach((booking, index) => {
        const bookingTime = new Date(booking.dateTime);
        console.log(`  ${index + 1}. ${bookingTime.toLocaleTimeString()} - Duration: ${booking.duration} min`);
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions
console.log('='.repeat(60));
console.log('AVAILABILITY API TEST SCRIPT');
console.log('='.repeat(60));
console.log('\nBefore running this test:');
console.log('1. Open this file and replace YOUR_BUSINESS_ID_HERE with a real business ID');
console.log('2. Make sure your development server is running (npm run dev)');
console.log('3. Run: node test-availability.js\n');
console.log('='.repeat(60));
console.log('\nTo find a business ID, check your database or browser network tab\n');

testAvailabilityAPI();
