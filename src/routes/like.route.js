import { Router } from "express";
import { toggleVideoLike, toggleCommentLike, toggleTweetLike, getLikedVideos  } from "../controllers/like.controller.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.route("/like-video/:videoId").post(verifyJWT, toggleCommentLike);
router.route("/like-comment/:commentId").post( verifyJWT, toggleCommentLike);
router.route("/like-tweet/:tweetId").post( verifyJWT, toggleTweetLike);

router.route("/get-like-video").get( verifyJWT, getLikedVideos);

export default router ;