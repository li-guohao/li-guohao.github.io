/**
 * MathEngine - 数学计算引擎
 * 解析和计算数学表达式
 */
class MathEngine {
    constructor() {
        // 预定义的数学函数和常量
        this.mathScope = {
            // 基础数学
            PI: Math.PI,
            E: Math.E,
            abs: Math.abs,
            floor: Math.floor,
            ceil: Math.ceil,
            round: Math.round,
            max: Math.max,
            min: Math.min,
            sign: Math.sign,
            
            // 三角函数
            sin: Math.sin,
            cos: Math.cos,
            tan: Math.tan,
            asin: Math.asin,
            acos: Math.acos,
            atan: Math.atan,
            atan2: Math.atan2,
            
            // 双曲函数
            sinh: Math.sinh,
            cosh: Math.cosh,
            tanh: Math.tanh,
            
            // 指数和对数
            exp: Math.exp,
            log: Math.log,
            log10: Math.log10,
            log2: Math.log2,
            pow: Math.pow,
            sqrt: Math.sqrt,
            cbrt: Math.cbrt,
            
            // 特殊函数
            random: Math.random,
            
            // 自定义函数
            sinc: (x) => x === 0 ? 1 : Math.sin(x) / x,
            gaussian: (x, mu = 0, sigma = 1) => 
                Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2)) / (sigma * Math.sqrt(2 * Math.PI)),
            sigmoid: (x) => 1 / (1 + Math.exp(-x)),
            step: (x) => x >= 0 ? 1 : 0,
            fract: (x) => x - Math.floor(x),
            clamp: (x, min, max) => Math.max(min, Math.min(max, x)),
            lerp: (a, b, t) => a + (b - a) * t,
            smoothstep: (edge0, edge1, x) => {
                const t = MathEngine.prototype.clamp((x - edge0) / (edge1 - edge0), 0, 1);
                return t * t * (3 - 2 * t);
            },
            
            // 噪声函数（简单实现）
            noise: this.simplexNoise.bind(this),
            
            // 复数运算
            complex: (re, im) => new Complex(re, im)
        };
    }
    
    // 解析数学表达式
    parseExpression(expr) {
        try {
            // 清理表达式
            expr = expr.toLowerCase().trim();
            
            // 替换数学符号
            expr = expr.replace(/π/g, 'PI');
            expr = expr.replace(/∞/g, 'Infinity');
            expr = expr.replace(/\^/g, '**');
            
            return expr;
        } catch (e) {
            console.error('Parse error:', e);
            return null;
        }
    }
    
    // 计算2D函数 y = f(x)
    evaluate2D(expr, x) {
        try {
            const scope = { ...this.mathScope, x };
            const parsed = this.parseExpression(expr);
            return this.safeEval(parsed, scope);
        } catch (e) {
            return NaN;
        }
    }
    
    // 计算3D函数 z = f(x, y)
    evaluate3D(expr, x, y, t = 0) {
        try {
            const scope = { ...this.mathScope, x, y, t };
            const parsed = this.parseExpression(expr);
            return this.safeEval(parsed, scope);
        } catch (e) {
            return NaN;
        }
    }
    
    // 计算参数方程
    evaluateParametric(exprX, exprY, exprZ, t) {
        try {
            const scope = { ...this.mathScope, t };
            const parsedX = this.parseExpression(exprX);
            const parsedY = this.parseExpression(exprY);
            const parsedZ = exprZ ? this.parseExpression(exprZ) : '0';
            
            return {
                x: this.safeEval(parsedX, scope),
                y: this.safeEval(parsedY, scope),
                z: this.safeEval(parsedZ, scope)
            };
        } catch (e) {
            return { x: NaN, y: NaN, z: NaN };
        }
    }
    
    // 安全求值
    safeEval(expr, scope) {
        // 创建函数来安全执行
        const keys = Object.keys(scope);
        const values = Object.values(scope);
        
        try {
            const func = new Function(...keys, `return ${expr}`);
            return func(...values);
        } catch (e) {
            return NaN;
        }
    }
    
    // 简单的 Simplex Noise 实现
    simplexNoise(x, y = 0, z = 0) {
        // 简化版 Perlin 噪声
        const p = new Uint8Array(512);
        const permutation = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
        for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];
        
        const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (t, a, b) => a + t * (b - a);
        const grad = (hash, x, y, z) => {
            const h = hash & 15;
            const u = h < 8 ? x : y;
            const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
            return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
        };
        
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        const Z = Math.floor(z) & 255;
        
        x -= Math.floor(x);
        y -= Math.floor(y);
        z -= Math.floor(z);
        
        const u = fade(x);
        const v = fade(y);
        const w = fade(z);
        
        const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
        const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
        
        return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z),
            grad(p[BA], x - 1, y, z)),
            lerp(u, grad(p[AB], x, y - 1, z),
            grad(p[BB], x - 1, y - 1, z))),
            lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1),
            grad(p[BA + 1], x - 1, y, z - 1)),
            lerp(u, grad(p[AB + 1], x, y - 1, z - 1),
            grad(p[BB + 1], x - 1, y - 1, z - 1))));
    }
}

/**
 * 复数类
 */
class Complex {
    constructor(re = 0, im = 0) {
        this.re = re;
        this.im = im;
    }
    
    add(other) {
        return new Complex(this.re + other.re, this.im + other.im);
    }
    
    sub(other) {
        return new Complex(this.re - other.re, this.im - other.im);
    }
    
    mul(other) {
        return new Complex(
            this.re * other.re - this.im * other.im,
            this.re * other.im + this.im * other.re
        );
    }
    
    div(other) {
        const denom = other.re * other.re + other.im * other.im;
        return new Complex(
            (this.re * other.re + this.im * other.im) / denom,
            (this.im * other.re - this.re * other.im) / denom
        );
    }
    
    abs() {
        return Math.sqrt(this.re * this.re + this.im * this.im);
    }
    
    arg() {
        return Math.atan2(this.im, this.re);
    }
    
    pow(n) {
        const r = this.abs();
        const theta = this.arg();
        const rn = Math.pow(r, n);
        return new Complex(
            rn * Math.cos(n * theta),
            rn * Math.sin(n * theta)
        );
    }
    
    static fromPolar(r, theta) {
        return new Complex(r * Math.cos(theta), r * Math.sin(theta));
    }
}
