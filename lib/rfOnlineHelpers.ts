// Maps RF Online Table Codes (K value offset) to SQL Table Names
export const ITEM_TABLE_MAP: Record<number, string> = {
  0: 'tbl_code_upper',
  1: 'tbl_code_lower',
  2: 'tbl_code_gauntlet',
  3: 'tbl_code_shoe',
  4: 'tbl_code_helmet',
  5: 'tbl_code_shield',
  6: 'tbl_code_weapon',
  7: 'tbl_code_cloak',
  8: 'tbl_code_ring',
  9: 'tbl_code_amulet',
  10: 'tbl_code_bullet',
  14: 'tbl_code_potion',
};

/**
 * Resolves the RF Online table name from the item table code
 */
export function getItemTable(code: number): string {
  return ITEM_TABLE_MAP[code] || 'tbl_code_etc';
}

/**
 * Decodes RF Online composite item K-Value into Item ID and Table Code
 */
export function decodeKValue(kVal: number) {
  const itemId = Math.floor(kVal / 65536);
  const tableCode = Math.floor((kVal - itemId * 65536) / 256);
  const tableName = getItemTable(tableCode);

  return { itemId, tableCode, tableName };
}