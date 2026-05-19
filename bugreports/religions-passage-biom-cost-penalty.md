# Summary

In the religions module, the ``getPassageCost`` function inside ``expandReligions`` fails to calculate or apply a penalty when a religion crosses from one biome into a different biome.

## Problem

When a religion expands, ``getPassageCost`` calculates the terrain cost using ``const biomePassageCost = biomesData.cost[cells.biome[nextCellId]];``. It correctly fetches the base movement cost for the neighbor cell's biome.

However, it completely fails to compare the neighbor cell's biome to the current cell's biome (cellId). In other expansion algorithms (like cultures), crossing a biome boundary incurs a flat penalty (usually +20). Because this comparison is missing, religions spread across drastically different biomes (e.g., from Grassland directly into Tundra or Desert) much easier than they structurally should, ignoring ecological borders.

## Code

modules\religions-generator.js - line 742 - expandReligions() -> getPassageCost()

```
    function getPassageCost(cellId, nextCellId) {
      const route = Routes.getRoute(cellId, nextCellId);
      if (isWater(cellId)) return route ? 50 : 500;

      const biomePassageCost = biomesData.cost[cells.biome[nextCellId]];

      if (route) {
        if (route.group === "roads") return 1;
        return biomePassageCost / 3; // trails and other routes
      }

      return biomePassageCost;
    }
```

## Suggestion

Introduce a check to see if the biome is changing, and apply a penalty to the passage cost if true, similar to how it is handled in culture expansion.

```
function getPassageCost(cellId, nextCellId) {
      const route = Routes.getRoute(cellId, nextCellId);
      if (isWater(cellId)) return route ? 50 : 500;

      const baseBiomeCost = biomesData.cost[cells.biome[nextCellId]];
      const biomeChangeCost = cells.biome[cellId] === cells.biome[nextCellId] ? 0 : 20; 
      
      const biomePassageCost = baseBiomeCost + biomeChangeCost;

      // ... rest of the function remains the same
}
```


