# Merge Routes > 1  Early-Termination

## Summary

In the routes module in the `mergeRoutes()` function there is a hidden bug in the recursion that exits the algorithm early leading to route line fragmentations.

## Problem

The `mergeRoutes` function uses a recursive approach. It loops through all the routes, merges everything it can find in that single pass, and keeps a tally of how many successful merges happened (`routesMerged`).

If merges happened, it means the shape of the routes changed, which might have created new opportunities for merges that were missed earlier in the loop. Therefore, it calls itself again (`mergeRoutes(routes)`) to do another pass.

The bug is the condition `routesMerged > 1`.

If the loop runs and performs exactly one merge, routesMerged will equal `1`. The code then evaluates `1 > 1`, which is false. The function abruptly terminates and returns the routes, completely skipping the recursive check.
A Concrete Example

Imagine you have three fragmented route segments that need to form one single road ``[1, 2, 3, 4]``. Because of how they were generated, they are out of order in the array:

- Route A: [1, 2]
- Route B: [3, 4]
- Route C: [2, 3]

Pass 1:

- The loop looks at Route A [1, 2]. It compares it to Route B [3, 4]. No match.
- It compares Route A to Route C [2, 3]. Match!
- Route A absorbs C and becomes [1, 2, 3]. Route C is marked as merged.
- routesMerged goes up to 1.
- The loop moves to Route B [3, 4]. It compares it to C, but C is already merged. Loop ends.

At the end of Pass 1, ``routesMerged`` is exactly 1.
Our routes are now Route A ``[1, 2, 3]`` and Route B ``[3, 4]``.

Because ``1 > 1`` is false, the function terminates. Route A and Route B never get merged into ``[1, 2, 3, 4]``, even though they perfectly connect! They remain permanently fragmented in the background data.

## Code

modules\routes-generator.js - line 162

```
   // merge routes so that the last cell of one route is the first cell of the next route
    function mergeRoutes(routes) {
      let routesMerged = 0;

      for (let i = 0; i < routes.length; i++) {
        const thisRoute = routes[i];
        if (thisRoute.merged) continue;

        for (let j = i + 1; j < routes.length; j++) {
          const nextRoute = routes[j];
          if (nextRoute.merged) continue;

          if (nextRoute.cells.at(0) === thisRoute.cells.at(-1)) {
            routesMerged++;
            thisRoute.cells = thisRoute.cells.concat(nextRoute.cells.slice(1));
            nextRoute.merged = true;
          }
        }
      }

      return routesMerged > 1 ? mergeRoutes(routes) : routes;
    }
```

## Suggestion

To fix this, the recursion simply needs to trigger as long as any merge happened (meaning routesMerged is greater than 0).

`return routesMerged > 0 ? mergeRoutes(routes) : routes;`