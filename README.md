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
│sugarfoot-service│◄─ ─►│  tasks-service  │
│   (Node.js)     │     │   (Node.js)     │
│                 │     │                 │
│ • Workspaces    │     │ • Tasks         │
│ • Projects      │     │ • Comments      │
│ • Members       │     │ • Assignments   │
└─────────────────┘     └─────────────────┘
```

### Service Responsibilities

- **users-service** (Python): Authentication & user management ✅ _External Service_
- **sugarfoot-service** (Node.js): Workspaces, projects, member management - In progress
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

3. **Start the sugarfoot service locally:**

   ```bash
   yarn dev
   ```

4. **Access services:**
   - Sugarfoot API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api
   - PostgreSQL: localhost:5433

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
