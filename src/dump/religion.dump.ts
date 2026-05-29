import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface RegressionReligion {
  Id: number;
  Name: string;
  Color: string;
  CultureId: number;
  Type: string;
  Form: string;
  Deity: string | null;
  Expansion: string;
  Expansionism: number;
  CenterCell: number;
  CellsCount: number;
  TotalArea: number;
  RuralPopulation: number;
  UrbanPopulation: number;
  Origins: number[];
  Code: string;
}

export interface RegressionReligionsData {
  Religions: RegressionReligion[];
  Cells_Religion: number[];
}

// --- DUMP FUNCTION ---

export const dumpReligionData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.ReligionsGenerate);
  const pack = globalThis.pack;

  // Map to the typed RegressionReligion interface
  const religions: RegressionReligion[] = pack.religions
    .filter((r: any) => r && !r.removed)
    .map((r: any) => ({
      Id: r.i,
      Name: r.name,
      Color: r.color,
      CultureId: r.culture,
      Type: r.type,
      Form: r.form,
      Deity: r.deity,
      Expansion: r.expansion,
      Expansionism: r.expansionism,
      CenterCell: r.center,
      CellsCount: r.cells,
      TotalArea: r.area,
      RuralPopulation: r.rural,
      UrbanPopulation: r.urban,
      Origins: r.origins || [],
      Code: r.code
    }));

  const data: RegressionReligionsData = {
    Religions: religions,
    Cells_Religion: Array.from(pack.cells.religion as Uint16Array)
  };

  collector.capture("religions_regression.json", data);
};