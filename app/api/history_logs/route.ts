import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const log = searchParams.get('log');

  if (!log) {
    return NextResponse.json(
      { message: 'Missing required parameter: log' },
      { status: 400 }
    );
  }

  try {
    const backendUrl = `http://localhost:5000/api/history_logs?log=${encodeURIComponent(log)}`;
    const response = await fetch(backendUrl, { cache: 'no-store' });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Backend server error' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Failed to connect to backend service', error: error.message },
      { status: 500 }
    );
  }
}