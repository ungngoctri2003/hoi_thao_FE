-- Add FIREBASE_UID column to APP_USERS and ATTENDEES tables
-- This allows Google authentication to work properly

-- Add FIREBASE_UID to APP_USERS table
ALTER TABLE APP_USERS ADD FIREBASE_UID VARCHAR2(128);

-- Add comment for documentation
COMMENT ON COLUMN APP_USERS.FIREBASE_UID IS 'Firebase UID for Google authentication';

-- Add FIREBASE_UID to ATTENDEES table
ALTER TABLE ATTENDEES ADD FIREBASE_UID VARCHAR2(128);

-- Add comment for documentation
COMMENT ON COLUMN ATTENDEES.FIREBASE_UID IS 'Firebase UID for Google authentication';

-- Create unique index on FIREBASE_UID in APP_USERS to prevent duplicates
CREATE UNIQUE INDEX IDX_APP_USERS_FIREBASE_UID ON APP_USERS (FIREBASE_UID);

-- Create unique index on FIREBASE_UID in ATTENDEES to prevent duplicates
CREATE UNIQUE INDEX IDX_ATTENDEES_FIREBASE_UID ON ATTENDEES (FIREBASE_UID);

COMMIT;





