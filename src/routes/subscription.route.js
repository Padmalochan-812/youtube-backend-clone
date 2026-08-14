import { Router } from "express";
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels 
} from "../controllers/subscription.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router() 

router.route("/u/:subscriberId").get(verifyJWT, getUserChannelSubscribers);
router.route("/c/:channelId").get(verifyJWT,getSubscribedChannels);
router.route("/c/:channelId").post(verifyJWT, toggleSubscription);

export default router;