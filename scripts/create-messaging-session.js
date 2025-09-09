const oracledb = require('oracledb');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'HOI_THAO',
  password: process.env.DB_PASSWORD || 'HOI_THAO',
  connectString: process.env.DB_CONNECTION_STRING || 'localhost:1521/XE',
  poolMin: 1,
  poolMax: 10,
  poolIncrement: 1
};

async function createMessagingSession() {
  let connection;
  
  try {
    // Initialize Oracle client
    oracledb.initOracleClient();
    
    // Create connection
    connection = await oracledb.getConnection(dbConfig);
    console.log('Connected to Oracle database');

    // Check if conference exists
    const conferenceCheck = await connection.execute(
      'SELECT ID FROM CONFERENCES WHERE ROWNUM = 1',
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (!conferenceCheck.rows || conferenceCheck.rows.length === 0) {
      console.log('No conferences found. Creating a sample conference...');
      
      // Create a sample conference
      const conferenceResult = await connection.execute(
        `INSERT INTO CONFERENCES (NAME, DESCRIPTION, START_DATE, END_DATE, LOCATION, STATUS, CAPACITY, CATEGORY, ORGANIZER)
         VALUES (:name, :desc, :start, :end, :location, :status, :capacity, :category, :organizer) 
         RETURNING ID INTO :ID`,
        {
          name: 'Sample Conference 2024',
          desc: 'Sample conference for messaging testing',
          start: new Date(),
          end: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          location: 'Virtual',
          status: 'active',
          capacity: 100,
          category: 'Technology',
          organizer: 'Test Organizer',
          ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
        },
        { autoCommit: true }
      );
      
      const conferenceId = conferenceResult.outBinds.ID[0];
      console.log(`Created conference with ID: ${conferenceId}`);
    }

    // Get the first conference ID
    const conferenceResult = await connection.execute(
      'SELECT ID FROM CONFERENCES WHERE ROWNUM = 1',
      {},
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );
    
    const conferenceId = conferenceResult.rows[0].ID;
    console.log(`Using conference ID: ${conferenceId}`);

    // Check if sessions exist for this conference
    const sessionCheck = await connection.execute(
      'SELECT COUNT(*) as CNT FROM SESSIONS WHERE CONFERENCE_ID = :confId',
      { confId: conferenceId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const sessionCount = sessionCheck.rows[0].CNT;
    console.log(`Found ${sessionCount} sessions for conference ${conferenceId}`);

    if (sessionCount === 0) {
      console.log('Creating messaging sessions...');
      
      // Create multiple messaging sessions
      const sessions = [
        {
          title: 'General Discussion',
          description: 'General messaging and discussion session',
          status: 'active'
        },
        {
          title: 'Networking Chat',
          description: 'Networking and connection session',
          status: 'active'
        },
        {
          title: 'Q&A Session',
          description: 'Questions and answers session',
          status: 'active'
        }
      ];

      for (const session of sessions) {
        const sessionResult = await connection.execute(
          `INSERT INTO SESSIONS (CONFERENCE_ID, TITLE, DESCRIPTION, STATUS, START_TIME, END_TIME)
           VALUES (:confId, :title, :desc, :status, :start, :end) 
           RETURNING ID INTO :ID`,
          {
            confId: conferenceId,
            title: session.title,
            desc: session.description,
            status: session.status,
            start: new Date(),
            end: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
            ID: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
          },
          { autoCommit: true }
        );
        
        const sessionId = sessionResult.outBinds.ID[0];
        console.log(`Created session: ${session.title} (ID: ${sessionId})`);
      }
    } else {
      console.log('Sessions already exist for this conference');
    }

    // List all sessions
    const sessionsResult = await connection.execute(
      'SELECT ID, TITLE, STATUS FROM SESSIONS WHERE CONFERENCE_ID = :confId ORDER BY ID',
      { confId: conferenceId },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log('\nAvailable sessions:');
    sessionsResult.rows.forEach(row => {
      console.log(`- ID: ${row.ID}, Title: ${row.TITLE}, Status: ${row.STATUS}`);
    });

    console.log('\n✅ Messaging sessions setup completed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (connection) {
      try {
        await connection.close();
        console.log('Database connection closed');
      } catch (error) {
        console.error('Error closing connection:', error);
      }
    }
  }
}

// Run the script
createMessagingSession();
