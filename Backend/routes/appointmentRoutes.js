import { Router } from "express";
import {
  createAppointment,
  listAppointments,
} from "../controllers/appointmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
const router = Router();
router.use(authenticate);
router.route("/").get(listAppointments).post(createAppointment);
export default router;
