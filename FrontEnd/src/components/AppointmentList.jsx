export default function AppointmentList({ appointments }) {
  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-emerald-950/10 bg-white shadow-[0_8px_25px_#16463710]">
      <div className="border-b border-emerald-950/5 px-5 py-[18px]">
        <h2 className="text-base font-bold">Upcoming</h2>
        <small className="text-xs text-slate-500">Your confirmed visits</small>
      </div>
      {appointments.length ? (
        appointments.map((appointment) => (
          <div className="border-t border-emerald-950/5 px-5 py-3.5 text-sm" key={appointment.id}>
            <b>{appointment.service}</b>
            <small className="mt-1 block text-xs text-slate-500">
              {new Date(appointment.starts_at).toLocaleString()} - {appointment.status}
            </small>
          </div>
        ))
      ) : (
        <p className="p-5 text-sm text-slate-500">No appointments yet.</p>
      )}
    </section>
  );
}
