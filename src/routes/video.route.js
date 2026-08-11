import { Router } from "express";

import { publishAVideo, getAllVideos, getVideoById, updateVideo, deleteVideo, togglePublishStatus} from "../controllers/video.controller.js"

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
router.route("/get-all-videos").get(verifyJWT, getAllVideos)

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

router.route("/delete-video/:videoId").post(verifyJWT, deleteVideo)

router.route("/toggle-publish-status/:videoId").post(verifyJWT, togglePublishStatus)

export default router ;