# Highlander Brigand Typo

## Summary

In the marker generation module, the ``addBrigands`` function mistakenly queries the cell's coordinate points (``cells.p``) instead of its elevation (``cells.h``), completely disabling the "highlander" brigand locality.

## Problem

When determining the flavor text for a brigand gang based on their spawn location, the code attempts to extract the cell's height using ``const height = cells.p[cell];``.

However, ``cells.p`` contains the ``[x, y]`` coordinates of the cell, not the elevation. When the code evaluates ``if (height >= 70) return "highlander";``, it is comparing an array to a number, which evaluates to false. Consequently, mountain-dwelling brigands are never properly categorized as "highlanders".

## Code

modules\markers-generator.js - line 855 - addBrigands()

```
    const culture = cells.culture[cell];
    const biome = cells.biome[cell];
    const height = cells.p[cell]; // <--- THE BUG IS HERE

    const locality = ((height, biome) => {
      if (height >= 70) return "highlander";
      ...
    }
```

## Suggestion

Change ``cells.p`` to ``cells.h`` so the logic checks the actual elevation value.

```
const height = cells.h[cell];
```