# sparkAI task

React + Vite frontend and Express API for authenticated, AI-assisted appointment booking.

## Run locally

1. The included .env files are safe local defaults; replace Backend/.env values before deployment.
2. Optional PostgreSQL: create appointment_assistant, run Backend/database/schema.sql, and set DATABASE_URL in Backend/.env.
3. Start the API with: cd Backend then npm.cmd run dev.
4. Start the client with: cd FrontEnd then npm.cmd run dev.
5. Visit http://localhost:5173, create an account, and start booking.

Without DATABASE_URL, the API runs in development-memory mode, so records reset after a server restart. Set MISTRAL_API_KEY to enable live Mistral replies; otherwise the assistant uses a safe deterministic detail-extraction fallback.

## Demo login (development-memory mode)

- Email: demo@northstar.test
- Password: DemoPass123!

This seed account is only created when DATABASE_URL is not set. With PostgreSQL enabled, create an account through the signup screen instead.

## API

- POST /api/auth/signup and POST /api/auth/login
- POST /api/chat/sessions and POST /api/chat/sessions/:id/messages
- GET /api/appointments and POST /api/appointments

Protected routes require an Authorization Bearer JWT. The API includes JSON input validation, basic per-IP rate limiting, request logging, consistent JSON errors, and no booking-rule dependency on the LLM.
