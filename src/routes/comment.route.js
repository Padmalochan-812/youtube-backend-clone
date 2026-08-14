import {Router} from "express"

import { addComment, getVideoComments, updateComment, deleteComment } from "../controllers/comment.controller.js"

import { verifyJWT } from "../middlewares/auth.middlewares.js"

const router = Router()

router.route("/add-comment/:videoId").post(verifyJWT, addComment)
router.route("/get-video-comment/:videoId").get(verifyJWT, getVideoComments)
router.route("/update-comment/:commentId").patch(verifyJWT, updateComment) 
router.route("/delete-comment/:commentId").post(verifyJWT, deleteComment)

export default router ;