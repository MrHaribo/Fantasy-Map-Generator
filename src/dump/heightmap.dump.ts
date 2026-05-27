import { ensureEl } from "../utils/nodeUtils.js";
import type { DumpCollector } from "./dump.collector.js";
import { defaultDumpSetup } from "./dump.utils.js";

export interface HeightmapTestCase {
  name: string;
  recipe: string;
  isTemplate?: boolean;
}

export interface HeightmapRegressionData {
  Seed: string;
  Width: number;
  Height: number;
  Heights: number[];
}

export const heightmapTestCases: HeightmapTestCase[] = [
  { name: "hill", recipe: "Hill 1 90-100 44-56 40-60" },
  { name: "add", recipe: "Add 30 0-100" },
  { name: "mult", recipe: "Add 20 all\nHill 1 50 50 50\nMultiply 1.5 land\nMultiply 0.5 0-20" },
  { name: "pit", recipe: "Add 50 0-100\nPit 1 30 50 50" },
  { name: "pit_shallow", recipe: "Add 50 0-100\nPit 1 5 50 50" },
  { name: "smooth", recipe: "Add 20 all\nHill 1 60 50 50\nSmooth 2 0\nSmooth 1.5 1" },
  { name: "invert", recipe: "Add 20 all\nHill 1 60 20 20\nInvert 1 x" },
  { name: "range", recipe: "Add 15 all\nRange 1 60 10-20 10-20\nSmooth 2" },
  { name: "trough", recipe: "Add 70 all\nTrough 1 40 40-60 5-10\nSmooth 1.5" },
  { name: "strait", recipe: "Add 50 all\nStrait 15 vertical\nStrait 15 horizontal" },
  { name: "template_highIsland", recipe: "highIsland", isTemplate: true },
  { name: "template_archipelago", recipe: "archipelago", isTemplate: true },
  { name: "template_shattered", recipe: "shattered", isTemplate: true },
  { name: "template_volcano", recipe: "volcano", isTemplate: true },
  { name: "template_fractious", recipe: "fractious", isTemplate: true },
  { name: "template_continents", recipe: "continents", isTemplate: true }
];

export const lakesInDepressionsTestCases: HeightmapTestCase[] = [
  { name: "lakes_in_depressions_simple", recipe: "Hill 1 80-85 60-80 40-60;Hill 1 80-85 20-30 40-60" },
  { name: "lakes_in_depressions_template_continents", recipe: "continents", isTemplate: true }
];

export const openNearSeaLakesTestCases: HeightmapTestCase[] = [
  { name: "open_near_sea_lakes_simple", recipe: "Hill 1 80-85 60-80 40-60;Hill 1 80-85 20-30 40-60" },
  { name: "open_near_sea_lakes_template_continents", recipe: "continents", isTemplate: true }
];

const dumpHeightmapDataSequence = async (collector: DumpCollector, testCases: HeightmapTestCase[], sequence: any) => {
  const win = window as any;

  win.applyGraphSize();
  win.randomizeOptions();

  defaultDumpSetup();

  for (const testCase of testCases) {
    console.log(`🧪 Running Heightmap Regression: ${testCase.name}`);

    if (!testCase.isTemplate) {
      (globalThis as any).heightmapTemplates = {
        ...(globalThis as any).heightmapTemplates,
        custom_regression_recipe: { template: testCase.recipe }
      };
    }

    const heightmapId = testCase.isTemplate ? testCase.recipe : "custom_regression_recipe";
    const heightmapName = (globalThis as any).heightmapTemplates[heightmapId]?.name || heightmapId;
    win.applyOption(ensureEl("templateInput"), heightmapId, heightmapName);

    await sequence();

    collector.capture(`heightmap_${testCase.name}_regression.json`, {
      Seed: globalThis.seed,
      Width: globalThis.graphWidth,
      Height: globalThis.graphHeight,
      Heights: Array.from(globalThis.grid.cells.h)
    });
  }
};

export const dumpHeightmapData = async (collector: DumpCollector) => {
  await dumpHeightmapDataSequence(collector, heightmapTestCases, async () => {
    globalThis.grid = (window as any).generateGrid();
    globalThis.grid.cells.h = await HeightmapGenerator.generate(globalThis.grid);
  });
};

export const dumpLakesInDepressionsHeightmapData = async (collector: DumpCollector) => {
  await dumpHeightmapDataSequence(collector, lakesInDepressionsTestCases, async () => {
    globalThis.grid = (window as any).generateGrid();
    globalThis.grid.cells.h = await HeightmapGenerator.generate(globalThis.grid);
    Features.markupGrid();
    addLakesInDeepDepressions();
  });
};

export const dumpOpenNearSeaLakesHeightmapData = async (collector: DumpCollector) => {
  await dumpHeightmapDataSequence(collector, openNearSeaLakesTestCases, async () => {
    globalThis.grid = (window as any).generateGrid();
    globalThis.grid.cells.h = await HeightmapGenerator.generate(globalThis.grid);
    Features.markupGrid();
    addLakesInDeepDepressions();
    openNearSeaLakes();
  });
};
