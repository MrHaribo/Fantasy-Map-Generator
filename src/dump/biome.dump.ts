import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface CellBiomeEntry {
  Index: number;
  BiomeId: number;
  Temperature: number;
  Precipitation: number;
  Moisture: number;
}

export interface BiomeRegressionData {
  CellCount: number;
  Cells: CellBiomeEntry[];
}

// --- DUMP FUNCTION ---

export const dumpBiomeData = async (collector: DumpCollector) => {
  // 1. Run the sequence exactly up to Biome Definition
  await executeGenerationSequence(GenerationStep.BiomesDefine);

  const pack = globalThis.pack;
  const grid = globalThis.grid;

  const { cells } = pack;
  const { temp, prec } = grid.cells;
  const gridRef = cells.g;

  // Replicating FMG's internal moisture calculation
  // We use a standard array reduce for the mean to avoid relying on the global d3 object
  const calculateMoisture = (i: number) => {
    let moisture = prec[gridRef[i]];
    if (cells.r[i]) moisture += Math.max(cells.fl[i] / 10, 2); // River flux bonus

    const moistAround = cells.c[i]
      .filter((n: number) => cells.h[n] >= 20) // Only land neighbors
      .map((n: number) => prec[gridRef[n]])
      .concat([moisture]);

    const mean = moistAround.reduce((sum: number, val: number) => sum + val, 0) / moistAround.length;
    return Math.round(4 + mean);
  };

  // 2. Map Data to PascalCase expectations
  const cellLength = cells.i.length;
  const cellData: CellBiomeEntry[] = new Array(cellLength);

  for (let i = 0; i < cellLength; i++) {
    // Water cells have 0 moisture, land cells calculate it
    const moisture = cells.h[i] < 20 ? 0 : calculateMoisture(i);

    cellData[i] = {
      Index: i,
      BiomeId: cells.biome[i],
      Temperature: temp[gridRef[i]],
      Precipitation: prec[gridRef[i]],
      Moisture: moisture
    };
  }

  const data: BiomeRegressionData = {
    CellCount: cellLength,
    Cells: cellData
  };

  collector.capture("biome_regression.json", data);
};
