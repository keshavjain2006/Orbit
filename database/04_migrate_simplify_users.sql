-- ============================================================================
-- Migration: Simplify Users Table
-- Remove: username, email, age
-- Add: pronouns
-- ============================================================================
-- Run this after updating Prisma schema and generating migration

-- Step 1: Add pronouns column
ALTER TABLE users ADD COLUMN IF NOT EXISTS pronouns VARCHAR(50);

-- Step 2: Make username and email nullable (to allow migration)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Step 3: Drop unique constraints on username and email
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_username_key;
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_email_key;

-- Step 4: Drop indexes on username and email
DROP INDEX IF EXISTS idx_users_username;
DROP INDEX IF EXISTS idx_users_email;

-- Step 5: Remove username, email, and age columns
ALTER TABLE users DROP COLUMN IF EXISTS username;
ALTER TABLE users DROP COLUMN IF EXISTS email;
ALTER TABLE users DROP COLUMN IF EXISTS age;

-- Step 6: Remove photo_url if you want (optional - keeping it for now)
-- ALTER TABLE users DROP COLUMN IF EXISTS photo_url;

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

