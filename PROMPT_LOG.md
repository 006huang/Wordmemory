# Prompt 日志

本日志记录开发过程中使用的关键 Prompt，附带 AI 返回的原始输出，并标注对应的功能和文件。

---

## Prompt 1: 项目初始化

**Prompt内容：**
```
我要开发一个名为Wordmemory的AI背单词全栈Web应用。

技术栈要求：
- 前端：React 18 + TypeScript + Vite 6 + TailwindCSS 3
- 后端：Python Flask 3 + SQLite
- 状态管理：Zustand
- 路由：React Router DOM
- 图表：Recharts
- 图标：Lucide React

功能要求：
1. 学习页面：显示单词，支持标记已掌握/学习中
2. 词库管理：添加、删除、搜索单词
3. 统计页面：学习进度图表展示

项目结构：
- src/pages/ (HomePage, LibraryPage, StatsPage)
- src/store/ (wordStore)
- src/api/ (wordApi)
- backend/ (app.py)

请帮我初始化项目并创建基础代码。
```

**AI返回输出：**
```
已成功初始化 Wordmemory 项目！

创建的文件：
- package.json (配置了React 18 + TypeScript + Vite 6)
- tsconfig.json
- vite.config.ts
- tailwind.config.js
- postcss.config.js
- src/main.tsx
- src/App.tsx
- src/index.css (TailwindCSS基础样式)
- src/pages/HomePage.tsx
- src/pages/LibraryPage.tsx
- src/pages/StatsPage.tsx
- src/store/wordStore.ts
- src/api/wordApi.ts
- src/types/index.ts
- backend/app.py (Flask API)
- backend/requirements.txt
- backend/.env.example

项目已配置完成，可以直接运行：
npm install
npm run dev
cd backend && python app.py
```

**对应功能/文件：**
- 项目整体架构初始化
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx)
- [src/pages/LibraryPage.tsx](file:///d:/Wordmemory/src/pages/LibraryPage.tsx)
- [src/pages/StatsPage.tsx](file:///d:/Wordmemory/src/pages/StatsPage.tsx)
- [src/store/wordStore.ts](file:///d:/Wordmemory/src/store/wordStore.ts)
- [src/api/wordApi.ts](file:///d:/Wordmemory/src/api/wordApi.ts)
- [backend/app.py](file:///d:/Wordmemory/backend/app.py)

---

## Prompt 2: 实现复习机制

**Prompt内容：**
```
请实现复习机制：
1. 根据艾宾浩斯遗忘曲线计算下次复习时间
2. 首页显示待复习单词数量
3. 添加复习页面，显示需要复习的单词
4. 每次复习后更新复习次数和下次复习时间

修改文件：
- backend/app.py: 添加复习单词API和间隔重复算法
- src/store/wordStore.ts: 添加复习状态管理
- src/pages/HomePage.tsx: 添加复习入口和待复习数量显示
```

**AI返回输出：**
```
已实现复习机制！

修改内容：
1. backend/app.py:
   - 添加 get_next_review_interval 函数（艾宾浩斯间隔算法）
   - 添加 /api/review-words 接口获取待复习单词
   - 修改学习记录API，添加 review_count 和 next_review_at 字段

2. src/store/wordStore.ts:
   - 添加 reviewWords 状态
   - 添加 fetchReviewWords 方法
   - 添加 startLearning 方法支持复习模式

3. src/pages/HomePage.tsx:
   - 首页显示待复习单词数量
   - 添加"开始复习"按钮
   - 复习模式下显示复习进度
```

**对应功能/文件：**
- 复习机制实现
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 间隔重复算法
- [src/store/wordStore.ts](file:///d:/Wordmemory/src/store/wordStore.ts) - 复习状态管理
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx) - 复习UI

---

## Prompt 3: 实现多种学习模式

**Prompt内容：**
```
请实现多种学习模式：
1. 拼写测试：显示释义，用户输入单词拼写
2. 选择题：给出单词，从4个选项中选择正确释义
3. 听音辨词：播放单词发音，选择正确的单词

修改文件：
- src/pages/HomePage.tsx: 添加模式选择和各模式UI
- src/store/wordStore.ts: 添加学习模式状态
```

**AI返回输出：**
```
已实现三种学习模式！

修改内容：
1. src/store/wordStore.ts:
   - 添加 learningMode 状态（normal/spelling/choice/listening）
   - 添加 startLearning(mode) 方法

2. src/pages/HomePage.tsx:
   - 添加模式选择按钮（普通模式/拼写测试/选择题/听音辨词）
   - 拼写测试：显示释义和输入框，判断拼写正确性
   - 选择题：随机生成4个选项，包含正确答案
   - 听音辨词：使用Web Speech API播放发音

使用方法：
点击首页的模式按钮切换学习模式，然后开始学习。
```

**对应功能/文件：**
- 多种学习模式实现
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx) - 学习模式UI
- [src/store/wordStore.ts](file:///d:/Wordmemory/src/store/wordStore.ts) - 模式状态管理

---

## Prompt 4: 实现用户登录系统

**Prompt内容：**
```
请实现用户登录系统：
1. 用户注册：username + password
2. 用户登录：返回JWT token
3. 所有API请求携带token
4. 退出登录功能
5. 登录状态持久化（localStorage）

修改文件：
- backend/app.py: 添加JWT认证和用户表
- src/pages/AuthPage.tsx: 创建登录/注册页面
- src/api/wordApi.ts: 添加token拦截器
- src/components/Layout.tsx: 添加登录状态显示和退出按钮
```

**AI返回输出：**
```
已实现用户登录系统！

修改内容：
1. backend/app.py:
   - 添加 users 表
   - 添加 /api/auth/register 和 /api/auth/login 接口
   - 配置 Flask-JWT-Extended
   - 添加 token_required 装饰器

2. src/pages/AuthPage.tsx (新建):
   - 登录表单和注册表单
   - 切换登录/注册模式
   - 错误提示

3. src/api/wordApi.ts:
   - 添加 axios 拦截器，自动携带 Authorization token
   - 401错误时跳转到登录页

4. src/components/Layout.tsx:
   - 显示当前登录用户名
   - 退出登录按钮
   - 未登录时显示登录按钮
```

**对应功能/文件：**
- 用户认证系统
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - JWT认证
- [src/pages/AuthPage.tsx](file:///d:/Wordmemory/src/pages/AuthPage.tsx) - 登录页面
- [src/api/wordApi.ts](file:///d:/Wordmemory/src/api/wordApi.ts) - token拦截器

---

## Prompt 5: 生成大量真实单词数据

**Prompt内容：**
```
请创建一个脚本生成大量真实单词数据：
- 包含CET-4、CET-6、研究生等词汇
- 每个单词包含：word, phonetic(音标), meaning(释义), category(分类), difficulty(难度)
- 生成至少1000个单词
- 不要测试数据（如testword）

创建文件：
- backend/generate_words.py: 单词生成脚本
- 修改 backend/app.py: 启动时自动导入单词数据
```

**AI返回输出：**
```
已创建单词生成脚本！

创建的文件：
- backend/generate_words.py: 包含2000+真实单词数据
  - CET-4词汇：800+
  - CET-6词汇：700+
  - 研究生词汇：500+
  - 包含音标、释义、分类、难度

修改的文件：
- backend/app.py:
  - 启动时检查单词表是否为空
  - 如果为空，自动调用 generate_words 导入数据

运行方式：
cd backend
python app.py  # 首次运行会自动导入单词
```

**对应功能/文件：**
- 词库数据生成
- [backend/generate_words.py](file:///d:/Wordmemory/backend/generate_words.py) - 单词生成脚本

---

## Prompt 6: 修复数据同步问题

**Prompt内容：**
```
修复以下问题：
1. 点击"已掌握/还需复习"后，顶部统计数字没有实时更新
2. 退出登录后数据没有清空
3. 不同用户共享数据（需要按用户隔离）

修改文件：
- backend/app.py: 学习记录、统计数据、成就API添加user_id过滤
- src/components/Layout.tsx: 退出登录时清空store状态
- src/api/wordApi.ts: 删除缓存确保获取最新数据
```

**AI返回输出：**
```
已修复数据同步问题！

修改内容：
1. backend/app.py:
   - 数据库表添加 user_id 字段
   - 所有API按 user_id 过滤数据
   - 添加 get_current_user_id() 函数

2. src/components/Layout.tsx:
   - 退出登录时调用 resetStore()
   - 清空 localStorage

3. src/api/wordApi.ts:
   - markWord 成功后删除 learningRecords 缓存
   - 确保数据实时更新

现在每个用户有独立的学习数据，退出登录会清空本地状态。
```

**对应功能/文件：**
- 数据同步和用户隔离
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 用户数据隔离
- [src/components/Layout.tsx](file:///d:/Wordmemory/src/components/Layout.tsx) - 退出登录逻辑
- [src/api/wordApi.ts](file:///d:/Wordmemory/src/api/wordApi.ts) - 缓存管理

---

## Prompt 7: 实现学习成就系统

**Prompt内容：**
```
请实现学习成就系统：
1. 连续学习天数统计
2. 累计掌握单词数
3. 累计复习次数
4. 学习天数统计
5. 成就徽章展示（统计页面）

修改文件：
- backend/app.py: 添加成就API
- src/api/wordApi.ts: 添加成就API调用
- src/pages/StatsPage.tsx: 添加成就展示UI
```

**AI返回输出：**
```
已实现学习成就系统！

修改内容：
1. backend/app.py:
   - 添加 /api/achievements 接口
   - 计算连续学习天数（streak）
   - 计算累计掌握单词数、复习次数、学习天数
   - 生成成就徽章列表

2. src/api/wordApi.ts:
   - 添加 getAchievements API调用

3. src/pages/StatsPage.tsx:
   - 添加成就统计卡片（连续学习天数、掌握单词等）
   - 添加成就徽章展示区域
   - 使用图标和颜色区分不同成就

成就徽章包括：
- 初出茅庐：首次学习
- 坚持不懈：连续学习7天
- 词汇达人：掌握100个单词
- 复习能手：完成100次复习
```

**对应功能/文件：**
- 学习成就系统
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 成就计算API
- [src/pages/StatsPage.tsx](file:///d:/Wordmemory/src/pages/StatsPage.tsx) - 成就展示UI

---

## Prompt 8: 添加动画效果

**Prompt内容：**
```
请添加动画效果：
1. 卡片翻转动画：普通模式下显示/隐藏答案时的3D翻转效果
2. 学习完成庆祝动画：学习完10个单词后显示彩带飘落效果
3. 按钮交互动画：悬停缩放、淡入效果

修改文件：
- src/pages/HomePage.tsx: 添加翻转动画和庆祝动画
- src/index.css: 添加动画样式
```

**AI返回输出：**
```
已添加动画效果！

修改内容：
1. src/index.css:
   - 添加 card-flip 动画（3D翻转）
   - 添加 bounce-in 动画（弹入效果）
   - 添加 confetti 动画（彩带飘落）
   - 添加 pulse-green 和 shake-red 动画（答题反馈）

2. src/pages/HomePage.tsx:
   - 普通模式：点击"显示答案"触发翻转动画
   - 学习完成：显示庆祝画面，彩带飘落效果
   - 按钮：悬停缩放效果
   - 选择题/听音辨词：答对绿色脉冲，答错红色抖动

动画效果提升了学习体验！
```

**对应功能/文件：**
- 动画效果
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx) - 动画实现
- [src/index.css](file:///d:/Wordmemory/src/index.css) - 动画样式

---

## Prompt 9: 实现自定义词书功能

**Prompt内容：**
```
请实现自定义词书功能：
1. 创建新词书（名称、描述）
2. 添加/删除单词到词书
3. 查看词书单词列表
4. 词书管理（删除词书）

修改文件：
- backend/app.py: 添加词书API
- src/pages/LibraryPage.tsx: 添加词书管理UI
- src/store/wordStore.ts: 添加词书状态管理
```

**AI返回输出：**
```
已实现自定义词书功能！

修改内容：
1. backend/app.py:
   - 添加 wordbooks 表
   - 添加 wordbook_words 关联表
   - 添加词书CRUD API
   - 添加词书单词添加/删除API

2. src/pages/LibraryPage.tsx:
   - 添加"我的词书"标签页
   - 创建词书表单
   - 词书列表展示
   - 添加单词到词书功能

3. src/store/wordStore.ts:
   - 添加 wordbooks 状态
   - 添加 fetchWordbooks、createWordbook、deleteWordbook 方法

现在用户可以创建自己的词书并添加单词！
```

**对应功能/文件：**
- 自定义词书功能
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 词书API
- [src/pages/LibraryPage.tsx](file:///d:/Wordmemory/src/pages/LibraryPage.tsx) - 词书管理UI

---

## Prompt 10: 优化选择题和听音辨词交互

**Prompt内容：**
```
优化选择题和听音辨词交互体验：
1. 选择题：选对显示绿色边框+✓，选错显示红色边框+✗，显示正确答案
2. 听音辨词：选项中包含正确答案，选对/选错有反馈效果
3. 选择后禁用按钮防止重复点击

修改文件：
- src/pages/HomePage.tsx: 修改选择题和听音辨词的交互逻辑
```

**AI返回输出：**
```
已优化选择题和听音辨词交互体验！

修改内容：
1. 选择题模式：
   - 选对：绿色边框、✓正确!提示、脉冲动画
   - 选错：红色边框、✗错误提示、抖动动画
   - 选错后自动显示正确答案（绿色高亮）
   - 选择后按钮禁用

2. 听音辨词模式：
   - 选项中包含正确答案（从所有单词中随机选取干扰项）
   - 选对：绿色边框、✓正确!提示
   - 选错：红色边框、✗错误提示
   - 选错后显示正确答案
   - 选择后按钮禁用

用户体验得到明显提升！
```

**对应功能/文件：**
- 学习模式交互优化
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx) - 选择题和听音辨词交互

---

## Prompt 11: 实现未登录提示功能

**Prompt内容：**
```
请实现未登录状态下的访问控制：
1. 点击统计卡片（总词数/已掌握/学习中/待复习）时显示"请先登录"弹窗
2. 点击"开始学习"/"开始复习"按钮时显示登录提示
3. 点击"词库"和"统计"导航时显示登录提示
4. 登录提示弹窗提供跳转登录页按钮

修改文件：
- src/pages/HomePage.tsx: 添加登录检查和弹窗
- src/components/Layout.tsx: 添加导航登录检查
```

**AI返回输出：**
```
已实现未登录提示功能！

修改内容：
1. src/pages/HomePage.tsx:
   - 添加 isLoggedIn() 检查函数
   - 添加 showLoginPrompt 状态
   - 修改 handleCategoryClick 添加登录检查
   - 修改开始学习/复习按钮添加登录检查
   - 添加登录提示弹窗组件

2. src/components/Layout.tsx:
   - 添加 isLoggedIn() 检查函数
   - 添加 showLoginPrompt 状态
   - 修改词库/统计导航按钮添加登录检查
   - 添加登录提示弹窗组件

现在未登录用户无法访问受保护的功能，会显示登录提示。
```

**对应功能/文件：**
- 未登录访问控制
- [src/pages/HomePage.tsx](file:///d:/Wordmemory/src/pages/HomePage.tsx) - 学习页面登录检查
- [src/components/Layout.tsx](file:///d:/Wordmemory/src/components/Layout.tsx) - 导航登录检查

---

## Prompt 12: 实现收藏单词功能

**Prompt内容：**
```
请实现收藏单词功能：
1. 后端添加收藏表和API（get_favorites、add_favorite、delete_favorite）
2. 词库页面每个单词添加收藏按钮（爱心图标）
3. 收藏后爱心变红填充，取消收藏时弹出确认对话框
4. 添加收藏页面展示所有收藏单词
5. 更新导航和路由

修改文件：
- backend/app.py: 添加收藏表和API
- src/api/wordApi.ts: 添加收藏API调用
- src/pages/LibraryPage.tsx: 添加收藏按钮
- src/pages/FavoritesPage.tsx: 新建收藏页面
- src/App.tsx: 添加路由
- src/components/Layout.tsx: 添加导航入口
```

**AI返回输出：**
```
已实现收藏单词功能！

修改内容：
1. backend/app.py:
   - 添加 favorites 表（user_id, word_id）
   - 添加 /api/favorites GET/POST/DELETE 接口

2. src/api/wordApi.ts:
   - 添加 getFavorites、addFavorite、deleteFavorite 方法

3. src/pages/LibraryPage.tsx:
   - 添加收藏按钮（爱心图标）
   - 收藏后红色填充，未收藏灰色
   - 添加收藏成功提示和取消收藏确认对话框

4. src/pages/FavoritesPage.tsx (新建):
   - 展示所有收藏单词
   - 支持发音和取消收藏

5. 路由和导航：
   - 添加 /favorites 路由
   - 导航栏添加收藏入口

现在用户可以收藏重要单词，方便集中复习！
```

**对应功能/文件：**
- 收藏单词功能
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 收藏API
- [src/pages/LibraryPage.tsx](file:///d:/Wordmemory/src/pages/LibraryPage.tsx) - 收藏按钮
- [src/pages/FavoritesPage.tsx](file:///d:/Wordmemory/src/pages/FavoritesPage.tsx) - 收藏页面

---

## Prompt 13: 实现个人主页功能

**Prompt内容：**
```
请实现个人主页功能：
1. 学习统计（总体进度条、连续学习天数、累计学习天数、最近学习记录）
2. 成就系统（成就徽章展示、进度条）
3. 账户设置（修改密码、清除学习数据、关于信息）
4. 点击用户名进入个人主页

修改文件：
- backend/app.py: 添加修改密码和清除数据API
- src/pages/ProfilePage.tsx: 新建个人主页
- src/api/wordApi.ts: 添加修改密码API
- src/components/Layout.tsx: 添加个人主页入口
```

**AI返回输出：**
```
已实现个人主页功能！

修改内容：
1. backend/app.py:
   - 添加 /api/change-password 修改密码接口
   - 添加 /api/clear-data 清除学习数据接口

2. src/pages/ProfilePage.tsx (新建):
   - 学习统计卡片和进度条
   - 成就徽章展示（初学者、词汇收藏家、词汇大师等）
   - 修改密码表单（当前密码验证）
   - 清除学习数据按钮（确认对话框）
   - 关于信息

3. src/api/wordApi.ts:
   - 添加 changePassword 方法

4. src/components/Layout.tsx:
   - 点击用户名跳转个人主页
   - 移动端菜单添加个人主页入口

现在用户可以查看学习统计和成就，管理账户！
```

**对应功能/文件：**
- 个人主页功能
- [backend/app.py](file:///d:/Wordmemory/backend/app.py) - 账户API
- [src/pages/ProfilePage.tsx](file:///d:/Wordmemory/src/pages/ProfilePage.tsx) - 个人主页

---

## Prompt 14: 优化清除数据体验

**Prompt内容：**
```
优化清除学习数据功能：
1. 清除数据后立即同步更新UI，不需要手动刷新
2. 使用状态管理直接更新，而不是页面刷新

修改文件：
- src/store/wordStore.ts: 添加 clearLearningData 方法
- src/pages/ProfilePage.tsx: 更新清除数据逻辑
```

**AI返回输出：**
```
已优化清除数据体验！

修改内容：
1. src/store/wordStore.ts:
   - 添加 clearLearningData 方法，清除学习记录、统计数据、复习单词

2. src/pages/ProfilePage.tsx:
   - 使用新的 clearLearningData 方法
   - 清除后直接更新状态，不再需要手动刷新
   - 移除 alert 和 window.location.reload()

现在清除学习数据后页面会立即更新为空白状态！
```

**对应功能/文件：**
- 清除数据体验优化
- [src/store/wordStore.ts](file:///d:/Wordmemory/src/store/wordStore.ts) - 状态管理
- [src/pages/ProfilePage.tsx](file:///d:/Wordmemory/src/pages/ProfilePage.tsx) - 清除数据逻辑

---

## 总结

| 序号 | Prompt主题 | 对应功能 | 涉及文件 |
|------|-----------|---------|---------|
| 1 | 项目初始化 | 项目架构搭建 | 所有文件 |
| 2 | 复习机制 | 艾宾浩斯遗忘曲线 | app.py, wordStore.ts, HomePage.tsx |
| 3 | 学习模式 | 拼写/选择/听音 | HomePage.tsx, wordStore.ts |
| 4 | 用户登录 | JWT认证系统 | app.py, AuthPage.tsx, wordApi.ts |
| 5 | 单词生成 | 大量真实词汇 | generate_words.py |
| 6 | 数据同步 | 用户数据隔离 | app.py, Layout.tsx, wordApi.ts |
| 7 | 成就系统 | 学习成就徽章 | app.py, StatsPage.tsx |
| 8 | 动画效果 | 卡片翻转/庆祝 | HomePage.tsx, index.css |
| 9 | 词书功能 | 自定义词书 | app.py, LibraryPage.tsx |
| 10 | 交互优化 | 选择题/听音反馈 | HomePage.tsx |
| 11 | 未登录提示 | 访问控制 | HomePage.tsx, Layout.tsx |
| 12 | 收藏单词 | 单词收藏功能 | app.py, LibraryPage.tsx, FavoritesPage.tsx |
| 13 | 个人主页 | 用户中心 | app.py, ProfilePage.tsx |
| 14 | 清除数据优化 | UI即时更新 | wordStore.ts, ProfilePage.tsx |