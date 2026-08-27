'use client';

import React from 'react';
import { Landmark } from 'lucide-react';

import type { CharacterData, InventoryItem } from './types/character';

import ItemIconView from '../ItemIconView';

interface BankTabProps {
  character: CharacterData;
}

/**
 * Upgrade Indicators
 *
 * Displays 7 upgrade slots.
 * The number of active indicators is based on upgradeLevel.
 */
const UpgradeIndicators = ({
  level = 0,
}: {
  level?: number;
}) => {
  const MAX_UPGRADES = 7;

  const safeLevel = Math.max(
    0,
    Math.min(MAX_UPGRADES, Number(level) || 0)
  );

  return (
    <div className="flex items-center justify-center gap-[2px]">
      {Array.from({ length: MAX_UPGRADES }, (_, index) => {
        const active = index < safeLevel;

        return (
          <div
            key={index}
            className="flex h-7 w-5 items-center justify-center"
            title={`Upgrade ${index + 1}`}
          >
            <div
              className={`
                relative h-5 w-2.5
                ${
                  active
                    ? 'bg-cyan-400 drop-shadow-[0_0_4px_rgba(34,211,238,0.45)]'
                    : 'bg-neutral-700'
                }
              `}
              style={{
                clipPath:
                  'polygon(50% 0%, 100% 25%, 82% 82%, 50% 100%, 18% 82%, 0% 25%)',
              }}
            >
              <div
                className={`
                  absolute inset-[2px]
                  ${
                    active
                      ? 'bg-cyan-200'
                      : 'bg-neutral-600'
                  }
                `}
                style={{
                  clipPath:
                    'polygon(50% 0%, 100% 25%, 82% 82%, 50% 100%, 18% 82%, 0% 25%)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Bank Item Row
 */
const BankRow = ({
  item,
  index,
}: {
  item: InventoryItem;
  index: number;
}) => {
  return (
    <tr
      className="
        border-b border-neutral-800/80
        bg-neutral-950
        transition-colors
        hover:bg-neutral-900
      "
    >
      {/* # */}
      <td
        className="
          w-[70px]
          border-r border-neutral-800
          px-4 py-2
          text-center
        "
      >
        <span className="font-mono text-sm font-bold text-white">
          {index + 1}
        </span>
      </td>

      {/* ITEM NAME */}
      <td
        className="
          border-r border-neutral-800
          px-3 py-2
        "
      >
        <div className="flex min-w-0 items-center gap-2">

          {/* ICON */}
          <div
            className="
              flex h-10 w-10 shrink-0
              items-center justify-center
              overflow-hidden
              rounded-sm
              border border-neutral-700
              bg-neutral-950
            "
          >
            <ItemIconView item={item} />
          </div>

          {/* CODE + NAME */}
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">

              {/* ITEM CODE */}
              {item.itemCode ? (
                <span
                  className="
                    shrink-0
                    rounded
                    bg-indigo-950/80
                    px-1.5
                    py-0.5
                    font-mono
                    text-xs
                    font-bold
                    text-indigo-300
                  "
                >
                  {item.itemCode}
                </span>
              ) : null}

              {/* ITEM NAME */}
              <span
                className="
                  truncate
                  text-[15px]
                  font-medium
                  text-white
                "
                title={item.itemName || 'Unknown Item'}
              >
                {item.itemName || 'Unknown Item'}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* AMOUNT */}
      <td
        className="
          w-[135px]
          border-r border-neutral-800
          px-4 py-2
          text-center
        "
      >
        <span className="font-mono text-sm font-medium text-white">
          {(item.qty ?? 0).toLocaleString()}
        </span>
      </td>

      {/* UPGRADES */}
      <td
        className="
          w-[275px]
          px-3 py-2
        "
      >
        <UpgradeIndicators
          level={item.upgradeLevel ?? 0}
        />
      </td>
    </tr>
  );
};

/**
 * Bank Tab
 */
export default function BankTab({
  character,
}: BankTabProps) {
  const items = Array.isArray(character?.bank)
    ? [...character.bank]
    : [];

  return (
    <div className="space-y-4">

      {/* HEADER */}
      <div
        className="
          flex items-center justify-between
          border-b border-neutral-800
          pb-3
        "
      >
        <div className="flex items-center gap-2">

          <div
            className="
              flex h-8 w-8
              items-center justify-center
              rounded
              border border-red-500/30
              bg-red-600/10
            "
          >
            <Landmark className="h-4 w-4 text-red-500" />
          </div>

          <div>
            <h2
              className="
                text-sm
                font-bold
                uppercase
                tracking-wide
                text-white
              "
            >
              Bank Storage
            </h2>

            <p className="text-[10px] text-neutral-500">
              {character.summary?.name || 'Character'} bank storage
            </p>
          </div>
        </div>

        <div className="font-mono text-xs text-neutral-400">
          {items.length} Items
        </div>
      </div>

      {/* BANK TABLE */}
      <div
        className="
          overflow-hidden
          rounded-lg
          border border-neutral-800
          bg-neutral-950
          shadow-xl
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">

            {/* TABLE HEADER */}
            <thead>
              <tr className="bg-sky-600">

                {/* # */}
                <th
                  className="
                    w-[70px]
                    border-r border-sky-700
                    px-4 py-3
                    text-center
                    text-sm
                    font-black
                    text-white
                  "
                >
                  #
                </th>

                {/* ITEM NAME */}
                <th
                  className="
                    border-r border-sky-700
                    px-4 py-3
                    text-left
                    text-sm
                    font-black
                    text-white
                  "
                >
                  Item Name
                </th>

                {/* AMOUNT */}
                <th
                  className="
                    w-[135px]
                    border-r border-sky-700
                    px-4 py-3
                    text-center
                    text-sm
                    font-black
                    text-white
                  "
                >
                  Amount
                </th>

                {/* UPGRADES */}
                <th
                  className="
                    w-[275px]
                    px-4 py-3
                    text-center
                    text-sm
                    font-black
                    text-white
                  "
                >
                  Upgrades
                </th>

              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>
              {items.length > 0 ? (
                items.map((item, index) => (
                  <BankRow
                    key={`${item.slot}-${item.itemId}-${index}`}
                    item={item}
                    index={index}
                  />
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center"
                  >
                    <Landmark
                      className="
                        mx-auto
                        mb-2
                        h-8
                        w-8
                        text-neutral-700
                      "
                    />

                    <p
                      className="
                        text-sm
                        font-semibold
                        text-neutral-500
                      "
                    >
                      Bank Storage is empty
                    </p>

                    <p
                      className="
                        mt-1
                        text-[10px]
                        text-neutral-700
                      "
                    >
                      No bank items found for this character.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}