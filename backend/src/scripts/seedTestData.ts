import 'dotenv/config';
import { prisma } from '../db';
import { Prisma } from '@prisma/client';

/**
 * Seed script to populate database with test data
 * Run with: npx tsx src/scripts/seedTestData.ts
 */

const FAKE_USERS = [
  { username: 'alice', email: 'alice@test.com', name: 'Alice Smith', age: 25, bio: 'Love hiking and nature' },
  { username: 'bob', email: 'bob@test.com', name: 'Bob Johnson', age: 28, bio: 'Tech enthusiast' },
  { username: 'charlie', email: 'charlie@test.com', name: 'Charlie Brown', age: 30, bio: 'Coffee lover' },
  { username: 'diana', email: 'diana@test.com', name: 'Diana Prince', age: 27, bio: 'Fitness fanatic' },
  { username: 'eve', email: 'eve@test.com', name: 'Eve Wilson', age: 26, bio: 'Art and music' },
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Cleaning existing data...');
    await prisma.message.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.connection.deleteMany();
    await prisma.connectionRequest.deleteMany();
    await prisma.encounter.deleteMany();
    await prisma.user.deleteMany();
    console.log('✓ Data cleaned\n');

    // Create users
    console.log('👥 Creating users...');
    const users = [];
    for (const userData of FAKE_USERS) {
      const user = await prisma.user.create({
        data: userData,
      });
      users.push(user);
      console.log(`  ✓ Created user: ${user.username} (${user.id})`);
    }
    console.log(`✓ Created ${users.length} users\n`);

    // Record encounters between Alice and Bob (3 encounters for connection)
    console.log('📍 Recording encounters...');
    const alice = users.find(u => u.username === 'alice')!;
    const bob = users.find(u => u.username === 'bob')!;
    const charlie = users.find(u => u.username === 'charlie')!;
    const diana = users.find(u => u.username === 'diana')!;

    // Alice and Bob meet 3 times (within 14 days)
    const now = new Date();
    const encounters = [
      { user1: alice, user2: bob, daysAgo: 1, lat: 40.7128, lng: -74.0060 },
      { user1: alice, user2: bob, daysAgo: 5, lat: 40.7130, lng: -74.0062 },
      { user1: alice, user2: bob, daysAgo: 10, lat: 40.7140, lng: -74.0070 },
      // Alice and Charlie meet 2 times (not enough for connection)
      { user1: alice, user2: charlie, daysAgo: 2, lat: 40.7150, lng: -74.0080 },
      { user1: alice, user2: charlie, daysAgo: 8, lat: 40.7160, lng: -74.0090 },
      // Bob and Diana meet 3 times
      { user1: bob, user2: diana, daysAgo: 3, lat: 40.7170, lng: -74.0100 },
      { user1: bob, user2: diana, daysAgo: 7, lat: 40.7180, lng: -74.0110 },
      { user1: bob, user2: diana, daysAgo: 12, lat: 40.7190, lng: -74.0120 },
    ];

    for (const enc of encounters) {
      const encounteredAt = new Date(now);
      encounteredAt.setDate(encounteredAt.getDate() - enc.daysAgo);

      const [user1Id, user2Id] = enc.user1.id < enc.user2.id 
        ? [enc.user1.id, enc.user2.id]
        : [enc.user2.id, enc.user1.id];

      try {
        await prisma.encounter.create({
          data: {
            user1Id,
            user2Id,
            encounteredAt,
            latitude: new Prisma.Decimal(enc.lat),
            longitude: new Prisma.Decimal(enc.lng),
          },
        });
        console.log(`  ✓ Encounter: ${enc.user1.username} ↔ ${enc.user2.username} (${enc.daysAgo} days ago)`);
      } catch (error: any) {
        if (error.code !== 'P2002') {
          throw error;
        }
        // Duplicate, skip
      }
    }
    console.log(`✓ Created ${encounters.length} encounters\n`);

    // Create connection requests (simulating the automatic process)
    console.log('🔗 Creating connection requests...');
    
    // Alice and Bob qualify (3 encounters)
    const aliceBobRequest = await prisma.connectionRequest.create({
      data: {
        requesterId: alice.id < bob.id ? alice.id : bob.id,
        requestedId: alice.id < bob.id ? bob.id : alice.id,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✓ Created request: Alice ↔ Bob (${aliceBobRequest.id})`);

    // Bob and Diana qualify (3 encounters)
    const bobDianaRequest = await prisma.connectionRequest.create({
      data: {
        requesterId: bob.id < diana.id ? bob.id : diana.id,
        requestedId: bob.id < diana.id ? diana.id : bob.id,
        status: 'pending',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✓ Created request: Bob ↔ Diana (${bobDianaRequest.id})`);
    console.log(`✓ Created 2 connection requests\n`);

    // Accept connection requests (Alice and Bob both accept)
    console.log('✅ Accepting connection requests...');
    
    // Alice accepts
    await prisma.connectionRequest.update({
      where: { id: aliceBobRequest.id },
      data: { requesterAcceptedAt: new Date() },
    });

    // Bob accepts (creates connection)
    await prisma.connectionRequest.update({
      where: { id: aliceBobRequest.id },
      data: { requestedAcceptedAt: new Date(), status: 'accepted' },
    });

    const connection = await prisma.connection.create({
      data: {
        user1Id: alice.id < bob.id ? alice.id : bob.id,
        user2Id: alice.id < bob.id ? bob.id : alice.id,
        connectionRequestId: aliceBobRequest.id,
      },
    });
    console.log(`  ✓ Alice and Bob connected (${connection.id})`);

    // Create conversation (trigger should do this, but we'll ensure it exists)
    const conversation = await prisma.conversation.upsert({
      where: { connectionId: connection.id },
      create: {
        connectionId: connection.id,
      },
      update: {},
    });
    console.log(`  ✓ Conversation created (${conversation.id})`);
    console.log(`✓ Connection established\n`);

    // Send some messages
    console.log('💬 Creating messages...');
    const messages = [
      { sender: alice, content: 'Hey Bob! Great to see you again!' },
      { sender: bob, content: 'Hi Alice! Yeah, it was nice running into you.' },
      { sender: alice, content: 'We should hang out more often!' },
      { sender: bob, content: 'Definitely! Want to grab coffee this weekend?' },
      { sender: alice, content: 'Sounds great! Saturday works for me.' },
    ];

    for (const msg of messages) {
      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: msg.sender.id,
          content: msg.content,
        },
      });
      console.log(`  ✓ Message from ${msg.sender.username}: "${msg.content.substring(0, 30)}..."`);
    }

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        lastMessagePreview: messages[messages.length - 1].content.substring(0, 100),
      },
    });
    console.log(`✓ Created ${messages.length} messages\n`);

    console.log('✅ Database seeding completed successfully!\n');

    // Print summary
    const userCount = await prisma.user.count();
    const encounterCount = await prisma.encounter.count();
    const requestCount = await prisma.connectionRequest.count();
    const connectionCount = await prisma.connection.count();
    const conversationCount = await prisma.conversation.count();
    const messageCount = await prisma.message.count();

    console.log('📊 Database Summary:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Encounters: ${encounterCount}`);
    console.log(`   Connection Requests: ${requestCount}`);
    console.log(`   Connections: ${connectionCount}`);
    console.log(`   Conversations: ${conversationCount}`);
    console.log(`   Messages: ${messageCount}\n`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

export { seedDatabase };

