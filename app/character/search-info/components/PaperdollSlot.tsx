'use client';

import React from 'react';

import { EquipmentItem, InventoryItem } from './character/types/character';
import ItemIconView from './ItemIconView';

interface PaperdollSlotProps {
  item?: EquipmentItem | null;
  label?: string;
  className?: string;
}

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
          {/* =====================================================
              ITEM ICON
          ===================================================== */}
          <div
            className="
              relative
              flex
              h-full
              w-full
              items-center
              justify-center
              p-1
            "
          >
            <ItemIconView
              item={item}
              label={label}
            />

            
          </div>

          {/* =====================================================
              TOOLTIP
          ===================================================== */}
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

            {/* ITEM TYPE */}
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
              Type: {item.itemType || 'Equipment'}
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

            {/* UPGRADE */}
            {item.upgradeLevel &&
            item.upgradeLevel > 0 ? (
              <p
                className="
                  mt-0.5
                  font-mono
                  text-[9px]
                  text-yellow-400
                "
              >
                Upgrade: +{item.upgradeLevel}
              </p>
            ) : null}
          </div>
        </>
      ) : (
        /* =======================================================
           EMPTY SLOT
        ======================================================= */
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
      )}
    </div>
  );
}