// Automated script to fix attendee permissions in database
// This script connects to Oracle database and adds missing permissions

const oracledb = require('oracledb');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'your_username',
  password: process.env.DB_PASSWORD || 'your_password',
  connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE'
};

async function fixPermissions() {
  let connection;
  
  try {
    console.log('🔧 Connecting to Oracle database...');
    connection = await oracledb.getConnection(dbConfig);
    console.log('✅ Connected to database successfully');

    // Step 1: Check current permissions for admin role
    console.log('\n📋 Checking current permissions for admin role...');
    const currentPermissions = await connection.execute(`
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
      ORDER BY p.CODE
    `);
    
    console.log('Current admin permissions:');
    currentPermissions.rows.forEach(row => {
      console.log(`  - ${row[4]} (${row[5]})`);
    });

    // Step 2: Check if attendees.read permission exists
    console.log('\n🔍 Checking if attendees.read permission exists...');
    const existingPermission = await connection.execute(`
      SELECT ID, CODE, NAME, CATEGORY, DESCRIPTION 
      FROM PERMISSIONS 
      WHERE CODE = 'attendees.read'
    `);

    if (existingPermission.rows.length > 0) {
      console.log('✅ attendees.read permission already exists');
    } else {
      console.log('❌ attendees.read permission does not exist, creating...');
      
      // Step 3: Create the missing permission
      const createPermission = await connection.execute(`
        INSERT INTO PERMISSIONS (CODE, NAME, CATEGORY, DESCRIPTION) 
        VALUES (:code, :name, :category, :description)
      `, {
        code: 'attendees.read',
        name: 'Đọc danh sách người tham dự',
        category: 'Người tham dự',
        description: 'Quyền đọc danh sách người tham dự'
      });
      
      await connection.commit();
      console.log('✅ Created attendees.read permission');
    }

    // Step 4: Get permission ID
    const permissionResult = await connection.execute(`
      SELECT ID FROM PERMISSIONS WHERE CODE = 'attendees.read'
    `);
    const permissionId = permissionResult.rows[0][0];
    console.log(`📝 Permission ID: ${permissionId}`);

    // Step 5: Get admin role ID
    const adminRoleResult = await connection.execute(`
      SELECT ID FROM ROLES WHERE CODE = 'admin'
    `);
    const adminRoleId = adminRoleResult.rows[0][0];
    console.log(`👤 Admin Role ID: ${adminRoleId}`);

    // Step 6: Check if permission is already assigned to admin
    const existingAssignment = await connection.execute(`
      SELECT COUNT(*) FROM ROLE_PERMISSIONS 
      WHERE ROLE_ID = :roleId AND PERMISSION_ID = :permissionId
    `, {
      roleId: adminRoleId,
      permissionId: permissionId
    });

    if (existingAssignment.rows[0][0] > 0) {
      console.log('✅ Permission already assigned to admin role');
    } else {
      console.log('🔗 Assigning permission to admin role...');
      
      // Assign permission to admin role
      await connection.execute(`
        INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
        VALUES (:roleId, :permissionId)
      `, {
        roleId: adminRoleId,
        permissionId: permissionId
      });
      
      await connection.commit();
      console.log('✅ Permission assigned to admin role');
    }

    // Step 7: Also assign to staff role
    const staffRoleResult = await connection.execute(`
      SELECT ID FROM ROLES WHERE CODE = 'staff'
    `);
    
    if (staffRoleResult.rows.length > 0) {
      const staffRoleId = staffRoleResult.rows[0][0];
      
      const staffAssignment = await connection.execute(`
        SELECT COUNT(*) FROM ROLE_PERMISSIONS 
        WHERE ROLE_ID = :roleId AND PERMISSION_ID = :permissionId
      `, {
        roleId: staffRoleId,
        permissionId: permissionId
      });

      if (staffAssignment.rows[0][0] === 0) {
        console.log('🔗 Assigning permission to staff role...');
        
        await connection.execute(`
          INSERT INTO ROLE_PERMISSIONS (ROLE_ID, PERMISSION_ID)
          VALUES (:roleId, :permissionId)
        `, {
          roleId: staffRoleId,
          permissionId: permissionId
        });
        
        await connection.commit();
        console.log('✅ Permission assigned to staff role');
      } else {
        console.log('✅ Permission already assigned to staff role');
      }
    }

    // Step 8: Verify the fix
    console.log('\n✅ Verification - Final permissions for admin role:');
    const finalPermissions = await connection.execute(`
      SELECT 
        r.CODE as ROLE_CODE,
        p.CODE as PERMISSION_CODE,
        p.NAME as PERMISSION_NAME,
        p.CATEGORY
      FROM ROLES r
      JOIN ROLE_PERMISSIONS rp ON r.ID = rp.ROLE_ID
      JOIN PERMISSIONS p ON rp.PERMISSION_ID = p.ID
      WHERE r.CODE = 'admin'
      ORDER BY p.CODE
    `);
    
    finalPermissions.rows.forEach(row => {
      console.log(`  - ${row[1]} (${row[2]}) - ${row[3]}`);
    });

    console.log('\n🎉 Permission fix completed successfully!');
    console.log('💡 You can now refresh the frontend and the attendees module should work.');

  } catch (error) {
    console.error('❌ Error fixing permissions:', error);
    if (connection) {
      await connection.rollback();
    }
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('🔌 Database connection closed');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

// Run the fix
if (require.main === module) {
  fixPermissions().catch(console.error);
}

module.exports = { fixPermissions };
