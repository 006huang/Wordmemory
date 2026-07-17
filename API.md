# Wordmemory API 接口文档

## 基础信息

- **基础URL**: `http://localhost:5000/api`
- **认证方式**: JWT Token（登录后获取）
- **数据格式**: JSON

## 目录

1. [用户认证](#1-用户认证)
2. [单词管理](#2-单词管理)
3. [学习记录](#3-学习记录)
4. [统计数据](#4-统计数据)
5. [词书管理](#5-词书管理)
6. [收藏管理](#6-收藏管理)
7. [成就系统](#7-成就系统)
8. [账户管理](#8-账户管理)

---

## 1. 用户认证

### 1.1 注册

- **方法**: POST
- **路径**: `/register`
- **请求体**:
```json
{
    "username": "string (必填)",
    "password": "string (必填，至少6位)"
}
```
- **响应**:
```json
{
    "message": "注册成功",
    "user": {
        "id": "string",
        "username": "string"
    }
}
```

### 1.2 登录

- **方法**: POST
- **路径**: `/login`
- **请求体**:
```json
{
    "username": "string (必填)",
    "password": "string (必填)"
}
```
- **响应**:
```json
{
    "token": "string (JWT令牌)",
    "user": {
        "id": "string",
        "username": "string"
    }
}
```

---

## 2. 单词管理

### 2.1 获取单词列表

- **方法**: GET
- **路径**: `/words`
- **响应**:
```json
[
    {
        "id": "string",
        "word": "string (单词)",
        "phonetic": "string (音标)",
        "meaning": "string (释义)",
        "example": "string (例句)",
        "category": "string (分类: CET-4/CET-6)",
        "difficulty": "string (难度: easy/medium/hard)",
        "created_at": "string (创建时间)"
    }
]
```

### 2.2 获取单个单词

- **方法**: GET
- **路径**: `/words/{id}`
- **响应**:
```json
{
    "id": "string",
    "word": "string",
    "phonetic": "string",
    "meaning": "string",
    "example": "string",
    "category": "string",
    "difficulty": "string",
    "created_at": "string"
}
```

### 2.3 添加单词

- **方法**: POST
- **路径**: `/words`
- **请求体**:
```json
{
    "word": "string (必填)",
    "phonetic": "string",
    "meaning": "string (必填)",
    "example": "string",
    "category": "string (默认: CET-4)",
    "difficulty": "string (默认: medium)"
}
```
- **响应**:
```json
{
    "id": "string",
    "word": "string",
    "message": "Word added successfully"
}
```

### 2.4 删除单词

- **方法**: DELETE
- **路径**: `/words/{id}`
- **响应**:
```json
{
    "message": "Word deleted successfully"
}
```

---

## 3. 学习记录

### 3.1 获取学习记录

- **方法**: GET
- **路径**: `/learning-records`
- **响应**:
```json
[
    {
        "id": "string",
        "word_id": "string",
        "word": "string",
        "status": "string (new/learning/mastered)",
        "review_count": "number",
        "last_review_at": "string",
        "next_review_at": "string",
        "created_at": "string"
    }
]
```

### 3.2 更新学习状态

- **方法**: POST
- **路径**: `/learning-records/{word_id}`
- **请求体**:
```json
{
    "status": "string (learning/mastered)"
}
```
- **响应**:
```json
{
    "message": "学习记录更新成功"
}
```

---

## 4. 统计数据

### 4.1 获取每日统计

- **方法**: GET
- **路径**: `/stats/daily`
- **响应**:
```json
[
    {
        "date": "string (YYYY-MM-DD)",
        "words_learned": "number",
        "words_reviewed": "number",
        "accuracy": "number"
    }
]
```

### 4.2 获取每周统计

- **方法**: GET
- **路径**: `/stats/weekly`
- **响应**:
```json
[
    {
        "date": "string (周起始日期)",
        "words_learned": "number",
        "words_reviewed": "number",
        "accuracy": "number"
    }
]
```

---

## 5. 词书管理

### 5.1 获取词书列表

- **方法**: GET
- **路径**: `/wordbooks`
- **响应**:
```json
[
    {
        "id": "string",
        "name": "string",
        "description": "string",
        "user_id": "string",
        "created_at": "string"
    }
]
```

### 5.2 创建词书

- **方法**: POST
- **路径**: `/wordbooks`
- **请求体**:
```json
{
    "name": "string (必填)",
    "description": "string"
}
```
- **响应**:
```json
{
    "id": "string",
    "name": "string",
    "message": "Wordbook created successfully"
}
```

### 5.3 添加单词到词书

- **方法**: POST
- **路径**: `/wordbooks/{id}/words/{word_id}`
- **响应**:
```json
{
    "message": "Word added"
}
```

### 5.4 删除词书

- **方法**: DELETE
- **路径**: `/wordbooks/{id}`
- **响应**:
```json
{
    "message": "Wordbook deleted"
}
```

---

## 6. 收藏管理

### 6.1 获取收藏列表

- **方法**: GET
- **路径**: `/favorites`
- **响应**:
```json
[
    {
        "id": "string",
        "word_id": "string",
        "word": "string",
        "phonetic": "string",
        "meaning": "string",
        "created_at": "string"
    }
]
```

### 6.2 添加收藏

- **方法**: POST
- **路径**: `/favorites`
- **请求体**:
```json
{
    "word_id": "string (必填)"
}
```
- **响应**:
```json
{
    "message": "收藏成功"
}
```

### 6.3 取消收藏

- **方法**: DELETE
- **路径**: `/favorites/{word_id}`
- **响应**:
```json
{
    "message": "取消收藏成功"
}
```

---

## 7. 成就系统

### 7.1 获取成就

- **方法**: GET
- **路径**: `/achievements`
- **响应**:
```json
{
    "streak": "number (连续学习天数)",
    "totalMastered": "number (掌握单词数)",
    "totalReviews": "number (复习次数)",
    "learningDays": "number (累计学习天数)",
    "achievements": [
        {
            "id": "string",
            "name": "string",
            "description": "string",
            "icon": "string",
            "progress": "number"
        }
    ]
}
```

---

## 8. 账户管理

### 8.1 修改密码

- **方法**: POST
- **路径**: `/change-password`
- **请求体**:
```json
{
    "current_password": "string (必填)",
    "new_password": "string (必填，至少6位)"
}
```
- **响应**:
```json
{
    "message": "密码修改成功"
}
```

### 8.2 清除学习数据

- **方法**: POST
- **路径**: `/clear-data`
- **响应**:
```json
{
    "message": "学习数据清除成功"
}
```

---

## 认证说明

需要认证的接口，请求头中需携带：
```
Authorization: Bearer <token>
```

token通过登录接口获取，有效期为24小时（可通过环境变量配置）。

---

## 错误响应格式

```json
{
    "error": "string (错误信息)"
}
```

| 状态码 | 说明 |
|--------|------|
| 400 | 请求参数错误 |
| 401 | 未授权/认证失败 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |