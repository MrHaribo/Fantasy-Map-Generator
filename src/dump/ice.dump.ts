import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface PointDTO {
  X: number;
  Y: number;
}

export interface IceRegressionItem {
  Id: number;
  Type: string;
  CellId: number | null;
  Size: number | null;
  Points: PointDTO[];
}

export interface IceRegressionData {
  Seed: string;
  IceElements: IceRegressionItem[];
}

// --- DUMP FUNCTION ---

export const dumpIceData = async (collector: DumpCollector) => {
  // Run the sequence up to Ice generation
  await executeGenerationSequence(GenerationStep.IceGenerate);

  const pack = globalThis.pack;

  // Map JS array format [x,y] to C# DTO format { X, Y }
  const iceElements: IceRegressionItem[] = pack.ice.map((ice: any) => ({
    Id: ice.i,
    Type: ice.type,
    // Provide null fallback for Glaciers, which don't use cellId or size
    CellId: ice.cellId ?? null,
    Size: ice.size ?? null,
    Points: ice.points.map((p: number[]) => ({ X: p[0], Y: p[1] }))
  }));

  const data: IceRegressionData = {
    Seed: globalThis.seed,
    IceElements: iceElements
  };

  collector.capture("ice_regression.json", data);
};