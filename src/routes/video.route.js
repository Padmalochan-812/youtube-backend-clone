import { Router } from "express";

import { publishAVideo, getAllVideos } from "../controllers/video.controller.js"

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
            name: "thumbinl",
            maxCount: 1
        }
    ]),
    publishAVideo
)
router.route("/getallvideos").get(verifyJWT, getAllVideos)

export default router ;