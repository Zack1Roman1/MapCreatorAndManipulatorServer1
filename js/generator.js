// ============================================================
//  GENERATOR — Lógica de generación procedural de ciudades
//  v4.1 — Bugs corregidos + mejoras de naturalidad
// ============================================================

// ─── Generación de red vial ────────────────────────────────
function buildRoads(grid, streetCfg) {
    const size = grid.length;
    const { avenue = 0, road = 5 } = streetCfg;

    // Bordes siempre son calles
    for (let c = 0; c < size; c++) {
        grid[1][c].terrain      = 'ROAD';
        grid[size-2][c].terrain = 'ROAD';
    }
    for (let r = 0; r < size; r++) {
        grid[r][1].terrain      = 'ROAD';
        grid[r][size-2].terrain = 'ROAD';
    }

    // Calles interiores horizontales
    const roadRows = [1];
    let r = 1 + road;
    while (r < size - 2) {
        for (let c = 0; c < size; c++) grid[r][c].terrain = 'ROAD';
        roadRows.push(r);
        r += road + rnd(-1, 1);
        r = Math.max(r, roadRows[roadRows.length - 1] + 3);
    }
    roadRows.push(size - 2);

    // Calles interiores verticales
    const roadCols = [1];
    let c = 1 + road;
    while (c < size - 2) {
        for (let row = 0; row < size; row++) grid[row][c].terrain = 'ROAD';
        roadCols.push(c);
        c += road + rnd(-1, 1);
        c = Math.max(c, roadCols[roadCols.length - 1] + 3);
    }
    roadCols.push(size - 2);

    // ── AVENIDAS ──────────────────────────────────────────
    // BUG FIX: el bloque anterior usaba `grid[ar][cc?.label]` (cc indefinida fuera
    // del bucle). Ahora el nombre se asigna correctamente dentro del loop.
    if (avenue > 0) {
        const avRow = Math.floor(size / 2) + rnd(-2, 2);
        const avRow2 = avRow + avenue + rnd(-1, 1);
        for (const ar of [avRow, avRow2]) {
            if (ar > 2 && ar < size - 2) {
                const avName = generateStreetName('avenue');
                for (let cc = 0; cc < size; cc++) {
                    grid[ar][cc].terrain = 'AVENUE';
                    grid[ar][cc].label   = avName;   // ← CORRECCIÓN: asignar dentro del bucle
                }
                if (!roadRows.includes(ar)) roadRows.push(ar);
            }
        }

        const avCol = Math.floor(size / 2) + rnd(-2, 2);
        if (avCol > 2 && avCol < size - 2) {
            const avName = generateStreetName('avenue');
            for (let rr = 0; rr < size; rr++) {
                grid[rr][avCol].terrain = 'AVENUE';
                // No sobreescribir el label horizontal si ya tiene uno
                if (!grid[rr][avCol].label) grid[rr][avCol].label = avName;
            }
            if (!roadCols.includes(avCol)) roadCols.push(avCol);
        }
    }

    // ── Nombres de calles ──────────────────────────────────
    const sortedRows = [...new Set(roadRows)].sort((a, b) => a - b);
    const sortedCols = [...new Set(roadCols)].sort((a, b) => a - b);

    for (const rr of sortedRows) {
        if (!grid[rr]) continue;
        // No reasignar si es avenida (ya tiene nombre)
        if (grid[rr][2]?.terrain === 'AVENUE') continue;
        const name = generateStreetName('road');
        for (let cc = 0; cc < size; cc++) {
            const cell = grid[rr][cc];
            if (cell && (cell.terrain === 'ROAD' || cell.terrain === 'AVENUE') && !cell.label) {
                cell.label = name;
            }
        }
    }
    for (const cc of sortedCols) {
        if (grid[2]?.[cc]?.terrain === 'AVENUE') continue;
        const name = generateStreetName('road');
        for (let rr = 0; rr < size; rr++) {
            const cell = grid[rr]?.[cc];
            if (cell && (cell.terrain === 'ROAD' || cell.terrain === 'AVENUE') && !cell.label) {
                cell.label = name;
            }
        }
    }

    return { roadRows: sortedRows, roadCols: sortedCols };
}

// ─── Aceras ──────────────────────────────────────────────
function buildSidewalks(grid) {
    const size = grid.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = grid[r][c];
            if (cell.terrain !== 'EMPTY') continue;
            for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1]]) {
                const nr = r + dr, nc = c + dc;
                if (!isInBounds(nr, nc, size, size)) continue;
                const t = grid[nr][nc].terrain;
                if (t === 'ROAD' || t === 'AVENUE') {
                    cell.terrain = 'SIDEWALK';
                    break;
                }
            }
        }
    }
}

// ─── Agua ─────────────────────────────────────────────────
function addWater(grid, waterCfg) {
    const size = grid.length;
    const { type = 'river', depth = 0.20 } = waterCfg;

    if (type === 'coastal') {
        const waterDepth = Math.floor(size * depth);

        // ── Orilla con forma orgánica (noise por columna) ──
        // Precomputar desplazamiento suavizado por columna
        const offsets = [];
        const rawOff = [];
        for (let c = 0; c < size; c++) rawOff.push(rnd(-Math.floor(size * 0.05), Math.floor(size * 0.05)));
        // Suavizar con ventana de 5
        for (let c = 0; c < size; c++) {
            let sum = 0, cnt = 0;
            for (let d = -2; d <= 2; d++) {
                const idx = Math.max(0, Math.min(size - 1, c + d));
                sum += rawOff[idx]; cnt++;
            }
            offsets.push(Math.round(sum / cnt));
        }

        for (let c = 0; c < size; c++) {
            const shoreRow = size - waterDepth + offsets[c];
            for (let rr = 0; rr < size; rr++) {
                if (rr >= shoreRow && (grid[rr][c].terrain === 'EMPTY' || grid[rr][c].terrain === 'SIDEWALK')) {
                    grid[rr][c].terrain    = 'WATER';
                    grid[rr][c].buildingKey = null;
                }
            }
        }

        // Muelles
        for (let cc = 2; cc < size - 2; cc += rnd(4, 8)) {
            // Encontrar la primera celda de agua en esta columna
            for (let rr = size - 1; rr >= 0; rr--) {
                if (grid[rr][cc].terrain !== 'WATER') {
                    const dockRow = rr + 1;
                    if (dockRow < size && grid[dockRow][cc].terrain === 'WATER'
                        && grid[rr][cc].terrain !== 'ROAD'
                        && grid[rr][cc].terrain !== 'AVENUE') {
                        grid[dockRow][cc].terrain = 'DOCK';
                    }
                    break;
                }
            }
        }

    } else if (type === 'river') {
        // Río vertical sinuoso con anchura variable
        let cx = Math.floor(size * (0.2 + rndFloat() * 0.6));
        const baseW = Math.max(2, Math.floor(size * 0.035));
        for (let rr = 0; rr < size; rr++) {
            cx += rnd(-1, 1);
            cx = Math.max(baseW + 2, Math.min(size - baseW - 3, cx));
            const riverW = baseW + (rnd(0, 2) === 0 ? 1 : 0); // anchura levemente variable
            for (let dc = -riverW; dc <= riverW; dc++) {
                const cc = cx + dc;
                if (!isInBounds(rr, cc, size, size)) continue;
                const t = grid[rr][cc].terrain;
                if (t === 'EMPTY' || t === 'SIDEWALK') {
                    grid[rr][cc].terrain    = 'WATER';
                    grid[rr][cc].buildingKey = null;
                }
            }
        }

    } else if (type === 'lake') {
        const cr = Math.floor(size / 2) + rnd(-Math.floor(size / 6), Math.floor(size / 6));
        const cc = Math.floor(size / 2) + rnd(-Math.floor(size / 6), Math.floor(size / 6));
        const rad = Math.floor(size * 0.12);
        for (let rr = 0; rr < size; rr++) {
            for (let c = 0; c < size; c++) {
                if (distEuclid(rr, c, cr, cc) < rad + rnd(-1, 2)) {
                    if (grid[rr][c].terrain === 'EMPTY') {
                        grid[rr][c].terrain = 'WATER';
                    }
                }
            }
        }
    }
}

// ─── Puentes donde calles cruzan el agua ──────────────────
function buildBridges(grid) {
    const size = grid.length;
    for (let r = 1; r < size - 1; r++) {
        for (let c = 1; c < size - 1; c++) {
            const cell = grid[r][c];
            if (cell.terrain !== 'WATER') continue;

            const isRoadH = (grid[r][c-1]?.terrain === 'ROAD' || grid[r][c-1]?.terrain === 'AVENUE')
                         && (grid[r][c+1]?.terrain === 'ROAD' || grid[r][c+1]?.terrain === 'AVENUE');
            const isRoadV = (grid[r-1]?.[c]?.terrain === 'ROAD' || grid[r-1]?.[c]?.terrain === 'AVENUE')
                         && (grid[r+1]?.[c]?.terrain === 'ROAD' || grid[r+1]?.[c]?.terrain === 'AVENUE');

            if (isRoadH || isRoadV) {
                cell.terrain = 'ROAD';
                cell.label   = 'Puente';
                cell.isBridge = true;
            }
        }
    }
}

// ─── Plazas ───────────────────────────────────────────────
function buildPlazas(grid, manzanas, preset) {
    if (!manzanas || !manzanas.length) return;  // BUG FIX: guardar contra array vacío

    const size = grid.length;
    const centerR = size / 2, centerC = size / 2;
    let bestManzana = null, bestScore = -1;

    for (const m of manzanas) {
        const area = (m.r2 - m.r1) * (m.c2 - m.c1);
        const mR = (m.r1 + m.r2) / 2, mC = (m.c1 + m.c2) / 2;
        const score = area / (1 + distEuclid(mR, mC, centerR, centerC));
        if (score > bestScore && area >= 9) { bestScore = score; bestManzana = m; }
    }

    if (bestManzana) {
        const { r1, r2, c1, c2 } = bestManzana;
        const plazaName = generatePlazaName();
        for (let r = r1; r < r2; r++) {
            for (let c = c1; c < c2; c++) {
                grid[r][c].terrain     = 'PLAZA';
                grid[r][c].buildingKey = null;
                grid[r][c].label       = plazaName;
            }
        }
        const fr = Math.floor((r1 + r2) / 2), fc = Math.floor((c1 + c2) / 2);
        grid[fr][fc].terrain = 'FOUNTAIN';
        grid[fr][fc].label   = generateFountainName();
        bestManzana._isPlaza = true;
    }

    // Plazuelas secundarias
    const others = shuffle(manzanas.filter(m => !m._isPlaza && (m.r2 - m.r1) * (m.c2 - m.c1) >= 9));
    const extraPlazas = Math.min(2, Math.floor(others.length * 0.08));
    for (let i = 0; i < extraPlazas; i++) {
        const m = others[i];
        const plazaName = generatePlazaName();
        for (let r = m.r1; r < m.r2; r++) {
            for (let c = m.c1; c < m.c2; c++) {
                grid[r][c].terrain     = 'PLAZA';
                grid[r][c].buildingKey = null;
                grid[r][c].label       = plazaName;
            }
        }
        m._isPlaza = true;
    }
}

// ─── Parques ──────────────────────────────────────────────
function addNeighborhoodParks(grid, manzanas, preset) {
    const parkChance = preset.waterChance > 0.5 ? 0.05 : 0.10;
    for (const m of manzanas) {
        if (m._isPlaza) continue;
        const area = (m.r2 - m.r1) * (m.c2 - m.c1);
        if (area >= 6 && rndBool(parkChance)) {
            for (let r = m.r1; r < m.r2; r++) {
                for (let c = m.c1; c < m.c2; c++) {
                    grid[r][c].terrain     = 'PARK';
                    grid[r][c].buildingKey = null;
                }
            }
            m._isPark = true;
        }
    }
}

// ─── Identificar manzanas ─────────────────────────────────
function getManzanas(grid, roadRows, roadCols) {
    const manzanas = [];
    for (let i = 0; i < roadRows.length - 1; i++) {
        for (let j = 0; j < roadCols.length - 1; j++) {
            const r1 = roadRows[i] + 1, r2 = roadRows[i + 1];
            const c1 = roadCols[j] + 1, c2 = roadCols[j + 1];
            if (r2 - r1 >= 1 && c2 - c1 >= 1) {
                manzanas.push({ r1, r2, c1, c2, ri: i, ci: j });
            }
        }
    }
    return manzanas;
}

// ─── Llenar manzana ───────────────────────────────────────
let _buildingCounter = 0;

function fillManzana(grid, manzana, preset, placedUniques) {
    if (manzana._isPlaza || manzana._isPark) return;

    const { r1, r2, c1, c2 } = manzana;
    const mH = r2 - r1, mW = c2 - c1;
    if (mH < 1 || mW < 1) return;

    const context = getPositionContext(grid, Math.floor((r1 + r2) / 2), Math.floor((c1 + c2) / 2));
    const zoneWeights = preset.baseWeights?.zones || { res: 0.5, com: 0.25, civ: 0.15, ind: 0.10 };
    const zone = pickZone(zoneWeights);
    const density = preset.buildingDensity || 0.80;

    let cr = r1;
    while (cr < r2) {
        let cc = c1;
        while (cc < c2) {
            if (!rndBool(density)) { cc++; continue; }

            const bKey = selectBuildingType(preset, zone, r2 - cr, c2 - cc, placedUniques, context);
            if (!bKey) { cc++; continue; }

            const bDef = BUILDINGS[bKey];
            if (!bDef) { cc++; continue; }

            // BUG FIX: usar || para evitar NaN cuando maxW/maxH no están definidos
            const bW = rnd(bDef.minW || 1, Math.min(bDef.maxW || 2, c2 - cc));
            const bH = rnd(bDef.minH || 1, Math.min(bDef.maxH || 2, r2 - cr));

            const bId   = `b${++_buildingCounter}`;
            const bName = generateBuildingName(bKey);

            for (let br = cr; br < cr + bH && br < r2; br++) {
                for (let bc = cc; bc < cc + bW && bc < c2; bc++) {
                    grid[br][bc].buildingKey   = bKey;
                    grid[br][bc].buildingId    = bId;
                    grid[br][bc].buildingName  = bName;
                    grid[br][bc].zone          = zone;
                    grid[br][bc].terrain       = 'EMPTY';
                }
            }

            if (preset.buildingWeights[bKey]?.unique) placedUniques.add(bKey);

            // Pequeño jardín interior
            if (bW >= 3 && bH >= 3 && rndBool(0.3)) {
                const gr = cr + Math.floor(bH / 2), gc = cc + Math.floor(bW / 2);
                if (gr < r2 && gc < c2) {
                    grid[gr][gc].buildingKey  = null;
                    grid[gr][gc].buildingId   = null;
                    grid[gr][gc].buildingName = null;
                    grid[gr][gc].terrain      = 'GARDEN';
                }
            }

            cc += bW;
        }
        cr += rnd(1, 3);
    }
}

// ─── Terreno de borde variado ─────────────────────────────
// MEJORA: en lugar de solo FENCE, añade variedad según el tipo de ciudad
function addEdgeTerrain(grid, preset) {
    const size = grid.length;
    const edgeTerrains = preset.edgeTerrains || ['FENCE'];

    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (r === 0 || r === size - 1 || c === 0 || c === size - 1) {
                grid[r][c].terrain    = rndItem(edgeTerrains);
                grid[r][c].buildingKey = null;
            }
        }
    }
}

// ─── Generador principal ──────────────────────────────────
function generateCityWithPreset(preset, size) {
    _buildingCounter = 0;
    resetNameCounters();
    const grid = makeGrid(size);

    // 1. Red vial
    const { roadRows, roadCols } = buildRoads(grid, preset.streetSpacing || { avenue: 0, road: 6 });

    // 2. Agua
    if (preset.waterChance >= 1.0) {
        addWater(grid, preset.waterConfig || { type: 'coastal', depth: 0.25 });
    } else if (preset.waterChance > 0 && rndBool(preset.waterChance)) {
        addWater(grid, preset.waterConfig || { type: 'river', depth: 0.2 });
    }

    // 3. Puentes sobre el agua
    buildBridges(grid);

    // 4. Aceras
    buildSidewalks(grid);

    // 5. Manzanas
    const manzanas = getManzanas(grid, roadRows, roadCols);

    // 6. Plazas y parques
    buildPlazas(grid, manzanas, preset);
    addNeighborhoodParks(grid, manzanas, preset);

    // 7. Llenar manzanas
    const placedUniques = new Set();
    for (const m of shuffle(manzanas)) {
        fillManzana(grid, m, preset, placedUniques);
    }

    // 8. Borde
    addEdgeTerrain(grid, preset);

    return grid;
}

function generateCity(mode, variant, size) {
    const preset = variant ? applyVariant(mode, variant) : getPresetByName(mode);
    return generateCityWithPreset(preset, size);
}

function generateCityDescription(grid, mode, variant, preset) {
    const stats = getGridStatistics(grid);
    const size  = grid.length;
    const pop   = estimatePopulation(stats, mode);
    const label = preset?.variantLabel
        ? `${CITY_PRESETS[mode]?.label} · ${preset.variantLabel}`
        : (CITY_PRESETS[mode]?.label || mode);
    const desc  = preset?.variantDesc || CITY_PRESETS[mode]?.description || '';

    const topBuildings = Object.entries(stats.buildings)
        .sort(([, a], [, b]) => b - a).slice(0, 4)
        .map(([k]) => BUILDINGS[k]?.name || k).join(', ');

    const hasWater  = (stats.terrain['WATER']  || 0) > 10;
    const hasBridge = (stats.terrain['ROAD']   || 0) > 0 && grid.flat().some(c => c.isBridge);
    const waterNote = hasWater
        ? (hasBridge ? ' Las aguas son cruzadas por puentes de piedra.' : ' Las aguas rodean parte de la ciudad.')
        : '';

    return { label, desc, pop, topBuildings, buildingCount: stats.buildingCount, size: `${size}×${size}`, note: waterNote, zones: stats.zones };
}

if (typeof module !== 'undefined') module.exports = {
    generateCity, generateCityWithPreset, generateCityDescription,
    buildRoads, addWater, buildBridges, buildSidewalks, buildPlazas, fillManzana, getManzanas
};
