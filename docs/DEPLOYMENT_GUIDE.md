# Wordmemory 部署指南

## 前端部署（Vercel）

### 步骤1: 登录 Vercel

访问 https://vercel.com/ 并使用 GitHub 账号登录。

### 步骤2: 导入项目

1. 点击 "New Project"
2. 选择 "Import Git Repository"
3. 选择你的 Wordmemory 仓库

### 步骤3: 配置构建

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 步骤4: 设置环境变量

在 "Environment Variables" 中添加：

```
VITE_API_URL=https://your-render-api-url.onrender.com/api
```

### 步骤5: 部署

点击 "Deploy" 按钮，等待部署完成。

部署完成后，Vercel会提供一个域名，例如：`https://wordmemory.vercel.app`

---

## 后端部署（Render）

### 步骤1: 登录 Render

访问 https://render.com/ 并使用 GitHub 账号登录。

### 步骤2: 创建 Web Service

1. 点击 "New" -> "Web Service"
2. 选择你的 Wordmemory 仓库

### 步骤3: 配置服务

- **Name**: `wordmemory-backend`
- **Region**: 选择离你最近的区域
- **Branch**: `main`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Plan**: 选择 "Free"

### 步骤4: 设置环境变量

在 "Environment Variables" 中添加：

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### 步骤5: 部署

点击 "Create Web Service"，等待部署完成。

部署完成后，Render会提供一个域名，例如：`https://wordmemory-backend.onrender.com`

---

## 数据库配置（Supabase）

### 步骤1: 创建 Supabase 项目

1. 访问 https://supabase.com/ 并登录
2. 点击 "New Project"
3. 填写项目名称、数据库密码等信息
4. 等待项目创建完成

### 步骤2: 获取连接信息

在项目设置中找到：

- **Project URL**: 在 "Settings" -> "API" 中
- **API Key**: 在 "Settings" -> "API" 中，使用 "anon public" key

### 步骤3: 创建数据表

在 Supabase 的 SQL Editor 中执行 `docs/database.sql` 文件中的SQL语句：

```sql
-- Wordmemory 数据库表结构
CREATE TABLE IF NOT EXISTS words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word VARCHAR(100) NOT NULL,
  phonetic VARCHAR(100),
  meaning TEXT NOT NULL,
  example TEXT,
  category VARCHAR(50) DEFAULT 'CET-4',
  difficulty VARCHAR(20) DEFAULT 'medium',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 学习记录表
CREATE TABLE IF NOT EXISTS learning_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word_id UUID REFERENCES words(id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'new',
  review_count INTEGER DEFAULT 0,
  last_review_at TIMESTAMP,
  next_review_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 每日统计表
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE UNIQUE NOT NULL,
  words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 每周统计表
CREATE TABLE IF NOT EXISTS weekly_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date VARCHAR(10) UNIQUE NOT NULL,
  words_learned INTEGER DEFAULT 0,
  words_reviewed INTEGER DEFAULT 0,
  accuracy INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 步骤4: 配置 Row Level Security (RLS)

为了安全起见，建议启用 RLS：

```sql
-- 启用 RLS
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_stats ENABLE ROW LEVEL SECURITY;

-- 创建策略
CREATE POLICY "Allow all users to read words" ON words
  FOR SELECT USING (true);

CREATE POLICY "Allow all users to insert words" ON words
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow all users to update words" ON words
  FOR UPDATE USING (true);

CREATE POLICY "Allow all users to delete words" ON words
  FOR DELETE USING (true);
```

---

## 测试部署

部署完成后，访问前端URL测试功能是否正常：

1. 访问 `https://your-vercel-domain.vercel.app`
2. 点击 "开始学习" 测试学习功能
3. 点击 "词库" 测试词库管理功能
4. 点击 "统计" 测试统计功能

---

## CI/CD 配置（可选）

### GitHub Actions

创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

在 GitHub Secrets 中添加：

- `VERCEL_TOKEN`: Vercel API Token
- `ORG_ID`: Vercel Organization ID
- `PROJECT_ID`: Vercel Project ID
- `RENDER_SERVICE_ID`: Render Service ID
- `RENDER_API_KEY`: Render API Key
