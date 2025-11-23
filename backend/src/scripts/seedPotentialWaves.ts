import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed encounters for potential waves
 * Creates 3+ encounters between your user and other users so they appear in "Potential Waves"
 */
async function seedPotentialWaves() {
  console.log('🌊 Seeding potential waves encounters...\n');

  try {
    // Get your user - try to find by name "H" or get the most recent user
    let yourUser = await prisma.user.findFirst({
      where: { name: 'H' },
    });

    // If not found, get the most recently created user
    if (!yourUser) {
      yourUser = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!yourUser) {
      console.error('❌ No users found. Please create your profile first.');
      process.exit(1);
    }

    console.log(`✅ Found your user: ${yourUser.name} (${yourUser.id})\n`);

    // Get some existing users to create encounters with
    const targetUsers = await prisma.user.findMany({
      where: {
        name: {
          in: ['Alex Morgan', 'Sam Chen', 'Jordan Taylor', 'Casey Johnson', 'Morgan Lee'],
        },
      },
    });

    if (targetUsers.length === 0) {
      console.error('❌ No target users found. Please run seedDummyProfiles first.');
      process.exit(1);
    }

    console.log(`📋 Found ${targetUsers.length} target users to create encounters with\n`);

    // Create 3-5 encounters with each user (within last 14 days)
    const now = new Date();
    const encountersCreated = [];

    for (const targetUser of targetUsers) {
      const encounterCount = Math.floor(Math.random() * 3) + 3; // 3-5 encounters
      console.log(`📝 Creating ${encounterCount} encounters with ${targetUser.name}...`);

      for (let i = 0; i < encounterCount; i++) {
        // Create encounters over the last 14 days
        const daysAgo = Math.floor(Math.random() * 14);
        const hoursAgo = Math.floor(Math.random() * 24);
        const encounteredAt = new Date(now);
        encounteredAt.setDate(encounteredAt.getDate() - daysAgo);
        encounteredAt.setHours(encounteredAt.getHours() - hoursAgo);

        // Ensure user1Id < user2Id for consistency
        const [user1Id, user2Id] = 
          yourUser.id < targetUser.id 
            ? [yourUser.id, targetUser.id]
            : [targetUser.id, yourUser.id];

        try {
          const encounter = await prisma.encounter.create({
            data: {
              user1Id,
              user2Id,
              encounteredAt,
              latitude: new Prisma.Decimal(40.7128 + (Math.random() - 0.5) * 0.01),
              longitude: new Prisma.Decimal(-74.0060 + (Math.random() - 0.5) * 0.01),
            },
          });
          encountersCreated.push(encounter);
        } catch (error: any) {
          // Ignore duplicate errors (P2002)
          if (error.code === 'P2002') {
            console.log(`  ⚠️  Encounter ${i + 1} already exists (duplicate), skipping...`);
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`\n✅ Created ${encountersCreated.length} encounters total!\n`);

    // Check which pairs now qualify for connection requests
    console.log('🔍 Checking qualifying pairs (3+ encounters in 14 days)...\n');
    
    const qualifyingPairs = await prisma.$queryRaw<Array<{
      user1_id: string;
      user2_id: string;
      encounter_count: bigint;
    }>>`
      SELECT 
        e.user1_id,
        e.user2_id,
        COUNT(*)::bigint as encounter_count
      FROM encounters e
      WHERE e.encountered_at >= NOW() - INTERVAL '14 days'
      GROUP BY e.user1_id, e.user2_id
      HAVING COUNT(*) >= 3
      AND (
        e.user1_id = ${yourUser.id}::uuid OR 
        e.user2_id = ${yourUser.id}::uuid
      )
    `;

    console.log(`📊 Found ${qualifyingPairs.length} qualifying pairs:\n`);
    for (const pair of qualifyingPairs) {
      const otherUserId = pair.user1_id === yourUser.id ? pair.user2_id : pair.user1_id;
      const otherUser = await prisma.user.findUnique({
        where: { id: otherUserId },
        select: { name: true },
      });
      console.log(`  ✅ ${otherUser?.name || otherUserId}: ${pair.encounter_count} encounters`);
    }

    console.log('\n🎉 Done! Now you can:');
    console.log('  1. Open your app and see these users in "Potential Waves"');
    console.log('  2. Wave at them to create connection requests');
    console.log('  3. Check Prisma Studio to see the connection requests appear!');
    console.log('\n💡 To create connection requests, run:');
    console.log('   curl -X POST http://localhost:3000/api/connections/create-requests\n');

  } catch (error) {
    console.error('❌ Error seeding potential waves:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedPotentialWaves()
  .then(() => {
    console.log('\n✅ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

