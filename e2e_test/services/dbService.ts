
import { MySQL_LogRecord, DocumentRecord, UserProfile } from '../types';

const API_BASE = '/api'; 

export class DBService {
  private static token: string | null = null;

  static setToken(token: string | null) {
    this.token = token;
  }

  static getHeaders() {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  static async checkHeartbeat(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); 
      const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const data = await res.json();
      return data.db_connected;
    } catch {
      return false;
    }
  }

  static async fetchLogs(): Promise<MySQL_LogRecord[]> {
    const res = await fetch(`${API_BASE}/logs`, {
      headers: this.getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  }

  static async saveLog(log: Omit<MySQL_LogRecord, 'timestamp'>): Promise<void> {
    await fetch(`${API_BASE}/logs`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(log)
    });
  }

  static async fetchDocuments(userId: string): Promise<DocumentRecord[]> {
    try {
      const res = await fetch(`${API_BASE}/documents?userId=${encodeURIComponent(userId || '')}`, {
        headers: this.getHeaders()
      });

      if (res.status === 401 || res.status === 403) {
        this.token = null;
        throw new Error('Session expired. Please sign in again.');
      }

      if (res.ok) {
        const docs = await res.json();
        if (Array.isArray(docs) && docs.length > 0) {
          // Cache in localStorage as safety backup
          try {
            localStorage.setItem(`cached_docs_${userId}`, JSON.stringify(docs));
          } catch {}
          return docs;
        }
      }
    } catch (err) {
      console.warn('Network issue fetching documents from API:', err);
    }

    // Try reading cached docs from localStorage
    try {
      const cached = localStorage.getItem(`cached_docs_${userId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}

    return [];
  }

  static async saveDocument(doc: DocumentRecord & { user_id?: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/documents`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(doc)
    });
    if (!res.ok) throw new Error('Failed to save document to MySQL');
  }

  static async updateDocument(id: string, updates: Partial<DocumentRecord>): Promise<void> {
    const res = await fetch(`${API_BASE}/documents/${id}`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update document in MySQL');
  }

  static async authenticate(email: string, password: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  }

  static async ssoLogin(email: string = 'piyush.bale23b@iiitg.ac.in', name: string = 'Piyush Bale'): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'SSO Authentication failed');
    }
    return res.json();
  }

  static async signup(email: string, password: string, name?: string): Promise<UserProfile> {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Account creation failed');
    }
    return res.json();
  }
}
