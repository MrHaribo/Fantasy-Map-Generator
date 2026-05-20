# Unstable RNG due to Gauss in Sort

## Summary

In the provinces module in the `generate` function in the state loop, `gauss` is called inside the sort function. Since the sort delegate is called for an arbitrary time this leads to a unpredictable rng sequence.

## Problem 

In ``generate``, burgs are originally sorted  by calling the RNG gauss() function directly inside the array comparator: ``.sort((a, b) => b.population * gauss(...) - a.population)``. Because sorting algorithms (like Quicksort or Timsort) call the comparator an unpredictable number of times depending on the specific browser engine and the array's initial memory state, the RNG sequence was advanced randomly. This completely broke seed reproducibility across different browsers and platforms.

## Code

modules\provinces-generator.js - line 51

```
      const stateBurgs = burgs
        .filter(b => b.state === s.i && !b.removed && !provinceIds[b.cell])
        .sort((a, b) => b.population * gauss(1, 0.2, 0.5, 1.5, 3) - a.population)
        .sort((a, b) => b.capital - a.capital);
```

## Suggestion

Filter the burg list first and map the list calling the gauss exactly once per burg. Sort the result afterwards.

```
      // 1. Filter the valid burgs
      let stateBurgs = burgs.filter(b => b.state === s.i && !b.removed && !provinceIds[b.cell]);

      // 2. Pre-calculate the score so RNG is rolled strictly once per burg
      stateBurgs = stateBurgs.map(b => ({
        burg: b,
        score: b.population * gauss(1, 0.2, 0.5, 1.5, 3)
      }));

      // 3. Sort purely by the static score, then by capital, and unwrap
      stateBurgs = stateBurgs
        .sort((a, b) => b.score - a.score)
        .map(item => item.burg)
        .sort((a, b) => b.capital - a.capital);
```