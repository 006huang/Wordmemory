# Wordmemory 项目 Code Review 报告

**审查日期**：2026-07-18  
**项目**：Wordmemory - AI 背单词应用  
**技术栈**：React 18 + TypeScript + Vite / Flask 3 + SQLite / Supabase（可选）  
**审查范围**：前后端核心代码、API 层、状态管理、页面组件、测试与部署配置  

---

## 执行摘要

Wordmemory 是一个功能完整的背单词应用，具备学习模式、词库管理、统计、用户认证、收藏和词书等功能。项目结构清晰，前后端分离合理，基础安全措施（bcrypt 密码哈希、参数化 SQL）已到位。

本次审查发现 **4 项严重安全问题**、**7 项中等逻辑/功能问题** 及若干性能与工程化改进点。最需优先处理的是：**后端鉴权缺失/不一致**、**ProfilePage 生产环境 API 硬编码**、**统计数据从未写入导致展示假数据**。

| 类别 | 严重 | 中等 | 轻微 |
|------|:----:|:----:|:----:|
| 安全 | 4 | 4 | 2 |
| 逻辑 | 2 | 5 | 3 |
| 性能 | 0 | 4 | 2 |

**总体评级**：⚠️ 可用于本地开发/demo，**不建议直接上生产**，需完成 P0 安全修复后再部署。

---

## 1. 项目架构概览

```
Wordmemory/
├── src/                    # 前端 React 应用
│   ├── api/wordApi.ts      # HTTP 客户端与缓存
│   ├── store/wordStore.ts  # Zustand 全局状态
│   ├── pages/              # 页面组件
│   └── components/         # 通用组件
├── backend/
│   ├── app.py              # Flask 主应用（1065 行）
│   ├── word_data.json      # 初始词库（100 词）
│   └── tests/test_app.py   # 后端测试
└── docs/                   # 文档
```

### 技术栈对照

| 组件 | 文档描述 | 实际实现 | 状态 |
|------|----------|----------|------|
| JWT 认证 | Flask-JWT-Extended | PyJWT 手写 | ⚠️ 不一致 |
| 后端端口 | 5000 | 默认 5174（.env.example） | ⚠️ 不一致 |
| 生产服务器 | gunicorn（render.yaml） | 未列入 requirements.txt | ❌ 缺失 |
| 单词分页 | README 有 page/limit/search | 未实现 | ❌ 缺失 |

---

## 2. 安全漏洞

### 2.1 【严重】单词 CRUD 完全无鉴权

**位置**：`backend/app.py` — `GET/POST/PUT/DELETE /api/words`

**问题**：所有单词增删改查接口均未校验 JWT。任何匿名用户均可修改全局词库。

**影响**：词库数据可被恶意篡改或清空。

**建议**：
- 公共词库 GET 可保持开放（只读）
- POST/PUT/DELETE 必须 `@require_auth`
- 区分系统词库与用户自定义词库

---

### 2.2 【严重】词书 IDOR（越权访问）

**位置**：`backend/app.py` — 词书相关接口

| 接口 | 所有权校验 |
|------|:----------:|
| `GET /api/wordbooks` | ✅ 有 user_id 过滤 |
| `POST /api/wordbooks` | ⚠️ 允许 user_id=None |
| `DELETE /api/wordbooks/:id` | ✅ 有 user_id 校验 |
| `GET /api/wordbooks/:id/words` | ❌ 无 |
| `POST /api/wordbooks/:id/words` | ❌ 无 |
| `DELETE /api/wordbooks/:id/words/:wordId` | ❌ 无 |

**影响**：攻击者若知道词书 UUID，可读写任意用户的词书内容。

**建议**：所有词书操作前先验证 `wordbooks WHERE id=? AND user_id=?`，失败返回 403。

---

### 2.3 【严重】JWT 默认密钥硬编码

**位置**：`backend/app.py:31`

```python
SECRET_KEY = os.getenv('SECRET_KEY', 'wordmemory_secret_key')
```

**影响**：生产环境未配置环境变量时，攻击者可伪造任意用户 token。

**建议**：生产环境缺少 `SECRET_KEY` 时拒绝启动；密钥至少 32 字节随机值。

---

### 2.4 【严重】ProfilePage API 地址硬编码

**位置**：`src/pages/ProfilePage.tsx:71, 110`

```typescript
fetch('http://localhost:5000/api/change-password', ...)
fetch('http://localhost:5000/api/clear-data', ...)
```

**影响**：部署到 Vercel/Render 后，修改密码和清除数据功能**必定失败**（绕过了 `VITE_API_URL`）。

**建议**：在 `wordApi.ts` 中封装 `changePassword`、`clearData`，统一使用 axios client。

---

### 2.5 【中等】用户数据接口鉴权不一致

**位置**：`backend/app.py` — `get_current_user_id()`

**问题**：
- 无 token 时返回 `None`，多数接口仍继续执行（返回空数据或报错）
- `/api/favorites` GET 未登录返回 `[]`（200），与其他接口行为不一致
- `/api/learning-records` POST 未登录可能触发数据库 NOT NULL 约束错误

**建议**：统一 `@require_auth` 装饰器，无有效 token 一律返回 401。

---

### 2.6 【中等】Token 存储在 localStorage

**位置**：`src/api/wordApi.ts:14`

**问题**：JWT 存于 localStorage，若存在 XSS 漏洞可被窃取。

**建议**：
- 短期：加强 CSP、输入消毒，缩短 JWT 有效期
- 长期：改用 HttpOnly + Secure Cookie + Refresh Token

---

### 2.7 【中等】其他安全问题

| 问题 | 位置 | 风险 |
|------|------|------|
| CORS 全开放 | `CORS(app)` 无 origin 限制 | 跨域滥用 |
| 无速率限制 | `/api/login`, `/api/register` | 暴力破解 |
| 注册密码策略弱 | 仅改密要求 ≥6 位 | 弱密码 |
| 错误信息泄露 | `str(e)` 直接返回客户端 | 信息泄露 |
| DEBUG 模式 | `app.run(debug=DEBUG)` | 远程代码执行 |

---

## 3. 逻辑错误

### 3.1 【严重】每日/每周统计从未写入

**位置**：`backend/app.py`

**问题**：
- 存在 `daily_stats`、`weekly_stats` 表和 GET 接口
- **没有任何 INSERT/UPDATE 逻辑**
- `create_learning_record` 不更新统计

**前端表现**：`StatsPage.tsx` 在 `dailyStats` 为空时展示硬编码 mock 数据：

```typescript
// StatsPage.tsx:62-69 — 假数据
{ day: '周一', learned: 12, reviewed: 20 },
{ day: '周二', learned: 8, reviewed: 15 },
...
```

**影响**：用户看到的「本周学习情况」图表是**假数据**，误导用户。

**建议**：在 `create_learning_record` 中 upsert 当日统计；或前端明确显示「暂无数据」。

---

### 3.2 【中等】API 字段命名不一致

**问题**：
- 后端返回 `snake_case`（`words_learned`, `last_review_at`）
- 前端类型期望 `camelCase`（`wordsLearned`, `lastReviewAt`）
- 学习记录接口已做映射，统计接口未做

**影响**：统计图表中 `stat.wordsLearned` 为 `undefined`。

**建议**：后端统一 camelCase 序列化，或前端增加字段映射层。

---

### 3.3 【中等】间隔重复算法缺陷

**位置**：`backend/app.py:354-361` — `get_next_review_interval()`

**问题**：
1. 前端只传 `'learning' | 'mastered'`，`'new'` 状态间隔永远不会被使用
2. 首次学习 `review_count=1`，`index=1`，跳过了第一个间隔（1 天）
3. 答错时仍递增 `review_count`，未重置间隔

**建议**：
- 首次 `review_count=0`
- 根据答对/答错分别处理间隔
- 考虑 SM-2 或 Anki 式算法

---

### 3.4 【中等】HomePage 会话单词选择依赖不完整

**位置**：`src/pages/HomePage.tsx:71-97`

```typescript
useEffect(() => {
  if (isLearning) { /* 选择 sessionWords */ }
}, [isLearning, mode, studyMode]); // 缺少 words, learningRecords, reviewWords
```

**影响**：异步数据加载完成前开始学習，可能基于空数组生成会话，导致学习流程异常。

**建议**：加入完整依赖，或在数据 fetch 完成后再允许开始学習。

---

### 3.5 【中等】清除数据不完整

**位置**：`backend/app.py:695-724` — `/api/clear-data`

**问题**：只删除 `learning_records`、`daily_stats`、`weekly_stats`，**不删除 favorites**。

**影响**：与 UI「清除所有学习数据」语义不符，收藏数据残留。

---

### 3.6 【中等】Supabase `.single()` 异常处理

**位置**：`backend/app.py:374`

**问题**：查询不存在的学习记录时使用 `.single()` 会抛异常，被外层 `except` 捕获后返回 500，而非正常创建新记录。

---

### 3.7 【轻微】setTimeout 未清理

**位置**：`src/pages/HomePage.tsx:189-224`

**问题**：拼写/选择题模式的 `setTimeout` 在组件卸载后仍可能触发 `markWord`。

**建议**：用 `useRef` 保存 timer，在 `useEffect` cleanup 中 `clearTimeout`。

---

## 4. 性能问题

### 4.1 【中等】全量加载单词，无分页

**位置**：`backend/app.py:173` — `SELECT * FROM words`

**现状**：100 词影响不大，但 README 已描述 `page/limit/search/category` 参数却未实现。

**建议**：实现 `LIMIT/OFFSET` + 数据库索引；前端大列表使用虚拟滚动。

---

### 4.2 【中等】前端缓存策略不完整

**位置**：`src/api/wordApi.ts:21-34`

| 问题 | 说明 |
|------|------|
| 缓存范围有限 | 仅 `words` 和 `learningRecords` |
| 写操作未失效 | `addWord`/`deleteWord` 不清理 `words` 缓存 |
| 多标签页不同步 | Map 缓存不跨 tab |
| 登出未清缓存 | token 清除后缓存仍有效 |

**建议**：mutation 后主动 `cache.delete`；登出时清空；或改用 React Query/SWR。

---

### 4.3 【中等】数据库连接无池化

**问题**：每次请求 `sqlite3.connect()` 新建连接。

**建议**：Flask 应用上下文管理连接；生产环境使用 PostgreSQL/Supabase + 连接池。

---

### 4.4 【中等】缺少数据库索引

**问题**：`init_sqlite()` 未创建索引，但 `docs/database.sql` 有部分索引定义。

**建议**：为高频查询字段添加索引：
- `learning_records(user_id, next_review_at)`
- `favorites(user_id)`
- `daily_stats(user_id, date)`

---

### 4.5 【轻微】HomePage 重复计算

**问题**：`masteredWordIds`、`learningWordIds` 每次 render 重建 Set；Confetti 每次 mount 生成 50 个随机 DOM 节点。

**建议**：`useMemo` 缓存；Confetti 改用 CSS 动画。

---

## 5. 测试与 CI/CD

### 5.1 测试覆盖现状

| 模块 | 测试文件 | 覆盖内容 | 缺失 |
|------|----------|----------|------|
| 后端 | `test_app.py` | 单词 CRUD、认证、基础 GET | 鉴权、权限、统计写入 |
| 前端 Store | `wordStore.test.ts` | 状态初始化、导航 | API 集成 |
| 前端 App | `App.test.tsx` | 渲染、导航 | 页面交互 |

### 5.2 CI/CD 现状

**文件**：`.github/workflows/ci-cd.yml`

- ✅ 前端：TypeScript 编译 + Vitest
- ✅ 后端：pytest
- ❌ 未运行 ESLint（`package.json` 有 lint script）
- ❌ 未做安全扫描

---

## 6. 优点总结

1. **结构清晰**：前后端职责分离，目录组织合理
2. **状态管理简洁**：Zustand 使用得当，无过度抽象
3. **密码安全**：bcrypt 哈希，参数化 SQL 防注入
4. **功能丰富**：4 种学习模式、词书、收藏、成就系统
5. **响应式设计**：TailwindCSS 适配桌面和移动端
6. **CI 基础**：前后端均有自动化测试流水线

---

## 7. 修复优先级路线图

```
P0 — 安全与部署阻断（必须立即修复）
├── 单词写操作加鉴权
├── 词书 IDOR 修复
├── ProfilePage 硬编码 URL 修复
└── 强制 SECRET_KEY 环境变量

P1 — 功能正确性（上线前修复）
├── 统计写入逻辑实现
├── 间隔重复算法修正
├── API 字段命名统一
├── 未登录行为统一返回 401
└── clear-data 包含 favorites

P2 — 体验与性能（迭代优化）
├── 分页与搜索实现
├── 缓存失效策略完善
├── ProtectedRoute 路由守卫
├── 数据库索引添加
└── gunicorn 加入 requirements.txt
```

---

## 8. 关键修复代码示例

### 8.1 统一鉴权装饰器

```python
from functools import wraps

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        user_id = get_current_user_id()
        if not user_id:
            return jsonify({"error": "未授权"}), 401
        return f(user_id, *args, **kwargs)
    return decorated

@app.route('/api/learning-records', methods=['GET'])
@require_auth
def get_learning_records(user_id):
    # user_id 已由装饰器注入
    ...
```

### 8.2 统计写入

```python
def upsert_daily_stat(cursor, user_id, learned=0, reviewed=0):
    today = datetime.utcnow().strftime('%Y-%m-%d')
    cursor.execute('''
        INSERT INTO daily_stats (id, user_id, date, words_learned, words_reviewed)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(user_id, date) DO UPDATE SET
            words_learned = words_learned + excluded.words_learned,
            words_reviewed = words_reviewed + excluded.words_reviewed
    ''', (str(uuid.uuid4()), user_id, today, learned, reviewed))
```

### 8.3 ProfilePage API 统一

```typescript
// wordApi.ts 新增
changePassword: async (oldPassword: string, newPassword: string) => {
  const response = await client.post('/change-password', { oldPassword, newPassword });
  return response.data;
},

clearData: async () => {
  const response = await client.post('/clear-data');
  return response.data;
},
```

---

## 9. 结论

Wordmemory 作为学习/demo 项目质量良好，功能完整，代码可读性高。但在安全鉴权、统计数据链路和生产部署配置方面存在阻断性问题。

**建议行动**：
1. 优先完成 P0 四项安全修复（预计 1-2 天）
2. 修复统计写入和 API 字段映射（预计 1 天）
3. 完善测试覆盖鉴权和权限场景
4. 完成 P0/P1 后再部署到生产环境

---

*本报告由 AI Code Review 自动生成，审查基于 2026-07-18 代码快照。*
