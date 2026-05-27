import type { DumpCollector } from "./dump.collector.ts";
import { defaultDumpSetup, initRandom } from "./dump.utils.ts";

// --- INTERFACES ---
export interface RegressionMapCoordinates {
  LatT: number;
  LatN: number;
  LatS: number;
  LonT: number;
  LonW: number;
  LonE: number;
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

  initRandom();

  // 1. Setup MapData (mirroring C# execution sequence)
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

  // 3. Extract the data
  // FMG stores these primary globe values directly in the DOM inputs during generation
  const sizeInput = win.document.getElementById("mapSizeOutput") as HTMLInputElement;
  const latInput = win.document.getElementById("latitudeOutput") as HTMLInputElement;
  const lonInput = win.document.getElementById("longitudeOutput") as HTMLInputElement;
  const templateInput = win.document.getElementById("templateInput") as HTMLInputElement;

  // FMG exposes the resulting coordinate calculations on the global window.mapCoordinates object
  const coords = win.mapCoordinates;

  // 4. Build the exact data structure C# expects
  const globeData: GlobeRegressionData = {
    Template: templateInput?.value || "continents",
    Seed: globalThis.seed,
    Size: Number(sizeInput?.value || 100),
    Lat: Number(latInput?.value || 0),
    Lon: Number(lonInput?.value || 0),
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
