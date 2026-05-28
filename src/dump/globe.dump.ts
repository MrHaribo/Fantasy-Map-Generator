import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---
export interface RegressionMapCoordinates {
  LatT?: number;
  LatN?: number;
  LatS?: number;
  LonT?: number;
  LonW?: number;
  LonE?: number;
}

export interface GlobeRegressionData {
  Template: string;
  Seed: string;
  Size: number;
  Lat: number;
  Lon: number;
  Coords: RegressionMapCoordinates;
}

// --- DUMP FUNCTION ---
export const dumpGlobeData = async (collector: DumpCollector) => {
  const win = window as any;

  await executeGenerationSequence(GenerationStep.CalculateMapCoordinates);

  // 3. Extract the data
  // FMG stores these primary globe values directly in the DOM inputs during generation
  const sizeInput = win.document.getElementById("mapSizeOutput") as HTMLInputElement;
  const latInput = win.document.getElementById("latitudeOutput") as HTMLInputElement;
  const lonInput = win.document.getElementById("longitudeOutput") as HTMLInputElement;
  const templateInput = win.document.getElementById("templateInput") as HTMLInputElement;

  // FMG exposes the resulting coordinate calculations on the global window.mapCoordinates object
  const coords = globalThis.mapCoordinates;

  // 4. Build the exact data structure C# expects
  const globeData: GlobeRegressionData = {
    Template: templateInput.value,
    Seed: globalThis.seed,
    Size: Number(sizeInput.value),
    Lat: Number(latInput.value),
    Lon: Number(lonInput.value),
    Coords: {
      LatT: coords.latT,
      LatN: coords.latN,
      LatS: coords.latS,
      LonT: coords.lonT,
      LonW: coords.lonW,
      LonE: coords.lonE
    }
  };

  // 5. Send it to the ZIP collector
  collector.capture("globe_regression.json", globeData);
};
