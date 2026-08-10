import { Router } from "express";

import { publishAVideo, getAllVideos, getVideoById, updateVideo } from "../controllers/video.controller.js"

import { upload } from "../middlewares/multer.middlewares.js"
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router()

router.route("/publishavideo").post(
    verifyJWT,
    upload.fields([
        {
            name: "videoFile",
            maxCount :  1
        },
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    publishAVideo
)
router.route("/getallvideos").get(verifyJWT, getAllVideos)

router.route("/one-video/:videoId").get(verifyJWT, getVideoById)

router.route("/update-video/:videoId").patch(
    verifyJWT,
    upload.fields([
        {
            name: "thumbnail",
            maxCount: 1
        }
    ]),
    updateVideo
)

export default router ;