'use client';

import React from 'react';
import { Sword } from 'lucide-react';
import {
  CharacterData,
  EquipmentItem,
  InventoryItem,
} from './types/character';

interface Props {
  character: CharacterData;
}

/**
 * Item Icon Renderer
 *
 * Sprite sheet:
 * - Each icon = 64x64
 * - Sprite sheet can have different dimensions
 * - Example: 256x256
 * - Example: 256x512
 *
 * itemIconPos is ZERO-BASED.
 */
const ItemIconView = ({
  item,
  label,
}: {
  item: EquipmentItem | InventoryItem | null;
  label?: string;
}) => {
  const [spriteSize, setSpriteSize] = React.useState<{
    width: number;
    height: number;
  } | null>(null);

  if (!item) {
    return (
      <span className="text-[8px] font-bold uppercase text-neutral-600">
        {label}
      </span>
    );
  }

  const rawIconPos =
    item.itemIconPos !== undefined
      ? item.itemIconPos
      : item.itemIcon !== undefined
        ? item.itemIcon
        : item.icon;

  const iconPos =
    typeof rawIconPos === 'number'
      ? rawIconPos
      : typeof rawIconPos === 'string' && rawIconPos.trim() !== ''
        ? Number(rawIconPos)
        : null;

  const spriteSrc = item.iconPath;

  if (spriteSrc && iconPos !== null && Number.isFinite(iconPos)) {
    const SOURCE_ICON_SIZE = 64;
    const DISPLAY_ICON_SIZE = 38;

    if (!spriteSize) {
      return (
        <div className="relative h-full w-full overflow-hidden">
          <img
            src={spriteSrc}
            alt=""
            draggable={false}
            className="hidden"
            onLoad={(e) => {
              const img = e.currentTarget;

              setSpriteSize({
                width: img.naturalWidth,
                height: img.naturalHeight,
              });
            }}
            onError={() => {
              setSpriteSize({
                width: 0,
                height: 0,
              });
            }}
          />
        </div>
      );
    }

    if (spriteSize.width <= 0 || spriteSize.height <= 0) {
      return (
        <span className="text-[8px] text-neutral-600">
          ?
        </span>
      );
    }

    const columns = Math.floor(
      spriteSize.width / SOURCE_ICON_SIZE
    );

    const rows = Math.floor(
      spriteSize.height / SOURCE_ICON_SIZE
    );

    const totalIcons = columns * rows;

    const index = Math.floor(iconPos);

    if (
      columns <= 0 ||
      rows <= 0 ||
      index < 0 ||
      index >= totalIcons
    ) {
      return (
        <span className="text-[8px] text-neutral-600">
          ?
        </span>
      );
    }

    const column = index % columns;
    const row = Math.floor(index / columns);

    const scale =
      DISPLAY_ICON_SIZE / SOURCE_ICON_SIZE;

    const displaySpriteWidth =
      spriteSize.width * scale;

    const displaySpriteHeight =
      spriteSize.height * scale;

    const offsetX =
      -(column * DISPLAY_ICON_SIZE);

    const offsetY =
      -(row * DISPLAY_ICON_SIZE);

    return (
      <div
        className="relative shrink-0 overflow-hidden"
        style={{
          width: `${DISPLAY_ICON_SIZE}px`,
          height: `${DISPLAY_ICON_SIZE}px`,
          backgroundImage: `url("${spriteSrc}")`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: `${displaySpriteWidth}px ${displaySpriteHeight}px`,
          backgroundPosition: `${offsetX}px ${offsetY}px`,
        }}
      />
    );
  }

  const displayCode =
    item.itemCode || `${item.itemId}`;

  const imgSrc =
    item.iconPath ||
    (typeof item.icon === 'string' &&
    item.icon.includes('.')
      ? item.icon
      : null);

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={
          item.itemName ||
          label ||
          'Item'
        }
        className="h-full w-full object-contain"
        draggable={false}
      />
    );
  }

  return (
    <span className="truncate px-0.5 font-sans text-[9px] font-bold uppercase tracking-tighter text-cyan-300">
      {displayCode}
    </span>
  );
};

const PaperdollSlot = ({
  item,
  label,
}: {
  item?: EquipmentItem | null;
  label?: string;
}) => {
  return (
    <div className="group relative flex h-11 w-11 items-center justify-center rounded border border-neutral-700/60 bg-neutral-950/90 shadow-inner">
      {item ? (
        <>
          <div className="relative flex h-full w-full items-center justify-center p-1">
            <ItemIconView
              item={item}
              label={label}
            />

            {item.upgradeLevel &&
            item.upgradeLevel > 0 ? (
              <span className="absolute right-0.5 top-0.5 font-mono text-[10px] font-extrabold text-cyan-400 drop-shadow-[0_1px_1px_rgba(0,0,0,1)]">
                +{item.upgradeLevel}
              </span>
            ) : null}
          </div>

          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-max max-w-[180px] -translate-x-1/2 rounded border border-neutral-700 bg-neutral-950 p-2 text-left shadow-2xl group-hover:block">
            <p className="text-[11px] font-bold leading-snug text-white">
              {item.itemName ||
                'Unknown Item'}
            </p>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
              Type:{' '}
              {item.itemType ||
                'Equipment'}
            </p>

            {item.itemCode ? (
              <p className="mt-0.5 font-mono text-[9px] text-cyan-400">
                Code: {item.itemCode}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        <span className="text-[8px] font-bold uppercase text-neutral-600">
          {label}
        </span>
      )}
    </div>
  );
};

export default function EquipmentTab({
  character,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-3">
        <Sword className="h-4 w-4 text-red-500" />

        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-300">
          Equipment
        </h2>
      </div>

      <div className="flex justify-center">
        <div className="flex flex-col items-center rounded-lg border border-neutral-800 bg-neutral-900/60 p-6">
          <div className="mb-4 text-xs font-bold uppercase tracking-wide text-neutral-300">
            {character.summary?.name ||
              'CHARACTER'}
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div />

            <PaperdollSlot
              item={
                character.equipment?.helmet
              }
              label="Helmet"
            />

            <PaperdollSlot
              item={
                character.equipment?.cloak
              }
              label="Cloak"
            />

            <PaperdollSlot
              item={
                character.equipment?.weapon
              }
              label="Weapon"
            />

            <PaperdollSlot
              item={
                character.equipment?.upper
              }
              label="Upper"
            />

            <PaperdollSlot
              item={
                character.equipment?.shield
              }
              label="Shield"
            />

            <PaperdollSlot
              item={
                character.equipment?.gauntlet
              }
              label="Hands"
            />

            <PaperdollSlot
              item={
                character.equipment?.lower
              }
              label="Lower"
            />

            <PaperdollSlot
              item={
                character.equipment?.shoe
              }
              label="Shoes"
            />
          </div>

          <div className="mt-4 w-full border-t border-neutral-800 pt-3 text-right font-mono text-xs">
            <p className="font-bold text-neutral-300">
              {(
                character.summary?.dalant ??
                0
              ).toLocaleString()}{' '}
              CP
            </p>

            <p className="font-bold text-amber-400">
              {(
                character.summary?.gold ??
                0
              ).toLocaleString()}{' '}
              Gold
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}