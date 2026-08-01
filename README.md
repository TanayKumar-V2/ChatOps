# ChatOps

Real-time team chat built with TypeScript, React, Socket.io, Redis, and Neon PostgreSQL.

## Local setup

1. Copy `.env.example` to `.env` and add your Neon `DATABASE_URL`.
2. Copy `apps/web/.env.example` to `apps/web/.env` for frontend settings.
3. Install dependencies with `npm install`.
4. Start Redis with `docker compose up redis -d`.
5. Start the API and React app with `npm run dev`.

The React workspace is available at `http://localhost:5173` and the API at `http://localhost:3000`.

The frontend starts in polished demo mode so the interface can be reviewed immediately. Set `VITE_DEMO_MODE=false` and store a valid JWT in `localStorage` under `chatops_token` after connecting the auth service.

Neon is the persistent database. Docker runs Redis locally; it does not create a second PostgreSQL database.

Run the complete production-shaped stack with `docker compose up --build`. The React app is served at `http://localhost:5173` and the API at `http://localhost:3000`.

Before using real persistence, apply the Neon migrations and seed a user plus room membership. The API expects the JWT `sub` claim to match a `users.id` value.

Then run the repeatable seed command:

```bash
npm run seed -w apps/api
```

It creates `maya@chatops.local` and `eli@chatops.local`, both with the temporary password `change-me-please`. Change these credentials before sharing the environment.

For live mode, set `VITE_DEMO_MODE=false`. The React app will show the JWT login screen, fetch rooms and message history from Neon, and use the authenticated Socket.io connection.

## Production deployment

The repository includes `vercel.json` for the Vite frontend and `render.yaml` for the Dockerized Express/Socket.io API plus a Render Key Value Redis instance. Deploy the API first so you have its public `onrender.com` URL.

### Render API

Create the Render Blueprint from `render.yaml`, then set these API environment variables:

- `DATABASE_URL`: your Neon pooled connection string.
- `JWT_SECRET`: a long random secret; the Blueprint generates one automatically.
- `CLIENT_URL`: the final Vercel frontend URL, for example `https://chatops.vercel.app`.
- `REDIS_URL`: supplied by the Blueprint from the `chatops-redis` Key Value service.

After the first build, run the production migration from the Render shell:

```bash
npm run migrate:prod -w apps/api
```

Do not run the seed command against production unless you intentionally want the demo users and room.

### Vercel frontend

Import the repository as a Vercel project. Keep the project root at the repository root so the monorepo workspace dependency resolves. `vercel.json` sets the Vite build and `apps/web/dist` output automatically. Add these Production environment variables in Vercel:

- `VITE_API_URL`: the Render API URL.
- `VITE_SOCKET_URL`: the same Render API URL; Socket.io uses this for real-time messaging.
- `VITE_DEMO_MODE=false`.

Set the Render `CLIENT_URL` to the exact Vercel production URL, redeploy the API, then open the Vercel app and register a real account. Render web services accept inbound WebSocket connections, so Socket.io can remain on the same API service.
