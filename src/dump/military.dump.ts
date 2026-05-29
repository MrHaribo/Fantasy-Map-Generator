import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface RegressionRegiment {
  Id: number;
  StateId: number;
  CellId: number;
  Total: number;
  X: number;
  Y: number;
  Bx: number;
  By: number;
  Composition: Record<string, number>;
  IsNaval: number;
  Name: string;
  Icon: string;
  Legend: string;
}

export interface RegressionMilitaryState {
  Id: number;
  Military: RegressionRegiment[];
}

export interface RegressionMilitaryData {
  States: RegressionMilitaryState[];
}

// --- DUMP FUNCTION ---

export const dumpMilitaryData = async (collector: DumpCollector) => {
  // Run sequence up to Military generation
  await executeGenerationSequence(GenerationStep.MilitaryGenerate);

  const pack = globalThis.pack;
  const notes = globalThis.globalNotes;

  // Helper to replicate FMG's 'rn' rounding function
  const rn = (v: number, decimals: number = 0) => {
    const multiplier = 10 ** decimals;
    return Math.round(v * multiplier) / multiplier;
  };

  const statesDump: RegressionMilitaryState[] = pack.states
    .filter((s: any) => s && s.i && !s.removed)
    .map((s: any) => {
      const regiments: RegressionRegiment[] = (s.military || []).map((reg: any) => {
        const noteId = `regiment${s.i}-${reg.i}`;
        const note = notes.find((n: any) => n.id === noteId);

        return {
          Id: reg.i,
          StateId: reg.state,
          CellId: reg.cell,
          Total: rn(reg.a), // Mapped 'a' to 'Total'
          X: rn(reg.x, 2),
          Y: rn(reg.y, 2),
          Bx: rn(reg.bx, 2),
          By: rn(reg.by, 2),
          Composition: reg.u, // Mapped 'u' to 'Composition'
          IsNaval: reg.n, // Mapped 'n' to 'IsNaval'
          Name: reg.name,
          Icon: reg.icon,
          Legend: note.legend
        };
      });

      return {
        Id: s.i,
        Military: regiments
      };
    });

  const data: RegressionMilitaryData = {
    States: statesDump
  };

  collector.capture("military_regression.json", data);
};
