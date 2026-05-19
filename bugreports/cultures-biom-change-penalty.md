# The Biome Change Penalty 

## Summary

In the culture module in the `expand()` function, the `biomeChangeCost` evaluation is compared to itself, so the penatily is never applied.

## Problem

In expand, the penalty for crossing into a new biome is calculates with `const biomeChangeCost = biome === cells.biome[neibCellId] ? 0 : 20;`. However, on the line immediately preceding it, biome is defined as `cells.biome[neibCellId]`. It is comparing the value to itself, meaning the condition is always true, and the 20-point penalty is never applied.

## Code

modules\cultures-generator.js - line 554-556

```
cells.c[cellId].forEach(neibCellId => {
        if (hasLocked) {
          const neibCultureId = cells.culture[neibCellId];
          if (neibCultureId && cultures[neibCultureId].lock) return; // do not overwrite cell of locked culture
        }

        const biome = cells.biome[neibCellId];
        const biomeCost = getBiomeCost(cultureId, biome, type);
        const biomeChangeCost = biome === cells.biome[neibCellId] ? 0 : 20; // penalty on biome change
        const heightCost = getHeightCost(neibCellId, cells.h[neibCellId], type);
        const riverCost = getRiverCost(cells.r[neibCellId], neibCellId, type);
        const typeCost = getTypeCost(cells.t[neibCellId], type);

        const cellCost = (biomeCost + biomeChangeCost + heightCost + riverCost + typeCost) / expansionism;
        const totalCost = priority + cellCost;

```

## Suggestion

Move the biom assignment `const biome = cells.biome[neibCellId];` outside the neighbor loop and use `cellId`.