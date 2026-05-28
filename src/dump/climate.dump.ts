import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface TemperatureRegressionData {
  Template: string;
  Temperatures: number[];
}

export interface PrecipitationRegressionData {
  Seed: string;
  Winds: number[];
  PrecipitationModifier: number;
  Precipitation: number[];
}

// --- DUMP FUNCTIONS ---
export const dumpTemperatureData = async (collector: DumpCollector) => {
  const win = window as any;

  await executeGenerationSequence(GenerationStep.CalculateTemperatures);

  const templateInput = win.document.getElementById("templateInput") as HTMLInputElement;

  const data: TemperatureRegressionData = {
    Template: templateInput.value,
    Temperatures: Array.from(globalThis.grid.cells.temp)
  };

  collector.capture(`climate_temperatures.json`, data);
};

export const dumpPrecipitationData = async (collector: DumpCollector) => {
  const win = window as any;
  const precInput = win.document.getElementById("precOutput") as HTMLInputElement;

  await executeGenerationSequence(GenerationStep.GeneratePrecipitation);

  const data: PrecipitationRegressionData = {
    Seed: globalThis.seed,
    Winds: Array.from(globalThis.globalOptions.winds),
    PrecipitationModifier: Number(precInput.value),
    Precipitation: Array.from(globalThis.grid.cells.prec)
  };

  collector.capture("climate_precipitation.json", data);
};
