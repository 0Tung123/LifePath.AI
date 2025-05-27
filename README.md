# My Fullstack App

A full-stack application with Next.js, Nest.js, PostgreSQL, and Docker.

## Setup

### Prerequisites
- Node.js v18+
- Docker Desktop
- Git

### Local Development
1. Clone repo: `git clone <repo-url>`
2. Install frontend dependencies: `cd frontend && npm install`
3. Install backend dependencies: `cd ../backend && npm install`
4. Start Docker: `cd .. && docker compose up`
5. Start frontend: `cd frontend && npm run dev`
6. Access:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`
   - pgAdmin: `http://localhost:5050`
   - Swagger: `http://localhost:3001/api-docs`

### Deployment
- **Frontend**: Vercel (connect repo, set `NEXT_PUBLIC_API_URL`)
- **Backend**: Heroku (use `Procfile`, add Heroku Postgres)

## API Documentation
- Swagger: `/api-docs` on backend URL