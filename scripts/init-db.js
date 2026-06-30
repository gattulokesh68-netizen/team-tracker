import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '../data/team-tracker.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
    process.exit(1);
  }
  console.log('Connected to SQLite database at', dbPath);
});

db.serialize(() => {
  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      avatar TEXT,
      isAvailable BOOLEAN DEFAULT 1,
      lastUpdated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creating users table:', err);
    } else {
      console.log('✓ Users table created');
    }
  });

  // Create availability_history table for tracking changes
  db.run(`
    CREATE TABLE IF NOT EXISTS availability_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER NOT NULL,
      isAvailable BOOLEAN NOT NULL,
      changedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  `, (err) => {
    if (err) {
      console.error('Error creating availability_history table:', err);
    } else {
      console.log('✓ Availability history table created');
    }
  });

  // Seed sample data
  const sampleUsers = [
    { name: 'Alice Johnson', email: 'alice@example.com', avatar: '👩‍💼' },
    { name: 'Bob Smith', email: 'bob@example.com', avatar: '👨‍💼' },
    { name: 'Carol Williams', email: 'carol@example.com', avatar: '👩‍💻' },
    { name: 'David Brown', email: 'david@example.com', avatar: '👨‍💻' },
    { name: 'Eve Davis', email: 'eve@example.com', avatar: '👩‍🔬' }
  ];

  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (name, email, avatar, isAvailable)
    VALUES (?, ?, ?, ?)
  `);

  sampleUsers.forEach((user) => {
    const isAvailable = Math.random() > 0.3 ? 1 : 0; // 70% available
    insertUser.run(user.name, user.email, user.avatar, isAvailable, (err) => {
      if (err) {
        console.error('Error inserting user:', err);
      }
    });
  });

  insertUser.finalize(() => {
    console.log('✓ Sample data inserted');
    console.log('Database initialization complete!');
    db.close();
  });
});

db.on('error', (err) => {
  console.error('Database error:', err);
});
