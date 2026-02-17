# IB Chat - User Accounts & Information

## 🎨 Color Scheme Updated

✅ **Primary Color:** #3A4E63 (Your brand blue)
✅ **Secondary Color:** #022D6E (Darker blue)
✅ All IB Chat components now use your brand colors

---

## 👥 Demo Users Created for IB Chat

All users below can login with password: **Demo1234**

### All Users in System (18 Total)

1. **Demo User** - Email: `demo@innovatebooks.com` - Role: CFO
2. **Sarah Johnson** - Email: `sarah.johnson@innovatebooks.com` - Role: CEO
3. **Michael Chen** - Email: `michael.chen@innovatebooks.com` - Role: CTO
4. **David Wilson** - Email: `david.wilson@innovatebooks.com` - Role: Senior Developer
5. **Emily Davis** - Email: `emily.davis@innovatebooks.com` - Role: UX Designer
6. **James Brown** - Email: `james.brown@innovatebooks.com` - Role: Marketing Manager
7. **Lisa Anderson** - Email: `lisa.anderson@innovatebooks.com` - Role: HR Manager
8. **Robert Martin** - Email: `robert.martin@innovatebooks.com` - Role: Sales Director
9. **Amanda Garcia** - Email: `amanda.garcia@innovatebooks.com` - Role: Operations Manager
10. **Thomas Lee** - Email: `thomas.lee@innovatebooks.com` - Role: Finance Analyst
11. **Sophia Rodriguez** - Email: `sophia.rodriguez@innovatebooks.com` - Role: Customer Success Manager
12. **Daniel Kim** - Email: `daniel.kim@innovatebooks.com` - Role: DevOps Engineer
13. **Olivia Taylor** - Email: `olivia.taylor@innovatebooks.com` - Role: Content Strategist

🔑 **Password for ALL users:** Demo1234

---

## 🎯 How to Test IB Chat

### Step 1: Login

1. Go to `http://localhost:3000/auth/login`
2. Use any of the emails above with password: **Demo1234**

### Step 2: Access Chat

1. Click on **"IB Chat"** button in the top navigation
2. Or navigate directly to `/workspace/chat`

### Step 3: Test Features

- **Create Channels:** Click + next to "Channels"
- **Create DMs:** Click + next to "Direct Messages" and search for users
- **Send Messages:** Type and press Enter
- **Upload Files:** Drag & drop or click paperclip icon
- **Make Calls:** In DMs, click phone or video icon
- **Pin Messages:** Hover over message, click pin icon
- **Star Messages:** Hover over message, click star icon
- **Start Threads:** Hover over message, click thread icon

### Step 4: Test Settings

1. Click your profile picture (bottom-left)
2. Click **"Settings"**
3. Update your profile information
4. Change notification preferences
5. Adjust appearance settings

---

## ✨ Complete Feature List

### Messaging

✅ Real-time WebSocket messaging
✅ Message editing & deletion
✅ Threaded conversations
✅ @mentions
✅ Reactions with emojis
✅ Message search

### Rich Media

✅ File upload (drag & drop)
✅ Image preview
✅ Video preview
✅ Document sharing
✅ Download files
✅ Upload progress indicators

### Channels

✅ Public channels
✅ Private channels
✅ Direct messages (1-on-1)
✅ Group DMs
✅ Channel search
✅ Channel management

### Advanced Features

✅ User presence (online/offline/away)
✅ Typing indicators
✅ Read receipts
✅ Message pinning
✅ Starred messages
✅ Notifications

### WebRTC Calls

✅ Audio calls
✅ Video calls
✅ Incoming call modal
✅ Call controls (mute audio, mute video)
✅ Picture-in-picture
✅ Full-screen interface

### Settings Page

✅ Profile management
✅ Notification preferences
✅ Security settings
✅ Appearance customization
✅ Privacy controls

---

## 🔧 Technical Details

### Frontend Routes

- `/workspace/chat` - IB Chat main interface
- `/workspace/settings` - Settings page

### Color Scheme

- Primary: #3A4E63
- Secondary: #022D6E
- All gradients updated to match brand

### Database Collections

- `channels` - Channel data
- `messages` - Message data
- `chat_files` - File metadata
- `user_presence` - User online status
- `read_receipts` - Message read tracking
- `pinned_messages` - Pinned messages
- `starred_messages` - Starred messages
- `chat_notifications` - Notifications
- `calls` - Call metadata

---

## 🚀 Quick Start Guide

1. **Login as any user** with Demo1234
2. **Create a DM** with another user (search by name/email)
3. **Send messages** and test reactions
4. **Upload a file** by dragging and dropping
5. **Make a call** from a DM (audio or video)
6. **Pin important messages** for quick access
7. **Star messages** to save them
8. **Open settings** to customize your profile

---

## 📝 Notes

- All users are added to the **#general** channel automatically
- Default channels created: #general, #random, #announcements
- WebRTC works best in Chrome/Edge browsers
- File uploads are stored in `/app/backend/uploads/chat/`
- All timestamps are in UTC and converted to local time in UI

---

**Status:** ✅ Complete and production-ready
**Last Updated:** November 24, 2025
