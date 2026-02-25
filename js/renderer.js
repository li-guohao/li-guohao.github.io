/**
 * Renderer - 渲染器
 * 负责绘制生态系统中的所有实体
 */
class Renderer {
    constructor(canvas, ecosystem) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ecosystem = ecosystem;
        
        // 高DPI支持
        this.dpr = window.devicePixelRatio || 1;
        
        // 调整canvas大小
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // 可视化设置
        this.showSensors = true;
        this.showTrails = false;
        this.showBrain = true;
    }
    
    // 调整canvas大小
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.clientWidth * this.dpr;
        this.canvas.height = parent.clientHeight * this.dpr;
        this.canvas.style.width = parent.clientWidth + 'px';
        this.canvas.style.height = parent.clientHeight + 'px';
        this.ctx.scale(this.dpr, this.dpr);
        
        this.width = parent.clientWidth;
        this.height = parent.clientHeight;
    }
    
    // 主渲染函数
    render() {
        // 清空画布
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 保存上下文
        this.ctx.save();
        
        // 应用相机变换
        const cam = this.ecosystem.camera;
        this.ctx.translate(this.width / 2, this.height / 2);
        this.ctx.scale(cam.zoom, cam.zoom);
        this.ctx.translate(-this.width / 2 - cam.x, -this.height / 2 - cam.y);
        
        // 绘制背景网格
        this.drawGrid();
        
        // 绘制世界边界
        this.drawBoundaries();
        
        // 绘制植物
        this.drawPlants();
        
        // 绘制生物
        this.drawCreatures();
        
        // 绘制选中效果
        if (this.ecosystem.selectedCreature) {
            this.drawSelection(this.ecosystem.selectedCreature);
        }
        
        // 恢复上下文
        this.ctx.restore();
    }
    
    // 绘制网格背景
    drawGrid() {
        const gridSize = 50;
        const offsetX = -this.ecosystem.camera.x % gridSize;
        const offsetY = -this.ecosystem.camera.y % gridSize;
        
        this.ctx.strokeStyle = '#1a1a25';
        this.ctx.lineWidth = 1;
        
        // 计算可见区域
        const startX = Math.floor((-this.ecosystem.camera.x - this.width / 2 / this.ecosystem.camera.zoom) / gridSize) * gridSize;
        const startY = Math.floor((-this.ecosystem.camera.y - this.height / 2 / this.ecosystem.camera.zoom) / gridSize) * gridSize;
        const endX = startX + this.width / this.ecosystem.camera.zoom + gridSize * 2;
        const endY = startY + this.height / this.ecosystem.camera.zoom + gridSize * 2;
        
        this.ctx.beginPath();
        for (let x = startX; x < endX; x += gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }
        for (let y = startY; y < endY; y += gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
    }
    
    // 绘制世界边界
    drawBoundaries() {
        this.ctx.strokeStyle = '#00d4aa';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.strokeRect(0, 0, this.ecosystem.width, this.ecosystem.height);
        this.ctx.setLineDash([]);
    }
    
    // 绘制植物
    drawPlants() {
        for (const plant of this.ecosystem.plants) {
            this.ctx.beginPath();
            this.ctx.arc(plant.x, plant.y, plant.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = plant.getColorString();
            this.ctx.fill();
            
            // 发光效果
            const gradient = this.ctx.createRadialGradient(
                plant.x, plant.y, 0,
                plant.x, plant.y, plant.radius * 2
            );
            gradient.addColorStop(0, plant.getColorString() + '40');
            gradient.addColorStop(1, 'transparent');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(plant.x, plant.y, plant.radius * 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // 绘制生物
    drawCreatures() {
        for (const creature of this.ecosystem.creatures) {
            if (creature.dead) continue;
            
            this.drawCreature(creature);
        }
    }
    
    // 绘制单个生物
    drawCreature(creature) {
        const x = creature.x;
        const y = creature.y;
        const r = creature.radius;
        const angle = creature.angle;
        
        // 保存上下文
        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(angle);
        
        // 绘制传感器连线（如果开启）
        if (this.showSensors) {
            this.drawSensors(creature);
        }
        
        // 绘制能量指示环
        const energyRatio = creature.energy / creature.maxEnergy;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r + 4, 0, Math.PI * 2 * energyRatio);
        this.ctx.strokeStyle = energyRatio > 0.5 ? '#2ed573' : '#ffa502';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 绘制身体
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r, 0, Math.PI * 2);
        this.ctx.fillStyle = creature.getColorString();
        this.ctx.fill();
        
        // 身体发光效果
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, r * 1.5);
        gradient.addColorStop(0, creature.getColorString() + '60');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, r * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制眼睛/方向指示器
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(r * 0.4, -r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.ctx.arc(r * 0.4, r * 0.3, r * 0.25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 瞳孔
        this.ctx.fillStyle = '#000';
        this.ctx.beginPath();
        this.ctx.arc(r * 0.5, -r * 0.3, r * 0.1, 0, Math.PI * 2);
        this.ctx.arc(r * 0.5, r * 0.3, r * 0.1, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 如果是捕食者，添加标记
        if (creature.isPredator) {
            this.ctx.strokeStyle = '#ff4757';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r - 2, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        // 可以繁殖的标记
        if (creature.canReproduce) {
            this.ctx.fillStyle = '#00d4aa';
            this.ctx.beginPath();
            this.ctx.arc(0, -r - 6, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // 绘制传感器
    drawSensors(creature) {
        const viewDist = creature.perception ? creature.perception.viewDistance : 100;
        
        // 视野锥
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.arc(0, 0, viewDist, -Math.PI / 4, Math.PI / 4);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 传感器连线
        if (creature.sensorData) {
            // 食物传感器
            if (creature.sensorData.nearestFood) {
                this.ctx.strokeStyle = 'rgba(0, 212, 170, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(
                    creature.sensorData.nearestFood.x - creature.x,
                    creature.sensorData.nearestFood.y - creature.y
                );
                this.ctx.stroke();
            }
            
            // 威胁传感器
            if (creature.sensorData.nearestThreat) {
                this.ctx.strokeStyle = 'rgba(255, 71, 87, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(
                    creature.sensorData.nearestThreat.x - creature.x,
                    creature.sensorData.nearestThreat.y - creature.y
                );
                this.ctx.stroke();
            }
            
            // 猎物传感器
            if (creature.sensorData.nearestPrey) {
                this.ctx.strokeStyle = 'rgba(255, 165, 2, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(
                    creature.sensorData.nearestPrey.x - creature.x,
                    creature.sensorData.nearestPrey.y - creature.y
                );
                this.ctx.stroke();
            }
        }
    }
    
    // 绘制选中效果
    drawSelection(creature) {
        const x = creature.x;
        const y = creature.y;
        const r = creature.radius;
        
        // 选中光环
        this.ctx.strokeStyle = '#00d4aa';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(x, y, r + 12, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 信息标签背景
        const labelY = y - r - 30;
        this.ctx.fillStyle = 'rgba(26, 26, 37, 0.9)';
        this.ctx.strokeStyle = '#00d4aa';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.roundRect(x - 50, labelY - 20, 100, 40, 6);
        this.ctx.fill();
        this.ctx.stroke();
        
        // 文字
        this.ctx.fillStyle = '#00d4aa';
        this.ctx.font = '12px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`Gen ${creature.generation}`, x, labelY);
        this.ctx.fillStyle = '#fff';
        this.ctx.fillText(`♥ ${Math.floor(creature.energy)}`, x, labelY + 14);
    }
    
    // 切换传感器显示
    toggleSensors() {
        this.showSensors = !this.showSensors;
    }
    
    // 切换轨迹显示
    toggleTrails() {
        this.showTrails = !this.showTrails;
    }
}

/**
 * BrainVisualizer - 神经网络可视化器
 * 在UI上显示生物的大脑结构
 */
class BrainVisualizer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
    }
    
    // 可视化神经网络
    visualize(brain, inputs, outputs) {
        if (!brain) return;
        
        // 清空
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        const layerGap = this.width / 4;
        const neuronRadius = 6;
        
        // 绘制输入层
        const inputX = layerGap * 0.5;
        const inputNeurons = [];
        for (let i = 0; i < Math.min(brain.inputSize, 6); i++) {
            const y = this.height / (Math.min(brain.inputSize, 6) + 1) * (i + 1);
            inputNeurons.push({ x: inputX, y: y });
            this.drawNeuron(inputX, y, neuronRadius, inputs ? inputs[i] : 0.5);
        }
        
        // 绘制隐藏层
        const hiddenX = layerGap * 1.5;
        const hiddenNeurons = [];
        const visibleHidden = Math.min(brain.hiddenSize, 8);
        for (let i = 0; i < visibleHidden; i++) {
            const y = this.height / (visibleHidden + 1) * (i + 1);
            hiddenNeurons.push({ x: hiddenX, y: y });
            this.drawNeuron(hiddenX, y, neuronRadius, 0.5);
        }
        
        // 绘制输出层
        const outputX = layerGap * 2.5;
        const outputNeurons = [];
        const outputLabels = ['转向', '速度', '繁殖', '行为'];
        for (let i = 0; i < brain.outputSize; i++) {
            const y = this.height / (brain.outputSize + 1) * (i + 1);
            outputNeurons.push({ x: outputX, y: y });
            this.drawNeuron(outputX, y, neuronRadius + 2, outputs ? outputs[i] : 0.5);
            
            // 标签
            this.ctx.fillStyle = '#888';
            this.ctx.font = '10px sans-serif';
            this.ctx.fillText(outputLabels[i] || `O${i}`, outputX + 15, y + 3);
        }
        
        // 绘制连接（简化版，只显示部分连接）
        this.drawConnections(inputNeurons, hiddenNeurons, brain.weightsIH, 0.2);
        this.drawConnections(hiddenNeurons, outputNeurons, brain.weightsHO, 0.5);
    }
    
    // 绘制神经元
    drawNeuron(x, y, radius, activation) {
        // 激活值映射到颜色
        const intensity = Math.floor(activation * 255);
        const color = `rgb(${intensity}, ${Math.floor(intensity * 0.8)}, 255)`;
        
        // 发光效果
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, radius * 2);
        gradient.addColorStop(0, color);
        gradient.addColorStop(0.5, color + '80');
        gradient.addColorStop(1, 'transparent');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 核心
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    // 绘制连接
    drawConnections(fromNeurons, toNeurons, weights, threshold) {
        this.ctx.lineWidth = 0.5;
        
        for (let i = 0; i < fromNeurons.length; i++) {
            for (let j = 0; j < toNeurons.length; j++) {
                if (weights[j] && weights[j][i]) {
                    const weight = weights[j][i];
                    const absWeight = Math.abs(weight);
                    
                    if (absWeight > threshold) {
                        const from = fromNeurons[i];
                        const to = toNeurons[j];
                        
                        this.ctx.strokeStyle = weight > 0 
                            ? `rgba(46, 213, 115, ${absWeight * 0.5})`  // 正权重 - 绿色
                            : `rgba(255, 71, 87, ${absWeight * 0.5})`;  // 负权重 - 红色
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(from.x, from.y);
                        this.ctx.lineTo(to.x, to.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
    }
}
