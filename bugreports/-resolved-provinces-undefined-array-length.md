# Undefined > 2 Province Shape Justification Bug

## Summary

In the province generation module, the shape justification algorithm fails to check if a province cell has too many friendly neighbors because it mistakenly checks the ``.length`` property of an integer, evaluating to ``undefined`` and completely bypassing the guard clause.

## Problem

During the "justify provinces shapes a bit" loop, the algorithm tries to prevent jagged or unnatural province borders by verifying if a cell already has too many friendly neighbors (buddies).

The code defines ``buddies`` by filtering the neighbor array and immediately grabbing its ``.length``, resulting in a numeric integer:
``const buddies = neibs.filter(c => c === provinceIds[i]).length;``

Immediately after, the code attempts to evaluate this guard clause:
``if (buddies.length > 2) continue;``

Because ``buddies`` is already a number, calling ``.length`` on it returns ``undefined``. In JavaScript, the expression ``undefined > 2`` evaluates to ``false``. As a result, this condition never triggers. The shape justification proceeds regardless of how many friendly neighbors the cell has, effectively disabling this specific border-smoothing mechanic entirely.

## Code

modules\provinces-generator.js - line 138 - generate()

```
      const adversaries = neibs.filter(c => c !== provinceIds[i]);
      if (adversaries.length < 2) continue;

      const buddies = neibs.filter(c => c === provinceIds[i]).length;
      if (buddies.length > 2) continue; // <--- THE BUG IS HERE

      const competitors = adversaries.map(p => adversaries.reduce((s, v) => (v === p ? s + 1 : s), 0));
```

## Suggestion

Remove the erroneous ``.length`` property from the buddies assignment so it compares the integer directly.

```
const buddies = neibs.filter(c => c === provinceIds[i]);
if (buddies.length > 2) continue;
```

## IS RESOLVED