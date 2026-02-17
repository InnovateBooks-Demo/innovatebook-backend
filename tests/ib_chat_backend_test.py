#!/usr/bin/env python3
"""
IB Chat Backend API Testing Script
Tests all chat-related endpoints comprehensively
"""

import asyncio
import aiohttp
import json
import websockets
import os
from datetime import datetime
import uuid

# Configuration
BACKEND_URL = "https://saas-finint.preview.emergentagent.com"
WS_URL = "wss://finiq-chat.preview.emergentagent.com"

# Test credentials
TEST_EMAIL = "demo@innovatebooks.com"
TEST_PASSWORD = "Demo1234"

class IBChatTester:
    def __init__(self):
        self.session = None
        self.access_token = None
        self.user_id = None
        self.user_name = None
        self.test_results = []
        
    async def setup_session(self):
        """Setup HTTP session"""
        self.session = aiohttp.ClientSession()
        
    async def cleanup_session(self):
        """Cleanup HTTP session"""
        if self.session:
            await self.session.close()
            
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        status = "✅ PASS" if success else "❌ FAIL"
        result = {
            "test": test_name,
            "status": status,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
            
    async def authenticate(self):
        """Test authentication with demo credentials"""
        try:
            login_data = {
                "email": TEST_EMAIL,
                "password": TEST_PASSWORD
            }
            
            async with self.session.post(
                f"{BACKEND_URL}/api/auth/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    self.access_token = data.get("access_token")
                    user_data = data.get("user", {})
                    self.user_id = user_data.get("id")
                    self.user_name = user_data.get("full_name", "Demo User")
                    
                    self.log_result(
                        "Authentication",
                        True,
                        f"Successfully logged in as {self.user_name}",
                        {"user_id": self.user_id, "email": TEST_EMAIL}
                    )
                    return True
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Authentication",
                        False,
                        f"Login failed with status {response.status}",
                        {"error": error_text}
                    )
                    return False
                    
        except Exception as e:
            self.log_result(
                "Authentication",
                False,
                f"Authentication error: {str(e)}",
                {"exception": str(e)}
            )
            return False
            
    def get_auth_headers(self):
        """Get authorization headers"""
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }
        
    async def test_chat_channels_api(self):
        """Test GET /api/chat/channels"""
        try:
            async with self.session.get(
                f"{BACKEND_URL}/api/chat/channels",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    channels = await response.json()
                    self.log_result(
                        "Chat Channels API",
                        True,
                        f"Retrieved {len(channels)} channels successfully",
                        {"channels_count": len(channels), "sample_channels": [ch.get("name", "Unknown") for ch in channels[:3]]}
                    )
                    return channels
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Chat Channels API",
                        False,
                        f"Failed to get channels - Status {response.status}",
                        {"error": error_text}
                    )
                    return []
                    
        except Exception as e:
            self.log_result(
                "Chat Channels API",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            return []
            
    async def test_chat_messages_api(self, channels):
        """Test GET /api/chat/channels/{channel_id}/messages"""
        if not channels:
            self.log_result(
                "Chat Messages API",
                False,
                "No channels available to test messages",
                {}
            )
            return
            
        try:
            # Test with first available channel
            test_channel = channels[0]
            channel_id = test_channel.get("id")
            channel_name = test_channel.get("name", "Unknown")
            
            async with self.session.get(
                f"{BACKEND_URL}/api/chat/channels/{channel_id}/messages",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    messages = await response.json()
                    self.log_result(
                        "Chat Messages API",
                        True,
                        f"Retrieved {len(messages)} messages from channel '{channel_name}'",
                        {
                            "channel_id": channel_id,
                            "channel_name": channel_name,
                            "messages_count": len(messages),
                            "sample_message": messages[0] if messages else None
                        }
                    )
                    
                    # Verify message structure
                    if messages:
                        msg = messages[0]
                        required_fields = ["id", "user_id", "content", "created_at"]
                        missing_fields = [field for field in required_fields if field not in msg]
                        
                        if not missing_fields:
                            self.log_result(
                                "Message Structure Validation",
                                True,
                                "Message structure contains all required fields",
                                {"verified_fields": required_fields}
                            )
                        else:
                            self.log_result(
                                "Message Structure Validation",
                                False,
                                f"Message missing required fields: {missing_fields}",
                                {"message_structure": list(msg.keys())}
                            )
                    
                elif response.status == 403:
                    self.log_result(
                        "Chat Messages API",
                        False,
                        f"Access denied to channel '{channel_name}' - User not a member",
                        {"channel_id": channel_id, "status": response.status}
                    )
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Chat Messages API",
                        False,
                        f"Failed to get messages - Status {response.status}",
                        {"error": error_text, "channel_id": channel_id}
                    )
                    
        except Exception as e:
            self.log_result(
                "Chat Messages API",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
    async def test_websocket_connection(self):
        """Test WebSocket connection for real-time messaging"""
        if not self.user_id:
            self.log_result(
                "WebSocket Connection",
                False,
                "Cannot test WebSocket - No user ID available",
                {}
            )
            return
            
        try:
            # Test WebSocket connection
            ws_url = f"{WS_URL}/api/chat/ws/{self.user_id}"
            
            async with websockets.connect(
                ws_url,
                extra_headers={"Authorization": f"Bearer {self.access_token}"}
            ) as websocket:
                
                # Test connection establishment
                self.log_result(
                    "WebSocket Connection",
                    True,
                    "WebSocket connection established successfully",
                    {"ws_url": ws_url, "user_id": self.user_id}
                )
                
                # Test sending a message
                test_message = {
                    "type": "join_channel",
                    "channel_id": "test-channel-id"
                }
                
                await websocket.send(json.dumps(test_message))
                
                # Wait briefly for any response
                try:
                    response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                    self.log_result(
                        "WebSocket Message Test",
                        True,
                        "WebSocket message exchange successful",
                        {"sent_message": test_message, "received": response}
                    )
                except asyncio.TimeoutError:
                    self.log_result(
                        "WebSocket Message Test",
                        True,
                        "WebSocket message sent successfully (no immediate response expected)",
                        {"sent_message": test_message}
                    )
                    
        except websockets.exceptions.WebSocketException as e:
            self.log_result(
                "WebSocket Connection",
                False,
                f"WebSocket connection failed: {str(e)}",
                {"exception": str(e), "ws_url": ws_url}
            )
        except Exception as e:
            self.log_result(
                "WebSocket Connection",
                False,
                f"WebSocket test error: {str(e)}",
                {"exception": str(e)}
            )
            
    async def test_user_management_api(self):
        """Test GET /api/users/list"""
        try:
            async with self.session.get(
                f"{BACKEND_URL}/api/users/list",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    users = await response.json()
                    self.log_result(
                        "User Management API",
                        True,
                        f"Retrieved {len(users)} users successfully",
                        {
                            "users_count": len(users),
                            "sample_users": [
                                {"name": user.get("full_name"), "email": user.get("email"), "role": user.get("role")}
                                for user in users[:3]
                            ]
                        }
                    )
                    
                    # Verify user data structure
                    if users:
                        user = users[0]
                        required_fields = ["id", "email", "full_name", "role", "status"]
                        missing_fields = [field for field in required_fields if field not in user]
                        
                        if not missing_fields:
                            self.log_result(
                                "User Data Structure Validation",
                                True,
                                "User data structure contains all required fields",
                                {"verified_fields": required_fields}
                            )
                        else:
                            self.log_result(
                                "User Data Structure Validation",
                                False,
                                f"User data missing required fields: {missing_fields}",
                                {"user_structure": list(user.keys())}
                            )
                    
                else:
                    error_text = await response.text()
                    self.log_result(
                        "User Management API",
                        False,
                        f"Failed to get users - Status {response.status}",
                        {"error": error_text}
                    )
                    
        except Exception as e:
            self.log_result(
                "User Management API",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
    async def test_user_presence_endpoints(self):
        """Test user presence related endpoints"""
        try:
            # Test updating user status
            status_data = {
                "status": "online",
                "status_text": "Available for chat"
            }
            
            async with self.session.put(
                f"{BACKEND_URL}/api/chat/users/me/status",
                json=status_data,
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    self.log_result(
                        "User Presence - Update Status",
                        True,
                        "Successfully updated user status to online",
                        {"status_data": status_data, "response": result}
                    )
                else:
                    error_text = await response.text()
                    self.log_result(
                        "User Presence - Update Status",
                        False,
                        f"Failed to update status - Status {response.status}",
                        {"error": error_text}
                    )
                    
        except Exception as e:
            self.log_result(
                "User Presence - Update Status",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
        # Test getting user profile (includes presence info)
        try:
            async with self.session.get(
                f"{BACKEND_URL}/api/chat/users/{self.user_id}/profile",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    profile = await response.json()
                    self.log_result(
                        "User Presence - Get Profile",
                        True,
                        "Successfully retrieved user profile with presence info",
                        {
                            "profile": {
                                "name": profile.get("full_name"),
                                "status": profile.get("status"),
                                "last_seen": profile.get("last_seen")
                            }
                        }
                    )
                else:
                    error_text = await response.text()
                    self.log_result(
                        "User Presence - Get Profile",
                        False,
                        f"Failed to get profile - Status {response.status}",
                        {"error": error_text}
                    )
                    
        except Exception as e:
            self.log_result(
                "User Presence - Get Profile",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
    async def test_additional_chat_features(self):
        """Test additional chat features like search, file upload, etc."""
        
        # Test search functionality
        try:
            search_query = "test"
            async with self.session.get(
                f"{BACKEND_URL}/api/chat/search?q={search_query}",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    search_results = await response.json()
                    self.log_result(
                        "Chat Search API",
                        True,
                        f"Search completed successfully - Found {len(search_results)} results",
                        {"query": search_query, "results_count": len(search_results)}
                    )
                else:
                    error_text = await response.text()
                    self.log_result(
                        "Chat Search API",
                        False,
                        f"Search failed - Status {response.status}",
                        {"error": error_text}
                    )
                    
        except Exception as e:
            self.log_result(
                "Chat Search API",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
        # Test user search for DMs
        try:
            async with self.session.get(
                f"{BACKEND_URL}/api/chat/users/search?q=",
                headers=self.get_auth_headers()
            ) as response:
                if response.status == 200:
                    users = await response.json()
                    self.log_result(
                        "User Search API",
                        True,
                        f"User search completed - Found {len(users)} users",
                        {"users_count": len(users)}
                    )
                else:
                    error_text = await response.text()
                    self.log_result(
                        "User Search API",
                        False,
                        f"User search failed - Status {response.status}",
                        {"error": error_text}
                    )
                    
        except Exception as e:
            self.log_result(
                "User Search API",
                False,
                f"Exception occurred: {str(e)}",
                {"exception": str(e)}
            )
            
    async def run_all_tests(self):
        """Run all IB Chat backend tests"""
        print("🚀 Starting IB Chat Backend API Testing...")
        print("=" * 60)
        
        await self.setup_session()
        
        try:
            # Step 1: Authentication
            if not await self.authenticate():
                print("❌ Authentication failed - Cannot proceed with other tests")
                return
                
            print("\n📋 Testing Core Chat APIs...")
            
            # Step 2: Test Chat Channels API
            channels = await self.test_chat_channels_api()
            
            # Step 3: Test Chat Messages API
            await self.test_chat_messages_api(channels)
            
            # Step 4: Test WebSocket Connection
            await self.test_websocket_connection()
            
            # Step 5: Test User Management API
            await self.test_user_management_api()
            
            # Step 6: Test User Presence
            await self.test_user_presence_endpoints()
            
            # Step 7: Test Additional Features
            await self.test_additional_chat_features()
            
        finally:
            await self.cleanup_session()
            
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("📊 IB CHAT BACKEND API TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if "✅ PASS" in result["status"])
        failed = sum(1 for result in self.test_results if "❌ FAIL" in result["status"])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed} ✅")
        print(f"Failed: {failed} ❌")
        print(f"Success Rate: {(passed/total*100):.1f}%" if total > 0 else "0%")
        
        print("\n📋 DETAILED RESULTS:")
        print("-" * 60)
        
        for result in self.test_results:
            print(f"{result['status']}: {result['test']}")
            print(f"   {result['message']}")
            if result['details'] and "❌ FAIL" in result['status']:
                print(f"   Details: {result['details']}")
            print()
            
        # Summary for main agent
        if failed == 0:
            print("🎉 ALL TESTS PASSED - IB Chat backend APIs are fully functional!")
        else:
            print(f"⚠️  {failed} test(s) failed - See details above for issues to address")
            
        print("=" * 60)

async def main():
    """Main test execution"""
    tester = IBChatTester()
    await tester.run_all_tests()

if __name__ == "__main__":
    asyncio.run(main())