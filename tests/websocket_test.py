#!/usr/bin/env python3
"""
Simple WebSocket connectivity test for IB Chat
"""

import asyncio
import websockets
import json

async def test_websocket():
    """Test WebSocket connection"""
    try:
        # Test WebSocket connection
        ws_url = "wss://finiq-chat.preview.emergentagent.com/api/chat/ws/test-user-123"
        
        print(f"Attempting to connect to: {ws_url}")
        
        async with websockets.connect(ws_url) as websocket:
            print("✅ WebSocket connection established successfully!")
            
            # Send a test message
            test_message = {
                "type": "join_channel",
                "channel_id": "test-channel"
            }
            
            await websocket.send(json.dumps(test_message))
            print("✅ Test message sent successfully!")
            
            # Try to receive a response (with timeout)
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=3.0)
                print(f"✅ Received response: {response}")
            except asyncio.TimeoutError:
                print("ℹ️  No immediate response (this is normal)")
                
    except websockets.exceptions.WebSocketException as e:
        print(f"❌ WebSocket connection failed: {e}")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())