import sql from 'mssql';

export const CHARACTER_BASE_QUERY_SQL = `
  SELECT 
    B.Serial, B.AccountSerial, B.Name, B.Race, B.Class, B.Lv AS Level,
    B.Gold, B.Dalant, B.LastConnTime,
    G.HP, G.FP, G.SP, G.PvpPoint AS CertainPoint, G.PvpCashBag AS TemporaryPoint,
    G.GuildSerial, G.PvP_0 AS KillCount, G.Die_0 AS DeathCount,
    GU.id AS GuildName
  FROM [RF_World].[dbo].[tbl_base] B
  LEFT JOIN [RF_World].[dbo].[tbl_general] G ON B.Serial = G.Serial
  LEFT JOIN [RF_World].[dbo].[tbl_guild] GU ON G.GuildSerial = GU.Serial
  WHERE B.Name = @name AND B.DCK = 0
`;

export function formatCharacterProfileResponse(
  baseInfo: any,
  inventoryItems: any[],
  bankItems: any[]
) {
  const hpVal = baseInfo.HP ?? 12584;
  const fpVal = baseInfo.FP ?? 3438;
  const spVal = baseInfo.SP ?? 1887;

  return {
    summary: {
      serial: baseInfo.Serial,
      accountSerial: baseInfo.AccountSerial,
      name: baseInfo.Name,
      race: baseInfo.Race,
      class: baseInfo.Class,
      level: baseInfo.Level || 1,
      guildName: baseInfo.GuildName || 'No Guild',
      gold: baseInfo.Gold || 0,
      dalant: baseInfo.Dalant || 0,
      lastConnTime: baseInfo.LastConnTime
        ? new Date(baseInfo.LastConnTime).toLocaleString()
        : 'N/A',
    },
    stats: {
      hp: hpVal,
      maxHp: hpVal,
      fp: fpVal,
      maxFp: fpVal,
      sp: spVal,
      maxSp: spVal,
      killCount: baseInfo.KillCount || 0,
      deathCount: baseInfo.DeathCount || 0,
      temporaryPoint: baseInfo.TemporaryPoint || 0,
      certainPoint: baseInfo.CertainPoint || 0,
      goldPoint: 0,
      contPointVar: 5000,
      contPoint: 273038,
    },
    equipment: {},
    inventory: inventoryItems,
    bank: bankItems,
  };
}