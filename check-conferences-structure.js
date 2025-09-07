const oracledb = require('oracledb');
require('dotenv').config();

async function checkTableStructure() {
  let conn;
  try {
    oracledb.initOracleClient();
    conn = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT_STRING
    });

    console.log('Connected to database');
    
    // Check CONFERENCES table structure
    const result = await conn.execute(`
      SELECT column_name, data_type, data_length, nullable
      FROM user_tab_columns 
      WHERE table_name = 'CONFERENCES'
      ORDER BY column_id
    `);
    
    console.log('\nCONFERENCES table structure:');
    console.log('Column Name | Data Type | Length | Nullable');
    console.log('--------------------------------------------');
    result.rows.forEach(row => {
      console.log(`${row[0].padEnd(12)} | ${row[1].padEnd(10)} | ${String(row[2] || '').padEnd(6)} | ${row[3]}`);
    });

    // Check if there are any existing conferences to see the date format
    const sampleResult = await conn.execute(`
      SELECT ID, NAME, START_DATE, END_DATE, CREATED_AT
      FROM CONFERENCES 
      WHERE ROWNUM <= 1
    `);
    
    if (sampleResult.rows.length > 0) {
      console.log('\nSample conference data:');
      console.log('ID:', sampleResult.rows[0][0]);
      console.log('Name:', sampleResult.rows[0][1]);
      console.log('Start Date:', sampleResult.rows[0][2]);
      console.log('End Date:', sampleResult.rows[0][3]);
      console.log('Created At:', sampleResult.rows[0][4]);
    } else {
      console.log('\nNo existing conferences found');
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    if (conn) {
      await conn.close();
      console.log('\nDatabase connection closed');
    }
  }
}

checkTableStructure();
