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
  const [notice, setNotice] = useState("");

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
        if (active) setNotice(error.message);
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

  function authenticate(data) {
    localStorage.setItem("auth", JSON.stringify(data));
    setAuth(data);
  }
  function signOut() {
    localStorage.removeItem("auth");
    setAuth(null);
    setMessages([welcomeMessage]);
  }
  async function sendMessage(content) {
    if (!sessionId) return setNotice("Preparing your chat session. Please try again in a moment.");
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
      setNotice(error.message);
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
      setNotice("Appointment confirmed - it is now in your schedule.");
      setBooking(emptyBooking);
      loadAppointments();
    } catch (error) {
      setNotice(error.message);
    }
  }

  if (!auth) return <AuthPage onAuthenticated={authenticate} />;
  return (
    <main className="mx-auto max-w-6xl px-4 pb-10 sm:px-7">
      <Header user={auth.user} onSignOut={signOut} />
      <div className="flex flex-col justify-between gap-5 py-9 sm:flex-row sm:items-end sm:py-13">
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
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          Assistant online
        </span>
      </div>
      {notice && (
        <div className="mb-5 rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
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
