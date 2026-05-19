# State Ally Vassals Added to DP instead of AP 

## Summary

In the state module during `generateDiplomacy()` the ally vassals points are added to `dp` instead of `ap`.

## Problem

In the Attacker Allies loop, when an ally's vassal joins the war, it is accidentally written `dp += states[v].area * states[v].expansionism` instead of `ap += ....` This adds the attacker's vassal's power to the defender's total power!

## Code

modules\states-generator.js - line 457

```
ap += states[d].area * states[d].expansionism;
war.push(`${an}'s ally ${name} joined the war on attackers side`);

// ally vassals join
states[d].diplomacy
    .map((r, d) => (r === "Suzerain" ? d : 0))
    .filter(d => d)
    .forEach(v => {
    attackers.push(v);
    dp += states[v].area * states[v].expansionism; // dp instead of ap
    war.push(`${states[d].name}'s vassal ${states[v].name} joined the war on attackers side`);
});
```

## Suggestion

Add the vassals power to ap instead of dp