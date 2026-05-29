import type { DumpCollector } from "./dump.collector.ts";
import { executeGenerationSequence, GenerationStep } from "./dump.sequence.ts";

// --- INTERFACES ---

export interface CampaignDump {
  Name: string;
  Start: number;
  End: number;
}

export interface StateDump {
  Id: number;
  Name: string;
  Color: string;
  Expansionism: number;
  CapitalId: number;
  Type: string;
  CenterCell: number;
  CultureId: number;
  Pole: number[];
  Neighbors: number[];
  Area: number;
  Population: number;
  BurgsCount: number;
  Diplomacy: string[];
  Campaigns: CampaignDump[];
  Form: string;
  FormName: string;
  FullName: string;
}

export interface RegressionStatesData {
  States: StateDump[];
  Cells_State: number[];
  Chronicle: string[];
}

export interface ExpectedStateStat {
  Id: number;
  Name: string;
  Cells: number;
  Area: number;
  Burgs: number;
  Rural: number;
  Urban: number;
}

export interface RegressionStateStatsData {
  States: ExpectedStateStat[];
}

export interface ExpectedStateForm {
  Id: number;
  Name: string;
  Form: string;
  FormName: string;
  FullName: string;
}

export interface RegressionStateFormsData {
  States: ExpectedStateForm[];
}

// --- DUMP FUNCTIONS ---

export const dumpStateData = async (collector: DumpCollector) => {
  // 1. Run pipeline up to basic state generation completion
  await executeGenerationSequence(GenerationStep.StatesGenerate);

  const pack = globalThis.pack;

  // FIX 1: Use type assertion to force TypeScript to accept it as string[][]
  const globalChronicle = pack.states[0].diplomacy as string[];

  const states: StateDump[] = pack.states
    .map((s: any) => {
      // If a state has been flagged as removed, skip it to match C# logic,
      // but extract properties cleanly without inline fallbacks. Let it throw if property is missing!
      if (s.removed) return null;

      let safeDiplomacy = s.diplomacy;
      if (s.i === 0 || (safeDiplomacy.length > 0 && Array.isArray(safeDiplomacy[0]))) {
        safeDiplomacy = [];
      }

      let safeCampaigns = [];
      if (s.campaigns) {
        safeCampaigns = s.campaigns.map((c: any) => ({ Name: c.name, Start: c.start, End: c.end }));
      }

      return {
        Id: s.i,
        Name: s.name,
        Color: s.color,
        Expansionism: s.expansionism,
        CapitalId: s.capital,
        Type: s.type,
        CenterCell: s.center,
        CultureId: s.culture,
        Pole: s.pole,
        Neighbors: s.neighbors,
        Area: s.area,
        Population: s.population,
        BurgsCount: s.burgs,
        Diplomacy: safeDiplomacy,
        Campaigns: safeCampaigns,
        Form: s.form,
        FormName: s.formName,
        FullName: s.fullName
      };
    })
    .filter((s): s is StateDump => s !== null);

  const data: RegressionStatesData = {
    States: states,
    Cells_State: Array.from(pack.cells.state as Uint16Array),
    Chronicle: globalChronicle
  };

  collector.capture("states_regression.json", data);
};

export const dumpStateStatsData = async (collector: DumpCollector) => {
  // 2. Advance sequence up through full statistic calculation (post Route, Religion & Burg Specify)
  await executeGenerationSequence(GenerationStep.StatesCollectStatistics);

  const pack = globalThis.pack;

  // NO FALLBACKS
  const statesStats: ExpectedStateStat[] = pack.states.map((s: any) => ({
    Id: s.i,
    Name: s.name,
    Cells: s.cells,
    Area: s.area,
    Burgs: s.burgs,
    Rural: s.rural,
    Urban: s.urban
  }));

  const data: RegressionStateStatsData = {
    States: statesStats
  };

  collector.capture("state_stats_regression.json", data);
};

export const dumpStateFormsData = async (collector: DumpCollector) => {
  // 3. Complete pipeline execution through cultural title and dynastic naming rules
  await executeGenerationSequence(GenerationStep.StatesDefineStateForms);

  const pack = globalThis.pack;

  // NO FALLBACKS
  const statesForms: ExpectedStateForm[] = pack.states.map((s: any) => ({
    Id: s.i,
    Name: s.name,
    Form: s.form,
    FormName: s.formName,
    FullName: s.fullName
  }));

  const data: RegressionStateFormsData = {
    States: statesForms
  };

  collector.capture("state_forms_regression.json", data);
};
