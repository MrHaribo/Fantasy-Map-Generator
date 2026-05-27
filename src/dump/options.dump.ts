import type { DumpCollector } from "./dump.collector.ts";
import { initRandom } from "./dump.utils.ts";

export interface OptionsRegressionData {
  Template: string;
  TemperatureEquator: number;
  TemperatureNorthPole: number;
  TemperatureSouthPole: number;
  Precipitation: number;
  CultureSet: string;
  CulturesCount: number;
  StatesCount: number;
  GrowthRate: number;
}

export const dumpOptionsData = async (collector: DumpCollector) => {
  const win = window as any;
  const doc = win.document;

  initRandom();

  win.applyGraphSize();
  win.randomizeOptions();

  // Read the values exactly as they exist in the FMG DOM / Internal Options
  const templateInput = doc.getElementById("templateInput") as HTMLInputElement;
  const precInput = doc.getElementById("precOutput") as HTMLInputElement;
  const cultureSetInput = doc.getElementById("culturesSet") as HTMLInputElement;
  const culturesInput = doc.getElementById("culturesInput") as HTMLInputElement;
  const statesInput = doc.getElementById("statesNumber") as HTMLInputElement;
  const growthRateInput = doc.getElementById("growthRate") as HTMLInputElement;

  // Use the explicitly exposed FMG options object from our main.js patch
  const fmgOptions = globalThis.globalOptions;

  const data: OptionsRegressionData = {
    Template: templateInput.value,
    TemperatureEquator: fmgOptions.temperatureEquator,
    TemperatureNorthPole: fmgOptions.temperatureNorthPole,
    TemperatureSouthPole: fmgOptions.temperatureSouthPole,
    Precipitation: Number(precInput.value),
    CultureSet: cultureSetInput.value,
    CulturesCount: Number(culturesInput.value),
    StatesCount: Number(statesInput.value),
    GrowthRate: Number(growthRateInput.value)
  };

  collector.capture("options_regression.json", data);
};
