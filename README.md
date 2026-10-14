# Spark AI Task

A small appointment booking app with an AI chat assistant. Users sign up, chat with the assistant to work out what they want to book (service, date, time), and then confirm the appointment in a booking panel.

**Live demo:** https://spark-ai-task-puil.vercel.app/

**Demo login**

- Email: `testing@sparkai.com`
- Password: `123456789`

## Tech stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** PostgreSQL (Neon in production)
- **AI:** Mistral API, with a rule-based fallback if the API is unavailable
- **Hosting:** Vercel (frontend and backend as separate projects)

## Project structure

```
Backend/    Express API, services, database schema
FrontEnd/   React app
```

## Running it locally

You'll need Node.js 18+ and PostgreSQL installed.

### 1. Database

Create a database and load the schema:

```bash
psql -U postgres -c "CREATE DATABASE sparkAI;"
psql -U postgres -d sparkAI -f Backend/database/schema.sql
```

### 2. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env`:

```
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=any-long-random-string
DATABASE_URL=postgres://postgres:YOUR_PASSWORD@localhost:5432/sparkAI
MISTRAL_API_KEY=
```

`MISTRAL_API_KEY` is optional. Without it, the assistant still works using a simpler built-in fallback, but the replies are more basic.

Start the API:

```bash
npm run dev
```

Check that it's connected by opening http://localhost:5000/api/health. You should see `{"status":"ok","database":"postgres"}`.

### 3. Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

If the app can't find the API, add `FrontEnd/.env` with:

```
VITE_API_URL=http://localhost:5000/api
```

Then open http://localhost:5173, create an account, and try booking something.

## How the chat works

The assistant picks the service, date, and time out of the conversation as you go, so you can give them in any order across several messages. If a Mistral key is set, Mistral writes the replies. If it's missing or the API is down or rate limited, a rule-based fallback takes over so the chat never just breaks.

The AI never confirms a booking by itself. Booking is always a deliberate step in the booking panel.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| POST | `/api/auth/signup` | Create an account |
| POST | `/api/auth/login` | Log in and get a token |
| POST | `/api/chat/sessions` | Start a chat session |
| POST | `/api/chat/sessions/:id/messages` | Send a message, get a reply |
| GET | `/api/appointments` | List your appointments |
| POST | `/api/appointments` | Book an appointment |
| GET | `/api/health` | Check the API and database connection |

Everything except signup, login, and health needs an `Authorization: Bearer <token>` header.

## Database

Three tables: `users`, `appointments`, and `chat_sessions`. Chat messages are stored as JSONB on the session, and only the last 50 are kept. The full schema is in `Backend/database/schema.sql`.

## Deployment notes

- The backend and frontend are two separate Vercel projects, with root directories `Backend` and `FrontEnd`.
- Backend env vars: `DATABASE_URL`, `JWT_SECRET`, `MISTRAL_API_KEY`, `CLIENT_ORIGIN` (the frontend URL, no trailing slash).
- Frontend env var: `VITE_API_URL`, pointing to the deployed backend with `/api` at the end.
- Vite reads env vars at build time, so redeploy the frontend after changing it.

## Things I'd improve with more time

- The rate limiter is in memory, so it isn't reliable on serverless. Redis would fix that.
- Chat messages could move to their own table instead of a JSONB column.
- Add automated tests for the API.