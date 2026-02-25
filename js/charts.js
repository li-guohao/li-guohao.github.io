/**
 * Charts - 实时图表绘制
 * 绘制种群、适应度等统计数据图表
 */
class ChartManager {
    constructor() {
        // 获取canvas元素
        this.popCanvas = document.getElementById('population-chart');
        this.fitCanvas = document.getElementById('fitness-chart');
        this.specCanvas = document.getElementById('species-chart');
        
        // 获取上下文
        this.popCtx = this.popCanvas.getContext('2d');
        this.fitCtx = this.fitCanvas.getContext('2d');
        this.specCtx = this.specCanvas.getContext('2d');
        
        // 设置高DPI
        this.setupHiDPI(this.popCanvas, this.popCtx);
        this.setupHiDPI(this.fitCanvas, this.fitCtx);
        this.setupHiDPI(this.specCanvas, this.specCtx);
    }
    
    // 设置高DPI
    setupHiDPI(canvas, ctx) {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        
        ctx.scale(dpr, dpr);
        canvas.style.width = rect.width + 'px';
        canvas.style.height = rect.height + 'px';
    }
    
    // 更新所有图表
    update(history) {
        this.drawPopulationChart(history.population);
        this.drawFitnessChart(history.fitness);
        this.drawSpeciesChart(history.species);
    }
    
    // 绘制种群历史图表
    drawPopulationChart(data) {
        const ctx = this.popCtx;
        const canvas = this.popCanvas;
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        // 清空
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        if (data.length < 2) return;
        
        // 计算最大值
        let maxVal = 0;
        for (const point of data) {
            maxVal = Math.max(maxVal, point.herbivores + point.predators + point.plants);
        }
        maxVal = Math.max(maxVal, 50);
        
        // 绘制网格
        this.drawGrid(ctx, width, height, maxVal);
        
        const stepX = width / (data.length - 1);
        
        // 绘制植物线
        ctx.strokeStyle = '#00a8e8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i].plants / maxVal) * (height - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // 绘制草食动物线
        ctx.strokeStyle = '#2ed573';
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i].herbivores / maxVal) * (height - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // 绘制捕食者线
        ctx.strokeStyle = '#ff4757';
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i].predators / maxVal) * (height - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // 图例
        this.drawLegend(ctx, width, height, [
            { color: '#2ed573', label: '草食' },
            { color: '#ff4757', label: '捕食' },
            { color: '#00a8e8', label: '植物' }
        ]);
    }
    
    // 绘制适应度图表
    drawFitnessChart(data) {
        const ctx = this.fitCtx;
        const canvas = this.fitCanvas;
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        if (data.length < 2) return;
        
        let maxVal = 0;
        for (const point of data) {
            maxVal = Math.max(maxVal, point.best);
        }
        maxVal = Math.max(maxVal, 100);
        
        this.drawGrid(ctx, width, height, maxVal);
        
        const stepX = width / (data.length - 1);
        
        // 最佳适应度
        ctx.strokeStyle = '#ffa502';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i].best / maxVal) * (height - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // 平均适应度
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        for (let i = 0; i < data.length; i++) {
            const x = i * stepX;
            const y = height - (data[i].average / maxVal) * (height - 20) - 10;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        
        this.drawLegend(ctx, width, height, [
            { color: '#ffa502', label: '最佳' },
            { color: '#00d4aa', label: '平均' }
        ]);
    }
    
    // 绘制物种分布图表（饼图/面积图）
    drawSpeciesChart(data) {
        const ctx = this.specCtx;
        const canvas = this.specCanvas;
        const width = canvas.width / (window.devicePixelRatio || 1);
        const height = canvas.height / (window.devicePixelRatio || 1);
        
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        if (data.length === 0) return;
        
        // 取最新数据
        const latest = data[data.length - 1];
        const total = latest.herbivores + latest.predators;
        
        if (total === 0) return;
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;
        
        // 草食动物比例
        const herbivoreRatio = latest.herbivores / total;
        const herbivoreAngle = herbivoreRatio * Math.PI * 2;
        
        // 绘制草食动物扇形
        ctx.fillStyle = '#2ed573';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + herbivoreAngle);
        ctx.closePath();
        ctx.fill();
        
        // 绘制捕食者扇形
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, -Math.PI / 2 + herbivoreAngle, -Math.PI / 2 + Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        
        // 内圆（甜甜圈效果）
        ctx.fillStyle = '#0a0a0f';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius * 0.5, 0, Math.PI * 2);
        ctx.fill();
        
        // 中心文字
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${total}`, centerX, centerY - 8);
        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#888';
        ctx.fillText('生物', centerX, centerY + 8);
        
        // 比例文字
        if (herbivoreRatio > 0.15) {
            const herbAngle = -Math.PI / 2 + herbivoreAngle / 2;
            const herbX = centerX + Math.cos(herbAngle) * radius * 0.75;
            const herbY = centerY + Math.sin(herbAngle) * radius * 0.75;
            ctx.fillStyle = '#2ed573';
            ctx.font = '10px sans-serif';
            ctx.fillText(`${Math.floor(herbivoreRatio * 100)}%`, herbX, herbY);
        }
        
        if (herbivoreRatio < 0.85) {
            const predAngle = -Math.PI / 2 + herbivoreAngle + (Math.PI * 2 - herbivoreAngle) / 2;
            const predX = centerX + Math.cos(predAngle) * radius * 0.75;
            const predY = centerY + Math.sin(predAngle) * radius * 0.75;
            ctx.fillStyle = '#ff4757';
            ctx.fillText(`${Math.floor((1 - herbivoreRatio) * 100)}%`, predX, predY);
        }
    }
    
    // 绘制网格
    drawGrid(ctx, width, height, maxVal) {
        ctx.strokeStyle = '#1a1a25';
        ctx.lineWidth = 1;
        
        // 水平线
        for (let i = 0; i <= 4; i++) {
            const y = height - (i / 4) * (height - 20) - 10;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            
            // Y轴标签
            ctx.fillStyle = '#666';
            ctx.font = '8px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(Math.floor(maxVal * i / 4).toString(), 2, y - 2);
        }
    }
    
    // 绘制图例
    drawLegend(ctx, width, height, items) {
        const itemWidth = 35;
        const startX = width - items.length * itemWidth - 5;
        
        items.forEach((item, i) => {
            const x = startX + i * itemWidth;
            
            ctx.fillStyle = item.color;
            ctx.fillRect(x, 5, 10, 10);
            
            ctx.fillStyle = '#888';
            ctx.font = '9px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(item.label, x + 12, 13);
        });
    }
}
