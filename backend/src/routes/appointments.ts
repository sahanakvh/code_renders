import { Router } from "express";
const router = Router();
const appointmentsController = require("../controllers/appointmentsController");

router.get("/slots", appointmentsController.getBoard); // ?date=YYYY-MM-DD
router.post("/preview", appointmentsController.previewCandidates);
router.post("/", appointmentsController.createAppointmentOrWaitlist); // booking or waitlist
router.get("/waitlist", appointmentsController.getWaitlist);
router.post("/cancel", appointmentsController.cancelAppointment);

module.exports = router;
