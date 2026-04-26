"use strict";

window.TestDump = (function () {

  // Global helper for dumping regression data
  const dumpToFile = function(filename, data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    console.log(`Dumped regression data to ${filename}`);
  };

  const dumpLogToFile = function(filename, logArray) {
    const text = logArray.join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    console.log(`Log dumped to ${filename}`);
  };

  const dumpPoints = function() {
    const data = {
      Seed: seed, // The seed used for the current session
      Width: graphWidth,
      Height: graphHeight,
      ExpectedPointsCount: 2000,
      ActualPointsCount: grid.points.length,
      Spacing: grid.spacing,
      CellsCountX: grid.cellsX,
      CellsCountY: grid.cellsY,
      Points: Array.from(grid.points)
    };
    dumpToFile("regression_points.json", data);
  };

  const dumpBoundary = function() {
    const data = {
      Seed: seed,
      Width: graphWidth,
      Height: graphHeight,
      BoundaryPoints: Array.from(grid.boundary) 
    };
    dumpToFile("regression_boundary.json", data);
  };

  const dumpVoronoi = function() {
    const data = {
      Seed: seed,
      Width: graphWidth,
      Height: graphHeight,
      Grid: grid,
    };
    dumpToFile("regression_voronoi.json", data);
  };

  const dumpHeightmap = function(suffix) {
    const data = {
      Seed: seed,
      Width: graphWidth,
      Height: graphHeight,
      Heights: Array.from(grid.cells.h)
    };
    dumpToFile(`regression_heightmap_${suffix}.json`, data);
  };

  const dumpGridFeatures = function() {
    const data = {
      cells_f: Array.from(grid.cells.f),
      cells_t: Array.from(grid.cells.t),
      features: grid.features.filter(f => f).map(f => ({
        id: f.i,
        type: f.type,
        land: f.land
      }))
    };
    dumpToFile(`regression_features_grid.json`, data);
  };

  const dumpGlobeData = function() {
    const data = {
      template: byId("templateInput").value,
      seed: seed,
      size: +byId("mapSizeOutput").value,
      lat: +byId("latitudeOutput").value,
      lon: +byId("longitudeOutput").value,
      coords: {
        latT: mapCoordinates.latT,
        latN: mapCoordinates.latN,
        latS: mapCoordinates.latS,
        lonT: mapCoordinates.lonT,
        lonW: mapCoordinates.lonW,
        lonE: mapCoordinates.lonE
      }
    };
    dumpToFile(`regression_globe_${data.template}.json`, data);
  };

  const dumpTemperatures = function() {
    const data = {
      template: byId("templateInput").value,
      seed: seed, 
      coords: mapCoordinates,
      temperatures: Array.from(grid.cells.temp)
    };
    dumpToFile(`regression_temperatures_${data.template}.json`, data);
  };

  const dumpOptions = function() {
    const data = {
      seed: seed,
      template: byId("templateInput").value,
      statesCount: +statesNumber.value,
      religionsCount: +religionsNumber.value,
      growthRate: +growthRate.value,
      culturesCount: +culturesOutput.value,
      cultureSet: culturesSet.value,
      temperatureEquator: options.temperatureEquator,
      temperatureNorthPole: options.temperatureNorthPole,
      temperatureSouthPole: options.temperatureSouthPole,
      precipitation: +precOutput.value
    };
    dumpToFile(`regression_options.json`, data);
  };

  const dumpPrecipitation = function() {
    const data = {
      seed: seed,
      winds: options.winds,
      precipitationModifier: +precOutput.value,
      precipitation: Array.from(grid.cells.prec)
    };
    dumpToFile(`regression_precipitation_continents.json`, data);
  };

  const dumpPackRegression = function() {
    const probes = [
      { x: graphWidth / 2, y: graphHeight / 2 },
      { x: graphWidth * 0.2, y: graphHeight * 0.2 },
      { x: graphWidth * 0.8, y: graphHeight * 0.8 }
    ];

    const probeResults = probes.map(p => {
      const found = pack.cells.q.find(p.x, p.y, Infinity);
      const index = found ? found[2] : -1;
      return { X: p.x, Y: p.y, ExpectedIndex: index };
    });

    const data = {
      seed: seed,
      points: pack.cells.p.map(([x, y]) => ({ X: x, Y: y })),
      gridMapping: Array.from(pack.cells.g),
      heights: Array.from(pack.cells.h),
      areas: Array.from(pack.cells.area),
      probes: probeResults
    };
    dumpToFile(`regression_pack_full.json`, data);
  };

  const dumpPackFeatures = function() {
    const featureDump = {
      cells_f: Array.from(pack.cells.f),
      cells_t: Array.from(pack.cells.t),
      cells_haven: Array.from(pack.cells.haven || []),
      cells_harbor: Array.from(pack.cells.harbor || []),
      features: pack.features.filter(f => f).map(f => ({
        id: f.i,
        type: f.type,
        land: f.land,
        border: f.border,
        cells: f.cells,
        firstCell: f.firstCell,
        vertices: f.vertices,
        area: f.area,
        height: f.height,
        shoreline: f.shoreline || []
      }))
    };
    dumpToFile("regression_features_pack.json", featureDump);
  };

  const dumpRivers = function() {
    const { cells, rivers } = pack;
    
    const riverDump = rivers.map(r => ({
        id: r.i,
        parent: r.parent,
        source: r.source,
        mouth: r.mouth,
        discharge: r.discharge,
        length: r.length,
        width: r.width,
        sourceWidth: r.sourceWidth,
        cellCount: r.cells.length,
        cellSample: [r.cells[0], r.cells[1], r.cells[2], r.cells.at(-3), r.cells.at(-2), r.cells.at(-1)]
    }));

    const cellData = [];
    for (let i = 0; i < cells.i.length; i++) {
      cellData.push({
        i: i,
        r: cells.r[i],
        c: cells.conf[i],
        h: cells.h[i],
        f: cells.fl[i]
      });
    }

    const finalData = {
        riverCount: rivers.length,
        confluenceCount: cells.conf.filter(c => c > 0).length,
        rivers: riverDump,
        cells: cellData
    };
    dumpToFile("regression_rivers.json", finalData);
  };

  const dumpBiomes = function() {
    const { cells } = pack;
    const { temp, prec } = grid.cells;
    const gridRef = cells.g;

    function calculateMoisture(i) {
      let moisture = prec[gridRef[i]];
      if (cells.r[i]) moisture += Math.max(cells.fl[i] / 10, 2);
      const moistAround = cells.c[i]
        .filter(n => cells.h[n] >= 20)
        .map(n => prec[gridRef[n]])
        .concat([moisture]);
      return Math.round(4 + d3.mean(moistAround));
    }

    const cellData = [];
    for (let i = 0; i < cells.i.length; i++) {
      const moisture = cells.h[i] < 20 ? 0 : calculateMoisture(i);
      cellData.push({
        i: i,
        b: cells.biome[i],
        t: temp[gridRef[i]],
        p: prec[gridRef[i]],
        m: moisture
      });
    }

    const finalData = {
      cellCount: cells.i.length,
      cells: cellData
    };
    dumpToFile("regression_biomes.json", finalData);
  };

  const dumpFeatureGroups = function() {
    const groupDump = pack.features
      .filter(f => f && f.i > 0)
      .map(f => ({
        id: f.i,
        type: f.type,
        group: f.group,
        cells: f.cells,
        height: f.height,
        temp: f.temp
      }));

    const data = { seed: seed, features: groupDump };
    dumpToFile("regression_feature_groups.json", data);
  };

  const dumpCellRanks = function() {
    const data = {
      seed: seed,
      meanFlux: d3.median(pack.cells.fl.filter(f => f)) || 0,
      maxFlux: d3.max(pack.cells.fl) + d3.max(pack.cells.conf),
      meanArea: d3.mean(pack.cells.area),
      suitability: Array.from(pack.cells.s),
      population: Array.from(pack.cells.pop)
    };
    dumpToFile("regression_cell_ranks.json", data);
  };

  const dumpNames = function() {
    const localSeed = "42"; // Using a local const to not overwrite global seed map state
    Math.random = aleaPRNG(localSeed);

    const data = {
      seed: localSeed,
      rngCheck: [],
      getBase: [],
      getBaseShort: [],
      getState: [],
      getMapName: []
    };

    for (let i = 0; i < 3; i++) {
      data.rngCheck.push(Math.random());
    }

    const baseParams = [[0, 5, 10, ""], [1, 5, 10, ""], [18, 4, 8, ""]];
    baseParams.forEach(p => {
      for (let i = 0; i < 5; i++) {
        data.getBase.push(Names.getBase(p[0], p[1], p[2], p[3]));
      }
    });

    [0, 1, 12, 18].forEach(id => {
      for (let i = 0; i < 3; i++) {
        data.getBaseShort.push(Names.getBaseShort(id));
      }
    });

    const stateInputs = [{n: "Berlin", id: 0}, {n: "Paris", id: 2}, {n: "Kyoto", id: 12}, {n: "Cairo", id: 18}];
    stateInputs.forEach(input => {
      for (let i = 0; i < 3; i++) {
        data.getState.push(Names.getState(input.n, undefined, input.id));
      }
    });

    for (let i = 0; i < 5; i++) {
      const base = (Math.random() < 0.7) ? 2 : (Math.random() < 0.5) ? Math.floor(Math.random() * 7) : Math.floor(Math.random() * 32);
      const min = nameBases[base].min - 1;
      const max = Math.max(nameBases[base].max - 3, min);
      const baseName = Names.getBase(base, min, max, "");
      
      let n = baseName;
      const isSuffix = Math.random() < 0.7;
      if (isSuffix) {
          const suffix = (Math.random() < 0.8) ? "ia" : "land";
          if (suffix === "ia" && n.length > 6) n = n.slice(0, -(n.length - 3));
          else if (suffix === "land" && n.length > 6) n = n.slice(0, -(n.length - 5));
          data.getMapName.push(Names.validateSuffix ? Names.validateSuffix(n, suffix) : n + suffix);
      } else {
          data.getMapName.push(baseName);
      }
    }
    dumpToFile("regression_names.json", data);
  };

  const dumpCultures = function() {
    const cultureDump = pack.cultures.filter(c => c).map(c => ({
      id: c.i,
      name: c.name,
      code: c.code,
      color: c.color,
      center: c.center,
      base: c.base,
      type: c.type,
      expansionism: c.expansionism,
      shield: c.shield,
      cells: c.cells || 0,
      area: c.area || 0,
      rural: c.rural || 0,
      urban: c.urban || 0,
      origins: c.origins || [0]
    }));

    const cultureMap = {
      cultures: cultureDump,
      cells_culture: Array.from(pack.cells.culture)
    };
    dumpToFile("regression_cultures.json", cultureMap);
  };

  const dumpCultureExpansion = function() {
    const data = {
      seed: seed,
      cellsCount: pack.cells.i.length,
      cultureMap: Array.from(pack.cells.culture),
      cultures: pack.cultures.map(c => ({
        id: c.i,
        name: c.name,
        type: c.type,
        center: c.center,
        expansionism: c.expansionism
      }))
    };
    dumpToFile("regression_cultures_expansion.json", data);
  };

  const dumpBurgs = function() {
    const data = {
      seed: seed,
      cellsCount: pack.cells.i.length,
      burgMap: Array.from(pack.cells.burg), 
      burgs: pack.burgs.filter(b => b.i).map(b => ({
        id: b.i,
        name: b.name,
        cell: b.cell,
        x: b.x,
        y: b.y,
        state: b.state,
        culture: b.culture,
        capital: b.capital || 0,
        port: b.port || 0 
      }))
    };
    dumpToFile("regression_burgs.json", data);
  };

  const dumpStates = function() {
    let globalChronicle = [];
    if (pack.states && pack.states[0] && Array.isArray(pack.states[0].diplomacy)) {
      if (pack.states[0].diplomacy.length > 0 && Array.isArray(pack.states[0].diplomacy[0])) {
        globalChronicle = pack.states[0].diplomacy;
      } else if (pack.states[0].diplomacy.length === 0) {
        globalChronicle = [];
      }
    }

    const stateDump = pack.states.map(s => {
      if (!s || s.removed) return null;

      let safeDiplomacy = s.diplomacy || [];
      if (s.i === 0 || (safeDiplomacy.length > 0 && Array.isArray(safeDiplomacy[0]))) {
          safeDiplomacy = [];
      }

      return {
        id: s.i,
        name: s.name,
        color: s.color,
        expansionism: s.expansionism,
        capitalId: s.capital,
        type: s.type,
        centerCell: s.center,
        cultureId: s.culture,
        pole: s.pole || [0, 0],
        neighbors: s.neighbors || [],
        area: s.area || 0,
        population: s.population || s.rural || 0,
        burgsCount: s.burgs || 0,
        diplomacy: safeDiplomacy,
        campaigns: s.campaigns ? s.campaigns.map(c => ({ name: c.name, start: c.start, end: c.end })) : [],
        form: s.form,
        formName: s.formName,
        fullName: s.fullName
      };
    }).filter(s => s !== null);

    const stateMap = {
      states: stateDump,
      cells_state: Array.from(pack.cells.state),
      chronicle: globalChronicle
    };
    dumpToFile("regression_states.json", stateMap);
  };

  const dumpRoutes = function() {
    const data = {
      seed: seed,
      routes: pack.routes.map(r => ({
        id: r.i,
        group: r.group,
        featureId: r.feature,
        points: r.points.map(p => ({
          x: p[0],
          y: p[1],
          cellId: p[2]
        }))
      })),
      routeLinks: pack.cells.routes || {}
    };
    dumpToFile("regression_routes.json", data);
  };

  const dumpReligions = function() {
    const religionDump = pack.religions.map(r => {
      if (!r || r.removed) return null;
      return {
        id: r.i,
        name: r.name,
        color: r.color,
        cultureId: r.culture,
        group: r.type, 
        form: r.form,
        deity: r.deity || null,
        expansion: r.expansion,
        expansionism: r.expansionism,
        centerCell: r.center,
        cellsCount: r.cells || 0,
        totalArea: r.area || 0,
        ruralPopulation: r.rural || 0,
        urbanPopulation: r.urban || 0,
        origins: r.origins || [],
        code: r.code
      };
    }).filter(r => r !== null);

    const religionMap = {
      religions: religionDump,
      cells_religion: Array.from(pack.cells.religion)
    };
    dumpToFile("regression_religions.json", religionMap);
  };

  const dumpBurgsSpecification = function() {
    const data = {
      seed: seed,
      burgs: pack.burgs.filter(b => b.i && !b.removed).map(b => ({
        id: b.i,
        population: b.population,
        type: b.type,
        group: b.group,
        citadel: b.citadel || 0,
        plaza: b.plaza || 0,
        walls: b.walls || 0,
        shanty: b.shanty || 0,
        temple: b.temple || 0
      }))
    };
    dumpToFile("regression_burgs_spec.json", data);
  };

  const dumpStateStatistics = function() {
    const statsDump = pack.states.map(s => {
      if (!s || s.removed) return null;
      return {
        id: s.i,
        name: s.name,
        cells: s.cells || 0,
        area: s.area || 0,
        burgs: s.burgs || 0,
        rural: s.rural || 0,
        urban: s.urban || 0
      };
    }).filter(s => s !== null);

    dumpToFile("regression_state_stats.json", { states: statsDump });
  };

  const dumpStateForms = function() {
    const formsDump = pack.states.map(s => {
      if (!s || !s.i || s.removed) return null;
      return {
        id: s.i,
        name: s.name,
        form: s.form || "Undefined",
        formName: s.formName || "",  
        fullName: s.fullName || ""   
      };
    }).filter(s => s !== null);

    dumpToFile("regression_state_forms.json", { states: formsDump });
  };

  const dumpProvinces = function() {
    const provincesDump = pack.provinces.map(p => {
      if (!p || !p.i || p.removed) return null;
      return {
        id: p.i,
        state: p.state,
        center: p.center,
        burg: p.burg || 0,
        name: p.name || "",
        formName: p.formName || "",
        fullName: p.fullName || "",
        color: p.color || "",
        pole: p.pole ? { x: p.pole[0], y: p.pole[1] } : { x: 0, y: 0 }
      };
    }).filter(p => p !== null);

    const mapData = {
      provinces: provincesDump,
      cellProvinces: Array.from(pack.cells.province)
    };
    dumpToFile("regression_provinces.json", mapData);
  };

  const dumpRiverSpec = function() {
    const riversDump = pack.rivers.map(r => {
      if (!r || !r.i) return null;
      return {
        id: r.i,
        parent: r.parent || 0,
        mouth: r.mouth || 0,
        length: r.length || 0,
        basin: r.basin || 0,
        name: r.name || "",
        type: r.type || ""
      };
    }).filter(r => r !== null);

    dumpToFile("regression_rivers_spec.json", { rivers: riversDump });
  };

  const dumpLakes = function() {
    const lakesDump = pack.features.map(f => {
      if (!f || f.type !== "lake") return null;
      return { id: f.i, name: f.name || "" };
    }).filter(f => f !== null);

    dumpToFile("regression_lakes.json", { lakes: lakesDump });
  };

  const dumpMilitary = function() {
    const statesDump = pack.states.map(s => {
      if (!s || !s.i || s.removed) return null;

      const regiments = (s.military || []).map(reg => {
        const noteId = `regiment${s.i}-${reg.i}`;
        const note = notes.find(n => n.id === noteId);
        return {
          id: reg.i,
          state: reg.state,
          cell: reg.cell,
          a: rn(reg.a),
          x: rn(reg.x, 2),
          y: rn(reg.y, 2),
          bx: rn(reg.bx, 2),
          by: rn(reg.by, 2),
          u: reg.u, 
          n: reg.n || 0,
          name: reg.name || "",
          icon: reg.icon || "",
          legend: note ? note.legend : "" 
        };
      });

      return { id: s.i, military: regiments };
    }).filter(s => s !== null);

    dumpToFile("regression_military.json", { states: statesDump });
  };

  const dumpMarkers = function() {
    const markersDump = pack.markers.map(m => {
      const noteId = "marker" + m.i;
      const note = notes.find(n => n.id === noteId) || { name: "", legend: "" };
      return {
        id: m.i,
        cellId: m.cell,
        type: m.type,
        icon: m.icon || "",
        name: note.name || "",
        legend: note.legend || "",
        dx: m.dx || 0,
        dy: m.dy || 0,
        px: m.px || 0,
        x: rn(m.x, 2),
        y: rn(m.y, 2)
      };
    });

    dumpToFile("regression_markers.json", { markers: markersDump });
  };

  const dumpZones = function() {
    const zonesDump = pack.zones.map(z => {
      return {
        id: z.i,
        name: z.name || "",
        type: z.type || "",
        cells: Array.from(z.cells || []),
        color: z.color || ""
      };
    });

    dumpToFile("regression_zones.json", { zones: zonesDump });
  };

  // Return the public API
  return {
    dumpToFile,
    dumpLogToFile,
    dumpPoints,
    dumpBoundary,
    dumpVoronoi,
    dumpHeightmap,
    dumpGridFeatures,
    dumpGlobeData,
    dumpTemperatures,
    dumpOptions,
    dumpPrecipitation,
    dumpPackRegression,
    dumpPackFeatures,
    dumpRivers,
    dumpBiomes,
    dumpFeatureGroups,
    dumpCellRanks,
    dumpNames,
    dumpCultures,
    dumpCultureExpansion,
    dumpBurgs,
    dumpStates,
    dumpRoutes,
    dumpReligions,
    dumpBurgsSpecification,
    dumpStateStatistics,
    dumpStateForms,
    dumpProvinces,
    dumpRiverSpec,
    dumpLakes,
    dumpMilitary,
    dumpMarkers,
    dumpZones
  };
})();