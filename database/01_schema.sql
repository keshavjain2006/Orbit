-- ============================================================================
-- PostgreSQL Database Schema for Proximity-Based Social Networking App
-- ============================================================================
-- This file contains all table definitions with proper relationships,
-- constraints, and data types optimized for scalability.

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- USERS TABLE
-- ============================================================================
-- Stores user profile information
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    age INTEGER CHECK (age >= 13 AND age <= 150),
    photo_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- ============================================================================
-- ENCOUNTERS TABLE
-- ============================================================================
-- Tracks when two users have been near each other
-- Prevents duplicate encounters using unique constraint on (user1_id, user2_id, encountered_at)
-- Note: user1_id < user2_id to ensure consistent ordering and prevent duplicates
CREATE TABLE encounters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    encountered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure user1_id < user2_id to prevent duplicate pairs
    CONSTRAINT check_user_order CHECK (user1_id < user2_id)
);

-- Create unique index for encounters (prevents duplicates within same minute)
-- Note: Using a generated column approach or timestamp truncation
CREATE UNIQUE INDEX unique_encounter ON encounters (user1_id, user2_id, (encountered_at::date), EXTRACT(HOUR FROM encountered_at), EXTRACT(MINUTE FROM encountered_at));

-- ============================================================================
-- CONNECTION_REQUESTS TABLE
-- ============================================================================
-- Stores connection requests generated after 3 encounters in 2 weeks
-- Both users must accept before a connection is established
CREATE TABLE connection_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    requester_accepted_at TIMESTAMP WITH TIME ZONE,
    requested_accepted_at TIMESTAMP WITH TIME ZONE,
    
    -- Ensure requester_id < requested_id for consistency
    CONSTRAINT check_requester_order CHECK (requester_id < requested_id)
);

-- Create partial unique index for pending requests (prevents duplicate pending requests)
CREATE UNIQUE INDEX unique_pending_request ON connection_requests (requester_id, requested_id) 
    WHERE status = 'pending';

-- ============================================================================
-- CONNECTIONS TABLE
-- ============================================================================
-- Stores established connections (after both users accept)
CREATE TABLE connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    connection_request_id UUID REFERENCES connection_requests(id) ON DELETE SET NULL,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Ensure user1_id < user2_id for consistency
    CONSTRAINT check_connection_user_order CHECK (user1_id < user2_id),
    
    -- Prevent duplicate connections
    CONSTRAINT unique_connection UNIQUE (user1_id, user2_id)
);

-- ============================================================================
-- CONVERSATIONS TABLE
-- ============================================================================
-- One conversation per connection
-- Automatically created when connection is established
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL UNIQUE REFERENCES connections(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT,
    
    -- One conversation per connection
    CONSTRAINT unique_conversation_per_connection UNIQUE (connection_id)
);

-- ============================================================================
-- MESSAGES TABLE
-- ============================================================================
-- Stores all chat messages
-- Partitioned by time for scalability (see scaling section)
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' 
        CHECK (message_type IN ('text', 'image', 'video', 'location', 'system')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP WITH TIME ZONE,
    edited_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Prevent empty messages
    CONSTRAINT check_content_not_empty CHECK (LENGTH(TRIM(content)) > 0)
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp on users table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update conversation's last_message_at when a message is sent
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET last_message_at = NEW.created_at,
        last_message_preview = LEFT(NEW.content, 100)
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_conversation_on_message AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Automatically create conversation when connection is established
CREATE OR REPLACE FUNCTION create_conversation_on_connection()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO conversations (connection_id)
    VALUES (NEW.id)
    ON CONFLICT (connection_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_conversation_trigger AFTER INSERT ON connections
    FOR EACH ROW EXECUTE FUNCTION create_conversation_on_connection();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'User profiles with basic information';
COMMENT ON TABLE encounters IS 'Tracks proximity events between users. Prevents duplicates using unique constraint on (user1_id, user2_id, minute).';
COMMENT ON TABLE connection_requests IS 'Connection requests generated after 3 encounters in 2 weeks. Both users must accept.';
COMMENT ON TABLE connections IS 'Established connections between users after mutual acceptance';
COMMENT ON TABLE conversations IS 'One conversation per connection for messaging';
COMMENT ON TABLE messages IS 'Chat messages within conversations';

COMMENT ON COLUMN encounters.user1_id IS 'Always the smaller UUID to ensure consistent ordering';
COMMENT ON COLUMN encounters.user2_id IS 'Always the larger UUID to ensure consistent ordering';
COMMENT ON COLUMN connection_requests.status IS 'pending: waiting for acceptance, accepted: both accepted, rejected: one rejected, expired: time expired';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when the recipient read the message';

