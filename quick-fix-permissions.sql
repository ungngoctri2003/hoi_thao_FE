-- Quick fix for attendee permissions
-- Run these commands in your Oracle database

-- 1. Create the missing permission
INSERT INTO PERMISSIONS (CODE, NAME, CATEGORY, DESCRIPTION) 
VALUES ('attendees.read', 'Đọc danh sách người tham dự', 'Người tham dự', 'Quyền đọc danh sách người tham dự');

-- 2. Assign to admin role
INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
SELECT r.ID, p.ID 
FROM ROLES r, PERMISSIONS p 
WHERE r.CODE = 'admin' AND p.CODE = 'attendees.read';

-- 3. Assign to staff role
INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
SELECT r.ID, p.ID 
FROM ROLES r, PERMISSIONS p 
WHERE r.CODE = 'staff' AND p.CODE = 'attendees.read';

-- 4. Verify the fix
SELECT 
    r.CODE as ROLE_CODE,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE p.CODE = 'attendees.read'
ORDER BY r.CODE;
