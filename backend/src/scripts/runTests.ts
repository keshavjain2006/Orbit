import 'dotenv/config';
import { seedDatabase } from './seedTestData';
import { testQueries } from './testQueries';

/**
 * Main test runner - seeds data and then runs queries
 * Run with: npx tsx src/scripts/runTests.ts
 */

async function runAllTests() {
  console.log('🚀 Starting Full Database Test Suite\n');
  console.log('='.repeat(60));
  console.log('');

  try {
    // Step 1: Seed database
    console.log('STEP 1: Seeding Database with Test Data');
    console.log('-'.repeat(60));
    await seedDatabase();
    console.log('');

    // Step 2: Run queries
    console.log('STEP 2: Running Test Queries');
    console.log('-'.repeat(60));
    await testQueries();

    console.log('='.repeat(60));
    console.log('🎉 All tests passed successfully!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { runAllTests };

