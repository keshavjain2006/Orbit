import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDummyProfiles() {
  console.log('🌱 Seeding dummy profiles for potential waves and friends...\n');

  try {
    // Clear existing data (optional - comment out if you want to keep existing data)
    // await prisma.message.deleteMany();
    // await prisma.conversation.deleteMany();
    // await prisma.connectionRequest.deleteMany();
    // await prisma.connection.deleteMany();
    // await prisma.encounter.deleteMany();
    // await prisma.user.deleteMany();

    // Create dummy users with fixed UUIDs for easy reference
    console.log('👥 Creating dummy users...');
    const userIds = [
      '11111111-1111-1111-1111-111111111111', // Alex
      '22222222-2222-2222-2222-222222222222', // Sam
      '33333333-3333-3333-3333-333333333333', // Jordan
      '44444444-4444-4444-4444-444444444444', // Riley
      '55555555-5555-5555-5555-555555555555', // Casey
      '66666666-6666-6666-6666-666666666666', // Morgan
    ];
    
    const users = await Promise.all([
      prisma.user.upsert({
        where: { id: userIds[0] },
        update: {},
        create: {
          id: userIds[0],
          name: 'Alex Morgan',
          pronouns: 'they/them',
          bio: 'Love hiking and coffee! Always up for a chat.',
        },
      }),
      prisma.user.upsert({
        where: { id: userIds[1] },
        update: {},
        create: {
          id: userIds[1],
          name: 'Sam Chen',
          pronouns: 'he/him',
          bio: 'Tech enthusiast and bookworm. Let\'s connect!',
        },
      }),
      prisma.user.upsert({
        where: { id: userIds[2] },
        update: {},
        create: {
          id: userIds[2],
          name: 'Jordan Taylor',
          pronouns: 'she/her',
          bio: 'Artist and music lover. Looking for creative friends!',
        },
      }),
      prisma.user.upsert({
        where: { id: userIds[3] },
        update: {},
        create: {
          id: userIds[3],
          name: 'Riley Kim',
          pronouns: 'they/them',
          bio: 'Fitness enthusiast and foodie. Let\'s grab lunch!',
        },
      }),
      prisma.user.upsert({
        where: { id: userIds[4] },
        update: {},
        create: {
          id: userIds[4],
          name: 'Casey Johnson',
          pronouns: 'he/him',
          bio: 'Gamer and movie buff. Always down for a game night!',
        },
      }),
      prisma.user.upsert({
        where: { id: userIds[5] },
        update: {},
        create: {
          id: userIds[5],
          name: 'Morgan Lee',
          pronouns: 'she/her',
          bio: 'Yoga instructor and wellness coach. Namaste!',
        },
      }),
    ]);

    console.log(`✅ Created ${users.length} users\n`);

    // Create encounters (3+ encounters in last 14 days = potential waves)
    console.log('📍 Creating encounters for potential waves...');
    const now = new Date();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // User 1 and User 2: 5 encounters (qualifies for potential wave)
    await Promise.all([
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[1].id,
          encounteredAt: daysAgo(2),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[1].id,
          encounteredAt: daysAgo(5),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[1].id,
          encounteredAt: daysAgo(8),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[1].id,
          encounteredAt: daysAgo(10),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[1].id,
          encounteredAt: daysAgo(12),
        },
      }),
    ]);

    // User 1 and User 3: 4 encounters (qualifies for potential wave)
    await Promise.all([
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[2].id,
          encounteredAt: daysAgo(1),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[2].id,
          encounteredAt: daysAgo(4),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[2].id,
          encounteredAt: daysAgo(7),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[0].id,
          user2Id: users[2].id,
          encounteredAt: daysAgo(11),
        },
      }),
    ]);

    // User 2 and User 4: 3 encounters (qualifies for potential wave)
    await Promise.all([
      prisma.encounter.create({
        data: {
          user1Id: users[1].id,
          user2Id: users[3].id,
          encounteredAt: daysAgo(3),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[1].id,
          user2Id: users[3].id,
          encounteredAt: daysAgo(6),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[1].id,
          user2Id: users[3].id,
          encounteredAt: daysAgo(9),
        },
      }),
    ]);

    // User 3 and User 5: 3 encounters (qualifies for potential wave)
    await Promise.all([
      prisma.encounter.create({
        data: {
          user1Id: users[2].id,
          user2Id: users[4].id,
          encounteredAt: daysAgo(2),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[2].id,
          user2Id: users[4].id,
          encounteredAt: daysAgo(5),
        },
      }),
      prisma.encounter.create({
        data: {
          user1Id: users[2].id,
          user2Id: users[4].id,
          encounteredAt: daysAgo(8),
        },
      }),
    ]);

    console.log('✅ Created encounters for potential waves\n');

    // Create active connections (friends)
    console.log('🤝 Creating active connections (friends)...');
    
    // Helper to ensure user1Id < user2Id for consistency
    const ensureOrder = (id1: string, id2: string) => 
      id1 < id2 ? [id1, id2] : [id2, id1];
    
    // Connection 1: User 1 <-> User 4 (friends)
    const [u1, u4] = ensureOrder(users[0].id, users[3].id);
    const connection1 = await prisma.connection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: u1,
          user2Id: u4,
        },
      },
      update: { isActive: true },
      create: {
        user1Id: u1,
        user2Id: u4,
        isActive: true,
      },
    });

    // Connection 2: User 2 <-> User 5 (friends)
    const [u2, u5] = ensureOrder(users[1].id, users[4].id);
    const connection2 = await prisma.connection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: u2,
          user2Id: u5,
        },
      },
      update: { isActive: true },
      create: {
        user1Id: u2,
        user2Id: u5,
        isActive: true,
      },
    });

    // Connection 3: User 3 <-> User 6 (friends)
    const [u3, u6] = ensureOrder(users[2].id, users[5].id);
    const connection3 = await prisma.connection.upsert({
      where: {
        user1Id_user2Id: {
          user1Id: u3,
          user2Id: u6,
        },
      },
      update: { isActive: true },
      create: {
        user1Id: u3,
        user2Id: u6,
        isActive: true,
      },
    });

    console.log('✅ Created active connections\n');

    // Create conversations for friends
    console.log('💬 Creating conversations for friends...');
    
    const conversation1 = await prisma.conversation.upsert({
      where: { connectionId: connection1.id },
      update: {
        lastMessageAt: daysAgo(1),
        lastMessagePreview: 'Hey! How are you doing?',
      },
      create: {
        connectionId: connection1.id,
        lastMessageAt: daysAgo(1),
        lastMessagePreview: 'Hey! How are you doing?',
      },
    });

    const conversation2 = await prisma.conversation.upsert({
      where: { connectionId: connection2.id },
      update: {
        lastMessageAt: daysAgo(2),
        lastMessagePreview: 'Thanks for the recommendation!',
      },
      create: {
        connectionId: connection2.id,
        lastMessageAt: daysAgo(2),
        lastMessagePreview: 'Thanks for the recommendation!',
      },
    });

    const conversation3 = await prisma.conversation.upsert({
      where: { connectionId: connection3.id },
      update: {
        lastMessageAt: daysAgo(0.5),
        lastMessagePreview: 'See you tomorrow!',
      },
      create: {
        connectionId: connection3.id,
        lastMessageAt: daysAgo(0.5),
        lastMessagePreview: 'See you tomorrow!',
      },
    });

    console.log('✅ Created conversations\n');

    // Create some messages for friends
    console.log('📨 Creating messages...');
    
    await Promise.all([
      // Conversation 1 messages
      prisma.message.create({
        data: {
          conversationId: conversation1.id,
          senderId: users[0].id,
          content: 'Hey! How are you doing?',
          messageType: 'text',
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation1.id,
          senderId: users[3].id,
          content: 'I\'m doing great! Thanks for asking. How about you?',
          messageType: 'text',
        },
      }),
      
      // Conversation 2 messages
      prisma.message.create({
        data: {
          conversationId: conversation2.id,
          senderId: users[1].id,
          content: 'Thanks for the recommendation!',
          messageType: 'text',
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation2.id,
          senderId: users[4].id,
          content: 'No problem! Let me know if you need more suggestions.',
          messageType: 'text',
        },
      }),
      
      // Conversation 3 messages
      prisma.message.create({
        data: {
          conversationId: conversation3.id,
          senderId: users[2].id,
          content: 'See you tomorrow!',
          messageType: 'text',
        },
      }),
      prisma.message.create({
        data: {
          conversationId: conversation3.id,
          senderId: users[5].id,
          content: 'Looking forward to it! 🎉',
          messageType: 'text',
        },
      }),
    ]);

    console.log('✅ Created messages\n');

    // Summary
    console.log('📊 Summary:');
    console.log(`   👥 Users: ${users.length}`);
    console.log(`   📍 Encounters: Created for potential waves`);
    console.log(`   🤝 Active Connections: 3 (friends)`);
    console.log(`   💬 Conversations: 3`);
    console.log(`   📨 Messages: 6`);
    console.log('\n✅ Dummy profiles seeded successfully!');
    console.log('\n💡 To see them in the app:');
    console.log('   1. Make sure you\'re logged in as one of these users');
    console.log('   2. Or create encounters with these users');
    console.log('   3. Check Prisma Studio to see all the data');
    console.log('\n📝 User IDs for testing:');
    const userNames = ['Alex Morgan', 'Sam Chen', 'Jordan Taylor', 'Riley Kim', 'Casey Johnson', 'Morgan Lee'];
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${userNames[index]} (${user.id})`);
    });

  } catch (error) {
    console.error('❌ Error seeding dummy profiles:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedDummyProfiles()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  });

