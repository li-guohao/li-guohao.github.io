/**
 * FractalRenderer - 分形渲染器
 * 渲染各种分形图形
 */
class FractalRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        
        // 视口参数
        this.centerX = 0;
        this.centerY = 0;
        this.zoom = 1;
        this.maxIterations = 100;
        
        // 颜色映射
        this.colorScheme = 'fire';
        
        // 动画参数
        this.time = 0;
        this.animating = false;
    }
    
    // 渲染曼德勃罗集
    renderMandelbrot() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        // 计算视口范围
        const aspect = this.width / this.height;
        const scale = 4 / this.zoom;
        const xmin = this.centerX - scale * aspect;
        const xmax = this.centerX + scale * aspect;
        const ymin = this.centerY - scale;
        const ymax = this.centerY + scale;
        
        const dx = (xmax - xmin) / this.width;
        const dy = (ymax - ymin) / this.height;
        
        // 并行计算（使用 Web Worker 会更好，这里简化处理）
        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                const x0 = xmin + px * dx;
                const y0 = ymin + py * dy;
                
                let x = 0;
                let y = 0;
                let x2 = 0;
                let y2 = 0;
                let iteration = 0;
                
                // 优化：避免重复计算 x*x 和 y*y
                while (x2 + y2 <= 4 && iteration < this.maxIterations) {
                    y = 2 * x * y + y0;
                    x = x2 - y2 + x0;
                    x2 = x * x;
                    y2 = y * y;
                    iteration++;
                }
                
                const idx = (py * this.width + px) * 4;
                const color = this.getColor(iteration, this.maxIterations, x2 + y2);
                
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // 渲染朱利亚集
    renderJulia(cx = -0.7, cy = 0.27015) {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        const aspect = this.width / this.height;
        const scale = 4 / this.zoom;
        const xmin = this.centerX - scale * aspect;
        const xmax = this.centerX + scale * aspect;
        const ymin = this.centerY - scale;
        const ymax = this.centerY + scale;
        
        const dx = (xmax - xmin) / this.width;
        const dy = (ymax - ymin) / this.height;
        
        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                let x = xmin + px * dx;
                let y = ymin + py * dy;
                let x2 = x * x;
                let y2 = y * y;
                let iteration = 0;
                
                while (x2 + y2 <= 4 && iteration < this.maxIterations) {
                    y = 2 * x * y + cy;
                    x = x2 - y2 + cx;
                    x2 = x * x;
                    y2 = y * y;
                    iteration++;
                }
                
                const idx = (py * this.width + px) * 4;
                const color = this.getColor(iteration, this.maxIterations, x2 + y2);
                
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // 渲染燃烧船分形
    renderBurningShip() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        const aspect = this.width / this.height;
        const scale = 4 / this.zoom;
        const xmin = this.centerX - scale * aspect;
        const xmax = this.centerX + scale * aspect;
        const ymin = this.centerY - scale;
        const ymax = this.centerY + scale;
        
        const dx = (xmax - xmin) / this.width;
        const dy = (ymax - ymin) / this.height;
        
        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                const x0 = xmin + px * dx;
                const y0 = ymin + py * dy;
                
                let x = 0;
                let y = 0;
                let iteration = 0;
                
                while (x * x + y * y <= 4 && iteration < this.maxIterations) {
                    const xtemp = x * x - y * y + x0;
                    y = Math.abs(2 * x * y) + y0;
                    x = Math.abs(xtemp);
                    iteration++;
                }
                
                const idx = (py * this.width + px) * 4;
                const color = this.getColor(iteration, this.maxIterations, x * x + y * y);
                
                data[idx] = color.r;
                data[idx + 1] = color.g;
                data[idx + 2] = color.b;
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // 渲染牛顿分形
    renderNewton() {
        const imageData = this.ctx.createImageData(this.width, this.height);
        const data = imageData.data;
        
        const aspect = this.width / this.height;
        const scale = 4 / this.zoom;
        const xmin = this.centerX - scale * aspect;
        const xmax = this.centerX + scale * aspect;
        const ymin = this.centerY - scale;
        const ymax = this.centerY + scale;
        
        const dx = (xmax - xmin) / this.width;
        const dy = (ymax - ymin) / this.height;
        
        // z^3 - 1 = 0 的根
        const roots = [
            new Complex(1, 0),
            new Complex(-0.5, Math.sqrt(3) / 2),
            new Complex(-0.5, -Math.sqrt(3) / 2)
        ];
        const colors = [
            { r: 255, g: 0, b: 0 },
            { r: 0, g: 255, b: 0 },
            { r: 0, g: 0, b: 255 }
        ];
        
        for (let py = 0; py < this.height; py++) {
            for (let px = 0; px < this.width; px++) {
                let z = new Complex(xmin + px * dx, ymin + py * dy);
                let iteration = 0;
                
                while (iteration < this.maxIterations) {
                    // z_{n+1} = z_n - (z_n^3 - 1) / (3 * z_n^2)
                    const z2 = z.mul(z);
                    const z3 = z2.mul(z);
                    const numerator = z3.sub(new Complex(1, 0));
                    const denominator = z2.mul(new Complex(3, 0));
                    
                    if (denominator.abs() < 1e-10) break;
                    
                    const nextZ = z.sub(numerator.div(denominator));
                    
                    if (nextZ.sub(z).abs() < 1e-6) break;
                    
                    z = nextZ;
                    iteration++;
                }
                
                // 找到最近的根
                let minDist = Infinity;
                let closestRoot = 0;
                
                for (let i = 0; i < roots.length; i++) {
                    const dist = z.sub(roots[i]).abs();
                    if (dist < minDist) {
                        minDist = dist;
                        closestRoot = i;
                    }
                }
                
                const idx = (py * this.width + px) * 4;
                const brightness = Math.max(0, 1 - iteration / this.maxIterations);
                const c = colors[closestRoot];
                
                data[idx] = c.r * brightness;
                data[idx + 1] = c.g * brightness;
                data[idx + 2] = c.b * brightness;
                data[idx + 3] = 255;
            }
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    // 颜色映射
    getColor(iteration, maxIterations, magnitude) {
        if (iteration >= maxIterations) {
            return { r: 0, g: 0, b: 0 };
        }
        
        // 平滑迭代计数
        const smoothIter = iteration + 1 - Math.log2(Math.log2(magnitude));
        const t = smoothIter / maxIterations;
        
        switch (this.colorScheme) {
            case 'fire':
                return this.fireGradient(t);
            case 'ocean':
                return this.oceanGradient(t);
            case 'rainbow':
                return this.rainbowGradient(t);
            case 'grayscale':
                const v = Math.floor(t * 255);
                return { r: v, g: v, b: v };
            case 'electric':
                return this.electricGradient(t);
            default:
                return this.fireGradient(t);
        }
    }
    
    // 火焰渐变色
    fireGradient(t) {
        t = Math.max(0, Math.min(1, t));
        return {
            r: Math.floor(255 * Math.pow(t, 0.5)),
            g: Math.floor(255 * Math.pow(t, 2)),
            b: Math.floor(255 * Math.max(0, 2 * t - 1))
        };
    }
    
    // 海洋渐变色
    oceanGradient(t) {
        t = Math.max(0, Math.min(1, t));
        return {
            r: Math.floor(255 * Math.max(0, 2 * t - 1)),
            g: Math.floor(255 * Math.pow(t, 0.5)),
            b: Math.floor(255 * (0.5 + 0.5 * t))
        };
    }
    
    // 彩虹渐变色
    rainbowGradient(t) {
        t = Math.max(0, Math.min(1, t));
        const hue = t * 360;
        return this.hslToRgb(hue, 1, 0.5);
    }
    
    // 电光渐变色
    electricGradient(t) {
        t = Math.max(0, Math.min(1, t));
        return {
            r: Math.floor(255 * Math.sin(t * Math.PI) * Math.sin(t * Math.PI * 3)),
            g: Math.floor(255 * Math.sin(t * Math.PI * 2)),
            b: Math.floor(255 * Math.cos(t * Math.PI * 0.5))
        };
    }
    
    // HSL 转 RGB
    hslToRgb(h, s, l) {
        h /= 360;
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.floor(r * 255),
            g: Math.floor(g * 255),
            b: Math.floor(b * 255)
        };
    }
    
    // 重置视口
    resetView() {
        this.centerX = 0;
        this.centerY = 0;
        this.zoom = 1;
    }
    
    // 缩放
    zoomIn(factor = 2) {
        this.zoom *= factor;
    }
    
    zoomOut(factor = 2) {
        this.zoom /= factor;
    }
    
    // 平移
    pan(dx, dy) {
        const scale = 4 / (this.zoom * this.width);
        this.centerX += dx * scale;
        this.centerY += dy * scale;
    }
}
