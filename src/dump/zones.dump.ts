import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface RegressionZone {
  Id: number;
  Name: string;
  Type: string;
  Cells: number[];
  Color: string;
}

export interface RegressionZoneData {
  zones: RegressionZone[];
}

// --- DUMP FUNCTION ---

export const dumpZonesData = async (collector: DumpCollector) => {
  await executeGenerationSequence(GenerationStep.ZonesGenerate);
  const pack = globalThis.pack;

  const zonesDump: RegressionZone[] = pack.zones.map((z: any) => ({
    Id: z.i,
    Name: z.name,
    Type: z.type,
    Cells: Array.from(z.cells),
    Color: z.color
  }));

  const data: RegressionZoneData = {
    zones: zonesDump
  };

  collector.capture("zones_regression.json", data);
};
