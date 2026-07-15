from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import sqlite3

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wordmemory.db')

def init_sqlite():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS words (
            id TEXT PRIMARY KEY,
            word TEXT NOT NULL,
            phonetic TEXT,
            meaning TEXT NOT NULL,
            example TEXT,
            category TEXT DEFAULT 'CET-4',
            difficulty TEXT DEFAULT 'medium',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS learning_records (
            id TEXT PRIMARY KEY,
            word_id TEXT,
            word TEXT NOT NULL,
            status TEXT DEFAULT 'new',
            review_count INTEGER DEFAULT 0,
            last_review_at TEXT,
            next_review_at TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (word_id) REFERENCES words(id)
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS daily_stats (
            id TEXT PRIMARY KEY,
            date TEXT UNIQUE NOT NULL,
            words_learned INTEGER DEFAULT 0,
            words_reviewed INTEGER DEFAULT 0,
            accuracy INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS weekly_stats (
            id TEXT PRIMARY KEY,
            date TEXT UNIQUE NOT NULL,
            words_learned INTEGER DEFAULT 0,
            words_reviewed INTEGER DEFAULT 0,
            accuracy INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM words')
    if cursor.fetchone()[0] == 0:
        mock_words = [
            ("1", "abandon", "/əˈbændən/", "v. 放弃，抛弃；n. 放任，纵情", "He decided to abandon his plan.", "CET-4", "medium", "2024-01-01T00:00:00Z"),
            ("2", "ability", "/əˈbɪləti/", "n. 能力，本领；才能", "She has the ability to learn quickly.", "CET-4", "easy", "2024-01-01T00:00:00Z"),
            ("3", "abnormal", "/æbˈnɔːrml/", "adj. 不正常的，反常的", "The test results were abnormal.", "CET-6", "medium", "2024-01-01T00:00:00Z"),
            ("4", "abolish", "/əˈbɑːlɪʃ/", "v. 废除，废止", "They plan to abolish the tax.", "CET-6", "hard", "2024-01-01T00:00:00Z"),
            ("5", "abroad", "/əˈbrɔːd/", "adv. 在国外，到国外", "He studied abroad for two years.", "CET-4", "easy", "2024-01-01T00:00:00Z"),
            ("6", "absence", "/ˈæbsəns/", "n. 缺席，不在；缺乏", "His absence was noticed by everyone.", "CET-4", "easy", "2024-01-01T00:00:00Z"),
            ("7", "absolute", "/ˈæbsəluːt/", "adj. 绝对的，完全的", "I have absolute confidence in you.", "CET-6", "medium", "2024-01-01T00:00:00Z"),
            ("8", "absorb", "/əbˈsɔːrb/", "v. 吸收；吸引...的注意", "Plants absorb carbon dioxide.", "CET-4", "medium", "2024-01-01T00:00:00Z"),
            ("9", "abstract", "/ˈæbstrækt/", "adj. 抽象的；n. 摘要", "Beauty is an abstract concept.", "CET-6", "hard", "2024-01-01T00:00:00Z"),
            ("10", "abundant", "/əˈbʌndənt/", "adj. 丰富的，充裕的", "The region has abundant natural resources.", "CET-6", "medium", "2024-01-01T00:00:00Z"),
            ("11", "abuse", "/əˈbjuːs/", "v./n. 滥用；虐待；辱骂", "He was accused of abusing his power.", "CET-6", "medium", "2024-01-01T00:00:00Z"),
            ("12", "academic", "/ˌækəˈdemɪk/", "adj. 学术的；学院的", "She has a strong academic background.", "CET-4", "easy", "2024-01-01T00:00:00Z"),
        ]
        cursor.executemany('INSERT INTO words VALUES (?, ?, ?, ?, ?, ?, ?, ?)', mock_words)
    
    conn.commit()
    conn.close()

init_sqlite()

def use_supabase():
    return supabase is not None

def get_sqlite_conn():
    return sqlite3.connect(DB_PATH)

@app.route('/api/words', methods=['GET'])
def get_words():
    if use_supabase():
        try:
            response = supabase.table('words').select('*').execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM words')
    words = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(words), 200

@app.route('/api/words/<word_id>', methods=['GET'])
def get_word(word_id):
    if use_supabase():
        try:
            response = supabase.table('words').select('*').eq('id', word_id).single().execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 404
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM words WHERE id = ?', (word_id,))
    word = cursor.fetchone()
    conn.close()
    if word:
        return jsonify(dict(word)), 200
    return jsonify({"error": "Word not found"}), 404

@app.route('/api/words', methods=['POST'])
def create_word():
    data = request.get_json()
    new_word = {
        "id": str(uuid.uuid4()),
        **data,
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    if use_supabase():
        try:
            response = supabase.table('words').insert(new_word).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO words (id, word, phonetic, meaning, example, category, difficulty, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (new_word['id'], new_word['word'], new_word.get('phonetic', ''), new_word['meaning'], 
          new_word.get('example', ''), new_word.get('category', 'CET-4'), new_word.get('difficulty', 'medium'), 
          new_word['created_at']))
    conn.commit()
    conn.close()
    return jsonify(new_word), 201

@app.route('/api/words/<word_id>', methods=['PUT'])
def update_word(word_id):
    data = request.get_json()
    
    if use_supabase():
        try:
            response = supabase.table('words').update(data).eq('id', word_id).execute()
            return jsonify(response.data[0]), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    update_fields = []
    update_values = []
    for key, value in data.items():
        if key != 'id':
            update_fields.append(f"{key} = ?")
            update_values.append(value)
    update_values.append(word_id)
    
    cursor.execute(f'UPDATE words SET {", ".join(update_fields)} WHERE id = ?', update_values)
    conn.commit()
    
    cursor.execute('SELECT * FROM words WHERE id = ?', (word_id,))
    updated_word = cursor.fetchone()
    conn.close()
    
    if updated_word:
        return jsonify(dict(updated_word)), 200
    return jsonify({"error": "Word not found"}), 404

@app.route('/api/words/<word_id>', methods=['DELETE'])
def delete_word(word_id):
    if use_supabase():
        try:
            response = supabase.table('words').delete().eq('id', word_id).execute()
            return jsonify({"message": "Word deleted successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM words WHERE id = ?', (word_id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Word deleted successfully"}), 200

@app.route('/api/learning-records', methods=['GET'])
def get_learning_records():
    if use_supabase():
        try:
            response = supabase.table('learning_records').select('*').execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM learning_records')
    records = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(records), 200

@app.route('/api/learning-records', methods=['POST'])
def create_learning_record():
    data = request.get_json()
    
    if use_supabase():
        try:
            word_response = supabase.table('words').select('word').eq('id', data.get('wordId')).single().execute()
            if not word_response.data:
                return jsonify({"error": "Word not found"}), 404
            
            record = {
                "id": str(uuid.uuid4()),
                "word_id": data['wordId'],
                "word": word_response.data['word'],
                "status": data['status'],
                "review_count": 1,
                "last_review_at": datetime.utcnow().isoformat() + "Z",
                "next_review_at": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
                "created_at": datetime.utcnow().isoformat() + "Z"
            }
            
            response = supabase.table('learning_records').insert(record).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT word FROM words WHERE id = ?', (data.get('wordId'),))
    word = cursor.fetchone()
    
    if not word:
        conn.close()
        return jsonify({"error": "Word not found"}), 404
    
    record = {
        "id": str(uuid.uuid4()),
        "word_id": data['wordId'],
        "word": word['word'],
        "status": data['status'],
        "review_count": 1,
        "last_review_at": datetime.utcnow().isoformat() + "Z",
        "next_review_at": (datetime.utcnow() + timedelta(days=1)).isoformat() + "Z",
        "created_at": datetime.utcnow().isoformat() + "Z"
    }
    
    cursor.execute('''
        INSERT INTO learning_records (id, word_id, word, status, review_count, last_review_at, next_review_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (record['id'], record['word_id'], record['word'], record['status'], record['review_count'], 
          record['last_review_at'], record['next_review_at'], record['created_at']))
    conn.commit()
    conn.close()
    return jsonify(record), 201

@app.route('/api/stats/daily', methods=['GET'])
def get_daily_stats():
    if use_supabase():
        try:
            response = supabase.table('daily_stats').select('*').execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM daily_stats')
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    if not stats:
        mock_stats = [
            {"date": "2024-01-15", "words_learned": 10, "words_reviewed": 15, "accuracy": 85},
            {"date": "2024-01-16", "words_learned": 12, "words_reviewed": 18, "accuracy": 90},
            {"date": "2024-01-17", "words_learned": 8, "words_reviewed": 20, "accuracy": 88},
            {"date": "2024-01-18", "words_learned": 15, "words_reviewed": 12, "accuracy": 92},
            {"date": "2024-01-19", "words_learned": 11, "words_reviewed": 16, "accuracy": 87},
        ]
        return jsonify(mock_stats), 200
    
    return jsonify(stats), 200

@app.route('/api/stats/weekly', methods=['GET'])
def get_weekly_stats():
    if use_supabase():
        try:
            response = supabase.table('weekly_stats').select('*').execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM weekly_stats')
    stats = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    if not stats:
        mock_stats = [
            {"date": "2024-W02", "words_learned": 56, "words_reviewed": 81, "accuracy": 88},
        ]
        return jsonify(mock_stats), 200
    
    return jsonify(stats), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
