import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface ExpectedBurg {
  Id: number;
  Name: string;
  Culture: number;
  Capital: boolean;
  State: number;
  Cell: number;
  X: number;
  Y: number;
  Port: number;
}

export interface RegressionBurgData {
  Seed: string;
  CellsCount: number;
  BurgMap: number[];
  Burgs: ExpectedBurg[];
}

export interface ExpectedBurgSpec {
  Id: number;
  Population: number;
  Type: string;
  Group: string;
  Citadel: number;
  Plaza: number;
  Walls: number;
  Shanty: number;
  Temple: number;
}

export interface RegressionBurgSpecData {
  Seed: string;
  Burgs: ExpectedBurgSpec[];
}

// --- DUMP FUNCTIONS ---

export const dumpBurgData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.BurgsGenerate);
  const pack = globalThis.pack;

  // NO FALLBACKS: We filter out index 0 (the empty/null burg in FMG)
  const burgs: ExpectedBurg[] = pack.burgs
    .filter((b: any) => b && b.i)
    .map((b: any) => ({
      Id: b.i,
      Name: b.name,
      Culture: b.culture,
      Capital: !!b.capital, // Cast to boolean for C#
      State: b.state,
      Cell: b.cell,
      X: b.x,
      Y: b.y,
      Port: b.port
    }));

  const data: RegressionBurgData = {
    Seed: globalThis.seed,
    CellsCount: pack.cells.i.length,
    BurgMap: Array.from(pack.cells.burg as Uint16Array),
    Burgs: burgs
  };

  collector.capture(`burgs_regression.json`, data);
};

export const dumpBurgSpecData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.BurgsSpecify);

  const pack = globalThis.pack;

  const burgsSpec: ExpectedBurgSpec[] = pack.burgs
    .filter((b: any) => b && b.i)
    .map((b: any) => ({
      Id: b.i,
      Population: b.population,
      Type: b.type,
      Group: b.group,
      Citadel: b.citadel,
      Plaza: b.plaza,
      Walls: b.walls,
      Shanty: b.shanty,
      Temple: b.temple
    }));

  const data: RegressionBurgSpecData = {
    Seed: globalThis.seed,
    Burgs: burgsSpec
  };

  collector.capture("burgs_spec_regression.json", data);
};
