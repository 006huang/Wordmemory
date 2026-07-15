import unittest
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app

class TestAPI(unittest.TestCase):
    def setUp(self):
        app.config['TESTING'] = True
        self.client = app.test_client()

    def test_get_words(self):
        response = self.client.get('/api/words')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)

    def test_get_word(self):
        response = self.client.get('/api/words/1')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertEqual(data['word'], 'abandon')

    def test_get_word_not_found(self):
        response = self.client.get('/api/words/nonexistent')
        self.assertEqual(response.status_code, 404)

    def test_create_word(self):
        new_word = {
            'word': 'testword',
            'phonetic': '/test/',
            'meaning': 'v. 测试',
            'example': 'This is a test.',
            'category': 'CET-4',
            'difficulty': 'easy'
        }
        response = self.client.post('/api/words', json=new_word)
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertEqual(data['word'], 'testword')

    def test_delete_word(self):
        new_word = {
            'word': 'tempword',
            'phonetic': '/temp/',
            'meaning': 'v. 临时',
            'example': 'Temporary word.',
            'category': 'CET-4',
            'difficulty': 'easy'
        }
        create_response = self.client.post('/api/words', json=new_word)
        word_id = create_response.get_json()['id']
        
        delete_response = self.client.delete(f'/api/words/{word_id}')
        self.assertEqual(delete_response.status_code, 200)

    def test_get_learning_records(self):
        response = self.client.get('/api/learning-records')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)

    def test_get_daily_stats(self):
        response = self.client.get('/api/stats/daily')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)

    def test_get_weekly_stats(self):
        response = self.client.get('/api/stats/weekly')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIsInstance(data, list)

if __name__ == '__main__':
    unittest.main()
