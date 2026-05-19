# Delaunay Route Graph 2-Burg Island Bug

## Summary

Generating the delaunay graph for an island with 2 capitals is impossible since at least 3 points are required to for a valid triangle. The math breaks and the error leads to no road beeing created between the capitals.

## Problem

To figure out which capitals should be connected by roads, a Delaunay triangulation is computed and the longest edge of each triangle is removed to create an Urquhart graph. However, Delaunay math requires at least 3 points to form a triangle. If an isolated island has exactly 2 capitals on it, the JS engine silently swallows the error and draws zero roads between them. 

This leads to unpredictable behavior this failure needs to be explicitly replicated to preserve regression parity!

# Code

modules\routes-generator.js - line 325

```
function calculateUrquhartEdges(points) {
    const score = (p0, p1) => dist2(points[p0], points[p1]);

    const {halfedges, triangles} = Delaunator.from(points);
    ...
}
```

# Suggestion

Introduce a condition for the 2 capital special case and return from the `calculateUrquhartEdges` function with an early-out. 