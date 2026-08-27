import sql from 'mssql';

export type AppDatabase = 'RF_World' | 'RF_User' | 'BILLING' | 'TS_DB' | 'TS_ITEMS';

declare global {
  var _mssqlPool: sql.ConnectionPool | undefined;
}

// Dynamically resolves environment variables without needing @cloudflare/next-on-pages
function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];

  if (typeof globalThis !== 'undefined' && (globalThis as any).process?.env?.[key]) {
    return (globalThis as any).process.env[key];
  }

  return undefined;
}

function getConfig(): sql.config {
  return {
    user: getEnv('MSSQL_USER'),
    password: getEnv('MSSQL_PASSWORD'),
    server: getEnv('MSSQL_SERVER') || 'localhost',
    port: parseInt(getEnv('MSSQL_PORT') || '1433', 10),
    connectionTimeout: 15000,
    requestTimeout: 15000,
    options: {
      encrypt: getEnv('MSSQL_ENCRYPT') === 'true',
      trustServerCertificate: process.env.NODE_ENV !== 'production',
    },
    pool: {
      max: 10,
      min: 2,
      idleTimeoutMillis: 30000,
    },
  };
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (!global._mssqlPool) {
    global._mssqlPool = await new sql.ConnectionPool(getConfig()).connect();
  }
  return global._mssqlPool;
}

export async function queryDb(dbName: AppDatabase, queryText: string) {
  const pool = await getDbPool();
  return pool.request().query(`USE [${dbName}]; ${queryText}`);
}