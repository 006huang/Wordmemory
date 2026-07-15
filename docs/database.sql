-- Wordmemory 数据库表结构

-- 单词表
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

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_words_category ON words(category);
CREATE INDEX IF NOT EXISTS idx_words_difficulty ON words(difficulty);
CREATE INDEX IF NOT EXISTS idx_learning_records_word_id ON learning_records(word_id);
CREATE INDEX IF NOT EXISTS idx_learning_records_status ON learning_records(status);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);
