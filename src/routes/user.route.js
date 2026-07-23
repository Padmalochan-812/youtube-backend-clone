import { Router } from "express";
import { logoutUser,loginUser, registerUser, refereshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"
import { veryfyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();


router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

//secured routes 

router.route("/logout").post(veryfyJWT, logoutUser)
router.route("/referesh-token").post(refereshAccessToken)

export default router ;