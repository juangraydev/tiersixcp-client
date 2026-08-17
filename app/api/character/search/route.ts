import { NextResponse } from 'next/server';
import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import {
  CHARACTER_BASE_QUERY_SQL,
  formatCharacterProfileResponse,
} from '@/lib/queries/character';
import { INVENTORY_QUERY_SQL, BANK_QUERY_SQL } from '@/lib/queries/items';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const characterName = searchParams.get('name')?.trim();

    if (!characterName) {
      return NextResponse.json(
        { status: 400, message: 'Character name is required', data: null },
        { status: 400 }
      );
    }

    const pool = await getDbPool();

    // 1. Fetch Character Base Profile
    const charResult = await pool
      .request()
      .input('name', sql.VarChar, characterName)
      .query(CHARACTER_BASE_QUERY_SQL);

    const baseInfo = charResult.recordset[0];
    if (!baseInfo) {
      return NextResponse.json(
        { status: 404, message: 'Character not found', data: null },
        { status: 404 }
      );
    }

    // 2. Fetch Inventory Items
    const inventoryResult = await pool
      .request()
      .input('charSerial', sql.Int, baseInfo.Serial)
      .query(INVENTORY_QUERY_SQL);

    // 3. Fetch Trunk/Bank Items
    const bankResult = await pool
      .request()
      .input('accountSerial', sql.Int, baseInfo.AccountSerial)
      .query(BANK_QUERY_SQL);

    // 4. Format & Return Response
    const responseData = formatCharacterProfileResponse(
      baseInfo,
      inventoryResult.recordset,
      bankResult.recordset
    );

    return NextResponse.json(
      { status: 200, message: 'Character profile loaded', data: responseData },
      { status: 200 }
    );
  } catch (err) {
    console.error('Character Search API Error:', err);
    return NextResponse.json(
      { status: 500, message: 'Internal Server Error', data: null },
      { status: 500 }
    );
  }
}