import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'data/team-tracker.db');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Promisify database methods for easier async/await usage
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Routes

// Get all users with availability status
app.get('/api/users', async (req, res) => {
  try {
    const users = await dbAll(`
      SELECT id, name, email, avatar, isAvailable, lastUpdated, createdAt
      FROM users
      ORDER BY name ASC
    `);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await dbAll(`
      SELECT id, name, email, avatar, isAvailable, lastUpdated, createdAt
      FROM users
      WHERE id = ?
    `, [id]);
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Update user availability status
app.put('/api/users/:id/availability', async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (typeof isAvailable !== 'boolean') {
      return res.status(400).json({ error: 'isAvailable must be a boolean' });
    }

    // Update user availability
    await dbRun(`
      UPDATE users
      SET isAvailable = ?, lastUpdated = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [isAvailable ? 1 : 0, id]);

    // Record in history
    await dbRun(`
      INSERT INTO availability_history (userId, isAvailable)
      VALUES (?, ?)
    `, [id, isAvailable ? 1 : 0]);

    // Fetch updated user
    const user = await dbAll(`
      SELECT id, name, email, avatar, isAvailable, lastUpdated, createdAt
      FROM users
      WHERE id = ?
    `, [id]);

    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user[0]);
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ error: 'Failed to update availability' });
  }
});

// Get availability history for a user
app.get('/api/users/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await dbAll(`
      SELECT id, userId, isAvailable, changedAt
      FROM availability_history
      WHERE userId = ?
      ORDER BY changedAt DESC
      LIMIT 20
    `, [id]);
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Create new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const result = await dbRun(`
      INSERT INTO users (name, email, avatar, isAvailable)
      VALUES (?, ?, ?, 1)
    `, [name, email, avatar || '👤']);

    const user = await dbAll(`
      SELECT id, name, email, avatar, isAvailable, lastUpdated, createdAt
      FROM users
      WHERE id = ?
    `, [result.id]);

    res.status(201).json(user[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nClosing database...');
  db.close(() => {
    console.log('Database closed.');
    process.exit(0);
  });
});
