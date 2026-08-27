import sql from 'mssql';
import { getRequestContext } from '@cloudflare/next-on-pages';

export type AppDatabase = 'RF_World' | 'RF_User' | 'BILLING' | 'TS_DB' | 'TS_ITEMS';

declare global {
  var _mssqlPool: sql.ConnectionPool | undefined;
}

// Helper to resolve env vars dynamically at runtime
function getEnv(key: string): string | undefined {
  // 1. Try standard process.env
  if (process.env[key]) return process.env[key];

  // 2. Try Cloudflare Pages runtime bindings context
  try {
    const cfEnv = getRequestContext()?.env as Record<string, string>;
    return cfEnv?.[key];
  } catch {
    return undefined;
  }
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
    // Read fresh config inside the function call
    global._mssqlPool = await new sql.ConnectionPool(getConfig()).connect();
  }
  return global._mssqlPool;
}

export async function queryDb(dbName: AppDatabase, queryText: string) {
  const pool = await getDbPool();
  return pool.request().query(`USE [${dbName}]; ${queryText}`);
}