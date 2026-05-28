import { dumpPrecipitationData, dumpTemperatureData } from "./climate.dump";
import { DumpCollector } from "./dump.collector";
import { dumpGridFeatureData, dumpPackFeatureData } from "./feature.dump";
import { dumpGlobeData } from "./globe.dump";
import { dumpGridData } from "./grid.dump";
import {
  dumpHeightmapData,
  dumpLakesInDepressionsHeightmapData,
  dumpOpenNearSeaLakesHeightmapData
} from "./heightmap.dump";
import { dumpOptionsData } from "./options.dump";
import { dumpPackData } from "./pack.dump";

export const dumpRegressionData = async () => {
  const dumpCollector = new DumpCollector();

  await dumpOptionsData(dumpCollector);
  await dumpGridData(dumpCollector);
  await dumpHeightmapData(dumpCollector);
  await dumpGridFeatureData(dumpCollector);
  await dumpLakesInDepressionsHeightmapData(dumpCollector);
  await dumpOpenNearSeaLakesHeightmapData(dumpCollector);
  await dumpGlobeData(dumpCollector);
  await dumpTemperatureData(dumpCollector);
  await dumpPrecipitationData(dumpCollector);
  await dumpPackData(dumpCollector);
  await dumpPackFeatureData(dumpCollector);

  await dumpCollector.downloadZip(seed);
};

declare global {
  interface Window {
    dumpRegressionData: typeof dumpRegressionData;
  }
}
