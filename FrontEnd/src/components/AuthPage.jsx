import { useState } from "react";
import { api } from "../services/api.js";

export default function AuthPage({ onAuthenticated }) {
  const [isSignup, setIsSignup] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });
  const field =
    "mt-1 block w-full rounded-lg border border-emerald-950/15 bg-white p-3 outline-emerald-500";
  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      const result = await api("/auth/" + (isSignup ? "signup" : "login"), {
        method: "POST",
        body: JSON.stringify(form),
      });
      onAuthenticated(
        result,
        isSignup
          ? "Account created successfully. Welcome to sparkAI task!"
          : "Signed in successfully. Welcome back!",
      );
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_.9fr]">
      <section className="bg-emerald-50 px-10 py-16 text-emerald-950 sm:px-[10vw] sm:py-[12vw]">
        <b className="text-emerald-800">✦ sparkAI task</b>
        <p className="mt-16 text-[11px] font-bold tracking-[.15em] text-emerald-700">
          APPOINTMENTS, SIMPLIFIED
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Time for care,
          <br />
          made easy.
        </h1>
        <p className="mt-4 max-w-md text-slate-500">
          Tell our assistant what you need, then confirm the details when they feel right.
        </p>
      </section>
      <form className="mx-auto w-[min(390px,calc(100%-44px))] self-center py-12" onSubmit={submit}>
        <p className="text-[11px] font-bold tracking-[.15em] text-emerald-700">WELCOME</p>
        <h2 className="mt-2 text-2xl font-bold text-emerald-950">
          {isSignup ? "Create an account" : "Sign in to continue"}
        </h2>
        {isSignup && (
          <label className="mt-5 block text-xs font-bold text-emerald-950/75">
            Name
            <input
              className={field}
              required
              placeholder="Alex Morgan"
              value={form.name}
              onChange={update("name")}
            />
          </label>
        )}
        <label className="mt-5 block text-xs font-bold text-emerald-950/75">
          Email
          <input
            className={field}
            required
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
          />
        </label>
        <label className="mt-4 block text-xs font-bold text-emerald-950/75">
          Password
          <input
            className={field}
            required
            minLength="8"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={update("password")}
          />
        </label>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <button className="mt-5 w-full rounded-lg bg-emerald-800 p-3 font-bold text-white">
          {isSignup ? "Create account" : "Sign in"}
        </button>
        <button
          type="button"
          className="mx-auto mt-5 block bg-transparent text-sm text-emerald-700"
          onClick={() => {
            setIsSignup(!isSignup);
            setError("");
          }}
        >
          {isSignup ? "Already have an account? Sign in" : "New here? Create an account"}
        </button>
      </form>
    </main>
  );
}
