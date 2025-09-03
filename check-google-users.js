#!/usr/bin/env node

/**
 * Script để kiểm tra xem user Google đã được lưu vào database chưa
 * Chạy script này để kiểm tra trạng thái database
 */

const oracledb = require('oracledb');

async function checkGoogleUsers() {
  let connection;
  try {
    // Kết nối database
    connection = await oracledb.getConnection({
      user: process.env.DB_USER || 'system',
      password: process.env.DB_PASSWORD || 'oracle',
      connectString: process.env.DB_CONNECT_STRING || 'localhost:1521/XE'
    });

    console.log('✅ Connected to Oracle database\n');

    // 1. Kiểm tra cấu trúc bảng users
    console.log('🔍 Checking USERS table structure...');
    try {
      const userTableDesc = await connection.execute(`
        SELECT column_name, data_type, nullable, data_default
        FROM user_tab_columns 
        WHERE table_name = 'APP_USERS'
        ORDER BY column_id
      `);
      
      console.log('📋 USERS table columns:');
      userTableDesc.rows.forEach(row => {
        console.log(`  - ${row[0]}: ${row[1]} (nullable: ${row[2]})`);
      });
      
      // Kiểm tra có cột FIREBASE_UID không
      const hasFirebaseUid = userTableDesc.rows.some(row => row[0] === 'FIREBASE_UID');
      if (hasFirebaseUid) {
        console.log('✅ FIREBASE_UID column exists in USERS table');
      } else {
        console.log('❌ FIREBASE_UID column NOT found in USERS table');
        console.log('   Run migration: node run-google-auth-migration.js');
      }
    } catch (error) {
      console.log('❌ Error checking USERS table:', error.message);
    }

    console.log('\n');

    // 2. Kiểm tra cấu trúc bảng attendees
    console.log('🔍 Checking ATTENDEES table structure...');
    try {
      const attendeeTableDesc = await connection.execute(`
        SELECT column_name, data_type, nullable, data_default
        FROM user_tab_columns 
        WHERE table_name = 'ATTENDEES'
        ORDER BY column_id
      `);
      
      console.log('📋 ATTENDEES table columns:');
      attendeeTableDesc.rows.forEach(row => {
        console.log(`  - ${row[0]}: ${row[1]} (nullable: ${row[2]})`);
      });
      
      // Kiểm tra có cột FIREBASE_UID không
      const hasFirebaseUid = attendeeTableDesc.rows.some(row => row[0] === 'FIREBASE_UID');
      if (hasFirebaseUid) {
        console.log('✅ FIREBASE_UID column exists in ATTENDEES table');
      } else {
        console.log('❌ FIREBASE_UID column NOT found in ATTENDEES table');
        console.log('   Run migration: node run-google-auth-migration.js');
      }
    } catch (error) {
      console.log('❌ Error checking ATTENDEES table:', error.message);
    }

    console.log('\n');

    // 3. Kiểm tra users có firebase_uid
    console.log('🔍 Checking users with Firebase UID...');
    try {
      const googleUsers = await connection.execute(`
        SELECT ID, EMAIL, NAME, FIREBASE_UID, AVATAR_URL, CREATED_AT, LAST_LOGIN
        FROM APP_USERS 
        WHERE FIREBASE_UID IS NOT NULL
        ORDER BY CREATED_AT DESC
      `);
      
      if (googleUsers.rows.length > 0) {
        console.log(`✅ Found ${googleUsers.rows.length} Google users:`);
        googleUsers.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row[2]} (${row[1]})`);
          console.log(`     Firebase UID: ${row[3]}`);
          console.log(`     Avatar: ${row[4] || 'None'}`);
          console.log(`     Created: ${row[5]}`);
          console.log(`     Last Login: ${row[6] || 'Never'}`);
          console.log('');
        });
      } else {
        console.log('❌ No Google users found in database');
        console.log('   This means Google authentication is not saving users to database');
      }
    } catch (error) {
      console.log('❌ Error checking Google users:', error.message);
    }

    // 4. Kiểm tra attendees có firebase_uid
    console.log('🔍 Checking attendees with Firebase UID...');
    try {
      const googleAttendees = await connection.execute(`
        SELECT ID, NAME, EMAIL, FIREBASE_UID, AVATAR_URL, CREATED_AT
        FROM ATTENDEES 
        WHERE FIREBASE_UID IS NOT NULL
        ORDER BY CREATED_AT DESC
      `);
      
      if (googleAttendees.rows.length > 0) {
        console.log(`✅ Found ${googleAttendees.rows.length} Google attendees:`);
        googleAttendees.rows.forEach((row, index) => {
          console.log(`  ${index + 1}. ${row[1]} (${row[2]})`);
          console.log(`     Firebase UID: ${row[3]}`);
          console.log(`     Avatar: ${row[4] || 'None'}`);
          console.log(`     Created: ${row[5]}`);
          console.log('');
        });
      } else {
        console.log('❌ No Google attendees found in database');
      }
    } catch (error) {
      console.log('❌ Error checking Google attendees:', error.message);
    }

    // 5. Kiểm tra tổng số users
    console.log('📊 Database Statistics:');
    try {
      const totalUsers = await connection.execute(`SELECT COUNT(*) as total FROM APP_USERS`);
      const totalAttendees = await connection.execute(`SELECT COUNT(*) as total FROM ATTENDEES`);
      const googleUsersCount = await connection.execute(`SELECT COUNT(*) as total FROM APP_USERS WHERE FIREBASE_UID IS NOT NULL`);
      const googleAttendeesCount = await connection.execute(`SELECT COUNT(*) as total FROM ATTENDEES WHERE FIREBASE_UID IS NOT NULL`);
      
      console.log(`  - Total Users: ${totalUsers.rows[0][0]}`);
      console.log(`  - Total Attendees: ${totalAttendees.rows[0][0]}`);
      console.log(`  - Google Users: ${googleUsersCount.rows[0][0]}`);
      console.log(`  - Google Attendees: ${googleAttendeesCount.rows[0][0]}`);
    } catch (error) {
      console.log('❌ Error getting statistics:', error.message);
    }

    await connection.close();
    console.log('\n🎉 Database check completed successfully');
    
  } catch (error) {
    console.error('💥 Database check failed:', error.message);
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error closing connection:', closeError.message);
      }
    }
  }
}

// Chạy script
checkGoogleUsers();
