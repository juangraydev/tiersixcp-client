import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password, email, pin } = body;

    // 1. Capture Client IP
    const forwardedFor = request.headers.get('x-forwarded-for');
    const userIP = forwardedFor ? forwardedFor.split(',')[0].trim() : '127.0.0.1';

    // 2. Validate Required Fields
    if (!username || !password || !pin) {
      return NextResponse.json(
        { status: 400, message: 'Username, Password, and PIN are required', data: null },
        { status: 400 }
      );
    }

    const pool = await getDbPool();

    // 3. Check for Existing Account
    const checkUser = await pool
      .request()
      .input('username', sql.VarChar(13), username)
      .query(`
        SELECT [id] 
        FROM [RF_User].[dbo].[tbl_rfaccount] 
        WHERE [id] = CONVERT(binary, @username)
      `);

    if (checkUser.recordset.length > 0) {
      return NextResponse.json(
        { status: 409, message: 'Account already exists', data: null },
        { status: 409 }
      );
    }

    // 4. Begin SQL Transaction for Multi-Table Writes
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      // Step A: Insert into tbl_rfaccount
      const requestAccount = new sql.Request(transaction);
      await requestAccount
        .input('username', sql.VarChar(13), username)
        .input('password', sql.VarChar(32), password)
        .input('email', sql.VarChar(50), email || '')
        .input('pin', sql.VarChar(10), pin)
        .query(`
          INSERT INTO [RF_User].[dbo].[tbl_rfaccount] 
            ([id], [password], [accounttype], [birthdate], [Email], [pin]) 
          VALUES 
            (CONVERT(binary, @username), CONVERT(binary, @password), 0, GETDATE(), @email, @pin)
        `);

      // Step B: Insert into tbl_UserAccount (Audit / Account Log)
      const requestUserAccount = new sql.Request(transaction);
      await requestUserAccount
        .input('username', sql.VarChar(13), username)
        .input('ip', sql.VarChar(15), userIP)
        .query(`
          INSERT INTO [RF_User].[dbo].[tbl_UserAccount] 
            ([id], [createtime], [createip])
          VALUES 
            (CONVERT(binary, @username), GETDATE(), @ip)
        `);

      // Step C: Insert into BILLING (Premium & Cash Initialization)
      const requestBilling = new sql.Request(transaction);
      await requestBilling
        .input('username', sql.VarChar(13), username)
        .query(`
          INSERT INTO [BILLING].[dbo].[tbl_UserStatus] 
            ([Id], [Status], [DTStartPrem], [DTEndPrem], [Cash])
          VALUES 
            (CONVERT(binary, @username), '2', GETDATE(), DATEADD(day, 3, GETDATE()), 0)
        `);

      // Commit transaction if all 3 insertions succeed
      await transaction.commit();

      return NextResponse.json(
        {
          status: 200,
          message: 'Account registered successfully and billing initialized',
          data: { username },
        },
        { status: 200 }
      );
    } catch (txError) {
      // Rollback transaction on failure to keep DB state consistent
      await transaction.rollback();
      throw txError;
    }
  } catch (err) {
    console.error('Registration Error:', err);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', data: null },
      { status: 500 }
    );
  }
}