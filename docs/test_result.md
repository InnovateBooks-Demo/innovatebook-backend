# Workspace Layer & Navigation Testing

## Test Scope
1. **Navigation System** - Top and left navigation with white highlighting
2. **Workspace 5 Modules** - Dashboard, Tasks, Approvals, Channels, Chats, Notifications
3. **Comprehensive Seed Data** - 20 employees, 100 Cr turnover

## Test Credentials
- URL: `/auth/login`
- Email: `demo@innovatebooks.com`
- Password: `Demo1234`

## Features to Test

### Navigation
1. **Left Sidebar**:
   - Workspace, Solutions, Reports buttons
   - White highlight when selected
   
2. **Top Navigation (Workspace Mode)**:
   - 6 modules: Dashboard, Tasks, Approvals, Channels, Chats, Notifications
   - White highlight on active module
   
3. **Top Navigation (Solutions Mode)**:
   - IB Commerce dropdown (white highlight when in solutions)
   - Module tabs: Parties, Catalog, Revenue, Procurement, Governance

### Workspace Modules
1. Dashboard (`/workspace`) - Stats, tasks, approvals, notifications
2. Tasks (`/workspace/tasks`) - Create, complete, filter tasks
3. Approvals (`/workspace/approvals`) - Review, approve/reject
4. Channels (`/workspace/channels`) - Create, send messages
5. Chats (`/workspace/chats`) - Context-bound conversations
6. Notifications (`/workspace/notifications`) - View, mark as read

### Seed Data
- 20 employees with roles
- 12 customers (enterprise)
- 8 vendors
- 12 catalog items
- Leads, deals, invoices, POs, transactions
