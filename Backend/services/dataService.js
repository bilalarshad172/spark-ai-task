import pg from "pg";
import dotenv from "dotenv";
import { createId, hashPassword } from "./authService.js";
dotenv.config();
const { Pool } = pg;
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
    })
  : null;
// Development-only seed account. PostgreSQL environments use their own users table.
const memory = {
  users: [
    {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Demo User",
      email: "demo@northstar.test",
      password_hash: hashPassword("DemoPass123!"),
    },
  ],
  sessions: [],
  appointments: [],
};

export async function findUserByEmail(email) {
  return pool
    ? (
        await pool.query("SELECT * FROM users WHERE email=$1", [
          email.toLowerCase(),
        ])
      ).rows[0]
    : memory.users.find((user) => user.email === email.toLowerCase());
}
export async function createUser(user) {
  const record = { id: createId(), ...user };
  if (pool)
    return (
      await pool.query(
        "INSERT INTO users(id,name,email,password_hash) VALUES($1,$2,$3,$4) RETURNING id,name,email",
        [record.id, record.name, record.email, record.password_hash],
      )
    ).rows[0];
  memory.users.push(record);
  return record;
}
export async function getAppointmentsForUser(userId) {
  return pool
    ? (
        await pool.query(
          "SELECT * FROM appointments WHERE user_id=$1 ORDER BY starts_at",
          [userId],
        )
      ).rows
    : memory.appointments
        .filter((item) => item.user_id === userId)
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at));
}
export async function addAppointment(appointment) {
  const record = { id: createId(), ...appointment };
  if (pool)
    return (
      await pool.query(
        "INSERT INTO appointments(id,user_id,service,starts_at,duration_minutes,notes,status) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *",
        [
          record.id,
          record.user_id,
          record.service,
          record.starts_at,
          record.duration_minutes,
          record.notes,
          record.status,
        ],
      )
    ).rows[0];
  memory.appointments.push(record);
  return record;
}
export async function createChatSession(userId) {
  const session = { id: createId(), user_id: userId, messages: [] };
  if (pool) {
    await pool.query(
      "INSERT INTO chat_sessions(id,user_id,messages) VALUES($1,$2,$3)",
      [session.id, session.user_id, JSON.stringify(session.messages)],
    );
  } else memory.sessions.push(session);
  return session;
}
export async function getChatSession(id, userId) {
  return pool
    ? (
        await pool.query(
          "SELECT * FROM chat_sessions WHERE id=$1 AND user_id=$2",
          [id, userId],
        )
      ).rows[0]
    : memory.sessions.find((item) => item.id === id && item.user_id === userId);
}
export async function updateChatSession(session) {
  if (pool)
    await pool.query(
      "UPDATE chat_sessions SET messages=$2,updated_at=NOW() WHERE id=$1",
      [session.id, JSON.stringify(session.messages)],
    );
}
