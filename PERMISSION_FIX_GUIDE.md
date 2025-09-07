# 🔧 Permission Fix Guide - Attendees Module

## 🚨 Problem
The attendees module is showing **403 Forbidden** error because of a permission mismatch:

- **API requires**: `attendees.read` permission
- **User has**: `attendee_view` permission
- **Missing**: `attendees.read` permission

## 📊 Current Database State
Based on your database data, admin role has these permissions:
- `dashboard_view`
- `conference_create`, `conference_edit`, `conference_delete`
- `attendee_view`, `attendee_edit`
- `checkin_perform`
- `role_manage`, `settings_manage`, `audit_view`
- `roles.admin`

## ✅ Solution

### Option 1: Quick SQL Fix (Recommended)
Run these SQL commands in your Oracle database:

```sql
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
```

### Option 2: Use Automated Script
1. Install Oracle client: `npm install oracledb`
2. Set environment variables:
   ```bash
   export DB_USER=your_username
   export DB_PASSWORD=your_password
   export DB_CONNECT_STRING=localhost:1521/XE
   ```
3. Run: `node fix-permissions-automated.js`

### Option 3: Manual Database Update
1. Connect to your Oracle database
2. Run the SQL commands from `quick-fix-permissions.sql`
3. Verify the changes

## 🔍 Verification Steps

### 1. Check Permission Created
```sql
SELECT ID, CODE, NAME, CATEGORY, DESCRIPTION 
FROM PERMISSIONS 
WHERE CODE = 'attendees.read';
```

### 2. Check Role Assignment
```sql
SELECT 
    r.CODE as ROLE_CODE,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE p.CODE = 'attendees.read';
```

### 3. Check All Admin Permissions
```sql
SELECT 
    r.CODE as ROLE_CODE,
    p.CODE as PERMISSION_CODE,
    p.NAME as PERMISSION_NAME,
    p.CATEGORY
FROM ROLES r
JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
WHERE r.CODE = 'admin'
ORDER BY p.CODE;
```

## 🎯 Expected Result
After fixing, admin role should have:
- `attendee_view` (existing)
- `attendee_edit` (existing)
- `attendees.read` (newly added) ✅

## 🚀 After Fix
1. **Restart backend** (if needed)
2. **Refresh frontend**
3. **Test attendees module** - should load data successfully
4. **Remove debug panels** from production

## 📁 Files Created
- `quick-fix-permissions.sql` - Simple SQL fix
- `fix-database-permissions.sql` - Complete fix with verification
- `fix-permissions-automated.js` - Automated Node.js script
- `PERMISSION_FIX_GUIDE.md` - This guide

## 🆘 Troubleshooting
If still having issues:
1. Check database connection
2. Verify SQL commands executed successfully
3. Check backend logs for permission errors
4. Ensure user is logged in with admin role
5. Clear browser cache and cookies

## 📞 Support
If you need help, check:
1. Backend logs for detailed error messages
2. Database permissions table
3. User role assignments
4. API endpoint permissions in backend code
