export interface EquipmentItem {
  itemId: number;
  itemCode?: string;
  itemName?: string;
  itemType?: string;
  upgradeLevel?: number;
  icon?: string | number;
  itemIcon?: number | string;
  itemIconPos?: number | string;
  iconPath?: string;
}

export interface InventoryItem {
  slot: number;
  itemId: number;
  itemCode?: string;
  itemName?: string;
  itemType?: string;
  qty: number;
  upgradeLevel?: number;
  icon?: string | number;
  itemIcon?: number | string;
  itemIconPos?: number | string;
  iconPath?: string;
}

export interface CharacterStats {
  hp: number;
  maxHp: number;
  fp: number;
  maxFp: number;
  sp: number;
  maxSp: number;
  killCount: number;
  deathCount: number;
  temporaryPoint: number;
  certainPoint: number;
  goldPoint: number;
  contPointVar: number;
  contPoint: number;
}

export interface CharacterSummary {
  serial: number;
  accountSerial: number;
  name: string;
  race: number;
  class: number;
  level: number;
  guildName: string;
  gold: number;
  dalant: number;
  lastConnTime: string;
}

export interface CharacterData {
  summary: CharacterSummary;
  stats: CharacterStats;
  equipment: Record<string, EquipmentItem | null>;
  inventory: InventoryItem[];
  bank: InventoryItem[];
}