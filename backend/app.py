from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from supabase import create_client, Client
from dotenv import load_dotenv
import uuid
from datetime import datetime, timedelta
import sqlite3
import bcrypt
import jwt

load_dotenv()

app = Flask(__name__)
CORS(app)

SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
SECRET_KEY = os.getenv('SECRET_KEY', 'wordmemory_secret_key')

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'wordmemory.db')

def init_sqlite():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wordbooks (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS wordbook_words (
            id TEXT PRIMARY KEY,
            wordbook_id TEXT,
            word_id TEXT,
            FOREIGN KEY (wordbook_id) REFERENCES wordbooks(id),
            FOREIGN KEY (word_id) REFERENCES words(id)
        )
    ''')
    
    cursor.execute('SELECT COUNT(*) FROM words')
    if cursor.fetchone()[0] == 0:
        import json
        word_data_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'word_data.json')
        with open(word_data_path, 'r', encoding='utf-8') as f:
            words_data = json.load(f)
        for idx, word in enumerate(words_data):
            cursor.execute('''
                INSERT INTO words (id, word, phonetic, meaning, example, category, difficulty, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (str(idx + 1), word['word'], word['phonetic'], word['meaning'], 
                  word['example'], word['category'], word['difficulty'], "2024-01-01T00:00:00Z"))
    
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
    
    allowed_fields = ['word', 'phonetic', 'meaning', 'example', 'category', 'difficulty']
    update_fields = []
    update_values = []
    for key, value in data.items():
        if key in allowed_fields:
            update_fields.append(f"{key} = ?")
            update_values.append(value)
    update_values.append(word_id)
    
    if not update_fields:
        conn.close()
        return jsonify({"error": "No valid fields to update"}), 400
    
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
            records = []
            for r in response.data:
                records.append({
                    'id': r['id'],
                    'wordId': r['word_id'],
                    'word': r['word'],
                    'status': r['status'],
                    'reviewCount': r['review_count'],
                    'lastReviewAt': r['last_review_at'],
                    'nextReviewAt': r['next_review_at'],
                    'createdAt': r['created_at']
                })
            return jsonify(records), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM learning_records')
    records = []
    for row in cursor.fetchall():
        r = dict(row)
        records.append({
            'id': r['id'],
            'wordId': r['word_id'],
            'word': r['word'],
            'status': r['status'],
            'reviewCount': r['review_count'],
            'lastReviewAt': r['last_review_at'],
            'nextReviewAt': r['next_review_at'],
            'createdAt': r['created_at']
        })
    conn.close()
    return jsonify(records), 200

@app.route('/api/review-words', methods=['GET'])
def get_review_words():
    now = datetime.utcnow().isoformat() + "Z"
    
    if use_supabase():
        try:
            response = supabase.table('learning_records').select('*').lt('next_review_at', now).execute()
            word_ids = [r['word_id'] for r in response.data]
            if not word_ids:
                return jsonify([]), 200
            word_response = supabase.table('words').select('*').in_('id', word_ids).execute()
            return jsonify(word_response.data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT word_id FROM learning_records WHERE next_review_at < ?', (now,))
    word_ids = [row['word_id'] for row in cursor.fetchall()]
    
    if not word_ids:
        conn.close()
        return jsonify([]), 200
    
    placeholders = ','.join('?' * len(word_ids))
    cursor.execute(f'SELECT * FROM words WHERE id IN ({placeholders})', word_ids)
    words = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(words), 200

def get_next_review_interval(status: str, review_count: int) -> timedelta:
    intervals = {
        'new': [1, 2, 4, 7, 15],
        'learning': [1, 3, 6, 10, 20],
        'mastered': [3, 7, 14, 30, 60]
    }
    index = min(review_count, len(intervals.get(status, intervals['new'])) - 1)
    return timedelta(days=intervals.get(status, intervals['new'])[index])

@app.route('/api/learning-records', methods=['POST'])
def create_learning_record():
    data = request.get_json()
    
    if use_supabase():
        try:
            word_response = supabase.table('words').select('word').eq('id', data.get('wordId')).single().execute()
            if not word_response.data:
                return jsonify({"error": "Word not found"}), 404
            
            existing_response = supabase.table('learning_records').select('*').eq('word_id', data['wordId']).single().execute()
            
            if existing_response.data:
                review_count = existing_response.data.get('review_count', 0) + 1
                next_review = get_next_review_interval(data['status'], review_count)
                record = {
                    "status": data['status'],
                    "review_count": review_count,
                    "last_review_at": datetime.utcnow().isoformat() + "Z",
                    "next_review_at": (datetime.utcnow() + next_review).isoformat() + "Z"
                }
                response = supabase.table('learning_records').update(record).eq('word_id', data['wordId']).execute()
                r = response.data[0]
                return jsonify({
                    'id': r['id'],
                    'wordId': r['word_id'],
                    'word': r['word'],
                    'status': r['status'],
                    'reviewCount': r['review_count'],
                    'lastReviewAt': r['last_review_at'],
                    'nextReviewAt': r['next_review_at'],
                    'createdAt': r['created_at']
                }), 200
            else:
                next_review = get_next_review_interval(data['status'], 1)
                record = {
                    "id": str(uuid.uuid4()),
                    "word_id": data['wordId'],
                    "word": word_response.data['word'],
                    "status": data['status'],
                    "review_count": 1,
                    "last_review_at": datetime.utcnow().isoformat() + "Z",
                    "next_review_at": (datetime.utcnow() + next_review).isoformat() + "Z",
                    "created_at": datetime.utcnow().isoformat() + "Z"
                }
                response = supabase.table('learning_records').insert(record).execute()
                r = response.data[0]
                return jsonify({
                    'id': r['id'],
                    'wordId': r['word_id'],
                    'word': r['word'],
                    'status': r['status'],
                    'reviewCount': r['review_count'],
                    'lastReviewAt': r['last_review_at'],
                    'nextReviewAt': r['next_review_at'],
                    'createdAt': r['created_at']
                }), 201
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
    
    cursor.execute('SELECT * FROM learning_records WHERE word_id = ?', (data['wordId'],))
    existing_record = cursor.fetchone()
    
    if existing_record:
        review_count = existing_record['review_count'] + 1
        next_review = get_next_review_interval(data['status'], review_count)
        cursor.execute('''
            UPDATE learning_records 
            SET status = ?, review_count = ?, last_review_at = ?, next_review_at = ?
            WHERE word_id = ?
        ''', (data['status'], review_count, datetime.utcnow().isoformat() + "Z", 
              (datetime.utcnow() + next_review).isoformat() + "Z", data['wordId']))
        conn.commit()
        
        cursor.execute('SELECT * FROM learning_records WHERE word_id = ?', (data['wordId'],))
        updated_record = cursor.fetchone()
        conn.close()
        r = dict(updated_record)
        return jsonify({
            'id': r['id'],
            'wordId': r['word_id'],
            'word': r['word'],
            'status': r['status'],
            'reviewCount': r['review_count'],
            'lastReviewAt': r['last_review_at'],
            'nextReviewAt': r['next_review_at'],
            'createdAt': r['created_at']
        }), 200
    else:
        next_review = get_next_review_interval(data['status'], 1)
        record = {
            "id": str(uuid.uuid4()),
            "word_id": data['wordId'],
            "word": word['word'],
            "status": data['status'],
            "review_count": 1,
            "last_review_at": datetime.utcnow().isoformat() + "Z",
            "next_review_at": (datetime.utcnow() + next_review).isoformat() + "Z",
            "created_at": datetime.utcnow().isoformat() + "Z"
        }
        
        cursor.execute('''
            INSERT INTO learning_records (id, word_id, word, status, review_count, last_review_at, next_review_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (record['id'], record['word_id'], record['word'], record['status'], record['review_count'], 
              record['last_review_at'], record['next_review_at'], record['created_at']))
        conn.commit()
        conn.close()
        return jsonify({
            'id': record['id'],
            'wordId': record['word_id'],
            'word': record['word'],
            'status': record['status'],
            'reviewCount': record['review_count'],
            'lastReviewAt': record['last_review_at'],
            'nextReviewAt': record['next_review_at'],
            'createdAt': record['created_at']
        }), 201

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
        today = datetime.now()
        mock_stats = [
            {"date": (today - timedelta(days=6)).strftime("%Y-%m-%d"), "words_learned": 8, "words_reviewed": 12, "accuracy": 82},
            {"date": (today - timedelta(days=5)).strftime("%Y-%m-%d"), "words_learned": 10, "words_reviewed": 15, "accuracy": 85},
            {"date": (today - timedelta(days=4)).strftime("%Y-%m-%d"), "words_learned": 12, "words_reviewed": 18, "accuracy": 90},
            {"date": (today - timedelta(days=3)).strftime("%Y-%m-%d"), "words_learned": 8, "words_reviewed": 20, "accuracy": 88},
            {"date": (today - timedelta(days=2)).strftime("%Y-%m-%d"), "words_learned": 15, "words_reviewed": 12, "accuracy": 92},
            {"date": (today - timedelta(days=1)).strftime("%Y-%m-%d"), "words_learned": 14, "words_reviewed": 18, "accuracy": 89},
            {"date": today.strftime("%Y-%m-%d"), "words_learned": 11, "words_reviewed": 16, "accuracy": 87},
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
        today = datetime.now()
        week_number = today.isocalendar()[1]
        mock_stats = [
            {"date": f"{today.year}-W{week_number:02d}", "words_learned": 56, "words_reviewed": 81, "accuracy": 88},
        ]
        return jsonify(mock_stats), 200
    
    return jsonify(stats), 200

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "用户名和密码不能为空"}), 400
    
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    if use_supabase():
        try:
            existing = supabase.table('users').select('*').eq('username', username).execute()
            if existing.data:
                return jsonify({"error": "用户名已存在"}), 400
            
            user = {
                'id': str(uuid.uuid4()),
                'username': username,
                'password': hashed_password,
                'created_at': datetime.utcnow().isoformat() + 'Z'
            }
            response = supabase.table('users').insert(user).execute()
            token = generate_token(user['id'])
            return jsonify({
                'token': token,
                'user': {
                    'id': user['id'],
                    'username': user['username']
                }
            }), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    if cursor.fetchone():
        conn.close()
        return jsonify({"error": "用户名已存在"}), 400
    
    user_id = str(uuid.uuid4())
    cursor.execute('''
        INSERT INTO users (id, username, password, created_at)
        VALUES (?, ?, ?, ?)
    ''', (user_id, username, hashed_password, datetime.utcnow().isoformat()))
    conn.commit()
    conn.close()
    
    token = generate_token(user_id)
    return jsonify({
        'token': token,
        'user': {
            'id': user_id,
            'username': username
        }
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "用户名和密码不能为空"}), 400
    
    if use_supabase():
        try:
            response = supabase.table('users').select('*').eq('username', username).execute()
            if not response.data:
                return jsonify({"error": "用户名或密码错误"}), 401
            
            user = response.data[0]
            if bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
                token = generate_token(user['id'])
                return jsonify({
                    'token': token,
                    'user': {
                        'id': user['id'],
                        'username': user['username']
                    }
                }), 200
            else:
                return jsonify({"error": "用户名或密码错误"}), 401
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE username = ?', (username,))
    user = cursor.fetchone()
    conn.close()
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password'].encode('utf-8')):
        return jsonify({"error": "用户名或密码错误"}), 401
    
    token = generate_token(user['id'])
    return jsonify({
        'token': token,
        'user': {
            'id': user['id'],
            'username': user['username']
        }
    }), 200

def generate_token(user_id):
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/api/wordbooks', methods=['GET'])
def get_wordbooks():
    if use_supabase():
        try:
            response = supabase.table('wordbooks').select('*').execute()
            return jsonify(response.data), 200
        except Exception as e:
            return jsonify([]), 200
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM wordbooks')
    wordbooks = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(wordbooks), 200

@app.route('/api/wordbooks', methods=['POST'])
def create_wordbook():
    data = request.get_json()
    wordbook = {
        'id': str(uuid.uuid4()),
        'name': data.get('name', 'Untitled'),
        'description': data.get('description', ''),
        'created_at': datetime.utcnow().isoformat() + 'Z'
    }
    
    if use_supabase():
        try:
            response = supabase.table('wordbooks').insert(wordbook).execute()
            return jsonify(response.data[0]), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO wordbooks (id, name, description, created_at)
        VALUES (?, ?, ?, ?)
    ''', (wordbook['id'], wordbook['name'], wordbook['description'], wordbook['created_at']))
    conn.commit()
    conn.close()
    return jsonify(wordbook), 201

@app.route('/api/wordbooks/<id>/words', methods=['GET'])
def get_wordbook_words(id):
    if use_supabase():
        try:
            response = supabase.table('wordbook_words').select('*').eq('wordbook_id', id).execute()
            word_ids = [r['word_id'] for r in response.data]
            if word_ids:
                word_response = supabase.table('words').select('*').in_('id', word_ids).execute()
                return jsonify(word_response.data), 200
            return jsonify([]), 200
        except Exception as e:
            return jsonify([]), 200
    
    conn = get_sqlite_conn()
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT word_id FROM wordbook_words WHERE wordbook_id = ?', (id,))
    word_ids = [row['word_id'] for row in cursor.fetchall()]
    
    if not word_ids:
        conn.close()
        return jsonify([]), 200
    
    placeholders = ','.join('?' * len(word_ids))
    cursor.execute(f'SELECT * FROM words WHERE id IN ({placeholders})', word_ids)
    words = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(words), 200

@app.route('/api/wordbooks/<id>/words', methods=['POST'])
def add_word_to_wordbook(id):
    data = request.get_json()
    word_id = data.get('wordId')
    
    if use_supabase():
        try:
            exists = supabase.table('wordbook_words').select('*').eq('wordbook_id', id).eq('word_id', word_id).execute()
            if not exists.data:
                supabase.table('wordbook_words').insert({
                    'wordbook_id': id,
                    'word_id': word_id
                }).execute()
            return jsonify({"message": "Word added"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM wordbook_words WHERE wordbook_id = ? AND word_id = ?', (id, word_id))
    if not cursor.fetchone():
        cursor.execute('INSERT INTO wordbook_words (wordbook_id, word_id) VALUES (?, ?)', (id, word_id))
        conn.commit()
    conn.close()
    return jsonify({"message": "Word added"}), 200

@app.route('/api/wordbooks/<id>/words/<word_id>', methods=['DELETE'])
def remove_word_from_wordbook(id, word_id):
    if use_supabase():
        try:
            supabase.table('wordbook_words').delete().eq('wordbook_id', id).eq('word_id', word_id).execute()
            return jsonify({"message": "Word removed"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM wordbook_words WHERE wordbook_id = ? AND word_id = ?', (id, word_id))
    conn.commit()
    conn.close()
    return jsonify({"message": "Word removed"}), 200

@app.route('/api/wordbooks/<id>', methods=['DELETE'])
def delete_wordbook(id):
    if use_supabase():
        try:
            supabase.table('wordbook_words').delete().eq('wordbook_id', id).execute()
            supabase.table('wordbooks').delete().eq('id', id).execute()
            return jsonify({"message": "Wordbook deleted"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    cursor.execute('DELETE FROM wordbook_words WHERE wordbook_id = ?', (id,))
    cursor.execute('DELETE FROM wordbooks WHERE id = ?', (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Wordbook deleted"}), 200

@app.route('/api/achievements', methods=['GET'])
def get_achievements():
    if use_supabase():
        try:
            response = supabase.table('learning_records').select('*').execute()
            records = response.data
        except Exception:
            records = []
    else:
        conn = get_sqlite_conn()
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM learning_records')
        records = [dict(row) for row in cursor.fetchall()]
        conn.close()
    
    mastered_count = len([r for r in records if r.get('status') == 'mastered'])
    total_reviews = sum(r.get('review_count', 0) for r in records)
    
    dates = set()
    for r in records:
        last_review = r.get('last_review_at') or r.get('created_at')
        if last_review:
            date_str = last_review[:10]
            dates.add(date_str)
    
    streak = 0
    today = datetime.now().strftime('%Y-%m-%d')
    current_date = datetime.now()
    
    for i in range(365):
        check_date = (current_date - timedelta(days=i)).strftime('%Y-%m-%d')
        if check_date in dates:
            streak += 1
        elif i > 0:
            break
    
    achievements = []
    
    if mastered_count >= 10:
        achievements.append({'id': 'first_steps', 'name': '初学者', 'description': '掌握10个单词', 'icon': '🌱', 'progress': min(mastered_count, 10)})
    if mastered_count >= 50:
        achievements.append({'id': 'word_collector', 'name': '词汇收藏家', 'description': '掌握50个单词', 'icon': '📚', 'progress': min(mastered_count, 50)})
    if mastered_count >= 100:
        achievements.append({'id': 'vocabulary_master', 'name': '词汇大师', 'description': '掌握100个单词', 'icon': '🏆', 'progress': min(mastered_count, 100)})
    if streak >= 3:
        achievements.append({'id': 'streak_3', 'name': '坚持不懈', 'description': '连续学习3天', 'icon': '🔥', 'progress': min(streak, 3)})
    if streak >= 7:
        achievements.append({'id': 'streak_7', 'name': '一周达人', 'description': '连续学习7天', 'icon': '⭐', 'progress': min(streak, 7)})
    if streak >= 30:
        achievements.append({'id': 'streak_30', 'name': '月度冠军', 'description': '连续学习30天', 'icon': '👑', 'progress': min(streak, 30)})
    if total_reviews >= 100:
        achievements.append({'id': 'review_master', 'name': '复习达人', 'description': '累计复习100次', 'icon': '🔄', 'progress': min(total_reviews, 100)})
    
    return jsonify({
        'streak': streak,
        'totalMastered': mastered_count,
        'totalReviews': total_reviews,
        'learningDays': len(dates),
        'achievements': achievements
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
