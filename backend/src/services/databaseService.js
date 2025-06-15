import pg from 'pg';
import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger.js';

const { Pool } = pg;

export class DatabaseService {
  constructor() {
    this.connections = new Map();
  }

  async executeQuery(sql, databaseConfig) {
    try {
      const { type, ...config } = databaseConfig;
      
      switch (type.toLowerCase()) {
        case 'postgresql':
        case 'postgres':
          return await this.executePostgreSQLQuery(sql, config);
        case 'sqlite':
          return await this.executeSQLiteQuery(sql, config);
        case 'mock':
          return await this.executeMockQuery(sql);
        default:
          throw new Error(`Unsupported database type: ${type}`);
      }
    } catch (error) {
      logger.error('Database query execution error:', error);
      throw error;
    }
  }

  async executePostgreSQLQuery(sql, config) {
    const pool = await this.getPostgreSQLConnection(config);
    
    try {
      const result = await pool.query(sql);
      
      return {
        rows: result.rows,
        columns: result.fields?.map(field => field.name) || [],
        rowCount: result.rowCount
      };
    } catch (error) {
      logger.error('PostgreSQL query error:', error);
      throw error;
    }
  }

  async executeSQLiteQuery(sql, config) {
    const db = await this.getSQLiteConnection(config);
    
    return new Promise((resolve, reject) => {
      db.all(sql, (err, rows) => {
        if (err) {
          logger.error('SQLite query error:', err);
          reject(err);
          return;
        }
        
        // Get column names from first row
        const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
        
        resolve({
          rows: rows,
          columns: columns,
          rowCount: rows.length
        });
      });
    });
  }

  async executeMockQuery(sql) {
    // Generate mock data based on SQL query
    logger.info('Executing mock query:', sql);
    
    // Simple mock data generation
    const mockData = this.generateMockData(sql);
    
    return {
      rows: mockData,
      columns: mockData.length > 0 ? Object.keys(mockData[0]) : [],
      rowCount: mockData.length
    };
  }

  async getPostgreSQLConnection(config) {
    const connectionKey = `postgresql_${config.host}_${config.database}`;
    
    if (!this.connections.has(connectionKey)) {
      const pool = new Pool({
        host: config.host,
        port: config.port || 5432,
        database: config.database,
        user: config.user,
        password: config.password,
        ssl: config.ssl || false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });
      
      this.connections.set(connectionKey, pool);
    }
    
    return this.connections.get(connectionKey);
  }

  async getSQLiteConnection(config) {
    const connectionKey = `sqlite_${config.file}`;
    
    if (!this.connections.has(connectionKey)) {
      const db = new sqlite3.Database(config.file, (err) => {
        if (err) {
          logger.error('SQLite connection error:', err);
          throw err;
        }
      });
      
      this.connections.set(connectionKey, db);
    }
    
    return this.connections.get(connectionKey);
  }

  async testConnection() {
    // Test with mock data for now
    try {
      await this.executeMockQuery('SELECT 1 as test');
      return true;
    } catch (error) {
      logger.error('Connection test failed:', error);
      return false;
    }
  }

  generateMockData(sql) {
    // Extract table names and columns from SQL for better mock data
    const tableMatch = sql.match(/FROM\s+(\w+)/i);
    const tableName = tableMatch ? tableMatch[1].toLowerCase() : 'unknown';
    
    // Generate appropriate mock data based on table name
    const mockData = [];
    const numRows = Math.floor(Math.random() * 50) + 5; // 5-55 rows
    
    for (let i = 0; i < numRows; i++) {
      const row = {};
      
      if (tableName.includes('person')) {
        row.person_id = i + 1;
        row.gender_concept_id = Math.random() > 0.5 ? 8507 : 8532; // Male/Female
        row.birth_datetime = new Date(1950 + Math.floor(Math.random() * 70), 
                                    Math.floor(Math.random() * 12), 
                                    Math.floor(Math.random() * 28)).toISOString();
        row.race_concept_id = [8527, 8515, 8516, 8522][Math.floor(Math.random() * 4)];
      } else if (tableName.includes('condition')) {
        row.condition_occurrence_id = i + 1;
        row.person_id = Math.floor(Math.random() * 1000) + 1;
        row.condition_concept_id = [316139, 316139, 316139, 316139][Math.floor(Math.random() * 4)];
        row.condition_start_datetime = new Date(2020 + Math.floor(Math.random() * 4), 
                                              Math.floor(Math.random() * 12), 
                                              Math.floor(Math.random() * 28)).toISOString();
      } else if (tableName.includes('drug')) {
        row.drug_exposure_id = i + 1;
        row.person_id = Math.floor(Math.random() * 1000) + 1;
        row.drug_concept_id = [19019071, 19019071, 19019071, 19019071][Math.floor(Math.random() * 4)];
        row.drug_exposure_start_datetime = new Date(2020 + Math.floor(Math.random() * 4), 
                                                  Math.floor(Math.random() * 12), 
                                                  Math.floor(Math.random() * 28)).toISOString();
      } else {
        // Generic mock data
        row.id = i + 1;
        row.value = Math.floor(Math.random() * 1000);
        row.name = `Item ${i + 1}`;
        row.created_at = new Date().toISOString();
      }
      
      mockData.push(row);
    }
    
    return mockData;
  }

  async closeConnections() {
    for (const [key, connection] of this.connections) {
      try {
        if (connection.end) {
          await connection.end();
        } else if (connection.close) {
          connection.close();
        }
      } catch (error) {
        logger.error(`Error closing connection ${key}:`, error);
      }
    }
    this.connections.clear();
  }
} 