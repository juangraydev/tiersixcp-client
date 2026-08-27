'use client';

import React from 'react';

import { InventoryItem } from './character/types/character';
import ItemIconView from './ItemIconView';

interface StorageGridContainerProps {
  title: string;
  slots: Record<number, InventoryItem>;
  startSlot: number;
}

export default function StorageGridContainer({
  title,
  slots,
  startSlot,
}: StorageGridContainerProps) {
  /*
   * Every bag/storage container contains 20 slots.
   *
   * Example:
   *
   * Bag 1:
   *   0  - 19
   *
   * Bag 2:
   *   20 - 39
   *
   * Bag 3:
   *   40 - 59
   *
   * etc.
   */
  const gridSlots = Array.from(
    { length: 20 },
    (_, index) => startSlot + index,
  );

  return (
    <div
      className="
        w-[230px]
        shrink-0
        rounded
        border
        border-neutral-800
        bg-neutral-900/90
        shadow-lg
      "
    >
      {/* =========================================================
          HEADER
      ========================================================= */}
      <div
        className="
          border-b
          border-neutral-800
          bg-neutral-950/80
          py-1
          text-center
          font-sans
          text-[11px]
          font-bold
          text-neutral-300
        "
      >
        {title}
      </div>

      {/* =========================================================
          5 COLUMNS × 4 ROWS = 20 SLOTS
      ========================================================= */}
      <div
        className="
          grid
          grid-cols-5
          gap-1
          p-1.5
        "
      >
        {gridSlots.map((slotIndex) => {
          const item = slots[slotIndex];

          return (
            <div
              key={slotIndex}
              className="
                group
                relative
                flex
                h-[38px]
                w-[38px]
                items-center
                justify-center
                rounded-[2px]
                border
                border-neutral-800/80
                bg-neutral-950
                transition-colors
                hover:border-neutral-500
              "
            >
              {item ? (
                <>
                  {/* =================================================
                      ITEM
                  ================================================= */}
                  <div
                    className="
                      relative
                      flex
                      h-full
                      w-full
                      items-center
                      justify-center
                      p-0.5
                    "
                  >
                    <ItemIconView item={item} />

                    {/* =============================================
                        QUANTITY
                    ============================================= */}
                    {item.qty && item.qty > 1 ? (
                      <span
                        className="
                          absolute
                          bottom-0.5
                          right-0.5
                          font-mono
                          text-[10px]
                          font-bold
                          leading-none
                          text-amber-300
                          drop-shadow-[0_1px_1px_rgba(0,0,0,1)]
                        "
                      >
                        {item.qty}
                      </span>
                    ) : null}

                  </div>

                  {/* =================================================
                      TOOLTIP
                  ================================================= */}
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
                    {/* ITEM NAME */}
                    <p
                      className="
                        text-[11px]
                        font-bold
                        leading-snug
                        text-white
                      "
                    >
                      {item.itemName || 'Unknown Item'}
                    </p>

                    {/* TYPE */}
                    <p
                      className="
                        mt-0.5
                        text-[9px]
                        font-semibold
                        uppercase
                        tracking-wider
                        text-neutral-400
                      "
                    >
                      Type: {item.itemType || 'General'}
                    </p>

                    {/* ITEM CODE */}
                    {item.itemCode ? (
                      <p
                        className="
                          mt-0.5
                          font-mono
                          text-[9px]
                          text-cyan-400
                        "
                      >
                        Code: {item.itemCode}
                      </p>
                    ) : null}

                    {/* SLOT */}
                    <p
                      className="
                        mt-0.5
                        font-mono
                        text-[9px]
                        text-neutral-500
                      "
                    >
                      Slot: {slotIndex}
                    </p>

                    {/* QUANTITY */}
                    {item.qty && item.qty > 1 ? (
                      <p
                        className="
                          mt-0.5
                          font-mono
                          text-[9px]
                          text-amber-400
                        "
                      >
                        Quantity: {item.qty}
                      </p>
                    ) : null}

                    {/* UPGRADE */}
                    {item.upgradeLevel &&
                    item.upgradeLevel > 0 ? (
                      <p
                        className="
                          mt-0.5
                          font-mono
                          text-[9px]
                          text-cyan-400
                        "
                      >
                        Upgrade: +{item.upgradeLevel}
                      </p>
                    ) : null}
                  </div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}