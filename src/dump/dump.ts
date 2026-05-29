import { dumpBiomeData } from "./biome.dump";
import { dumpBurgData } from "./burg.dump";
import { dumpPrecipitationData, dumpTemperatureData } from "./climate.dump";
import { dumpCultureData, dumpCultureExpansionData } from "./culture.dump";
import { DumpCollector } from "./dump.collector";
import { mockCOA, restoreCOA } from "./dump.utils";
import { dumpCellRankData, dumpFeatureGroupsData, dumpGridFeatureData, dumpPackFeatureData } from "./feature.dump";
import { dumpGlobeData } from "./globe.dump";
import { dumpGridData } from "./grid.dump";
import {
  dumpHeightmapData,
  dumpLakesInDepressionsHeightmapData,
  dumpOpenNearSeaLakesHeightmapData
} from "./heightmap.dump";
import { dumpIceData } from "./ice.dump";
import { dumpNameData } from "./name.dump";
import { dumpOptionsData } from "./options.dump";
import { dumpPackData } from "./pack.dump";
import { dumpRiverData } from "./river.dump";
import { dumpRouteData } from "./routes.dump";
import { dumpStateData } from "./state.dump";

export const dumpRegressionData = async () => {
  const collector = new DumpCollector();

  mockCOA();

  await dumpOptionsData(collector);
  await dumpNameData(collector);
  await dumpGridData(collector);
  await dumpHeightmapData(collector);
  await dumpGridFeatureData(collector);
  await dumpLakesInDepressionsHeightmapData(collector);
  await dumpOpenNearSeaLakesHeightmapData(collector);
  await dumpGlobeData(collector);
  await dumpTemperatureData(collector);
  await dumpPrecipitationData(collector);
  await dumpPackData(collector);
  await dumpPackFeatureData(collector);
  await dumpRiverData(collector);
  await dumpBiomeData(collector);
  await dumpFeatureGroupsData(collector);
  await dumpIceData(collector);
  await dumpCellRankData(collector);
  await dumpCultureData(collector);
  await dumpCultureExpansionData(collector);
  await dumpBurgData(collector);
  await dumpStateData(collector);
  await dumpRouteData(collector);

  restoreCOA();

  await collector.downloadZip(seed);
};

declare global {
  interface Window {
    dumpRegressionData: typeof dumpRegressionData;
  }
}
