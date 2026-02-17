# Multi-Device Real-Time Testing Guide

## 🎯 Overview
This guide will help you test IB Chat with 5 different laptops/devices simultaneously to verify real-time messaging, audio calls, and video calls.

---

## ✅ All Users Ready for Multi-Device Testing

All 18 users can now login from different laptops. Password for ALL users: **Demo1234**

### Recommended 5 Users for Testing

1. **Sarah Johnson** (CEO)
   - Email: `sarah.johnson@innovatebooks.com`
   - Password: `Demo1234`

2. **Michael Chen** (CTO)
   - Email: `michael.chen@innovatebooks.com`
   - Password: `Demo1234`

3. **David Wilson** (Senior Developer)
   - Email: `david.wilson@innovatebooks.com`
   - Password: `Demo1234`

4. **Emily Davis** (UX Designer)
   - Email: `emily.davis@innovatebooks.com`
   - Password: `Demo1234`

5. **James Brown** (Marketing Manager)
   - Email: `james.brown@innovatebooks.com`
   - Password: `Demo1234`

---

## 🖥️ Setup Instructions

### For Each Laptop/Device:

1. **Open Browser**
   - Recommended: Chrome or Edge (best WebRTC support)
   - Open: `https://saas-finint.preview.emergentagent.com` (or your deployment URL)

2. **Login with Different User**
   - Laptop 1: Sarah Johnson
   - Laptop 2: Michael Chen
   - Laptop 3: David Wilson
   - Laptop 4: Emily Davis
   - Laptop 5: James Brown

3. **Navigate to IB Chat**
   - After login, click **"IB Chat"** in top navigation
   - Or go directly to `/workspace/chat`

4. **Grant Permissions**
   - Browser will ask for microphone access (for audio calls)
   - Browser will ask for camera access (for video calls)
   - Click **"Allow"** for both

---

## 🧪 Test Scenarios

### Test 1: Real-Time Messaging in Channels

**Goal:** Verify messages appear instantly across all devices

**Steps:**
1. All 5 users go to IB Chat
2. All users should see **#general** channel in left sidebar
3. User 1 (Sarah) clicks **#general**
4. Sarah types: "Hello everyone! Testing real-time chat"
5. Press Enter

**Expected Result:**
- ✅ All 4 other users see Sarah's message appear instantly
- ✅ Message shows Sarah's name and avatar
- ✅ Timestamp is correct

**Repeat:**
- Each user sends a message
- Verify all users see all messages in real-time

---

### Test 2: Direct Messages (1-on-1)

**Goal:** Verify private DMs work across devices

**Steps:**
1. User 1 (Sarah) clicks **+** button next to "Direct Messages"
2. Modal opens showing all users
3. Sarah clicks on **Michael Chen**
4. New DM conversation opens
5. Sarah types: "Hi Michael, testing DM"
6. Press Enter

**On Michael's Laptop:**
- ✅ New DM appears in left sidebar under "Direct Messages"
- ✅ Notification badge shows (if implemented)
- ✅ Click on DM to open
- ✅ See Sarah's message

**Both users reply back and forth:**
- ✅ Messages appear instantly
- ✅ Only visible to Sarah and Michael (not other users)

---

### Test 3: Emoji Reactions

**Goal:** Verify reactions appear in real-time

**Steps:**
1. User 1 sends message in #general: "React to this message!"
2. User 2 hovers over the message
3. Clicks the **Smile icon** (emoji button)
4. Selects an emoji (e.g., 👍)

**Expected Result:**
- ✅ Emoji appears under message on User 2's screen
- ✅ All other users see the emoji appear instantly
- ✅ Count shows "1"
- ✅ Other users can add same emoji (count increases)

---

### Test 4: File Sharing

**Goal:** Verify file upload/download works

**Steps:**
1. User 1 (Sarah) in #general channel
2. Click **paperclip icon** or drag & drop a file
3. Select an image file (e.g., screenshot.png)
4. File uploads with progress bar
5. Message sent with file attachment

**On Other Users' Devices:**
- ✅ See file message appear
- ✅ See image preview (if image)
- ✅ Click to view full size
- ✅ Click download icon to download

---

### Test 5: Audio Call (1-on-1)

**Goal:** Verify audio-only calling works

**⚠️ Important:** Only works in Direct Messages (not channels)

**Steps:**
1. User 1 (Sarah) opens DM with User 2 (Michael)
2. Sarah clicks **Phone icon** (top-right)
3. Call starts ringing

**On Michael's Laptop:**
- ✅ Incoming call modal appears
- ✅ Shows "Sarah Johnson" calling
- ✅ Shows "Audio Call"
- ✅ Two buttons: "Decline" and "Answer"
4. Michael clicks **"Answer"**

**Expected Result:**
- ✅ Call connects
- ✅ Both users hear each other clearly
- ✅ Audio quality is good
- ✅ Mute button works (test by clicking mic icon)
- ✅ End call button works (hangs up for both)

---

### Test 6: Video Call (1-on-1)

**Goal:** Verify video calling with camera works

**⚠️ Important:** Only works in Direct Messages

**Steps:**
1. User 1 (Emily) opens DM with User 3 (David)
2. Emily clicks **Video icon** (top-right)
3. Call starts, Emily's camera turns on

**On David's Laptop:**
- ✅ Incoming call modal appears
- ✅ Shows "Emily Davis" calling
- ✅ Shows "Video Call"
4. David clicks **"Answer"**
5. David's camera turns on

**Expected Result:**
- ✅ Both users see each other's video
- ✅ Large video: remote person
- ✅ Small video (bottom-right): yourself (picture-in-picture)
- ✅ Both users hear each other
- ✅ Mute audio button works
- ✅ Mute video button works (camera off)
- ✅ End call works

---

### Test 7: User Presence & Typing Indicators

**Goal:** Verify real-time presence updates

**User Presence:**
1. User 1 logs out
2. **Expected:** Other users see User 1 go offline
3. User 1 logs back in
4. **Expected:** Other users see User 1 go online

**Typing Indicators:**
1. User 1 starts typing in a DM
2. **Expected:** User 2 sees "User 1 is typing..."
3. User 1 stops typing
4. **Expected:** Typing indicator disappears

---

### Test 8: Message Threading

**Goal:** Verify threaded conversations

**Steps:**
1. User 1 sends message in #general: "What do you think about the project?"
2. User 2 hovers over message
3. Clicks **Thread icon** (# symbol)
4. Thread panel opens on right
5. User 2 types reply in thread
6. Other users see thread count indicator on original message

---

### Test 9: Message Pinning & Starring

**Pinning (Channel-wide):**
1. User 1 hovers over important message
2. Clicks **Pin icon**
3. **Expected:** All users see message is pinned
4. Click "Pinned Messages" to view all

**Starring (Personal):**
1. User 2 hovers over message
2. Clicks **Star icon**
3. **Expected:** Message saved for User 2 only
4. Click "Starred Messages" in settings to view

---

## 🐛 Troubleshooting

### Issue: User Can't Login
- **Check:** Email is exactly correct
- **Check:** Password is `Demo1234` (case-sensitive)
- **Try:** Clear browser cache and try again

### Issue: Messages Not Appearing
- **Check:** Both users in same channel
- **Check:** WebSocket connected (check browser console)
- **Try:** Refresh page

### Issue: Audio/Video Call Not Working
- **Check:** Browser permissions granted for mic/camera
- **Check:** Using Chrome or Edge (best WebRTC support)
- **Check:** Both users in a Direct Message (not channel)
- **Check:** Firewall not blocking WebRTC
- **Try:** Test with local network first

### Issue: "No Active Tenant Found"
- **Fixed:** All users now have tenant assigned
- **If still occurs:** Contact admin

---

## 📊 Success Criteria

### ✅ Real-Time Messaging
- [ ] Messages appear instantly (< 1 second delay)
- [ ] All users see same messages
- [ ] Order is consistent across devices

### ✅ Direct Messages
- [ ] Can create DM with any user
- [ ] Private (only 2 users see messages)
- [ ] Works in real-time

### ✅ Audio Calls
- [ ] Incoming call notification works
- [ ] Can answer/reject calls
- [ ] Audio quality is clear
- [ ] Mute/unmute works
- [ ] Hang up works for both parties

### ✅ Video Calls
- [ ] Both cameras work
- [ ] Video quality is acceptable
- [ ] Audio synced with video
- [ ] Can toggle video on/off
- [ ] Picture-in-picture works

### ✅ File Sharing
- [ ] Can upload files
- [ ] Progress indicator shows
- [ ] All users can see/download
- [ ] Images show preview

### ✅ Reactions & Interactions
- [ ] Emoji reactions work
- [ ] Appear in real-time
- [ ] Multiple users can react

---

## 🎥 Recording Tip

For demonstration purposes:
1. Use screen recording software (OBS, QuickTime, etc.)
2. Record all 5 laptops simultaneously
3. Show split-screen of all devices
4. Demonstrate real-time sync

---

## 🔒 Security Notes

- All communication is encrypted (HTTPS)
- WebRTC uses peer-to-peer encryption
- Each user has their own session
- Passwords are hashed in database

---

## 📝 Additional Users Available

If you need more than 5 users for testing:

6. Lisa Anderson (HR Manager) - `lisa.anderson@innovatebooks.com`
7. Robert Martin (Sales Director) - `robert.martin@innovatebooks.com`
8. Amanda Garcia (Operations Manager) - `amanda.garcia@innovatebooks.com`
9. Thomas Lee (Finance Analyst) - `thomas.lee@innovatebooks.com`
10. Sophia Rodriguez (Customer Success) - `sophia.rodriguez@innovatebooks.com`
11. Daniel Kim (DevOps Engineer) - `daniel.kim@innovatebooks.com`
12. Olivia Taylor (Content Strategist) - `olivia.taylor@innovatebooks.com`

All use password: **Demo1234**

---

**Status:** ✅ All users ready for multi-device testing
**Last Updated:** November 24, 2025
**Tested:** Login verified for all users
