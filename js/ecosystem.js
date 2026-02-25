/**
 * Ecosystem - 生态系统管理器
 * 管理所有生物、植物，处理交互和模拟循环
 */
class Ecosystem {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        
        // 实体集合
        this.creatures = [];
        this.plants = [];
        
        // 模拟参数
        this.running = false;
        this.simulationSpeed = 1;
        this.generation = 0;
        this.time = 0;
        
        // 可配置参数
        this.initialCreatures = 20;
        this.mutationRate = 0.1;
        this.foodSpawnRate = 5;
        this.predatorRatio = 0.1;
        this.maxPlants = 150;
        this.maxCreatures = 100;
        
        // 统计信息
        this.stats = {
            totalCreatures: 0,
            herbivores: 0,
            predators: 0,
            plants: 0,
            bestFitness: 0,
            averageFitness: 0,
            generation: 0
        };
        
        // 历史数据（用于图表）
        this.history = {
            population: [],
            fitness: [],
            species: [],
            maxHistory: 200
        };
        
        // 选中的生物
        this.selectedCreature = null;
        
        // 事件回调
        this.onUpdate = null;
        
        // 相机/视角
        this.camera = {
            x: 0,
            y: 0,
            zoom: 1,
            targetX: 0,
            targetY: 0,
            dragging: false,
            lastMouseX: 0,
            lastMouseY: 0
        };
    }
    
    // 初始化生态系统
    initialize() {
        this.creatures = [];
        this.plants = [];
        this.generation = 0;
        this.time = 0;
        
        // 创建初始植物
        for (let i = 0; i < 30; i++) {
            this.spawnRandomPlant();
        }
        
        // 创建初始生物
        const predatorCount = Math.floor(this.initialCreatures * this.predatorRatio);
        const herbivoreCount = this.initialCreatures - predatorCount;
        
        for (let i = 0; i < herbivoreCount; i++) {
            this.spawnRandomCreature(false);
        }
        
        for (let i = 0; i < predatorCount; i++) {
            this.spawnRandomCreature(true);
        }
        
        this.updateStats();
    }
    
    // 在随机位置生成植物
    spawnRandomPlant() {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        const plant = new Plant(x, y);
        this.plants.push(plant);
    }
    
    // 在随机位置生成生物
    spawnRandomCreature(isPredator) {
        const x = Math.random() * this.width;
        const y = Math.random() * this.height;
        const creature = new Creature(x, y, isPredator);
        this.addCreature(creature);
    }
    
    // 添加生物
    addCreature(creature) {
        if (this.creatures.length < this.maxCreatures) {
            this.creatures.push(creature);
        }
    }
    
    // 添加植物
    addPlant(plant) {
        if (this.plants.length < this.maxPlants) {
            this.plants.push(plant);
        }
    }
    
    // 更新生态系统
    update() {
        if (!this.running) return;
        
        // 根据模拟速度执行多次更新
        const steps = Math.floor(this.simulationSpeed);
        for (let step = 0; step < steps; step++) {
            this.time++;
            
            // 更新植物
            this.updatePlants();
            
            // 更新生物
            this.updateCreatures();
            
            // 处理碰撞和交互
            this.handleInteractions();
            
            // 生成新食物
            this.spawnFood();
            
            // 清理死亡实体
            this.cleanup();
            
            // 每100tick更新统计
            if (this.time % 100 === 0) {
                this.updateStats();
                this.updateHistory();
            }
        }
        
        // 更新相机
        this.updateCamera();
        
        // 触发更新回调
        if (this.onUpdate) {
            this.onUpdate(this.stats);
        }
    }
    
    // 更新植物
    updatePlants() {
        for (const plant of this.plants) {
            plant.update();
        }
    }
    
    // 更新生物
    updateCreatures() {
        // 更新所有生物
        for (const creature of this.creatures) {
            creature.update(this);
        }
        
        // 更新世代
        const maxGen = Math.max(...this.creatures.map(c => c.generation), 0);
        this.generation = maxGen;
    }
    
    // 处理交互（碰撞检测）
    handleInteractions() {
        // 草食动物吃植物
        for (const creature of this.creatures) {
            if (creature.dead || creature.isPredator) continue;
            
            for (let i = this.plants.length - 1; i >= 0; i--) {
                if (creature.eatPlant(this.plants[i])) {
                    this.plants.splice(i, 1);
                    break; // 每帧只吃一个
                }
            }
        }
        
        // 捕食者捕食
        for (const predator of this.creatures) {
            if (predator.dead || !predator.isPredator) continue;
            
            for (const prey of this.creatures) {
                if (prey.dead || prey.isPredator || prey === predator) continue;
                
                if (predator.huntPrey(prey)) {
                    break; // 每帧只捕猎一个
                }
            }
        }
    }
    
    // 生成食物
    spawnFood() {
        // 根据生成率决定是否生成新植物
        if (Math.random() < this.foodSpawnRate / 100 && this.plants.length < this.maxPlants) {
            this.spawnRandomPlant();
        }
        
        // 如果植物太少，强制生成
        if (this.plants.length < 10) {
            for (let i = 0; i < 5; i++) {
                this.spawnRandomPlant();
            }
        }
    }
    
    // 清理死亡实体
    cleanup() {
        // 移除死亡生物
        this.creatures = this.creatures.filter(c => !c.dead);
        
        // 如果生物太少，自动补充一些（防止灭绝）
        if (this.creatures.length < 3) {
            for (let i = 0; i < 5; i++) {
                this.spawnRandomCreature(Math.random() < this.predatorRatio);
            }
        }
    }
    
    // 更新统计数据
    updateStats() {
        const herbivores = this.creatures.filter(c => !c.isPredator);
        const predators = this.creatures.filter(c => c.isPredator);
        
        const bestFitness = this.creatures.length > 0 
            ? Math.max(...this.creatures.map(c => c.fitness))
            : 0;
        
        const avgFitness = this.creatures.length > 0
            ? this.creatures.reduce((sum, c) => sum + c.fitness, 0) / this.creatures.length
            : 0;
        
        this.stats = {
            totalCreatures: this.creatures.length,
            herbivores: herbivores.length,
            predators: predators.length,
            plants: this.plants.length,
            bestFitness: Math.floor(bestFitness),
            averageFitness: Math.floor(avgFitness),
            generation: this.generation,
            time: this.time
        };
    }
    
    // 更新历史数据
    updateHistory() {
        this.history.population.push({
            herbivores: this.stats.herbivores,
            predators: this.stats.predators,
            plants: this.stats.plants
        });
        
        this.history.fitness.push({
            best: this.stats.bestFitness,
            average: this.stats.averageFitness
        });
        
        this.history.species.push({
            herbivores: this.stats.herbivores,
            predators: this.stats.predators
        });
        
        // 限制历史数据长度
        if (this.history.population.length > this.history.maxHistory) {
            this.history.population.shift();
            this.history.fitness.shift();
            this.history.species.shift();
        }
    }
    
    // 更新相机
    updateCamera() {
        // 平滑相机移动
        this.camera.x += (this.camera.targetX - this.camera.x) * 0.1;
        this.camera.y += (this.camera.targetY - this.camera.y) * 0.1;
    }
    
    // 开始模拟
    start() {
        this.running = true;
    }
    
    // 暂停模拟
    pause() {
        this.running = false;
    }
    
    // 重置
    reset() {
        this.pause();
        this.initialize();
    }
    
    // 设置模拟速度
    setSpeed(speed) {
        this.simulationSpeed = speed;
    }
    
    // 设置参数
    setParams(params) {
        if (params.initialCreatures !== undefined) this.initialCreatures = params.initialCreatures;
        if (params.mutationRate !== undefined) this.mutationRate = params.mutationRate;
        if (params.foodSpawnRate !== undefined) this.foodSpawnRate = params.foodSpawnRate;
        if (params.predatorRatio !== undefined) this.predatorRatio = params.predatorRatio;
    }
    
    // 获取某位置的实体
    getEntityAt(x, y) {
        // 检查生物
        for (const creature of this.creatures) {
            if (creature.dead) continue;
            const dist = Math.sqrt((x - creature.x) ** 2 + (y - creature.y) ** 2);
            if (dist < creature.radius * this.camera.zoom + 5) {
                return creature;
            }
        }
        return null;
    }
    
    // 选择生物
    selectCreature(creature) {
        this.selectedCreature = creature;
    }
    
    // 相机控制
    panCamera(dx, dy) {
        this.camera.targetX += dx / this.camera.zoom;
        this.camera.targetY += dy / this.camera.zoom;
    }
    
    zoomCamera(factor, mouseX, mouseY) {
        const oldZoom = this.camera.zoom;
        this.camera.zoom = Math.max(0.3, Math.min(3, this.camera.zoom * factor));
        
        // 以鼠标位置为中心缩放
        const zoomRatio = this.camera.zoom / oldZoom;
        this.camera.targetX = mouseX - (mouseX - this.camera.targetX) * zoomRatio;
        this.camera.targetY = mouseY - (mouseY - this.camera.targetY) * zoomRatio;
    }
    
    // 重置相机
    resetCamera() {
        this.camera.x = 0;
        this.camera.y = 0;
        this.camera.targetX = 0;
        this.camera.targetY = 0;
        this.camera.zoom = 1;
    }
}
