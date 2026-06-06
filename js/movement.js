// ============================================================
//  MOVEMENT SYSTEM v2 — Sistema de teletransportación manual
//  Click en personaje → Seleccionar casilla destino → Costo PM fijo
// ============================================================

// ─── Configuración: TODOS los terrenos cuestan 1 PM ──────
// No hay dificultad por terreno, cada movimiento cuesta igual
const TERRAIN_COST = 1; // Costo fijo para cualquier terreno

// ─── Clase de Personaje ──────────────────────────────────
class Character {
    constructor(row, col, name = "Personaje", maxPM = 9) {
        this.row = row;
        this.col = col;
        this.name = name;
        this.maxPM = maxPM;              // Puntos de movimiento máximos
        this.currentPM = maxPM;          // PM disponibles este turno
        this.turnStartRow = row;
        this.turnStartCol = col;
        this.isSelected = false;         // Si está seleccionado para moverse
        this.reachableCells = [];        // Casillas que puede alcanzar
    }
    
    /**
     * Intenta mover el personaje a una casilla específica
     * Costo fijo de 1 PM sin importar el terreno
     */
    teleportTo(grid, toRow, toCol) {
        // Validar límites
        if (!isInBounds(toRow, toCol, grid.length, grid[0].length)) {
            return { 
                success: false, 
                message: "❌ Fuera de los límites del mapa",
                costUsed: 0 
            };
        }
        
        const targetCell = grid[toRow][toCol];
        
        // No puede cruzar edificios
        if (targetCell.buildingKey) {
            return { 
                success: false, 
                message: `❌ No puedes entrar en ${targetCell.buildingName || "edificios"}`,
                costUsed: 0 
            };
        }
        
        // Validar que tenga suficiente PM (costo fijo = 1)
        if (this.currentPM < TERRAIN_COST) {
            return { 
                success: false, 
                message: `⚠️ Necesitas ${TERRAIN_COST} PM pero solo tienes ${this.currentPM}`,
                costUsed: 0,
                pmNeeded: TERRAIN_COST,
                pmAvailable: this.currentPM
            };
        }
        
        // Realizar el movimiento
        this.row = toRow;
        this.col = toCol;
        this.currentPM -= TERRAIN_COST;
        
        return {
            success: true,
            message: `✅ ${this.name} se teletransportó a (${toRow}, ${toCol})`,
            costUsed: TERRAIN_COST,
            terrainType: targetCell.terrain,
            terrainName: getTerrainName(targetCell),
            pmRemaining: this.currentPM
        };
    }
    
    /**
     * Calcula todas las casillas alcanzables desde la posición actual
     * Filtra casillas sin edificios y que tenga PM suficiente
     */
    calculateReachableCells(grid) {
        this.reachableCells = [];
        const rows = grid.length;
        const cols = grid[0].length;
        
        // Si tiene al menos 1 PM, puede llegar a cualquier casilla sin edificio
        if (this.currentPM >= TERRAIN_COST) {
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = grid[r][c];
                    
                    // No incluir edificios ni su posición actual
                    if (cell.buildingKey) continue;
                    if (r === this.row && c === this.col) continue;
                    
                    this.reachableCells.push({
                        row: r,
                        col: c,
                        cost: TERRAIN_COST,
                        terrain: cell.terrain
                    });
                }
            }
        }
        
        return this.reachableCells;
    }
    
    /**
     * Obtiene información de una casilla específica para saber si se puede mover
     */
    getMovementInfo(grid, toRow, toCol) {
        if (!isInBounds(toRow, toCol, grid.length, grid[0].length)) {
            return null;
        }
        
        const cell = grid[toRow][toCol];
        
        if (cell.buildingKey) {
            return { canMove: false, reason: "Edificio bloqueante" };
        }
        
        return {
            canMove: this.currentPM >= TERRAIN_COST,
            cost: TERRAIN_COST,
            pmRemaining: this.currentPM - TERRAIN_COST,
            terrain: getTerrainName(cell)
        };
    }
    
    /**
     * Reinicia los PM al inicio del turno
     */
    resetPM() {
        this.currentPM = this.maxPM;
        this.turnStartRow = this.row;
        this.turnStartCol = this.col;
    }
    
    /**
     * Deselecciona el personaje
     */
    deselect() {
        this.isSelected = false;
        this.reachableCells = [];
    }
    
    /**
     * Obtiene un resumen del estado
     */
    getStatus() {
        return {
            name: this.name,
            position: `(${this.row}, ${this.col})`,
            pm: `${this.currentPM}/${this.maxPM}`,
            pmRemaining: this.currentPM,
            pmMax: this.maxPM,
            possibleMoves: this.currentPM, // Con costo 1, PM = cantidad de movimientos
            isSelected: this.isSelected
        };
    }
}

// ─── Gestor de Movimiento en el Grid ─────────────────────
class MovementManager {
    constructor(grid) {
        this.grid = grid;
        this.characters = [];
        this.selectedCharacter = null;
        this.movementHistory = [];
    }
    
    /**
     * Añade un personaje al mapa
     */
    addCharacter(character) {
        this.characters.push(character);
        return character;
    }
    
    /**
     * Selecciona un personaje para moverse
     */
    selectCharacter(characterIndex) {
        // Deseleccionar anterior
        if (this.selectedCharacter !== null) {
            this.characters[this.selectedCharacter].deselect();
        }
        
        this.selectedCharacter = characterIndex;
        const char = this.characters[characterIndex];
        char.isSelected = true;
        char.calculateReachableCells(this.grid);
        
        return {
            success: true,
            character: char.name,
            reachableCells: char.reachableCells.length,
            pmAvailable: char.currentPM,
            possibleMoves: char.currentPM
        };
    }
    
    /**
     * Mueve el personaje seleccionado a una casilla
     */
    moveSelectedCharacter(toRow, toCol) {
        if (this.selectedCharacter === null) {
            return { success: false, message: "❌ No hay personaje seleccionado" };
        }
        
        const character = this.characters[this.selectedCharacter];
        const fromRow = character.row;
        const fromCol = character.col;
        
        const result = character.teleportTo(this.grid, toRow, toCol);
        
        if (result.success) {
            this.movementHistory.push({
                character: character.name,
                from: { row: fromRow, col: fromCol },
                to: { row: toRow, col: toCol },
                cost: result.costUsed,
                timestamp: new Date()
            });
        }
        
        return result;
    }
    
    /**
     * Deselecciona el personaje actual
     */
    deselectCharacter() {
        if (this.selectedCharacter !== null) {
            this.characters[this.selectedCharacter].deselect();
            this.selectedCharacter = null;
        }
    }
    
    /**
     * Reinicia los PM de todos los personajes
     */
    endTurn() {
        this.characters.forEach(char => char.resetPM());
        this.deselectCharacter();
    }
    
    /**
     * Obtiene el historial de movimientos
     */
    getHistory() {
        return this.movementHistory;
    }
    
    /**
     * Obtiene el estado de todos los personajes
     */
    getAllStatus() {
        return this.characters.map(char => char.getStatus());
    }
}

// ─── Funciones Auxiliares ────────────────────────────────

/**
 * Obtiene el nombre descriptivo de un terreno
 */
function getTerrainName(cell) {
    const terrainNames = {
        'ROAD': 'Camino',
        'AVENUE': 'Avenida',
        'SIDEWALK': 'Acera',
        'PLAZA': 'Plaza',
        'FOUNTAIN': 'Fuente',
        'PARK': 'Parque',
        'GARDEN': 'Jardín',
        'WATER': 'Agua',
        'DOCK': 'Muelle',
        'FENCE': 'Valla',
        'EMPTY': 'Terreno vacío',
        'BRIDGE': 'Puente'
    };
    
    return terrainNames[cell.terrain] || cell.terrain;
}

/**
 * Verifica si una posición está dentro de los límites
 */
function isInBounds(row, col, rows, cols) {
    return row >= 0 && row < rows && col >= 0 && col < cols;
}

// Exportar para uso en módulos
if (typeof module !== 'undefined') {
    module.exports = {
        Character,
        MovementManager,
        getTerrainName,
        isInBounds,
        TERRAIN_COST
    };
}
