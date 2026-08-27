import { NextResponse } from 'next/server';
import sql from 'mssql';
import { SignJWT } from 'jose';
import { getDbPool } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_key_change_me'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { status: 400, message: 'Username and password are required', data: null },
        { status: 400 }
      );
    }

    const pool = await getDbPool();

    // Query credentials from tbl_rfaccount and session state from tbl_UserAccount
    const result = await pool
      .request()
      .input('username', sql.VarChar(13), username)
      .input('password', sql.VarChar(32), password)
      .query(`
        SELECT 
          CONVERT(varchar(13), acc.[id]) AS username,
          acc.[accounttype],
          acc.[email],
          usr.[lastlogintime],
          usr.[lastlogofftime],
          usr.[lastconnectip]
        FROM [RF_User].[dbo].[tbl_rfaccount] acc
        INNER JOIN [RF_User].[dbo].[tbl_UserAccount] usr 
          ON acc.[id] = usr.[id]
        WHERE acc.[id] = CONVERT(binary, @username)
          AND acc.[password] = CONVERT(binary, @password)
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { status: 401, message: 'Invalid username or password', data: null },
        { status: 401 }
      );
    }

    const user = result.recordset[0];

    // Check if fields are missing/null OR if user is offline
    const hasLogData =
      user.lastlogintime &&
      user.lastlogofftime &&
      user.lastconnectip &&
      user.lastconnectip.trim() !== '';

    const isGameLoggedIn =
      hasLogData &&
      new Date(user.lastlogintime) >= new Date(user.lastlogofftime);

    if (!isGameLoggedIn) {
      return NextResponse.json(
        {
          status: 403,
          message: 'You must be logged into the game client to access the panel',
          data: null,
        },
        { status: 403 }
      );
    }

    // 1. Create JWT Token (expires in 1 day)
    const token = await new SignJWT({
      username,
      email: user.email,
      accountType: user.accounttype,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('1d')
      .sign(JWT_SECRET);

    // 2. Prepare JSON response
    const response = NextResponse.json(
      {
        status: 200,
        message: 'Login successful',
        data: { username, email: user.email, accountType: user.accounttype },
      },
      { status: 200 }
    );

    // 3. Set Secure HTTP-Only Cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('Login Error:', err);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', data: null },
      { status: 500 }
    );
  }
}