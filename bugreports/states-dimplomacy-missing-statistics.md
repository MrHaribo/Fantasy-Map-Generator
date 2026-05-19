# States Dimplomacy Missing Statistics "NaN"

## Summary

In the states module, the `generateDiplomacy()` function tries to access the *state area* that is only later calculated in the `collectStatistics()` method, leading to NaN for the area and the respective code behaves unpredictable.

## Problem

In JavaScript, variables that are declared but not assigned a value are undefined. If you try to perform math on undefined, JavaScript doesn't throw an error—it silently evaluates to NaN (Not a Number).

In the state generation pipeline, the main `generateStates()` function looks like this:

```
pack.states = createStates(); // State objects are created, but 'area' is not initialized
expandStates();
normalize();
getPoles();
findNeighbors();
assignColors();
generateCampaigns();
generateDiplomacy();          // Math is performed using state.area
```

Notice what is missing? `collectStatistics()` is never called in this sequence! It is called much later in the global map generation pipeline.

```
    Burgs.generate();
    States.generate();
    Routes.generate();
    Religions.generate();

    Burgs.specify();
    States.collectStatistics();
    States.defineStateForms();
```

Because `collectStatistics()` calculates the area and population for the states, during `generateDiplomacy()`, state.area is undefined.

This triggers a catastrophic, silent cascade of NaN values:

```
    d3.mean(valid.map(s => s.area)) //evaluates to undefined.
    ap = states[attacker].area * states[attacker].expansionism //evaluates to NaN.
    dp += states[d].area * states[d].expansionism //evaluates to NaN.
```

The Consequence: Any mathematical comparison involving NaN (e.g., NaN > 5, NaN < NaN, NaN == NaN) strictly evaluates to false. This means massive chunks of the generateDiplomacy algorithm are essentially dead code:

- Defenders will never break defense pacts out of fear (ap / dp > 2 is false).
- Attackers will never abort an attack because the defender is too strong (ap < dp * gauss(...) is false).
- Vassalage assignments based on size disparity (area / area > 2) will never trigger.

## Code

modules\states-generator.js - line 286 and folloing

## Suggestion

Calculate the state area prior to diplomacy resolution.

