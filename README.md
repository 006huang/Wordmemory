# Wordmemory - AI背单词

一个基于AI的智能背单词应用，帮助用户高效记忆英语词汇。

## 技术栈

### 前端
- React 18
- TypeScript
- Vite 6
- TailwindCSS 3
- Zustand (状态管理)
- React Router DOM
- Recharts (图表)
- Lucide React (图标)
- Axios (HTTP客户端)

### 后端
- Python Flask 3
- Flask-CORS
- Supabase (PostgreSQL)

### 部署
- Vercel (前端)
- Render (后端)

## 功能特性

- 📖 **智能学习**：基于艾宾浩斯遗忘曲线的记忆算法
- 📚 **词库管理**：支持添加、删除、搜索单词
- 📊 **学习统计**：可视化学习进度和成果
- 📱 **响应式设计**：支持桌面和移动端

## 项目结构

```
Wordmemory/
├── src/
│   ├── components/          # 通用组件
│   │   └── Layout.tsx       # 页面布局组件
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx     # 学习页面
│   │   ├── LibraryPage.tsx  # 词库页面
│   │   └── StatsPage.tsx    # 统计页面
│   ├── store/               # Zustand状态管理
│   │   └── wordStore.ts
│   ├── api/                 # API接口
│   │   └── wordApi.ts
│   ├── data/                # 模拟数据
│   │   └── mockWords.ts
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # React入口
│   └── index.css            # 全局样式
├── backend/                 # 后端服务
│   ├── app.py               # Flask应用
│   ├── requirements.txt     # 依赖列表
│   └── .env.example         # 环境变量示例
├── index.html               # HTML模板
├── package.json             # 前端依赖
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # TailwindCSS配置
└── postcss.config.js        # PostCSS配置
```

## 快速开始

### 前置条件

- Node.js >= 18
- Python >= 3.10
- npm 或 yarn

### 前端安装

```bash
npm install
```

### 后端安装

```bash
cd backend
pip install -r requirements.txt
```

### 本地运行

**前端开发模式：**
```bash
npm run dev
```

**后端开发模式：**
```bash
cd backend
python app.py
```

### 环境变量配置

**前端：**
复制 `.env.example` 到 `.env`，修改 `VITE_API_URL` 为你的后端地址。

**后端：**
复制 `backend/.env.example` 到 `backend/.env`，填入你的 Supabase 配置。

## API接口文档

### 单词相关

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/words` | 获取所有单词 |
| GET | `/api/words/:id` | 获取单个单词 |
| POST | `/api/words` | 添加新单词 |
| PUT | `/api/words/:id` | 更新单词 |
| DELETE | `/api/words/:id` | 删除单词 |

### 学习记录

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/learning-records` | 获取学习记录 |
| POST | `/api/learning-records` | 创建学习记录 |

### 统计数据

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/stats/daily` | 获取每日统计 |
| GET | `/api/stats/weekly` | 获取每周统计 |

## 部署

### 前端部署到Vercel

1. 登录 Vercel 官网
2. 导入你的 GitHub 仓库
3. 配置构建命令：`npm run build`
4. 配置环境变量 `VITE_API_URL`

### 后端部署到Render

1. 登录 Render 官网
2. 创建新的 Web Service
3. 导入你的 GitHub 仓库
4. 配置构建命令：`pip install -r requirements.txt`
5. 配置启动命令：`python app.py`
6. 配置环境变量

## 许可证

MIT License
