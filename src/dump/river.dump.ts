import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface CellHydrologyEntry {
  Index: number;
  RiverId: number;
  Confluence: number;
  Height: number;
  Flux: number;
}

export interface RiverEntry {
  Id: number;
  Parent: number;
  Source: number;
  Mouth: number;
  Discharge: number;
  Length: number;
  Width: number;
  WidthFactor: number;
  SourceWidth: number;
  CellCount: number;
  CellSample: number[];
}

export interface RiverRegressionData {
  RiverCount: number;
  ConfluenceCount: number;
  Rivers: RiverEntry[];
  Cells: CellHydrologyEntry[];
}

export interface RegressionRiverSpec {
  Id: number;
  Parent: number;
  Mouth: number;
  Length: number;
  Basin: number;
  Name: string;
  Type: string;
}

export interface RegressionRiversSpecData {
  Rivers: RegressionRiverSpec[];
}

export interface RegressionLake {
  Id: number;
  Name: string;
}

export interface RegressionLakesData {
  Lakes: RegressionLake[];
}

// --- DUMP FUNCTIONS ---

export const dumpRiverData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.RiversGenerate);

  const pack = globalThis.pack;
  
  // 1. Map River Data
  const rivers: RiverEntry[] = pack.rivers.map((r: any) => ({
    Id: r.i,
    Parent: r.parent || 0,
    Source: r.source,
    Mouth: r.mouth,
    Discharge: r.discharge,
    Length: r.length,
    Width: r.width,
    WidthFactor: r.widthFactor || 0,
    SourceWidth: r.sourceWidth,
    CellCount: r.cells.length,
    CellSample: [
      r.cells[0], 
      r.cells[1], 
      r.cells[2], 
      r.cells.at(-3), 
      r.cells.at(-2), 
      r.cells.at(-1)
    ]
  }));

  // 2. Map Cell Hydrology to PascalCase
  const cellLength = pack.cells.i.length;
  const cells: CellHydrologyEntry[] = new Array(cellLength);
  
  for (let i = 0; i < cellLength; i++) {
    cells[i] = {
      Index: i,
      RiverId: pack.cells.r[i],
      Confluence: pack.cells.conf[i],
      Height: pack.cells.h[i],
      Flux: pack.cells.fl[i]
    };
  }

  const data: RiverRegressionData = {
    RiverCount: pack.rivers.length,
    ConfluenceCount: Array.from(pack.cells.conf).filter((c: any) => c > 0).length,
    Rivers: rivers,
    Cells: cells
  };

  collector.capture("river_regression.json", data);
};

export const dumpRiverSpecData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.RiversSpecify);

  const pack = globalThis.pack;

  // Map directly to PascalCase expectations
  const rivers: RegressionRiverSpec[] = pack.rivers.map((r: any) => ({
    Id: r.i,
    Parent: r.parent || 0,
    Mouth: r.mouth,
    Length: r.length,
    Basin: r.basin,
    Name: r.name,
    Type: r.type
  }));

  collector.capture("river_spec_regression.json", { Rivers: rivers });
};

export const dumpLakeSpecData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.LakesDefineNames);

  const pack = globalThis.pack;

  const lakes: RegressionLake[] = pack.features
    .filter((f: any) => f && f.type === "lake")
    .map((f: any) => ({
      Id: f.i,
      Name: f.name
    }));

  collector.capture("lake_regression.json", { Lakes: lakes });
};