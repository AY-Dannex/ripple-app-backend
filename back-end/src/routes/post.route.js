import { Router } from "express";
import { createPost, deletePost, updatePost, getAllPost, getUserPost } from "../controllers/post.controller.js";
import protect from "../middleware/auth.middleware.js";

const router = Router()

router.route('/create', ).post(protect, createPost)
router.route('/update/:id', ).patch(protect, updatePost)
router.route('/delete/:id', ).delete(protect, deletePost)
router.route('/', ).get(protect, getAllPost)
router.route('/user', ).get(protect, getUserPost)

export default router