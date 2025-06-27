# LifePath.AI

An immersive text-based adventure game with dynamic world-building, powered by Next.js, Nest.js, PostgreSQL, and AI.

## Features

### Enhanced World Building
LifePath.AI uses advanced world-building techniques to create immersive, dynamic game worlds:

- **Ripple Effect System**: Player decisions trigger immediate, medium-term, and long-term consequences
- **Parallel Timeline System**: Events happen elsewhere in the world independent of player actions
- **Autonomous Character System**: NPCs have their own motivations, fears, secrets, and schedules
- **Independent Event System**: Major world events occur regardless of player involvement
- **Multi-Perspective Realism**: Events are viewed from multiple perspectives
- **Living Detail Technique**: Rich sensory details bring the world to life
- **Layered Dialogue**: Conversations contain explicit, implicit, and contextual layers

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

## World Building Documentation
For more details on the enhanced world-building system, see:
- [Enhanced World Building Documentation](backend/src/games/prompts/README.md)