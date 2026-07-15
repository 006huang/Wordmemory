# Wordmemory API 接口文档

## 基础信息

- **基础URL**: `http://localhost:5000/api`
- **Content-Type**: `application/json`

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
