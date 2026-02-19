# User Management System - Complete Guide

## 🎯 Overview

You now have a complete user management system in the Settings page where you can view, add, edit, and delete users.

---

## 📊 Current Users in System (18 Total)

All users can login with password: **Demo1234**

### Leadership Team

1. **Sarah Johnson** - CEO - `sarah.johnson@innovatebooks.com`
2. **Michael Chen** - CTO - `michael.chen@innovatebooks.com`
3. **Demo User** - CFO - `demo@innovatebooks.com`

### Sales Team

4. **Robert Martin** - Sales Director - `robert.martin@innovatebooks.com`
5. **Rajesh Kumar** - Sales Manager - `rajesh.kumar@innovatebooks.com`
6. **Priya Sharma** - Sales Executive - `priya.sharma@innovatebooks.com`
7. **Neha Singh** - Sales Executive - `neha.singh@innovatebooks.com`
8. **Amit Patel** - Account Manager - `amit.patel@innovatebooks.com`

### Development & Operations

9. **David Wilson** - Senior Developer - `david.wilson@innovatebooks.com`
10. **Daniel Kim** - DevOps Engineer - `daniel.kim@innovatebooks.com`
11. **Amanda Garcia** - Operations Manager - `amanda.garcia@innovatebooks.com`

### Design & Marketing

12. **Emily Davis** - UX Designer - `emily.davis@innovatebooks.com`
13. **Olivia Taylor** - Content Strategist - `olivia.taylor@innovatebooks.com`
14. **James Brown** - Marketing Manager - `james.brown@innovatebooks.com`

### Customer Success & Support

15. **Sophia Rodriguez** - Customer Success Manager - `sophia.rodriguez@innovatebooks.com`

### Finance & HR

16. **Thomas Lee** - Finance Analyst - `thomas.lee@innovatebooks.com`
17. **Lisa Anderson** - HR Manager - `lisa.anderson@innovatebooks.com`

### Other

18. **Sales Team** - Team Account - `sales@innovatebooks.com`

---

## 🔧 How to Access User Management

### Step 1: Login

- Go to: `http://localhost:3000/auth/login`
- Use: `demo@innovatebooks.com` / `Demo1234`

### Step 2: Open Settings

1. Look at the **bottom-left** of the screen
2. Click on your **profile icon/avatar**
3. Click **"Settings"** from the dropdown

### Step 3: Navigate to Users Tab

1. In the Settings sidebar, click **"Users"** tab
2. You'll see a beautiful table with all 18 users

---

## ✨ Features Available

### 1. View All Users

- See complete list in a table format
- Each user shows:
  - Avatar (first letter of name)
  - Full Name
  - Email
  - Role/Title
  - Status (Active/Inactive)
- Total user count displayed

### 2. Add New User

**Steps:**

1. Click **"Add User"** button (top-right)
2. Fill in the form:
   - **Full Name**: e.g., "John Smith"
   - **Email**: e.g., "john.smith@innovatebooks.com"
   - **Password**: Choose a secure password
   - **Role**: e.g., "Product Manager", "Developer", "Designer"
   - **Status**: Active or Inactive
3. Click **"Create User"**

**What Happens:**

- User is created in database
- Automatically added to all public channels (#general, #random, etc.)
- Available immediately in IB Chat for DMs
- Can login with provided credentials

### 3. Edit User (Coming Soon)

- Click edit icon next to user
- Update name, role, or status
- Changes saved to database

### 4. Delete User

**Steps:**

1. Click delete icon (red) next to user
2. Confirm deletion in popup
3. User removed from system

**Note:** You cannot delete your own account (safety feature)

---

## 🔌 API Endpoints

### GET /api/users/list

Get all users in the system

```bash
curl -X GET "http://localhost:8001/api/users/list" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### POST /api/users/create

Create a new user

```bash
curl -X POST "http://localhost:8001/api/users/create" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "new.user@innovatebooks.com",
    "full_name": "New User",
    "password": "SecurePassword123",
    "role": "Developer",
    "status": "active"
  }'
```

### PUT /api/users/{user_id}

Update user information

```bash
curl -X PUT "http://localhost:8001/api/users/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Updated Name",
    "role": "Senior Developer"
  }'
```

### DELETE /api/users/{user_id}

Delete a user

```bash
curl -X DELETE "http://localhost:8001/api/users/USER_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🧪 Testing the System

### Test 1: View Users

1. Login as demo@innovatebooks.com
2. Go to Settings → Users
3. You should see all 18 users listed

### Test 2: Add a New User

1. Click "Add User"
2. Create user:
   - Name: "Test User"
   - Email: "test.user@innovatebooks.com"
   - Password: "Test1234"
   - Role: "Test Engineer"
   - Status: Active
3. Verify user appears in the list

### Test 3: Test in IB Chat

1. Go to IB Chat (`/workspace/chat`)
2. Click + next to "Direct Messages"
3. Search for your newly created user
4. Verify they appear in search results

### Test 4: Login as New User

1. Logout
2. Login with new user credentials
3. Verify access to workspace and chat
4. Verify user can see all public channels

---

## 🎨 UI Design

The user management interface features:

- **Clean table layout** with alternating row colors on hover
- **Avatar circles** with first letter of user name
- **Color-coded status badges**: Green for Active, Red for Inactive
- **Role tags** with blue background
- **Action buttons** with hover effects
- **Modal form** for adding users with smooth transitions
- **Consistent brand colors** (#033F99)

---

## 🔒 Security Features

1. **Authentication Required**: Must be logged in to access
2. **Self-Protection**: Cannot delete your own account
3. **Password Hashing**: All passwords are bcrypt hashed
4. **Email Validation**: Prevents duplicate emails
5. **Auto-Channel Addition**: New users added to public channels only

---

## 📝 Notes

- All users with @innovatebooks.com domain are included
- Users are automatically added to all public channels
- Private channels require manual member addition
- User deletion removes them from all channels
- Changes are reflected immediately in the UI
- All operations logged for audit trail

---

## 🐛 Troubleshooting

**Issue: Can't see Users tab**

- Solution: Make sure you're logged in and in Settings page

**Issue: "Add User" button doesn't work**

- Solution: Check browser console for errors
- Verify backend is running: `sudo supervisorctl status backend`

**Issue: Users list is empty**

- Solution: Check API endpoint: `curl http://localhost:8001/api/users/list -H "Authorization: Bearer TOKEN"`

**Issue: Can't create user**

- Solution: Verify all required fields are filled
- Check email is unique (not already in system)

---

## 🚀 Future Enhancements

- Bulk user import (CSV)
- User role permissions
- Activity tracking
- Password reset functionality
- Profile picture upload
- Advanced search and filters
- User groups/teams
- Export user list

---

**Last Updated:** November 24, 2025
**Version:** 1.0
**Status:** ✅ Fully Functional
