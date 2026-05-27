// src/dump/grid.dump.ts
import type { DumpCollector } from "./dump.collector";
import { defaultDumpSetup } from "./dump.utils";

// --- INTERFACES ---
export interface PointsRegressionData {
  Seed: string;
  Width: number;
  Height: number;
  ExpectedPointsCount: number;
  ActualPointsCount: number;
  Spacing: number;
  CellsCountX: number;
  CellsCountY: number;
  Points: [number, number][];
}

export interface BoundaryRegressionData {
  Seed: string;
  Width: number;
  Height: number;
  BoundaryPoints: [number, number][];
}

export interface VoronoiRegressionData {
  Seed: string;
  Width: number;
  Height: number;
  Cells: { v: number[][]; c: number[][]; b: number[]; i: number[] };
  Vertices: { p: [number, number][]; v: number[][]; c: number[][] };
}

// --- DUMP FUNCTION ---
export const dumpGridData = async (collector: DumpCollector) => {
  const win = window as any;

  win.applyGraphSize();
  win.randomizeOptions();

  defaultDumpSetup();

  globalThis.grid = win.generateGrid();

  const grid = globalThis.grid;
  const seed = globalThis.seed;
  const width = globalThis.graphWidth;
  const height = globalThis.graphHeight;

  // Try to get expected points from the DOM just like FMG does, fallback to actual length
  const pointsInput = document.getElementById("pointsInput") as HTMLInputElement;
  const expectedPoints = pointsInput?.dataset?.cells ? parseInt(pointsInput.dataset.cells, 10) : grid.points.length;

  // 1. Dump Points
  const pointsData: PointsRegressionData = {
    Seed: seed,
    Width: width,
    Height: height,
    ExpectedPointsCount: expectedPoints,
    ActualPointsCount: grid.points.length,
    Spacing: grid.spacing,
    CellsCountX: grid.cellsX,
    CellsCountY: grid.cellsY,
    Points: Array.from(grid.points) as [number, number][]
  };
  collector.capture("grid_points_regression.json", pointsData);

  // 2. Dump Boundary
  const boundaryData: BoundaryRegressionData = {
    Seed: seed,
    Width: width,
    Height: height,
    BoundaryPoints: Array.from(grid.boundary) as [number, number][]
  };
  collector.capture("grid_boundary_regression.json", boundaryData);

  // 3. Dump Voronoi
  const voronoiData: VoronoiRegressionData = {
    Seed: seed,
    Width: width,
    Height: height,
    Cells: {
      v: Array.from(grid.cells.v as any[]).map(arr => Array.from(arr as number[])),
      c: Array.from(grid.cells.c as any[]).map(arr => Array.from(arr as number[])),
      b: Array.from(grid.cells.b as number[]),
      i: Array.from(grid.cells.i as number[])
    },
    Vertices: {
      p: Array.from(grid.vertices.p as any[]).map((pt: any) => [pt[0], pt[1]] as [number, number]),
      v: Array.from(grid.vertices.v as any[]).map(arr => Array.from(arr as number[])),
      c: Array.from(grid.vertices.c as any[]).map(arr => Array.from(arr as number[]))
    }
  };
  collector.capture("grid_voronoi_regression.json", voronoiData);
};
