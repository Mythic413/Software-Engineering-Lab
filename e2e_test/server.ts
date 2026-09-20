/**
 * DOCROUTE AI - BACKEND SERVER (Node.js + MySQL)
 */
import express, { Request, Response, NextFunction } from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { spawn } from 'child_process';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'ImageRoute-local-dev-secret-change-me';
if (!process.env.JWT_SECRET) console.warn('⚠️ JWT_SECRET is not set; using a development-only secret. Set JWT_SECRET in .env.local for real deployments.');

// MySQL Configuration
const MYSQL_HOST = process.env.MYSQL_HOST || 'localhost';
const MYSQL_USER = process.env.MYSQL_USER || 'root';
const MYSQL_PASSWORD = process.env.MYSQL_PASSWORD || '';

const MYSQL_DATABASE = process.env.MYSQL_DATABASE || 'docroute_ai';

// Google OAuth Config
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback';

const oauth2Client = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

app.use(cors());
app.use(bodyParser.json({ limit: '100mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});

let db: mysql.Pool | null = null;
let sqliteDb: any = null;

// Helper to wrap database operations transparently
const dbQuery = {
  run: async (sql: string, params: any[] = []) => {
    if (db) {
      const [result] = await db.execute(sql, params);
      const res = result as any;
      return { lastID: res.insertId, changes: res.affectedRows };
    } else if (sqliteDb) {
      return new Promise<{ lastID: any; changes: number }>((resolve, reject) => {
        sqliteDb.run(sql, params, function(this: any, err: Error | null) {
          if (err) reject(err);
          else resolve({ lastID: this.lastID, changes: this.changes });
        });
      });
    }
    throw new Error('Database not initialized');
  },
  get: async (sql: string, params: any[] = []) => {
    if (db) {
      const [rows] = await db.execute(sql, params);
      const res = rows as any[];
      return res.length > 0 ? res[0] : null;
    } else if (sqliteDb) {
      return new Promise<any>((resolve, reject) => {
        sqliteDb.get(sql, params, (err: Error | null, row: any) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
    }
    throw new Error('Database not initialized');
  },
  all: async (sql: string, params: any[] = []) => {
    if (db) {
      const [rows] = await db.execute(sql, params);
      return rows as any[];
    } else if (sqliteDb) {
      return new Promise<any[]>((resolve, reject) => {
        sqliteDb.all(sql, params, (err: Error | null, rows: any[]) => {
          if (err) reject(err);
          else resolve(rows);
        });
      });
    }
    throw new Error('Database not initialized');
  }
};

async function initDB() {
  console.log('--- Database Initialization Starting ---');
  
  // Create tables logic
  const createTables = async () => {
    const userTable = `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(50) DEFAULT 'Operator',
      google_refresh_token TEXT,
      google_email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

    const docTable = `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      timestamp BIGINT NOT NULL,
      category VARCHAR(100),
      department VARCHAR(100),
      confidence DOUBLE,
      status VARCHAR(50),
      destination VARCHAR(255),
      summary TEXT,
      ocr_text LONGTEXT,
      engine_status VARCHAR(50),
      classifier_action VARCHAR(255),
      extracted_fields_json LONGTEXT,
      thumbnail_base64 LONGTEXT,
      file_size VARCHAR(50),
      user_id VARCHAR(255),
      origin VARCHAR(50) DEFAULT 'Upload'
    )`;

    const logTable = `CREATE TABLE IF NOT EXISTS system_audit_logs (
      log_id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      event_name VARCHAR(255) NOT NULL,
      log_level VARCHAR(50) NOT NULL,
      payload_json LONGTEXT
    )`;

    await dbQuery.run(userTable);
    await dbQuery.run(docTable);
    await dbQuery.run(logTable);

    // Run safe migrations for existing tables
    try {
      await dbQuery.run('ALTER TABLE documents ADD COLUMN department VARCHAR(100)');
    } catch {}
    try {
      await dbQuery.run('ALTER TABLE documents ADD COLUMN file_size VARCHAR(50)');
    } catch {}
    try {
      await dbQuery.run('ALTER TABLE users ADD COLUMN name VARCHAR(255)');
    } catch {}
    console.log('✅ Database tables verified.');
  };

  try {
    console.log(`🔌 Connecting to MySQL (${MYSQL_USER}@${MYSQL_HOST})...`);
    const connection = await mysql.createConnection({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      connectTimeout: 2000 
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${MYSQL_DATABASE}\``);
    await connection.end();

    db = mysql.createPool({
      host: MYSQL_HOST,
      user: MYSQL_USER,
      password: MYSQL_PASSWORD,
      database: MYSQL_DATABASE,
      connectionLimit: 5
    });

    await createTables();
    console.log('✅ MySQL fully initialized.');
  } catch (err: any) {
    console.warn(`⚠️ MySQL Connection failed: ${err.message}. Switching to SQLite fallback.`);
    try {
      const sqlite3 = (await import('sqlite3')).default.verbose();
      sqliteDb = new sqlite3.Database('./docroute.sqlite');
      await createTables();
      console.log('✅ SQLite fallback fully initialized.');
    } catch (sErr: any) {
      console.error('❌ CRITICAL: Both MySQL and SQLite failed!', sErr.message);
    }
  }
}


// --- AUTH MIDDLEWARE ---
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).send({ error: 'Access denied. A valid Bearer token is required.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).send({ error: 'Invalid or expired token.' });
    }
    (req as any).user = user;
    next();
  });
};

// --- AUTH API ---
app.post('/api/auth/sso', async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline. Verify database connection.' });
  const { email = 'piyush.bale23b@iiitg.ac.in', name = 'Piyush Bale' } = req.body;
  
  try {
    let row = await dbQuery.get('SELECT id, email, role, name FROM users WHERE LOWER(email) = ?', [email.toLowerCase().trim()]);
    if (!row) {
      const id = uuidv4();
      const defaultPassword = await bcrypt.hash('Auth0_Verified_SSO', 10);
      await dbQuery.run('INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)', [
        id, 
        email.toLowerCase().trim(), 
        defaultPassword, 
        'Administrator', 
        name
      ]);
      row = { id, email: email.toLowerCase().trim(), role: 'Administrator', name };
    }
    
    const token = jwt.sign({ id: row.id, email: row.email, role: row.role }, JWT_SECRET, { expiresIn: '7d' });
    res.send({ id: row.id, email: row.email, role: row.role, name: row.name || name, token });
  } catch (e: any) {
    console.error('SSO Login Error:', e);
    res.status(500).send({ error: 'SSO Authentication error: ' + e.message });
  }
});

app.post('/api/auth/signup', async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline. Verify database connection settings.' });
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).send({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userName = name || normalizedEmail.split('@')[0];

  try {
    const existing = await dbQuery.get('SELECT id FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).send({ error: 'An account with this email already exists. Please sign in instead.' });
    }

    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await dbQuery.run('INSERT INTO users (id, email, password, role, name) VALUES (?, ?, ?, ?, ?)', [
      id, 
      normalizedEmail, 
      hashedPassword, 
      'Operator', 
      userName
    ]);
    
    const token = jwt.sign({ id, email: normalizedEmail, role: 'Operator' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).send({ id, email: normalizedEmail, role: 'Operator', name: userName, token });
  } catch (e: any) {
    const errorMsg = e.message.toLowerCase();
    console.error('Signup Error:', e);
    res.status(400).send({ 
      error: (errorMsg.includes('unique') || errorMsg.includes('duplicate')) ? 'Email already registered.' : 'Signup failed: ' + e.message 
    });
  }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline. Verify database connection settings.' });
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).send({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const row = await dbQuery.get('SELECT id, email, role, password, name FROM users WHERE LOWER(email) = ?', [normalizedEmail]);
    if (!row) return res.status(401).send({ error: 'Account not found with this email.' });
    
    let validPassword = false;
    try {
      validPassword = await bcrypt.compare(password, row.password);
    } catch (e) {
      validPassword = (password === row.password);
    }

    if (!validPassword && password === row.password) {
      validPassword = true;
      const newHash = await bcrypt.hash(password, 10);
      await dbQuery.run('UPDATE users SET password = ? WHERE id = ?', [newHash, row.id]);
    }
    
    if (!validPassword) return res.status(401).send({ error: 'Incorrect password.' });
    
    const token = jwt.sign({ id: row.id, email: row.email, role: row.role }, JWT_SECRET, { expiresIn: '24h' });
    res.send({ id: row.id, email: row.email, role: row.role, name: row.name || row.email.split('@')[0], token });
  } catch (e: any) {
    console.error('Login Error:', e);
    res.status(500).send({ error: 'Auth error: ' + e.message });
  }
});

// --- GOOGLE OAUTH API ---
app.get('/api/auth/google/url', authenticateToken, (req: Request, res: Response) => {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return res.status(400).json({ 
      error: 'Google OAuth is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in the app settings.' 
    });
  }
  const state = (req as any).user.id;
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.email'
    ],
    state,
    prompt: 'consent'
  });
  res.json({ url });
});

app.get('/auth/callback', async (req: Request, res: Response) => {
  const { code, state } = req.query;
  if (!code || !state) return res.status(400).send('Missing code or state');

  try {
    const { tokens } = await oauth2Client.getToken(code as string);
    oauth2Client.setCredentials(tokens);

    // Get user email from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const googleEmail = userInfo.data.email;

    if (tokens.refresh_token) {
      await dbQuery.run(
        'UPDATE users SET google_refresh_token = ?, google_email = ? WHERE id = ?',
        [tokens.refresh_token, googleEmail, state]
      );
    }

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. This window should close automatically.</p>
        </body>
      </html>
    `);
  } catch (e) {
    console.error('OAuth callback error:', e);
    res.status(500).send('Authentication failed');
  }
});

// --- TRAINING API ---
app.post('/api/train', authenticateToken, async (req: Request, res: Response) => {
  if (!db) return res.status(503).json({ error: 'Database Offline' });
  
  try {
    // Ensure ocr_text column exists (for older databases)
    try {
      await dbQuery.run('ALTER TABLE documents ADD COLUMN ocr_text TEXT');
    } catch (e) {
      // Column probably already exists
    }

    // Fetch all documents with OCR text and category
    const documents = await dbQuery.all('SELECT ocr_text as ocrText, category FROM documents WHERE ocr_text IS NOT NULL AND category IS NOT NULL');
    
    if (documents.length < 5) {
      return res.status(400).json({ error: 'Not enough data to retrain. Need at least 5 documents.' });
    }

    const trainingData = documents.map((doc: any) => ({
      text: doc.ocrText,
      label: doc.category
    }));

    const pythonProcess = spawn(process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3'), ['train_model.py']);
    
    let resultData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('Training Error:', errorData);
        return res.status(500).json({ error: 'Training failed', details: errorData });
      }
      try {
        const result = JSON.parse(resultData);
        res.json(result);
      } catch (e) {
        res.status(500).json({ error: 'Failed to parse training result', raw: resultData });
      }
    });

    // Send training data to stdin
    pythonProcess.stdin.write(JSON.stringify(trainingData));
    pythonProcess.stdin.end();

  } catch (error: any) {
    console.error('Training Route Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- GMAIL API ---
app.get('/api/gmail/messages', authenticateToken, async (req: Request, res: Response) => {
  if (!db) return res.status(503).send({ error: 'Database Offline' });
  const userId = (req as any).user.id;

  try {
    const user = await dbQuery.get('SELECT google_refresh_token FROM users WHERE id = ?', [userId]);
    if (!user || !user.google_refresh_token) {
      return res.status(401).json({ error: 'Google account not connected' });
    }

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    client.setCredentials({ refresh_token: user.google_refresh_token });

    const gmail = google.gmail({ version: 'v1', auth: client });
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 10,
      q: 'has:attachment' // Only fetch emails with attachments
    });

    const messages = response.data.messages || [];
    const detailedMessages = await Promise.all(messages.map(async (m) => {
      const msg = await gmail.users.messages.get({ userId: 'me', id: m.id! });
      const headers = msg.data.payload?.headers;
      const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
      const date = headers?.find(h => h.name === 'Date')?.value || '';
      
      // Find attachments
      const parts = msg.data.payload?.parts || [];
      const attachmentPart = parts.find(p => p.filename && p.body?.attachmentId);
      
      return {
        id: m.id,
        from,
        subject,
        receivedAt: date,
        body: msg.data.snippet,
        attachmentName: attachmentPart?.filename || null,
        attachmentId: attachmentPart?.body?.attachmentId,
        isProcessed: false
      };
    }));

    res.json(detailedMessages);
  } catch (e) {
    console.error('Gmail fetch error:', e);
    res.status(500).json({ error: 'Failed to fetch Gmail messages' });
  }
});

app.get('/api/gmail/attachment/:messageId/:attachmentId', authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const { messageId, attachmentId } = req.params;

  try {
    const user = await dbQuery.get('SELECT google_refresh_token FROM users WHERE id = ?', [userId]);
    if (!user || !user.google_refresh_token) return res.status(401).send('Not connected');

    const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    client.setCredentials({ refresh_token: user.google_refresh_token });

    const gmail = google.gmail({ version: 'v1', auth: client });
    const response: any = await (gmail.users.messages.attachments.get as any)({
      userId: 'me',
      messageId,
      id: attachmentId
    });

    const data = response.data.data;
    if (!data) return res.status(404).send('Attachment not found');

    // Gmail base64 is URL-safe
    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    res.json({ data: base64 });
  } catch (e) {
    console.error('Attachment fetch error:', e);
    res.status(500).send('Failed to fetch attachment');
  }
});
app.post('/api/documents', authenticateToken, async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline' });
  try {
    const d = req.body;
    const authenticatedUserId = String((req as any).user.id);
    if (!d.id || !d.name) return res.status(400).send({ error: 'Document id and name are required.' });
    await dbQuery.run(
      'INSERT INTO documents (id, name, timestamp, category, department, confidence, status, destination, summary, ocr_text, engine_status, classifier_action, extracted_fields_json, thumbnail_base64, file_size, user_id, origin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        d.id, 
        d.name, 
        d.timestamp, 
        d.category, 
        d.department || 'General', 
        d.confidence, 
        d.status, 
        d.destination, 
        d.summary, 
        d.ocrText || '', 
        d.engineStatus || 'Processed', 
        d.classifierAction || 'Auto-Routed', 
        JSON.stringify(d.extractedFields || []), 
        d.thumbnail, 
        d.fileSize || '245 KB', 
        authenticatedUserId,
        d.origin || 'Upload'
      ]
    );
    res.status(201).send({ message: 'Saved' });
  } catch (e) {
    console.error("Save failed:", e);
    res.status(500).send({ error: 'Save failed' });
  }
});

app.get('/api/documents', authenticateToken, async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline' });
  try {
    // Never trust a client-supplied userId for data access. Always scope reads to
    // the authenticated JWT subject.
    const cleanUserId = String((req as any).user.id).trim();
    
    let rows = await dbQuery.all('SELECT * FROM documents WHERE user_id = ? ORDER BY timestamp DESC', [cleanUserId]);
    
    // Seed initial dataset matching ImageRoute design if empty for this user
    if (process.env.DEMO_DATA === 'true' && (!rows || rows.length === 0) && cleanUserId) {
      const now = Date.now();
      const demoData = [
        {
          id: `DOC-INV2048-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'invoice_2048.jpg',
          timestamp: now - 2 * 60 * 1000,
          category: 'Invoice',
          department: 'Finance',
          confidence: 0.96,
          status: 'Routed',
          destination: 'finance/invoices/2026',
          summary: 'Corporate vendor tax invoice #2048 for software licensing and cloud infrastructure.',
          file_size: '245 KB',
          thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Invoice Number', value: 'INV-2026-2048' },
            { key: 'Vendor', value: 'CloudSystems Enterprise Ltd' },
            { key: 'Total Amount', value: '$4,850.00' },
            { key: 'Due Date', value: 'October 15, 2026' }
          ])
        },
        {
          id: `DOC-RESUME92-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'employee_resume.png',
          timestamp: now - 8 * 60 * 1000,
          category: 'Resume',
          department: 'HR',
          confidence: 0.92,
          status: 'Routed',
          destination: 'hr/candidates/engineering',
          summary: 'Candidate curriculum vitae for Senior Full-Stack Engineer with 6+ years experience.',
          file_size: '380 KB',
          thumbnail: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Candidate Name', value: 'Alex Morgan' },
            { key: 'Applied Role', value: 'Senior Full-Stack Engineer' },
            { key: 'Experience', value: '6 Years' }
          ])
        },
        {
          id: `DOC-NDA94-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'nda_partner.jpg',
          timestamp: now - 25 * 60 * 1000,
          category: 'Legal Contract',
          department: 'Legal',
          confidence: 0.94,
          status: 'Routed',
          destination: 'legal/agreements/nda',
          summary: 'Mutual Non-Disclosure Agreement for vendor partnership and technology integration.',
          file_size: '1.2 MB',
          thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Agreement Type', value: 'Mutual Non-Disclosure Agreement' },
            { key: 'Parties', value: 'Acme Corp & Global Logistics LLC' },
            { key: 'Term', value: '3 Years' }
          ])
        },
        {
          id: `DOC-COMPLAINT89-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'customer_complaint.png',
          timestamp: now - 41 * 60 * 1000,
          category: 'Customer Support',
          department: 'Support',
          confidence: 0.89,
          status: 'Routed',
          destination: 'support/escalations',
          summary: 'Customer issue report regarding billing discrepancy on international shipment order #4912.',
          file_size: '512 KB',
          thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Ticket Number', value: 'SUP-4912' },
            { key: 'Customer', value: 'David Vance' },
            { key: 'Severity', value: 'High' }
          ])
        },
        {
          id: `DOC-ORDER91-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'warehouse_order.jpg',
          timestamp: now - 48 * 60 * 1000,
          category: 'Operations Order',
          department: 'Operations',
          confidence: 0.91,
          status: 'Routed',
          destination: 'ops/fulfillment/zone-b',
          summary: 'Warehouse pallet shipment manifest and order packing slip for regional fulfillment hub.',
          file_size: '640 KB',
          thumbnail: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Manifest ID', value: 'MAN-9982' },
            { key: 'Destination Hub', value: 'Zone-B Logistics Hub' },
            { key: 'Pallet Count', value: '14 Units' }
          ])
        },
        {
          id: `DOC-TEAM72-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'team_photo.jpg',
          timestamp: now - 2 * 3600 * 1000,
          category: 'Other',
          department: 'General',
          confidence: 0.72,
          status: 'Pending',
          destination: 'review-queue/general',
          summary: 'Annual team retreat group photo. Classification confidence below automated threshold.',
          file_size: '2.4 MB',
          thumbnail: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Detected Category', value: 'Corporate Event Photo' },
            { key: 'Review Note', value: 'Pending operator manual verification' }
          ])
        },
        {
          id: `DOC-BLURRY58-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'blurry_doc.png',
          timestamp: now - 2 * 3600 * 1000 - 15 * 60 * 1000,
          category: 'Other',
          department: 'General',
          confidence: 0.58,
          status: 'Pending',
          destination: 'review-queue/quarantine',
          summary: 'Low resolution document scan with illegible header. Requires human review.',
          file_size: '190 KB',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'OCR Quality', value: 'Low / Blurry' },
            { key: 'Issue', value: 'Header text unreadable' }
          ])
        },
        {
          id: `DOC-RANDOM50-${cleanUserId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8)}`,
          name: 'random_image.jpg',
          timestamp: now - 3 * 3600 * 1000,
          category: 'Other',
          department: 'General',
          confidence: 0.50,
          status: 'Failed',
          destination: 'failed/unrecognized',
          summary: 'Unrecognized image format or non-business graphic. Automated routing failed.',
          file_size: '850 KB',
          thumbnail: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
          extracted_fields_json: JSON.stringify([
            { key: 'Status Reason', value: 'No recognizable department pattern identified' }
          ])
        }
      ];

      for (const d of demoData) {
        try {
          await dbQuery.run(
            'INSERT INTO documents (id, name, timestamp, category, department, confidence, status, destination, summary, ocr_text, engine_status, classifier_action, extracted_fields_json, thumbnail_base64, file_size, user_id, origin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              d.id,
              d.name,
              d.timestamp,
              d.category,
              d.department,
              d.confidence,
              d.status,
              d.destination,
              d.summary,
              'Automated OCR content extracted for ' + d.name,
              'Processed',
              'Auto-Routed',
              d.extracted_fields_json,
              d.thumbnail,
              d.file_size,
              cleanUserId,
              'Upload'
            ]
          );
        } catch (insertErr) {
          // Ignore duplicate constraint or continue
        }
      }
      rows = await dbQuery.all('SELECT * FROM documents WHERE user_id = ? ORDER BY timestamp DESC', [cleanUserId]);
    }

    // Do not fall back to another user's documents. An empty result is valid.

    const formatted = (rows || []).map((r: any) => {
      let parsedFields = [];
      try {
        parsedFields = JSON.parse(r.extracted_fields_json || '[]');
      } catch {
        parsedFields = [];
      }

      return {
        ...r,
        department: r.department || (
          r.category === 'Invoice' || r.category === 'Receipt' ? 'Finance' :
          r.category === 'Resume' ? 'HR' :
          r.category === 'Legal Contract' ? 'Legal' :
          r.category === 'Customer Support' ? 'Support' :
          r.category === 'Operations Order' ? 'Operations' : 'General'
        ),
        fileSize: r.file_size || '245 KB',
        ocrText: r.ocr_text,
        engineStatus: r.engine_status,
        classifierAction: r.classifier_action,
        extractedFields: parsedFields,
        thumbnail: r.thumbnail_base64
      };
    });

    res.send(formatted);
  } catch (e) {
    console.error('Fetch error:', e);
    res.send([]);
  }
});

app.patch('/api/documents/:id', authenticateToken, async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'Database Offline' });
  const { id } = req.params;
  const updates = req.body;
  try {
    const fields: string[] = [];
    const values: any[] = [];
    const allowedKeys = new Set([
      'name', 'category', 'department', 'confidence', 'status', 'destination',
      'summary', 'fileSize', 'origin', 'flaggedForRetraining', 'extractedFields',
      'thumbnail', 'ocrText', 'engineStatus', 'classifierAction'
    ]);
    for (const [key, value] of Object.entries(updates)) {
      if (!allowedKeys.has(key)) continue;
      if (key === 'extractedFields') {
        fields.push('extracted_fields_json = ?');
        values.push(JSON.stringify(value));
      } else if (key === 'thumbnail') {
        fields.push('thumbnail_base64 = ?');
        values.push(value);
      } else if (key === 'ocrText') {
        fields.push('ocr_text = ?');
        values.push(value);
      } else if (key === 'engineStatus') {
        fields.push('engine_status = ?');
        values.push(value);
      } else if (key === 'classifierAction') {
        fields.push('classifier_action = ?');
        values.push(value);
      } else {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return res.status(400).send({ error: 'No supported updates provided' });
    // Only allow updates to a document owned by the authenticated user.
    values.push(id, String((req as any).user.id));
    const query = `UPDATE documents SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    const updateResult = await dbQuery.run(query, values);
    if (!updateResult.changes) return res.status(404).send({ error: 'Document not found' });
    res.send({ success: true });
  } catch (e) {
    res.status(500).send({ error: 'Update failed' });
  }
});

app.get('/api/logs', authenticateToken, async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.status(503).send({ error: 'DB Offline' });
  try {
    const rows = await dbQuery.all('SELECT * FROM system_audit_logs ORDER BY timestamp DESC LIMIT 50');
    res.send(rows);
  } catch (e) { res.sendStatus(500); }
});

app.post('/api/logs', authenticateToken, async (req: Request, res: Response) => {
  if (!db && !sqliteDb) return res.sendStatus(503);
  try {
    const { log_id, event_name, log_level, payload_json } = req.body;
    const authenticatedUserId = String((req as any).user.id);
    await dbQuery.run('INSERT INTO system_audit_logs (log_id, user_id, event_name, log_level, payload_json) VALUES (?, ?, ?, ?, ?)', [log_id, authenticatedUserId, event_name, log_level, payload_json]);
    res.sendStatus(201);
  } catch (e) { res.sendStatus(500); }
});

// --- CUSTOM CLASSIFIER BRIDGE ---
app.post('/api/classify/custom', authenticateToken, async (req: Request, res: Response) => {
  const { base64, mimeType } = req.body;
  
  if (!base64 || !mimeType) {
    return res.status(400).json({ error: 'Missing base64 or mimeType' });
  }

  console.log(`[Python Bridge] Starting ImageRoute custom-model classification for ${mimeType}...`);

  // Keep the model entirely local: this endpoint never calls Gemini.
  const rawBase64 = String(base64).includes(',')
    ? String(base64).split(',', 2)[1]
    : String(base64);

  try {
    const pythonProcess = spawn(process.env.PYTHON_BIN || (process.platform === 'win32' ? 'python' : 'python3'), ['classifier_service.py'], { cwd: process.cwd() });
    
    let output = '';
    let errorOutput = '';

    pythonProcess.on('error', (err) => {
      console.error('[Python Bridge] Failed to start python process:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to start Python process. Is python3 installed?', details: err.message });
      }
    });

    pythonProcess.stdin.write(JSON.stringify({ base64: rawBase64, mimeType }));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (res.headersSent) return;

      if (code !== 0) {
        console.error(`[Python Bridge] Failed with code ${code}:`, errorOutput);
        return res.status(500).json({ 
          error: 'Custom model execution failed. This usually means Python dependencies (torch, easyocr, etc.) are not installed in the environment.',
          details: errorOutput
        });
      }

      try {
        const result = JSON.parse(output);
        res.json(result);
      } catch (e) {
        console.error('[Python Bridge] JSON Parse Error:', output);
        res.status(500).json({ error: 'Failed to parse custom model output', details: output });
      }
    });
  } catch (err: any) {
    console.error('[Python Bridge] Unexpected error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Unexpected error in Python bridge', details: err.message });
    }
  }
});

app.get('/api/health', (req: Request, res: Response) => {
  res.send({ 
    status: 'online', 
    db_connected: !!db || !!sqliteDb,
    db_type: db ? 'MySQL' : (sqliteDb ? 'SQLite (Fallback)' : 'None'),
    environment: process.env.NODE_ENV || 'development',
    mysql_host: MYSQL_HOST
  });
});

app.all(['/api', '/api/*'], (req: Request, res: Response) => {
  console.log(`[404] API route not found: ${req.method} ${req.url}`);
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// Global error handler for API routes
app.use('/api', (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

async function startServer() {
  console.log('🚀 Starting server initialization...');
  try {
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔧 Initializing Vite in development mode...');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      console.log('✅ Vite initialized successfully.');
      app.use(vite.middlewares);
      
      // Explicitly serve index.html for SPA in dev mode if vite.middlewares doesn't catch it
      app.get('*', async (req: Request, res: Response, next: NextFunction) => {
        if (req.url.startsWith('/api')) return next();
        
        const url = req.originalUrl;
        console.log(`📄 Serving frontend for: ${url}`);
        try {
          let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
          template = await vite.transformIndexHtml(url, template);
          res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
        } catch (e: any) {
          console.error(`❌ Error serving index.html: ${e.message}`);
          vite.ssrFixStacktrace(e);
          next(e);
        }
      });
    } else {
      console.log('📦 Running in production mode...');
      const distPath = path.join(process.cwd(), 'dist');
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }

    const PORT = 3000;
    await initDB();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 DocRoute Backend: http://0.0.0.0:${PORT}`);
    });
  } catch (err: any) {
    console.error('❌ CRITICAL SERVER STARTUP ERROR:', err.message);
  }
}

startServer();
