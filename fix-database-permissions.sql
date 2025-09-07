-- Fix database permissions for attendees module
-- This script adds the missing 'attendees.read' permission and assigns it to admin role

-- Step 1: Check current permissions for admin role
SELECT 
    r.ID as ROLE_ID,
    r.CODE as ROLE_CODE,
    r.NAME as ROLE_NAME,
    p.ID as PERMISSION_ID,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME,
    p.CATEGORY
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE r.CODE = 'admin'
ORDER BY p.CODE;

-- Step 2: Check if attendees.read permission exists
SELECT ID, CODE, NAME, CATEGORY, DESCRIPTION 
FROM PERMISSIONS 
WHERE CODE = 'attendees.read';

-- Step 3: Create the missing attendees.read permission
INSERT INTO PERMISSIONS (CODE, NAME, CATEGORY, DESCRIPTION) 
VALUES ('attendees.read', 'Đọc danh sách người tham dự', 'Người tham dự', 'Quyền đọc danh sách người tham dự')
WHERE NOT EXISTS (SELECT 1 FROM PERMISSIONS WHERE CODE = 'attendees.read');

-- Step 4: Get the new permission ID
SELECT ID FROM PERMISSIONS WHERE CODE = 'attendees.read';

-- Step 5: Get admin role ID
SELECT ID FROM ROLES WHERE CODE = 'admin';

-- Step 6: Assign attendees.read permission to admin role
INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
SELECT r.ID, p.ID 
FROM ROLES r, PERMISSIONS p 
WHERE r.CODE = 'admin' AND p.CODE = 'attendees.read'
AND NOT EXISTS (
  SELECT 1 FROM ROLE_PERMISSIONS rp 
  WHERE rp.ROLE_ID = r.ID AND rp.PERMISSION_ID = p.ID
);

-- Step 7: Also assign to staff role if needed
INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
SELECT r.ID, p.ID 
FROM ROLES r, PERMISSIONS p 
WHERE r.CODE = 'staff' AND p.CODE = 'attendees.read'
AND NOT EXISTS (
  SELECT 1 FROM ROLE_PERMISSIONS rp 
  WHERE rp.ROLE_ID = r.ID AND rp.PERMISSION_ID = p.ID
);

-- Step 8: Verify the permission was added
SELECT 
    r.CODE as ROLE_CODE,
    r.NAME as ROLE_NAME,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME,
    p.CATEGORY
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE p.CODE = 'attendees.read'
ORDER BY r.CODE;

-- Step 9: Show all permissions for admin role after fix
SELECT 
    r.ID as ROLE_ID,
    r.CODE as ROLE_CODE,
    r.NAME as ROLE_NAME,
    p.ID as PERMISSION_ID,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME,
    p.CATEGORY
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE r.CODE = 'admin'
ORDER BY p.CODE;

-- Step 10: Check if there are any other missing permissions for attendees module
-- List all permissions that start with 'attendee'
SELECT ID, CODE, NAME, CATEGORY, DESCRIPTION 
FROM PERMISSIONS 
WHERE CODE LIKE 'attendee%' OR CODE LIKE 'attendees%'
ORDER BY CODE;
