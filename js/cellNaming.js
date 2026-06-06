// ============================================================
//  CELL NAMING SYSTEM — Nombramiento mejorado de casillas
//  Formato: (Tipo de casilla) nombre personalizado
// ============================================================

/**
 * Obtiene el tipo descriptivo de una casilla
 * @param {Object} cell - La celda del grid
 * @returns {string} Nombre del tipo de casilla
 */
function getCellType(cell) {
    // Primero: si es un edificio
    if (cell.buildingKey && BUILDINGS[cell.buildingKey]) {
        const building = BUILDINGS[cell.buildingKey];
        return building.name || cell.buildingKey;
    }
    
    // Segundo: si es terreno
    const terrainTypes = {
        'ROAD': 'Camino',
        'AVENUE': 'Avenida',
        'SIDEWALK': 'Acera',
        'PLAZA': 'Plaza',
        'PLAZA_SIMPLE': 'Plazuela',
        'FOUNTAIN': 'Fuente',
        'PARK': 'Parque',
        'GARDEN': 'Jardín',
        'WATER': 'Agua',
        'DOCK': 'Muelle',
        'FENCE': 'Valla',
        'EMPTY': 'Terreno vacío',
        'BRIDGE': 'Puente',
        'FOREST': 'Bosque'
    };
    
    return terrainTypes[cell.terrain] || 'Ubicación desconocida';
}

/**
 * Construye el nombre completo formateado de una casilla
 * Formato: Tipo -- nombre personalizado
 * @param {Object} cell - La celda del grid
 * @returns {string} Nombre completo formateado
 */
function getFormattedCellName(cell) {
    const cellType = getCellType(cell);
    const customName = cell.buildingName || cell.label || '';
    
    // Si hay nombre personalizado
    if (customName) {
        return `${cellType} -- ${customName}`;
    }
    
    // Solo el tipo de casilla
    return cellType;
}

/**
 * Obtiene información completa de una casilla con contexto
 * @param {Object} cell - La celda del grid
 * @param {number} row - Fila en el grid
 * @param {number} col - Columna en el grid
 * @returns {Object} Objeto con toda la información de la casilla
 */
function getCellInfo(cell, row, col) {
    const cellType = getCellType(cell);
    const customName = cell.buildingName || cell.label || '';
    const formattedName = getFormattedCellName(cell);
    
    let details = {
        position: { row, col },
        cellType: cellType,
        customName: customName,
        formattedName: formattedName,
        terrain: cell.terrain,
        buildingKey: cell.buildingKey || null,
        buildingId: cell.buildingId || null,
        zone: cell.zone || 'N/A'
    };
    
    // Información adicional según tipo
    if (cell.buildingKey && BUILDINGS[cell.buildingKey]) {
        const building = BUILDINGS[cell.buildingKey];
        details.building = {
            emoji: building.emoji,
            zone: building.zone,
            size: {
                width: { min: building.minW, max: building.maxW },
                height: { min: building.minH, max: building.maxH }
            }
        };
    }
    
    return details;
}

/**
 * Genera un tooltip para mostrar en el hover de una casilla
 * @param {Object} cell - La celda del grid
 * @param {number} row - Fila en el grid
 * @param {number} col - Columna en el grid
 * @returns {string} HTML para tooltip
 */
function getCellTooltip(cell, row, col) {
    const info = getCellInfo(cell, row, col);
    let html = `<strong>${info.formattedName}</strong>`;
    
    if (info.customName) {
        html += `<br><small>Posición: [${row}, ${col}]</small>`;
    }
    
    if (info.building) {
        html += `<br><small>Zona: ${info.zone}</small>`;
    }
    
    return html;
}

/**
 * Actualiza el título (title) de un elemento de celda en el DOM
 * @param {HTMLElement} element - El elemento DOM de la celda
 * @param {Object} cell - La celda del grid
 * @param {number} row - Fila en el grid
 * @param {number} col - Columna en el grid
 */
function updateCellTitle(element, cell, row, col) {
    if (element) {
        element.title = getFormattedCellName(cell);
    }
}

/**
 * Formatea un nombre de calle/plaza completo
 * Útil para mostrar direcciones
 * @param {Object} cell - La celda del grid
 * @returns {string} Dirección formateada
 */
function getFormattedAddress(cell) {
    const type = getCellType(cell);
    const customName = cell.label || cell.buildingName || 'sin nombre';
    
    return `${type} ${customName}`;
}

// ─── Hook para integración con el renderer ──────────────

/**
 * Función para integrar con el sistema de render existente
 * Reemplaza la lógica de título en index.html
 */
function integrateImprovedNaming(grid) {
    const gridEl = document.getElementById('cityGrid');
    if (!gridEl) return;
    
    const cells = gridEl.querySelectorAll('.cell');
    let idx = 0;
    
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            const cell = grid[r][c];
            const element = cells[idx];
            
            if (element) {
                updateCellTitle(element, cell, r, c);
            }
            
            idx++;
        }
    }
}

// Exportar para uso en módulos
if (typeof module !== 'undefined') {
    module.exports = {
        getCellType,
        getFormattedCellName,
        getCellInfo,
        getCellTooltip,
        updateCellTitle,
        getFormattedAddress,
        integrateImprovedNaming
    };
}
