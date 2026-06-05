// ============================================================
//  EDITOR — Lógica del Modo Dios
// ============================================================

let grid = null, gridRows = 0, gridCols = 0;
let characters = [], selectedCharId = null;
let history = [], destructionLog = [];
let currentCellSize = 28, showAllChars = true;
let currentRootHandle = null, ciudadesHandle = null;
let isMouseDown = false;
let cropStart = null;
let placementMode = false;
let uploadedCharImage = null;

// ─── Inicialización ───────────────────────────────────────
function initEditor() {
    setupEventListeners();
    loadFromLocalStorage();
}

function loadFromLocalStorage() {
    try {
        const saved = localStorage.getItem('godmode_project');
        if (saved) {
            const data = JSON.parse(saved);
            if (data.grid) {
                grid = deserializeGrid(data.grid);
                gridRows = grid.length;
                gridCols = grid[0]?.length || 0;
                if (data.characters) characters = data.characters;
                fullRender();
                addLogEntry('💾 Proyecto restaurado desde memoria local.');
            }
        }
    } catch(e) { console.warn('No se pudo restaurar:', e); }
}

function saveToLocalStorage() {
    if (!grid) return;
    try {
        const data = { grid: serializeGrid(grid), characters };
        localStorage.setItem('godmode_project', JSON.stringify(data));
    } catch(e) { console.warn('Error guardando:', e); }
}

// ─── Event listeners ─────────────────────────────────────
function setupEventListeners() {
    document.getElementById('importFile')?.addEventListener('change', importFile);
    document.getElementById('exportBtn')?.addEventListener('click', exportMap);
    document.getElementById('saveProjectBtn')?.addEventListener('click', saveProject);
    document.getElementById('screenshotBtn')?.addEventListener('click', takeScreenshot);
    document.getElementById('undoBtn')?.addEventListener('click', undoAction);
    document.getElementById('zoomInBtn')?.addEventListener('click', zoomIn);
    document.getElementById('zoomOutBtn')?.addEventListener('click', zoomOut);
    document.getElementById('toggleCharsBtn')?.addEventListener('click', toggleCharVisibility);
    document.getElementById('createCharBtn')?.addEventListener('click', createCharacter);
    document.getElementById('placeCharBtn')?.addEventListener('click', startPlacementMode);
    document.getElementById('deleteCharBtn')?.addEventListener('click', deleteSelectedCharacter);
    document.getElementById('deselectBtn')?.addEventListener('click', () => selectCharacter(null));
    document.getElementById('resetIndividualMoveBtn')?.addEventListener('click', resetIndividualMovement);
    document.getElementById('centerCharBtn')?.addEventListener('click', centerMapOnCharacter);
    document.getElementById('deleteAllCharsBtn')?.addEventListener('click', deleteAllCharacters);
    document.getElementById('saveLogBtn')?.addEventListener('click', saveLog);
    document.getElementById('clearLogBtn')?.addEventListener('click', clearLog);
    document.getElementById('selectFolderBtn')?.addEventListener('click', selectDirectoryEditor);
    document.getElementById('loadSelectedBtn')?.addEventListener('click', loadSelectedCity);
    document.getElementById('charImageUpload')?.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            uploadedCharImage = ev.target.result;
            document.getElementById('imgPreview').textContent = '✅ ' + file.name.slice(0,12);
        };
        reader.readAsDataURL(file);
    });

    document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(e) {
    if (e.key === 'Escape') {
        placementMode = false;
        document.body.style.cursor = '';
        addLogEntry('⚪ Modo colocación cancelado.');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undoAction(); }
    if (e.key === '+' || e.key === '=') zoomIn();
    if (e.key === '-') zoomOut();
    if (!selectedCharId) return;
    const moves = { ArrowUp:[-1,0], ArrowDown:[1,0], ArrowLeft:[0,-1], ArrowRight:[0,1],
                    w:[-1,0], s:[1,0], a:[0,-1], d:[0,1] };
    if (moves[e.key]) { e.preventDefault(); moveCharacter(...moves[e.key]); }
}

// ─── Herramientas de grid ──────────────────────────────────
function getActiveTool() {
    return document.querySelector('input[name="tool"]:checked')?.value || 'destroy';
}
function getBrushSize() {
    return parseInt(document.getElementById('brushSize')?.value || 1);
}

function handleGridMouseDown(e) {
    if (!grid) return;
    isMouseDown = true;
    const { row, col } = getCellFromEvent(e);
    if (row < 0) return;

    const tool = getActiveTool();
    if (tool === 'crop') { cropStart = { row, col }; return; }
    if (tool === 'characters') {
        if (placementMode) {
            handleCharacterPlacement(row, col);
        } else if (selectedCharId) {
            const char = characters.find(c => c.id === selectedCharId);
            if (char && char.row >= 0) {
                const d = dist(char.row, char.col, row, col);
                if (d > 0 && d <= char.pm) {

                        moveCharacterTo(row, col);

                    isMouseDown = false;
                    return;
                }
            }
        }
        return;
    }
    saveToHistory();
    clearBrushPreview();
    applyTool(row, col, tool);
}

function handleGridMouseMove(e) {
    if (!grid) return;
    const { row, col } = getCellFromEvent(e);
    if (row < 0) return;

    if (isMouseDown) {
        const tool = getActiveTool();
        if (tool === 'crop') return;
        applyTool(row, col, tool);
    } else {
        showBrushPreview(row, col);
    }
}

function handleGridMouseUp(e) {
    if (!isMouseDown) return;
    isMouseDown = false;
    const tool = getActiveTool();
    if (tool === 'crop' && cropStart) {
        const { row, col } = getCellFromEvent(e);
        if (row >= 0) {
            applyCrop(
                Math.min(cropStart.row, row), Math.min(cropStart.col, col),
                Math.max(cropStart.row, row)+1, Math.max(cropStart.col, col)+1
            );
        }
        cropStart = null;
    }
    saveToLocalStorage();
    fullRender();
}

function getCellFromEvent(e) {
    let target = e.currentTarget || e.target;
    if (target && !target.dataset.r) {
        target = target.closest('.cell');
    }
    if (target && target.dataset && target.dataset.r !== undefined) {
        return {
            row: parseInt(target.dataset.r),
            col: parseInt(target.dataset.c)
        };
    }
    const gridEl = document.getElementById('cityGrid');
    if (!gridEl) return {row:-1,col:-1};
    const rect = gridEl.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left - 2) / (currentCellSize + 1));
    const row = Math.floor((e.clientY - rect.top - 2)  / (currentCellSize + 1));
    if (row < 0 || row >= gridRows || col < 0 || col >= gridCols) return {row:-1,col:-1};
    return { row, col };
}

function applyTool(row, col, tool) {
    const brush = getBrushSize();
    const half = Math.floor(brush/2);
    for (let dr = -half; dr <= half; dr++) {
        for (let dc = -half; dc <= half; dc++) {
            const r = row+dr, c = col+dc;
            if (!isInBounds(r, c, gridRows, gridCols)) continue;
            if (tool === 'destroy') applyDestroy(r, c);
            else if (tool === 'repair') applyRepair(r, c);
        }
    }
    renderGrid();
}

function applyDestroy(r, c) {
    const cell = grid[r][c];
    if (cell.isDestroyed) return;
    const was = cell.buildingKey ? BUILDINGS[cell.buildingKey]?.name : (T[cell.terrain]?.name || cell.terrain);
    cell.isDestroyed = true;
    cell.buildingKey = null; cell.buildingId = null;
    destructionLog.push({ r, c, was });
    addLogEntry(`💥 [${r},${c}] Destruido: ${was || 'terreno'}`, 'destroy');
}

function applyRepair(r, c) {
    const cell = grid[r][c];
    if (!cell.isDestroyed) return;
    cell.isDestroyed = false;
    cell.terrain = 'SIDEWALK';
    addLogEntry(`🛠️ [${r},${c}] Reparado`, 'repair');
}

function applyCrop(r1, c1, r2, c2) {
    if (!grid) return;
    saveToHistory();
    const newGrid = [];
    for (let r = r1; r < Math.min(r2, gridRows); r++) {
        newGrid.push(grid[r].slice(c1, Math.min(c2, gridCols)));
    }
    if (!newGrid.length || !newGrid[0].length) return;
    grid = newGrid;
    gridRows = grid.length;
    gridCols = grid[0].length;
    addLogEntry(`✂️ Mapa recortado → ${gridRows}×${gridCols}`);
    fullRender();
}

function showBrushPreview(row, col) {
    clearBrushPreview();
    if (isMouseDown) return;
    const tool = getActiveTool();
    if (tool !== 'destroy' && tool !== 'repair') return;

    const brush = getBrushSize();
    const half = Math.floor(brush / 2);
    const previewClass = tool === 'destroy' ? 'brush-preview-destroy' : 'brush-preview-repair';

    for (let dr = -half; dr <= half; dr++) {
        for (let dc = -half; dc <= half; dc++) {
            const r = row + dr;
            const c = col + dc;
            if (isInBounds(r, c, gridRows, gridCols)) {
                const el = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
                if (el) el.classList.add(previewClass);
            }
        }
    }
}

function clearBrushPreview() {
    document.querySelectorAll('.cell').forEach(el => {
        el.classList.remove('brush-preview-destroy', 'brush-preview-repair');
    });
}

// ─── Personajes ───────────────────────────────────────────
function createCharacter() {
    const nameInput = document.getElementById('newCharName');
    const name = nameInput?.value.trim() || `Personaje ${characters.length+1}`;
    const maxPM = parseInt(document.getElementById('newCharMove')?.value || 5);
    const range = parseInt(document.getElementById('newCharRange')?.value || 1);

    if (maxPM <= 0 || range <= 0) {
        addLogEntry('⚠️ Error: Los PM y el Rango deben ser mayores a 0.');
        return;
    }

    const avatarSel = document.getElementById('avatarSelect')?.value;
    const avatar = uploadedCharImage || (avatarSel === 'default' ? '🎭' : avatarSel);

    const char = {
        id: `c${Date.now()}`, name, maxPM, pm: maxPM, range,
        avatar, row: -1, col: -1, color: _randomColor()
    };

    characters.push(char);
    uploadedCharImage = null;
    if (document.getElementById('imgPreview')) document.getElementById('imgPreview').textContent = '(ninguna imagen)';
    if (nameInput) nameInput.value = '';

    addLogEntry(`✨ Creado: ${name} (PM:${maxPM} Rango:${range})`);
    renderCharacterList();
    selectCharacter(char.id);
    saveToLocalStorage();
}

function _randomColor() {
    const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9a3c','#00d2ff','#ff6fd8'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function startPlacementMode() {
    if (!selectedCharId) { addLogEntry('⚠️ Selecciona un personaje primero.'); return; }
    if (!grid) { addLogEntry('⚠️ No hay mapa cargado.'); return; }
    placementMode = true;
    document.body.style.cursor = 'crosshair';
    addLogEntry('📍 Haz clic en el mapa para colocar al personaje.');
}

function handleCharacterPlacement(row, col) {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char) return;
    char.row = row; char.col = col;
    placementMode = false;
    document.body.style.cursor = '';
    addLogEntry(`📍 ${char.name} colocado en [${row},${col}]`);
    renderGrid();
    renderCharacterList();
    saveToLocalStorage();
}

function selectCharacter(id) {
    selectedCharId = id;
    const char = characters.find(c => c.id === id);
    const tag = document.getElementById('selectedCharTag');
    const tagName = document.getElementById('selectedCharTagName');
    const centerBtn = document.getElementById('centerCharBtn');

    if (char) {
        if (tagName) tagName.textContent = `${char.name} (PM: ${char.pm})`;
        if (tag) tag.style.display = 'flex';
        if (centerBtn) centerBtn.style.display = char.row >= 0 ? 'inline-block' : 'none';
    } else {
        if (tag) tag.style.display = 'none';
        if (centerBtn) centerBtn.style.display = 'none';
    }

    renderCharacterList();
    updateIndividualMovePanel();

    if (char && char.row >= 0) {
        highlightMovableCells();
        centerMapOnCharacter();
    } else {
        renderGrid();
    }
}

function deleteSelectedCharacter() {
    if (!selectedCharId) return;
    const char = characters.find(c => c.id === selectedCharId);
    characters = characters.filter(c => c.id !== selectedCharId);
    selectedCharId = null;
    addLogEntry(`🗑️ Eliminado: ${char?.name}`);
    document.getElementById('selectedCharTag').style.display = 'none';
    renderCharacterList();
    renderGrid();
    saveToLocalStorage();
}

function deleteAllCharacters() {
    if(confirm("⚠️ ¿Estás seguro de que deseas eliminar TODOS los personajes?")) {
        characters = [];
        selectCharacter(null);
        addLogEntry("🗑️ Todos los personajes han sido eliminados.", "destroy");
        renderGrid();
        saveToLocalStorage();
    }
}

function centerMapOnCharacter() {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char || char.row < 0 || !grid) return;

    const wrapper = document.getElementById('mapWrapper');
    const cell = document.querySelector(`[data-r="${char.row}"][data-c="${char.col}"]`);

    if (wrapper && cell) {
        const wrapperRect = wrapper.getBoundingClientRect();
        const cellRect = cell.getBoundingClientRect();

        wrapper.scrollBy({
            left: cellRect.left - wrapperRect.left - (wrapperRect.width / 2) + (cellRect.width / 2),
            top: cellRect.top - wrapperRect.top - (wrapperRect.height / 2) + (cellRect.height / 2),
            behavior: 'smooth'
        });

        cell.style.transition = 'transform 0.3s, box-shadow 0.3s';
        cell.style.transform = 'scale(1.3)';
        cell.style.boxShadow = '0 0 20px var(--gold)';
        cell.style.zIndex = '10';
        setTimeout(() => {
            cell.style.transform = '';
            cell.style.boxShadow = '';
            cell.style.zIndex = '';
        }, 700);
    }
}

function moveCharacter(dr, dc) {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char || char.pm <= 0 || char.row < 0) return;
    const nr = char.row + dr, nc = char.col + dc;
    if (!isInBounds(nr, nc, gridRows, gridCols)) return;
    char.row = nr; char.col = nc; char.pm--;
    addLogEntry(`🚶 ${char.name} → [${nr},${nc}] (PM: ${char.pm}/${char.maxPM})`);
    updateIndividualMovePanel();
    renderGrid();
    renderCharacterList();
    highlightMovableCells();
    saveToLocalStorage();
}

function moveCharacterTo(row, col) {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char || char.row < 0) return;

    const d = dist(char.row, char.col, row, col);
    if (d <= 0 || d > char.pm) return;

    char.row = row;
    char.col = col;
    char.pm -= 1;

    addLogEntry(`🚶 ${char.name} se movió a [${row},${col}] (PM restantes: ${char.pm}/${char.maxPM})`);

    updateIndividualMovePanel();
    renderGrid();
    renderCharacterList();
    highlightMovableCells();
    saveToLocalStorage();
}

function resetIndividualMovement() {
    const char = characters.find(c => c.id === selectedCharId);
    if (!char) return;
    char.pm = char.maxPM;
    addLogEntry(`♻️ ${char.name}: PM recuperados (${char.maxPM})`);
    updateIndividualMovePanel();
    renderGrid();
    renderCharacterList();
    if (char.row >= 0) highlightMovableCells();
}

function highlightMovableCells() {
    const char = characters.find(c => c.id === selectedCharId);
    const cells = document.querySelectorAll('.cell');

    cells.forEach(el => {
        el.classList.remove('reachable', 'in-range');
        if (el.dataset.originalTitle) {
            el.title = el.dataset.originalTitle;
        }
    });

    if (!char || char.row < 0 || !showAllChars) return;

    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const d = dist(char.row, char.col, r, c);
            if (d === 0) continue;

            const el = document.querySelector(`[data-r="${r}"][data-c="${c}"]`);
            if (!el) continue;

            if (!el.dataset.originalTitle && el.title) {
                el.dataset.originalTitle = el.title;
            } else if (!el.dataset.originalTitle) {
                el.dataset.originalTitle = "";
            }

            if (d <= char.pm) {
                el.classList.add('reachable');
                el.title = `🎯 Mover aquí (Costo: 1 PM | Distancia: ${d})\n${el.dataset.originalTitle}`;
            }
            if (d <= char.range && d > 0) {
                el.classList.add('in-range');
            }
        }
    }
}

// ─── Historial ────────────────────────────────────────────
function saveToHistory() {
    if (!grid) return;
    history.push(serializeGrid(grid));
    if (history.length > 30) history.shift();
}

function undoAction() {
    if (!history.length) { addLogEntry('⚠️ No hay más acciones para deshacer.'); return; }
    grid = deserializeGrid(history.pop());
    gridRows = grid.length; gridCols = grid[0]?.length || 0;
    addLogEntry('↩️ Acción deshecha.');
    fullRender();
}

// ─── Zoom ─────────────────────────────────────────────────
function zoomIn()  { currentCellSize = Math.min(64, currentCellSize+4); renderGrid(); }
function zoomOut() { currentCellSize = Math.max(12, currentCellSize-4); renderGrid(); }

// ─── Toggle personajes ────────────────────────────────────
function toggleCharVisibility() {
    showAllChars = !showAllChars;
    const btn = document.getElementById('toggleCharsBtn');
    if (btn) btn.textContent = showAllChars ? '👥 Todos' : '👤 Seleccionado';
    renderGrid();
}

// ─── Log ──────────────────────────────────────────────────
function addLogEntry(message, type='') {
    const log = document.getElementById('logContent');
    if (!log) return;
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    const ts = new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    entry.textContent = `[${ts}] ${message}`;
    log.prepend(entry);
    while (log.children.length > 200) log.removeChild(log.lastChild);
}

function clearLog() {
    const log = document.getElementById('logContent');
    if (log) log.innerHTML = '<div class="log-entry system">🗑️ Log limpiado.</div>';
}

function saveLog() {
    const log = document.getElementById('logContent');
    if (!log) return;
    const lines = Array.from(log.querySelectorAll('.log-entry')).map(e => e.textContent).join('\n');
    downloadData(lines, `registro_${Date.now()}.txt`);
}

// ─── Renderizado ──────────────────────────────────────────
function fullRender() {
    if (!grid) return;
    const placeholder = document.getElementById('placeholder');
    const gridEl = document.getElementById('cityGrid');
    if (placeholder) placeholder.style.display = 'none';
    if (gridEl) gridEl.style.display = 'grid';
    renderGrid();
    renderCharacterList();
    updateIndividualMovePanel();
}

function renderGrid() {
    if (!grid) return;
    const gridEl = document.getElementById('cityGrid');
    if (!gridEl) return;
    gridEl.style.gridTemplateColumns = `repeat(${gridCols}, ${currentCellSize}px)`;
    gridEl.style.gridTemplateRows    = `repeat(${gridRows}, ${currentCellSize}px)`;

    const total = gridRows * gridCols;
    while (gridEl.children.length > total) gridEl.removeChild(gridEl.lastChild);

    for (let i = gridEl.children.length; i < total; i++) {
        const el = document.createElement('div');
        el.className = 'cell';
        el.addEventListener('mousedown', handleGridMouseDown);
        el.addEventListener('mousemove', handleGridMouseMove);
        el.addEventListener('mouseup',   handleGridMouseUp);
        el.addEventListener('mouseleave', clearBrushPreview);
        gridEl.appendChild(el);
    }

    const charPositions = {};
    const visChars = showAllChars ? characters : characters.filter(c => c.id === selectedCharId);
    for (const ch of visChars) {
        if (ch.row >= 0 && ch.col >= 0) {
            const key = `${ch.row}_${ch.col}`;
            charPositions[key] = ch;
        }
    }

    let idx = 0;
    for (let r = 0; r < gridRows; r++) {
        for (let c = 0; c < gridCols; c++) {
            const cell = grid[r][c];
            const el   = gridEl.children[idx++];
            el.dataset.r = r; el.dataset.c = c;
            el.style.width  = currentCellSize + 'px';
            el.style.height = currentCellSize + 'px';
            el.style.fontSize = Math.max(8, currentCellSize * 0.5) + 'px';

            if (cell.isDestroyed) {
                el.className = 'cell destroyed-cell';
                el.style.background = '#0a0a0a';
                el.textContent = '💀';
                continue;
            }

            el.className = 'cell';

            if (cell.buildingKey && BUILDINGS[cell.buildingKey]) {
                const b = BUILDINGS[cell.buildingKey];
                el.style.background = b.bg;
                el.style.color = '#fff';
                const above = r > 0 ? grid[r-1][c].buildingId : null;
                const left  = c > 0 ? grid[r][c-1].buildingId : null;
                if (cell.buildingId !== above && cell.buildingId !== left) {
                    el.textContent = currentCellSize >= 20 ? b.emoji : '';
                } else {
                    el.textContent = '';
                }
            } else {
                const terrain = T[cell.terrain] || T.EMPTY;
                el.style.background = terrain.bg;
                el.style.color = '#888';
                el.textContent = currentCellSize >= 18 ? (terrain.emoji || '') : '';
            }

            if (currentCellSize >= 24) {
                el.title = cell.buildingName || (T[cell.terrain]?.name) || cell.terrain;
            }

            const charKey = `${r}_${c}`;
            if (charPositions[charKey]) {
                const ch = charPositions[charKey];
                const isSelected = ch.id === selectedCharId;
                const charEl = document.createElement('div');
                charEl.className = 'cell-char-layer' + (isSelected ? ' selected-char' : '');
                charEl.style.border = `2px solid ${ch.color}`;
                if (typeof ch.avatar === 'string' && ch.avatar.startsWith('data:')) {
                    const img = document.createElement('img');
                    img.src = ch.avatar;
                    img.style.cssText = 'width:100%;height:100%;object-fit:cover;border-radius:2px;';
                    charEl.appendChild(img);
                } else {
                    charEl.textContent = ch.avatar || '🎭';
                }
                el.style.position = 'relative';
                el.style.overflow = 'hidden';
                while (el.querySelector('.cell-char-layer')) el.querySelector('.cell-char-layer').remove();
                el.appendChild(charEl);
            }
        }
    }
}

function onCellClick(e) {
    const r = parseInt(e.currentTarget.dataset.r);
    const c = parseInt(e.currentTarget.dataset.c);
    const tool = getActiveTool();
    
    if (tool === 'characters') {
        if (placementMode) {
            handleCharacterPlacement(r, c);
        } else if (selectedCharId) {
            const char = characters.find(c => c.id === selectedCharId);
            if (char && char.row >= 0) {
                const d = dist(char.row, char.col, r, c);
                if (d > 0 && d <= char.pm) {
                    moveCharacterTo(r, c);
                }
            }
        }
    } else if (selectedCharId && !placementMode && tool !== 'crop') {
        const char = characters.find(c => c.id === selectedCharId);
        if (char && char.row >= 0) {
            const d = dist(char.row, char.col, r, c);
            if (d > 0 && d <= char.pm && tool !== 'destroy' && tool !== 'repair') {
                moveCharacterTo(r, c);
            }
        }
    }
}

function renderCharacterList() {
    const container = document.getElementById('charListContainer');
    if (!container) return;

    if (!characters.length) {
        container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:8px; text-align:center;">Sin personajes creados.</div>';
        return;
    }

    container.innerHTML = '';
    for (const ch of characters) {
        const card = document.createElement('div');
        card.className = 'char-card' + (ch.id === selectedCharId ? ' selected' : '');
        card.onclick = () => selectCharacter(ch.id);

        const pmPct = Math.round((ch.pm / ch.maxPM) * 100);
        const pmColor = pmPct > 60 ? 'var(--green)' : pmPct > 30 ? 'var(--gold)' : 'var(--red)';
        const posText = ch.row >= 0 ? `[${ch.row}, ${ch.col}]` : 'Sin colocar';

        card.innerHTML = `
            <div class="char-avatar" style="border-color:${ch.color}; width:36px; height:36px; display:flex; align-items:center; justify-content:center; border-radius:4px; background:rgba(0,0,0,0.3); font-size: 20px;">
                ${typeof ch.avatar === 'string' && ch.avatar.startsWith('data:')
                    ? `<img src="${ch.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:2px;">`
                    : (ch.avatar || '🎭')}
            </div>
            <div class="char-info">
                <div class="char-name">${ch.name}</div>
                <div class="char-pos">📍 ${posText} &nbsp;|&nbsp; 🎯 Rango: ${ch.range}</div>
                <div class="pm-text">PM: ${ch.pm}/${ch.maxPM}</div>
                <div class="pm-bar-wrap">
                    <div class="pm-bar" style="width:${pmPct}%; background-color:${pmColor};"></div>
                </div>
            </div>
        `;
        container.appendChild(card);
    }
}

function updateIndividualMovePanel() {
    const panel = document.getElementById('movePanel');
    if (!panel) return;
    const char = characters.find(c => c.id === selectedCharId);
    const nameEl = document.getElementById('selectedCharNameMove');
    if (nameEl) nameEl.textContent = char ? char.name : 'Sin selección';

    const btns = document.getElementById('moveButtonsContainer');
    if (btns) {
        btns.innerHTML = `
          <div class="move-row">
            <button class="move-btn" onclick="moveCharacter(-1,-1)">↖</button>
            <button class="move-btn" onclick="moveCharacter(-1,0)">↑</button>
            <button class="move-btn" onclick="moveCharacter(-1,1)">↗</button>
          </div>
          <div class="move-row">
            <button class="move-btn" onclick="moveCharacter(0,-1)">←</button>
            <button class="move-btn center-btn">●</button>
            <button class="move-btn" onclick="moveCharacter(0,1)">→</button>
          </div>
          <div class="move-row">
            <button class="move-btn" onclick="moveCharacter(1,-1)">↙</button>
            <button class="move-btn" onclick="moveCharacter(1,0)">↓</button>
            <button class="move-btn" onclick="moveCharacter(1,1)">↘</button>
          </div>`;
    }
}

// ─── File System API ─────────────────────────────────────
async function selectDirectoryEditor() {
    if (!window.showDirectoryPicker) {
        addLogEntry('⚠️ File System API no disponible. Usa import/export.');
        return;
    }
    try {
        currentRootHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
        ciudadesHandle = await currentRootHandle.getDirectoryHandle('ciudades', { create: true });
        await currentRootHandle.getDirectoryHandle('capturas', { create: true });
        await currentRootHandle.getDirectoryHandle('logs', { create: true });
        addLogEntry(`📁 Carpeta conectada: ${currentRootHandle.name}`);
        await listCityFilesEditor();
    } catch(e) { addLogEntry('❌ No se seleccionó carpeta.'); }
}

async function listCityFilesEditor() {
    const sel = document.getElementById('citySelect');
    if (!sel || !ciudadesHandle) return;
    sel.innerHTML = '<option value="">-- Seleccionar ciudad --</option>';
    for await (const [name, handle] of ciudadesHandle.entries()) {
        if (name.endsWith('.json')) {
            const opt = document.createElement('option');
            opt.value = name; opt.textContent = name.replace('.json','');
            sel.appendChild(opt);
        }
    }
}

async function loadSelectedCity() {
    const sel = document.getElementById('citySelect');
    const fileName = sel?.value;
    if (!fileName || !ciudadesHandle) { addLogEntry('⚠️ Selecciona una ciudad de la lista.'); return; }
    try {
        const fh = await ciudadesHandle.getFileHandle(fileName);
        const file = await fh.getFile();
        const text = await file.text();
        loadCityData(JSON.parse(text));
        addLogEntry(`📂 Cargado: ${fileName}`);
    } catch(e) { addLogEntry('❌ Error cargando archivo.'); }
}

async function saveProject() {
    const data = getFullProjectData();
    const json = JSON.stringify(data);
    if (ciudadesHandle) {
        try {
            const name = prompt('Nombre del archivo:', `ciudad_${Date.now()}`) || `ciudad_${Date.now()}`;
            const fh = await ciudadesHandle.getFileHandle(`${name}.json`, { create: true });
            const writable = await fh.createWritable();
            await writable.write(json);
            await writable.close();
            addLogEntry(`💾 Guardado: ${name}.json`);
            await listCityFilesEditor();
            return;
        } catch(e) { addLogEntry('⚠️ Usando descarga...'); }
    }
    downloadData(json, `proyecto_${Date.now()}.json`);
}

// ─── Import/Export ────────────────────────────────────────
function importFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
        try {
            loadCityData(JSON.parse(ev.target.result));
            addLogEntry(`📂 Importado: ${file.name}`);
        } catch(err) { addLogEntry('❌ Error al importar archivo.'); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

function loadCityData(data) {
    if (data.grid) {
        grid = Array.isArray(data.grid) ? data.grid : deserializeGrid(data.grid);
    } else if (data.cells) {
        grid = data.cells;
    }
    if (!grid) return;
    gridRows = grid.length;
    gridCols = grid[0]?.length || 0;
    characters = data.characters || [];
    selectedCharId = null;
    history = [];
    fullRender();
    saveToLocalStorage();
}

function exportMap() {
    if (!grid) return;
    downloadData(JSON.stringify(getFullProjectData()), `ciudad_${Date.now()}.json`);
}

function getFullProjectData() {
    return { grid, characters, exportedAt: new Date().toISOString(), version: '4.0' };
}

function downloadData(data, filename) {
    const blob = new Blob([data], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
}

async function takeScreenshot() {
    if (!grid) return;
    if (typeof html2canvas === 'undefined') {
        addLogEntry('⚠️ html2canvas no disponible.');
        return;
    }
    const gridEl = document.getElementById('cityGrid');
    try {
        const canvas = await html2canvas(gridEl, { backgroundColor: '#080b12', scale: 1 });
        canvas.toBlob(blob => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `captura_${Date.now()}.png`; a.click();
            URL.revokeObjectURL(url);
        });
        addLogEntry('📸 Captura guardada.');
    } catch(e) { addLogEntry('❌ Error al tomar captura.'); }
}

document.addEventListener('DOMContentLoaded', initEditor);
