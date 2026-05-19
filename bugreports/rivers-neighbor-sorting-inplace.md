# In-Place River Cell Neighborhood Sorting Side-Effect

## Summary

In the rivers module in `drainWater` the neighbor array of cells is sorted in place to find the neighbor with the lowest hight. This leads to a side-effect leaving the cells sorted in a different order for following steps.

## Problem

In `drainWater`, the lowest neighbor is found using `min = cells.c[i].sort((a, b) => h[a] - h[b])[0];`. Because JavaScript's .sort() method sorts arrays in-place, this permanently mutates the grid's neighbor list. The physical, geographic winding order of the Voronoi edges for that cell is destroyed and replaced with a height-based order. Any downstream logic expecting sequential polygon edges will receive scrambled data.

This leads to the data be in an unexpected state, since cells that ar not havens or lake outlets are sorted. This makes it difficult to maintain regression tests, since the original array has to be sorted at this exact place.

## Code

modules\river-generator.js - line 95

```
min = cells.c[i].sort((a, b) => h[a] - h[b])[0];
```

## Suggestion

Find the minimum hight of the river cell neighbors using a method that does not change the original data and is equivalent in performance:

- Use simple for loop to find the minimum
- Use toSorted() to make a sorted copy (slower and has a memory overhead)
- Use reduce()
- Any other equivalent minimum deduction