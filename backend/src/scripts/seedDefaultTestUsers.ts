import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed default test users that will appear in Potential Waves
 * These are real users in the database that you can interact with
 */
async function seedDefaultTestUsers() {
  console.log('👥 Seeding default test users for Potential Waves...\n');

  try {
    // Create or update default test users with fixed IDs for consistency
    const testUsers = [
      {
        id: '11111111-1111-1111-1111-111111111111',
        name: 'Alex Morgan',
        pronouns: 'they/them',
        bio: 'Love hiking and coffee! Always up for a chat. 🏔️☕',
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        name: 'Sam Chen',
        pronouns: 'he/him',
        bio: 'Tech enthusiast and bookworm. Let\'s connect! 💻📚',
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        name: 'Jordan Taylor',
        pronouns: 'she/her',
        bio: 'Designer & runner. Always exploring new places! 🎨🏃‍♀️',
      },
      {
        id: '44444444-4444-4444-4444-444444444444',
        name: 'Riley Kim',
        pronouns: 'they/them',
        bio: 'Foodie exploring the city. Let\'s grab coffee! 🍕☕',
      },
      {
        id: '55555555-5555-5555-5555-555555555555',
        name: 'Casey Johnson',
        pronouns: 'he/him',
        bio: 'Musician and photographer. Love meeting new people! 🎵📸',
      },
      {
        id: '66666666-6666-6666-6666-666666666666',
        name: 'Morgan Lee',
        pronouns: 'she/her',
        bio: 'Yoga instructor and travel lover. Namaste! 🧘‍♀️✈️',
      },
    ];

    console.log('📝 Creating/updating test users...\n');
    const createdUsers = [];

    for (const userData of testUsers) {
      const user = await prisma.user.upsert({
        where: { id: userData.id },
        update: {
          name: userData.name,
          pronouns: userData.pronouns,
          bio: userData.bio,
        },
        create: userData,
      });
      createdUsers.push(user);
      console.log(`  ✅ ${user.name} (${user.id.substring(0, 8)}...)`);
    }

    console.log(`\n✅ Created/updated ${createdUsers.length} test users!\n`);

    // Get the current user (most recent, but NOT one of the test users)
    const testUserIds = testUsers.map(u => u.id);
    
    let currentUser = await prisma.user.findFirst({
      where: { 
        name: 'H',
        NOT: { id: { in: testUserIds } }
      },
    });

    if (!currentUser) {
      currentUser = await prisma.user.findFirst({
        where: {
          NOT: { id: { in: testUserIds } }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (currentUser) {
      console.log(`👤 Your user: ${currentUser.name} (${currentUser.id.substring(0, 8)}...)\n`);
      
      // Create 3-5 encounters with each test user (within last 14 days)
      console.log('🌊 Creating encounters so they appear in Potential Waves...\n');
      const now = new Date();
      let totalEncounters = 0;

      for (const testUser of createdUsers) {
        // Skip if test user is the same as current user
        if (testUser.id === currentUser.id) {
          console.log(`  ⏭️  Skipping ${testUser.name} (same as current user)`);
          continue;
        }
        const encounterCount = Math.floor(Math.random() * 3) + 3; // 3-5 encounters
        console.log(`  📍 Creating ${encounterCount} encounters with ${testUser.name}...`);

        const [user1Id, user2Id] = 
          currentUser.id < testUser.id 
            ? [currentUser.id, testUser.id]
            : [testUser.id, currentUser.id];

        for (let i = 0; i < encounterCount; i++) {
          const daysAgo = Math.floor(Math.random() * 14);
          const hoursAgo = Math.floor(Math.random() * 24);
          const encounteredAt = new Date(now);
          encounteredAt.setDate(encounteredAt.getDate() - daysAgo);
          encounteredAt.setHours(encounteredAt.getHours() - hoursAgo);

          try {
            await prisma.encounter.create({
              data: {
                user1Id,
                user2Id,
                encounteredAt,
              },
            });
            totalEncounters++;
          } catch (error: any) {
            // Ignore duplicates
            if (error.code !== 'P2002') {
              throw error;
            }
          }
        }
      }

      console.log(`\n✅ Created ${totalEncounters} encounters total!\n`);

      // Create connection requests for qualifying pairs
      console.log('📨 Creating connection requests...\n');
      const createResult = await fetch('http://localhost:3000/api/connections/create-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => null);

      if (createResult) {
        const result = await createResult.json();
        console.log(`✅ Created ${result.data?.created || 0} connection requests!\n`);
      } else {
        console.log('⚠️  Backend not running - connection requests will be created when you wave\n');
      }
    } else {
      console.log('⚠️  No current user found - encounters will be created when you create your profile\n');
    }

    console.log('🎉 Setup complete! Now:\n');
    console.log('  1. Open your app - you should see these users in "Potential Waves"');
    console.log('  2. Wave at them to create connection requests');
    console.log('  3. Check Prisma Studio to see connection requests appear!\n');
    console.log('💡 To view in Prisma Studio:');
    console.log('   cd backend && npm run prisma:studio\n');

  } catch (error) {
    console.error('❌ Error seeding test users:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedDefaultTestUsers()
  .then(() => {
    console.log('✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

