import { Router } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/health-status").get(verifyJWT, healthCheck);

export default router