// Generador de nombres para calles, edificios y lugares
const NAMES = {
    streetAdjs: [
        "del Sol", "de la Luna", "del Rey", "Mayor", "Nueva", "Vieja",
        "del Comercio", "del Puerto", "Real", "Imperial", "del Olvido",
        "del Norte", "del Sur", "del Este", "del Oeste", "de la Paz",
        "de la Gloria", "de los Nobles", "del Mercado", "de los Artesanos",
        "de la Esperanza", "del Hierro", "de las Flores", "del Fuego",
        "del Viento", "de la Plata", "del Oro", "de la Cruz", "del Puente",
        "de la Muralla", "del Castillo", "de los Pobres", "de la Fortuna",
        "del Dragón", "del Cuervo", "del Halcón", "de la Serpiente"
    ],
    streetTypes: ["Calle", "Pasaje", "Camino", "Senda", "Vía", "Travesía", "Rúa", "Callejón"],
    avenueNames: [
        "Avenida Imperial", "Gran Vía", "Paseo del Rey", "Boulevard del Puerto",
        "Avenida de los Héroes", "Paseo Real", "Avenida Central", "Gran Paseo",
        "Vía Triumphalis", "Avenida del Comercio", "Gran Boulevar", "Ronda Mayor"
    ],
    surnames: [
        "García", "Martínez", "López", "Sánchez", "Pérez", "Rodríguez",
        "Fernández", "González", "Torres", "Ramírez", "Herrera", "Morales",
        "Valdez", "Castillo", "Ramos", "Vargas", "Cruz", "Ortega",
        "Mendoza", "Vega", "Delgado", "Ibáñez", "Molina", "Blanco"
    ],
    comNames: [
        "El Buen Gusto", "La Estrella", "El Faro", "La Corona", "El Alcázar",
        "Las Delicias", "El Escudo", "La Balanza", "El Portón", "Las Tres Lunas",
        "El Pergamino", "La Daga", "El Yunque", "Las Cadenas", "El Grifo",
        "La Antorcha", "El Puñal Rojo", "La Moneda de Oro", "El Espejo Roto"
    ],
    civNames: [
        "San Juan", "San Miguel", "Santa María", "San Pedro", "Santa Cruz",
        "San Marcos", "San Lucas", "San Andrés", "Santa Ana", "San Pablo",
        "San Tomás", "San Felipe", "Santa Teresa", "San Sebastián", "San Nicolás"
    ],
    farmAdjs: [
        "La Esperanza", "El Amanecer", "Los Robles", "El Valle", "La Colina",
        "Los Pinos", "El Molino", "La Pradera", "Los Álamos", "El Horizonte",
        "Las Eras", "El Trigal", "La Viña", "Los Olivos", "El Cereal"
    ],
    districtPrefixes: [
        "Alta", "Baja", "Nueva", "Vieja", "Real", "Imperial",
        "Gran", "Pequeña", "Libre", "Sagrada"
    ],
    tavernSuffixes: [
        "del Oso", "del Buey", "del Cuervo", "de la Dama", "del Dragón",
        "del Lobo", "del Jabalí", "de la Serpiente", "del Águila", "del León",
        "del Martillo Roto", "de los Tres Cerdos", "del Viejo Marino",
        "de la Viuda Alegre", "del Caballero Muerto"
    ],
    plazaNames: [
        "Plaza Mayor", "Plaza del Mercado", "Plaza Real", "Plaza Imperial",
        "Plaza de la Libertad", "Plaza de los Héroes", "Plaza de la Fuente",
        "Plaza del Ayuntamiento", "Plaza de la Catedral", "Plaza Central",
        "Plaza del Pueblo", "Plaza de Armas", "Plaza de la República",
        "Plaza de la Constitución"
    ],
    fountainNames: [
        "Fuente de los Deseos", "Fuente del Rey", "Fuente de la Vida",
        "Fuente de los Amantes", "Fuente de la Paz", "Fuente Sagrada",
        "Fuente del Dragón", "Fuente de las Musas", "Fuente Imperial"
    ]
};

// Contador para unicidad
let _nameCounters = {};
function _unique(base) {
    _nameCounters[base] = (_nameCounters[base] || 0) + 1;
    return _nameCounters[base] > 1 ? `${base} ${_toRoman(_nameCounters[base])}` : base;
}
function _toRoman(n) {
    const r = ["","I","II","III","IV","V","VI","VII","VIII","IX","X"];
    return r[n] || n;
}
function resetNameCounters() { _nameCounters = {}; }

function _pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateStreetName(type) {
    if (type === 'avenue') return _pick(NAMES.avenueNames);
    const t = _pick(NAMES.streetTypes);
    const adj = _pick(NAMES.streetAdjs);
    return `${t} ${adj}`;
}

function generateBuildingName(btype) {
    if (!btype) return "Edificio sin nombre";
    if (btype === 'granja' || btype === 'cabaña') return `${_pick(NAMES.farmAdjs)}`;
    if (btype === 'taberna' || btype === 'posada') return `La Taberna ${_pick(NAMES.tavernSuffixes)}`;
    if (btype === 'templo' || btype === 'catedral') return `${_pick(NAMES.civNames)}`;
    if (btype === 'ayto') return "Ayuntamiento Municipal";
    if (btype === 'banco') return `Banco ${_pick(NAMES.surnames)}`;
    if (btype === 'mercado') return `Mercado de ${_pick(NAMES.streetAdjs).replace('del ', '').replace('de la ', '').replace('de los ', '')}`;
    if (['com','tienda','tienda_gran','farmacia','pescaderia'].includes(btype)) {
        return `${_pick(NAMES.comNames)} ${_pick(NAMES.surnames)}`;
    }
    return `${_pick(NAMES.comNames)}`;
}

function generatePlazaName() { return _unique(_pick(NAMES.plazaNames)); }
function generateFountainName() { return _pick(NAMES.fountainNames); }
function generateDistrictName() { return `Barrio ${_pick(NAMES.districtPrefixes)}`; }

if (typeof module !== 'undefined') module.exports = { NAMES, generateStreetName, generateBuildingName, generatePlazaName, generateFountainName, resetNameCounters };
