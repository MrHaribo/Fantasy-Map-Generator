import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface CultureJson {
  Id: number;
  Name: string;
  Code: string;
  Color: string;
  Center: number;
  Base: number;
  Type: string;
  Expansionism: number;
  Shield: string;
}

export interface RegressionCulturesData {
  Cultures: CultureJson[];
  Cells_Culture: number[];
}

export interface CultureMetadata {
  Id: number;
  Name: string;
  Type: string;
  Center: number;
  Expansionism: number;
}

export interface RegressionExpansionData {
  Seed: string;
  CellsCount: number;
  CultureMap: number[];
  Cultures: CultureMetadata[];
}

// --- DUMP FUNCTIONS ---

export const dumpCultureData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.CulturesGenerate);
  const pack = globalThis.pack;

  const cultures: CultureJson[] = pack.cultures
    .filter((c: any) => c)
    .map((c: any) => ({
      Id: c.i,
      Name: c.name,
      Code: c.code,
      Color: c.color,
      Center: c.center,
      Base: c.base,
      Type: c.type,
      Expansionism: c.expansionism,
      Shield: c.shield
    }));

  const data: RegressionCulturesData = {
    Cultures: cultures,
    Cells_Culture: Array.from(pack.cells.culture as Uint16Array)
  };

  collector.capture(`cultures_regression.json`, data);
};

export const dumpCultureExpansionData = async (collector: DumpCollector) => {
  // 1. Run the sequence completely through the culture expansion phase
  await executeGenerationSequence(GenerationStep.CulturesExpand);
  const pack = globalThis.pack;

  // NO FALLBACKS.
  const culturesMeta: CultureMetadata[] = pack.cultures
    .filter((c: any) => c)
    .map((c: any) => ({
      Id: c.i,
      Name: c.name,
      Type: c.type,
      Center: c.center,
      Expansionism: c.expansionism
    }));

  const data: RegressionExpansionData = {
    Seed: globalThis.seed,
    CellsCount: pack.cells.i.length,
    CultureMap: Array.from(pack.cells.culture as Uint16Array),
    Cultures: culturesMeta
  };

  collector.capture("cultures_expansion_regression.json", data);
};
