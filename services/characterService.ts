import sql from 'mssql';
import { getDbPool } from '@/lib/db';
import { decodeKValue } from '@/lib/rfOnlineHelpers';

/**
 * MODULE 1: Fetches base character profile merged with stats & general data
 */
export async function getCharacterInfo(name: string) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input('name', sql.VarChar, name)
    .query(`
      SELECT 
        B.Serial,
        B.AccountSerial,
        B.Name,
        B.Race,
        B.Class,
        B.Lv AS Level,
        B.Gold,
        B.Dalant,
        B.LastConnTime,
        B.EK0, B.EK1, B.EK2, B.EK3, B.EK4, B.EK5, B.EK6, B.EK7,
        B.EU0, B.EU1, B.EU2, B.EU3, B.EU4, B.EU5, B.EU6, B.EU7,
        G.HP,
        G.FP,
        G.SP,
        G.PvpPoint AS CertainPoint,
        G.PvpCashBag AS TemporaryPoint,
        G.GuildSerial,
        G.PvP_0 AS KillCount,
        G.Die_0 AS DeathCount,
        GU.id AS GuildName
      FROM [RF_World].[dbo].[tbl_base] B
      LEFT JOIN [RF_World].[dbo].[tbl_general] G ON B.Serial = G.Serial
      LEFT JOIN [RF_World].[dbo].[tbl_guild] GU ON G.GuildSerial = GU.Serial
      WHERE B.Name = @name AND B.DCK = 0
    `);

  return result.recordset[0] || null;
}

/**
 * MODULE 2: Parses equipped items with upgrade levels
 */
export async function getEquipmentModule(baseData: any) {
  const slots = [
    { key: 'helmet', k: baseData?.EK0, u: baseData?.EU0 },
    { key: 'upper', k: baseData?.EK1, u: baseData?.EU1 },
    { key: 'lower', k: baseData?.EK2, u: baseData?.EU2 },
    { key: 'gauntlet', k: baseData?.EK3, u: baseData?.EU3 },
    { key: 'shoe', k: baseData?.EK4, u: baseData?.EU4 },
    { key: 'shield', k: baseData?.EK5, u: baseData?.EU5 },
    { key: 'weapon', k: baseData?.EK6, u: baseData?.EU6 },
    { key: 'cloak', k: baseData?.EK7, u: baseData?.EU7 },
  ];

  const parsedEquipment: Record<string, any> = {};

  for (const slot of slots) {
    if (slot.k !== undefined && slot.k !== null && slot.k !== -1) {
      const { itemId, tableCode, tableName } = decodeKValue(slot.k);
      parsedEquipment[slot.key] = {
        itemId,
        tableCode,
        tableName,
        upgradeLevel: slot.u ?? 0,
      };
    } else {
      parsedEquipment[slot.key] = null;
    }
  }

  return parsedEquipment;
}

/**
 * MODULE 3: Reads and decodes player inventory from tbl_inven
 */
export async function getInventoryModule(characterSerial: number) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input('serial', sql.Int, characterSerial)
    .query(`SELECT * FROM [RF_World].[dbo].[tbl_inven] WHERE Serial = @serial`);

  const rawInven = result.recordset[0];
  if (!rawInven) return [];

  const items: Array<{ slot: number; itemId: number; tableCode: number; tableName: string; qty: number }> = [];

  for (let i = 0; i < 100; i++) {
    const kVal = rawInven[`K${i}`];
    if (kVal !== undefined && kVal !== null && kVal !== -1) {
      const { itemId, tableCode, tableName } = decodeKValue(kVal);

      items.push({
        slot: i,
        itemId,
        tableCode,
        tableName,
        qty: rawInven[`D${i}`] ?? 1,
      });
    }
  }

  return items;
}

/**
 * MODULE 4: Retrieves player account bank trunk
 */
export async function getBankModule(accountSerial: number) {
  const pool = await getDbPool();
  const result = await pool
    .request()
    .input('accSerial', sql.Int, accountSerial)
    .query(`SELECT * FROM [RF_World].[dbo].[tbl_AccountTrunk] WHERE AccountSerial = @accSerial`);

  const rawBank = result.recordset[0];
  if (!rawBank) return [];

  const items: Array<{ slot: number; itemId: number; tableCode: number; tableName: string; qty: number }> = [];

  for (let i = 0; i < 140; i++) {
    const kVal = rawBank[`K${i}`];
    if (kVal !== undefined && kVal !== null && kVal !== -1) {
      const { itemId, tableCode, tableName } = decodeKValue(kVal);

      items.push({
        slot: i,
        itemId,
        tableCode,
        tableName,
        qty: rawBank[`D${i}`] ?? 1,
      });
    }
  }

  return items;
}