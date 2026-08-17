import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { status: 200, message: 'Logged out successfully', data: null },
    { status: 200 }
  );

  // Expire cookie immediately
  response.cookies.set('auth_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  });

  return response;
}