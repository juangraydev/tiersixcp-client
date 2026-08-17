import sql from 'mssql';

// Strongly typed list of your application's databases
export type AppDatabase = 'RF_World' | 'RF_User' | 'BILLING' | 'TS_DB' | 'TS_ITEMS';

const config: sql.config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER || 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433', 10),
  connectionTimeout: 15000,
  requestTimeout: 15000,
  options: {
    encrypt: process.env.MSSQL_ENCRYPT === 'true',
    // In production, set trustServerCertificate to false and install proper SSL certificates
    trustServerCertificate: process.env.NODE_ENV !== 'production',
  },
  pool: {
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
  },
};

declare global {
  var _mssqlPool: sql.ConnectionPool | undefined;
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mssqlPool) {
      global._mssqlPool = await new sql.ConnectionPool(config).connect();
    }
    return global._mssqlPool;
  }

  if (!global._mssqlPool) {
    global._mssqlPool = await new sql.ConnectionPool(config).connect();
  }

  return global._mssqlPool;
}

/**
 * Execute a query scoped to a specific database
 */
export async function queryDb(dbName: AppDatabase, queryText: string) {
  const pool = await getDbPool();
  return pool.request().query(`USE [${dbName}]; ${queryText}`);
}