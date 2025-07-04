## Proposal: project management service

### 📦 Service responsibilities:

> **users-service** (Python): Authentication & user management ✅ _Done_  
> **projects-service** (Node.js): Workspaces, projects, member management  
> **tasks-service** (Node.js): Tasks, comments, detailed work

---

### 🎯 **Updated Service Boundaries**

```
┌─────────────────┐
│   users-service │    Authentication & User Management
│   (Python)      │
│ • User profiles │
│ • Authentication│
│ • JWT tokens    │
└─────────────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│projects-service │    Project Organization & Access
│   (Node.js)     │
│ • Workspaces    │
│ • Projects      │
│ • Members       │
└─────────────────┘
         │
         │ HTTP/REST
         ▼
┌─────────────────┐
│  tasks-service  │    Task Management & Collaboration
│   (Node.js)     │
│ • Tasks         │
│ • Comments      │
│   │
└─────────────────┘
```

---

### 🎯 **Core Entities & Relationships**

```
User (users-service)
│
├── Workspace (projects-service) - User owns many workspaces
│   │
│   ├── Project (projects-service) - Workspace has many projects
│   │   │
│   │   └── WorkspaceMember (projects-service) - N:N relationship
│   │
│   └── Task (tasks-service) - Project has many tasks
│       │
│       ├── Comment (tasks-service) - Task has many comments
```

### 🗄️ **Data Models by Service**

#### **Projects Service** (Workspaces & Projects)

```typescript
// Workspace - Top level container
interface Workspace {
  id: string;
  name: string;
  description?: string;
  owner_id: number; // User from users-service
  created_at: string;
}

// Project - Belongs to workspace
interface Project {
  id: string;
  workspace_id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived';
  created_at: string;
}

// Workspace members
interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: number; // User from users-service
  role: 'admin' | 'member';
  joined_at: string;
}
```

#### **Tasks Service** (Tasks & Collaboration)

```typescript
// Task - References project from projects-service
interface Task {
  id: string;
  project_id: string; // References projects-service
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assigned_to?: number; // User from users-service
  due_date?: string;
  created_at: string;
}

// Comments on tasks
interface TaskComment {
  id: string;
  task_id: string;
  user_id: number; // User from users-service
  content: string;
  created_at: string;
}
```

### 🔗 Inter-service communication

#### **Projects Service** needs:

- `users-service`: Validate users, get user details for members
- No dependency on tasks-service

#### **Tasks Service** needs:

- `users-service`: Validate users, get user details for assignments/comments
- `projects-service`: Validate project exists, get project details

#### **Communication Flow:**

```typescript
// User creates task
1. POST /tasks → tasks-service
2. tasks-service → GET /projects/{id} → projects-service (validate project)
3. tasks-service → GET /users/{id} → users-service (validate user)
4. Create task if all valid
```

---

### 🎯 **Service Features:**

#### **Projects Service:**

✅ **Workspaces** - Team organization  
✅ **Projects** - Work containers  
✅ **Member management** - Access control  
✅ **Project metadata** - Status, descriptions

#### **Tasks Service:**

✅ **Tasks** - Individual work items  
✅ **Comments** - Task discussions  
✅ **Assignments** - User task assignments  
✅ **Status tracking** - Todo/In Progress/Done

### 🚀 **API Examples**

#### **Projects Service APIs:**

```typescript
// Create workspace
POST /api/workspaces
{
  "name": "My Company",
  "description": "Main workspace"
}

// Create project in workspace
POST /api/workspaces/:workspaceId/projects
{
  "name": "Website Redesign",
  "description": "Q3 2025 redesign project"
}

// Add member to workspace
POST /api/workspaces/:workspaceId/members
{
  "user_id": 123,
  "role": "member"
}
```

#### **Tasks Service APIs:**

```typescript
// Create task in project
POST /api/tasks
{
  "project_id": "proj_123",
  "title": "Design homepage mockup",
  "description": "Create initial design concepts",
  "assigned_to": 123,
  "priority": "high",
  "due_date": "2025-07-15"
}

// Add comment to task
POST /api/tasks/:taskId/comments
{
  "content": "Looks great! Just need to adjust the header spacing."
}

```

---

## 🏗️ **3-Service Architecture**

### 📦 **High-Level Service Communication**

```
┌─────────────────┐
│   users-service │    Authentication & User Data
│   (Python)      │
└─────────────────┘
         ▲
         │ HTTP/REST
         │
┌─────────────────┐    ┌─────────────────┐
│projects-service │◄──►│  tasks-service  │
│   (Node.js)     │    │   (Node.js)     │
│                 │    │                 │
│ • Workspaces    │    │ • Tasks         │
│ • Projects      │    │ • Comments      │
│ • Members       │    │    │
└─────────────────┘    └─────────────────┘
```
