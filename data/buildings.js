// Tipos de edificios con sus propiedades
const BUILDINGS = {
    // ── Residencial ──────────────────────────────────────────
    casa_min:    { emoji:"🏠", bg:"#1a2a10", name:"Casa modesta",       zone:"res", minW:1, maxW:2, minH:1, maxH:2 },
    casa_med:    { emoji:"🏘", bg:"#1e3012", name:"Casa mediana",        zone:"res", minW:2, maxW:3, minH:2, maxH:3 },
    casa_gran:   { emoji:"🏡", bg:"#22381a", name:"Casa con jardín",     zone:"res", minW:2, maxW:3, minH:2, maxH:3 },
    villa:       { emoji:"🏰", bg:"#2a4020", name:"Villa señorial",      zone:"res", minW:3, maxW:5, minH:3, maxH:5 },
    edificio:    { emoji:"🏢", bg:"#1a2040", name:"Edificio de aptos",   zone:"res", minW:2, maxW:4, minH:2, maxH:4 },
    granja:      { emoji:"🚜", bg:"#302210", name:"Granja",              zone:"res", minW:5, maxW:7, minH:5, maxH:7 },
    cabaña:      { emoji:"🛖", bg:"#281e10", name:"Cabaña rústica",      zone:"res", minW:1, maxW:2, minH:1, maxH:2 },
    mansion:     { emoji:"🏯", bg:"#2c3820", name:"Mansión",             zone:"res", minW:4, maxW:6, minH:4, maxH:6 },

    // ── Comercial ─────────────────────────────────────────────
    tienda:      { emoji:"🏪", bg:"#3a1e08", name:"Tienda",              zone:"com", minW:1, maxW:2, minH:1, maxH:2 },
    tienda_gran: { emoji:"🏬", bg:"#4a2808", name:"Tienda grande",       zone:"com", minW:2, maxW:4, minH:1, maxH:3 },
    mercado:     { emoji:"🏟", bg:"#402010", name:"Mercado",             zone:"com", minW:3, maxW:6, minH:3, maxH:6 },
    banco:       { emoji:"🏦", bg:"#1a3020", name:"Banco",               zone:"com", minW:2, maxW:3, minH:2, maxH:3 },
    taberna:     { emoji:"🍺", bg:"#381808", name:"Taberna",             zone:"com", minW:2, maxW:3, minH:2, maxH:3 },
    posada:      { emoji:"🏨", bg:"#3a2010", name:"Posada",              zone:"com", minW:2, maxW:4, minH:2, maxH:4 },
    pescaderia:  { emoji:"🐟", bg:"#102030", name:"Pescadería",          zone:"com", minW:1, maxW:3, minH:1, maxH:2 },
    farmacia:    { emoji:"⚗️", bg:"#101830", name:"Boticaria",           zone:"com", minW:1, maxW:2, minH:1, maxH:2 },
    c_comercial: { emoji:"🏛", bg:"#3a2808", name:"Centro comercial",    zone:"com", minW:4, maxW:7, minH:3, maxH:5 },
    lonja:       { emoji:"⚖️", bg:"#1a2828", name:"Lonja de comercio",   zone:"com", minW:3, maxW:5, minH:3, maxH:4 },
    bolsa:       { emoji:"💰", bg:"#1e2a10", name:"Casa de cambio",      zone:"com", minW:2, maxW:3, minH:2, maxH:3 },

    // ── Cívico ────────────────────────────────────────────────
    templo:      { emoji:"⛪", bg:"#1a1830", name:"Templo",              zone:"civ", minW:3, maxW:5, minH:3, maxH:5 },
    catedral:    { emoji:"⛩️", bg:"#20183a", name:"Catedral",            zone:"civ", minW:4, maxW:7, minH:4, maxH:7 },
    ayto:        { emoji:"🏛️", bg:"#282010", name:"Ayuntamiento",        zone:"civ", minW:3, maxW:6, minH:3, maxH:6 },
    escuela:     { emoji:"🏫", bg:"#101e38", name:"Escuela",             zone:"civ", minW:2, maxW:4, minH:2, maxH:4 },
    biblioteca:  { emoji:"📚", bg:"#1e1028", name:"Biblioteca",          zone:"civ", minW:2, maxW:4, minH:2, maxH:4 },
    hospital:    { emoji:"🏥", bg:"#102020", name:"Hospital",            zone:"civ", minW:3, maxW:5, minH:3, maxH:5 },
    teatro:      { emoji:"🎭", bg:"#2a1030", name:"Teatro",              zone:"civ", minW:3, maxW:5, minH:3, maxH:5 },
    cuartel:     { emoji:"🛡️", bg:"#201810", name:"Cuartel",             zone:"civ", minW:3, maxW:5, minH:3, maxH:5 },
    torre:       { emoji:"🗼", bg:"#181818", name:"Torre de guardia",    zone:"civ", minW:2, maxW:3, minH:2, maxH:3 },
    muralla:     { emoji:"🧱", bg:"#201a10", name:"Sección de muralla",  zone:"civ", minW:1, maxW:8, minH:1, maxH:2 },
    arsenal:     { emoji:"⚔️", bg:"#201010", name:"Arsenal",             zone:"civ", minW:3, maxW:5, minH:3, maxH:4 },

    // ── Industrial ───────────────────────────────────────────
    herrería:    { emoji:"⚒️", bg:"#301808", name:"Herrería",            zone:"ind", minW:2, maxW:3, minH:2, maxH:3 },
    almacen:     { emoji:"📦", bg:"#201818", name:"Almacén",             zone:"ind", minW:3, maxW:6, minH:2, maxH:5 },
    mina:        { emoji:"⛏️", bg:"#181810", name:"Entrada a mina",      zone:"ind", minW:2, maxW:4, minH:2, maxH:4 },
    cantera:     { emoji:"🪨", bg:"#201c18", name:"Cantera",             zone:"ind", minW:3, maxW:5, minH:3, maxH:5 },
    astillero:   { emoji:"🚢", bg:"#0a1a28", name:"Astillero",           zone:"ind", minW:4, maxW:7, minH:4, maxH:7 },
    molino:      { emoji:"🪃", bg:"#281e10", name:"Molino",              zone:"ind", minW:2, maxW:3, minH:2, maxH:3 },
    taller:      { emoji:"🔧", bg:"#201410", name:"Taller artesanal",    zone:"ind", minW:2, maxW:3, minH:2, maxH:3 },
    fundicion:   { emoji:"🔥", bg:"#380e08", name:"Fundición",           zone:"ind", minW:3, maxW:5, minH:3, maxH:5 },
    dock:        { emoji:"🏗️", bg:"#0e1820", name:"Muelle de carga",    zone:"ind", minW:3, maxW:6, minH:2, maxH:4 }
};

function getBuildingByKey(key) { return BUILDINGS[key] || null; }
function getBuildingsByZone(zone) {
    return Object.entries(BUILDINGS)
        .filter(([k,v]) => v.zone === zone || v.zone.startsWith(zone))
        .reduce((acc, [k,v]) => { acc[k] = v; return acc; }, {});
}
function getAllBuildingKeys() { return Object.keys(BUILDINGS); }

if (typeof module !== 'undefined') module.exports = { BUILDINGS, getBuildingByKey, getBuildingsByZone };
