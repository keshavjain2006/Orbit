import 'dotenv/config';
import { prisma } from '../db';

/**
 * Test script to verify database functionality with queries
 * Run with: npx tsx src/scripts/testQueries.ts
 */

async function testQueries() {
  console.log('🧪 Testing Database Queries...\n');

  try {
    // Test 1: Count all records
    console.log('📊 Test 1: Record Counts');
    const counts = {
      users: await prisma.user.count(),
      encounters: await prisma.encounter.count(),
      connectionRequests: await prisma.connectionRequest.count(),
      connections: await prisma.connection.count(),
      conversations: await prisma.conversation.count(),
      messages: await prisma.message.count(),
    };
    console.log('   Users:', counts.users);
    console.log('   Encounters:', counts.encounters);
    console.log('   Connection Requests:', counts.connectionRequests);
    console.log('   Connections:', counts.connections);
    console.log('   Conversations:', counts.conversations);
    console.log('   Messages:', counts.messages);
    console.log('   ✓ All counts retrieved\n');

    // Test 2: Get users with their connections
    console.log('👥 Test 2: Users and Connections');
    const users = await prisma.user.findMany({
      include: {
        connectionsAsUser1: {
          where: { isActive: true },
          include: {
            user2: {
              select: { id: true, username: true, name: true },
            },
          },
        },
        connectionsAsUser2: {
          where: { isActive: true },
          include: {
            user1: {
              select: { id: true, username: true, name: true },
            },
          },
        },
      },
    });

    for (const user of users) {
      const allConnections = [
        ...user.connectionsAsUser1.map(c => ({ otherUser: c.user2, connection: c })),
        ...user.connectionsAsUser2.map(c => ({ otherUser: c.user1, connection: c })),
      ];
      console.log(`   ${user.username}: ${allConnections.length} connection(s)`);
      allConnections.forEach(c => {
        console.log(`     - Connected to: ${c.otherUser.username} (${c.connection.id})`);
      });
    }
    console.log('   ✓ User connections retrieved\n');

    // Test 3: Check encounters for connection requests
    console.log('📍 Test 3: Encounters Analysis');
    const encounterPairs = await prisma.$queryRaw<Array<{
      user1_id: string;
      user2_id: string;
      encounter_count: bigint;
      first_encounter: Date;
      last_encounter: Date;
    }>>`
      SELECT 
        user1_id,
        user2_id,
        COUNT(*)::bigint as encounter_count,
        MIN(encountered_at) as first_encounter,
        MAX(encountered_at) as last_encounter
      FROM encounters
      WHERE encountered_at >= NOW() - INTERVAL '14 days'
      GROUP BY user1_id, user2_id
      ORDER BY encounter_count DESC
    `;

    for (const pair of encounterPairs) {
      const user1 = await prisma.user.findUnique({ where: { id: pair.user1_id }, select: { username: true } });
      const user2 = await prisma.user.findUnique({ where: { id: pair.user2_id }, select: { username: true } });
      const qualifies = Number(pair.encounter_count) >= 3;
      console.log(`   ${user1?.username} ↔ ${user2?.username}: ${pair.encounter_count} encounter(s) ${qualifies ? '✅ QUALIFIES' : '❌'}`);
    }
    console.log('   ✓ Encounters analyzed\n');

    // Test 4: Get pending connection requests
    console.log('🔔 Test 4: Pending Connection Requests');
    const pendingRequests = await prisma.connectionRequest.findMany({
      where: { status: 'pending' },
      include: {
        requester: { select: { username: true, name: true } },
        requested: { select: { username: true, name: true } },
      },
    });

    if (pendingRequests.length === 0) {
      console.log('   No pending requests');
    } else {
      for (const req of pendingRequests) {
        console.log(`   ${req.requester.username} → ${req.requested.username} (${req.id})`);
        console.log(`     Created: ${req.createdAt.toISOString()}`);
        console.log(`     Expires: ${req.expiresAt?.toISOString() || 'Never'}`);
      }
    }
    console.log('   ✓ Pending requests retrieved\n');

    // Test 5: Get conversations with messages
    console.log('💬 Test 5: Conversations and Messages');
    const conversations = await prisma.conversation.findMany({
      include: {
        connection: {
          include: {
            user1: { select: { username: true } },
            user2: { select: { username: true } },
          },
        },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            sender: { select: { username: true } },
          },
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    for (const conv of conversations) {
      console.log(`   Conversation ${conv.id}:`);
      console.log(`     Between: ${conv.connection.user1.username} ↔ ${conv.connection.user2.username}`);
      console.log(`     Messages: ${conv._count.messages} total`);
      console.log(`     Last message: ${conv.lastMessageAt ? conv.lastMessageAt.toISOString() : 'None'}`);
      if (conv.messages.length > 0) {
        console.log(`     Recent messages:`);
        conv.messages.reverse().forEach(msg => {
          console.log(`       ${msg.sender.username}: "${msg.content.substring(0, 40)}..."`);
        });
      }
    }
    console.log('   ✓ Conversations retrieved\n');

    // Test 6: Test the "3 encounters in 2 weeks" query
    console.log('🔍 Test 6: Connection Request Eligibility');
    const eligiblePairs = await prisma.$queryRaw<Array<{
      user1_id: string;
      user2_id: string;
      encounter_count: bigint;
    }>>`
      SELECT 
        user1_id,
        user2_id,
        COUNT(*)::bigint as encounter_count
      FROM encounters
      WHERE encountered_at >= NOW() - INTERVAL '14 days'
      GROUP BY user1_id, user2_id
      HAVING COUNT(*) >= 3
      AND NOT EXISTS (
        SELECT 1 FROM connection_requests cr
        WHERE (cr.requester_id = encounters.user1_id AND cr.requested_id = encounters.user2_id)
           OR (cr.requester_id = encounters.user2_id AND cr.requested_id = encounters.user1_id)
        AND cr.status IN ('pending', 'accepted')
      )
      AND NOT EXISTS (
        SELECT 1 FROM connections c
        WHERE (c.user1_id = encounters.user1_id AND c.user2_id = encounters.user2_id)
        AND c.is_active = TRUE
      )
    `;

    if (eligiblePairs.length === 0) {
      console.log('   No pairs currently eligible (all may have requests/connections already)');
    } else {
      for (const pair of eligiblePairs) {
        const user1 = await prisma.user.findUnique({ where: { id: pair.user1_id }, select: { username: true } });
        const user2 = await prisma.user.findUnique({ where: { id: pair.user2_id }, select: { username: true } });
        console.log(`   ✅ ${user1?.username} ↔ ${user2?.username}: ${pair.encounter_count} encounters (ELIGIBLE)`);
      }
    }
    console.log('   ✓ Eligibility check completed\n');

    // Test 7: Verify data integrity
    console.log('🔒 Test 7: Data Integrity Checks');
    
    // Check for orphaned messages (using raw query since Prisma doesn't support null checks easily)
    const orphanedMessagesResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM messages m
      LEFT JOIN conversations c ON c.id = m.conversation_id
      WHERE c.id IS NULL
    `;
    const orphanedMessagesCount = Number(orphanedMessagesResult[0]?.count || 0);
    console.log(`   Orphaned messages: ${orphanedMessagesCount} (should be 0)`);

    // Check for orphaned conversations
    const orphanedConversationsResult = await prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint as count
      FROM conversations conv
      LEFT JOIN connections c ON c.id = conv.connection_id
      WHERE c.id IS NULL
    `;
    const orphanedConversationsCount = Number(orphanedConversationsResult[0]?.count || 0);
    console.log(`   Orphaned conversations: ${orphanedConversationsCount} (should be 0)`);

    // Check for connections without conversations
    const connectionsWithoutConversations = await prisma.connection.findMany({
      where: {
        isActive: true,
        conversation: null,
      },
    });
    console.log(`   Active connections without conversations: ${connectionsWithoutConversations.length} (should be 0)`);

    if (orphanedMessagesCount === 0 && orphanedConversationsCount === 0 && connectionsWithoutConversations.length === 0) {
      console.log('   ✅ All integrity checks passed\n');
    } else {
      console.log('   ⚠️  Some integrity issues found\n');
    }

    // Test 8: Performance test - get user connections
    console.log('⚡ Test 8: Performance Test');
    const testUser = await prisma.user.findFirst({ where: { username: 'alice' } });
    if (testUser) {
      const start = Date.now();
      const userConnections = await prisma.connection.findMany({
        where: {
          isActive: true,
          OR: [
            { user1Id: testUser.id },
            { user2Id: testUser.id },
          ],
        },
        include: {
          user1: { select: { username: true } },
          user2: { select: { username: true } },
          conversation: {
            select: {
              lastMessageAt: true,
              lastMessagePreview: true,
            },
          },
        },
      });
      const duration = Date.now() - start;
      console.log(`   Query time: ${duration}ms`);
      console.log(`   Found ${userConnections.length} connection(s) for ${testUser.username}`);
      console.log('   ✓ Performance test completed\n');
    }

    console.log('✅ All tests completed successfully!\n');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if executed directly
if (require.main === module) {
  testQueries()
    .then(() => {
      console.log('✨ Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Testing failed:', error);
      process.exit(1);
    });
}

export { testQueries };

