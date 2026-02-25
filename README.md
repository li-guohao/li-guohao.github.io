# 🧬 AI Ecosystem Sandbox

一个基于神经网络的进化生态系统沙盒模拟器，完全运行在浏览器中。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Web-green.svg)

🔗 **在线体验**: [https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox](https://YOUR_USERNAME.github.io/ai-ecosystem-sandbox)

## ✨ 特性

- **🧠 神经网络驱动**: 每个生物都有自己的神经网络大脑，通过学习进化出觅食、逃避、繁殖等行为
- **🌿 完整生态系统**: 草食动物、捕食者、植物构成的食物链
- **📊 实时可视化**: 
  - 种群数量历史图表
  - 适应度进化曲线
  - 物种分布饼图
  - 神经网络结构可视化
- **⚙️ 可配置参数**: 变异率、食物生成率、捕食者比例等
- **🎮 交互操作**: 缩放、平移视角，点击生物查看详情
- **🧬 进化算法**: 自然选择、遗传交叉、基因变异
- **🎨 双视图模式**: 2D俯瞰模式 + 3D沉浸模式（Three.js）

## 🚀 快速开始

### 在线体验
直接访问 GitHub Pages 链接即可体验，无需安装任何软件。

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/YOUR_USERNAME/ai-ecosystem-sandbox.git

# 进入目录
cd ai-ecosystem-sandbox

# 使用任意静态服务器运行
# Python 3
python -m http.server 8000

# Node.js
npx serve

# 或直接用浏览器打开 index.html
```

然后在浏览器中访问 `http://localhost:8000`

## 🎮 操作指南

### 通用操作
| 操作 | 说明 |
|------|------|
| `点击生物` | 查看详情和神经网络 |
| `空格键` | 暂停/继续 |
| `S键` | 切换传感器显示 |
| `V键` | 切换2D/3D视图 |
| `Ctrl+R` | 重置模拟 |

### 2D模式
| 操作 | 说明 |
|------|------|
| `鼠标拖拽` | 平移视角 |
| `滚轮` | 缩放 |

### 3D模式 ⭐
| 操作 | 说明 |
|------|------|
| `左键拖拽` | 旋转视角 |
| `右键拖拽` | 平移视角 |
| `滚轮` | 缩放 |
| `点击生物` | 选中查看详情 |

## 🧬 生态系统规则

### 生物类型

| 类型 | 颜色 | 特点 |
|------|------|------|
| 🟢 草食动物 | 绿色 | 吃植物，数量多，速度快 |
| 🔴 捕食者 | 红色 | 捕食草食动物，数量少，能量消耗大 |
| 🔵 植物 | 青色 | 固定位置，缓慢生长 |

### 神经网络输入 (8个)
1. 最近食物的X方向
2. 最近食物的Y方向
3. 最近猎物的X方向 (仅捕食者)
4. 最近猎物的Y方向 (仅捕食者)
5. 最近威胁的X方向
6. 最近威胁的Y方向
7. 当前能量水平
8. 随机噪声

### 神经网络输出 (4个)
1. **转向**: 控制移动方向
2. **速度**: 控制移动速度
3. **繁殖意愿**: 决定是否尝试繁殖
4. **行为强度**: 影响行为激进程度

### 进化机制
- **遗传**: 后代继承父母神经网络的权重
- **变异**: 权重有一定概率发生随机变化
- **选择**: 适应度高的生物更容易存活和繁殖

## 📁 项目结构

```
ai-ecosystem-sandbox/
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式文件
├── js/
│   ├── neuralnet.js        # 神经网络实现
│   ├── creature.js         # 生物类
│   ├── ecosystem.js        # 生态系统管理
│   ├── renderer.js         # 2D渲染器
│   ├── charts.js           # 图表绘制
│   ├── main.js             # 主程序
│   └── 3d/
│       └── renderer3d.js   # 3D渲染器 (Three.js)
├── .github/workflows/
│   └── deploy.yml          # 自动部署配置
├── README.md               # 项目说明
├── DEPLOY.md               # 部署指南
└── LICENSE                 # MIT许可证
```

## 🔬 技术细节

### 神经网络架构
- **输入层**: 8个神经元
- **隐藏层**: 12个神经元，Sigmoid激活
- **输出层**: 4个神经元，Sigmoid激活

### 3D渲染 (Three.js)
- **光照系统**: 环境光 + 方向光（阴影）+ 点光源
- **生物模型**: 球体身体 + 眼睛 + 能量环
- **植物模型**: 旋转八面体水晶效果
- **地形**: 网格地面 + 边界线
- **相机控制**: OrbitControls 支持旋转/平移/缩放

### 性能优化
- 2D模式使用 Canvas 2D API
- 3D模式使用 Three.js WebGL渲染
- 空间分割优化碰撞检测
- 可调节的模拟速度
- 高DPI屏幕支持

## 🛣️ 未来计划

- [x] **3D 可视化模式** ✅
- [ ] 更多生物类型（杂食动物、分解者）
- [ ] 环境变化（季节、气候）
- [ ] 保存/加载生态系统状态
- [ ] 参数预设和分享
- [ ] 音效系统
- [ ] VR 支持

## 📜 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- 灵感来源于 [Primer](https://www.youtube.com/c/PrimerBlobs) 的进化模拟视频
- 神经网络算法参考了 [Synaptic](https://github.com/cazala/synaptic)

---

⭐ 如果这个项目对你有帮助，请给它一个 Star！
