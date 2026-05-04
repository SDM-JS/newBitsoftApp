import unittest
import urllib.request
import urllib.error
import json
import string
import random

BASE_URL = 'http://localhost:3000/api'

def random_string(length=10):
    letters = string.ascii_lowercase
    return ''.join(random.choice(letters) for _ in range(length))

def json_request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    headers['Content-Type'] = 'application/json'
    
    req_data = json.dumps(data).encode('utf-8') if data else None
    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode('utf-8')
            return status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except json.JSONDecodeError:
            return e.code, body
    except Exception as e:
        return 0, str(e)

class TestCRMAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # 1. Sign up a new user (which gets admin role by default in the system)
        cls.user_email = f"test_{random_string()}@example.com"
        cls.password = "password123"
        cls.user_name = "Test User"
        
        signUpData = {
            "fullName": cls.user_name,
            "parentNumber": "1234567890",
            "email": cls.user_email,
            "password": cls.password,
            "username": f"user_{random_string()}",
            "groupId": "" # Optional
        }
        
        status, data = json_request('POST', f"{BASE_URL}/sign-up", signUpData)
        if status != 201:
            raise Exception(f"Failed to set up test user: status {status}, response: {data}")
        
        # 2. Log in
        loginData = {
            "email": cls.user_email,
            "password": cls.password
        }
        status, res_login = json_request('POST', f"{BASE_URL}/login", loginData)
        if status != 200:
            raise Exception(f"Failed to log in test user: status {status}, response: {res_login}")
            
        cls.token = res_login.get('user', {}).get('token')
        cls.auth_headers = {'Authorization': f'Bearer {cls.token}'}
        cls.student_id = res_login.get('user', {}).get('id')

    def test_1_create_course(self):
        data = {
            "name": f"Course_{random_string()}",
            "description": "Test Description"
        }
        status, res = json_request('POST', f"{BASE_URL}/courses", data, self.auth_headers)
        self.assertEqual(status, 201, f"Expected 201, got {status}: {res}")
        self.__class__.course_id = res.get('course', {}).get('id')
        self.assertIsNotNone(self.course_id)

    def test_2_get_all_courses(self):
        status, res = json_request('GET', f"{BASE_URL}/courses", headers=self.auth_headers)
        self.assertEqual(status, 200)
        courses = res.get('courses', [])
        self.assertTrue(len(courses) > 0)

    def test_3_create_group(self):
        data = {
            "name": f"Group_{random_string()}",
            "courseId": self.course_id
        }
        status, res = json_request('POST', f"{BASE_URL}/groups", data, self.auth_headers)
        self.assertEqual(status, 201, f"Expected 201, got {status}: {res}")
        self.__class__.group_id = res.get('group', {}).get('id')
        self.assertIsNotNone(self.group_id)

    def test_4_create_homework(self):
        data = {
            "title": "Math Assignment",
            "description": "Do problems 1 to 10",
            "checked": False,
            "point": 100,
            "deadline": "2026-12-31T23:59:59Z",
            "studentId": self.student_id
        }
        status, res = json_request('POST', f"{BASE_URL}/homeworks", data, self.auth_headers)
        self.assertEqual(status, 201, f"Expected 201, got {status}: {res}")
        self.__class__.homework_id = res.get('homework', {}).get('id')
        self.assertIsNotNone(self.homework_id)

    def test_5_update_homework(self):
        data = {
            "point": 95,
            "checked": True
        }
        status, res = json_request('PUT', f"{BASE_URL}/homeworks/{self.homework_id}", data, self.auth_headers)
        self.assertEqual(status, 200, f"Expected 200, got {status}: {res}")
        
    def test_6_delete_homework(self):
        status, res = json_request('DELETE', f"{BASE_URL}/homeworks/{self.homework_id}", headers=self.auth_headers)
        self.assertEqual(status, 200, f"Expected 200, got {status}: {res}")

    def test_7_student_activity(self):
        # Create
        data = {
            "studentId": self.student_id,
            "rating": "A"
        }
        status, res_create = json_request('POST', f"{BASE_URL}/student-activities", data, self.auth_headers)
        self.assertEqual(status, 201)
        activity_id = res_create.get('studentActivity', {}).get('id')
        
        # Get all
        status_all, res_all = json_request('GET', f"{BASE_URL}/student-activities", headers=self.auth_headers)
        self.assertEqual(status_all, 200)
        
        # Update
        status_update, res_update = json_request('PUT', f"{BASE_URL}/student-activities/{activity_id}", {"rating": "A+"}, self.auth_headers)
        self.assertEqual(status_update, 200)
        
        # Delete
        status_delete, res_delete = json_request('DELETE', f"{BASE_URL}/student-activities/{activity_id}", headers=self.auth_headers)
        self.assertEqual(status_delete, 200)

if __name__ == '__main__':
    unittest.main(verbosity=2)
