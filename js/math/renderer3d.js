/**
 * MathRenderer3D - 3D数学函数渲染器
 * 使用 Three.js 渲染 3D 函数图形
 */
class MathRenderer3D {
    constructor(container) {
        this.container = container;
        this.math = new MathEngine();
        
        // Three.js 对象
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 网格对象
        this.mesh = null;
        this.gridHelper = null;
        this.axesHelper = null;
        
        // 动画
        this.animating = false;
        this.time = 0;
        this.currentExpr = '';
        
        this.init();
    }
    
    init() {
        // 场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 50, 200);
        
        // 相机
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
        this.camera.position.set(15, 15, 15);
        this.camera.lookAt(0, 0, 0);
        
        // 渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // 控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // 光照
        this.setupLighting();
        
        // 坐标轴
        this.axesHelper = new THREE.AxesHelper(10);
        this.scene.add(this.axesHelper);
        
        // 网格
        this.gridHelper = new THREE.GridHelper(20, 20, 0x00d4aa, 0x1a1a25);
        this.scene.add(this.gridHelper);
        
        // 窗口大小调整
        window.addEventListener('resize', () => this.onResize());
        
        // 开始动画循环
        this.animate();
    }
    
    setupLighting() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // 方向光
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 20, 10);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        
        // 点光源
        const pointLight = new THREE.PointLight(0x00d4aa, 0.5, 100);
        pointLight.position.set(0, 10, 0);
        this.scene.add(pointLight);
    }
    
    plotFunction(expr) {
        this.currentExpr = expr;
        this.time = 0;
        
        // 移除旧网格
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
        }
        
        // 生成几何体
        const geometry = this.generateSurfaceGeometry(expr);
        
        // 材质 - 使用顶点颜色
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            side: THREE.DoubleSide,
            shininess: 100,
            flatShading: false
        });
        
        // 创建网格
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);
        
        // 添加线框
        const wireframeGeometry = new THREE.WireframeGeometry(geometry);
        const wireframeMaterial = new THREE.LineBasicMaterial({
            color: 0x00d4aa,
            transparent: true,
            opacity: 0.1
        });
        const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
        this.mesh.add(wireframe);
    }
    
    generateSurfaceGeometry(expr, segments = 80) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const indices = [];
        const colors = [];
        
        const size = 10;
        const step = (size * 2) / segments;
        
        // 生成顶点
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const x = -size + i * step;
                const z = -size + j * step;
                const y = this.math.evaluate3D(expr, x, z, this.time);
                
                vertices.push(x, isFinite(y) ? y : 0, z);
                
                // 根据高度计算颜色
                const normalizedY = Math.max(-5, Math.min(5, y)) / 5;
                const color = new THREE.Color();
                
                if (this.getColorScheme() === 'height') {
                    // 高度映射颜色
                    color.setHSL((normalizedY + 1) * 0.4, 0.8, 0.5);
                } else {
                    // 彩虹渐变
                    const hue = (i + j) / (segments * 2);
                    color.setHSL(hue, 0.8, 0.5);
                }
                
                colors.push(color.r, color.g, color.b);
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
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        
        return geometry;
    }
    
    getColorScheme() {
        return 'height'; // 或 'rainbow'
    }
    
    updateSurface() {
        if (!this.mesh || !this.currentExpr) return;
        
        const positions = this.mesh.geometry.attributes.position.array;
        const segments = Math.sqrt(positions.length / 3) - 1;
        const size = 10;
        const step = (size * 2) / segments;
        
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const idx = (i * (segments + 1) + j) * 3;
                const x = -size + i * step;
                const z = -size + j * step;
                const y = this.math.evaluate3D(this.currentExpr, x, z, this.time);
                
                positions[idx + 1] = isFinite(y) ? y : 0;
            }
        }
        
        this.mesh.geometry.attributes.position.needsUpdate = true;
        this.mesh.geometry.computeVertexNormals();
    }
    
    clear() {
        if (this.mesh) {
            this.scene.remove(this.mesh);
            this.mesh = null;
        }
        this.currentExpr = '';
    }
    
    resume() {
        this.animating = true;
    }
    
    pause() {
        this.animating = false;
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.animating) {
            this.time += 0.016;
            
            // 如果表达式包含 t，更新表面
            if (this.currentExpr && this.currentExpr.includes('t')) {
                this.updateSurface();
            }
            
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    onResize() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
}
