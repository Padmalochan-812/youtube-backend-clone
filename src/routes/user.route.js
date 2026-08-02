import { Router } from "express";
import { 
    logoutUser,
    loginUser,
    registerUser, 
    refereshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar, 
    updateUserCoverImage, 
    getUserChannelProfile, 
    getWatchHistory 
} from "../controllers/user.controllers.js";

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
router.route("/change-password").post(veryfyJWT, changeCurrentPassword)
router.route("/current-user").get(veryfyJWT, getCurrentUser)
router.route("/update-account").patch(veryfyJWT, updateAccountDetails)

router.route("/avatar").patch(veryfyJWT, upload.single("avatar"), updateUserAvatar)
router.route("/cover-image").patch(veryfyJWT, upload.single("coverImage"), updateUserCoverImage)

router.route("/c/:username").get(veryfyJWT, getUserChannelProfile)
router.route("/history").get(veryfyJWT, getWatchHistory)

export default router ;