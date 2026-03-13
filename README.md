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
