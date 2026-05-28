import Alea from "alea";
import type { DumpCollector } from "./dump.collector.ts";

// --- INTERFACES ---

export interface NamesRegressionData {
  Seed: string;
  RngCheck: number[];
  GetBase: string[];
  GetBaseShort: string[];
  GetState: string[];
  GetMapName: string[];
}

// --- DUMP FUNCTION ---

export const dumpNameData = async (collector: DumpCollector) => {
  const localSeed = "42";

  // Fix: Use localSeed instead of the global seed variable
  Math.random = Alea(localSeed);

  const data: NamesRegressionData = {
    Seed: localSeed,
    RngCheck: [],
    GetBase: [],
    GetBaseShort: [],
    GetState: [],
    GetMapName: []
  };

  // 0. RNG Sync Check
  for (let i = 0; i < 3; i++) {
    data.RngCheck.push(Math.random());
  }

  // 1. GetBase
  const baseParams: [number, number, number, string][] = [
    [0, 5, 10, ""],
    [1, 5, 10, ""],
    [18, 4, 8, ""]
  ];

  baseParams.forEach(p => {
    for (let i = 0; i < 5; i++) {
      data.GetBase.push(Names.getBase(p[0], p[1], p[2], p[3]));
    }
  });

  // 2. GetBaseShort
  [0, 1, 12, 18].forEach(id => {
    for (let i = 0; i < 3; i++) {
      data.GetBaseShort.push(Names.getBaseShort(id));
    }
  });

  // 3. GetState
  const stateInputs = [
    { n: "Berlin", id: 0 },
    { n: "Paris", id: 2 },
    { n: "Kyoto", id: 12 },
    { n: "Cairo", id: 18 }
  ];

  stateInputs.forEach(input => {
    for (let i = 0; i < 3; i++) {
      // Fix: Bypass TS strict type checking with `as any`
      data.GetState.push(Names.getState(input.n, undefined as any, input.id));
    }
  });

  // 4. GetMapName (Replicating exact JS logic)
  for (let i = 0; i < 5; i++) {
    const base =
      Math.random() < 0.7 ? 2 : Math.random() < 0.5 ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 32);
    const min = nameBases[base].min - 1;
    const max = Math.max(nameBases[base].max - 3, min);
    const baseName = Names.getBase(base, min, max, "");

    let n = baseName;
    const isSuffix = Math.random() < 0.7;
    if (isSuffix) {
      const suffix = Math.random() < 0.8 ? "ia" : "land";
      if (suffix === "ia" && n.length > 6) n = n.slice(0, -(n.length - 3));
      else if (suffix === "land" && n.length > 6) n = n.slice(0, -(n.length - 5));

      // Fix: Bypass TS private visibility modifier with `(Names as any)`
      data.GetMapName.push((Names as any).validateSuffix ? (Names as any).validateSuffix(n, suffix) : n + suffix);
    } else {
      data.GetMapName.push(baseName);
    }
  }

  collector.capture("names_regression.json", data);
};
