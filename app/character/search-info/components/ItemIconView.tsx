'use client';

import React, { useEffect, useState } from 'react';

import {
  EquipmentItem,
  InventoryItem,
} from './character/types/character';

type Item = EquipmentItem | InventoryItem | null;

interface ItemIconViewProps {
  item: Item;
  label?: string;
}

interface SpriteSize {
  width: number;
  height: number;
}

export default function ItemIconView({
  item,
  label,
}: ItemIconViewProps) {
  const [spriteSize, setSpriteSize] =
    useState<SpriteSize | null>(null);

  const [imageError, setImageError] =
    useState(false);

  /*
   * ============================================================
   * NO ITEM
   * ============================================================
   */
  if (!item) {
    return (
      <span
        className="
          text-[8px]
          font-bold
          uppercase
          text-neutral-600
        "
      >
        {label}
      </span>
    );
  }

  const rawIconPos =
    item.itemIconPos !== undefined &&
    item.itemIconPos !== null
      ? item.itemIconPos
      : item.itemIcon !== undefined &&
          item.itemIcon !== null
        ? item.itemIcon
        : item.icon;

  /*
   * Convert icon position to number.
   */
  let iconPos: number | null = null;

  if (typeof rawIconPos === 'number') {
    iconPos = rawIconPos;
  } else if (
    typeof rawIconPos === 'string' &&
    rawIconPos.trim() !== ''
  ) {
    const parsed = Number(rawIconPos);

    if (Number.isFinite(parsed)) {
      iconPos = parsed;
    }
  }


  const spriteSrc = item.iconPath;

  // Original RF Online icon size.
  const SOURCE_ICON_SIZE = 64;

  // Size inside the UI slot.
  const DISPLAY_ICON_SIZE = 38;

  /*
   * ============================================================
   * SPRITE SHEET
   * ============================================================
   *
   * We only use sprite-sheet extraction when:
   *
   *   iconPath exists
   *   AND
   *   icon position is valid.
   */
  if (
    spriteSrc &&
    iconPos !== null &&
    Number.isFinite(iconPos)
  ) {
    /*
     * ----------------------------------------------------------
     * LOAD ACTUAL IMAGE DIMENSIONS
     * ----------------------------------------------------------
     *
     * We intentionally do NOT assume:
     *
     *   256 x 256
     *
     * because the sprite sheet can also be:
     *
     *   256 x 512
     *   512 x 256
     *   512 x 512
     *   etc.
     */
    useEffect(() => {
      setSpriteSize(null);
      setImageError(false);
    }, [spriteSrc]);

    /*
     * ----------------------------------------------------------
     * WAIT FOR IMAGE SIZE
     * ----------------------------------------------------------
     */
    if (!spriteSize) {
      return (
        <img
          src={spriteSrc}
          alt=""
          draggable={false}
          className="hidden"
          onLoad={(event) => {
            const image = event.currentTarget;

            setSpriteSize({
              width: image.naturalWidth,
              height: image.naturalHeight,
            });
          }}
          onError={() => {
            setImageError(true);

            setSpriteSize({
              width: 0,
              height: 0,
            });
          }}
        />
      );
    }

    /*
     * ----------------------------------------------------------
     * IMAGE ERROR
     * ----------------------------------------------------------
     */
    if (
      imageError ||
      spriteSize.width <= 0 ||
      spriteSize.height <= 0
    ) {
      return (
        <span
          className="
            text-[8px]
            font-bold
            text-neutral-600
          "
        >
          ?
        </span>
      );
    }

    /*
     * ----------------------------------------------------------
     * DETERMINE SPRITE GRID
     * ----------------------------------------------------------
     *
     * Example:
     *
     * 256 / 64 = 4 columns
     *
     * 512 / 64 = 8 rows
     */
    const columns = Math.floor(
      spriteSize.width / SOURCE_ICON_SIZE,
    );

    const rows = Math.floor(
      spriteSize.height / SOURCE_ICON_SIZE,
    );

    const totalIcons = columns * rows;

    /*
     * Make sure position is an integer.
     */
    const index = Math.floor(iconPos);

    /*
     * ----------------------------------------------------------
     * VALIDATE POSITION
     * ----------------------------------------------------------
     */
    if (
      columns <= 0 ||
      rows <= 0 ||
      index < 0 ||
      index >= totalIcons
    ) {
      return (
        <span
          className="
            text-[8px]
            font-bold
            text-neutral-600
          "
        >
          ?
        </span>
      );
    }

    /*
     * ----------------------------------------------------------
     * CALCULATE COLUMN / ROW
     * ----------------------------------------------------------
     *
     * Example:
     *
     * columns = 4
     *
     * index = 6
     *
     * column = 6 % 4 = 2
     *
     * row = floor(6 / 4) = 1
     *
     * So icon 6 is:
     *
     * row 1
     * column 2
     */
    const column = index % columns;

    const row = Math.floor(
      index / columns,
    );

    /*
     * ----------------------------------------------------------
     * SOURCE CROP POSITION
     * ----------------------------------------------------------
     *
     * IMPORTANT:
     *
     * We calculate the crop in the ORIGINAL image dimensions.
     *
     * We do NOT resize the original sprite sheet first.
     */
    const sourceX =
      column * SOURCE_ICON_SIZE;

    const sourceY =
      row * SOURCE_ICON_SIZE;

    /*
     * ----------------------------------------------------------
     * SCALE
     * ----------------------------------------------------------
     *
     * Source:
     *
     *   64 x 64
     *
     * Display:
     *
     *   38 x 38
     *
     * Scale factor:
     *
     *   38 / 64
     */
    const scale =
      DISPLAY_ICON_SIZE /
      SOURCE_ICON_SIZE;

    /*
     * ----------------------------------------------------------
     * BACKGROUND SIZE
     * ----------------------------------------------------------
     *
     * We scale the entire sprite sheet mathematically,
     * while preserving its original aspect ratio.
     *
     * Example:
     *
     * 256 x 512
     *
     * becomes:
     *
     * 152 x 304
     *
     * because:
     *
     * 256 * (38 / 64) = 152
     * 512 * (38 / 64) = 304
     */
    const displaySpriteWidth =
      spriteSize.width * scale;

    const displaySpriteHeight =
      spriteSize.height * scale;

    /*
     * ----------------------------------------------------------
     * DISPLAY OFFSET
     * ----------------------------------------------------------
     *
     * The selected 64x64 source region becomes 38x38.
     */
    const offsetX =
      -(sourceX * scale);

    const offsetY =
      -(sourceY * scale);

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */
    return (
      <div
        className="
          relative
          shrink-0
          overflow-hidden
        "
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
           * Keep browser's normal image filtering.
           *
           * Do NOT use:
           *
           * imageRendering: pixelated
           *
           * because RF icons can look worse when forced
           * into pixelated rendering.
           */
          imageRendering: 'auto',
        }}
      />
    );
  }

  /*
   * ============================================================
   * FALLBACK IMAGE
   * ============================================================
   *
   * If there is no valid itemIconPos, try to display iconPath
   * directly.
   */
  const fallbackImage =
    item.iconPath ||
    (
      typeof item.icon === 'string' &&
      item.icon.includes('.')
        ? item.icon
        : null
    );

  if (fallbackImage) {
    return (
      <img
        src={fallbackImage}
        alt={
          item.itemName ||
          label ||
          'Item'
        }
        draggable={false}
        className="
          h-full
          w-full
          object-contain
        "
      />
    );
  }

  /*
   * ============================================================
   * FINAL FALLBACK
   * ============================================================
   */
  const displayCode =
    item.itemCode ||
    `${item.itemId}`;

  return (
    <span
      className="
        truncate
        px-0.5
        font-sans
        text-[9px]
        font-bold
        uppercase
        tracking-tighter
        text-cyan-300
      "
    >
      {displayCode}
    </span>
  );
}