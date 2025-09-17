// backend/src/routes/scheduling.ts
import { Router } from "express";
const schedulingController = require("../controllers/schedulingController");

const router = Router();

// POST /api/schedule/slots
router.post("/slots", schedulingController.getCandidateSlots);

// POST /api/schedule/reallocate
router.post("/reallocate", schedulingController.handleReallocation);

module.exports = router;
