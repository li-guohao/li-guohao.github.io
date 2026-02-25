/**
 * Creature - 生态系统中的生物
 * 拥有神经网络大脑，可以感知环境、做出决策、进食、繁殖和进化
 */
class Creature {
    constructor(x, y, isPredator = false, parent1 = null, parent2 = null) {
        // 位置
        this.x = x;
        this.y = y;
        
        // 基本属性
        this.isPredator = isPredator;
        this.radius = isPredator ? 10 : 7;
        this.maxSpeed = isPredator ? 2.5 : 2;
        this.maxEnergy = isPredator ? 150 : 100;
        this.energy = this.maxEnergy * 0.8;
        this.age = 0;
        this.maxAge = 2000 + Math.random() * 1000;
        this.dead = false;
        
        // 速度向量
        this.vx = (Math.random() * 2 - 1) * this.maxSpeed;
        this.vy = (Math.random() * 2 - 1) * this.maxSpeed;
        this.angle = Math.random() * Math.PI * 2;
        
        // 繁殖相关
        this.canReproduce = false;
        this.reproductionCooldown = 0;
        this.reproductionCost = isPredator ? 60 : 40;
        this.reproductionThreshold = isPredator ? 100 : 70;
        this.children = 0;
        this.generation = parent1 ? Math.max(parent1.generation, parent2 ? parent2.generation : 0) + 1 : 0;
        
        // 适应度分数
        this.fitness = 0;
        this.foodEaten = 0;
        this.survivalTime = 0;
        
        // 神经网络大脑
        // 输入: 8个感知输入
        // 隐藏层: 12个神经元
        // 输出: 4个动作 [转向, 速度, 繁殖意愿, 逃跑/追击强度]
        if (parent1 && parent2) {
            // 有性繁殖 - 交叉和变异
            this.brain = NeuralNetwork.crossover(parent1.brain, parent2.brain);
            this.brain.mutate(window.ecosystem ? window.ecosystem.mutationRate : 0.1);
            this.color = this.blendColors(parent1.color, parent2.color);
        } else if (parent1) {
            // 无性繁殖/变异
            this.brain = parent1.brain.copy();
            this.brain.mutate(window.ecosystem ? window.ecosystem.mutationRate : 0.1);
            this.color = this.mutateColor(parent1.color);
        } else {
            // 全新个体
            this.brain = new NeuralNetwork(8, 12, 4);
            this.color = this.generateInitialColor();
        }
        
        // 感知系统
        this.perception = null; // 将在添加到生态系统时初始化
        
        // 传感器可视化
        this.sensorData = {
            nearestFood: null,
            nearestPrey: null,
            nearestThreat: null
        };
        
        // 唯一ID
        this.id = Math.random().toString(36).substr(2, 9);
    }
    
    // 生成初始颜色
    generateInitialColor() {
        if (this.isPredator) {
            // 红色系
            return {
                r: 200 + Math.random() * 55,
                g: 50 + Math.random() * 50,
                b: 50 + Math.random() * 50
            };
        } else {
            // 绿色系
            return {
                r: 50 + Math.random() * 50,
                g: 150 + Math.random() * 105,
                b: 50 + Math.random() * 50
            };
        }
    }
    
    // 混合父母颜色
    blendColors(color1, color2) {
        return {
            r: (color1.r + color2.r) / 2,
            g: (color1.g + color2.g) / 2,
            b: (color1.b + color2.b) / 2
        };
    }
    
    // 变异颜色
    mutateColor(color) {
        const mutate = (val) => Math.max(0, Math.min(255, val + (Math.random() * 40 - 20)));
        return {
            r: mutate(color.r),
            g: mutate(color.g),
            b: mutate(color.b)
        };
    }
    
    // 更新状态
    update(ecosystem) {
        if (this.dead) return;
        
        // 初始化感知系统
        if (!this.perception) {
            this.perception = new Perception(this, ecosystem.width, ecosystem.height);
        }
        
        // 年龄增长
        this.age++;
        this.survivalTime++;
        
        // 能量消耗
        const baseCost = this.isPredator ? 0.15 : 0.1;
        const speedCost = (Math.abs(this.vx) + Math.abs(this.vy)) * 0.02;
        this.energy -= baseCost + speedCost;
        
        // 检查死亡
        if (this.energy <= 0 || this.age > this.maxAge) {
            this.die(ecosystem);
            return;
        }
        
        // 更新繁殖冷却
        if (this.reproductionCooldown > 0) {
            this.reproductionCooldown--;
        }
        
        // 检查是否可以繁殖
        this.canReproduce = this.energy > this.reproductionThreshold && 
                           this.reproductionCooldown === 0 &&
                           this.age > 100;
        
        // 神经网络决策
        this.makeDecision(ecosystem);
        
        // 更新位置
        this.x += this.vx;
        this.y += this.vy;
        
        // 边界处理 - 环绕
        if (this.x < 0) this.x = ecosystem.width;
        if (this.x > ecosystem.width) this.x = 0;
        if (this.y < 0) this.y = ecosystem.height;
        if (this.y > ecosystem.height) this.y = 0;
        
        // 更新角度
        this.angle = Math.atan2(this.vy, this.vx);
        
        // 更新适应度
        this.calculateFitness();
    }
    
    // 神经网络决策
    makeDecision(ecosystem) {
        // 获取感知输入
        const inputs = this.perception.getInputs(ecosystem);
        
        // 更新传感器数据用于可视化
        this.sensorData.nearestFood = this.perception.findNearest(ecosystem.plants);
        if (this.isPredator) {
            this.sensorData.nearestPrey = this.perception.findNearestPrey(ecosystem.creatures);
        }
        this.sensorData.nearestThreat = this.perception.findNearestThreat(ecosystem.creatures);
        
        // 神经网络输出
        const outputs = this.brain.predict(inputs);
        
        // 解析输出
        // outputs[0]: 转向 (-1 到 1)
        // outputs[1]: 速度调节 (0 到 1)
        // outputs[2]: 繁殖意愿 (0 到 1)
        // outputs[3]: 行为强度 (0 到 1)
        
        const turn = (outputs[0] - 0.5) * 2; // -1 到 1
        const speedMod = outputs[1];
        const reproduceWill = outputs[2];
        const behaviorIntensity = outputs[3];
        
        // 应用转向
        const turnRate = 0.3;
        const newAngle = this.angle + turn * turnRate;
        
        // 应用速度
        const targetSpeed = this.maxSpeed * speedMod;
        this.vx = Math.cos(newAngle) * targetSpeed;
        this.vy = Math.sin(newAngle) * targetSpeed;
        
        // 尝试繁殖
        if (reproduceWill > 0.7 && this.canReproduce) {
            this.tryReproduce(ecosystem);
        }
    }
    
    // 尝试繁殖
    tryReproduce(ecosystem) {
        // 寻找附近的配偶
        const mate = this.findMate(ecosystem.creatures);
        
        if (mate) {
            // 有性繁殖
            const childX = (this.x + mate.x) / 2 + (Math.random() * 40 - 20);
            const childY = (this.y + mate.y) / 2 + (Math.random() * 40 - 20);
            
            const child = new Creature(childX, childY, this.isPredator, this, mate);
            ecosystem.addCreature(child);
            
            // 消耗能量
            this.energy -= this.reproductionCost;
            mate.energy -= mate.reproductionCost;
            
            this.children++;
            mate.children++;
            
            this.reproductionCooldown = 100;
            mate.reproductionCooldown = 100;
        } else if (this.energy > this.reproductionThreshold * 1.5) {
            // 无性繁殖（能量充足但没有配偶）
            const childX = this.x + (Math.random() * 60 - 30);
            const childY = this.y + (Math.random() * 60 - 30);
            
            const child = new Creature(childX, childY, this.isPredator, this, null);
            ecosystem.addCreature(child);
            
            this.energy -= this.reproductionCost * 1.5;
            this.children++;
            this.reproductionCooldown = 150;
        }
    }
    
    // 寻找配偶
    findMate(creatures) {
        for (const creature of creatures) {
            if (creature !== this && 
                !creature.dead && 
                creature.isPredator === this.isPredator &&
                creature.canReproduce &&
                this.distanceTo(creature) < 50) {
                return creature;
            }
        }
        return null;
    }
    
    // 进食植物
    eatPlant(plant) {
        if (this.isPredator) return false; // 捕食者不吃植物
        
        const dist = this.distanceTo(plant);
        if (dist < this.radius + plant.radius) {
            this.energy = Math.min(this.maxEnergy, this.energy + plant.energy);
            this.foodEaten++;
            return true;
        }
        return false;
    }
    
    // 捕食
    huntPrey(prey) {
        if (!this.isPredator || prey.isPredator) return false;
        
        const dist = this.distanceTo(prey);
        if (dist < this.radius + prey.radius) {
            this.energy = Math.min(this.maxEnergy, this.energy + prey.energy * 0.5);
            this.foodEaten += 3;
            prey.die(window.ecosystem);
            return true;
        }
        return false;
    }
    
    // 死亡
    die(ecosystem) {
        this.dead = true;
        
        // 尸体转化为植物养分
        if (Math.random() < 0.7) {
            const plant = new Plant(this.x, this.y, this.energy * 0.3);
            ecosystem.addPlant(plant);
        }
    }
    
    // 计算适应度
    calculateFitness() {
        // 适应度基于多个因素
        const survivalScore = this.survivalTime * 0.1;
        const foodScore = this.foodEaten * 10;
        const reproductionScore = this.children * 50;
        const energyScore = this.energy * 0.05;
        
        this.fitness = survivalScore + foodScore + reproductionScore + energyScore;
    }
    
    // 计算距离
    distanceTo(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // 获取颜色字符串
    getColorString() {
        return `rgb(${Math.floor(this.color.r)}, ${Math.floor(this.color.g)}, ${Math.floor(this.color.b)})`;
    }
    
    // 获取信息对象（用于UI显示）
    getInfo() {
        return {
            id: this.id,
            type: this.isPredator ? '捕食者' : '草食动物',
            energy: Math.floor(this.energy),
            maxEnergy: this.maxEnergy,
            age: this.age,
            generation: this.generation,
            children: this.children,
            fitness: Math.floor(this.fitness),
            foodEaten: this.foodEaten,
            canReproduce: this.canReproduce,
            speed: Math.sqrt(this.vx * this.vx + this.vy * this.vy).toFixed(2)
        };
    }
}

/**
 * Plant - 植物/食物
 */
class Plant {
    constructor(x, y, energy = null) {
        this.x = x;
        this.y = y;
        this.radius = 4 + Math.random() * 3;
        this.energy = energy || (10 + Math.random() * 15);
        this.maxEnergy = 30;
        this.growthRate = 0.05 + Math.random() * 0.05;
        this.age = 0;
        
        // 颜色变化
        const g = 150 + Math.random() * 100;
        this.color = {
            r: 20,
            g: Math.floor(g),
            b: 100 + Math.random() * 100
        };
    }
    
    update() {
        this.age++;
        
        // 缓慢生长
        if (this.energy < this.maxEnergy) {
            this.energy += this.growthRate;
        }
        
        // 半径随能量变化
        this.radius = 4 + (this.energy / this.maxEnergy) * 4;
    }
    
    getColorString() {
        const brightness = this.energy / this.maxEnergy;
        return `rgb(${Math.floor(this.color.r * brightness)}, ${Math.floor(this.color.g * brightness)}, ${Math.floor(this.color.b * brightness)})`;
    }
}
