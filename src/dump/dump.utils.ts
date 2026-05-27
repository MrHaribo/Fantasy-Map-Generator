import Alea from "alea";

export interface TestOptions {
  seed?: string;
  width?: number;
  height?: number;
  density?: number;
  template?: string;
}

export const defaultDumpSetup = (options: TestOptions = {}) => {
  const { seed = "42", width = 1920, height = 1080, density = 2, template = "continents" } = options;

  globalThis.seed = seed;
  globalThis.graphWidth = width;
  globalThis.graphHeight = height;

  const win = window as any;

  win.changeCellsDensity(density);

  const name = win.heightmapTemplates[template].name;
  win.applyOption(win.ensureEl("templateInput"), template, name);
};

export const densityFromParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const densityParam = urlParams.get("density");
  if (densityParam) {
    (window as any).changeCellsDensity(2);
    console.log(`🛠️ Overriding points count via URL: ${densityParam}`);
  }
};

export const templateFromParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const templateParam = urlParams.get("template");
  if (templateParam) {
    const name = (window as any).heightmapTemplates[templateParam].name;
    (window as any).applyOption((window as any).ensureEl("templateInput"), templateParam, name);
    console.log(`🛠️ Overriding points count via URL: ${templateParam}`);
  }
};

export const initRandom = (seed: string = "42") => {
  Math.random = Alea(seed);
};
