# Reclaima

Reclaima is a React + Vite frontend with a Node.js (Express) backend API.

## Project Structure

- `src/`: frontend app
- `server/src/`: backend API
- `server/src/db/client.js`: shared MongoDB client and connection lifecycle

## Scripts

- `npm run dev`: run frontend and backend together
- `npm run dev:frontend`: run only Vite frontend (`http://localhost:5173`)
- `npm run dev:backend`: run only backend with nodemon (`http://localhost:4000`)
- `npm run start:backend`: run backend in normal node mode
- `npm run build`: production frontend build
- `npm run lint`: lint frontend + backend files

## Backend API

Base URL: `http://localhost:4000`

- `GET /`: API welcome
- `GET /api/health`: health check
- `POST /api/auth/signup`: signup placeholder
- `POST /api/auth/signin`: signin placeholder
- `GET /api/items`: list in-memory items
- `POST /api/items/lost`: create lost item
- `POST /api/items/found`: create found item
- `GET /api/matches`: smart matches placeholder

## Environment

Copy `.env.example` to `.env` and update values as needed:

- `PORT=4000`
- `CORS_ORIGIN=http://localhost:5173`
- `MONGODB_URI=<your-mongodb-connection-string>`
- `MONGODB_DB_NAME=reclaima`

## Deployment

### Frontend on Vercel

- Set the project root to the repo root.
- Build command: `npm run build`
- Output directory: `dist`
- Add this environment variable in Vercel:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com`
- Keep `vercel.json` in the repo root so React Router routes resolve to `index.html`.

### Backend on Render

- Use the repo root as the service root.
- Start command: `npm start`
- Build command: `npm ci`
- Add these environment variables in Render:
  - `MONGODB_URI`
  - `MONGODB_DB_NAME`
  - `APP_BASE_URL=https://<your-vercel-project>.vercel.app`
  - `CORS_ORIGIN=https://<your-vercel-project>.vercel.app`
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `EMAIL_FROM` if email features are enabled
