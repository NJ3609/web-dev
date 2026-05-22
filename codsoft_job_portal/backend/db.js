import pg from 'pg';
import { DatabaseSync } from 'node:sqlite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const { Pool } = pg;

let dbType = 'postgres';
let pgPool = null;
let sqliteDb = null;

// Initialize connection
try {
  // Test connection to PostgreSQL
  const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 3000
      }
    : {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'jobboard',
        password: process.env.DB_PASS || 'root',
        port: parseInt(process.env.DB_PORT || '5432'),
        connectionTimeoutMillis: 3000 // 3 seconds timeout
      };

  pgPool = new Pool(poolConfig);

  // Try to connect to PostgreSQL
  const client = await pgPool.connect();
  client.release();
  console.log('Successfully connected to PostgreSQL database!');
  dbType = 'postgres';
} catch (err) {
  console.warn('\n⚠️  PostgreSQL connection failed. Falling back to local SQLite database (jobboard.db)...');
  console.warn(`Reason: ${err.message}\n`);
  
  dbType = 'sqlite';
  try {
    const sqlitePath = path.join(__dirname, 'jobboard.db');
    sqliteDb = new DatabaseSync(sqlitePath);
    console.log('Successfully initialized local SQLite database!');
  } catch (sqliteErr) {
    console.error('Failed to initialize SQLite database:', sqliteErr);
    process.exit(1);
  }
}

// Unified query wrapper
export async function query(sql, params = []) {
  if (dbType === 'postgres') {
    return await pgPool.query(sql, params);
  } else {
    // Translate postgres parameterized queries ($1, $2, ...) to sqlite (?)
    const sqliteSql = sql.replace(/\$\d+/g, '?');
    
    try {
      const stmt = sqliteDb.prepare(sqliteSql);
      
      const isReadOrReturning = sqliteSql.trim().toUpperCase().startsWith('SELECT') || 
                                sqliteSql.toUpperCase().includes('RETURNING');
                                
      if (isReadOrReturning) {
        const rows = stmt.all(...params);
        return { rows };
      } else {
        const result = stmt.run(...params);
        return { 
          rows: [], 
          rowCount: result.changes,
          insertId: result.lastInsertRowid 
        };
      }
    } catch (err) {
      console.error('SQLite query error:', err, 'SQL:', sqliteSql, 'Params:', params);
      throw err;
    }
  }
}

// Get the current database type
export function getDbType() {
  return dbType;
}

// Initialize tables
export async function initDb() {
  console.log(`Initializing database tables using ${dbType.toUpperCase()}...`);
  
  if (dbType === 'postgres') {
    // Postgres table creation schema
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('employer', 'candidate')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        resume_url VARCHAR(255),
        bio TEXT,
        skills TEXT,
        experience TEXT,
        education TEXT,
        company_name VARCHAR(255),
        company_website VARCHAR(255),
        company_logo VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS jobs (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        type VARCHAR(100) NOT NULL,
        salary VARCHAR(100),
        experience_level VARCHAR(100),
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'Applied' CHECK (status IN ('Applied', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
  } else {
    // SQLite table creation schema
    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('employer', 'candidate')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        resume_url TEXT,
        bio TEXT,
        skills TEXT,
        experience TEXT,
        education TEXT,
        company_name TEXT,
        company_website TEXT,
        company_logo TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        company TEXT NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        salary TEXT,
        experience_level TEXT,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    sqliteDb.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
        candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url TEXT NOT NULL,
        status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Reviewed', 'Interviewing', 'Accepted', 'Rejected')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }
  
  console.log('Database tables successfully initialized!');
}
