import { Router } from "express";
import protect from "../middleware/auth.middleware.js"
import { registerUser, loginUsers, logoutUsers, getProfile, assignRole, suspendUser, deleteUser } from "../controllers/user.controller.js";

const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUsers)
router.route('/profile').get(protect, getProfile)
router.route('/logout').post(logoutUsers)
router.route('/assign-role').patch(protect, assignRole)
router.route('/suspend').patch(protect, suspendUser)
router.route('/delete').delete(protect, deleteUser)

export default router