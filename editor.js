// ============================================================================
// SCRIPT DE REEMPLAZO: NUEVA LÓGICA DE MOVIMIENTO (ESTILO REY DE AJEDREZ)
// ============================================================================

// 1. Cálculo de distancia Chebyshev (Estilo Rey de Ajedrez: diagonales valen 1)
function getKingDistance(r1, c1, r2, c2) {
    return Math.max(Math.abs(r1 - r2), Math.abs(c1 - c2));
}

// 2. Función unificada para ejecutar el movimiento bajo las nuevas reglas
function executeCharacterMovement(char, targetR, targetC) {
    // Soportar cualquier nomenclatura de coordenadas de tu base original (r/c o row/col)
    const startR = char.r !== undefined ? char.r : char.row;
    const startC = char.c !== undefined ? char.c : char.col;
    
    if (startR === undefined || startC === undefined) return false;

    // Calcular la distancia total al objetivo
    const distance = getKingDistance(startR, startC, targetR, targetC);
    
    // Detectar dinámicamente la propiedad de rango/distancia del personaje
    const maxRange = char.rango || char.distancia || char.speed || char.maxDist || char.movement || 5;

    // VALIDACIÓN 1: Verificar si le quedan PM (veces que puede moverse)
    if (char.pm !== undefined && char.pm <= 0) {
        if (typeof addLogEntry === 'function') addLogEntry("⚠️ No le quedan PM (puntos de movimiento) a este personaje.");
        else alert("No le quedan PM a este personaje.");
        return false;
    }

    // VALIDACIÓN 2: Verificar si la casilla destino está dentro de su rango de distancia
    if (distance > maxRange) {
        if (typeof addLogEntry === 'function') addLogEntry(`⚠️ Celda fuera de rango. Distancia: ${distance}, Rango Máximo: ${maxRange}`);
        else alert(`Celda fuera de rango. Distancia: ${distance}, Rango Máximo: ${maxRange}`);
        return false;
    }

    // Actualizar la posición del personaje (adaptable a r/c o row/col)
    if (char.r !== undefined) char.r = targetR;
    if (char.row !== undefined) char.row = targetR;
    if (char.c !== undefined) char.c = targetC;
    if (char.col !== undefined) char.col = targetC;

    // Consumir exactamente 1 PM (una vez de movimiento), sin importar los casilleros avanzados
    if (char.pm !== undefined) {
        char.pm -= 1;
    } else if (char.movesLeft !== undefined) {
        char.movesLeft -= 1;
    }

    if (typeof addLogEntry === 'function') {
        addLogEntry(`🚶 Personaje movido a (${targetR}, ${targetC}). Distancia: ${distance}. PM restantes: ${char.pm}`);
    }

    // Forzar actualización de pantalla y persistencia de datos original
    if (typeof fullRender === 'function') fullRender();
    if (typeof render === 'function') render();
    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();

    return true;
}

// 3. Sobrescribir los controladores de clic en celdas originales
if (typeof handleCellClick === 'function' || true) {
    const originalHandleCellClick = typeof handleCellClick === 'function' ? handleCellClick : null;
    handleCellClick = function(r, c) {
        if (typeof selectedCharId !== 'undefined' && selectedCharId !== null && typeof characters !== 'undefined') {
            const char = characters.find(ch => ch.id == selectedCharId);
            if (char) {
                executeCharacterMovement(char, r, c);
                return;
            }
        }
        if (originalHandleCellClick) originalHandleCellClick(r, c);
    };
}

// Sobrescribir variantes alternativas comunes de nombres de función de movimiento
if (typeof moveCharacterTo === 'function' || true) {
    moveCharacterTo = function(id, r, c) {
        if (typeof characters !== 'undefined') {
            const char = characters.find(ch => ch.id == id);
            if (char) return executeCharacterMovement(char, r, c);
        }
    };
}

// 4. Interceptador global en fase de captura (Garantiza compatibilidad absoluta con el DOM)
document.addEventListener('click', function(e) {
    const cell = e.target.closest('.cell');
    if (cell && typeof selectedCharId !== 'undefined' && selectedCharId !== null) {
        // Extraer coordenadas de atributos data-r/data-c o data-row/data-col
        let r = parseInt(cell.getAttribute('data-r') || cell.getAttribute('data-row'));
        let c = parseInt(cell.getAttribute('data-c') || cell.getAttribute('data-col'));
        
        // Alternativa si están guardados en el ID (ej: cell-5-10)
        if (isNaN(r) || isNaN(c)) {
            const matches = (cell.id || '').match(/\d+/g);
            if (matches && matches.length >= 2) {
                r = parseInt(matches[0]);
                c = parseInt(matches[1]);
            }
        }
        
        if (!isNaN(r) && !isNaN(c) && typeof characters !== 'undefined') {
            const char = characters.find(ch => ch.id == selectedCharId);
            if (char) {
                const moved = executeCharacterMovement(char, r, c);
                if (moved) {
                    e.stopPropagation();
                    e.preventDefault();
                }
            }
        }
    }
}, true);

// 5. Vincular comportamiento correcto al botón de restaurar PM
document.addEventListener('DOMContentLoaded', () => {
    const resetBtn = document.getElementById('resetIndividualMoveBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (typeof selectedCharId !== 'undefined' && selectedCharId !== null && typeof characters !== 'undefined') {
                const char = characters.find(ch => ch.id == selectedCharId);
                if (char) {
                    char.pm = char.pmMax || char.maxPm || 3; // Restaura a su máximo o 3 por defecto
                    if (typeof addLogEntry === 'function') addLogEntry(`♻️ PM restaurados para ${char.name || 'personaje'}.`);
                    if (typeof fullRender === 'function') fullRender();
                    if (typeof saveToLocalStorage === 'function') saveToLocalStorage();
                }
            }
        });
    }
});