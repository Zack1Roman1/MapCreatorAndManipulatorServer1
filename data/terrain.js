// Tipos de terreno con emoji, color de fondo y nombre
const T = {
    EMPTY:    { emoji: "·",   bg: "#1a1610", name: "Terreno vacío" },
    AVENUE:   { emoji: "═",   bg: "#3a2e10", name: "Avenida principal" },
    ROAD:     { emoji: "─",   bg: "#252020", name: "Calle" },
    ALLEY:    { emoji: "·",   bg: "#1e1a15", name: "Callejón" },
    SIDEWALK: { emoji: " ",   bg: "#2a2218", name: "Acera" },
    PLAZA:    { emoji: "◆",   bg: "#302818", name: "Plaza pública" },
    GARDEN:   { emoji: "♣",   bg: "#142010", name: "Jardín interior" },
    PARK:     { emoji: "🌲",   bg: "#0e1a0a", name: "Parque" },
    FOUNTAIN: { emoji: "💧",  bg: "#0a1822", name: "Fuente" },
    WATER:    { emoji: "≈",   bg: "#0a1830", name: "Agua" },
    DOCK:     { emoji: "⚓",  bg: "#0d1a28", name: "Muelle" },
    FENCE:    { emoji: "▪",   bg: "#201810", name: "Valla" }
};

function getTerrainByKey(key) { return T[key] || T.EMPTY; }
function getTerrainByName(name) { return Object.values(T).find(t => t.name === name) || T.EMPTY; }

if (typeof module !== 'undefined') module.exports = { T, getTerrainByKey, getTerrainByName };
