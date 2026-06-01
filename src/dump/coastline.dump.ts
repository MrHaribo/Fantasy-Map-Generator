import { fractalizeCoastline } from "../renderers/coastline-fractal.ts";
import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface RegressionCoastline {
  FeatureId: number;
  Points: [number, number][];
  OriginalIndices: number[];
}

export interface RegressionCoastlineData {
  Coastlines: RegressionCoastline[];
}

// --- DUMP FUNCTION ---

export const dumpCoastlineData = async (collector: DumpCollector) => {
  // Execute up to the point where features are completely defined and ranked
  await executeGenerationSequence(GenerationStep.ZonesGenerate);
  
  const pack = globalThis.pack;

  const coastlinesDump: RegressionCoastline[] = [];

  for (const f of pack.features) {
    // Skip empty container (0) and ocean features to match C# pipeline
    if (!f || f.i === 0 || f.type === "ocean") continue;

    // Grab the raw vertex indices that make up the shoreline boundary
    // and map them to their physical [x,y] coordinates
    const points: [number, number][] = f.vertices.map((v: number) => pack.vertices.p[v]);

    // Manually invoke the fractalizer (assuming it's available in scope or on window)
    const fractalData = fractalizeCoastline(points, f.i, f.type);

    coastlinesDump.push({
      FeatureId: f.i,
      Points: fractalData.points,
      OriginalIndices: fractalData.origIndices
    });
  }

  const data: RegressionCoastlineData = {
    Coastlines: coastlinesDump
  };

  collector.capture("coastline_regression.json", data);
};