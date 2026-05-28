// src/dump/dump.sequence.ts
import { defaultDumpSetup, initRandom } from "./dump.utils.ts";

/**
 * Defines the logical break points in the map generation sequence.
 * The sequence will execute up to and including the specified step, then return.
 */
export enum GenerationStep {
  Grid,
  Heightmap,
  FeaturesMarkupGrid,
  AddLakesInDeepDepressions,
  OpenNearSeaLakes,
  OceanLayers,
  DefineMapSize,
  CalculateMapCoordinates,
  CalculateTemperatures,
  GeneratePrecipitation,
  ReGraph,
  FeaturesMarkupPack,
  CreateDefaultRuler,
  RiversGenerate,
  BiomesDefine,
  FeaturesDefineGroups,
  IceGenerate,
  RankCells,
  CulturesGenerate,
  CulturesExpand,
  BurgsGenerate,
  StatesGenerate,
  RoutesGenerate,
  ReligionsGenerate,
  BurgsSpecify,
  StatesCollectStatistics,
  StatesDefineStateForms,
  ProvincesGenerate,
  ProvincesGetPoles,
  RiversSpecify,
  LakesDefineNames,
  MilitaryGenerate,
  MarkersGenerate,
  ZonesGenerate,
  DrawScaleBar,
  GetMapName,
  Complete
}

/**
 * Executes the standard FMG map generation sequence from scratch,
 * halting immediately after completing the requested step.
 */
export const executeGenerationSequence = async (stopAt: GenerationStep) => {
  const win = window as any;

  initRandom();
  win.applyGraphSize();
  win.randomizeOptions();
  defaultDumpSetup();

  globalThis.grid = win.generateGrid();
  if (stopAt === GenerationStep.Grid) return;

  globalThis.grid.cells.h = await HeightmapGenerator.generate(globalThis.grid);
  win.pack = {}; // FMG resets pack after heightmap
  if (stopAt === GenerationStep.Heightmap) return;

  Features.markupGrid();
  if (stopAt === GenerationStep.FeaturesMarkupGrid) return;
  addLakesInDeepDepressions();
  if (stopAt === GenerationStep.AddLakesInDeepDepressions) return;
  openNearSeaLakes();
  if (stopAt === GenerationStep.OpenNearSeaLakes) return;

  OceanLayers();
  if (stopAt === GenerationStep.OceanLayers) return;
  win.defineMapSize();
  if (stopAt === GenerationStep.DefineMapSize) return;
  calculateMapCoordinates();
  if (stopAt === GenerationStep.CalculateMapCoordinates) return;
  calculateTemperatures();
  if (stopAt === GenerationStep.CalculateTemperatures) return;
  win.generatePrecipitation();
  if (stopAt === GenerationStep.GeneratePrecipitation) return;

  reGraph();
  if (stopAt === GenerationStep.ReGraph) return;
  Features.markupPack();
  if (stopAt === GenerationStep.FeaturesMarkupPack) return;
  createDefaultRuler();
  if (stopAt === GenerationStep.CreateDefaultRuler) return;

  Rivers.generate();
  if (stopAt === GenerationStep.RiversGenerate) return;
  Biomes.define();
  if (stopAt === GenerationStep.BiomesDefine) return;
  Features.defineGroups();
  if (stopAt === GenerationStep.FeaturesDefineGroups) return;

  Ice.generate();
  if (stopAt === GenerationStep.IceGenerate) return;

  win.rankCells();
  if (stopAt === GenerationStep.RankCells) return;
  Cultures.generate();
  if (stopAt === GenerationStep.CulturesGenerate) return;
  Cultures.expand();
  if (stopAt === GenerationStep.CulturesExpand) return;

  Burgs.generate();
  if (stopAt === GenerationStep.BurgsGenerate) return;
  States.generate();
  if (stopAt === GenerationStep.StatesGenerate) return;
  Routes.generate();
  if (stopAt === GenerationStep.RoutesGenerate) return;
  Religions.generate();
  if (stopAt === GenerationStep.ReligionsGenerate) return;

  Burgs.specify();
  if (stopAt === GenerationStep.BurgsSpecify) return;
  States.collectStatistics();
  if (stopAt === GenerationStep.StatesCollectStatistics) return;
  States.defineStateForms();
  if (stopAt === GenerationStep.StatesDefineStateForms) return;

  Provinces.generate();
  if (stopAt === GenerationStep.ProvincesGenerate) return;
  Provinces.getPoles();
  if (stopAt === GenerationStep.ProvincesGetPoles) return;

  Rivers.specify();
  if (stopAt === GenerationStep.RiversSpecify) return;
  Lakes.defineNames();
  if (stopAt === GenerationStep.LakesDefineNames) return;

  Military.generate();
  if (stopAt === GenerationStep.MilitaryGenerate) return;
  Markers.generate();
  if (stopAt === GenerationStep.MarkersGenerate) return;
  Zones.generate();
  if (stopAt === GenerationStep.ZonesGenerate) return;

  drawScaleBar(win.scaleBar, win.scale);
  if (stopAt === GenerationStep.DrawScaleBar) return;

  win.Names.getMapName();
};
