import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface ExpectedPoint {
  X: number;
  Y: number;
}

export interface ExpectedProvince {
  Id: number;
  State: number;
  Center: number;
  Burg: number;
  Name: string;
  FormName: string;
  FullName: string;
  Color: string;
  Pole: ExpectedPoint;
}

export interface RegressionProvincesData {
  Provinces: ExpectedProvince[];
  CellProvinces: number[];
}

// --- DUMP FUNCTION ---

export const dumpProvincesData = async (collector: DumpCollector) => {
  // Advance to the end of the province generation pipeline
  await executeGenerationSequence(GenerationStep.ProvincesGetPoles);
  const pack = globalThis.pack;

  const provinces: ExpectedProvince[] = pack.provinces
    .filter((p: any) => p && p.i && !p.removed)
    .map((p: any) => ({
      Id: p.i,
      State: p.state,
      Center: p.center,
      Burg: p.burg,
      Name: p.name,
      FormName: p.formName,
      FullName: p.fullName,
      Color: p.color,
      Pole: { X: p.pole[0], Y: p.pole[1] }
    }));

  const data: RegressionProvincesData = {
    Provinces: provinces,
    CellProvinces: Array.from(pack.cells.province as Uint16Array)
  };

  collector.capture("provinces_regression.json", data);
};