import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---
export interface GridFeatureRegressionItem {
  i: number;
  type: string;
  land: boolean;
}

export interface GridFeatureRegressionData {
  CellFeatures: number[];
  CellDistances: number[];
  Features: GridFeatureRegressionItem[];
}

export interface PackFeatureRegressionItem {
  Id: number;
  Type: string;
  IsLand: boolean;
  IsBorder: boolean;
  CellsCount: number;
  FirstCell: number;
  Vertices: number[];
  Area: number;
  Height: number;
  ShorelineCells: number[];
}

export interface PackFeatureRegressionData {
  CellFeatures: number[];
  CellDistances: number[];
  CellHavens: number[];
  CellHarbors: number[];
  Features: PackFeatureRegressionItem[];
}

export interface FeatureGroupEntry {
  Id: number;
  Type: string;
  Group: string;
  Cells: number;
  Height: number;
  Temp: number;
}

export interface FeatureGroupRegressionData {
  Seed: string;
  Features: FeatureGroupEntry[];
}

export interface CellRankRegressionData {
  Seed: string;
  Suitability: number[];
  Population: number[];
}

// --- DUMP FUNCTION ---
export const dumpGridFeatureData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.FeaturesMarkupGrid);

  // 1. Extract and map the features array
  const validFeatures = globalThis.grid.features
    .filter((f: any) => f)
    .map((f: any) => ({
      i: f.i,
      type: f.type.toLowerCase(),
      land: f.land
    }));

  // 2. Build the exact data structure C# expects
  const featureData: GridFeatureRegressionData = {
    CellFeatures: Array.from(globalThis.grid.cells.f),
    CellDistances: Array.from(globalThis.grid.cells.t),
    Features: validFeatures
  };

  // 3. Send it to the ZIP collector
  collector.capture("feature_grid_regression.json", featureData);
};

export const dumpPackFeatureData = async (collector: DumpCollector) => {
  // 1. Run up to Features.markupPack()
  await executeGenerationSequence(GenerationStep.FeaturesMarkupPack);

  const pack = globalThis.pack;

  // 2. Map the data to our clean PascalCase interface
  const features: PackFeatureRegressionItem[] = pack.features
    .filter((f: any) => f)
    .map((f: any) => ({
      Id: f.i,
      Type: f.type,
      IsLand: f.land,
      IsBorder: f.border,
      CellsCount: f.cells,
      FirstCell: f.firstCell,
      Vertices: f.vertices || [],
      Area: f.area,
      Height: f.height,
      ShorelineCells: f.shoreline || []
    }));

  const data: PackFeatureRegressionData = {
    CellFeatures: Array.from(pack.cells.f),
    CellDistances: Array.from(pack.cells.t),
    CellHavens: Array.from(pack.cells.haven || []),
    CellHarbors: Array.from(pack.cells.harbor || []),
    Features: features
  };

  collector.capture("feature_pack_regression.json", data);
};

export const dumpFeatureGroupsData = async (collector: DumpCollector) => {
  // 1. Run up to Features.defineGroups()
  await executeGenerationSequence(GenerationStep.FeaturesDefineGroups);

  const pack = globalThis.pack;

  if (!pack?.features) {
    console.error("DEBUG: pack.features is undefined! Feature Groups dump aborted.");
    return;
  }

  const features: FeatureGroupEntry[] = pack.features
    .filter((f: any) => f)
    .map((f: any) => ({
      Id: f.i,
      Type: f.type,
      Group: f.group,
      Cells: f.cells,
      Height: f.height,
      Temp: f.temp
    }));

  const data: FeatureGroupRegressionData = {
    Seed: globalThis.seed,
    Features: features
  };

  collector.capture("feature_groups_regression.json", data);
};

export const dumpCellRankData = async (collector: DumpCollector) => {
  // 1. Run up to rankCells()
  await executeGenerationSequence(GenerationStep.RankCells);

  const pack = globalThis.pack;

  if (!pack?.cells?.s || !pack?.cells?.pop) {
    console.error("DEBUG: Suitability or Population data missing! Cell Rank dump aborted.");
    return;
  }

  const data: CellRankRegressionData = {
    Seed: globalThis.seed,
    Suitability: Array.from(pack.cells.s),
    Population: Array.from(pack.cells.pop)
  };

  collector.capture("feature_cell_ranks_regression.json", data);
};
