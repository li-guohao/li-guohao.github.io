/**
 * Main - 主程序入口
 * 初始化生态系统，设置事件监听，主循环
 */

// 全局变量
let ecosystem;
let renderer2D;
let renderer3D;
let chartManager;
let brainVisualizer;
let animationId;
let currentMode = '2d'; // '2d' 或 '3d'

// DOM元素
const elements = {};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initElements();
    initEcosystem();
    initEventListeners();
    initBrainVisualizer();
    
    // 开始主循环
    lastTime = performance.now();
    requestAnimationFrame(gameLoop);
});

// 初始化DOM元素引用
function initElements() {
    elements.worldCanvas = document.getElementById('world-canvas');
    elements.simulationArea = document.querySelector('.simulation-area');
    elements.brainCanvas = document.getElementById('brain-viz');
    
    // 统计元素
    elements.creatureCount = document.getElementById('creature-count');
    elements.plantCount = document.getElementById('plant-count');
    elements.generationCount = document.getElementById('generation-count');
    elements.bestFitness = document.getElementById('best-fitness');
    
    // 按钮
    elements.btnStart = document.getElementById('btn-start');
    elements.btnPause = document.getElementById('btn-pause');
    elements.btnReset = document.getElementById('btn-reset');
    elements.btn2D = document.getElementById('btn-2d');
    elements.btn3D = document.getElementById('btn-3d');
    
    // 滑块和输入
    elements.simSpeed = document.getElementById('sim-speed');
    elements.speedValue = document.getElementById('speed-value');
    elements.initialCreatures = document.getElementById('initial-creatures');
    elements.mutationRate = document.getElementById('mutation-rate');
    elements.mutationValue = document.getElementById('mutation-value');
    elements.foodSpawnRate = document.getElementById('food-spawn-rate');
    elements.foodValue = document.getElementById('food-value');
    elements.predatorRatio = document.getElementById('predator-ratio');
    elements.predatorValue = document.getElementById('predator-value');
    
    // 生物信息面板
    elements.creatureInfo = document.getElementById('selected-creature-info');
}

// 初始化生态系统
function initEcosystem() {
    // 创建生态系统（世界大小）
    ecosystem = new Ecosystem(2000, 1500);
    
    // 设置参数
    updateEcosystemParams();
    
    // 初始化
    ecosystem.initialize();
    
    // 创建2D渲染器
    renderer2D = new Renderer(elements.worldCanvas, ecosystem);
    
    // 创建图表管理器
    chartManager = new ChartManager();
    
    // 设置更新回调
    ecosystem.onUpdate = onEcosystemUpdate;
}

// 初始化神经网络可视化器
function initBrainVisualizer() {
    brainVisualizer = new BrainVisualizer(elements.brainCanvas);
}

// 切换到3D模式
function switchTo3D() {
    if (currentMode === '3d') return;
    
    currentMode = '3d';
    
    // 更新按钮状态
    elements.btn2D.classList.remove('active');
    elements.btn3D.classList.add('active');
    
    // 隐藏2D canvas
    elements.worldCanvas.style.display = 'none';
    
    // 创建3D canvas容器
    let container3D = document.getElementById('world-canvas-3d');
    if (!container3D) {
        container3D = document.createElement('div');
        container3D.id = 'world-canvas-3d';
        elements.simulationArea.appendChild(container3D);
    }
    container3D.style.display = 'block';
    
    // 创建3D渲染器
    if (!renderer3D) {
        renderer3D = new Renderer3D(container3D, ecosystem);
    }
    
    // 添加3D控制提示
    add3DControlsHint();
    
    // 更新事件监听
    updateEventListenersFor3D();
}

// 切换到2D模式
function switchTo2D() {
    if (currentMode === '2d') return;
    
    currentMode = '2d';
    
    // 更新按钮状态
    elements.btn3D.classList.remove('active');
    elements.btn2D.classList.add('active');
    
    // 显示2D canvas
    elements.worldCanvas.style.display = 'block';
    
    // 隐藏3D
    const container3D = document.getElementById('world-canvas-3d');
    if (container3D) {
        container3D.style.display = 'none';
    }
    
    // 移除3D控制提示
    remove3DControlsHint();
    
    // 更新事件监听
    updateEventListenersFor2D();
}

// 添加3D控制提示
function add3DControlsHint() {
    let hint = document.querySelector('.controls-3d');
    if (!hint) {
        hint = document.createElement('div');
        hint.className = 'controls-3d';
        hint.innerHTML = `
            <div><span>左键拖拽</span> - 旋转视角</div>
            <div><span>右键拖拽</span> - 平移</div>
            <div><span>滚轮</span> - 缩放</div>
            <div><span>点击生物</span> - 查看详情</div>
        `;
        elements.simulationArea.appendChild(hint);
    }
}

// 移除3D控制提示
function remove3DControlsHint() {
    const hint = document.querySelector('.controls-3d');
    if (hint) {
        hint.remove();
    }
}

// 初始化事件监听
function initEventListeners() {
    // 控制按钮
    elements.btnStart.addEventListener('click', () => {
        ecosystem.start();
        updateButtonStates();
    });
    
    elements.btnPause.addEventListener('click', () => {
        ecosystem.pause();
        updateButtonStates();
    });
    
    elements.btnReset.addEventListener('click', () => {
        ecosystem.reset();
        updateEcosystemParams();
        updateButtonStates();
        // 清理3D渲染器
        if (renderer3D) {
            renderer3D.creatureMeshes.forEach((mesh, id) => {
                renderer3D.scene.remove(mesh);
            });
            renderer3D.creatureMeshes.clear();
            renderer3D.plantMeshes.forEach((mesh, plant) => {
                renderer3D.scene.remove(mesh);
            });
            renderer3D.plantMeshes.clear();
        }
    });
    
    // 视图切换按钮
    elements.btn2D.addEventListener('click', () => switchTo2D());
    elements.btn3D.addEventListener('click', () => switchTo3D());
    
    // 速度控制
    elements.simSpeed.addEventListener('input', (e) => {
        const speed = parseInt(e.target.value);
        ecosystem.setSpeed(speed);
        elements.speedValue.textContent = speed + 'x';
    });
    
    // 参数控制
    elements.initialCreatures.addEventListener('change', updateEcosystemParams);
    
    elements.mutationRate.addEventListener('input', (e) => {
        const rate = parseInt(e.target.value) / 100;
        ecosystem.mutationRate = rate;
        elements.mutationValue.textContent = e.target.value + '%';
    });
    
    elements.foodSpawnRate.addEventListener('input', (e) => {
        const rate = parseInt(e.target.value);
        ecosystem.foodSpawnRate = rate;
        elements.foodValue.textContent = rate;
    });
    
    elements.predatorRatio.addEventListener('input', (e) => {
        const ratio = parseInt(e.target.value) / 100;
        ecosystem.predatorRatio = ratio;
        elements.predatorValue.textContent = e.target.value + '%';
    });
    
    // 2D Canvas鼠标事件
    updateEventListenersFor2D();
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case ' ':
                e.preventDefault();
                if (ecosystem.running) {
                    ecosystem.pause();
                } else {
                    ecosystem.start();
                }
                updateButtonStates();
                break;
            case 'r':
            case 'R':
                if (e.ctrlKey) {
                    e.preventDefault();
                    ecosystem.reset();
                }
                break;
            case 's':
                renderer2D.toggleSensors();
                break;
            case 'v':
            case 'V':
                if (currentMode === '2d') {
                    switchTo3D();
                } else {
                    switchTo2D();
                }
                break;
        }
    });
}

// 2D模式事件监听
function updateEventListenersFor2D() {
    elements.worldCanvas.removeEventListener('mousedown', onMouseDown2D);
    elements.worldCanvas.removeEventListener('mousemove', onMouseMove2D);
    elements.worldCanvas.removeEventListener('mouseup', onMouseUp2D);
    elements.worldCanvas.removeEventListener('wheel', onWheel2D);
    elements.worldCanvas.removeEventListener('click', onClick2D);
    
    elements.worldCanvas.addEventListener('mousedown', onMouseDown2D);
    elements.worldCanvas.addEventListener('mousemove', onMouseMove2D);
    elements.worldCanvas.addEventListener('mouseup', onMouseUp2D);
    elements.worldCanvas.addEventListener('wheel', onWheel2D);
    elements.worldCanvas.addEventListener('click', onClick2D);
}

// 3D模式事件监听
function updateEventListenersFor3D() {
    if (!renderer3D) return;
    
    const domElement = renderer3D.renderer.domElement;
    
    domElement.addEventListener('click', (e) => {
        const creature = renderer3D.onClick(e);
        if (creature) {
            ecosystem.selectCreature(creature);
            updateCreatureInfo(creature);
        } else {
            ecosystem.selectCreature(null);
            elements.creatureInfo.innerHTML = '<p class="hint">点击生物查看详情</p>';
            const ctx = elements.brainCanvas.getContext('2d');
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, elements.brainCanvas.width, elements.brainCanvas.height);
        }
    });
}

// 更新生态系统参数
function updateEcosystemParams() {
    ecosystem.setParams({
        initialCreatures: parseInt(elements.initialCreatures.value) || 20,
        mutationRate: (parseInt(elements.mutationRate.value) || 10) / 100,
        foodSpawnRate: parseInt(elements.foodSpawnRate.value) || 5,
        predatorRatio: (parseInt(elements.predatorRatio.value) || 10) / 100
    });
}

// 更新按钮状态
function updateButtonStates() {
    if (ecosystem.running) {
        elements.btnStart.disabled = true;
        elements.btnPause.disabled = false;
    } else {
        elements.btnStart.disabled = false;
        elements.btnPause.disabled = true;
    }
}

// 生态系统更新回调
function onEcosystemUpdate(stats) {
    // 更新统计UI
    elements.creatureCount.textContent = stats.totalCreatures;
    elements.plantCount.textContent = stats.plants;
    elements.generationCount.textContent = stats.generation;
    elements.bestFitness.textContent = stats.bestFitness;
    
    // 更新图表
    chartManager.update(ecosystem.history);
    
    // 更新选中生物的信息
    if (ecosystem.selectedCreature && !ecosystem.selectedCreature.dead) {
        updateCreatureInfo(ecosystem.selectedCreature);
    } else if (ecosystem.selectedCreature && ecosystem.selectedCreature.dead) {
        elements.creatureInfo.innerHTML = '<p class="hint">生物已死亡</p>';
        ecosystem.selectedCreature = null;
    }
}

// 更新生物信息面板
function updateCreatureInfo(creature) {
    const info = creature.getInfo();
    const color = creature.getColorString();
    
    elements.creatureInfo.innerHTML = `
        <div class="info-row">
            <span class="info-label">类型:</span>
            <span class="info-value" style="color: ${color}">${info.type}</span>
        </div>
        <div class="info-row">
            <span class="info-label">能量:</span>
            <span class="info-value">${info.energy}/${info.maxEnergy}</span>
        </div>
        <div class="info-row">
            <span class="info-label">年龄:</span>
            <span class="info-value">${info.age}</span>
        </div>
        <div class="info-row">
            <span class="info-label">世代:</span>
            <span class="info-value">${info.generation}</span>
        </div>
        <div class="info-row">
            <span class="info-label">后代:</span>
            <span class="info-value">${info.children}</span>
        </div>
        <div class="info-row">
            <span class="info-label">适应度:</span>
            <span class="info-value">${info.fitness}</span>
        </div>
        <div class="info-row">
            <span class="info-label">食物:</span>
            <span class="info-value">${info.foodEaten}</span>
        </div>
        <div class="info-row">
            <span class="info-label">速度:</span>
            <span class="info-value">${info.speed}</span>
        </div>
        <div class="info-row">
            <span class="info-label">可繁殖:</span>
            <span class="info-value">${info.canReproduce ? '是' : '否'}</span>
        </div>
    `;
    
    // 可视化大脑
    if (creature.brain && creature.perception) {
        const inputs = creature.perception.getInputs(ecosystem);
        const outputs = creature.brain.predict(inputs);
        brainVisualizer.visualize(creature.brain, inputs, outputs);
    }
}

// ========== 2D 事件处理 ==========
let isDragging2D = false;
let dragStartX2D, dragStartY2D;

function onMouseDown2D(e) {
    isDragging2D = true;
    dragStartX2D = e.clientX;
    dragStartY2D = e.clientY;
    ecosystem.camera.dragging = true;
}

function onMouseMove2D(e) {
    const rect = elements.worldCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging2D) {
        const dx = e.clientX - dragStartX2D;
        const dy = e.clientY - dragStartY2D;
        ecosystem.panCamera(dx, dy);
        dragStartX2D = e.clientX;
        dragStartY2D = e.clientY;
    }
    
    ecosystem.lastMouseX = x;
    ecosystem.lastMouseY = y;
}

function onMouseUp2D(e) {
    isDragging2D = false;
    ecosystem.camera.dragging = false;
}

function onWheel2D(e) {
    e.preventDefault();
    const rect = elements.worldCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const worldX = (x - rect.width / 2) / ecosystem.camera.zoom + ecosystem.camera.x + rect.width / 2;
    const worldY = (y - rect.height / 2) / ecosystem.camera.zoom + ecosystem.camera.y + rect.height / 2;
    
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    ecosystem.zoomCamera(zoomFactor, worldX, worldY);
}

function onClick2D(e) {
    if (isDragging2D) return;
    
    const rect = elements.worldCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const worldX = (x - rect.width / 2) / ecosystem.camera.zoom + ecosystem.camera.x + rect.width / 2;
    const worldY = (y - rect.height / 2) / ecosystem.camera.zoom + ecosystem.camera.y + rect.height / 2;
    
    const clickedCreature = ecosystem.getEntityAt(worldX, worldY);
    
    if (clickedCreature) {
        ecosystem.selectCreature(clickedCreature);
        updateCreatureInfo(clickedCreature);
    } else {
        ecosystem.selectCreature(null);
        elements.creatureInfo.innerHTML = '<p class="hint">点击生物查看详情</p>';
        const ctx = elements.brainCanvas.getContext('2d');
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, elements.brainCanvas.width, elements.brainCanvas.height);
    }
}

// 游戏主循环
let lastTime = 0;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

function gameLoop(currentTime) {
    animationId = requestAnimationFrame(gameLoop);
    
    const deltaTime = currentTime - lastTime;
    
    if (deltaTime >= frameInterval) {
        lastTime = currentTime - (deltaTime % frameInterval);
        
        // 更新生态系统
        ecosystem.update();
        
        // 根据当前模式渲染
        if (currentMode === '3d' && renderer3D) {
            renderer3D.render();
        } else {
            renderer2D.render();
        }
    }
}

// 窗口大小改变时重新调整
window.addEventListener('resize', () => {
    if (renderer2D) {
        renderer2D.resize();
    }
    if (renderer3D) {
        renderer3D.onResize();
    }
});

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    if (renderer3D) {
        renderer3D.dispose();
    }
});
