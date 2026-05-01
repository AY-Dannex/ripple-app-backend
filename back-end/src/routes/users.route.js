import { Router } from "express";
import protect from "../middleware/auth.middleware.js"
import upload from "../middleware/upload.middleware.js";
import { registerUser, loginUsers, logoutUsers, getProfile, updateProfile, getOtherUserProfile, assignRole, suspendUser, deleteUser, uploadProfilePic, getUser, getAllUsers } from "../controllers/user.controller.js";

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUsers)
router.route('/profile').get(protect, getProfile)
router.route('/update-profile').patch(protect, updateProfile)
router.route('/get-other-user-profile').get(protect, getOtherUserProfile)
router.route('/upload-profile-pic').patch(protect, upload.single("profilePic"), uploadProfilePic)
router.route('/logout').post(logoutUsers)
router.route('/assign-role').patch(protect, assignRole)
router.route('/suspend').patch(protect, suspendUser)
router.route('/delete').delete(protect, deleteUser)
router.route('/get-user').get(protect, getUser)
router.route('/get-all-users').get(protect, getAllUsers)

export default router