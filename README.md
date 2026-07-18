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
- Web Speech API (语音播放)

### 后端
- Python Flask 3
- Flask-CORS
- Flask-JWT-Extended (用户认证)
- SQLite (本地数据库)
- Supabase (云数据库，可选)

### 部署
- Netlify (前端)
- 本地运行 (后端)

## 功能特性

- 📖 **智能学习**：基于艾宾浩斯遗忘曲线的间隔重复算法
- 🎯 **多种学习模式**：普通模式、拼写测试、选择题、听音辨词
- 📚 **词库管理**：支持添加、删除、搜索单词，自定义词书
- 📊 **学习统计**：可视化学习进度和成果，成就徽章系统
- 🔐 **用户认证**：注册/登录，数据隔离，多设备同步
- ✨ **动画效果**：卡片翻转、学习完成庆祝动画
- 📱 **响应式设计**：支持桌面和移动端
- ❤️ **收藏单词**：收藏重要单词，方便集中复习
- 👤 **个人主页**：学习统计、成就系统、账户设置

## 项目结构

```
Wordmemory/
├── src/
│   ├── components/          # 通用组件
│   │   └── Layout.tsx       # 页面布局组件
│   ├── pages/               # 页面组件
│   │   ├── HomePage.tsx     # 学习页面
│   │   ├── LibraryPage.tsx  # 词库页面
│   │   ├── StatsPage.tsx    # 统计页面
│   │   ├── AuthPage.tsx     # 登录/注册页面
│   │   ├── ProfilePage.tsx  # 个人主页
│   │   └── FavoritesPage.tsx # 收藏页面
│   ├── store/               # Zustand状态管理
│   │   └── wordStore.ts
│   ├── api/                 # API接口封装
│   │   └── wordApi.ts
│   ├── types/               # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx              # 应用入口
│   ├── main.tsx             # React入口
│   └── index.css            # 全局样式
├── backend/                 # 后端服务
│   ├── app.py               # Flask应用主文件
│   ├── generate_words.py    # 单词数据生成脚本
│   ├── requirements.txt     # 依赖列表
│   ├── wordmemory.db        # SQLite数据库文件
│   └── .env.example         # 环境变量示例
├── index.html               # HTML模板
├── package.json             # 前端依赖
├── tsconfig.json            # TypeScript配置
├── vite.config.ts           # Vite配置
├── tailwind.config.js       # TailwindCSS配置
├── postcss.config.js        # PostCSS配置
└── README.md                # 项目说明文档
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
访问 http://localhost:5175

**后端开发模式：**
```bash
cd backend
python app.py
```
访问 http://localhost:5000

### 环境变量配置

**前端：**
复制 `.env.example` 到 `.env`，修改 `VITE_API_URL` 为你的后端地址。

**后端：**
复制 `backend/.env.example` 到 `backend/.env`，配置以下变量：
- `SECRET_KEY`: JWT密钥（任意字符串）
- `SUPABASE_URL`: Supabase URL（可选）
- `SUPABASE_KEY`: Supabase API Key（可选）

## API接口文档

### 用户认证

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| POST | `/api/register` | 用户注册 | `username`, `password` |
| POST | `/api/login` | 用户登录 | `username`, `password` |

### 单词相关

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/words` | 获取所有单词 | `page`, `limit`, `search`, `category` |
| GET | `/api/words/:id` | 获取单个单词 | - |
| POST | `/api/words` | 添加新单词 | `word`, `phonetic`, `meaning`, `category`, `difficulty` |
| PUT | `/api/words/:id` | 更新单词 | `word`, `phonetic`, `meaning`, `category`, `difficulty` |
| DELETE | `/api/words/:id` | 删除单词 | - |

### 学习记录

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/learning-records` | 获取学习记录 | - |
| POST | `/api/learning-records` | 创建/更新学习记录 | `wordId`, `status` |

### 复习单词

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/review-words` | 获取待复习单词 | - |

### 统计数据

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/stats/daily` | 获取每日统计 | - |
| GET | `/api/stats/weekly` | 获取每周统计 | - |
| GET | `/api/achievements` | 获取学习成就 | - |

### 词书管理

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/wordbooks` | 获取词书列表 | - |
| POST | `/api/wordbooks` | 创建词书 | `name`, `description` |
| DELETE | `/api/wordbooks/:id` | 删除词书 | - |
| POST | `/api/wordbooks/:id/words` | 添加单词到词书 | `wordId` |
| DELETE | `/api/wordbooks/:id/words/:wordId` | 从词书移除单词 | - |

### 收藏管理

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| GET | `/api/favorites` | 获取收藏列表 | - |
| POST | `/api/favorites` | 添加收藏 | `word_id` |
| DELETE | `/api/favorites/:word_id` | 取消收藏 | - |

### 账户管理

| 方法 | 路径 | 描述 | 参数 |
|------|------|------|------|
| POST | `/api/change-password` | 修改密码 | `current_password`, `new_password` |
| POST | `/api/clear-data` | 清除学习数据 | - |

## 部署

### 前端部署到 Netlify

1. 在项目根目录执行 `npm run build`，生成 `dist` 文件夹
2. 登录 Netlify 官网（app.netlify.com）
3. 将 `dist` 文件夹拖拽到 Netlify Drop 区域
4. 部署完成后，Netlify 会生成一个 `项目名.netlify.app` 的访问链接
5. 注册 Netlify 账号后，该链接永久有效

**前端线上地址**：`https://tubular-cucurucho-072871.netlify.app`

### 后端部署（本地运行）

后端服务基于 Python Flask，如需本地运行：
```bash
cd backend
pip install -r requirements.txt
python app.py ```

## 学习模式说明

### 普通模式
查看单词，点击"显示答案"查看释义，标记"已掌握"或"还需复习"

### 拼写测试
根据释义输入单词拼写，系统判断正确性

### 选择题
给出单词，从四个选项中选择正确的释义

### 听音辨词
播放单词发音，从四个选项中选择正确的单词

## 许可证

MIT License

## 项目链接

- GitHub: https://github.com/006huang/Wordmemory
- 前端部署: https://tubular-cucurucho-072871.netlify.app
- 后端部署: 本地运行（`cd backend && python app.py`）