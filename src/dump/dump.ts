import { dumpBiomeData } from "./biome.dump";
import { dumpBurgData, dumpBurgSpecData } from "./burg.dump";
import { dumpPrecipitationData, dumpTemperatureData } from "./climate.dump";
import { dumpCultureData, dumpCultureExpansionData } from "./culture.dump";
import { DumpCollector } from "./dump.collector";
import { dumpMarkerData } from "./dump.markers";
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
import { dumpMilitaryData } from "./military.dump";
import { dumpNameData } from "./name.dump";
import { dumpOptionsData } from "./options.dump";
import { dumpPackData } from "./pack.dump";
import { dumpProvincesData } from "./province.dump";
import { dumpReligionData } from "./religion.dump";
import { dumpLakeSpecData, dumpRiverData, dumpRiverSpecData } from "./river.dump";
import { dumpRouteData } from "./routes.dump";
import { dumpStateData, dumpStateFormsData, dumpStateStatsData } from "./state.dump";
import { dumpZonesData } from "./zones.dump";

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
  await dumpReligionData(collector);
  await dumpBurgSpecData(collector);
  await dumpStateStatsData(collector);
  await dumpStateFormsData(collector);
  await dumpProvincesData(collector);
  await dumpRiverSpecData(collector);
  await dumpLakeSpecData(collector);
  await dumpMilitaryData(collector);
  await dumpMarkerData(collector);
  await dumpZonesData(collector);

  restoreCOA();

  await collector.downloadZip(seed);
};

declare global {
  interface Window {
    dumpRegressionData: typeof dumpRegressionData;
  }
}
