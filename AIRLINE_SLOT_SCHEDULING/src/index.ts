import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import createEnhancedAppointmentsRouter from "./routes/appointments";

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/appointments", createEnhancedAppointmentsRouter());

// Root
app.get("/", (_req,res)=> res.send("🌿 AyurSutra ATC Scheduler is running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, ()=> console.log(`🚀 API running on http://localhost:${PORT}`));
