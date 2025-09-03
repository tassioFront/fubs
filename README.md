# FUBS - Project Management Microservices (studying repo)

Welcome to the FUBS project! This repository is designed to help you learn and practice microservices architecture using a monorepo approach with Nx. The project is structured to simulate a real-world application with multiple services, each responsible for different aspects of project management.

## 💼 Business Logic & Requirements

### Core Business Requirements

#### _1. User Management & Authentication_

- _Authentication_: JWT-based authentication handled by external Python service
- _User Identity_: Users are identified by UUID from the external users-service
- _Session Management_: Stateless JWT tokens for API authentication
- _User Roles_: System supports workspace-level roles (Owner, Admin, Member)

#### _2. Workspace Management_

- _Workspace Creation_: Users (role=Owner) can create workspaces to organize their projects
- _Ownership_: Each workspace has a single owner (creator)
- _Access Control_: Only workspace members can access workspace resources. Users (Owner and Admin) can manage workspace members and permissions, but only Owner can delete the workspace. Member has read-only access to workspace resources.
- _Membership_: Users (Owner and Admin) can be invited to workspaces with specific roles

#### _3. Project Organization_

- _Project Lifecycle_: Projects have states (Active, Completed, Archived)
- _Project Containment_: Projects belong to workspaces. Users (Owner and Admin) can manage project members and permissions. Member has read-only access to projects.
- _Access Control_: Only project members can access project resources. Users (Owner and Admin) can manage project members and permissions, including deletion. Member has read-only access to project resources.
- _Project Metadata_: Projects have names, descriptions, and status tracking

#### _4. Task Management_

- _Task Lifecycle_: Tasks progress through states (TODO, IN_PROGRESS, DONE)
- _Task Assignment_: Tasks can be assigned to users
- _Task Prioritization_: Tasks have priority levels (Low, Medium, High)
- _Task Deadlines_: Tasks can have due dates for time management
- _Task Collaboration_: Tasks support comments for team collaboration
- _Access Control_: Access to tasks is controlled by project membership. Any user with access to the project can manage tasks.

### 🔐 Security Requirements

#### _Authentication & Authorization_

- _JWT Validation_: All services must validate JWT tokens from users-service
- _User Context_: Extract user ID from JWT for all operations
- _Permission Checks_: Verify user has access to requested resources
- _Role-Based Access Control_: Users have different permissions based on their roles (Owner, Admin, Member)

#### _Data Access Control_

- _Workspace-based Access_: Users can only access workspaces they're members of
- _Project Inheritance_: Users can only access projects they're members of
- _Task Permissions_: Task access is controlled by project membership
- _Owner Privileges_: Workspace owners have full control over workspace and projects resources (including deletion)
- _Admin Privileges_: Workspace admins have full control over workspace resources (excluding deletion and creating workspaces) and can manage project settings (including deletion)
- _Member Privileges_: Workspace members have read-only access to workspace and project resources. They can manage tasks within projects they have access to.

## Conventions

Its purpose is to learn and practice microservices architecture, but it does not follow all the rules by the book due to financial constraints. In the real world, its architecture would be more well-defined, respecting each boundary. For example, we could split the service like:

| Microservice  | Responsibility                                        |
| ------------- | ----------------------------------------------------- |
| **user**      | Authentication, user profiles, roles                  |
| **workspace** | Workspaces, permissions, team management              |
| **project**   | Project and statuses                                  |
| **task**      | Items (tasks), assignments, due dates, status changes |
| **comment**   | Comments, attachments, audit logs                     |

It would increase the scalability, respecting the domain boundary, but also would require us to split our free account hosts. So, it was split like:

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   users-service │    Authentication & User Management
│   (Python)      │
│ • User profiles │
│ • Authentication│
│ • JWT tokens    │
└─────────────────┘
         ▲
         │ HTTP/REST (temporary solution)
         │
         │
         |
              event driven
┌─────────────────┐     ┌─────────────────┐
│sugarfoot-service│◄─ ─►│  koda-service  │
│   (Node.js)     │     │   (Node.js)     │
│                 │     │                 │
│ • Workspaces    │     │ • Tasks         │
│ • Projects      │     │ • Comments      │
│ • Members       │     │ • Assignments   │
└─────────────────┘     └─────────────────┘
   ▲
   │ event driven
   │
   ▼
┌─────────────────────┐
│  stitch-service     │
│   (Node.js)         │
│ • Checkout/Payments │
│ • Stripe integration│
└─────────────────────┘
```

### Service Responsibilities

- **users-service** (Python): Authentication & user management ✅ _External Service_ [see the source code here](https://github.com/tassioFront/studying-python)
- **sugarfoot-service** (Node.js): Workspaces, projects, member management - In progress
- **koda-service** (Node.js): Tasks, comments, detailed work tracking 🚧 _Planned_
- **stitch-service** (Node.js): Checkout and payment microservice 🚧 _Planned_

## 🚀 Tech Stack

- **Monorepo**: Nx
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Custom Integration Tests
- **Containerization**: Docker & Docker Compose
- **Code Quality**: ESLint, Prettier

## 🐳 Docker Development

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Yarn

### Quick Start with Docker

1. **Start development environment:**

   ```bash
   yarn docker:dev:up
   ```

2. **Run database migrations:**

   ```bash
   yarn db:migrate
   ```

3. **Start the sugarfoot service locally:**

   ```bash
   yarn dev
   ```

4. **Access services:**
   - Sugarfoot API: http://localhost:3000
   - Koda API: http://localhost:4000
   - Stitch API: http://localhost:4001

### Docker Commands

```bash
# sugarfoot example
yarn docker:sugarfoot:build
yarn docker:sugarfoot:up
```

## 🧪 Testing

### Automated Testing Suite

- **Unit Tests**: Jest-based testing for all services
- **Guard Validation**: Comprehensive security testing

```bash
#example commands
yarn nx test sugarfoot

```

To create a production bundle:

```sh
npx nx build sugarfoot
```

To see all available targets to run for a project, run:

```sh
npx nx show project sugarfoot
```
