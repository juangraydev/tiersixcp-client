'use client';

import React, { useState } from 'react';

import type { EquipmentItem, InventoryItem } from './types';

interface PaperdollSlotProps {
  item?: EquipmentItem | null;
  label?: string;
  className?: string;
}

/**
 * RF Online Paperdoll Item Icon
 *
 * The parent slot remains 44x44.
 * The actual icon is rendered at 38x38.
 *
 * Sprite sheet:
 * - Each individual icon = 64x64 source pixels
 * - Sprite sheet can have different heights:
 *   256x256
 *   256x512
 *   etc.
 *
 * itemIconPos:
 * - 0 = first icon
 * - 1 = second icon
 * - ...
 *
 * The sprite sheet is NOT resized/cropped based on the
 * overall image dimensions. Only the selected 64x64
 * source region is scaled down to 38x38.
 */
const ItemIconView = ({
  item,
  label,
}: {
  item: EquipmentItem | InventoryItem | null;
  label?: string;
}) => {
  const [spriteSize, setSpriteSize] = useState<{
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

  /*
   * We have an icon position and sprite sheet.
   */
  if (
    spriteSrc &&
    iconPos !== null &&
    Number.isFinite(iconPos)
  ) {
    const SOURCE_ICON_SIZE = 64;
    const DISPLAY_ICON_SIZE = 38;

    /*
     * Load the actual image dimensions first.
     */
    if (!spriteSize) {
      return (
        <div className="relative h-[38px] w-[38px] overflow-hidden">
          <img
            src={spriteSrc}
            alt=""
            draggable={false}
            className="hidden"
            onLoad={(event) => {
              const img = event.currentTarget;

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

    /*
     * Invalid image.
     */
    if (
      spriteSize.width <= 0 ||
      spriteSize.height <= 0
    ) {
      return (
        <span className="text-[8px] text-neutral-600">
          ?
        </span>
      );
    }

    /*
     * Determine the number of columns and rows
     * from the REAL image dimensions.
     *
     * Example:
     *
     * 256x256
     * = 4 columns x 4 rows
     *
     * 256x512
     * = 4 columns x 8 rows
     */
    const columns = Math.floor(
      spriteSize.width / SOURCE_ICON_SIZE
    );

    const rows = Math.floor(
      spriteSize.height / SOURCE_ICON_SIZE
    );

    const totalIcons = columns * rows;

    /*
     * Make sure icon position is an integer.
     */
    const index = Math.floor(iconPos);

    /*
     * Validate icon position.
     */
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

    /*
     * Convert icon position to column / row.
     *
     * Example with 4 columns:
     *
     * position 0  -> col 0, row 0
     * position 1  -> col 1, row 0
     * position 2  -> col 2, row 0
     * position 3  -> col 3, row 0
     *
     * position 4  -> col 0, row 1
     * position 5  -> col 1, row 1
     */
    const column = index % columns;
    const row = Math.floor(index / columns);

    /*
     * We want:
     *
     * Source icon: 64x64
     * Display icon: 38x38
     *
     * Scale the entire sprite sheet proportionally.
     */
    const scale =
      DISPLAY_ICON_SIZE / SOURCE_ICON_SIZE;

    const displaySpriteWidth =
      spriteSize.width * scale;

    const displaySpriteHeight =
      spriteSize.height * scale;

    /*
     * Each 64x64 source icon becomes exactly 38x38.
     */
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

          backgroundSize: `
            ${displaySpriteWidth}px
            ${displaySpriteHeight}px
          `,

          backgroundPosition: `
            ${offsetX}px
            ${offsetY}px
          `,

          /*
           * Keep the original sprite artwork smooth
           * when scaling 64 -> 38.
           */
          imageRendering: 'auto',
        }}
      />
    );
  }

  /*
   * Fallback if there is no valid sprite position.
   */
  const imgSrc =
    item.iconPath ||
    (
      typeof item.icon === 'string' &&
      item.icon.includes('.')
        ? item.icon
        : null
    );

  if (imgSrc) {
    return (
      <img
        src={imgSrc}
        alt={
          item.itemName ||
          label ||
          'Item'
        }
        className="h-[38px] w-[38px] object-contain"
        draggable={false}
      />
    );
  }

  return (
    <span className="truncate px-0.5 font-sans text-[9px] font-bold uppercase tracking-tighter text-cyan-300">
      {item.itemCode || item.itemId}
    </span>
  );
};

export default function PaperdollSlot({
  item,
  label,
  className = '',
}: PaperdollSlotProps) {
  return (
    <div
      className={`
        group
        relative
        flex
        h-11
        w-11
        items-center
        justify-center
        rounded
        border
        border-neutral-700/60
        bg-neutral-950/90
        shadow-inner
        ${className}
      `}
    >
      {item ? (
        <>
          {/* ================================================= */}
          {/* ICON CONTAINER                                    */}
          {/* ================================================= */}

          <div className="relative flex h-full w-full items-center justify-center">
            <ItemIconView
              item={item}
              label={label}
            />

            {/* ============================================= */}
            {/* UPGRADE LEVEL                                  */}
            {/* ============================================= */}

            {item.upgradeLevel &&
            item.upgradeLevel > 0 ? (
              <span
                className="
                  absolute
                  right-0
                  top-0
                  z-10
                  font-mono
                  text-[10px]
                  font-extrabold
                  text-cyan-400
                  drop-shadow-[0_1px_1px_rgba(0,0,0,1)]
                "
              >
                +{item.upgradeLevel}
              </span>
            ) : null}
          </div>

          {/* ================================================= */}
          {/* TOOLTIP                                           */}
          {/* ================================================= */}

          <div
            className="
              pointer-events-none
              absolute
              bottom-full
              left-1/2
              z-50
              mb-2
              hidden
              w-max
              max-w-[180px]
              -translate-x-1/2
              rounded
              border
              border-neutral-700
              bg-neutral-950
              p-2
              text-left
              shadow-2xl
              group-hover:block
            "
          >
            {/* Item Name */}
            <p className="text-[11px] font-bold leading-snug text-white">
              {item.itemName || 'Unknown Item'}
            </p>

            {/* Type */}
            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">
              Type:{' '}
              {item.itemType || 'Equipment'}
            </p>

            {/* Item Code */}
            {item.itemCode ? (
              <p className="mt-0.5 font-mono text-[9px] text-cyan-400">
                Code: {item.itemCode}
              </p>
            ) : null}

            {/* Icon Position */}
            {item.itemIconPos !== undefined ? (
              <p className="mt-0.5 font-mono text-[9px] text-neutral-500">
                Icon: {item.itemIconPos}
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
}