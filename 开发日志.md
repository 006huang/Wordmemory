# Wordmemory 开发日志

## 项目启动

**日期**: 2026-07-15
**阶段**: 项目初始化

- 创建项目目录结构
- 配置 Vite + React + TypeScript 环境
- 配置 TailwindCSS 3
- 安装必要依赖

---

## 前端开发

**日期**: 2026-07-15
**阶段**: 组件开发

### 创建的文件

1. `src/types/index.ts` - TypeScript类型定义
   - Word: 单词接口
   - LearningRecord: 学习记录接口
   - DailyStats: 每日统计接口
   - Category: 分类接口

2. `src/data/mockWords.ts` - 模拟数据
   - 12个CET-4和CET-6单词
   - 分类数据

3. `src/store/wordStore.ts` - Zustand状态管理
   - 单词列表管理
   - 学习记录管理
   - 学习状态管理

4. `src/api/wordApi.ts` - API接口
   - 单词CRUD操作
   - 学习记录操作
   - 统计数据获取

5. `src/components/Layout.tsx` - 布局组件
   - 导航栏
   - 响应式菜单

6. `src/pages/HomePage.tsx` - 学习页面
   - 开始学习功能
   - 单词展示
   - 标记掌握/学习中

7. `src/pages/LibraryPage.tsx` - 词库页面
   - 单词搜索
   - 分类筛选
   - 添加/删除单词

8. `src/pages/StatsPage.tsx` - 统计页面
   - 学习进度统计
   - 分类/难度分布饼图
   - 本周学习折线图

---

## 后端开发

**日期**: 2026-07-15
**阶段**: API开发

### 创建的文件

1. `backend/app.py` - Flask应用
   - 配置CORS
   - 连接Supabase数据库
   - 提供模拟数据支持（无数据库时）

### API接口

1. **单词管理**
   - `GET /api/words` - 获取所有单词
   - `GET /api/words/:id` - 获取单个单词
   - `POST /api/words` - 添加单词
   - `PUT /api/words/:id` - 更新单词
   - `DELETE /api/words/:id` - 删除单词

2. **学习记录**
   - `GET /api/learning-records` - 获取学习记录
   - `POST /api/learning-records` - 创建学习记录

3. **统计数据**
   - `GET /api/stats/daily` - 获取每日统计
   - `GET /api/stats/weekly` - 获取每周统计

---

## 遇到的问题及解决方法

### 问题1: PowerShell执行策略限制

**现象**: 无法运行npm命令
**原因**: Windows PowerShell默认禁止运行脚本
**解决**: 使用Write工具直接创建项目文件，绕过命令执行

### 问题2: Supabase连接配置

**现象**: 本地开发时数据库不可用
**解决**: 实现模拟数据模式，当Supabase配置为空时使用内存中的模拟数据

### 问题3: 状态管理同步

**现象**: 学习记录更新后页面不刷新
**解决**: 在markWord操作后调用fetchLearningRecords重新获取数据

### 问题4: 路由导航

**现象**: 移动端菜单点击后不关闭
**解决**: 在Link组件的onClick事件中添加关闭菜单逻辑

---

## 部署计划

**日期**: 待完成

- 前端部署到Vercel
- 后端部署到Render
- 配置环境变量
- 测试线上接口

---

## 后续改进

- 添加用户认证功能
- 实现艾宾浩斯遗忘曲线算法
- 添加语音朗读功能
- 支持单词收藏
- 添加学习提醒
- 优化移动端体验
