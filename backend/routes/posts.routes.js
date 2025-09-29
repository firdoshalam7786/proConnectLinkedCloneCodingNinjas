import { Router } from "express";
import {
  activeCheck,
  createPost,
  delete_comment_of_user,
  deletePost,
  get_comments,
  getAllPosts,
  incrementLikes,
} from "../controllers/posts.controller.js";
import multer from "multer";
import { commentPost } from "../controllers/user.controller.js";

const router = Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

router.route("/").get(activeCheck);
router.route("/post").post(upload.single("media"), createPost);
router.route("/posts").get(getAllPosts);
router.route("/delete_post").delete(deletePost);
router.route("/comment").post(commentPost);
router.route("/get_comments").get(get_comments);
router.route("/delete_comments").delete(delete_comment_of_user);
router.route("/increment_post_like").post(incrementLikes);

export default router;
