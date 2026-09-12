const express = require("express");
const authMiddleware = require("../middleware/auth.middleware.js");
const validate = require("../middleware/validate.middleware.js");
const {
  createPostSchema,
  updatePostSchema,
} = require("../validations/post.validation.js");
const postController = require("../controllers/post.controller.js");
const upload = require("../middleware/upload.middleware.js");

const router = express.Router();

// Create New Post
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  validate(createPostSchema),
  postController.createPost,
);

// Update Post
router.patch(
  "/:id",
  authMiddleware,
  validate(updatePostSchema),
  postController.updatePost,
); 

//Get Total Posts
router.get("/", postController.getPosts);

//Get Post By Id
router.get("/:id", postController.getPostById);

// Delte Single Post
router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
