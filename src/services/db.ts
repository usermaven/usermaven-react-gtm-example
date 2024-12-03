interface User {
  id?: number;
  email: string;
  name: string;
  password: string;
  created_at: string;
}

class DBService {
  private dbName = 'ecommerceDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('users')) {
          const store = db.createObjectStore('users', { keyPath: 'id', autoIncrement: true });
          store.createIndex('email', 'email', { unique: true });
        }
      };
    });
  }

  async createUser(user: Omit<User, 'id' | 'created_at'>): Promise<User> {
    if (!this.db) await this.init();
    
    const userWithTimestamp = {
      ...user,
      created_at: new Date().toISOString()
    };
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('users', 'readwrite');
      const store = transaction.objectStore('users');
      const request = store.add(userWithTimestamp);

      request.onsuccess = () => {
        const userId = request.result as number;
        resolve({ ...userWithTimestamp, id: userId });
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction('users', 'readonly');
      const store = transaction.objectStore('users');
      const emailIndex = store.index('email');
      const request = emailIndex.get(email);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async login(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (user && user.password === password) {
      return user;
    }
    return null;
  }
}

export const dbService = new DBService();
export type { User };
