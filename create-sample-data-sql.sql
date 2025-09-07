-- SQL script to create sample data for conference permissions
-- Run this in your database management tool (pgAdmin, DBeaver, etc.)

-- 1. Create sample conferences
INSERT INTO conferences (name, description, start_date, end_date, location, status, created_at, updated_at)
VALUES 
  ('Hội nghị Công nghệ 2024', 'Hội nghị về công nghệ và đổi mới', '2024-01-15', '2024-01-17', 'Hà Nội', 'active', NOW(), NOW()),
  ('Hội nghị AI & Machine Learning', 'Hội nghị về trí tuệ nhân tạo và học máy', '2024-02-20', '2024-02-22', 'TP.HCM', 'active', NOW(), NOW()),
  ('Hội nghị Blockchain & Crypto', 'Hội nghị về blockchain và tiền điện tử', '2024-03-10', '2024-03-12', 'Đà Nẵng', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- 2. Get user IDs (assuming you have users in the database)
-- Replace these IDs with actual user IDs from your users table
-- You can check existing users with: SELECT id, email, name, role FROM users;

-- 3. Create conference assignments for each user
-- Admin permissions (full access)
INSERT INTO user_conference_assignments (user_id, conference_id, permissions, is_active, created_at, updated_at)
SELECT 
  u.id as user_id,
  c.id as conference_id,
  CASE 
    WHEN u.role = 'admin' THEN '{"conferences.view": true, "conferences.create": true, "conferences.update": true, "conferences.delete": true, "attendees.view": true, "attendees.manage": true, "checkin.manage": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "analytics.view": true, "my-events.view": true, "roles.manage": true, "mobile.view": true}'
    WHEN u.role = 'staff' THEN '{"conferences.view": true, "conferences.create": true, "conferences.update": true, "attendees.view": true, "attendees.manage": true, "checkin.manage": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "analytics.view": true, "my-events.view": true, "mobile.view": true}'
    ELSE '{"conferences.view": true, "attendees.view": true, "networking.view": true, "venue.view": true, "sessions.view": true, "badges.view": true, "my-events.view": true, "mobile.view": true}'
  END as permissions,
  1 as is_active,
  NOW() as created_at,
  NOW() as updated_at
FROM users u
CROSS JOIN conferences c
WHERE NOT EXISTS (
  SELECT 1 FROM user_conference_assignments uca 
  WHERE uca.user_id = u.id AND uca.conference_id = c.id
);

-- 4. Verify the data
SELECT 
  u.name as user_name,
  u.email as user_email,
  u.role as user_role,
  c.name as conference_name,
  uca.is_active,
  jsonb_object_keys(uca.permissions::jsonb) as permission_keys
FROM user_conference_assignments uca
JOIN users u ON uca.user_id = u.id
JOIN conferences c ON uca.conference_id = c.id
ORDER BY u.name, c.name;

-- 5. Count assignments by user
SELECT 
  u.name as user_name,
  u.role as user_role,
  COUNT(uca.id) as assignment_count
FROM users u
LEFT JOIN user_conference_assignments uca ON u.id = uca.user_id
GROUP BY u.id, u.name, u.role
ORDER BY u.name;
