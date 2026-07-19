# Wordmemory API 接口文档

## 基础信息

- **基础URL**: `http://localhost:5174/api`
- **Content-Type**: `application/json`
- **认证方式**: JWT Token，放在 `Authorization: Bearer <token>` 请求头中

---

## 用户认证接口

### 1. 用户注册

**请求**:
```
POST /api/register
```

**请求体**:
```json
{
  "username": "string",        // 必填，用户名
  "password": "string"         // 必填，密码
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "username": "testuser"
  }
}
```

---

### 2. 用户登录

**请求**:
```
POST /api/login
```

**请求体**:
```json
{
  "username": "string",        // 必填，用户名
  "password": "string"         // 必填，密码
}
```

**响应**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-string",
    "username": "testuser"
  }
}
```

---

## 单词管理接口

### 1. 获取所有单词

**请求**:
```
GET /api/words
```

**响应**:
```json
[
  {
    "id": "1",
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "meaning": "v. 放弃，抛弃；n. 放任，纵情",
    "example": "He decided to abandon his plan.",
    "category": "CET-4",
    "difficulty": "medium",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### 2. 获取单个单词

**请求**:
```
GET /api/words/:id
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 单词ID |

**响应**:
```json
{
  "id": "1",
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "meaning": "v. 放弃，抛弃；n. 放任，纵情",
  "example": "He decided to abandon his plan.",
  "category": "CET-4",
  "difficulty": "medium",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 3. 添加新单词

**请求**:
```
POST /api/words
```

**请求体**:
```json
{
  "word": "string",        // 必填，单词
  "phonetic": "string",    // 可选，音标
  "meaning": "string",     // 必填，释义
  "example": "string",     // 可选，例句
  "category": "string",    // 可选，分类，默认 CET-4
  "difficulty": "string"   // 可选，难度，easy/medium/hard，默认 medium
}
```

**响应**:
```json
{
  "id": "uuid-string",
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "meaning": "v. 放弃，抛弃",
  "example": "He decided to abandon his plan.",
  "category": "CET-4",
  "difficulty": "medium",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

### 4. 更新单词

**请求**:
```
PUT /api/words/:id
```

**请求体**:
```json
{
  "word": "string",        // 可选
  "phonetic": "string",    // 可选
  "meaning": "string",     // 可选
  "example": "string",     // 可选
  "category": "string",    // 可选
  "difficulty": "string"   // 可选
}
```

**响应**: 返回更新后的单词对象

---

### 5. 删除单词

**请求**:
```
DELETE /api/words/:id
```

**响应**:
```json
{
  "message": "Word deleted successfully"
}
```

---

## 学习记录接口

### 1. 获取学习记录

**请求**:
```
GET /api/learning-records
```

**响应**:
```json
[
  {
    "id": "1",
    "word_id": "1",
    "word": "abandon",
    "status": "mastered",
    "review_count": 3,
    "last_review_at": "2024-01-15T00:00:00Z",
    "next_review_at": "2024-01-18T00:00:00Z",
    "created_at": "2024-01-10T00:00:00Z"
  }
]
```

---

### 2. 创建学习记录

**请求**:
```
POST /api/learning-records
```

**请求体**:
```json
{
  "wordId": "string",        // 必填，单词ID
  "status": "string"         // 必填，状态，learning/mastered
}
```

**响应**:
```json
{
  "id": "uuid-string",
  "word_id": "1",
  "word": "abandon",
  "status": "mastered",
  "review_count": 1,
  "last_review_at": "2024-01-15T00:00:00Z",
  "next_review_at": "2024-01-16T00:00:00Z",
  "created_at": "2024-01-15T00:00:00Z"
}
```

---

## 统计数据接口

### 1. 获取每日统计

**请求**:
```
GET /api/stats/daily
```

**响应**:
```json
[
  {
    "date": "2024-01-15",
    "words_learned": 10,
    "words_reviewed": 15,
    "accuracy": 85
  }
]
```

---

### 2. 获取每周统计

**请求**:
```
GET /api/stats/weekly
```

**响应**:
```json
[
  {
    "date": "2024-W02",
    "words_learned": 56,
    "words_reviewed": 81,
    "accuracy": 88
  }
]
```

---

## 复习单词接口

### 1. 获取待复习单词

**请求**:
```
GET /api/review-words
```

**响应**:
```json
[
  {
    "id": "1",
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "meaning": "v. 放弃，抛弃；n. 放任，纵情",
    "example": "He decided to abandon his plan.",
    "category": "CET-4",
    "difficulty": "medium"
  }
]
```

---

## 收藏管理接口

### 1. 获取收藏列表

**请求**:
```
GET /api/favorites
```

**响应**:
```json
[
  {
    "id": "1",
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "meaning": "v. 放弃，抛弃",
    "example": "He decided to abandon his plan.",
    "category": "CET-4",
    "difficulty": "medium",
    "created_at": "2024-01-15T00:00:00Z"
  }
]
```

---

### 2. 添加收藏

**请求**:
```
POST /api/favorites
```

**请求体**:
```json
{
  "word_id": "string"         // 必填，单词ID
}
```

**响应**:
```json
{
  "id": "uuid-string",
  "word": "abandon",
  "phonetic": "/əˈbændən/",
  "meaning": "v. 放弃，抛弃",
  "created_at": "2024-01-15T00:00:00Z"
}
```

---

### 3. 取消收藏

**请求**:
```
DELETE /api/favorites/:word_id
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| word_id | string | 单词ID |

**响应**:
```json
{
  "message": "Favorite removed successfully"
}
```

---

## 词书管理接口

### 1. 获取词书列表

**请求**:
```
GET /api/wordbooks
```

**响应**:
```json
[
  {
    "id": "uuid-string",
    "name": "我的词书",
    "description": "自定义词书",
    "created_at": "2024-01-15T00:00:00Z"
  }
]
```

---

### 2. 创建词书

**请求**:
```
POST /api/wordbooks
```

**请求体**:
```json
{
  "name": "string",           // 必填，词书名称
  "description": "string"     // 可选，词书描述
}
```

**响应**:
```json
{
  "id": "uuid-string",
  "name": "我的词书",
  "description": "自定义词书"
}
```

---

### 3. 获取词书单词

**请求**:
```
GET /api/wordbooks/:id/words
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 词书ID |

**响应**:
```json
[
  {
    "id": "1",
    "word": "abandon",
    "phonetic": "/əˈbændən/",
    "meaning": "v. 放弃，抛弃"
  }
]
```

---

### 4. 添加单词到词书

**请求**:
```
POST /api/wordbooks/:id/words
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 词书ID |

**请求体**:
```json
{
  "wordId": "string"          // 必填，单词ID
}
```

**响应**:
```json
{
  "message": "Word added to wordbook successfully"
}
```

---

### 5. 从词书移除单词

**请求**:
```
DELETE /api/wordbooks/:id/words/:wordId
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 词书ID |
| wordId | string | 单词ID |

**响应**:
```json
{
  "message": "Word removed from wordbook successfully"
}
```

---

### 6. 删除词书

**请求**:
```
DELETE /api/wordbooks/:id
```

**路径参数**:
| 参数 | 类型 | 描述 |
|------|------|------|
| id | string | 词书ID |

**响应**:
```json
{
  "message": "Wordbook deleted successfully"
}
```

---

## 成就系统接口

### 1. 获取学习成就

**请求**:
```
GET /api/achievements
```

**响应**:
```json
{
  "streak": 7,
  "totalMastered": 150,
  "totalReviews": 500,
  "learningDays": 30,
  "achievements": [
    {
      "id": "first_steps",
      "name": "初学者",
      "description": "掌握10个单词",
      "icon": "🌱",
      "progress": 100
    },
    {
      "id": "word_collector",
      "name": "词汇收藏家",
      "description": "掌握50个单词",
      "icon": "📚",
      "progress": 100
    }
  ]
}
```

---

## 账户管理接口

### 1. 修改密码

**请求**:
```
POST /api/change-password
```

**请求体**:
```json
{
  "oldPassword": "string",    // 必填，当前密码
  "newPassword": "string"     // 必填，新密码（至少6位）
}
```

**响应**:
```json
{
  "message": "Password changed successfully"
}
```

---

### 2. 清除学习数据

**请求**:
```
POST /api/clear-data
```

**响应**:
```json
{
  "message": "Learning data cleared successfully"
}
```

---

## 错误响应格式

```json
{
  "error": "Error message"
}
```

**HTTP状态码**:
- 400: 请求参数错误
- 404: 资源未找到
- 500: 服务器内部错误
