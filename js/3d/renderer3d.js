/**
 * Renderer3D - Three.js 3D渲染器
 * 将生态系统渲染为3D场景
 */
class Renderer3D {
    constructor(container, ecosystem) {
        this.container = container;
        this.ecosystem = ecosystem;
        
        // 场景设置
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        // 物体管理
        this.creatureMeshes = new Map();
        this.plantMeshes = new Map();
        this.terrain = null;
        this.gridHelper = null;
        
        // 光照
        this.ambientLight = null;
        this.directionalLight = null;
        
        // 选中效果
        this.selectionRing = null;
        
        // 初始化
        this.init();
    }
    
    // 初始化Three.js场景
    init() {
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0f);
        this.scene.fog = new THREE.Fog(0x0a0a0f, 500, 2500);
        
        // 创建相机
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 1, 5000);
        this.camera.position.set(0, 800, 1200);
        this.camera.lookAt(this.ecosystem.width / 2, 0, this.ecosystem.height / 2);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);
        
        // 添加轨道控制器
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1;
        this.controls.target.set(this.ecosystem.width / 2, 0, this.ecosystem.height / 2);
        
        // 添加光照
        this.setupLighting();
        
        // 创建地形
        this.createTerrain();
        
        // 创建选中环
        this.createSelectionRing();
        
        // 窗口大小改变监听
        window.addEventListener('resize', () => this.onResize());
    }
    
    // 设置光照
    setupLighting() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(this.ambientLight);
        
        // 方向光（太阳）
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        this.directionalLight.position.set(500, 1000, 500);
        this.directionalLight.castShadow = true;
        this.directionalLight.shadow.mapSize.width = 2048;
        this.directionalLight.shadow.mapSize.height = 2048;
        this.directionalLight.shadow.camera.near = 0.5;
        this.directionalLight.shadow.camera.far = 3000;
        this.directionalLight.shadow.camera.left = -1500;
        this.directionalLight.shadow.camera.right = 1500;
        this.directionalLight.shadow.camera.top = 1500;
        this.directionalLight.shadow.camera.bottom = -1500;
        this.scene.add(this.directionalLight);
        
        // 点光源（增加氛围）
        const pointLight = new THREE.PointLight(0x00d4aa, 0.3, 1000);
        pointLight.position.set(this.ecosystem.width / 2, 200, this.ecosystem.height / 2);
        this.scene.add(pointLight);
    }
    
    // 创建地形
    createTerrain() {
        // 地面
        const groundGeometry = new THREE.PlaneGeometry(
            this.ecosystem.width + 200, 
            this.ecosystem.height + 200
        );
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a25,
            roughness: 0.8,
            metalness: 0.2
        });
        this.terrain = new THREE.Mesh(groundGeometry, groundMaterial);
        this.terrain.rotation.x = -Math.PI / 2;
        this.terrain.position.set(this.ecosystem.width / 2, -5, this.ecosystem.height / 2);
        this.terrain.receiveShadow = true;
        this.scene.add(this.terrain);
        
        // 网格
        this.gridHelper = new THREE.GridHelper(
            Math.max(this.ecosystem.width, this.ecosystem.height), 
            40, 
            0x00d4aa, 
            0x1a1a25
        );
        this.gridHelper.position.set(this.ecosystem.width / 2, -4, this.ecosystem.height / 2);
        this.scene.add(this.gridHelper);
        
        // 边界线
        this.createBoundaries();
    }
    
    // 创建边界线
    createBoundaries() {
        const points = [
            new THREE.Vector3(0, 0, 0),
            new THREE.Vector3(this.ecosystem.width, 0, 0),
            new THREE.Vector3(this.ecosystem.width, 0, this.ecosystem.height),
            new THREE.Vector3(0, 0, this.ecosystem.height),
            new THREE.Vector3(0, 0, 0)
        ];
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0x00d4aa, linewidth: 2 });
        const boundary = new THREE.Line(geometry, material);
        this.scene.add(boundary);
    }
    
    // 创建选中环
    createSelectionRing() {
        const geometry = new THREE.RingGeometry(12, 15, 32);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00d4aa,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        this.selectionRing = new THREE.Mesh(geometry, material);
        this.selectionRing.rotation.x = -Math.PI / 2;
        this.selectionRing.visible = false;
        this.scene.add(this.selectionRing);
    }
    
    // 创建生物网格
    createCreatureMesh(creature) {
        const group = new THREE.Group();
        
        // 身体
        const bodyGeometry = new THREE.SphereGeometry(creature.radius, 16, 16);
        bodyGeometry.scale(1, 0.7, 1.2);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(creature.color.r / 255, creature.color.g / 255, creature.color.b / 255),
            roughness: 0.4,
            metalness: 0.3,
            emissive: new THREE.Color(creature.color.r / 255, creature.color.g / 255, creature.color.b / 255),
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.castShadow = true;
        body.receiveShadow = true;
        group.add(body);
        
        // 眼睛
        const eyeGeometry = new THREE.SphereGeometry(creature.radius * 0.25, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.5
        });
        
        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(creature.radius * 0.5, creature.radius * 0.3, creature.radius * 0.4);
        group.add(leftEye);
        
        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(creature.radius * 0.5, creature.radius * 0.3, -creature.radius * 0.4);
        group.add(rightEye);
        
        // 瞳孔
        const pupilGeometry = new THREE.SphereGeometry(creature.radius * 0.12, 6, 6);
        const pupilMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        
        const leftPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        leftPupil.position.set(creature.radius * 0.65, creature.radius * 0.35, creature.radius * 0.4);
        group.add(leftPupil);
        
        const rightPupil = new THREE.Mesh(pupilGeometry, pupilMaterial);
        rightPupil.position.set(creature.radius * 0.65, creature.radius * 0.35, -creature.radius * 0.4);
        group.add(rightPupil);
        
        // 能量环
        const ringGeometry = new THREE.TorusGeometry(creature.radius + 2, 0.5, 8, 32);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: 0x2ed573,
            transparent: true,
            opacity: 0.6
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        ring.name = 'energyRing';
        group.add(ring);
        
        // 如果可以繁殖，添加标记
        if (creature.canReproduce) {
            const reproGeometry = new THREE.SphereGeometry(2, 8, 8);
            const reproMaterial = new THREE.MeshBasicMaterial({
                color: 0x00d4aa,
                emissive: 0x00d4aa,
                emissiveIntensity: 0.8
            });
            const reproMarker = new THREE.Mesh(reproGeometry, reproMaterial);
            reproMarker.position.set(0, creature.radius + 4, 0);
            reproMarker.name = 'reproMarker';
            group.add(reproMarker);
        }
        
        return group;
    }
    
    // 创建植物网格
    createPlantMesh(plant) {
        const group = new THREE.Group();
        
        // 主体 - 水晶形状
        const geometry = new THREE.OctahedronGeometry(plant.radius, 0);
        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(plant.color.r / 255, plant.color.g / 255, plant.color.b / 255),
            roughness: 0.2,
            metalness: 0.6,
            emissive: new THREE.Color(plant.color.r / 255, plant.color.g / 255, plant.color.b / 255),
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.9
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        group.add(mesh);
        
        // 发光环
        const ringGeometry = new THREE.TorusGeometry(plant.radius * 1.5, 0.3, 8, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: new THREE.Color(plant.color.r / 255, plant.color.g / 255, plant.color.b / 255),
            transparent: true,
            opacity: 0.4
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        group.add(ring);
        
        return group;
    }
    
    // 更新生物网格
    updateCreatureMesh(creature) {
        let mesh = this.creatureMeshes.get(creature.id);
        
        if (!mesh) {
            mesh = this.createCreatureMesh(creature);
            this.scene.add(mesh);
            this.creatureMeshes.set(creature.id, mesh);
        }
        
        // 更新位置
        mesh.position.set(creature.x, creature.radius, creature.y);
        
        // 更新旋转
        mesh.rotation.y = -creature.angle;
        
        // 更新能量环颜色
        const energyRatio = creature.energy / creature.maxEnergy;
        const energyRing = mesh.getObjectByName('energyRing');
        if (energyRing) {
            energyRing.material.color.setHex(energyRatio > 0.5 ? 0x2ed573 : 0xffa502);
            const scale = 0.5 + energyRatio * 0.5;
            energyRing.scale.set(scale, scale, scale);
        }
        
        // 更新繁殖标记
        const reproMarker = mesh.getObjectByName('reproMarker');
        if (creature.canReproduce && !reproMarker) {
            const newMarker = new THREE.Mesh(
                new THREE.SphereGeometry(2, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: 0x00d4aa,
                    emissive: 0x00d4aa,
                    emissiveIntensity: 0.8
                })
            );
            newMarker.position.set(0, creature.radius + 4, 0);
            newMarker.name = 'reproMarker';
            mesh.add(newMarker);
        } else if (!creature.canReproduce && reproMarker) {
            mesh.remove(reproMarker);
        }
        
        return mesh;
    }
    
    // 更新植物网格
    updatePlantMesh(plant) {
        let mesh = this.plantMeshes.get(plant);
        
        if (!mesh) {
            mesh = this.createPlantMesh(plant);
            this.scene.add(mesh);
            this.plantMeshes.set(plant, mesh);
        }
        
        // 更新位置和旋转
        mesh.position.set(plant.x, plant.radius, plant.y);
        mesh.rotation.y += 0.01;
        mesh.rotation.z = Math.sin(Date.now() * 0.001) * 0.1;
        
        // 根据能量更新大小
        const scale = 0.5 + (plant.energy / plant.maxEnergy) * 0.5;
        mesh.scale.set(scale, scale, scale);
        
        return mesh;
    }
    
    // 渲染一帧
    render() {
        // 更新控制器
        this.controls.update();
        
        // 更新生物
        for (const creature of this.ecosystem.creatures) {
            if (!creature.dead) {
                this.updateCreatureMesh(creature);
            } else {
                this.removeCreatureMesh(creature);
            }
        }
        
        // 更新植物
        for (const plant of this.ecosystem.plants) {
            this.updatePlantMesh(plant);
        }
        
        // 清理死亡的植物
        for (const [plant, mesh] of this.plantMeshes) {
            if (!this.ecosystem.plants.includes(plant)) {
                this.scene.remove(mesh);
                this.plantMeshes.delete(plant);
            }
        }
        
        // 更新选中效果
        if (this.ecosystem.selectedCreature && !this.ecosystem.selectedCreature.dead) {
            this.selectionRing.visible = true;
            this.selectionRing.position.set(
                this.ecosystem.selectedCreature.x,
                1,
                this.ecosystem.selectedCreature.y
            );
            // 旋转动画
            this.selectionRing.rotation.z += 0.02;
        } else {
            this.selectionRing.visible = false;
        }
        
        // 渲染场景
        this.renderer.render(this.scene, this.camera);
    }
    
    // 移除生物网格
    removeCreatureMesh(creature) {
        const mesh = this.creatureMeshes.get(creature.id);
        if (mesh) {
            this.scene.remove(mesh);
            this.creatureMeshes.delete(creature.id);
        }
    }
    
    // 处理窗口大小改变
    onResize() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspect;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }
    
    // 处理鼠标点击（用于3D选择）
    onClick(event) {
        const rect = this.renderer.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
        
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this.camera);
        
        // 检测与生物的交集
        const creatureMeshes = Array.from(this.creatureMeshes.values());
        const intersects = raycaster.intersectObjects(creatureMeshes, true);
        
        if (intersects.length > 0) {
            // 找到对应的生物
            for (const [id, mesh] of this.creatureMeshes) {
                if (mesh === intersects[0].object.parent || mesh === intersects[0].object) {
                    const creature = this.ecosystem.creatures.find(c => c.id === id);
                    if (creature) {
                        return creature;
                    }
                }
            }
        }
        
        return null;
    }
    
    // 销毁
    dispose() {
        this.renderer.dispose();
        this.container.removeChild(this.renderer.domElement);
    }
    
    // 重置相机
    resetCamera() {
        this.camera.position.set(0, 800, 1200);
        this.camera.lookAt(this.ecosystem.width / 2, 0, this.ecosystem.height / 2);
        this.controls.target.set(this.ecosystem.width / 2, 0, this.ecosystem.height / 2);
        this.controls.update();
    }
}
