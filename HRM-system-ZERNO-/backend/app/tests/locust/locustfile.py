# tests/locust/locustfile.py
from locust import HttpUser, task, between


class FeedbackUser(HttpUser):
    wait_time = between(1, 3)
    
    def on_start(self):
        """Initialize test data"""
        self.feedback_data = {
            "is_notified": False,
            "comment": "Test comment",
            "contact": "+1234567890",
            "waiter": "aidatest",
            "ratings": [
                {"rating": 5, "feedback_type_id": 1},
                {"rating": 4, "feedback_type_id": 2}
            ]
        }

    @task(2)
    def create_feedback(self):
        with self.client.post(
            "/feedbacks/create",
            json=self.feedback_data,
            catch_response=True
        ) as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Failed with {response.status_code}")
                print(response.status_code)

