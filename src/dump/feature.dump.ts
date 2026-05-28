import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---
export interface FeatureRegressionItem {
  i: number;
  type: string;
  land: boolean;
}

export interface GridFeatureRegressionData {
  CellFeatures: number[];
  CellDistances: number[];
  Features: FeatureRegressionItem[];
}

// --- DUMP FUNCTION ---
export const dumpFeatureData = async (collector: DumpCollector) => {

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
