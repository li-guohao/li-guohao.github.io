/**
 * FunctionPlotter - 函数绘图器
 * 绘制2D和3D函数图形
 */
class FunctionPlotter {
    constructor(canvas2D, canvas3D) {
        this.canvas2D = canvas2D;
        this.ctx2D = canvas2D ? canvas2D.getContext('2d') : null;
        this.canvas3D = canvas3D;
        
        // 2D 视口
        this.view2D = {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10
        };
        
        // 数学引擎
        this.math = new MathEngine();
        
        // 函数列表
        this.functions = [];
        
        // 3D 网格参数
        this.gridSize = 50;
        this.gridSegments = 100;
    }
    
    // ========== 2D 绘图 ==========
    
    // 绘制坐标轴
    drawAxes() {
        if (!this.ctx2D) return;
        
        const ctx = this.ctx2D;
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        
        // 清空
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, width, height);
        
        // 坐标转换
        const toScreenX = (x) => (x - this.view2D.xmin) / (this.view2D.xmax - this.view2D.xmin) * width;
        const toScreenY = (y) => height - (y - this.view2D.ymin) / (this.view2D.ymax - this.view2D.ymin) * height;
        
        // 绘制网格
        ctx.strokeStyle = '#1a1a25';
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        // 垂直网格线
        const xStep = this.niceStep((this.view2D.xmax - this.view2D.xmin) / 10);
        const xStart = Math.floor(this.view2D.xmin / xStep) * xStep;
        for (let x = xStart; x <= this.view2D.xmax; x += xStep) {
            const sx = toScreenX(x);
            ctx.moveTo(sx, 0);
            ctx.lineTo(sx, height);
        }
        
        // 水平网格线
        const yStep = this.niceStep((this.view2D.ymax - this.view2D.ymin) / 10);
        const yStart = Math.floor(this.view2D.ymin / yStep) * yStep;
        for (let y = yStart; y <= this.view2D.ymax; y += yStep) {
            const sy = toScreenY(y);
            ctx.moveTo(0, sy);
            ctx.lineTo(width, sy);
        }
        ctx.stroke();
        
        // 绘制坐标轴
        ctx.strokeStyle = '#00d4aa';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        // X轴
        const y0 = toScreenY(0);
        if (y0 >= 0 && y0 <= height) {
            ctx.moveTo(0, y0);
            ctx.lineTo(width, y0);
        }
        
        // Y轴
        const x0 = toScreenX(0);
        if (x0 >= 0 && x0 <= width) {
            ctx.moveTo(x0, 0);
            ctx.lineTo(x0, height);
        }
        ctx.stroke();
        
        // 绘制刻度标签
        ctx.fillStyle = '#888';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        
        for (let x = xStart; x <= this.view2D.xmax; x += xStep) {
            if (Math.abs(x) > 0.001) {
                const sx = toScreenX(x);
                ctx.fillText(x.toFixed(1), sx, y0 + 15);
            }
        }
        
        ctx.textAlign = 'right';
        for (let y = yStart; y <= this.view2D.ymax; y += yStep) {
            if (Math.abs(y) > 0.001) {
                const sy = toScreenY(y);
                ctx.fillText(y.toFixed(1), x0 - 5, sy + 3);
            }
        }
    }
    
    // 绘制函数
    plotFunction(expr, color = '#00d4aa', lineWidth = 2) {
        if (!this.ctx2D) return;
        
        const ctx = this.ctx2D;
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        
        const toScreenX = (x) => (x - this.view2D.xmin) / (this.view2D.xmax - this.view2D.xmin) * width;
        const toScreenY = (y) => height - (y - this.view2D.ymin) / (this.view2D.ymax - this.view2D.ymin) * height;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        
        let firstPoint = true;
        const step = (this.view2D.xmax - this.view2D.xmin) / width;
        
        for (let px = 0; px <= width; px += 2) {
            const x = this.view2D.xmin + px * step;
            const y = this.math.evaluate2D(expr, x);
            
            if (!isNaN(y) && isFinite(y)) {
                const py = toScreenY(y);
                
                if (firstPoint) {
                    ctx.moveTo(px, py);
                    firstPoint = false;
                } else {
                    // 避免绘制太大的跳跃
                    if (Math.abs(py - ctx.canvas.height / 2) < height * 2) {
                        ctx.lineTo(px, py);
                    } else {
                        ctx.moveTo(px, py);
                    }
                }
            } else {
                firstPoint = true;
            }
        }
        
        ctx.stroke();
    }
    
    // 绘制参数方程
    plotParametric(exprX, exprY, tMin = 0, tMax = 2 * Math.PI, color = '#ff4757') {
        if (!this.ctx2D) return;
        
        const ctx = this.ctx2D;
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        
        const toScreenX = (x) => (x - this.view2D.xmin) / (this.view2D.xmax - this.view2D.xmin) * width;
        const toScreenY = (y) => height - (y - this.view2D.ymin) / (this.view2D.ymax - this.view2D.ymin) * height;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        let firstPoint = true;
        const steps = 1000;
        const dt = (tMax - tMin) / steps;
        
        for (let i = 0; i <= steps; i++) {
            const t = tMin + i * dt;
            const point = this.math.evaluateParametric(exprX, exprY, null, t);
            
            if (!isNaN(point.x) && !isNaN(point.y) && isFinite(point.x) && isFinite(point.y)) {
                const px = toScreenX(point.x);
                const py = toScreenY(point.y);
                
                if (firstPoint) {
                    ctx.moveTo(px, py);
                    firstPoint = false;
                } else {
                    ctx.lineTo(px, py);
                }
            }
        }
        
        ctx.stroke();
    }
    
    // 绘制向量场
    plotVectorField(exprX, exprY, density = 20, color = '#00a8e8') {
        if (!this.ctx2D) return;
        
        const ctx = this.ctx2D;
        const width = this.canvas2D.width;
        const height = this.canvas2D.height;
        
        const toScreenX = (x) => (x - this.view2D.xmin) / (this.view2D.xmax - this.view2D.xmin) * width;
        const toScreenY = (y) => height - (y - this.view2D.ymin) / (this.view2D.ymax - this.view2D.ymin) * height;
        const toWorldX = (px) => this.view2D.xmin + px / width * (this.view2D.xmax - this.view2D.xmin);
        const toWorldY = (py) => this.view2D.ymin + (height - py) / height * (this.view2D.ymax - this.view2D.ymin);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        
        const stepX = width / density;
        const stepY = height / density;
        const arrowSize = Math.min(stepX, stepY) * 0.3;
        
        for (let px = stepX / 2; px < width; px += stepX) {
            for (let py = stepY / 2; py < height; py += stepY) {
                const x = toWorldX(px);
                const y = toWorldY(py);
                
                const vx = this.math.evaluate2D(exprX, x, y);
                const vy = this.math.evaluate2D(exprY, x, y);
                
                if (!isNaN(vx) && !isNaN(vy) && isFinite(vx) && isFinite(vy)) {
                    const mag = Math.sqrt(vx * vx + vy * vy);
                    if (mag > 0.001) {
                        const scale = Math.min(arrowSize / mag, arrowSize);
                        const endX = px + vx * scale;
                        const endY = py - vy * scale; // Y轴翻转
                        
                        // 绘制箭头线
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(px, py);
                        ctx.lineTo(endX, endY);
                        ctx.stroke();
                        
                        // 箭头头部
                        const angle = Math.atan2(endY - py, endX - px);
                        ctx.beginPath();
                        ctx.moveTo(endX, endY);
                        ctx.lineTo(
                            endX - 5 * Math.cos(angle - Math.PI / 6),
                            endY - 5 * Math.sin(angle - Math.PI / 6)
                        );
                        ctx.lineTo(
                            endX - 5 * Math.cos(angle + Math.PI / 6),
                            endY - 5 * Math.sin(angle + Math.PI / 6)
                        );
                        ctx.fill();
                    }
                }
            }
        }
    }
    
    // ========== 3D 绘图 ==========
    
    // 生成3D函数网格
    generate3DMesh(expr, xMin = -5, xMax = 5, zMin = -5, zMax = 5, segments = 50) {
        const vertices = [];
        const indices = [];
        const colors = [];
        
        const dx = (xMax - xMin) / segments;
        const dz = (zMax - zMin) / segments;
        
        // 生成顶点
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const x = xMin + i * dx;
                const z = zMin + j * dz;
                const y = this.math.evaluate3D(expr, x, z);
                
                vertices.push(x, isFinite(y) ? y : 0, z);
                
                // 根据高度着色
                const t = Math.max(0, Math.min(1, (y + 5) / 10));
                colors.push(t, 0.5, 1 - t);
            }
        }
        
        // 生成索引
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const a = i * (segments + 1) + j;
                const b = a + 1;
                const c = a + segments + 1;
                const d = c + 1;
                
                indices.push(a, b, c);
                indices.push(b, d, c);
            }
        }
        
        return { vertices, indices, colors };
    }
    
    // 计算美观的步长
    niceStep(range) {
        const exponent = Math.floor(Math.log10(range));
        const fraction = range / Math.pow(10, exponent);
        
        let niceFraction;
        if (fraction <= 1) niceFraction = 1;
        else if (fraction <= 2) niceFraction = 2;
        else if (fraction <= 5) niceFraction = 5;
        else niceFraction = 10;
        
        return niceFraction * Math.pow(10, exponent - 1);
    }
    
    // 平移2D视图
    pan2D(dx, dy) {
        const rangeX = this.view2D.xmax - this.view2D.xmin;
        const rangeY = this.view2D.ymax - this.view2D.ymin;
        
        const scaleX = rangeX / this.canvas2D.width;
        const scaleY = rangeY / this.canvas2D.height;
        
        this.view2D.xmin -= dx * scaleX;
        this.view2D.xmax -= dx * scaleX;
        this.view2D.ymin += dy * scaleY;
        this.view2D.ymax += dy * scaleY;
    }
    
    // 缩放2D视图
    zoom2D(factor, centerX, centerY) {
        const rangeX = this.view2D.xmax - this.view2D.xmin;
        const rangeY = this.view2D.ymax - this.view2D.ymin;
        
        const mouseXRatio = centerX / this.canvas2D.width;
        const mouseYRatio = 1 - centerY / this.canvas2D.height;
        
        const newRangeX = rangeX * factor;
        const newRangeY = rangeY * factor;
        
        const centerWorldX = this.view2D.xmin + mouseXRatio * rangeX;
        const centerWorldY = this.view2D.ymin + mouseYRatio * rangeY;
        
        this.view2D.xmin = centerWorldX - mouseXRatio * newRangeX;
        this.view2D.xmax = centerWorldX + (1 - mouseXRatio) * newRangeX;
        this.view2D.ymin = centerWorldY - mouseYRatio * newRangeY;
        this.view2D.ymax = centerWorldY + (1 - mouseYRatio) * newRangeY;
    }
    
    // 重置2D视图
    resetView2D() {
        this.view2D = {
            xmin: -10,
            xmax: 10,
            ymin: -10,
            ymax: 10
        };
    }
    
    // 自动缩放以适合数据
    autoFit(data) {
        if (data.length === 0) return;
        
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        
        for (const point of data) {
            minX = Math.min(minX, point.x);
            maxX = Math.max(maxX, point.x);
            minY = Math.min(minY, point.y);
            maxY = Math.max(maxY, point.y);
        }
        
        const padding = 0.1;
        const rangeX = maxX - minX;
        const rangeY = maxY - minY;
        
        this.view2D.xmin = minX - rangeX * padding;
        this.view2D.xmax = maxX + rangeX * padding;
        this.view2D.ymin = minY - rangeY * padding;
        this.view2D.ymax = maxY + rangeY * padding;
    }
}
