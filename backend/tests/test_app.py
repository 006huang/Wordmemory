import pytest
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

os.environ['DB_PATH'] = ':memory:'

from app import app

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_get_words(client):
    response = client.get('/api/words')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_word(client):
    response = client.get('/api/words/1')
    assert response.status_code == 200
    data = response.get_json()
    assert data['word'] == 'abandon'

def test_get_word_not_found(client):
    response = client.get('/api/words/nonexistent')
    assert response.status_code == 404

def test_create_word(client):
    new_word = {
        'word': 'testword',
        'phonetic': '/test/',
        'meaning': 'v. 测试',
        'example': 'This is a test.',
        'category': 'CET-4',
        'difficulty': 'easy'
    }
    response = client.post('/api/words', json=new_word)
    assert response.status_code == 201
    data = response.get_json()
    assert data['word'] == 'testword'

def test_delete_word(client):
    new_word = {
        'word': 'tempword',
        'phonetic': '/temp/',
        'meaning': 'v. 临时',
        'example': 'Temporary word.',
        'category': 'CET-4',
        'difficulty': 'easy'
    }
    create_response = client.post('/api/words', json=new_word)
    word_id = create_response.get_json()['id']
    
    delete_response = client.delete(f'/api/words/{word_id}')
    assert delete_response.status_code == 200

def test_get_learning_records(client):
    response = client.get('/api/learning-records')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_daily_stats(client):
    response = client.get('/api/stats/daily')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_weekly_stats(client):
    response = client.get('/api/stats/weekly')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_register(client):
    import uuid
    unique_username = f'testuser_{uuid.uuid4().hex[:8]}'
    response = client.post('/api/register', json={
        'username': unique_username,
        'password': 'testpassword123'
    })
    assert response.status_code == 201 or response.status_code == 200

def test_login(client):
    import uuid
    unique_username = f'testuser_login_{uuid.uuid4().hex[:8]}'
    client.post('/api/register', json={
        'username': unique_username,
        'password': 'password123'
    })
    response = client.post('/api/login', json={
        'username': unique_username,
        'password': 'password123'
    })
    assert response.status_code == 200
    data = response.get_json()
    assert 'token' in data

def test_get_wordbooks(client):
    response = client.get('/api/wordbooks')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_favorites(client):
    response = client.get('/api/favorites')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_stats_overview(client):
    response = client.get('/api/stats/daily')
    assert response.status_code == 200
    data = response.get_json()
    assert isinstance(data, list)

def test_get_achievements(client):
    response = client.get('/api/achievements')
    assert response.status_code == 200
    data = response.get_json()
    assert 'achievements' in data
    assert isinstance(data['achievements'], list)