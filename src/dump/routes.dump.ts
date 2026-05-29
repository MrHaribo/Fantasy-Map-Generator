import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface RegressionRoutePoint {
  X: number;
  Y: number;
  CellId: number;
}

export interface RegressionRoute {
  Id: number;
  Group: string; 
  FeatureId: number;
  Points: RegressionRoutePoint[];
}

export interface RegressionRoutesData {
  Seed: string;
  Routes: RegressionRoute[];
  RouteLinks: Record<number, Record<number, number>>;
}

// --- DUMP FUNCTION ---

export const dumpRouteData = async (collector: DumpCollector) => {
  // 1. Advance sequence up through route generation
  await executeGenerationSequence(GenerationStep.RoutesGenerate);

  const pack = globalThis.pack;

  // 2. Extract and map data to PascalCase for C#
  const routes: RegressionRoute[] = pack.routes.map((r: any) => ({
    Id: r.i,
    Group: r.group,
    FeatureId: r.feature,
    Points: r.points.map((p: any) => ({
      X: p[0],
      Y: p[1],
      CellId: p[2]
    }))
  }));

  const routeLinks = pack.cells.routes || {};

  const data: RegressionRoutesData = {
    Seed: globalThis.seed,
    Routes: routes,
    RouteLinks: routeLinks
  };

  // 3. Send it to the ZIP collector (matching the filename in your C# test)
  collector.capture("routes_regression.json", data);
};