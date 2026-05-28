import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---
export interface PackProbe {
  X: number;
  Y: number;
  ExpectedIndex: number;
}

export interface PackPoint {
  X: number;
  Y: number;
}

export interface PackRegressionData {
  Points: PackPoint[];
  GridMapping: number[];
  Heights: number[];
  Areas: number[];
  Probes: PackProbe[];
}

// --- DUMP FUNCTION ---
export const dumpPackData = async (collector: DumpCollector) => {
  // 1. Run the sequence exactly up to ReGraph
  await executeGenerationSequence(GenerationStep.ReGraph);

  const pack = globalThis.pack;
  const graphWidth = globalThis.graphWidth;
  const graphHeight = globalThis.graphHeight;

  // 2. Generate Probes for Quadtree Testing
  // We use fixed percentage positions to ensure the probes work regardless of the resolution
  const rawProbes = [
    { x: graphWidth / 2, y: graphHeight / 2 },
    { x: graphWidth * 0.2, y: graphHeight * 0.2 },
    { x: graphWidth * 0.8, y: graphHeight * 0.8 }
  ];

  const probeResults = rawProbes.map(p => {
    const foundIndex = window.findCell(p.x, p.y, Infinity, pack);
    const index = foundIndex !== undefined ? foundIndex : -1;
    return { X: p.x, Y: p.y, ExpectedIndex: index };
  });

  // 3. Build the exact data structure C# expects
  const data: PackRegressionData = {
    Points: Array.from(pack.cells.p).map((pt: any) => ({ X: pt[0], Y: pt[1] })),
    GridMapping: Array.from(pack.cells.g),
    Heights: Array.from(pack.cells.h),
    Areas: Array.from(pack.cells.area),
    Probes: probeResults
  };

  // 4. Capture the Snapshot
  collector.capture("pack_regression.json", data);
};
