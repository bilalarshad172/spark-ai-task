import {
  addAppointment,
  getAppointmentsForUser,
} from "../services/dataService.js";
export async function listAppointments(req, res, next) {
  try {
    res.json({ appointments: await getAppointmentsForUser(req.user.sub) });
  } catch (error) {
    next(error);
  }
}
export async function createAppointment(req, res, next) {
  try {
    const { service, startsAt, durationMinutes = 30, notes = "" } = req.body;
    if (!service?.trim() || !startsAt || Number.isNaN(Date.parse(startsAt)))
      return res
        .status(400)
        .json({ error: "Service and a valid appointment time are required." });
    if (durationMinutes < 15 || durationMinutes > 240)
      return res
        .status(400)
        .json({ error: "Duration must be between 15 and 240 minutes." });
    const appointment = await addAppointment({
      user_id: req.user.sub,
      service: service.trim(),
      starts_at: new Date(startsAt).toISOString(),
      duration_minutes: Number(durationMinutes),
      notes: notes.slice(0, 1000),
      status: "confirmed",
    });
    res.status(201).json({ appointment });
  } catch (error) {
    next(error);
  }
}
