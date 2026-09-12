const postService = require("../services/post.service.js");
const asyncHandler = require("../utils/asyncHandler.js");
const { getPostQuerySchema } = require("../validations/post.validation.js");

const createPost = asyncHandler(async (req, res) => {
  const post = await postService.createPost({
    body: req.body,
    userId: req.user.userId,
    file: req.file
  });

  return res.status(201).json({
    success: true,
    message: "Post created successfully",
    data: post,
  });
});

const getPosts = asyncHandler(async (req, res) => {
  const query = getPostQuerySchema.parse(req.query);

  const result = await postService.getPosts(query);

  return res.status(200).json({
    success: true,
    ...result,
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  console.log(postId);

  const post = await postService.getPostById(postId);

  return res.status(200).json({
    success: true,
    post,
  });
});

const updatePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  console.log(postId);

  const post = await postService.updatePost(postId, req.user.userId, req.body);

  return res.status(200).json({
    success: true,
    message: "Post updated successfully",
    post,
  });
});

const deletePost = asyncHandler(async (req, res) => {
  const postId = req.params.id;
  await postService.deletePost(postId, req.user.userId);

  return res.status(200).json({
    success: true,
    message: "Post deleted successfully",
  });
});

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
