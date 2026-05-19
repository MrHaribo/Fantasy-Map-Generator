# In-Place Shoreline Sorting Side-Effect

## Summary

In the lakes module in `detectCloseLakes` the lakes shoreline cells are sorted in place which leads to a side effect that the leaves the cells sorted for proceeding steps in the algorithm.

## Problem

To quickly find the lowest point of the lake (the outlet), JS calls `feature.shoreline.sort((a, b) => h[a] - h[b])[0]`. This sorts the array in-place, meaning the geographic order of the shoreline cells (which represents the physical boundary of the polygon) is permanently scrambled and replaced with a height-based order.

This leads to the data be in an unexpected state, since the lakes are sorted and other features are not. This makes it difficult to maintain regression tests, since the original array has to be sorted at this exact place.

## Code

modules\lakes.js - line 22

```
const lowestShorelineCell = feature.shoreline.sort((a, b) => h[a] - h[b])[0];
```

## Suggestion

Find the minimum hight of the shoreline cells using a method that does not change the original data and is equivalent in performance:

- Use simple for loop to find the minimum
- Use toSorted() to make a sorted copy (slower and has a memory overhead)
- Use reduce()
- Any other equivalent minimum deduction