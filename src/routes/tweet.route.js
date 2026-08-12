import { Router } from "express";
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js";

import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/create-tweet", verifyJWT, createTweet);

router.get("/get-tweet/:userId", verifyJWT, getUserTweets);

router.patch("/update-tweet/:tweetId", verifyJWT, updateTweet);

router.post("/delete-tweet/:tweetId", verifyJWT, deleteTweet);

export default router;