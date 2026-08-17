import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'default_jwt_secret_key_change_me'
);

export async function GET() {
  try {
    // 1. Validate JWT session cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized access', data: null },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const username = payload.username as string;

    const pool = await getDbPool();

    // 2. Fetch Core Account Info & Credentials
    const accountResult = await pool
      .request()
      .input('user', sql.VarChar(13), username)
      .query(`
        SELECT 
          ua.Serial,
          RTRIM(CAST(ua.id AS VARCHAR(13))) AS username,
          ua.createtime,
          ua.lastlogintime,
          ua.lastconnectip,
          rf.[email],
          rf.[pin],
          rf.[accounttype]
        FROM [RF_User].[dbo].[tbl_UserAccount] ua
        LEFT JOIN [RF_User].[dbo].[tbl_rfaccount] rf ON ua.id = rf.id
        WHERE ua.id = CONVERT(BINARY(13), @user)
      `);

    if (accountResult.recordset.length === 0) {
      return NextResponse.json(
        { status: 404, message: 'Account not found', data: null },
        { status: 404 }
      );
    }

    const accountBase = accountResult.recordset[0];

    // 3. Fetch Billing Information
    const billingResult = await pool
      .request()
      .input('user', sql.VarChar(13), username)
      .query(`
        SELECT [Cash], [DTEndPrem], [Status]
        FROM [BILLING].[dbo].[tbl_UserStatus]
        WHERE [id] = CONVERT(BINARY(13), @user)
      `);

    const billingData = billingResult.recordset[0] || null;

    // Determine Premium Expiry Date
    const rawEndDate = billingData?.DTEndPrem ? new Date(billingData.DTEndPrem) : null;
    const isPremiumActive = rawEndDate ? rawEndDate.getTime() > Date.now() : false;

    const formattedData = {
      username: accountBase.username,
      role:
        accountBase.accounttype === 1
          ? 'admin'
          : accountBase.accounttype === 2
          ? 'super_admin'
          : 'normal',
      accountInfo: {
        username: accountBase.username,
        email: accountBase.email
          ? accountBase.email.replace(/(.{2})(.*)(?=@)/, '$1***')
          : 'N/A',
        pin: accountBase.pin ? `****${accountBase.pin.slice(-2)}` : 'N/A',
        createDate: accountBase.createtime
          ? new Date(accountBase.createtime).toLocaleString()
          : 'N/A',
        lastOnline: accountBase.lastlogintime
          ? new Date(accountBase.lastlogintime).toLocaleString()
          : 'N/A',
        lastOffline: accountBase.lastlogintime
          ? new Date(accountBase.lastlogintime).toLocaleString()
          : 'N/A',
        lastConnectIp: accountBase.lastconnectip || '-',
      },
      billingInfo: {
        cashPoints: billingData ? billingData.Cash : 0,
        premiumStatus: isPremiumActive ? 'ACTIVE' : 'EXPIRED',
        premiumEndDate: rawEndDate ? rawEndDate.toISOString() : null,
      },
    };

    return NextResponse.json(
      { status: 200, message: 'Data fetched successfully', data: formattedData },
      { status: 200 }
    );
  } catch (err) {
    console.error('Dashboard Data Fetch Error:', err);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', data: null },
      { status: 500 }
    );
  }
}