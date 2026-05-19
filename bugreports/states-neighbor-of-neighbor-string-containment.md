# States Neighbor of Neighbor String Containment False-Positive

## Summary

In the states module during `generateDiplomacy()` the `neibOfNeib` evaluation is always true due to string concatination.

## Problem

To check if a state is a neighbor-of-a-neighbor, JS does `states[f].neighbors.map(n => states[n].neighbors).join("").includes(t)`. Because it joins arrays into a flat string (e.g., [12, 34] becomes "1234"), checking if it `.includes(2)` will return true because "2" is inside "1234". It creates false-positive diplomatic relationships.

## Code

modules\states-generator.js - line 336

```
const neibOfNeib =
          naval || neib
            ? false
            : states[f].neighbors
                .map(n => states[n].neighbors)
                .join("")
                .includes(t);

        let status = naval ? rw(navals) : neib ? rw(neibs) : neibOfNeib ? rw(neibsOfNeibs) : rw(far);        
```

## Suggestion

Introduce a solid neighbor of neighbor query.
