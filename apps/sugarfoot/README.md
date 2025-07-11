<div align='center'>
  
<img width="200" alt="Sugarfoot logo" src="https://github.com/user-attachments/assets/30413105-2015-4064-b680-ef3f7f5ba80a" />
</div>

<br/>

[Sugarfoot](https://walterlantz.fandom.com/wiki/Sugarfoot) is a Node.js service designed to manage workspaces, projects, and members within an organization

<br/>

## 🧪 Full Flow Validation: Users-Service ↔ Sugarfoot-Service (E2E will be created)

### Authentication Flow

1. Client authenticates with **users-service** → receives JWT
2. Client includes JWT in requests to **sugarfoot-service**
3. **sugarfoot-service** validates JWT with **users-service**
4. Authorized operations proceed with user context

## 📋 Test Overview

This document outlines the comprehensive testing plan for validating the communication between:

- **Users-Service** (Python, port 8000) - Authentication & User Management
- **Sugarfoot-Service** (Node.js, port 3000) - Workspace & Project Organization

## 🎯 Test Scenarios

### 1. User Registration & Authentication Flow

#### 1.1 User Registration

```bash
curl -X POST http://localhost:8000/api/users/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "SecurePass123!"
  }' | jq .
```

#### 1.2 User Login & JWT Token

```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testapi@example.com",
    "password": "testpassword123"
  }' | jq .
```

#### 1.3 Validate JWT Token

```bash
curl -X GET http://localhost:8000/api/users/validate-token/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" | jq .

```

### 2. Sugarfoot Service with JWT Authentication

#### 2.1 Create Workspace with JWT

```bash
# Create workspace using JWT from users-service
curl -X POST http://localhost:3000/api/workspaces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Workspace",
    "description": "Testing workspace with real JWT"
  }' | jq .
```

#### 2.2 Add Member to Workspace (UUID validation)

```bash
# Add member using UUID (should succeed with valid UUID)
curl -X POST http://localhost:3000/api/workspaces/WORKSPACE_UUID/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_UUID_HERE",
    "role": "member"
  }' | jq .
```

#### 2.3 Create Project in Workspace

```bash
# Create project within workspace
curl -X POST http://localhost:3000/api/workspaces/WORKSPACE_UUID/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Project",
    "description": "Testing project creation with JWT"
  }' | jq .
```

#### 2.4 List User's Workspaces

```bash
curl -X GET http://localhost:3000/api/api/workspaces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" | jq .
```
