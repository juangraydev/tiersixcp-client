'use client';

import React from 'react';
import {
  Package,
  Landmark,
  Skull,
  Swords,
  Play,
} from 'lucide-react';

import { CharacterData, InventoryItem } from './types/character';
import PaperdollSlot from '../PaperdollSlot';
import StorageGridContainer from '../StorageGridContainer';

interface GameDataTabProps {
  character: CharacterData;
}

export default function GameDataTab({
  character,
}: GameDataTabProps) {
  const inventoryArray = Array.isArray(character?.inventory)
    ? character.inventory
    : [];

  const inventorySlots = inventoryArray.reduce<
    Record<number, InventoryItem>
  >((acc, item) => {
    if (item && typeof item.slot === 'number') {
      acc[item.slot] = item;
    }

    return acc;
  }, {});

  const bankArray = Array.isArray(character?.bank)
    ? character.bank
    : [];

  const bankSlots = bankArray.reduce<
    Record<number, InventoryItem>
  >((acc, item) => {
    if (item && typeof item.slot === 'number') {
      acc[item.slot] = item;
    }

    return acc;
  }, {});

  const hp = character?.stats?.hp ?? 0;
  const maxHp = character?.stats?.maxHp ?? 1;

  const fp = character?.stats?.fp ?? 0;
  const maxFp = character?.stats?.maxFp ?? 1;

  const sp = character?.stats?.sp ?? 0;
  const maxSp = character?.stats?.maxSp ?? 1;

  return (
    <div className="space-y-8">

      {/* =========================================================
          SECTION A
          STATS + EQUIPMENT
      ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">

        {/* =======================================================
            LEFT SIDE
        ======================================================= */}
        <div className="space-y-5 lg:col-span-7">

          {/* LEVEL + HP / FP / SP */}
          <div className="flex items-center gap-4">

            {/* LEVEL */}
            <div
              className="
                relative
                flex
                h-20
                w-20
                shrink-0
                items-center
                justify-center
                rounded-full
                border-4
                border-blue-600/60
                bg-gradient-to-b
                from-blue-500
                to-indigo-900
                shadow-[0_0_15px_rgba(37,99,235,0.4)]
              "
            >
              <span className="font-mono text-2xl font-black text-white">
                {character.summary?.level ?? 1}
              </span>
            </div>

            {/* HP / FP / SP */}
            <div className="flex-1 space-y-2">

              {/* HP */}
              <div
                className="
                  relative
                  flex
                  h-7
                  items-center
                  overflow-hidden
                  rounded
                  border
                  border-red-900/80
                  bg-neutral-950
                  px-3
                "
              >
                <span
                  className="
                    z-10
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-emerald-600
                    font-mono
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  H
                </span>

                <span
                  className="
                    z-10
                    flex-1
                    text-center
                    font-mono
                    text-xs
                    font-bold
                    tracking-wider
                    text-white
                    drop-shadow
                  "
                >
                  {hp.toLocaleString()} / {maxHp.toLocaleString()}
                </span>

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    bg-gradient-to-r
                    from-red-700
                    to-red-500
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      (hp / maxHp) * 100,
                    )}%`,
                  }}
                />
              </div>

              {/* FP */}
              <div
                className="
                  relative
                  flex
                  h-7
                  items-center
                  overflow-hidden
                  rounded
                  border
                  border-sky-900/80
                  bg-neutral-950
                  px-3
                "
              >
                <span
                  className="
                    z-10
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-600
                    font-mono
                    text-[10px]
                    font-bold
                    text-white
                  "
                >
                  F
                </span>

                <span
                  className="
                    z-10
                    flex-1
                    text-center
                    font-mono
                    text-xs
                    font-bold
                    tracking-wider
                    text-white
                    drop-shadow
                  "
                >
                  {fp.toLocaleString()} / {maxFp.toLocaleString()}
                </span>

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    bg-gradient-to-r
                    from-cyan-600
                    to-blue-500
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      (fp / maxFp) * 100,
                    )}%`,
                  }}
                />
              </div>

              {/* SP */}
              <div
                className="
                  relative
                  flex
                  h-7
                  items-center
                  overflow-hidden
                  rounded
                  border
                  border-amber-900/80
                  bg-neutral-950
                  px-3
                "
              >
                <span
                  className="
                    z-10
                    flex
                    h-4
                    w-4
                    items-center
                    justify-center
                    rounded-full
                    bg-amber-500
                    font-mono
                    text-[10px]
                    font-bold
                    text-black
                  "
                >
                  S
                </span>

                <span
                  className="
                    z-10
                    flex-1
                    text-center
                    font-mono
                    text-xs
                    font-bold
                    tracking-wider
                    text-white
                    drop-shadow
                  "
                >
                  {sp.toLocaleString()} / {maxSp.toLocaleString()}
                </span>

                <div
                  className="
                    absolute
                    inset-y-0
                    left-0
                    bg-gradient-to-r
                    from-amber-600
                    to-yellow-500
                    transition-all
                    duration-300
                  "
                  style={{
                    width: `${Math.min(
                      100,
                      (sp / maxSp) * 100,
                    )}%`,
                  }}
                />
              </div>

            </div>
          </div>

          {/* =====================================================
              PVP STATS
          ===================================================== */}
          <div
            className="
              flex
              rounded-lg
              border
              border-neutral-800
              bg-neutral-900/60
              p-4
            "
          >

            {/* PVP ICON */}
            <div
              className="
                flex
                w-1/3
                items-center
                justify-center
                border-r
                border-neutral-800
                pr-4
              "
            >
              <div
                className="
                  flex
                  h-20
                  w-20
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-red-600/40
                  bg-red-950/20
                  p-2
                "
              >
                <Swords className="h-10 w-10 text-red-500" />
              </div>
            </div>

            {/* PVP DATA */}
            <div
              className="
                w-2/3
                space-y-1.5
                pl-4
                font-mono
                text-xs
              "
            >

              {/* KILL */}
              <div className="flex items-center gap-2 font-bold text-red-400">
                <Swords className="h-3.5 w-3.5" />

                <span>
                  KILL: {character.stats?.killCount ?? 0}
                </span>
              </div>

              {/* DEATH */}
              <div className="flex items-center gap-2 font-bold text-neutral-300">
                <Skull className="h-3.5 w-3.5" />

                <span>
                  DEATH: {character.stats?.deathCount ?? 0}
                </span>
              </div>

              {/* TEMPORARY POINT */}
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1">
                  <Play className="h-2 w-2 fill-red-500 text-red-500" />
                  Temporary Point:
                </span>

                <span className="font-bold text-white">
                  {(character.stats?.temporaryPoint ?? 0).toLocaleString()}
                </span>
              </div>

              {/* CERTAIN POINT */}
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1">
                  <Play className="h-2 w-2 fill-red-500 text-red-500" />
                  Certain Point:
                </span>

                <span className="font-bold text-white">
                  {(character.stats?.certainPoint ?? 0).toLocaleString()}
                </span>
              </div>

              {/* GOLD POINT */}
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1">
                  <Play className="h-2 w-2 fill-red-500 text-red-500" />
                  Gold Point:
                </span>

                <span className="font-bold text-white">
                  {(character.stats?.goldPoint ?? 0).toLocaleString()}
                </span>
              </div>

              {/* CONT POINT VAR */}
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1">
                  <Play className="h-2 w-2 fill-red-500 text-red-500" />
                  Cont. Point variation:
                </span>

                <span className="font-bold text-white">
                  {(character.stats?.contPointVar ?? 0).toLocaleString()}
                </span>
              </div>

              {/* CONT POINT */}
              <div className="flex justify-between text-neutral-300">
                <span className="flex items-center gap-1">
                  <Play className="h-2 w-2 fill-red-500 text-red-500" />
                  Cont. Point:
                </span>

                <span className="font-bold text-white">
                  {(character.stats?.contPoint ?? 0).toLocaleString()}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* =======================================================
            RIGHT SIDE - PAPERDOLL
        ======================================================= */}
        <div
          className="
            flex
            flex-col
            items-center
            justify-center
            rounded-lg
            border
            border-neutral-800
            bg-neutral-900/60
            p-4
            lg:col-span-5
          "
        >

          {/* CHARACTER NAME */}
          <div
            className="
              mb-3
              flex
              items-center
              gap-2
              text-xs
              font-bold
              uppercase
              tracking-wide
              text-neutral-300
            "
          >
            <span className="h-2 w-2 rounded-full bg-sky-400" />

            <span>
              {character.summary?.name || 'CHARACTER'}
            </span>
          </div>

          {/* PAPERDOLL */}
          <div className="grid grid-cols-3 gap-2">

            <div />

            <PaperdollSlot
              item={character.equipment?.helmet}
              label="Helmet"
            />

            <PaperdollSlot
              item={character.equipment?.cloak}
              label="Cloak"
            />

            <PaperdollSlot
              item={character.equipment?.weapon}
              label="Weapon"
            />

            <PaperdollSlot
              item={character.equipment?.upper}
              label="Upper"
            />

            <PaperdollSlot
              item={character.equipment?.shield}
              label="Shield"
            />

            <PaperdollSlot
              item={character.equipment?.gauntlet}
              label="Hands"
            />

            <PaperdollSlot
              item={character.equipment?.lower}
              label="Lower"
            />

            <PaperdollSlot
              item={character.equipment?.shoe}
              label="Shoes"
            />

          </div>

          {/* CURRENCY */}
          <div
            className="
              mt-4
              w-full
              border-t
              border-neutral-800
              pt-2
              text-right
              font-mono
              text-xs
            "
          >
            <p className="font-bold text-neutral-300">
              {(character.summary?.dalant ?? 0).toLocaleString()} CP
            </p>

            <p className="font-bold text-amber-400">
              {(character.summary?.gold ?? 0).toLocaleString()} Gold
            </p>
          </div>

        </div>
      </div>

      {/* =========================================================
          SECTION B - INVENTORY
      ========================================================= */}
      <div
        className="
          space-y-3
          border-t
          border-neutral-800/80
          pt-6
        "
      >

        <h3
          className="
            flex
            items-center
            gap-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-neutral-300
          "
        >
          <Package className="h-4 w-4 text-red-500" />

          Inventory Bags (100 Slots)
        </h3>

        <div className="space-y-3">

          {/* ROW 1 */}
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2].map((bagNum) => (
              <StorageGridContainer
                key={`bag-${bagNum}`}
                title={`Bag ${bagNum}`}
                slots={inventorySlots}
                startSlot={(bagNum - 1) * 20}
              />
            ))}
          </div>

          {/* ROW 2 */}
          <div className="flex flex-wrap justify-center gap-3">
            {[3, 4, 5].map((bagNum) => (
              <StorageGridContainer
                key={`bag-${bagNum}`}
                title={`Bag ${bagNum}`}
                slots={inventorySlots}
                startSlot={(bagNum - 1) * 20}
              />
            ))}
          </div>

        </div>
      </div>

      {/* =========================================================
          SECTION C - BANK
      ========================================================= */}
      <div
        className="
          space-y-3
          border-t
          border-neutral-800/80
          pt-6
        "
      >

        <h3
          className="
            flex
            items-center
            gap-2
            text-xs
            font-bold
            uppercase
            tracking-wider
            text-neutral-300
          "
        >
          <Landmark className="h-4 w-4 text-red-500" />

          Bank Storage (140 Slots)
        </h3>

        <div className="space-y-3">

          {/* ROW 1 */}
          <div className="flex flex-wrap justify-center gap-3">
            {[1, 2, 3].map((bankNum) => (
              <StorageGridContainer
                key={`bank-${bankNum}`}
                title={`Bank ${bankNum}`}
                slots={bankSlots}
                startSlot={(bankNum - 1) * 20}
              />
            ))}
          </div>

          {/* ROW 2 */}
          <div className="flex flex-wrap justify-center gap-3">
            {[4, 5, 6, 7].map((bankNum) => (
              <StorageGridContainer
                key={`bank-${bankNum}`}
                title={`Bank ${bankNum}`}
                slots={bankSlots}
                startSlot={(bankNum - 1) * 20}
              />
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}