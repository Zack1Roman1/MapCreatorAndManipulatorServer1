// ============================================================
//  CITY PRESETS — Configuraciones de ciudades con variantes
// ============================================================
const CITY_PRESETS = {

    // ═══════════════════════════════════════════════════════
    //  CAPITAL
    // ═══════════════════════════════════════════════════════
    capital: {
        label: "🏛️ Capital Imperial",
        description: "Ciudad grande con zona cívica prominente, grandes avenidas y edificios imponentes. Centro de poder y cultura de la región.",
        streetSpacing: { avenue: 10, road: 5 },
        waterChance: 0.3,
        waterConfig: { type: 'river', depth: 0.2 },
        buildingDensity: 0.85,
        baseWeights: {
            zones:  { res: 0.35, com: 0.30, civ: 0.25, ind: 0.10 },
            res:    { luxury: 0.35, middle: 0.45, poor: 0.20 },
            com:    { market: 0.4,  shops: 0.35, services: 0.25 },
            civ:    { government: 0.55, culture: 0.30, religion: 0.15 },
            ind:    { craft: 0.65, storage: 0.35 }
        },
        buildingWeights: {
            casa_min:   { w: 10, zone: 'res:poor' },
            casa_med:   { w: 20, zone: 'res:middle' },
            casa_gran:  { w: 15, zone: 'res:luxury' },
            edificio:   { w: 25, zone: 'res:middle' },
            villa:      { w: 8,  zone: 'res:luxury' },
            tienda:     { w: 15, zone: 'com:shops', nearRoad: true },
            tienda_gran:{ w: 12, zone: 'com:shops', nearAvenue: true },
            mercado:    { w: 8,  zone: 'com:market', minSize: 4 },
            banco:      { w: 6,  zone: 'com:services' },
            taberna:    { w: 10, zone: 'com:shops' },
            posada:     { w: 8,  zone: 'com:services' },
            farmacia:   { w: 5,  zone: 'com:services' },
            templo:     { w: 8,  zone: 'civ:religion' },
            catedral:   { w: 3,  zone: 'civ:religion', unique: true },
            ayto:       { w: 5,  zone: 'civ:government', unique: true },
            escuela:    { w: 6,  zone: 'civ:culture' },
            biblioteca: { w: 4,  zone: 'civ:culture' },
            hospital:   { w: 4,  zone: 'civ:government' },
            teatro:     { w: 3,  zone: 'civ:culture' },
            herrería:   { w: 8,  zone: 'ind:craft' },
            almacen:    { w: 6,  zone: 'ind:storage' },
            taller:     { w: 10, zone: 'ind:craft' }
        },
        contextRules: [
            { if: "nearWater", boost: ["dock","pescaderia","astillero"], weight: 1.8 },
            { if: "nearAvenue", boost: ["tienda_gran","banco","c_comercial"], weight: 1.5 },
            { if: "nearPlaza", boost: ["templo","ayto","teatro"], weight: 2.0 },
            { if: "center",   boost: ["ayto","catedral","teatro"], weight: 2.5 }
        ],
        variants: {
            prospera: {
                label: "✨ Próspera",
                description: "Ciudad rica con comercio de lujo y residencias elegantes.",
                modZones:  { com: +0.15, civ: +0.05, res: -0.10, ind: -0.10 },
                modRes:    { luxury: +0.30, poor: -0.30 },
                add:    ["villa","mansion","c_comercial","bolsa","lonja"],
                remove: ["casa_min","cabaña"],
                boost:  { villa: 2.0, mansion: 1.8, banco: 1.5, c_comercial: 1.6 }
            },
            religiosa: {
                label: "⛩️ Religiosa",
                description: "Ciudad dominada por templos y monasterios sagrados.",
                modZones:  { civ: +0.20, com: -0.10, ind: -0.10 },
                modCiv:    { religion: +0.40, culture: +0.10 },
                add:    ["catedral","templo","biblioteca"],
                remove: ["fundicion","mina"],
                boost:  { catedral: 3.0, templo: 2.0 }
            },
            militar: {
                label: "⚔️ Militar",
                description: "Ciudad-fortaleza con murallas, cuarteles y arsenales.",
                modZones:  { civ: +0.10, ind: +0.10, res: -0.10, com: -0.10 },
                add:    ["cuartel","arsenal","torre","muralla"],
                remove: ["catedral","teatro","biblioteca"],
                boost:  { cuartel: 2.5, arsenal: 2.0, torre: 2.0, muralla: 3.0 },
                contextExtra: [{ if: "edge", boost: ["muralla","torre"], weight: 4.0 }]
            },
            cultural: {
                label: "🎭 Cultural",
                description: "Capital artística con teatros, academias y museos.",
                modZones:  { civ: +0.15, com: +0.05, ind: -0.20 },
                modCiv:    { culture: +0.40 },
                add:    ["teatro","biblioteca","escuela"],
                remove: ["herrería","fundicion"],
                boost:  { teatro: 2.5, biblioteca: 2.0, escuela: 1.5 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    //  PUEBLO
    // ═══════════════════════════════════════════════════════
    pueblo: {
        label: "🏡 Pueblo Rural",
        description: "Comunidad pequeña y acogedora con enfoque agrícola y vida tranquila.",
        streetSpacing: { avenue: 0, road: 8 },
        waterChance: 0.3,
        waterConfig: { type: 'river', depth: 0.15 },
        buildingDensity: 0.60,
        baseWeights: {
            zones:  { res: 0.60, com: 0.20, civ: 0.15, ind: 0.05 },
            res:    { poor: 0.65, middle: 0.30, luxury: 0.05 },
            com:    { shops: 0.70, services: 0.30 }
        },
        buildingWeights: {
            casa_min:   { w: 40, zone: 'res:poor' },
            casa_med:   { w: 20, zone: 'res:middle' },
            cabaña:     { w: 25, zone: 'res:poor' },
            granja:     { w: 30, zone: 'res', minSize: 5 },
            tienda:     { w: 15, zone: 'com:shops' },
            taberna:    { w: 12, zone: 'com:shops' },
            posada:     { w: 8,  zone: 'com:services' },
            templo:     { w: 10, zone: 'civ:religion' },
            escuela:    { w: 5,  zone: 'civ:culture' },
            herrería:   { w: 10, zone: 'ind:craft' },
            molino:     { w: 8,  zone: 'ind:craft' }
        },
        contextRules: [
            { if: "nearWater", boost: ["pescaderia","molino"], weight: 1.5 }
        ],
        variants: {
            pesquero: {
                label: "🐟 Pesquero",
                description: "Pueblo costero que vive del mar y la pesca.",
                waterChance: 1.0,
                waterConfig: { type: 'coastal', depth: 0.35 },
                add:    ["pescaderia","dock","almacen"],
                remove: ["granja","molino"],
                boost:  { pescaderia: 3.0, dock: 2.5 }
            },
            minero: {
                label: "⛏️ Minero",
                description: "Asentamiento rudo construido alrededor de una mina.",
                modZones:  { ind: +0.20, res: -0.10, com: -0.10 },
                waterChance: 0,
                add:    ["mina","herrería","almacen"],
                remove: ["granja"],
                boost:  { mina: 3.0, herrería: 1.8 }
            },
            prospero: {
                label: "💛 Próspero",
                description: "Pueblo bien establecido con cierta riqueza acumulada.",
                modRes:    { middle: +0.30, luxury: +0.10, poor: -0.40 },
                add:    ["casa_gran","banco","posada"],
                remove: ["cabaña"],
                boost:  { casa_gran: 2.0, tienda: 1.5 }
            },
            abandonado: {
                label: "💀 Abandonado",
                description: "Pueblo en decadencia, la mayoría de edificios en ruinas.",
                modRes:    { poor: +0.50, luxury: -0.50 },
                buildingDensity: 0.35,
                add:    ["cabaña"],
                remove: ["banco","posada","escuela","teatro"],
                boost:  { cabaña: 2.0, casa_min: 1.5 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    //  PUERTO
    // ═══════════════════════════════════════════════════════
    puerto: {
        label: "⚓ Puerto Marítimo",
        description: "Ciudad costera vibrante donde el comercio marítimo lo es todo.",
        streetSpacing: { avenue: 8, road: 5 },
        waterChance: 1.0,
        waterConfig: { type: 'coastal', depth: 0.30 },
        buildingDensity: 0.80,
        baseWeights: {
            zones:  { res: 0.30, com: 0.40, civ: 0.10, ind: 0.20 },
            res:    { poor: 0.40, middle: 0.45, luxury: 0.15 },
            com:    { market: 0.45, shops: 0.30, services: 0.25 },
            ind:    { craft: 0.30, storage: 0.70 }
        },
        buildingWeights: {
            casa_min:   { w: 15, zone: 'res:poor' },
            casa_med:   { w: 20, zone: 'res:middle' },
            edificio:   { w: 15, zone: 'res:middle' },
            tienda:     { w: 15, zone: 'com:shops' },
            mercado:    { w: 12, zone: 'com:market' },
            taberna:    { w: 15, zone: 'com:shops' },
            posada:     { w: 12, zone: 'com:services' },
            pescaderia: { w: 20, zone: 'com:shops', nearWater: true },
            banco:      { w: 8,  zone: 'com:services' },
            lonja:      { w: 8,  zone: 'com:market' },
            almacen:    { w: 20, zone: 'ind:storage', nearWater: true },
            dock:       { w: 15, zone: 'ind', nearWater: true },
            astillero:  { w: 6,  zone: 'ind', nearWater: true },
            templo:     { w: 6,  zone: 'civ:religion' },
            hospital:   { w: 4,  zone: 'civ:government' }
        },
        contextRules: [
            { if: "nearWater", boost: ["dock","pescaderia","almacen","astillero"], weight: 2.5 },
            { if: "nearDock",  boost: ["almacen","mercado","lonja"], weight: 1.8 },
            { if: "nearAvenue",boost: ["banco","lonja","posada"], weight: 1.4 }
        ],
        variants: {
            comercial: {
                label: "💰 Comercial",
                description: "Puerto dominado por mercaderes y gremios comerciales.",
                modZones:  { com: +0.15, ind: -0.05, res: -0.10 },
                add:    ["lonja","bolsa","c_comercial","banco"],
                boost:  { lonja: 2.0, banco: 1.8, mercado: 1.5 }
            },
            pirata: {
                label: "💀 Pirata",
                description: "Puerto oscuro donde la ley es una sugerencia.",
                modZones:  { com: +0.10, civ: -0.05 },
                remove: ["hospital","escuela","biblioteca"],
                add:    ["taberna","almacen"],
                boost:  { taberna: 3.0, almacen: 1.8, dock: 2.0 }
            },
            militar: {
                label: "⚓ Naval",
                description: "Puerto bajo control militar con flota de guerra.",
                modZones:  { civ: +0.15, com: -0.10 },
                add:    ["cuartel","arsenal","torre"],
                boost:  { cuartel: 2.5, arsenal: 2.0, dock: 2.0 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    //  MINERA
    // ═══════════════════════════════════════════════════════
    minera: {
        label: "⛏️ Ciudad Minera",
        description: "Asentamiento industrial construido alrededor de las minas y sus recursos.",
        streetSpacing: { avenue: 0, road: 7 },
        waterChance: 0.1,
        waterConfig: { type: 'river', depth: 0.15 },
        buildingDensity: 0.75,
        baseWeights: {
            zones:  { res: 0.40, com: 0.20, civ: 0.10, ind: 0.30 },
            res:    { poor: 0.55, middle: 0.40, luxury: 0.05 },
            ind:    { craft: 0.40, storage: 0.60 }
        },
        buildingWeights: {
            casa_min:   { w: 30, zone: 'res:poor' },
            casa_med:   { w: 20, zone: 'res:middle' },
            cabaña:     { w: 15, zone: 'res:poor' },
            tienda:     { w: 15, zone: 'com:shops' },
            taberna:    { w: 20, zone: 'com:shops' },
            posada:     { w: 8,  zone: 'com:services' },
            templo:     { w: 6,  zone: 'civ:religion' },
            herrería:   { w: 20, zone: 'ind:craft' },
            almacen:    { w: 15, zone: 'ind:storage' },
            mina:       { w: 25, zone: 'ind' },
            cantera:    { w: 10, zone: 'ind' },
            fundicion:  { w: 10, zone: 'ind:craft' },
            taller:     { w: 10, zone: 'ind:craft' }
        },
        contextRules: [
            { if: "edge",   boost: ["mina","cantera"], weight: 2.0 },
            { if: "center", boost: ["herrería","fundicion","almacen"], weight: 1.5 }
        ],
        variants: {
            oro: {
                label: "🥇 Minas de Oro",
                description: "Ciudad enriquecida por el oro, nueva riqueza en la tierra.",
                modRes:    { luxury: +0.25, middle: +0.15, poor: -0.40 },
                add:    ["villa","banco","mansion"],
                boost:  { mina: 2.5, banco: 2.0, villa: 1.8 }
            },
            carbon: {
                label: "🪨 Hullera",
                description: "Ciudad oscura y polvorienta de explotación de carbón.",
                modZones:  { ind: +0.20, res: -0.10, com: -0.10 },
                modRes:    { poor: +0.40, luxury: -0.40 },
                boost:  { mina: 3.0, fundicion: 2.0, almacen: 1.5 }
            },
            abandonada: {
                label: "💀 Abandonada",
                description: "Las vetas se agotaron. Solo quedan fantasmas y ruinas.",
                buildingDensity: 0.30,
                modRes:    { poor: +0.60 },
                remove: ["banco","villa","mansion","hospital"],
                boost:  { cabaña: 2.0, mina: 1.0 }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    //  COMERCIAL
    // ═══════════════════════════════════════════════════════
    comercial: {
        label: "🏬 Ciudad Comercial",
        description: "Ciudad mercantil donde el dinero fluye y los negocios prosperan.",
        streetSpacing: { avenue: 7, road: 4 },
        waterChance: 0.25,
        waterConfig: { type: 'river', depth: 0.15 },
        buildingDensity: 0.90,
        baseWeights: {
            zones:  { res: 0.25, com: 0.50, civ: 0.15, ind: 0.10 },
            res:    { luxury: 0.25, middle: 0.55, poor: 0.20 },
            com:    { market: 0.45, shops: 0.35, services: 0.20 }
        },
        buildingWeights: {
            casa_med:   { w: 20, zone: 'res:middle' },
            edificio:   { w: 20, zone: 'res:middle' },
            villa:      { w: 10, zone: 'res:luxury' },
            tienda:     { w: 25, zone: 'com:shops' },
            tienda_gran:{ w: 20, zone: 'com:shops' },
            mercado:    { w: 15, zone: 'com:market' },
            banco:      { w: 12, zone: 'com:services' },
            taberna:    { w: 10, zone: 'com:shops' },
            posada:     { w: 10, zone: 'com:services' },
            lonja:      { w: 8,  zone: 'com:market' },
            bolsa:      { w: 6,  zone: 'com:services' },
            c_comercial:{ w: 5,  zone: 'com:market' },
            almacen:    { w: 10, zone: 'ind:storage' },
            taller:     { w: 8,  zone: 'ind:craft' }
        },
        contextRules: [
            { if: "nearAvenue", boost: ["tienda_gran","banco","c_comercial","bolsa"], weight: 2.0 },
            { if: "nearPlaza",  boost: ["mercado","lonja"], weight: 1.8 },
            { if: "nearWater",  boost: ["almacen","dock","pescaderia"], weight: 1.5 }
        ],
        variants: {
            lujo: {
                label: "💎 De Lujo",
                description: "Ciudad de alta gama para los más adinerados.",
                modRes:    { luxury: +0.40, poor: -0.40 },
                remove: ["casa_min","cabaña"],
                add:    ["mansion","villa","bolsa"],
                boost:  { villa: 2.0, mansion: 2.5, banco: 1.8, bolsa: 1.6 }
            },
            barato: {
                label: "🧳 Mercado Popular",
                description: "Comercio popular y animado, gente de toda condición.",
                modRes:    { poor: +0.30, middle: +0.10, luxury: -0.40 },
                remove: ["bolsa","c_comercial"],
                add:    ["tienda","taberna","mercado"],
                boost:  { mercado: 2.0, tienda: 1.5, taberna: 2.0 }
            },
            gremial: {
                label: "⚒️ Gremial",
                description: "Ciudad organizada por gremios artesanales especializados.",
                modZones:  { ind: +0.15, com: -0.05 },
                add:    ["herrería","taller","fundicion"],
                boost:  { taller: 2.0, herrería: 1.8, lonja: 1.5 }
            }
        }
    }
};

// ─── Funciones utilitarias ────────────────────────────────
function getPresetByName(name) {
    return CITY_PRESETS[name] ? JSON.parse(JSON.stringify(CITY_PRESETS[name])) : JSON.parse(JSON.stringify(CITY_PRESETS.capital));
}

function applyVariant(modeName, variantName) {
    const preset = getPresetByName(modeName);
    if (!variantName || !preset.variants || !preset.variants[variantName]) return preset;
    const v = preset.variants[variantName];

    // Aplicar waterChance y waterConfig si la variante los define
    if (v.waterChance !== undefined) preset.waterChance = v.waterChance;
    if (v.waterConfig) preset.waterConfig = v.waterConfig;
    if (v.buildingDensity !== undefined) preset.buildingDensity = v.buildingDensity;

    // Modificar pesos de zonas
    if (v.modZones) {
        for (const [z, delta] of Object.entries(v.modZones)) {
            if (preset.baseWeights.zones[z] !== undefined)
                preset.baseWeights.zones[z] = Math.max(0.01, preset.baseWeights.zones[z] + delta);
        }
        _normalizeWeights(preset.baseWeights.zones);
    }
    if (v.modRes && preset.baseWeights.res) {
        for (const [z, delta] of Object.entries(v.modRes)) {
            if (preset.baseWeights.res[z] !== undefined)
                preset.baseWeights.res[z] = Math.max(0, preset.baseWeights.res[z] + delta);
        }
        _normalizeWeights(preset.baseWeights.res);
    }
    if (v.modCiv && preset.baseWeights.civ) {
        for (const [z, delta] of Object.entries(v.modCiv)) {
            if (preset.baseWeights.civ[z] !== undefined)
                preset.baseWeights.civ[z] = Math.max(0, preset.baseWeights.civ[z] + delta);
        }
        _normalizeWeights(preset.baseWeights.civ);
    }

    // Añadir edificios
    if (v.add) {
        for (const bKey of v.add) {
            if (!preset.buildingWeights[bKey]) {
                const b = BUILDINGS[bKey];
                if (b) preset.buildingWeights[bKey] = { w: 8, zone: b.zone };
            }
        }
    }
    // Eliminar edificios
    if (v.remove) {
        for (const bKey of v.remove) delete preset.buildingWeights[bKey];
    }
    // Boostear edificios
    if (v.boost) {
        for (const [bKey, mult] of Object.entries(v.boost)) {
            if (preset.buildingWeights[bKey]) preset.buildingWeights[bKey].w *= mult;
        }
    }
    // Reglas de contexto extra
    if (v.contextExtra) preset.contextRules = [...(preset.contextRules||[]), ...v.contextExtra];

    // Guardar descripción de la variante
    preset.variantLabel = v.label;
    preset.variantDesc  = v.description;

    return preset;
}

function _normalizeWeights(obj) {
    const total = Object.values(obj).reduce((s, v) => s + Math.max(0, v), 0);
    if (total <= 0) return;
    for (const k of Object.keys(obj)) obj[k] = Math.max(0, obj[k]) / total;
}

function getVariantsForMode(mode) {
    const p = CITY_PRESETS[mode];
    if (!p || !p.variants) return [];
    return Object.entries(p.variants).map(([key, v]) => ({ key, label: v.label, description: v.description }));
}

function getAllCityTypes() {
    return Object.entries(CITY_PRESETS).map(([key, v]) => ({ key, label: v.label, description: v.description }));
}

if (typeof module !== 'undefined') module.exports = { CITY_PRESETS, getPresetByName, applyVariant, getVariantsForMode, getAllCityTypes };
