// ============================================================
//  UTILS — Funciones utilitarias del sistema
//  v4.1 — Bugs corregidos
// ============================================================

// ─── Generador pseudo-aleatorio (LCG) ───────────────────────
let _seed = Date.now();
function setRandomSeed(seed) {
    let h = 0;
    const s = String(seed);
    for (let i = 0; i < s.length; i++) {
        h = Math.imul(31, h) + s.charCodeAt(i) | 0;
    }
    _seed = h >>> 0;
}

function _lcg() {
    _seed = (Math.imul(1664525, _seed) + 1013904223) >>> 0;
    return _seed / 4294967296;
}

function rnd(min, max)  { return min + Math.floor(_lcg() * (max - min + 1)); }
function rndFloat()     { return _lcg(); }
function rndBool(p)     { return _lcg() < p; }
function rndItem(arr)   { return arr[Math.floor(_lcg() * arr.length)]; }

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(_lcg() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function generateRandomSeed() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let s = '';
    for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
    return s;
}

// ─── Distancias ────────────────────────────────────────────
function dist(r1, c1, r2, c2)       { return Math.abs(r1 - r2) + Math.abs(c1 - c2); }
function distEuclid(r1, c1, r2, c2) { return Math.hypot(r1 - r2, c1 - c2); }

// ─── Grid ──────────────────────────────────────────────────
function makeGrid(size) {
    return Array.from({ length: size }, () =>
        Array.from({ length: size }, () => ({
            type: 'terrain', terrain: 'EMPTY', buildingKey: null,
            buildingId: null, buildingName: null, label: null,
            zone: null, subZone: null, isDestroyed: false, isBridge: false
        }))
    );
}

function cloneGrid(grid)               { return grid.map(row => row.map(cell => ({ ...cell }))); }
function getGridSize(grid)             { return { rows: grid.length, cols: grid[0]?.length || 0 }; }
function isInBounds(r, c, rows, cols)  { return r >= 0 && r < rows && c >= 0 && c < cols; }

// ─── Contexto posicional ──────────────────────────────────
function getPositionContext(grid, r, c) {
    const rows = grid.length, cols = grid[0].length;
    const edgeMargin = 2;
    const isEdge   = r < edgeMargin || r >= rows - edgeMargin || c < edgeMargin || c >= cols - edgeMargin;
    const isCenter = Math.abs(r - rows / 2) < rows * 0.15 && Math.abs(c - cols / 2) < cols * 0.15;

    let nearWater = false, nearAvenue = false, nearRoad = false, nearPlaza = false, nearDock = false;
    const scanR = 4;
    for (let dr = -scanR; dr <= scanR; dr++) {
        for (let dc = -scanR; dc <= scanR; dc++) {
            if (!isInBounds(r + dr, c + dc, rows, cols)) continue;
            const cell = grid[r + dr][c + dc];
            if (cell.terrain === 'WATER')                               nearWater   = true;
            if (cell.terrain === 'AVENUE')                              nearAvenue  = true;
            if (cell.terrain === 'ROAD' || cell.terrain === 'AVENUE')  nearRoad    = true;
            if (cell.terrain === 'PLAZA')                               nearPlaza   = true;
            if (cell.buildingKey === 'dock' || cell.terrain === 'DOCK') nearDock    = true;
        }
    }
    return { isEdge, isCenter, nearWater, nearAvenue, nearRoad, nearPlaza, nearDock };
}

// ─── Selección de edificios ───────────────────────────────
// BUG FIX: ahora se leen las propiedades nearRoad / nearWater / nearAvenue
// de cada entrada en buildingWeights y se aplican como multiplicadores de peso.
// Esto hace que, por ejemplo, pescaderías y muelles aparezcan con mucha mayor
// frecuencia cuando realmente están cerca del agua, tal como se configuró en
// cityPresets.js pero que antes era completamente ignorado.
function selectBuildingType(preset, zone, blockH, blockW, placed, context) {
    const weights      = preset.buildingWeights || {};
    const contextRules = preset.contextRules    || [];

    const candidates = [];

    for (const [key, cfg] of Object.entries(weights)) {
        const bDef = BUILDINGS[key];
        if (!bDef) continue;

        // ── Filtrar por zona ──────────────────────────────
        const bZone    = cfg.zone || bDef.zone;
        const mainZone = bZone.split(':')[0];
        if (zone && mainZone !== zone && bZone !== zone) continue;

        // ── Filtrar por tamaño mínimo ─────────────────────
        if (blockW < (bDef.minW || 1) || blockH < (bDef.minH || 1)) continue;

        // ── Filtrar únicos ya colocados ───────────────────
        if (cfg.unique && placed.has(key)) continue;

        let w = cfg.w || 10;

        // ── Contexto desde buildingWeights (nearRoad, nearWater, nearAvenue) ──
        // BUG FIX: estas propiedades existían en el preset pero nunca se leían.
        if (cfg.nearWater   && !context.nearWater)   w *= 0.15;  // penalizar fuertemente si no hay agua
        if (cfg.nearWater   &&  context.nearWater)   w *= 2.5;   // potenciar si hay agua
        if (cfg.nearAvenue  && !context.nearAvenue)  w *= 0.40;
        if (cfg.nearAvenue  &&  context.nearAvenue)  w *= 1.8;
        if (cfg.nearRoad    &&  context.nearRoad)    w *= 1.4;

        // ── Reglas de contexto desde contextRules ─────────
        for (const rule of contextRules) {
            if (!rule.boost || !rule.boost.includes(key)) continue;
            const hit =
                (rule.if === 'nearWater'  && context.nearWater)  ||
                (rule.if === 'nearAvenue' && context.nearAvenue) ||
                (rule.if === 'nearPlaza'  && context.nearPlaza)  ||
                (rule.if === 'nearDock'   && context.nearDock)   ||
                (rule.if === 'center'     && context.isCenter)   ||
                (rule.if === 'edge'       && context.isEdge);
            if (hit) w *= (rule.weight || 1.5);
        }

        if (w > 0) candidates.push({ key, w });
    }

    if (!candidates.length) return null;

    // Selección ponderada
    const total = candidates.reduce((s, c) => s + c.w, 0);
    let roll = rndFloat() * total;
    for (const c of candidates) {
        roll -= c.w;
        if (roll <= 0) return c.key;
    }
    return candidates[candidates.length - 1].key;
}

// ─── Zona aleatoria según pesos ───────────────────────────
function pickZone(weights) {
    const entries = Object.entries(weights);
    const total   = entries.reduce((s, [, v]) => s + Math.max(0, v), 0);
    if (total <= 0) return entries[0]?.[0] || 'res';
    let roll = rndFloat() * total;
    for (const [k, v] of entries) {
        roll -= Math.max(0, v);
        if (roll <= 0) return k;
    }
    return entries[entries.length - 1][0];
}

// ─── Estadísticas ─────────────────────────────────────────
function getGridStatistics(grid) {
    const stats = {
        total: 0, terrain: {}, buildings: {}, zones: {},
        buildingCount: 0, roadLength: 0
    };
    for (const row of grid) {
        for (const cell of row) {
            stats.total++;
            if (cell.buildingKey) {
                stats.buildingCount++;
                stats.buildings[cell.buildingKey] = (stats.buildings[cell.buildingKey] || 0) + 1;
                if (cell.zone) stats.zones[cell.zone] = (stats.zones[cell.zone] || 0) + 1;
            } else {
                const t = cell.terrain || 'EMPTY';
                stats.terrain[t] = (stats.terrain[t] || 0) + 1;
                if (t === 'ROAD' || t === 'AVENUE') stats.roadLength++;
            }
        }
    }
    return stats;
}

function estimatePopulation(stats, mode) {
    const base = { capital: 5000, pueblo: 300, puerto: 2000, minera: 800, comercial: 3000 };
    const b = base[mode] || 1000;
    return Math.round(b * (0.8 + stats.buildingCount * 0.005));
}

// ─── Serialización ────────────────────────────────────────
function serializeGrid(grid) {
    return JSON.stringify(grid.map(row => row.map(cell => ({
        t:  cell.terrain,
        bk: cell.buildingKey,
        bn: cell.buildingName,
        bi: cell.buildingId,
        z:  cell.zone,
        l:  cell.label,
        d:  cell.isDestroyed  || undefined,
        br: cell.isBridge     || undefined
    }))));
}

function deserializeGrid(str) {
    const data = JSON.parse(str);
    return data.map(row => row.map(cell => ({
        type:         cell.bk ? 'building' : 'terrain',
        terrain:      cell.t  || 'EMPTY',
        buildingKey:  cell.bk || null,
        buildingName: cell.bn || null,
        buildingId:   cell.bi || null,
        zone:         cell.z  || null,
        label:        cell.l  || null,
        subZone:      null,
        isDestroyed:  cell.d  || false,
        isBridge:     cell.br || false
    })));
}

if (typeof module !== 'undefined') module.exports = {
    setRandomSeed, generateRandomSeed, rnd, rndFloat, rndBool, rndItem, shuffle,
    dist, distEuclid, makeGrid, cloneGrid, getGridSize, isInBounds,
    getPositionContext, selectBuildingType, pickZone,
    getGridStatistics, estimatePopulation, serializeGrid, deserializeGrid
};
