# FUBS Microservices

A microservices architecture project built with Nx monorepo, featuring Node.js services that complement a Python users-service.

## 🏗️ Architecture

```
.
├── users-service (Python, Django/FastAPI + PostgreSQL)  # External
│   └── usuários, autenticação, times
│
├── projects-service (Node.js, NestJS + PostgreSQL)      # This repo
│   └── projetos, tarefas, atribuição
```

## 🚀 Tech Stack

- **Monorepo**: Nx
- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT with Passport
- **Documentation**: Swagger
- **Containerization**: Docker & Docker Compose

## 📦 Project Structure

```
apps/
├── projects/                 # Main NestJS application
│   ├── src/
│   ├── prisma/              # Database schema and migrations
│   ├── Dockerfile
│   └── .env
├── projects-e2e/            # End-to-end tests
libs/
├── shared/                  # Shared libraries
│   ├── types/              # TypeScript interfaces
│   ├── auth/               # JWT validation utilities
│   ├── database/           # Database configurations
│   └── utils/              # Common utilities
docker/
├── nginx/                  # Nginx configuration
└── ...
```

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

3. **Start the projects service locally:**

   ```bash
   yarn dev
   ```

4. **Access services:**
   - Projects API: http://localhost:3000
   - Swagger Docs: http://localhost:3000/api
   - PostgreSQL: localhost:5433
   - Redis: localhost:6380
   - MailHog: http://localhost:8025

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

The projects service uses PostgreSQL with Prisma ORM. The schema includes:

- **Projects**: Main project entities
- **Tasks**: Individual tasks within projects
- **Milestones**: Project milestones and deadlines
- **Comments**: Comments on projects and tasks
- **ProjectAssignments**: User assignments to projects

### Database Operations

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

To create a production bundle:

```sh
npx nx build projects
```

To see all available targets to run for a project, run:

```sh
npx nx show project projects
```

These targets are either [inferred automatically](https://nx.dev/concepts/inferred-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) or defined in the `project.json` or `package.json` files.

[More about running tasks in the docs &raquo;](https://nx.dev/features/run-tasks?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## Add new projects

While you could add new projects to your workspace manually, you might want to leverage [Nx plugins](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) and their [code generation](https://nx.dev/features/generate-code?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) feature.

Use the plugin's generator to create new projects.

To generate a new application, use:

```sh
npx nx g @nx/node:app demo
```

To generate a new library, use:

```sh
npx nx g @nx/node:lib mylib
```

You can use `npx nx list` to get a list of installed plugins. Then, run `npx nx list <plugin-name>` to learn about more specific capabilities of a particular plugin. Alternatively, [install Nx Console](https://nx.dev/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) to browse plugins and generators in your IDE.

[Learn more about Nx plugins &raquo;](https://nx.dev/concepts/nx-plugins?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects) | [Browse the plugin registry &raquo;](https://nx.dev/plugin-registry?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

[Learn more about Nx on CI](https://nx.dev/ci/intro/ci-with-nx#ready-get-started-with-your-provider?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)
