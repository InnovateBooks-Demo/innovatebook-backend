#!/usr/bin/env python3
"""
Workspace Layer 5-Module Backend API Testing
Comprehensive test suite for Tasks, Approvals, Channels, Chats, and Notifications
"""

import requests
import json
import sys
from datetime import datetime, timezone, timedelta
import time

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com/api"
TEST_CREDENTIALS = {
    "email": "demo@innovatebooks.com",
    "password": "Demo1234"
}

class WorkspaceAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.results = []
        self.test_context_id = None
        self.test_task_id = None
        self.test_approval_id = None
        self.test_channel_id = None
        self.test_chat_id = None
        self.test_notification_id = None
        
    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "response_data": response_data
        }
        self.results.append(result)
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success and response_data:
            print(f"   Response: {response_data}")
        print()

    def authenticate(self):
        """Authenticate and get JWT token"""
        try:
            print("🔐 AUTHENTICATING...")
            response = self.session.post(
                f"{BACKEND_URL}/auth/login",
                json=TEST_CREDENTIALS,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data.get("access_token")
                self.session.headers.update({
                    "Authorization": f"Bearer {self.auth_token}"
                })
                self.log_result(
                    "Authentication", 
                    True, 
                    f"Successfully logged in as {TEST_CREDENTIALS['email']}"
                )
                return True
            else:
                self.log_result(
                    "Authentication", 
                    False, 
                    f"Login failed with status {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Authentication", False, f"Exception: {str(e)}")
            return False

    def test_seed_workspace_data(self):
        """Test GET /api/workspace/seed - Seed sample workspace data"""
        try:
            print("🌱 TESTING SEED WORKSPACE DATA...")
            response = self.session.get(
                f"{BACKEND_URL}/workspace/seed",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_result(
                        "Seed Workspace Data", 
                        False, 
                        "Seed operation did not return success=True",
                        data
                    )
                    return False
                
                self.log_result(
                    "Seed Workspace Data", 
                    True, 
                    "Sample workspace data seeded successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Seed Workspace Data", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Seed Workspace Data", False, f"Exception: {str(e)}")
            return False

    def test_workspace_stats(self):
        """Test GET /api/workspace/stats - Get dashboard statistics"""
        try:
            print("📊 TESTING WORKSPACE STATS...")
            response = self.session.get(
                f"{BACKEND_URL}/workspace/stats",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify required stats fields
                required_fields = [
                    "active_tasks", "pending_approvals", "due_this_week", 
                    "unread_messages", "open_chats", "active_channels"
                ]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Workspace Stats", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify all values are integers
                for field in required_fields:
                    if not isinstance(data[field], int):
                        self.log_result(
                            "Workspace Stats", 
                            False, 
                            f"Field {field} should be integer, got {type(data[field])}",
                            data
                        )
                        return False
                
                self.log_result(
                    "Workspace Stats", 
                    True, 
                    f"Stats retrieved: {data['active_tasks']} tasks, {data['pending_approvals']} approvals, {data['unread_messages']} notifications"
                )
                return True
                
            else:
                self.log_result(
                    "Workspace Stats", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Workspace Stats", False, f"Exception: {str(e)}")
            return False

    def test_create_task(self):
        """Test POST /api/workspace/tasks - Create task"""
        try:
            print("📝 TESTING CREATE TASK...")
            
            # First create a context
            context_data = {
                "object_type": "deal",
                "object_id": "DEAL-TEST-001",
                "object_name": "Test Deal for Task Creation"
            }
            
            context_response = self.session.post(
                f"{BACKEND_URL}/workspace/contexts",
                json=context_data,
                timeout=30
            )
            
            if context_response.status_code != 200:
                self.log_result(
                    "Create Task", 
                    False, 
                    f"Failed to create context: HTTP {context_response.status_code}",
                    context_response.text
                )
                return False
            
            context = context_response.json()
            self.test_context_id = context["context_id"]
            
            # Now create the task
            task_data = {
                "context_id": self.test_context_id,
                "task_type": "review",
                "title": "Test Task - Review Contract Terms",
                "description": "This is a test task for API validation",
                "priority": "high",
                "visibility_scope": "internal_only",
                "source": "manual"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/tasks",
                json=task_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["task_id", "context_id", "task_type", "title", "status"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Task", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify task_id format
                task_id = data.get("task_id", "")
                if not task_id.startswith("TASK-"):
                    self.log_result(
                        "Create Task", 
                        False, 
                        f"Invalid task_id format: {task_id}. Expected TASK-XXX",
                        data
                    )
                    return False
                
                # Verify initial status
                if data.get("status") != "open":
                    self.log_result(
                        "Create Task", 
                        False, 
                        f"Expected status 'open', got '{data.get('status')}'",
                        data
                    )
                    return False
                
                self.test_task_id = task_id
                
                self.log_result(
                    "Create Task", 
                    True, 
                    f"Task created successfully with ID: {task_id}, Status: {data.get('status')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Task", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Task", False, f"Exception: {str(e)}")
            return False

    def test_list_tasks(self):
        """Test GET /api/workspace/tasks - List tasks"""
        try:
            print("📋 TESTING LIST TASKS...")
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/tasks",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Tasks", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                # Verify our test task appears in the list
                test_task_found = False
                if self.test_task_id:
                    for task in data:
                        if task.get("task_id") == self.test_task_id:
                            test_task_found = True
                            break
                
                if not test_task_found and self.test_task_id:
                    self.log_result(
                        "List Tasks", 
                        False, 
                        f"Test task {self.test_task_id} not found in list"
                    )
                    return False
                
                self.log_result(
                    "List Tasks", 
                    True, 
                    f"Retrieved {len(data)} tasks successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Tasks", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Tasks", False, f"Exception: {str(e)}")
            return False

    def test_complete_task(self):
        """Test POST /api/workspace/tasks/{task_id}/complete - Complete a task"""
        try:
            print("✅ TESTING COMPLETE TASK...")
            
            if not self.test_task_id:
                self.log_result(
                    "Complete Task", 
                    False, 
                    "No test task ID available"
                )
                return False
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/tasks/{self.test_task_id}/complete",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_result(
                        "Complete Task", 
                        False, 
                        "Task completion did not return success=True",
                        data
                    )
                    return False
                
                self.log_result(
                    "Complete Task", 
                    True, 
                    f"Task {self.test_task_id} completed successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Complete Task", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Complete Task", False, f"Exception: {str(e)}")
            return False

    def test_create_approval(self):
        """Test POST /api/workspace/approvals - Create approval request"""
        try:
            print("🔍 TESTING CREATE APPROVAL...")
            
            if not self.test_context_id:
                self.log_result(
                    "Create Approval", 
                    False, 
                    "No test context ID available"
                )
                return False
            
            approval_data = {
                "context_id": self.test_context_id,
                "approval_type": "deal_approval",
                "title": "Test Approval - Deal Review",
                "description": "Please review and approve this test deal",
                "priority": "high"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/approvals",
                json=approval_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["approval_id", "context_id", "approval_type", "title", "decision"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Approval", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify approval_id format
                approval_id = data.get("approval_id", "")
                if not approval_id.startswith("APPR-"):
                    self.log_result(
                        "Create Approval", 
                        False, 
                        f"Invalid approval_id format: {approval_id}. Expected APPR-XXX",
                        data
                    )
                    return False
                
                # Verify initial decision
                if data.get("decision") != "pending":
                    self.log_result(
                        "Create Approval", 
                        False, 
                        f"Expected decision 'pending', got '{data.get('decision')}'",
                        data
                    )
                    return False
                
                self.test_approval_id = approval_id
                
                self.log_result(
                    "Create Approval", 
                    True, 
                    f"Approval created successfully with ID: {approval_id}, Decision: {data.get('decision')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Approval", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Approval", False, f"Exception: {str(e)}")
            return False

    def test_list_approvals(self):
        """Test GET /api/workspace/approvals - List approvals"""
        try:
            print("📋 TESTING LIST APPROVALS...")
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/approvals",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Approvals", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                self.log_result(
                    "List Approvals", 
                    True, 
                    f"Retrieved {len(data)} approvals successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Approvals", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Approvals", False, f"Exception: {str(e)}")
            return False

    def test_decide_approval(self):
        """Test POST /api/workspace/approvals/{approval_id}/decide - Make decision"""
        try:
            print("✅ TESTING DECIDE APPROVAL...")
            
            if not self.test_approval_id:
                self.log_result(
                    "Decide Approval", 
                    False, 
                    "No test approval ID available"
                )
                return False
            
            decision_data = {
                "decision": "approved",
                "decision_reason": "Test approval - all requirements met"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/approvals/{self.test_approval_id}/decide",
                json=decision_data,
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify decision was updated
                if data.get("decision") != "approved":
                    self.log_result(
                        "Decide Approval", 
                        False, 
                        f"Expected decision 'approved', got '{data.get('decision')}'",
                        data
                    )
                    return False
                
                self.log_result(
                    "Decide Approval", 
                    True, 
                    f"Approval {self.test_approval_id} decided successfully: {data.get('decision')}"
                )
                return True
                
            else:
                self.log_result(
                    "Decide Approval", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Decide Approval", False, f"Exception: {str(e)}")
            return False

    def test_create_channel(self):
        """Test POST /api/workspace/channels - Create channel"""
        try:
            print("📢 TESTING CREATE CHANNEL...")
            
            channel_data = {
                "name": "Test Channel - API Testing",
                "channel_type": "general",
                "description": "Channel created for API testing purposes",
                "member_users": [],
                "member_roles": [],
                "visibility_scope": "internal_only"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/channels",
                json=channel_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["channel_id", "name", "channel_type", "is_active"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Channel", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify channel_id format
                channel_id = data.get("channel_id", "")
                if not channel_id.startswith("CH-"):
                    self.log_result(
                        "Create Channel", 
                        False, 
                        f"Invalid channel_id format: {channel_id}. Expected CH-XXX",
                        data
                    )
                    return False
                
                self.test_channel_id = channel_id
                
                self.log_result(
                    "Create Channel", 
                    True, 
                    f"Channel created successfully with ID: {channel_id}, Name: {data.get('name')}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Channel", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Channel", False, f"Exception: {str(e)}")
            return False

    def test_list_channels(self):
        """Test GET /api/workspace/channels - List channels"""
        try:
            print("📋 TESTING LIST CHANNELS...")
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/channels",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Channels", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                self.log_result(
                    "List Channels", 
                    True, 
                    f"Retrieved {len(data)} channels successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Channels", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Channels", False, f"Exception: {str(e)}")
            return False

    def test_send_channel_message(self):
        """Test POST /api/workspace/channels/{channel_id}/messages - Send message"""
        try:
            print("💬 TESTING SEND CHANNEL MESSAGE...")
            
            if not self.test_channel_id:
                self.log_result(
                    "Send Channel Message", 
                    False, 
                    "No test channel ID available"
                )
                return False
            
            message_data = {
                "content_type": "text",
                "payload": "This is a test message sent via API testing",
                "mentions": []
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/channels/{self.test_channel_id}/messages",
                json=message_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["message_id", "channel_id", "sender_id", "content_type", "payload"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Send Channel Message", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify message_id format
                message_id = data.get("message_id", "")
                if not message_id.startswith("CMSG-"):
                    self.log_result(
                        "Send Channel Message", 
                        False, 
                        f"Invalid message_id format: {message_id}. Expected CMSG-XXX",
                        data
                    )
                    return False
                
                self.log_result(
                    "Send Channel Message", 
                    True, 
                    f"Message sent successfully with ID: {message_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Send Channel Message", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Send Channel Message", False, f"Exception: {str(e)}")
            return False

    def test_get_channel_messages(self):
        """Test GET /api/workspace/channels/{channel_id}/messages - Get messages"""
        try:
            print("📨 TESTING GET CHANNEL MESSAGES...")
            
            if not self.test_channel_id:
                self.log_result(
                    "Get Channel Messages", 
                    False, 
                    "No test channel ID available"
                )
                return False
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/channels/{self.test_channel_id}/messages",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "Get Channel Messages", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                self.log_result(
                    "Get Channel Messages", 
                    True, 
                    f"Retrieved {len(data)} messages successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Get Channel Messages", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Get Channel Messages", False, f"Exception: {str(e)}")
            return False

    def test_create_chat(self):
        """Test POST /api/workspace/chats - Create context-bound chat"""
        try:
            print("💬 TESTING CREATE CHAT...")
            
            if not self.test_context_id:
                self.log_result(
                    "Create Chat", 
                    False, 
                    "No test context ID available"
                )
                return False
            
            chat_data = {
                "context_id": self.test_context_id,
                "chat_type": "internal",
                "participants": [],
                "visibility_scope": "internal_only"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/chats",
                json=chat_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["chat_id", "context_id", "chat_type", "participants"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Create Chat", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify chat_id format
                chat_id = data.get("chat_id", "")
                if not chat_id.startswith("CHAT-"):
                    self.log_result(
                        "Create Chat", 
                        False, 
                        f"Invalid chat_id format: {chat_id}. Expected CHAT-XXX",
                        data
                    )
                    return False
                
                self.test_chat_id = chat_id
                
                self.log_result(
                    "Create Chat", 
                    True, 
                    f"Chat created successfully with ID: {chat_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Create Chat", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Create Chat", False, f"Exception: {str(e)}")
            return False

    def test_list_chats(self):
        """Test GET /api/workspace/chats - List chats"""
        try:
            print("📋 TESTING LIST CHATS...")
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/chats",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Chats", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                self.log_result(
                    "List Chats", 
                    True, 
                    f"Retrieved {len(data)} chats successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Chats", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Chats", False, f"Exception: {str(e)}")
            return False

    def test_send_chat_message(self):
        """Test POST /api/workspace/chats/{chat_id}/messages - Send message"""
        try:
            print("💬 TESTING SEND CHAT MESSAGE...")
            
            if not self.test_chat_id:
                self.log_result(
                    "Send Chat Message", 
                    False, 
                    "No test chat ID available"
                )
                return False
            
            message_data = {
                "content_type": "text",
                "payload": "This is a test chat message sent via API testing"
            }
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/chats/{self.test_chat_id}/messages",
                json=message_data,
                timeout=30
            )
            
            if response.status_code in [200, 201]:
                data = response.json()
                
                # Verify response structure
                required_fields = ["message_id", "chat_id", "sender_id", "content_type", "payload"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result(
                        "Send Chat Message", 
                        False, 
                        f"Missing required fields: {missing_fields}",
                        data
                    )
                    return False
                
                # Verify message_id format
                message_id = data.get("message_id", "")
                if not message_id.startswith("MSG-"):
                    self.log_result(
                        "Send Chat Message", 
                        False, 
                        f"Invalid message_id format: {message_id}. Expected MSG-XXX",
                        data
                    )
                    return False
                
                self.log_result(
                    "Send Chat Message", 
                    True, 
                    f"Chat message sent successfully with ID: {message_id}"
                )
                return True
                
            else:
                self.log_result(
                    "Send Chat Message", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Send Chat Message", False, f"Exception: {str(e)}")
            return False

    def test_get_chat_messages(self):
        """Test GET /api/workspace/chats/{chat_id}/messages - Get messages"""
        try:
            print("📨 TESTING GET CHAT MESSAGES...")
            
            if not self.test_chat_id:
                self.log_result(
                    "Get Chat Messages", 
                    False, 
                    "No test chat ID available"
                )
                return False
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/chats/{self.test_chat_id}/messages",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "Get Chat Messages", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                self.log_result(
                    "Get Chat Messages", 
                    True, 
                    f"Retrieved {len(data)} chat messages successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Get Chat Messages", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Get Chat Messages", False, f"Exception: {str(e)}")
            return False

    def test_list_notifications(self):
        """Test GET /api/workspace/notifications - List notifications"""
        try:
            print("🔔 TESTING LIST NOTIFICATIONS...")
            
            response = self.session.get(
                f"{BACKEND_URL}/workspace/notifications",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not isinstance(data, list):
                    self.log_result(
                        "List Notifications", 
                        False, 
                        "Response should be a list",
                        data
                    )
                    return False
                
                # Store first notification ID for testing
                if data and len(data) > 0:
                    self.test_notification_id = data[0].get("notification_id")
                
                self.log_result(
                    "List Notifications", 
                    True, 
                    f"Retrieved {len(data)} notifications successfully"
                )
                return True
                
            else:
                self.log_result(
                    "List Notifications", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("List Notifications", False, f"Exception: {str(e)}")
            return False

    def test_mark_notification_read(self):
        """Test POST /api/workspace/notifications/{notification_id}/read - Mark as read"""
        try:
            print("✅ TESTING MARK NOTIFICATION READ...")
            
            if not self.test_notification_id:
                self.log_result(
                    "Mark Notification Read", 
                    True, 
                    "No notifications available to mark as read (this is acceptable)"
                )
                return True
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/notifications/{self.test_notification_id}/read",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_result(
                        "Mark Notification Read", 
                        False, 
                        "Mark as read did not return success=True",
                        data
                    )
                    return False
                
                self.log_result(
                    "Mark Notification Read", 
                    True, 
                    f"Notification {self.test_notification_id} marked as read successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Mark Notification Read", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Mark Notification Read", False, f"Exception: {str(e)}")
            return False

    def test_mark_all_notifications_read(self):
        """Test POST /api/workspace/notifications/read-all - Mark all as read"""
        try:
            print("✅ TESTING MARK ALL NOTIFICATIONS READ...")
            
            response = self.session.post(
                f"{BACKEND_URL}/workspace/notifications/read-all",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_result(
                        "Mark All Notifications Read", 
                        False, 
                        "Mark all as read did not return success=True",
                        data
                    )
                    return False
                
                self.log_result(
                    "Mark All Notifications Read", 
                    True, 
                    "All notifications marked as read successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Mark All Notifications Read", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Mark All Notifications Read", False, f"Exception: {str(e)}")
            return False

    def test_delete_notification(self):
        """Test DELETE /api/workspace/notifications/{notification_id} - Delete notification"""
        try:
            print("🗑️ TESTING DELETE NOTIFICATION...")
            
            if not self.test_notification_id:
                self.log_result(
                    "Delete Notification", 
                    True, 
                    "No notifications available to delete (this is acceptable)"
                )
                return True
            
            response = self.session.delete(
                f"{BACKEND_URL}/workspace/notifications/{self.test_notification_id}",
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if not data.get("success"):
                    self.log_result(
                        "Delete Notification", 
                        False, 
                        "Delete notification did not return success=True",
                        data
                    )
                    return False
                
                self.log_result(
                    "Delete Notification", 
                    True, 
                    f"Notification {self.test_notification_id} deleted successfully"
                )
                return True
                
            else:
                self.log_result(
                    "Delete Notification", 
                    False, 
                    f"HTTP {response.status_code}",
                    response.text
                )
                return False
                
        except Exception as e:
            self.log_result("Delete Notification", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 STARTING WORKSPACE LAYER 5-MODULE API TESTING")
        print("=" * 70)
        
        # Authentication is required for all tests
        if not self.authenticate():
            print("❌ Authentication failed. Cannot proceed with tests.")
            return False
        
        # Run all tests in logical order
        tests = [
            # Setup
            self.test_seed_workspace_data,
            self.test_workspace_stats,
            
            # Tasks Module
            self.test_create_task,
            self.test_list_tasks,
            self.test_complete_task,
            
            # Approvals Module
            self.test_create_approval,
            self.test_list_approvals,
            self.test_decide_approval,
            
            # Channels Module
            self.test_create_channel,
            self.test_list_channels,
            self.test_send_channel_message,
            self.test_get_channel_messages,
            
            # Chats Module
            self.test_create_chat,
            self.test_list_chats,
            self.test_send_chat_message,
            self.test_get_chat_messages,
            
            # Notifications Module
            self.test_list_notifications,
            self.test_mark_notification_read,
            self.test_mark_all_notifications_read,
            self.test_delete_notification,
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            if test():
                passed += 1
            time.sleep(1)  # Brief pause between tests
        
        # Print summary
        print("=" * 70)
        print("📊 TEST SUMMARY")
        print("=" * 70)
        
        for result in self.results:
            print(f"{result['status']}: {result['test']}")
            if result['details']:
                print(f"   {result['details']}")
        
        print(f"\n🎯 OVERALL RESULT: {passed}/{total} tests passed")
        
        if passed == total:
            print("✅ ALL TESTS PASSED - Workspace Layer APIs are working correctly!")
            return True
        else:
            print(f"❌ {total - passed} TESTS FAILED - Issues need to be addressed")
            return False

def main():
    """Main function"""
    tester = WorkspaceAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()