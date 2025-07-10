# FUBS - Project Management Microservices

A scalable microservices architecture for project management built with Nx monorepo, featuring specialized Node.js services that integrate with a Python [users-service](https://github.com/tassioFront/studying-python) for comprehensive team collaboration and task management.

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
              HTTP/REST (temporary solution)
┌─────────────────┐     ┌─────────────────┐
│workspaces-service│◄─ ─►│  tasks-service  │
│   (Node.js)     │     │   (Node.js)     │
│                 │     │                 │
│ • Workspaces    │     │ • Tasks         │
│ • Projects      │     │ • Comments      │
│ • Members       │     │ • Assignments   │
└─────────────────┘     └─────────────────┘
```

### Service Responsibilities

- **users-service** (Python): Authentication & user management ✅ _External Service_
- **workspaces-service** (Node.js): Workspaces, projects, member management - In progress
- **tasks-service** (Node.js): Tasks, comments, detailed work tracking 🚧 _Planned_

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

3. **Start the workspaces service locally:**

   ```bash
   yarn dev
   ```

4. **Access services:**
   - Workspaces API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api
   - PostgreSQL: localhost:5433

### Docker Commands

```bash
# Development
yarn docker:dev:up      # Start dev services
yarn docker:dev:down    # Stop dev services
yarn docker:dev:logs    # View logs

# Production
yarn docker:prod:build  # Build production images
yarn docker:prod:up     # Start production services
yarn docker:prod:down   # Stop production services

# Database
yarn db:migrate         # Run database migrations
yarn db:generate        # Generate Prisma client
yarn db:studio          # Open Prisma Studio
```

## 🗄️ Database

The workspaces service uses PostgreSQL with Prisma ORM.

```bash
# Create and apply migrations
yarn db:migrate

# Deploy migrations in production
yarn db:migrate:deploy

# Generate Prisma client
yarn db:generate

# Open Prisma Studio
yarn db:studio
```

## 🧪 Testing

### Automated Testing Suite

- **Unit Tests**: Jest-based testing for all services
- **Guard Validation**: Comprehensive security testing

```bash
#example commands
yarn nx test workspaces

```

To create a production bundle:

```sh
npx nx build workspaces
```

To see all available targets to run for a project, run:

```sh
npx nx show project workspaces
```
