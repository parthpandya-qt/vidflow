import { Router } from "express";
import { registerUser, 
        loginUser, 
        logoutUser, 
        refreshAccessToken,
        getCurrentUser,
        updateAccountDetail,
        updateAvatar,
        updateCoverImage,
        getUserChannelProfile,
        getUserwatchHistory } from "../controllers/users.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


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
//secure routes

router.route("/logout").post(verifyJwt, logoutUser)

router.route("/refresh-token").get(refreshAccessToken)


router.route("/current-user").get(verifyJwt, getCurrentUser)

router.route("/update-account").patch(verifyJwt, updateAccountDetail)

router.route("/update-avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar)

router.route("/update-cover-image").patch(verifyJwt, upload.single("coverImage"), updateCoverImage)

router.route("/c/:userName").get(verifyJwt,getUserChannelProfile)

router.route("/watch-history").get(verifyJwt, getUserwatchHistory)



export default router