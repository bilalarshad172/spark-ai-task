export default function BookingForm({ booking, onChange, onSubmit }) {
  const update = (field) => (event) => onChange({ ...booking, [field]: event.target.value });
  const field =
    "mt-1 block w-full rounded-lg border border-emerald-950/15 bg-white p-2.5 outline-emerald-500";
  const label = "my-3 block text-xs font-bold text-emerald-950/75";
  return (
    <form
      className="rounded-2xl border border-emerald-950/10 bg-white px-5 pb-5 shadow-[0_8px_25px_#16463710]"
      onSubmit={onSubmit}
    >
      <div className="-mx-5 mb-3 border-b border-emerald-950/5 px-5 py-[18px]">
        <h2 className="text-base font-bold">Book a time</h2>
        <small className="text-xs text-slate-500">We will confirm it instantly.</small>
      </div>
      <label className={label}>
        Service
        <input
          className={field}
          required
          value={booking.service}
          onChange={update("service")}
          placeholder="Consultation"
        />
      </label>
      <label className={label}>
        When
        <input
          className={field}
          required
          type="datetime-local"
          value={booking.startsAt}
          onChange={update("startsAt")}
        />
      </label>
      <label className={label}>
        Duration
        <select
          className={field}
          value={booking.durationMinutes}
          onChange={update("durationMinutes")}
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
        </select>
      </label>
      <label className={label}>
        Note <small className="font-normal">optional</small>
        <textarea className={field} value={booking.notes} onChange={update("notes")} />
      </label>
      <button className="mt-2 w-full rounded-lg bg-emerald-800 p-3 font-bold text-white">
        Confirm appointment
      </button>
    </form>
  );
}
