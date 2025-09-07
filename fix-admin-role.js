// Script to fix admin role assignment
const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'conference_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
};

const pool = new Pool(dbConfig);

async function fixAdminRole() {
  console.log('🔧 Fixing admin role assignment...\n');
  
  try {
    // Connect to database
    await pool.connect();
    console.log('✅ Connected to database');
    
    // Check if admin role exists
    console.log('\n📋 Checking admin role...');
    const adminRoleResult = await pool.query(
      "SELECT ID, CODE, NAME FROM ROLES WHERE CODE = 'admin'"
    );
    
    if (adminRoleResult.rows.length === 0) {
      console.log('❌ Admin role not found. Creating admin role...');
      await pool.query(
        "INSERT INTO ROLES (ID, CODE, NAME) VALUES (1, 'admin', 'Quản trị viên')"
      );
      console.log('✅ Admin role created');
    } else {
      console.log('✅ Admin role found:', adminRoleResult.rows[0]);
    }
    
    const adminRoleId = adminRoleResult.rows[0]?.ID || 1;
    
    // Check current users and their roles
    console.log('\n📋 Checking current users and roles...');
    const usersResult = await pool.query(`
      SELECT 
        u.ID, 
        u.EMAIL, 
        u.NAME, 
        u.ROLE_CODE,
        r.CODE as ACTUAL_ROLE_CODE,
        r.NAME as ROLE_NAME
      FROM USERS u
      LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
      LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
      ORDER BY u.ID
    `);
    
    console.log('Current users and roles:');
    usersResult.rows.forEach(user => {
      console.log(`- ID: ${user.ID}, Email: ${user.EMAIL}, Name: ${user.NAME}`);
      console.log(`  ROLE_CODE: ${user.ROLE_CODE}, Actual Role: ${user.ACTUAL_ROLE_CODE} (${user.ROLE_NAME})`);
    });
    
    // Find users that should be admin
    console.log('\n🔍 Looking for admin users...');
    const adminUsers = usersResult.rows.filter(user => 
      user.EMAIL?.toLowerCase().includes('admin') || 
      user.NAME?.toLowerCase().includes('admin') ||
      user.ROLE_CODE === 'admin'
    );
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin users found. Please specify which user should be admin.');
      console.log('Available users:');
      usersResult.rows.forEach(user => {
        console.log(`- ID: ${user.ID}, Email: ${user.EMAIL}, Name: ${user.NAME}`);
      });
      return;
    }
    
    console.log('Found potential admin users:');
    adminUsers.forEach(user => {
      console.log(`- ID: ${user.ID}, Email: ${user.EMAIL}, Name: ${user.NAME}`);
    });
    
    // Fix admin role for each admin user
    for (const user of adminUsers) {
      console.log(`\n🔧 Fixing role for user ${user.EMAIL}...`);
      
      // Update ROLE_CODE in USERS table
      await pool.query(
        'UPDATE USERS SET ROLE_CODE = $1 WHERE ID = $2',
        ['admin', user.ID]
      );
      console.log(`✅ Updated ROLE_CODE to 'admin' for user ${user.ID}`);
      
      // Remove existing role assignments
      await pool.query(
        'DELETE FROM USER_ROLES WHERE USER_ID = $1',
        [user.ID]
      );
      console.log(`✅ Removed existing role assignments for user ${user.ID}`);
      
      // Assign admin role
      await pool.query(
        'INSERT INTO USER_ROLES (USER_ID, ROLE_ID) VALUES ($1, $2)',
        [user.ID, adminRoleId]
      );
      console.log(`✅ Assigned admin role to user ${user.ID}`);
    }
    
    // Verify the fix
    console.log('\n✅ Verifying the fix...');
    const verifyResult = await pool.query(`
      SELECT 
        u.ID, 
        u.EMAIL, 
        u.NAME, 
        u.ROLE_CODE,
        r.CODE as ACTUAL_ROLE_CODE,
        r.NAME as ROLE_NAME
      FROM USERS u
      LEFT JOIN USER_ROLES ur ON u.ID = ur.USER_ID
      LEFT JOIN ROLES r ON ur.ROLE_ID = r.ID
      WHERE u.ROLE_CODE = 'admin'
      ORDER BY u.ID
    `);
    
    console.log('Admin users after fix:');
    verifyResult.rows.forEach(user => {
      console.log(`- ID: ${user.ID}, Email: ${user.EMAIL}, Name: ${user.NAME}`);
      console.log(`  ROLE_CODE: ${user.ROLE_CODE}, Actual Role: ${user.ACTUAL_ROLE_CODE} (${user.ROLE_NAME})`);
    });
    
    console.log('\n🎉 Admin role fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  } finally {
    await pool.end();
  }
}

// Run the fix
fixAdminRole();
