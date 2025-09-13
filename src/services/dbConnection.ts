import { Pool, PoolClient, QueryResult } from 'pg';

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;
  private config: DatabaseConfig;

  private constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'ayur_flow_sutra',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
    };
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    try {
      this.pool = new Pool({
        ...this.config,
        max: 20, // Maximum number of connections in the pool
        idleTimeoutMillis: 30000, // How long a client is allowed to remain idle
        connectionTimeoutMillis: 2000, // How long to wait for a connection
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();

      console.log('✅ Connected to PostgreSQL database successfully');
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL database:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('🔌 Disconnected from PostgreSQL database');
    }
  }

  public async query<T = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database connection not established. Call connect() first.');
    }

    try {
      const result = await this.pool.query<T>(text, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      console.error('Query:', text);
      console.error('Params:', params);
      throw error;
    }
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database connection not established. Call connect() first.');
    }
    return this.pool.connect();
  }

  public async transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
    const client = await this.getClient();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  public isConnected(): boolean {
    return this.pool !== null;
  }
}

export default DatabaseConnection;
