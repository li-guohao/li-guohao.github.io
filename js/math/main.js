/**
 * Math Sandbox - 主程序
 * 数学可视化沙盒的核心逻辑
 */

// 全局变量
let app;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    app = new MathSandbox();
    app.init();
});

class MathSandbox {
    constructor() {
        this.mode = 'function2d';
        this.math = new MathEngine();
        this.plotter = null;
        this.fractalRenderer = null;
        this.renderer3D = null;
        
        // DOM 元素
        this.canvas2D = document.getElementById('canvas-2d');
        this.container3D = document.getElementById('canvas-3d-container');
        this.formulaContainer = document.getElementById('formula-container');
        this.presetsContainer = document.getElementById('presets-container');
        this.paramsContainer = document.getElementById('params-container');
        this.coordInfo = document.getElementById('coord-info');
        this.viewInfo = document.getElementById('view-info');
        this.functionList = document.getElementById('function-list');
        
        // 状态
        this.functions = [];
        this.fractalParams = {
            type: 'mandelbrot',
            centerX: 0,
            centerY: 0,
            zoom: 1,
            maxIterations: 100,
            colorScheme: 'fire'
        };
        
        // 鼠标状态
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
    }
    
    init() {
        this.setupCanvas();
        this.setupPlotter();
        this.setupEventListeners();
        this.switchMode('function2d');
        this.updateViewInfo();
    }
    
    setupCanvas() {
        // 设置 2D canvas 大小
        const resize = () => {
            const parent = this.canvas2D.parentElement;
            this.canvas2D.width = parent.clientWidth;
            this.canvas2D.height = parent.clientHeight;
            
            if (this.plotter) {
                this.plotter.canvas2D = this.canvas2D;
                this.plotter.ctx2D = this.canvas2D.getContext('2d');
                this.render();
            }
        };
        
        window.addEventListener('resize', resize);
        resize();
    }
    
    setupPlotter() {
        this.plotter = new FunctionPlotter(this.canvas2D, null);
        this.fractalRenderer = new FractalRenderer(this.canvas2D);
    }
    
    setupEventListeners() {
        // 模式切换按钮
        document.querySelectorAll('.btn-mode').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.btn-mode').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.switchMode(e.target.dataset.mode);
            });
        });
        
        // 绘制按钮
        document.getElementById('btn-plot').addEventListener('click', () => {
            this.plot();
        });
        
        // 清除按钮
        document.getElementById('btn-clear').addEventListener('click', () => {
            this.clear();
        });
        
        // Canvas 鼠标事件
        this.canvas2D.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas2D.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas2D.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas2D.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas2D.addEventListener('dblclick', () => this.onDoubleClick());
        
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.plot();
            }
        });
    }
    
    switchMode(mode) {
        this.mode = mode;
        
        // 更新 UI
        this.updateFormulaInputs();
        this.updatePresets();
        this.updateParams();
        
        // 切换 canvas 显示
        if (mode === 'function3d') {
            this.canvas2D.style.display = 'none';
            this.container3D.style.display = 'block';
            this.init3D();
        } else {
            this.canvas2D.style.display = 'block';
            this.container3D.style.display = 'none';
            if (this.renderer3D) {
                this.renderer3D.pause();
            }
        }
        
        // 清空并重新渲染
        this.clear();
    }
    
    init3D() {
        if (!this.renderer3D) {
            this.renderer3D = new MathRenderer3D(this.container3D);
        }
        this.renderer3D.resume();
    }
    
    updateFormulaInputs() {
        let html = '';
        
        switch (this.mode) {
            case 'function2d':
                html = `
                    <div class="input-group">
                        <label>y = f(x)</label>
                        <input type="text" id="input-func-2d" placeholder="例如: sin(x) * exp(-x^2/10)" value="sin(x)">
                    </div>
                `;
                break;
                
            case 'function3d':
                html = `
                    <div class="input-group">
                        <label>z = f(x, y)</label>
                        <input type="text" id="input-func-3d" placeholder="例如: sin(sqrt(x^2+y^2))" value="sin(sqrt(x^2+y^2))">
                    </div>
                `;
                break;
                
            case 'fractal':
                html = `
                    <div class="input-group">
                        <label>分形类型</label>
                        <select id="select-fractal">
                            <option value="mandelbrot">曼德勃罗集</option>
                            <option value="julia">朱利亚集</option>
                            <option value="burningship">燃烧船</option>
                            <option value="newton">牛顿分形</option>
                        </select>
                    </div>
                `;
                break;
                
            case 'parametric':
                html = `
                    <div class="input-group">
                        <label>x(t) = </label>
                        <input type="text" id="input-param-x" placeholder="cos(t)" value="cos(t)">
                    </div>
                    <div class="input-group">
                        <label>y(t) = </label>
                        <input type="text" id="input-param-y" placeholder="sin(t)" value="sin(t)">
                    </div>
                    <div class="input-row">
                        <div class="input-group half">
                            <label>t 最小值</label>
                            <input type="number" id="input-tmin" value="0" step="0.1">
                        </div>
                        <div class="input-group half">
                            <label>t 最大值</label>
                            <input type="number" id="input-tmax" value="6.28" step="0.1">
                        </div>
                    </div>
                `;
                break;
                
            case 'vector':
                html = `
                    <div class="input-group">
                        <label>Fx(x, y) = </label>
                        <input type="text" id="input-vec-x" placeholder="-y" value="-y">
                    </div>
                    <div class="input-group">
                        <label>Fy(x, y) = </label>
                        <input type="text" id="input-vec-y" placeholder="x" value="x">
                    </div>
                `;
                break;
        }
        
        this.formulaContainer.innerHTML = html;
    }
    
    updatePresets() {
        const presets = {
            function2d: [
                { name: '正弦波', expr: 'sin(x)' },
                { name: '高斯分布', expr: 'exp(-x^2)' },
                { name: '衰减正弦', expr: 'sin(x) * exp(-x^2/10)' },
                { name: '双曲正切', expr: 'tanh(x)' },
                { name: 'Sinc函数', expr: 'sinc(x)' },
                { name: '噪声函数', expr: 'noise(x, 0)' }
            ],
            function3d: [
                { name: '波纹', expr: 'sin(sqrt(x^2+y^2))' },
                { name: '马鞍', expr: 'x^2 - y^2' },
                { name: '高斯', expr: 'exp(-(x^2+y^2)/10)' },
                { name: '正弦网格', expr: 'sin(x) + cos(y)' },
                { name: '圆锥', expr: 'sqrt(x^2+y^2)' },
                { name: '心形', expr: '(x^2+y^2-1)^3-x^2*y^3' }
            ],
            parametric: [
                { name: '圆', x: 'cos(t)', y: 'sin(t)', tMin: 0, tMax: 6.28 },
                { name: '椭圆', x: '2*cos(t)', y: 'sin(t)', tMin: 0, tMax: 6.28 },
                { name: '螺旋', x: 't*cos(t)', y: 't*sin(t)', tMin: 0, tMax: 20 },
                { name: '利萨如', x: 'sin(3*t)', y: 'cos(2*t)', tMin: 0, tMax: 6.28 },
                { name: '摆线', x: 't-sin(t)', y: '1-cos(t)', tMin: 0, tMax: 12.56 },
                { name: '星形线', x: 'cos(t)^3', y: 'sin(t)^3', tMin: 0, tMax: 6.28 }
            ]
        };
        
        const modePresets = presets[this.mode] || [];
        
        let html = '';
        modePresets.forEach(preset => {
            html += `<button class="btn-preset" data-preset='${JSON.stringify(preset)}'>${preset.name}</button>`;
        });
        
        this.presetsContainer.innerHTML = html;
        
        // 绑定预设按钮
        this.presetsContainer.querySelectorAll('.btn-preset').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = JSON.parse(e.target.dataset.preset);
                this.loadPreset(preset);
            });
        });
    }
    
    updateParams() {
        let html = '';
        
        if (this.mode === 'fractal') {
            html = `
                <div class="param-group">
                    <label>迭代次数</label>
                    <input type="range" id="param-iterations" min="50" max="500" value="100">
                    <span id="val-iterations">100</span>
                </div>
                <div class="param-group">
                    <label>颜色方案</label>
                    <select id="param-colors">
                        <option value="fire">火焰</option>
                        <option value="ocean">海洋</option>
                        <option value="rainbow">彩虹</option>
                        <option value="grayscale">灰度</option>
                        <option value="electric">电光</option>
                    </select>
                </div>
                <div class="param-group">
                    <button class="btn btn-sm" id="btn-reset-fractal">重置视口</button>
                </div>
            `;
        } else if (this.mode === 'function2d' || this.mode === 'parametric' || this.mode === 'vector') {
            html = `
                <div class="param-group">
                    <button class="btn btn-sm" id="btn-reset-view">重置视图</button>
                    <button class="btn btn-sm" id="btn-autofit">自动适应</button>
                </div>
            `;
        }
        
        this.paramsContainer.innerHTML = html;
        
        // 绑定参数事件
        if (this.mode === 'fractal') {
            const iterSlider = document.getElementById('param-iterations');
            const colorSelect = document.getElementById('param-colors');
            
            if (iterSlider) {
                iterSlider.addEventListener('input', (e) => {
                    document.getElementById('val-iterations').textContent = e.target.value;
                    this.fractalParams.maxIterations = parseInt(e.target.value);
                    this.renderFractal();
                });
            }
            
            if (colorSelect) {
                colorSelect.addEventListener('change', (e) => {
                    this.fractalParams.colorScheme = e.target.value;
                    this.fractalRenderer.colorScheme = e.target.value;
                    this.renderFractal();
                });
            }
            
            document.getElementById('btn-reset-fractal')?.addEventListener('click', () => {
                this.fractalRenderer.resetView();
                this.renderFractal();
            });
        } else {
            document.getElementById('btn-reset-view')?.addEventListener('click', () => {
                this.plotter.resetView2D();
                this.render();
            });
            
            document.getElementById('btn-autofit')?.addEventListener('click', () => {
                // 这里可以实现自动适应逻辑
                this.render();
            });
        }
    }
    
    loadPreset(preset) {
        switch (this.mode) {
            case 'function2d':
                document.getElementById('input-func-2d').value = preset.expr;
                break;
            case 'function3d':
                document.getElementById('input-func-3d').value = preset.expr;
                break;
            case 'parametric':
                document.getElementById('input-param-x').value = preset.x;
                document.getElementById('input-param-y').value = preset.y;
                document.getElementById('input-tmin').value = preset.tMin;
                document.getElementById('input-tmax').value = preset.tMax;
                break;
        }
        this.plot();
    }
    
    plot() {
        switch (this.mode) {
            case 'function2d':
                this.plotFunction2D();
                break;
            case 'function3d':
                this.plotFunction3D();
                break;
            case 'fractal':
                this.plotFractal();
                break;
            case 'parametric':
                this.plotParametric();
                break;
            case 'vector':
                this.plotVectorField();
                break;
        }
    }
    
    plotFunction2D() {
        const expr = document.getElementById('input-func-2d').value;
        const color = this.getNextColor();
        
        this.functions.push({ type: '2d', expr, color });
        this.render();
        this.updateFunctionList();
    }
    
    plotFunction3D() {
        const expr = document.getElementById('input-func-3d').value;
        if (this.renderer3D) {
            this.renderer3D.plotFunction(expr);
        }
    }
    
    plotFractal() {
        const type = document.getElementById('select-fractal')?.value || 'mandelbrot';
        this.fractalRenderer.maxIterations = this.fractalParams.maxIterations;
        this.renderFractal();
    }
    
    renderFractal() {
        const type = document.getElementById('select-fractal')?.value || 'mandelbrot';
        
        switch (type) {
            case 'mandelbrot':
                this.fractalRenderer.renderMandelbrot();
                break;
            case 'julia':
                this.fractalRenderer.renderJulia();
                break;
            case 'burningship':
                this.fractalRenderer.renderBurningShip();
                break;
            case 'newton':
                this.fractalRenderer.renderNewton();
                break;
        }
    }
    
    plotParametric() {
        const exprX = document.getElementById('input-param-x').value;
        const exprY = document.getElementById('input-param-y').value;
        const tMin = parseFloat(document.getElementById('input-tmin').value);
        const tMax = parseFloat(document.getElementById('input-tmax').value);
        const color = this.getNextColor();
        
        this.functions.push({ type: 'parametric', exprX, exprY, tMin, tMax, color });
        this.render();
        this.updateFunctionList();
    }
    
    plotVectorField() {
        const exprX = document.getElementById('input-vec-x').value;
        const exprY = document.getElementById('input-vec-y').value;
        
        this.functions = [{ type: 'vector', exprX, exprY }];
        this.render();
        this.updateFunctionList();
    }
    
    render() {
        if (this.mode === 'function3d' || this.mode === 'fractal') return;
        
        // 绘制坐标轴
        this.plotter.drawAxes();
        
        // 绘制所有函数
        this.functions.forEach(func => {
            switch (func.type) {
                case '2d':
                    this.plotter.plotFunction(func.expr, func.color);
                    break;
                case 'parametric':
                    this.plotter.plotParametric(func.exprX, func.exprY, func.tMin, func.tMax, func.color);
                    break;
                case 'vector':
                    this.plotter.plotVectorField(func.exprX, func.exprY, 20);
                    break;
            }
        });
        
        this.updateViewInfo();
    }
    
    clear() {
        this.functions = [];
        
        if (this.mode === 'function3d') {
            if (this.renderer3D) {
                this.renderer3D.clear();
            }
        } else if (this.mode === 'fractal') {
            this.fractalRenderer.resetView();
            this.renderFractal();
        } else {
            const ctx = this.canvas2D.getContext('2d');
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, this.canvas2D.width, this.canvas2D.height);
            this.plotter.drawAxes();
        }
        
        this.updateFunctionList();
    }
    
    getNextColor() {
        const colors = ['#00d4aa', '#ff4757', '#00a8e8', '#ffa502', '#2ed573', '#ff6b9d'];
        return colors[this.functions.length % colors.length];
    }
    
    updateFunctionList() {
        let html = '';
        this.functions.forEach((func, index) => {
            html += `
                <div class="function-item" style="border-left-color: ${func.color}">
                    <span>${func.type === '2d' ? 'f(x)' : func.type === 'parametric' ? 'param' : 'vector'}</span>
                    <button onclick="app.removeFunction(${index})">×</button>
                </div>
            `;
        });
        this.functionList.innerHTML = html;
    }
    
    removeFunction(index) {
        this.functions.splice(index, 1);
        this.render();
        this.updateFunctionList();
    }
    
    updateViewInfo() {
        const v = this.plotter.view2D;
        this.viewInfo.innerHTML = `
            <div>x: [${v.xmin.toFixed(2)}, ${v.xmax.toFixed(2)}]</div>
            <div>y: [${v.ymin.toFixed(2)}, ${v.ymax.toFixed(2)}]</div>
        `;
    }
    
    // 鼠标事件处理
    onMouseDown(e) {
        this.isDragging = true;
        this.lastMouseX = e.offsetX;
        this.lastMouseY = e.offsetY;
    }
    
    onMouseMove(e) {
        const rect = this.canvas2D.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // 更新坐标显示
        const worldX = this.plotter.view2D.xmin + (x / this.canvas2D.width) * 
                       (this.plotter.view2D.xmax - this.plotter.view2D.xmin);
        const worldY = this.plotter.view2D.ymin + ((this.canvas2D.height - y) / this.canvas2D.height) * 
                       (this.plotter.view2D.ymax - this.plotter.view2D.ymin);
        this.coordInfo.textContent = `x: ${worldX.toFixed(3)}, y: ${worldY.toFixed(3)}`;
        
        if (this.isDragging) {
            const dx = x - this.lastMouseX;
            const dy = y - this.lastMouseY;
            
            if (this.mode === 'fractal') {
                this.fractalRenderer.pan(dx, dy);
                this.renderFractal();
            } else {
                this.plotter.pan2D(dx, dy);
                this.render();
            }
            
            this.lastMouseX = x;
            this.lastMouseY = y;
        }
    }
    
    onMouseUp() {
        this.isDragging = false;
    }
    
    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas2D.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const factor = e.deltaY > 0 ? 1.1 : 0.9;
        
        if (this.mode === 'fractal') {
            this.fractalRenderer.zoom *= factor;
            this.renderFractal();
        } else {
            this.plotter.zoom2D(factor, x, y);
            this.render();
        }
    }
    
    onDoubleClick() {
        if (this.mode === 'fractal') {
            this.fractalRenderer.resetView();
            this.renderFractal();
        } else {
            this.plotter.resetView2D();
            this.render();
        }
    }
}
