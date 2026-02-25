# 🧮 Math Sandbox - 数学可视化沙盒

一个交互式的数学可视化工具，支持2D/3D函数绘图、分形渲染、参数方程和向量场。

🔗 **在线体验**: [https://li-guohao.github.io](https://li-guohao.github.io)

## ✨ 功能特性

### 📐 支持的模式

| 模式 | 描述 |
|------|------|
| **2D 函数** | 绘制 y = f(x) 函数曲线 |
| **3D 函数** | 渲染 z = f(x,y) 三维表面 |
| **分形** | 曼德勃罗集、朱利亚集、燃烧船、牛顿分形 |
| **参数方程** | 绘制 x(t), y(t) 参数曲线 |
| **向量场** | 可视化向量场 F(x,y) |

### 🎨 可视化特性

- **动态3D渲染**: 使用 Three.js 实时渲染3D函数表面
- **交互式分形**: 支持缩放、平移探索分形细节
- **多函数叠加**: 同时绘制多个函数进行对比
- **颜色映射**: 多种颜色方案（火焰、海洋、彩虹等）
- **实时坐标**: 鼠标悬停显示精确坐标

### 🧮 数学函数

支持丰富的数学函数和常量：

```javascript
// 三角函数
sin(x), cos(x), tan(x), asin(x), acos(x), atan(x)

// 双曲函数
sinh(x), cosh(x), tanh(x)

// 指数和对数
exp(x), log(x), log10(x), pow(x, n), sqrt(x)

// 特殊函数
abs(x), floor(x), ceil(x), round(x)
max(a,b), min(a,b), sign(x)

// 自定义函数
gaussian(x)      // 高斯分布
sinc(x)          // Sinc函数
sigmoid(x)       // S型函数
noise(x,y)       // Perlin噪声
smoothstep(a,b,x)// 平滑插值

// 常量
PI, E
```

## 🚀 快速开始

### 在线使用
直接访问: [https://li-guohao.github.io](https://li-guohao.github.io)

### 本地运行
```bash
# 克隆仓库
git clone https://github.com/li-guohao/li-guohao.github.io.git

# 进入目录
cd li-guohao.github.io

# 启动本地服务器
python -m http.server 8000
# 或
npx serve

# 访问 http://localhost:8000
```

## 🎮 操作指南

### 通用操作
| 操作 | 功能 |
|------|------|
| `左键拖拽` | 平移视图 |
| `滚轮` | 缩放 |
| `双击` | 重置视图 |
| `Enter` | 绘制/更新 |

### 3D 模式
| 操作 | 功能 |
|------|------|
| `左键拖拽` | 旋转视角 |
| `右键拖拽` | 平移视角 |
| `滚轮` | 缩放 |

### 分形模式
| 操作 | 功能 |
|------|------|
| `左键拖拽` | 平移视口 |
| `滚轮` | 缩放 |
| `迭代次数滑块` | 调整渲染精度 |

## 📚 示例

### 2D 函数
```
sin(x)                    // 正弦波
exp(-x^2)                // 高斯分布
sin(x) * exp(-x^2/10)    // 衰减正弦
noise(x, 0)              // 噪声函数
```

### 3D 函数
```
sin(sqrt(x^2+y^2))       // 波纹
x^2 - y^2                // 马鞍面
exp(-(x^2+y^2)/10)       // 高斯分布
sin(x) + cos(y)          // 正弦网格
```

### 参数方程
```
x(t) = cos(t)      y(t) = sin(t)          // 圆
x(t) = t*cos(t)    y(t) = t*sin(t)        // 螺旋
x(t) = sin(3*t)    y(t) = cos(2*t)        // 利萨如曲线
```

### 向量场
```
Fx = -y              Fy = x                 // 旋转场
Fx = x               Fy = -y                // 源/汇
Fx = cos(y)          Fy = sin(x)            // 波动场
```

## 📁 项目结构

```
.
├── index.html              # 主页面
├── css/
│   └── style.css           # 样式
├── js/
│   ├── math/
│   │   ├── engine.js       # 数学表达式解析器
│   │   ├── plotter.js      # 2D/3D 绘图引擎
│   │   ├── fractals.js     # 分形渲染器
│   │   ├── renderer3d.js   # Three.js 3D渲染
│   │   └── main.js         # 主程序逻辑
│   └── ...                 # 其他模块
├── README.md
└── LICENSE
```

## 🛠️ 技术栈

- **原生 JavaScript**: 核心逻辑
- **Three.js**: 3D渲染
- **HTML5 Canvas**: 2D绘图和分形渲染
- **CSS3**: 界面样式

## 📝 算法说明

### 分形渲染
- **曼德勃罗集**: z = z² + c 迭代
- **朱利亚集**: 固定 c 的曼德勃罗变种
- **燃烧船**: 使用绝对值的变种
- **牛顿分形**: 牛顿迭代法求根

### 3D表面
- 使用 BufferGeometry 优化性能
- 顶点着色实现高度映射
- 法线计算实现光照

### 数学解析
- 安全的函数构造求值
- 作用域隔离防止注入
- 错误处理返回 NaN

## 🎯 未来计划

- [ ] 复数函数可视化
- [ ] 常微分方程(ODE)求解器
- [ ] 傅里叶变换可视化
- [ ] 导出图片/动画
- [ ] 保存和分享公式
- [ ] 更多分形类型

## 📄 许可证

MIT License

---

Made with ❤️ by li-guohao
