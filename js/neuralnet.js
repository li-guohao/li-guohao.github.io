/**
 * NeuralNetwork - 简单的多层感知机神经网络
 * 用于驱动生物的决策行为
 */
class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // 初始化权重矩阵
        this.weightsIH = this.randomMatrix(hiddenSize, inputSize);
        this.weightsHO = this.randomMatrix(outputSize, hiddenSize);
        
        // 偏置
        this.biasH = new Array(hiddenSize).fill(0).map(() => Math.random() * 2 - 1);
        this.biasO = new Array(outputSize).fill(0).map(() => Math.random() * 2 - 1);
    }
    
    // 创建随机矩阵
    randomMatrix(rows, cols) {
        return Array(rows).fill(0).map(() => 
            Array(cols).fill(0).map(() => Math.random() * 2 - 1)
        );
    }
    
    // Sigmoid激活函数
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }
    
    // Sigmoid导数（用于反向传播 - 如果需要的话）
    sigmoidDerivative(x) {
        return x * (1 - x);
    }
    
    // 前向传播
    predict(inputs) {
        if (inputs.length !== this.inputSize) {
            console.error('Input size mismatch');
            return null;
        }
        
        // 输入层 -> 隐藏层
        const hidden = [];
        for (let i = 0; i < this.hiddenSize; i++) {
            let sum = this.biasH[i];
            for (let j = 0; j < this.inputSize; j++) {
                sum += inputs[j] * this.weightsIH[i][j];
            }
            hidden[i] = this.sigmoid(sum);
        }
        
        // 隐藏层 -> 输出层
        const outputs = [];
        for (let i = 0; i < this.outputSize; i++) {
            let sum = this.biasO[i];
            for (let j = 0; j < this.hiddenSize; j++) {
                sum += hidden[j] * this.weightsHO[i][j];
            }
            outputs[i] = this.sigmoid(sum);
        }
        
        return outputs;
    }
    
    // 交叉繁殖 - 从两个父代创建子代
    static crossover(parent1, parent2) {
        const child = new NeuralNetwork(
            parent1.inputSize, 
            parent1.hiddenSize, 
            parent1.outputSize
        );
        
        // 随机混合权重
        for (let i = 0; i < parent1.hiddenSize; i++) {
            for (let j = 0; j < parent1.inputSize; j++) {
                child.weightsIH[i][j] = Math.random() < 0.5 
                    ? parent1.weightsIH[i][j] 
                    : parent2.weightsIH[i][j];
            }
        }
        
        for (let i = 0; i < parent1.outputSize; i++) {
            for (let j = 0; j < parent1.hiddenSize; j++) {
                child.weightsHO[i][j] = Math.random() < 0.5 
                    ? parent1.weightsHO[i][j] 
                    : parent2.weightsHO[i][j];
            }
        }
        
        // 混合偏置
        for (let i = 0; i < parent1.hiddenSize; i++) {
            child.biasH[i] = Math.random() < 0.5 
                ? parent1.biasH[i] 
                : parent2.biasH[i];
        }
        
        for (let i = 0; i < parent1.outputSize; i++) {
            child.biasO[i] = Math.random() < 0.5 
                ? parent1.biasO[i] 
                : parent2.biasO[i];
        }
        
        return child;
    }
    
    // 变异
    mutate(mutationRate) {
        const mutate = (value) => {
            if (Math.random() < mutationRate) {
                // 添加高斯噪声
                return value + (Math.random() * 2 - 1) * 0.5;
            }
            return value;
        };
        
        // 变异输入层->隐藏层权重
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.inputSize; j++) {
                this.weightsIH[i][j] = mutate(this.weightsIH[i][j]);
            }
        }
        
        // 变异隐藏层->输出层权重
        for (let i = 0; i < this.outputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsHO[i][j] = mutate(this.weightsHO[i][j]);
            }
        }
        
        // 变异偏置
        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasH[i] = mutate(this.biasH[i]);
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            this.biasO[i] = mutate(this.biasO[i]);
        }
    }
    
    // 复制网络
    copy() {
        const copy = new NeuralNetwork(this.inputSize, this.hiddenSize, this.outputSize);
        
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.inputSize; j++) {
                copy.weightsIH[i][j] = this.weightsIH[i][j];
            }
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                copy.weightsHO[i][j] = this.weightsHO[i][j];
            }
        }
        
        copy.biasH = [...this.biasH];
        copy.biasO = [...this.biasO];
        
        return copy;
    }
    
    // 序列化（用于保存）
    serialize() {
        return JSON.stringify({
            inputSize: this.inputSize,
            hiddenSize: this.hiddenSize,
            outputSize: this.outputSize,
            weightsIH: this.weightsIH,
            weightsHO: this.weightsHO,
            biasH: this.biasH,
            biasO: this.biasO
        });
    }
    
    // 反序列化
    static deserialize(data) {
        const obj = JSON.parse(data);
        const nn = new NeuralNetwork(obj.inputSize, obj.hiddenSize, obj.outputSize);
        nn.weightsIH = obj.weightsIH;
        nn.weightsHO = obj.weightsHO;
        nn.biasH = obj.biasH;
        nn.biasO = obj.biasO;
        return nn;
    }
}

/**
 * 生物的感知系统 - 处理环境输入
 */
class Perception {
    constructor(creature, worldWidth, worldHeight) {
        this.creature = creature;
        this.worldWidth = worldWidth;
        this.worldHeight = worldHeight;
        
        // 感知参数
        this.viewDistance = creature.isPredator ? 150 : 100;
        this.viewAngle = Math.PI * 0.8; // 前方视野范围
        
        // 输入：8个传感器
        // [最近食物距离x, 最近食物距离y, 最近猎物距离x, 最近猎物距离y, 
        //  最近捕食者距离x, 最近捕食者距离y, 当前能量, 随机噪声]
        this.inputSize = 8;
    }
    
    // 获取感知输入
    getInputs(ecosystem) {
        const inputs = [];
        
        // 1-2: 最近食物/植物的相对位置
        const nearestFood = this.findNearest(ecosystem.plants);
        if (nearestFood) {
            inputs.push((nearestFood.x - this.creature.x) / this.worldWidth);
            inputs.push((nearestFood.y - this.creature.y) / this.worldHeight);
        } else {
            inputs.push(0, 0);
        }
        
        // 3-4: 最近猎物的相对位置（仅对捕食者）
        if (this.creature.isPredator) {
            const nearestPrey = this.findNearestPrey(ecosystem.creatures);
            if (nearestPrey) {
                inputs.push((nearestPrey.x - this.creature.x) / this.worldWidth);
                inputs.push((nearestPrey.y - this.creature.y) / this.worldHeight);
            } else {
                inputs.push(0, 0);
            }
        } else {
            inputs.push(0, 0);
        }
        
        // 5-6: 最近威胁（捕食者）的相对位置
        const nearestThreat = this.findNearestThreat(ecosystem.creatures);
        if (nearestThreat) {
            inputs.push((nearestThreat.x - this.creature.x) / this.worldWidth);
            inputs.push((nearestThreat.y - this.creature.y) / this.worldHeight);
        } else {
            inputs.push(0, 0);
        }
        
        // 7: 当前能量水平 (0-1)
        inputs.push(this.creature.energy / this.creature.maxEnergy);
        
        // 8: 随机噪声（增加行为多样性）
        inputs.push(Math.random() * 2 - 1);
        
        return inputs;
    }
    
    // 查找最近的实体
    findNearest(entities) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const entity of entities) {
            const dist = this.creature.distanceTo(entity);
            if (dist < this.viewDistance && dist < minDist) {
                minDist = dist;
                nearest = entity;
            }
        }
        
        return nearest;
    }
    
    // 查找最近的猎物
    findNearestPrey(creatures) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const creature of creatures) {
            if (!creature.isPredator && !creature.dead && creature !== this.creature) {
                const dist = this.creature.distanceTo(creature);
                if (dist < this.viewDistance && dist < minDist) {
                    minDist = dist;
                    nearest = creature;
                }
            }
        }
        
        return nearest;
    }
    
    // 查找最近的威胁
    findNearestThreat(creatures) {
        let nearest = null;
        let minDist = Infinity;
        
        for (const creature of creatures) {
            // 草食动物视捕食者为威胁
            if (!this.creature.isPredator && creature.isPredator && !creature.dead) {
                const dist = this.creature.distanceTo(creature);
                if (dist < this.viewDistance && dist < minDist) {
                    minDist = dist;
                    nearest = creature;
                }
            }
        }
        
        return nearest;
    }
}
