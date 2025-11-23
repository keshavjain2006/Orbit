-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================
-- These indexes are designed to optimize common query patterns

-- ============================================================================
-- USERS TABLE INDEXES
-- ============================================================================

-- Fast lookup by username (already has UNIQUE constraint, but explicit index for clarity)
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Fast lookup by email (already has UNIQUE constraint)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Query active users
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- Query users by last seen (for finding active users)
CREATE INDEX IF NOT EXISTS idx_users_last_seen ON users(last_seen_at DESC);

-- ============================================================================
-- ENCOUNTERS TABLE INDEXES
-- ============================================================================

-- CRITICAL: Fast lookup of encounters between two specific users
-- This is used heavily for the "3 encounters in 2 weeks" calculation
CREATE INDEX IF NOT EXISTS idx_encounters_users ON encounters(user1_id, user2_id, encountered_at DESC);

-- Fast lookup of all encounters for a specific user (regardless of position)
-- Uses a GIN index for efficient OR queries
CREATE INDEX IF NOT EXISTS idx_encounters_user1 ON encounters(user1_id, encountered_at DESC);
CREATE INDEX IF NOT EXISTS idx_encounters_user2 ON encounters(user2_id, encountered_at DESC);

-- Fast time-based queries (for finding recent encounters)
CREATE INDEX IF NOT EXISTS idx_encounters_time ON encounters(encountered_at DESC);

-- Composite index for the 2-week window query (most critical for performance)
-- This index is optimized for: WHERE (user1_id = X OR user2_id = X) 
--   AND encountered_at >= NOW() - INTERVAL '14 days'
CREATE INDEX IF NOT EXISTS idx_encounters_user_time_window ON encounters(encountered_at DESC, user1_id, user2_id);

-- ============================================================================
-- CONNECTION_REQUESTS TABLE INDEXES
-- ============================================================================

-- Fast lookup of requests for a specific user (as requester)
CREATE INDEX IF NOT EXISTS idx_requests_requester ON connection_requests(requester_id, status, created_at DESC);

-- Fast lookup of requests for a specific user (as requested)
CREATE INDEX IF NOT EXISTS idx_requests_requested ON connection_requests(requested_id, status, created_at DESC);

-- Fast lookup of pending requests (most common query)
CREATE INDEX IF NOT EXISTS idx_requests_pending ON connection_requests(status, created_at DESC) 
    WHERE status = 'pending';

-- Fast lookup of expired requests (for cleanup jobs)
CREATE INDEX IF NOT EXISTS idx_requests_expires ON connection_requests(expires_at) 
    WHERE expires_at IS NOT NULL AND status = 'pending';

-- Composite index for checking if request already exists
CREATE INDEX IF NOT EXISTS idx_requests_pair ON connection_requests(requester_id, requested_id, status);

-- ============================================================================
-- CONNECTIONS TABLE INDEXES
-- ============================================================================

-- Fast lookup of all connections for a user (regardless of position)
CREATE INDEX IF NOT EXISTS idx_connections_user1 ON connections(user1_id, connected_at DESC) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_connections_user2 ON connections(user2_id, connected_at DESC) WHERE is_active = TRUE;

-- Fast check if two users are connected
CREATE INDEX IF NOT EXISTS idx_connections_pair ON connections(user1_id, user2_id) WHERE is_active = TRUE;

-- Fast lookup of active connections
CREATE INDEX IF NOT EXISTS idx_connections_active ON connections(is_active, connected_at DESC) WHERE is_active = TRUE;

-- ============================================================================
-- CONVERSATIONS TABLE INDEXES
-- ============================================================================

-- Fast lookup of conversation by connection
CREATE INDEX IF NOT EXISTS idx_conversations_connection ON conversations(connection_id);

-- Fast lookup of recent conversations (for inbox view)
CREATE INDEX IF NOT EXISTS idx_conversations_recent ON conversations(last_message_at DESC NULLS LAST);

-- ============================================================================
-- MESSAGES TABLE INDEXES
-- ============================================================================

-- CRITICAL: Fast retrieval of messages in a conversation (most common query)
-- Ordered by created_at DESC for newest-first pagination
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);

-- Fast lookup of unread messages
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, created_at DESC) 
    WHERE read_at IS NULL;

-- Fast lookup of messages by sender
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id, created_at DESC);

-- Fast lookup of recent messages across all conversations (for notifications)
CREATE INDEX IF NOT EXISTS idx_messages_recent ON messages(created_at DESC);

-- Fast lookup of non-deleted messages (for queries that filter deleted)
CREATE INDEX IF NOT EXISTS idx_messages_active ON messages(conversation_id, created_at DESC) 
    WHERE deleted_at IS NULL;

-- ============================================================================
-- PERFORMANCE NOTES
-- ============================================================================
-- 
-- 1. The encounters table indexes are CRITICAL for the "3 encounters in 2 weeks" 
--    calculation. The idx_encounters_users index allows fast lookups of encounters
--    between specific user pairs within a time window.
--
-- 2. Partial indexes (WHERE clauses) reduce index size and improve performance
--    for common filtered queries (e.g., active connections, pending requests).
--
-- 3. DESC ordering in indexes optimizes queries that fetch recent data first.
--
-- 4. For very high scale, consider partitioning the messages table by time
--    (see scaling section in README).

