import Post from "../models/posts.model.js";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import Comment from "../models/comments.model.js";


export const activeCheck = (req, res) => {
  return res.status(200).json({ message: "RUNNING" });
};

// create post
export const createPost = async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = new Post({
      userId: user._id,
      body: req.body.body,
      media: req.file != undefined ? req.file.filename : "",
      fileType: req.file != undefined ? req.file.mimetype.split("/")[1] : "",
    });
    await post.save();
    return res.status(200).json({ message: "Post Created" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// all posts function
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate({
      path: "userId",
      select: "name email username profilePicture",
    });
    return res.json({ posts });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Delete post
export const deletePost = async (req, res) => {
  const { token, post_id } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    await Post.deleteOne({ _id: post_id });
    return res.json({ message: "Delete Post" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// get comments
export const get_comments = async (req, res) => {
  const { post_id } = req.query;
  // console.log("Post ID", post_id)
  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comments = await Comment.find({postId: post_id})
    .populate({
      path: "userId",
      select: "username name",
    });
    return res.json(comments.reverse());
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// delete comment user
export const delete_comment_of_user = async (req, res) => {
  const { token, comment_id } = req.body;

  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const comment = await Comment.findOne({ _id: comment_id });
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (comment.userId.toString() !== user._id.toString()) {
      return res.status(404).json({ message: "Unauthorized" });
    }
    await Comment.deleteOne({ _id: comment_id });
    return res.json({ message: "Comment Delete" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// increment likes
export const incrementLikes = async (req, res) => {
  const { post_id } = req.body;

  try {
    const post = await Post.findOne({ _id: post_id });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    post.likes = post.likes + 1;
    await post.save();
    return res.json({ message: "like incremented" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
