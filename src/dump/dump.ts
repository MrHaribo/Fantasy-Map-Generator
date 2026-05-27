import { DumpCollector } from "./dump.collector";
import { dumpFeatureData } from "./feature.dump";
import { dumpGridData } from "./grid.dump";
import {
  dumpHeightmapData,
  dumpLakesInDepressionsHeightmapData,
  dumpOpenNearSeaLakesHeightmapData
} from "./heightmap.dump";

export const dumpRegressionData = async () => {
  const dumpCollector = new DumpCollector();

  await dumpGridData(dumpCollector);
  await dumpHeightmapData(dumpCollector);
  await dumpFeatureData(dumpCollector);
  await dumpLakesInDepressionsHeightmapData(dumpCollector);
  await dumpOpenNearSeaLakesHeightmapData(dumpCollector);

  await dumpCollector.downloadZip(seed);
};

declare global {
  interface Window {
    dumpRegressionData: typeof dumpRegressionData;
  }
}
