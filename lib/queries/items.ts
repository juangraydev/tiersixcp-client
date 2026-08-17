import { ITEM_TABLE_MAPPINGS } from './itemTableMappings';

/**
 * Builds a CTE UNION query safely. 
 * Dynamically checks if 'item_icon' exists for each table in the database schema:
 * - If it exists, selects the actual column value.
 * - If it does not exist, defaults to NULL AS itemIconPos.
 */
export const getNitroItemsCteSql = (): string => {
  const unions = ITEM_TABLE_MAPPINGS.map(
    ({ table, type, tableCode, iconFolder, iconCol, hasIcon }) => {

      const itemIconSql = hasIcon
        ? `CAST(${iconCol} AS INT) AS itemIconPos`
        : `CAST(NULL AS INT) AS itemIconPos`;

      return `
        SELECT
          item_id,
          item_code,
          item_name,
          ${itemIconSql},
          '${type}' AS ItemType,
          ${tableCode} AS TableCode,
          '${iconFolder}' AS IconFolder
        FROM [NITRO_ITEMS].[dbo].[${table}]
      `;
    }
  ).join('\nUNION ALL\n');

  return `
    SELECT
      item.item_id AS ItemID,
      item.item_code AS ItemCode,
      item.item_name AS ItemName,
      item.itemIconPos AS ItemIconPos,
      item.ItemType,
      item.TableCode,
      item.IconFolder
    FROM (
      ${unions}
    ) item
  `;
};

/**
 * Dynamically generates CROSS APPLY VALUES string for N slots (e.g. K0..K99)
 */
const generateSlotValuesSql = (prefix: string, maxSlots: number): string => {
  const slots: string[] = [];
  for (let i = 0; i < maxSlots; i++) {
    slots.push(`(${i}, ${prefix}.K${i}, ${prefix}.D${i}, ${prefix}.U${i})`);
  }
  return slots.join(', ');
};

/**
 * Common SQL snippet for generating the mapped icon file code and full path:
 * weapon=1, force=4, ammu=5, potion=6, ore=8, resources=9, booty=13, helmet=14, 
 * upper=15, lower=16, gloves=17, shoes=18, shield=19, ring/amulet/cloak=20, map=21, town=22
 */
const ITEM_ICON_CASE_SQL = `
  CASE NI.TableCode
    WHEN 0 THEN 15  -- upper
    WHEN 1 THEN 16  -- lower
    WHEN 2 THEN 17  -- gloves (gauntlet)
    WHEN 3 THEN 18  -- shoes
    WHEN 4 THEN 14  -- helmet
    WHEN 5 THEN 19  -- shield
    WHEN 6 THEN 1   -- weapon
    WHEN 7 THEN 20  -- cloak
    WHEN 8 THEN 20  -- ring
    WHEN 9 THEN 20  -- amulet
    WHEN 10 THEN 5  -- bullet
    WHEN 11 THEN 10 -- maker tools
    WHEN 12 THEN 7  -- bag
    WHEN 13 THEN 6  -- potion
    WHEN 15 THEN 4  -- force
    WHEN 16 THEN 11 -- battery
    WHEN 17 THEN 8  -- Ore
    WHEN 18 THEN 9  -- resources
    WHEN 19 THEN 8  -- ore
    WHEN 20 THEN 13 -- Booty
    WHEN 21 THEN 21 -- Map
    WHEN 22 THEN 22 -- town
    WHEN 23 THEN 23 -- battle dungeon
    WHEN 24 THEN 24 -- Animus
    WHEN 25 THEN 26 -- Guard Tower
    WHEN 26 THEN 30 -- trap
    WHEN 27 THEN 31 -- SK
    WHEN 28 THEN 32 -- Ticket - correct
    WHEN 29 THEN 32 -- Ticket
    WHEN 30 THEN 6  -- Recovery Potion 
    WHEN 31 THEN 6  --  Box
    WHEN 32 THEN 6  -- Firecrackers
    WHEN 33 THEN 34 -- unmanned miner
    WHEN 34 THEN 35 -- radar
    WHEN 35 THEN 36 -- NPC Link
    WHEN 36 THEN 37 -- Discount Coupon
    
    ELSE 1          -- Default fallback file code
  END
`;

const ICON_PATH_SQL = `
  CASE 
    WHEN NI.ItemCode IS NOT NULL THEN 
      '/images/items/' + NI.IconFolder + '/item-1-' + CAST(${ITEM_ICON_CASE_SQL} AS VARCHAR) + '.png'
    ELSE '/images/items/unknown.png'
  END
`;

/**
 * Inventory Query: Unpacks RF Online K-Value into ItemID & TableCode for joining
 */
export const INVENTORY_QUERY_SQL = `
  WITH AllItems AS (${getNitroItemsCteSql()})
  SELECT 
    S.Slot AS slot,
    S.K AS rawKValue,
    S.UnpackedItemID AS itemId,
    S.UnpackedTableCode AS tableCode,
    CASE 
      WHEN S.D > 0 THEN S.D 
      ELSE 1 
    END AS qty,
    S.U AS upgradeLevel,
    NI.ItemCode AS itemCode,
    NI.ItemName AS itemName,
    NI.ItemType AS itemType,
    NI.ItemIconPos AS itemIconPos,
    NI.IconFolder AS iconFolder,
    ${ICON_PATH_SQL} AS iconPath
  FROM [RF_World].[dbo].[tbl_inven] I
  CROSS APPLY (
    VALUES ${generateSlotValuesSql('I', 100)}
  ) Raw(Slot, K, D, U)
  CROSS APPLY (
    SELECT 
      Raw.Slot,
      Raw.K,
      Raw.D,
      Raw.U,
      (Raw.K / 65536) AS UnpackedItemID,
      ((Raw.K - ((Raw.K / 65536) * 65536)) / 256) AS UnpackedTableCode
  ) S
  LEFT JOIN AllItems NI 
    ON S.UnpackedItemID = NI.ItemID 
   AND S.UnpackedTableCode = NI.TableCode
  WHERE I.Serial = @charSerial 
    AND S.K IS NOT NULL 
    AND S.K <> -1 
    AND S.K <> 65535 
    AND S.K <> 255;
`;

/**
 * Bank/Trunk Query: Unpacks RF Online K-Value into ItemID & TableCode for joining
 */
export const BANK_QUERY_SQL = `
  WITH AllItems AS (${getNitroItemsCteSql()})
  SELECT 
    S.Slot AS slot,
    S.K AS rawKValue,
    S.UnpackedItemID AS itemId,
    S.UnpackedTableCode AS tableCode,
    CASE 
      WHEN S.D > 0 THEN S.D 
      ELSE 1 
    END AS qty,
    S.U AS upgradeLevel,
    NI.ItemCode AS itemCode,
    NI.ItemName AS itemName,
    NI.ItemType AS itemType,
    NI.ItemIconPos AS itemIconPos,
    NI.IconFolder AS iconFolder,
    ${ICON_PATH_SQL} AS iconPath
  FROM [RF_World].[dbo].[tbl_AccountTrunk] T
  CROSS APPLY (
    VALUES ${generateSlotValuesSql('T', 40)}
  ) Raw(Slot, K, D, U)
  CROSS APPLY (
    SELECT 
      Raw.Slot,
      Raw.K,
      Raw.D,
      Raw.U,
      (Raw.K / 65536) AS UnpackedItemID,
      ((Raw.K - ((Raw.K / 65536) * 65536)) / 256) AS UnpackedTableCode
  ) S
  LEFT JOIN AllItems NI 
    ON S.UnpackedItemID = NI.ItemID 
   AND S.UnpackedTableCode = NI.TableCode
  WHERE T.AccountSerial = @accountSerial 
    AND S.K IS NOT NULL 
    AND S.K <> -1 
    AND S.K <> 65535 
    AND S.K <> 255;
`;