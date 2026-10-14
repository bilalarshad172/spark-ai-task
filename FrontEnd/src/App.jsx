import { useEffect, useState } from "react";
import { api } from "./services/api.js";
import AuthPage from "./components/AuthPage.jsx";
import Header from "./components/Header.jsx";
import ChatPanel from "./components/ChatPanel.jsx";
import BookingForm from "./components/BookingForm.jsx";
import AppointmentList from "./components/AppointmentList.jsx";

const welcomeMessage = {
  role: "assistant",
  content: "Hi! I can help book your next visit. What service and time are you looking for?",
};
const emptyBooking = { service: "", startsAt: "", durationMinutes: 30, notes: "" };

export default function App() {
  const [auth, setAuth] = useState(() => JSON.parse(localStorage.getItem("auth") || "null"));
  const [appointments, setAppointments] = useState([]);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([welcomeMessage]);
  const [booking, setBooking] = useState(emptyBooking);
  const [notice, setNotice] = useState(null);

  function showNotice(message, type = "success") {
    setNotice({ message, type });
  }

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(null), 4500);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  useEffect(() => {
    if (!auth) {
      return undefined;
    }

    let active = true;

    async function initializeDashboard() {
      try {
        const [{ appointments: appointmentsResult }, { session }] = await Promise.all([
          api("/appointments", {}, auth.token),
          api("/chat/sessions", { method: "POST" }, auth.token),
        ]);

        if (!active) return;
        setAppointments(appointmentsResult);
        setSessionId(session.id);
      } catch (error) {
        if (active) showNotice(error.message, "error");
      }
    }

    initializeDashboard();
    return () => {
      active = false;
    };
  }, [auth]);

  async function loadAppointments() {
    const { appointments: appointmentsResult } = await api("/appointments", {}, auth.token);
    setAppointments(appointmentsResult);
  }

  function authenticate(data, successMessage) {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
    showNotice(successMessage);
  }
  function signOut() {
    localStorage.removeItem("auth");
    setAuth(null);
    setMessages([welcomeMessage]);
    setNotice(null);
  }
  async function sendMessage(content) {
    if (!sessionId)
      return showNotice("Preparing your chat session. Please try again in a moment.", "error");
    setMessages((current) => [...current, { role: "user", content }]);
    try {
      const result = await api(
        "/chat/sessions/" + sessionId + "/messages",
        { method: "POST", body: JSON.stringify({ message: content }) },
        auth.token,
      );
      setMessages((current) => [...current, result.message]);
      if (result.message.details?.service)
        setBooking((current) => ({ ...current, service: result.message.details.service }));
    } catch (error) {
      showNotice(error.message, "error");
    }
  }
  async function createBooking(event) {
    event.preventDefault();
    try {
      await api(
        "/appointments",
        {
          method: "POST",
          body: JSON.stringify({ ...booking, durationMinutes: Number(booking.durationMinutes) }),
        },
        auth.token,
      );
      showNotice("Appointment created successfully. It is now in your schedule.");
      setBooking(emptyBooking);
      loadAppointments();
    } catch (error) {
      showNotice(error.message, "error");
    }
  }

  if (!auth) return <AuthPage onAuthenticated={authenticate} />;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-7">
      <Header user={auth.user} onSignOut={signOut} />
      <div className="flex flex-col justify-between gap-5 py-7 sm:flex-row sm:items-end sm:py-8">
        <div>
          <p className="text-[11px] font-bold tracking-[.15em] text-emerald-700">
            YOUR CARE, SIMPLIFIED
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-emerald-950 sm:text-5xl">
            How can we make time for you?
          </h1>
          <p className="mt-3 text-slate-500">
            Chat with the booking assistant or choose a time directly.
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
          <span className="relative flex size-2" aria-hidden="true">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" />
          </span>
          sparkAI task active
        </span>
      </div>
      {notice && (
        <div
          className={
            "fixed right-4 top-4 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg sm:right-6 sm:top-6 " +
            (notice.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-white text-emerald-950")
          }
          role="status"
        >
          <span
            className={
              "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white " +
              (notice.type === "error" ? "bg-red-500" : "bg-emerald-600")
            }
            aria-hidden="true"
          >
            {notice.type === "error" ? "!" : "✓"}
          </span>
          <span>{notice.message}</span>
          <button
            className="-mr-1 -mt-1 bg-transparent px-1 text-lg leading-none opacity-60 hover:opacity-100"
            aria-label="Dismiss notification"
            onClick={() => setNotice(null)}
          >
            ×
          </button>
        </div>
      )}
      <div className="grid gap-5 lg:grid-cols-[1.35fr_.8fr]">
        <ChatPanel messages={messages} onSend={sendMessage} />
        <aside>
          <BookingForm booking={booking} onChange={setBooking} onSubmit={createBooking} />
          <AppointmentList appointments={appointments} />
        </aside>
      </div>
    </main>
  );
}
