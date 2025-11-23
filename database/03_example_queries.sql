-- ============================================================================
-- EXAMPLE QUERIES FOR COMMON OPERATIONS
-- ============================================================================

-- ============================================================================
-- 1. CHECK FOR 3 ENCOUNTERS IN 2 WEEKS
-- ============================================================================
-- This is the core query to determine if a connection request should be generated
-- Returns user pairs that have had 3+ encounters in the last 14 days

CREATE OR REPLACE FUNCTION check_encounters_for_connection_request()
RETURNS TABLE (
    user1_id UUID,
    user2_id UUID,
    encounter_count BIGINT,
    first_encounter TIMESTAMP WITH TIME ZONE,
    last_encounter TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        e.user1_id,
        e.user2_id,
        COUNT(*) as encounter_count,
        MIN(e.encountered_at) as first_encounter,
        MAX(e.encountered_at) as last_encounter
    FROM encounters e
    WHERE e.encountered_at >= NOW() - INTERVAL '14 days'
    GROUP BY e.user1_id, e.user2_id
    HAVING COUNT(*) >= 3
    -- Exclude pairs that already have a pending or accepted connection request
    AND NOT EXISTS (
        SELECT 1 FROM connection_requests cr
        WHERE (cr.requester_id = e.user1_id AND cr.requested_id = e.user2_id)
           OR (cr.requester_id = e.user2_id AND cr.requested_id = e.user1_id)
        AND cr.status IN ('pending', 'accepted')
    )
    -- Exclude pairs that are already connected
    AND NOT EXISTS (
        SELECT 1 FROM connections c
        WHERE (c.user1_id = e.user1_id AND c.user2_id = e.user2_id)
        AND c.is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM check_encounters_for_connection_request();

-- ============================================================================
-- 2. CREATE CONNECTION REQUEST AFTER ENOUGH ENCOUNTERS
-- ============================================================================
-- This function automatically creates connection requests for qualifying pairs

CREATE OR REPLACE FUNCTION create_connection_requests_from_encounters()
RETURNS INTEGER AS $$
DECLARE
    request_count INTEGER := 0;
    pair_record RECORD;
BEGIN
    FOR pair_record IN 
        SELECT * FROM check_encounters_for_connection_request()
    LOOP
        INSERT INTO connection_requests (
            requester_id,
            requested_id,
            status,
            expires_at
        )
        VALUES (
            pair_record.user1_id,
            pair_record.user2_id,
            'pending',
            NOW() + INTERVAL '30 days'  -- Requests expire after 30 days
        )
        ON CONFLICT (requester_id, requested_id, status) 
        WHERE status = 'pending'
        DO NOTHING;
        
        request_count := request_count + 1;
    END LOOP;
    
    RETURN request_count;
END;
$$ LANGUAGE plpgsql;

-- Example usage (typically run as a scheduled job):
-- SELECT create_connection_requests_from_encounters();

-- ============================================================================
-- 3. RECORD A NEW ENCOUNTER
-- ============================================================================
-- Inserts a new encounter, ensuring user1_id < user2_id

CREATE OR REPLACE FUNCTION record_encounter(
    p_user1_id UUID,
    p_user2_id UUID,
    p_latitude DECIMAL DEFAULT NULL,
    p_longitude DECIMAL DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_user1 UUID;
    v_user2 UUID;
    v_encounter_id UUID;
BEGIN
    -- Ensure consistent ordering (smaller UUID first)
    IF p_user1_id < p_user2_id THEN
        v_user1 := p_user1_id;
        v_user2 := p_user2_id;
    ELSE
        v_user1 := p_user2_id;
        v_user2 := p_user1_id;
    END IF;
    
    -- Insert encounter (will fail if duplicate due to unique constraint)
    INSERT INTO encounters (user1_id, user2_id, latitude, longitude)
    VALUES (v_user1, v_user2, p_latitude, p_longitude)
    ON CONFLICT (user1_id, user2_id, DATE_TRUNC('minute', encountered_at)) 
    DO NOTHING
    RETURNING id INTO v_encounter_id;
    
    RETURN v_encounter_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT record_encounter('user-uuid-1', 'user-uuid-2', 40.7128, -74.0060);

-- ============================================================================
-- 4. ACCEPT OR REJECT A CONNECTION REQUEST
-- ============================================================================
-- Handles both requester and requested user accepting/rejecting

CREATE OR REPLACE FUNCTION respond_to_connection_request(
    p_request_id UUID,
    p_user_id UUID,
    p_accept BOOLEAN
)
RETURNS UUID AS $$
DECLARE
    v_request connection_requests%ROWTYPE;
    v_connection_id UUID;
BEGIN
    -- Get the request
    SELECT * INTO v_request
    FROM connection_requests
    WHERE id = p_request_id
    AND status = 'pending';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Connection request not found or not pending';
    END IF;
    
    -- Check if user is part of this request
    IF v_request.requester_id != p_user_id AND v_request.requested_id != p_user_id THEN
        RAISE EXCEPTION 'User is not part of this connection request';
    END IF;
    
    IF NOT p_accept THEN
        -- Reject the request
        UPDATE connection_requests
        SET status = 'rejected'
        WHERE id = p_request_id;
        RETURN NULL;
    END IF;
    
    -- Accept the request
    IF v_request.requester_id = p_user_id THEN
        UPDATE connection_requests
        SET requester_accepted_at = CURRENT_TIMESTAMP
        WHERE id = p_request_id;
    ELSE
        UPDATE connection_requests
        SET requested_accepted_at = CURRENT_TIMESTAMP
        WHERE id = p_request_id;
    END IF;
    
    -- Check if both users have accepted
    SELECT * INTO v_request
    FROM connection_requests
    WHERE id = p_request_id;
    
    IF v_request.requester_accepted_at IS NOT NULL 
       AND v_request.requested_accepted_at IS NOT NULL THEN
        -- Both accepted! Create the connection
        INSERT INTO connections (user1_id, user2_id, connection_request_id)
        VALUES (v_request.requester_id, v_request.requested_id, p_request_id)
        ON CONFLICT (user1_id, user2_id) DO NOTHING
        RETURNING id INTO v_connection_id;
        
        -- Update request status
        UPDATE connection_requests
        SET status = 'accepted'
        WHERE id = p_request_id;
        
        RETURN v_connection_id;
    END IF;
    
    RETURN NULL;  -- Waiting for other user to accept
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- Accept: SELECT respond_to_connection_request('request-uuid', 'user-uuid', TRUE);
-- Reject: SELECT respond_to_connection_request('request-uuid', 'user-uuid', FALSE);

-- ============================================================================
-- 5. GET USER'S PENDING CONNECTION REQUESTS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_pending_requests(p_user_id UUID)
RETURNS TABLE (
    request_id UUID,
    other_user_id UUID,
    other_user_name VARCHAR,
    other_user_username VARCHAR,
    other_user_photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    is_requester BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cr.id as request_id,
        CASE 
            WHEN cr.requester_id = p_user_id THEN cr.requested_id
            ELSE cr.requester_id
        END as other_user_id,
        CASE 
            WHEN cr.requester_id = p_user_id THEN u2.name
            ELSE u1.name
        END as other_user_name,
        CASE 
            WHEN cr.requester_id = p_user_id THEN u2.username
            ELSE u1.username
        END as other_user_username,
        CASE 
            WHEN cr.requester_id = p_user_id THEN u2.photo_url
            ELSE u1.photo_url
        END as other_user_photo_url,
        cr.created_at,
        (cr.requester_id = p_user_id) as is_requester
    FROM connection_requests cr
    LEFT JOIN users u1 ON u1.id = cr.requester_id
    LEFT JOIN users u2 ON u2.id = cr.requested_id
    WHERE (cr.requester_id = p_user_id OR cr.requested_id = p_user_id)
    AND cr.status = 'pending'
    ORDER BY cr.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_pending_requests('user-uuid');

-- ============================================================================
-- 6. GET USER'S ACTIVE CONNECTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_connections(p_user_id UUID)
RETURNS TABLE (
    connection_id UUID,
    other_user_id UUID,
    other_user_name VARCHAR,
    other_user_username VARCHAR,
    other_user_photo_url TEXT,
    connected_at TIMESTAMP WITH TIME ZONE,
    conversation_id UUID,
    last_message_at TIMESTAMP WITH TIME ZONE,
    last_message_preview TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as connection_id,
        CASE 
            WHEN c.user1_id = p_user_id THEN c.user2_id
            ELSE c.user1_id
        END as other_user_id,
        CASE 
            WHEN c.user1_id = p_user_id THEN u2.name
            ELSE u1.name
        END as other_user_name,
        CASE 
            WHEN c.user1_id = p_user_id THEN u2.username
            ELSE u1.username
        END as other_user_username,
        CASE 
            WHEN c.user1_id = p_user_id THEN u2.photo_url
            ELSE u1.photo_url
        END as other_user_photo_url,
        c.connected_at,
        conv.id as conversation_id,
        conv.last_message_at,
        conv.last_message_preview
    FROM connections c
    LEFT JOIN users u1 ON u1.id = c.user1_id
    LEFT JOIN users u2 ON u2.id = c.user2_id
    LEFT JOIN conversations conv ON conv.connection_id = c.id
    WHERE (c.user1_id = p_user_id OR c.user2_id = p_user_id)
    AND c.is_active = TRUE
    ORDER BY conv.last_message_at DESC NULLS LAST, c.connected_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_user_connections('user-uuid');

-- ============================================================================
-- 7. SEND A MESSAGE
-- ============================================================================

CREATE OR REPLACE FUNCTION send_message(
    p_conversation_id UUID,
    p_sender_id UUID,
    p_content TEXT,
    p_message_type VARCHAR DEFAULT 'text'
)
RETURNS UUID AS $$
DECLARE
    v_message_id UUID;
    v_connection_id UUID;
BEGIN
    -- Verify sender is part of the conversation
    SELECT c.connection_id INTO v_connection_id
    FROM conversations c
    JOIN connections conn ON conn.id = c.connection_id
    WHERE c.id = p_conversation_id
    AND (conn.user1_id = p_sender_id OR conn.user2_id = p_sender_id)
    AND conn.is_active = TRUE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'User is not part of this conversation or connection is inactive';
    END IF;
    
    -- Insert the message
    INSERT INTO messages (conversation_id, sender_id, content, message_type)
    VALUES (p_conversation_id, p_sender_id, p_content, p_message_type)
    RETURNING id INTO v_message_id;
    
    RETURN v_message_id;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT send_message('conversation-uuid', 'user-uuid', 'Hello!');

-- ============================================================================
-- 8. GET CHAT HISTORY FOR A CONVERSATION
-- ============================================================================
-- Supports pagination with LIMIT and OFFSET

CREATE OR REPLACE FUNCTION get_conversation_messages(
    p_conversation_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    message_id UUID,
    sender_id UUID,
    sender_name VARCHAR,
    sender_username VARCHAR,
    sender_photo_url TEXT,
    content TEXT,
    message_type VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    edited_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id as message_id,
        m.sender_id,
        u.name as sender_name,
        u.username as sender_username,
        u.photo_url as sender_photo_url,
        m.content,
        m.message_type,
        m.created_at,
        m.read_at,
        m.edited_at
    FROM messages m
    JOIN users u ON u.id = m.sender_id
    WHERE m.conversation_id = p_conversation_id
    AND m.deleted_at IS NULL
    ORDER BY m.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_conversation_messages('conversation-uuid', 50, 0);

-- ============================================================================
-- 9. MARK MESSAGES AS READ
-- ============================================================================

CREATE OR REPLACE FUNCTION mark_messages_as_read(
    p_conversation_id UUID,
    p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Only mark messages not sent by the user
    UPDATE messages
    SET read_at = CURRENT_TIMESTAMP
    WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND read_at IS NULL;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT mark_messages_as_read('conversation-uuid', 'user-uuid');

-- ============================================================================
-- 10. GET MUTUAL ENCOUNTERS BETWEEN TWO USERS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_mutual_encounters(
    p_user1_id UUID,
    p_user2_id UUID,
    p_days_back INTEGER DEFAULT 14
)
RETURNS TABLE (
    encounter_id UUID,
    encountered_at TIMESTAMP WITH TIME ZONE,
    latitude DECIMAL,
    longitude DECIMAL
) AS $$
DECLARE
    v_user1 UUID;
    v_user2 UUID;
BEGIN
    -- Ensure consistent ordering
    IF p_user1_id < p_user2_id THEN
        v_user1 := p_user1_id;
        v_user2 := p_user2_id;
    ELSE
        v_user1 := p_user2_id;
        v_user2 := p_user1_id;
    END IF;
    
    RETURN QUERY
    SELECT 
        e.id as encounter_id,
        e.encountered_at,
        e.latitude,
        e.longitude
    FROM encounters e
    WHERE e.user1_id = v_user1
    AND e.user2_id = v_user2
    AND e.encountered_at >= NOW() - (p_days_back || ' days')::INTERVAL
    ORDER BY e.encountered_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Example usage:
-- SELECT * FROM get_mutual_encounters('user-uuid-1', 'user-uuid-2', 14);

-- ============================================================================
-- 11. CLEANUP EXPIRED CONNECTION REQUESTS
-- ============================================================================
-- Should be run as a scheduled job (e.g., daily)

CREATE OR REPLACE FUNCTION cleanup_expired_requests()
RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    UPDATE connection_requests
    SET status = 'expired'
    WHERE status = 'pending'
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Example usage (run as cron job):
-- SELECT cleanup_expired_requests();

