import type { DumpCollector } from "./dump.collector.ts";
import { defaultDumpSetup, initRandom } from "./dump.utils.ts";

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

const generationSequence = async () => {
  const win = window as any;

  initRandom();

  win.applyGraphSize();
  win.randomizeOptions();

  defaultDumpSetup();

  globalThis.grid = win.generateGrid();
  globalThis.grid.cells.h = await win.HeightmapGenerator.generate(globalThis.grid);

  Features.markupGrid();
  addLakesInDeepDepressions();
  openNearSeaLakes();

  // 2. Execute Placement Logic
  // defineMapSize determines the bounding constraints, calculateMapCoordinates generates the actual rect
  win.defineMapSize();
  calculateMapCoordinates();
};

// --- DUMP FUNCTIONS ---

export const dumpTemperatureData = async (collector: DumpCollector) => {
  const win = window as any;

  await generationSequence();
  calculateTemperatures();

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

  await generationSequence();
  calculateTemperatures();
  win.generatePrecipitation();

  const data: PrecipitationRegressionData = {
    Seed: globalThis.seed,
    Winds: Array.from(globalThis.globalOptions.winds),
    PrecipitationModifier: Number(precInput.value),
    Precipitation: Array.from(globalThis.grid.cells.prec)
  };

  collector.capture("climate_precipitation.json", data);
};
