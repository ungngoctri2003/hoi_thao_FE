-- Add AVATAR_URL column to APP_USERS table
-- This allows admin and staff users to have avatars

-- Add the column
ALTER TABLE APP_USERS ADD AVATAR_URL VARCHAR2(500);

-- Add comment for documentation
COMMENT ON COLUMN APP_USERS.AVATAR_URL IS 'URL of user avatar image';

-- Update existing users with some sample avatars (optional)
UPDATE APP_USERS SET AVATAR_URL = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' WHERE ID = 1; -- admin
UPDATE APP_USERS SET AVATAR_URL = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' WHERE ID = 2; -- staff
-- User ID = 3 is attendee, so no avatar in APP_USERS table

COMMIT;
