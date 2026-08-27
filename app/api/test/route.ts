import net from 'node:net';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  const host = process.env.MSSQL_SERVER;
  const port = Number(process.env.MSSQL_PORT || 1433);

  if (!host) {
    return NextResponse.json({
      success: false,
      error: 'MSSQL_SERVER is undefined',
    });
  }

  return new Promise((resolve) => {
    const socket = new net.Socket();

    const timeout = setTimeout(() => {
      socket.destroy();

      resolve(
        NextResponse.json({
          success: false,
          host,
          port,
          error: 'TCP connection timeout',
        })
      );
    }, 10000);

    socket.connect(port, host, () => {
      clearTimeout(timeout);
      socket.destroy();

      resolve(
        NextResponse.json({
          success: true,
          host,
          port,
          message: 'TCP connection to MSSQL succeeded',
        })
      );
    });

    socket.on('error', (error) => {
      clearTimeout(timeout);

      resolve(
        NextResponse.json({
          success: false,
          host,
          port,
          error: error.message,
          code: (error as NodeJS.ErrnoException).code,
        })
      );
    });
  });
}