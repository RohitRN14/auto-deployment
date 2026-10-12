# ⚡ TaskFlow – MERN Stack To-Do App with DevOps Pipeline

[![CI/CD](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/taskflow/deploy.yml?branch=main&label=CI%2FCD&logo=github-actions)](https://github.com/YOUR_USERNAME/taskflow/actions)
[![Docker](https://img.shields.io/docker/pulls/YOUR_USERNAME/taskflow-backend?logo=docker)](https://hub.docker.com/r/YOUR_USERNAME/taskflow-backend)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A production-ready, full-stack **MERN** To-Do application with an automated **GitHub Actions CI/CD pipeline** that builds Docker images, pushes them to Docker Hub, and deploys them to a Docker host.

---

## 📁 Project Structure

```
taskflow/
├── .github/
│   └── workflows/
│       └── deploy.yml          ← GitHub Actions CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── todoController.js
│   │   ├── middleware/
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   └── Todo.js
│   │   ├── routes/
│   │   │   └── todos.js
│   │   └── server.js
│   ├── tests/
│   │   └── todo.test.js
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── todoApi.js
│   │   ├── components/
│   │   │   ├── AddTodoForm.jsx
│   │   │   ├── TodoCard.jsx
│   │   │   └── TodoList.jsx
│   │   ├── hooks/
│   │   │   └── useTodos.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env.example
│   ├── .gitignore
│   ├── Dockerfile
│   ├── index.html
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.js
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

---

## 🧰 Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | ≥ 20 | Local development |
| **npm** | ≥ 10 | Package management |
| **Docker** | ≥ 24 | Container runtime |
| **Docker Compose** | ≥ 2.20 | Multi-service orchestration |
| **Git** | ≥ 2.40 | Version control |

Optional (for CI/CD):
- GitHub account (to host the repo and run Actions)
- Docker Hub account (free tier is fine)

---

## ⚡ Quick Start – Local Development (without Docker)

### 1. Clone & setup environment

```bash
git clone https://github.com/YOUR_USERNAME/taskflow.git
cd taskflow

# Backend env
cp backend/.env.example backend/.env
# Edit backend/.env: set MONGO_URI to your local MongoDB

# Frontend env (optional in dev – Vite proxy handles /api)
cp frontend/.env.example frontend/.env
```

### 2. Start MongoDB locally

```bash
# Option A: Docker (easiest)
docker run -d --name mongo -p 27017:27017 mongo:7.0

# Option B: Use MongoDB Atlas cloud free tier
# Set MONGO_URI=mongodb+srv://... in backend/.env
```

### 3. Start the backend

```bash
cd backend
npm install
npm run dev        # Runs on http://localhost:5000
```

### 4. Start the frontend

```bash
cd frontend
npm install
npm run dev        # Runs on http://localhost:5173
```

The Vite dev server proxies `/api` requests to `localhost:5000`, so the frontend automatically talks to the backend.

---

## 🐳 Quick Start – Docker Compose (Recommended)

**All three services (MongoDB + Backend + Frontend) in one command:**

```bash
# 1. Copy and edit the root .env file
cp .env.example .env
# Edit .env: set MONGO_ROOT_PASSWORD to something strong

# 2. Build images and start all services
docker compose up --build

# 3. Open the app
# Frontend: http://localhost:80
# Backend API: http://localhost:5000/api/health
```

**Other useful commands:**

```bash
docker compose up -d                   # Run in background (detached)
docker compose down                    # Stop containers (data preserved)
docker compose down -v                 # Stop + delete MongoDB data (fresh start)
docker compose logs -f backend         # Stream backend logs
docker compose logs -f frontend        # Stream frontend logs
docker compose ps                      # Show container status
docker compose restart backend         # Restart one service
```

---

## 👥 User & Admin Authentication (RBAC)

TaskFlow features Role-Based Access Control (RBAC):
- **Standard Users**: Manage their own personal tasks and deadlines.
- **Administrators**: Have full supervisory oversight to view all users' tasks, filter tasks by specific user, and access the User Directory with task completion analytics.

### Demo Credentials (1-Click in UI or manual)

| Role | Email | Password | Privileges |
|------|-------|----------|------------|
| **🛡️ Admin** | `admin@taskflow.dev` | `Admin@123` | Full oversight, view/filter all tasks, user directory |
| **👤 User** | `user@taskflow.dev` | `User@123` | Personal task management |

---

## 🔌 API Endpoints

### Authentication Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register account (`role: 'user'` or `'admin'`) |
| POST | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| GET | `/api/auth/me` | Protected | Return currently authenticated user profile |
| GET | `/api/auth/users` | **Admin Only** | List all users with task counts & statistics |
| POST | `/api/auth/seed` | Public / Dev | Seed default demo Admin and User accounts |

### Todo Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check (MongoDB status) |
| GET | `/api/todos` | List todos (User: own tasks; Admin: supports `?scope=all&userId=...`) |
| GET | `/api/todos/:id` | Get single todo (Owner or Admin) |
| POST | `/api/todos` | Create todo (automatically linked to authenticated user) |
| PUT | `/api/todos/:id` | Update todo (Owner or Admin) |
| PATCH | `/api/todos/:id/toggle` | Toggle completed status (Owner or Admin) |
| DELETE | `/api/todos/:id` | Delete todo (Owner or Admin) |
| DELETE | `/api/todos/completed/all` | Delete completed todos (User: own; Admin: system-wide) |

**Example request:**
```bash
curl -X POST http://localhost:5000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy groceries","priority":"high"}'
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGO_URI` | `mongodb://mongo:27017/mern-todo` | MongoDB connection string |
| `PORT` | `5000` | Server port |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS origin |
| `NODE_ENV` | `development` | Node environment |

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | *(empty)* | Backend URL. Empty = Vite proxy in dev, nginx proxy in Docker |

### Root (`.env` for Docker Compose)

| Variable | Default | Description |
|----------|---------|-------------|
| `DOCKERHUB_USERNAME` | `youruser` | Your Docker Hub username |
| `MONGO_ROOT_USER` | `admin` | MongoDB root username |
| `MONGO_ROOT_PASSWORD` | `changeme` | **Use a strong password!** |
| `MONGO_DB` | `mern-todo` | Database name |
| `BACKEND_PORT` | `5000` | Host port for backend |
| `FRONTEND_PORT` | `80` | Host port for frontend |
| `IMAGE_TAG` | `latest` | Docker image tag |

---

## 🐳 Docker – Build & Run Manually

### Build images

```bash
# Backend
docker build -t taskflow-backend ./backend

# Frontend
docker build -t taskflow-frontend ./frontend
```

### Run individually

```bash
# Create network
docker network create taskflow-net

# Start MongoDB
docker run -d \
  --name taskflow-mongo \
  --network taskflow-net \
  -v taskflow-mongo-data:/data/db \
  mongo:7.0

# Start Backend
docker run -d \
  --name taskflow-backend \
  --network taskflow-net \
  -p 5000:5000 \
  -e MONGO_URI="mongodb://taskflow-mongo:27017/mern-todo" \
  -e PORT=5000 \
  taskflow-backend

# Start Frontend
docker run -d \
  --name taskflow-frontend \
  --network taskflow-net \
  -p 80:80 \
  taskflow-frontend
```

> **Why a network?** MongoDB is only on the private `taskflow-net` network and is **never exposed** to the internet. Containers communicate by service name (e.g., `mongo`, `backend`). Data survives restarts because it's stored in the named volume `taskflow-mongo-data`.

---

## 🏗️ GitHub Actions Workflow Explained

### Pipeline Overview

```
Push to main
     │
     ├─► backend-ci   ──────────────────────────────────► [pass]
     │     └─ npm ci                                          │
     │     └─ Run Jest tests (real MongoDB service)           │
     │                                                        │
     ├─► frontend-ci  ──────────────────────────────────► [pass]
     │     └─ npm ci                                          │
     │     └─ npm run build (Vite production)                 │
     │                                                        ▼
     └─────────────────────────────────────────────►  docker-push
                                                          └─ Login to Docker Hub
                                                          └─ Build backend image (multi-arch)
                                                          └─ Push :latest + :sha tags
                                                          └─ Build frontend image
                                                          └─ Push :latest + :sha tags
                                                                  │
                                                                  ▼
                                                             deploy
                                                          └─ Pull new images
                                                          └─ docker compose down
                                                          └─ docker compose up -d
                                                          └─ Health check backend
                                                          └─ Health check frontend
```

### Why self-hosted runner for local deploy?

GitHub-hosted runners (`ubuntu-latest`) are **temporary cloud VMs** that are destroyed after each job. They have no network access to your local machine, so they **cannot** start containers on your computer.

A **self-hosted runner** is a small background process you install on your own machine. It connects outbound to GitHub, receives jobs from your workflow, and runs them locally — where Docker is available.

---

## 🖥️ Self-Hosted Runner Setup

> **Required for the local deploy job.** Skip this if you're deploying to a remote VM via SSH.

### Step 1: Install the runner on your machine

1. Go to your GitHub repository → **Settings** → **Actions** → **Runners** → **New self-hosted runner**
2. Select your OS (Windows / Linux / macOS)
3. Follow the displayed commands to download and configure the runner
4. Start the runner:
   ```bash
   # Linux/macOS
   ./run.sh

   # Windows (PowerShell)
   .\run.cmd

   # Or install as a service (recommended)
   sudo ./svc.sh install && sudo ./svc.sh start   # Linux
   .\svc.ps1 install; .\svc.ps1 start             # Windows
   ```

5. Verify the runner appears as **Online** in GitHub Settings → Actions → Runners

### Step 2: Ensure Docker is available to the runner

```bash
# Linux: add runner user to docker group
sudo usermod -aG docker $USER
# Log out and back in (or reboot) for the group change to take effect
docker ps   # verify runner can use Docker
```

### ⚠️ Security Implications of Self-Hosted Runners

- **Only use self-hosted runners on machines you trust and control.**
- Do not use self-hosted runners on public repositories — anyone who can open a pull request could run arbitrary code on your machine.
- For public repos, use GitHub-hosted runners + SSH deployment to a separate server.
- The runner should run as a **limited user account**, not as root/Administrator.

---

## 🔑 GitHub Repository Setup

### Step 1: Create the repository

```bash
git init
git add .
git commit -m "feat: initial MERN todo app with DevOps pipeline"
git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
git push -u origin main
```

### Step 2: Add GitHub Secrets

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Value | Notes |
|-------------|-------|-------|
| `DOCKERHUB_USERNAME` | Your Docker Hub username | e.g., `johndoe` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | **Not** your password! |
| `MONGO_ROOT_USER` | `admin` | Or any username |
| `MONGO_ROOT_PASSWORD` | Strong random password | e.g., `openssl rand -hex 32` |
| `MONGO_DB` | `mern-todo` | Database name |
| `BACKEND_PORT` | `5000` | Optional – defaults to 5000 |
| `FRONTEND_PORT` | `80` | Optional – defaults to 80 |

**For SSH deploy (Approach B):**

| Secret Name | Value |
|-------------|-------|
| `DEPLOY_HOST` | IP or hostname of remote server |
| `DEPLOY_USER` | SSH username (e.g., `ubuntu`) |
| `DEPLOY_SSH_KEY` | Full content of `~/.ssh/id_rsa` (private key) |

---

## 🐋 Docker Hub Setup

### Step 1: Create repositories

1. Go to [hub.docker.com](https://hub.docker.com) → **Create Repository**
2. Create:
   - `YOUR_USERNAME/taskflow-backend`
   - `YOUR_USERNAME/taskflow-frontend`
3. Set visibility to **Public** (free) or Private

### Step 2: Create an access token (minimum permissions)

1. Docker Hub → **Account Settings** → **Security** → **New Access Token**
2. Name: `github-actions-taskflow`
3. Permissions: **Read & Write** (needed to push images)
   - ❌ Do NOT select "Delete" unless you need it
4. Copy the token and add it as the `DOCKERHUB_TOKEN` GitHub Secret

> **Why a token and not your password?**
> Access tokens can be scoped to specific permissions and revoked individually without changing your Docker Hub password. This follows the principle of least privilege.

---

## 📊 Understanding Build vs Push vs Deploy

| Stage | What happens | Result |
|-------|-------------|--------|
| **Build** | `docker build` compiles your source code into a Docker image | Image exists only on the machine that built it |
| **Push** | `docker push` uploads the image to Docker Hub registry | Image is stored in the cloud, downloadable anywhere |
| **Deploy** | `docker run` or `docker compose up` on a target machine pulls the image and starts a container | Application is actually **running** and serving traffic |

> ⚠️ **Common misconception:** Pushing an image to Docker Hub does **not** make your app live or publicly accessible. You still need a machine running the container and (optionally) a public IP/domain.

---

## 🌐 Making the App Publicly Accessible

If you want the app accessible from the internet:

1. **Rent a server** – DigitalOcean Droplet ($6/mo), AWS EC2 free tier, Hetzner Cloud, etc.
2. **Install Docker** on the server
3. **Use Approach B (SSH deploy)** in the workflow
4. **Set up a domain** and point it at the server's IP
5. **Add a reverse proxy** (e.g., Caddy or nginx) with TLS/HTTPS:
   ```bash
   # Caddy example (auto-HTTPS)
   # /etc/caddy/Caddyfile
   yourdomain.com {
     reverse_proxy localhost:80
   }
   ```

---

## 🧪 Running Tests

```bash
# Backend tests (requires MongoDB running on localhost:27017)
cd backend
npm test

# Or with a fresh test database via Docker
docker run --rm -d --name test-mongo -p 27017:27017 mongo:7.0
MONGO_URI=mongodb://localhost:27017/test npm test
docker stop test-mongo
```

---

## 🔧 Troubleshooting

### ❌ GitHub Actions workflow fails

| Problem | Solution |
|---------|----------|
| `DOCKERHUB_USERNAME` not found | Add the secret in Repo → Settings → Secrets |
| `unauthorized: incorrect username or password` | Regenerate Docker Hub token; update `DOCKERHUB_TOKEN` secret |
| Tests fail with `MongoServerError` | Check the MongoDB service block in the workflow; ensure port 27017 is not blocked |
| `self-hosted` runner not found | Runner must be Online in GitHub Settings → Runners |

### ❌ Docker Hub authentication error

```bash
# Test login locally
docker login -u YOUR_USERNAME
# Enter your access token (NOT password) when prompted
```

### ❌ Port conflict (`Error bind: address already in use`)

```bash
# Find what's using the port
lsof -i :5000     # macOS/Linux
netstat -ano | findstr :5000   # Windows

# Change port in .env
BACKEND_PORT=5001
```

### ❌ MongoDB connection error

```bash
# Check if mongo container is healthy
docker compose ps
docker compose logs mongo

# Test connection manually
docker exec -it taskflow-mongo mongosh
```

### ❌ Container fails health check

```bash
# View container logs
docker compose logs backend
docker compose logs frontend

# Inspect health status
docker inspect --format='{{json .State.Health}}' taskflow-backend | python3 -m json.tool
```

### ❌ Frontend shows blank page / 502 Bad Gateway

- The nginx config proxies `/api/*` to the `backend` service name. In Docker Compose, containers must be on the same network.
- Check `docker compose ps` – all services must show `(healthy)` or `Up`.
- Run `docker compose restart frontend` to reconnect after backend comes up.

---

## 🔒 Security Checklist

- [x] `.env` is in `.gitignore` – credentials never committed
- [x] MongoDB is not exposed to the host network (only via private Docker network)
- [x] Docker Hub uses access token, not password
- [x] GitHub Secrets used for all sensitive values
- [x] Backend runs as non-root user in Docker
- [x] Input validation on all API endpoints (express-validator)
- [x] Self-hosted runner security implications documented
- [ ] Add rate limiting (`express-rate-limit`) for production
- [ ] Set up HTTPS / TLS for public deployments

---

## 📄 License

MIT © 2024 – Free to use and modify.
