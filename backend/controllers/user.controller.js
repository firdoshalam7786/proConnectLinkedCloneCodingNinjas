import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Comment from "../models/comments.model.js";

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();

  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const fullPath = path.join("uploads", outputPath);
  const stream = fs.createWriteStream(fullPath);
  doc.pipe(stream);

  doc.image(`uploads/${userData.userId.profilePicture}`, {
    align: "center",
    width: 100,
  });
  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost}`);

  doc.fontSize(14).text("Post Work: ");
  userData.postWork.forEach((work, index) => {
    doc.fontSize(14).text(`Company Name: ${work.company}`);
    doc.fontSize(14).text(`Position: ${work.position}`);
    doc.fontSize(14).text(`Years: ${work.years}`);
  });
  doc.end();
  return outputPath;
};

// Register callback function
export const register = async (req, res) => {
  // console.log("BODY ===>", req.body);

  try {
    const { email, name, password, username } = req.body;

    // Validation
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });
    await newUser.save();

    // Create profile for user
    const profile = new Profile({ userId: newUser.id });
    await profile.save();

    return res.status(201).json({
      message: "User Created Successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        username: newUser.username,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Login callback function

export const login = async (req, res) => {
  try {
    const { email, password } = req.body; // ✅ req.body se values lena
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // ✅ User ko DB se find karo
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User does not exist" });

    // ✅ Compare hashed password with bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid Credentials" });

    // ✅ Token generate karo
    const token = crypto.randomBytes(32).toString("hex");

    await User.updateOne({ _id: user._id }, { token });
    return res.json({ token:token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// upload profile picture

export const uploadProfilePicture = async (req, res) => {
  const { token } = req.body;

  try {
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    user.profilePicture = req.file.filename;
    user.save();
    return res.json({ message: "Profile Picture Updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//update userProfilePicture
export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;
    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, email } = newUserData;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });

    if (existingUser) {
      if (existingUser || String(existingUser._id) !== String(user._id)) {
        return res.status(404).json({ message: "User already exist" });
      }
    }
    Object.assign(user, newUserData);
    await user.save();
    return res.json({ message: "User Updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get User and Profile
export const getUserAndProfile = async (req, res) => {
  
  try {
    const { token } = req.query;

    const user = await User.findOne({ token: token });
    if (!user) {
      return res.status(404).json({ message: "User Not found" });
    }
    const userProfile = await Profile.findOne({ userId: user._id }).populate({
      path: "userId",
      select: "name email username profilePicture",
    });
    
    return res.json(userProfile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Update profile data
export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newProfileData } = req.body;
    const userProfile = await User.findOne({ token: token });
    if (!userProfile) {
      return res.status(404).json({ message: "User not found" });
    }
    const profile_to_update = await Profile.findOne({
      userId: userProfile._id,
    });
    Object.assign(profile_to_update, newProfileData);
    await profile_to_update.save();
    return res.json({ message: "Profile Updated" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}; 

// all user search functionality
export const getAllUserProfile = async (req, res) => {
  try {
    const profiles = await Profile.find().populate({
      path: "userId",
      select: "name email username profilePicture",
    });
    return res.json({ profiles:profiles });
    
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// User download resume
export const downloadProfile = async (req, res) => {
  const user_id = req.query.id;
  const userProfile = await Profile.findOne({ userId: user_id }).populate({
    path: "userId",
    select: "name email username profilePicture",
  });
  let outputPath = await convertUserDataTOPDF(userProfile);
  return res.json({ message: outputPath });
};

//Send Connection Request
export const sendConnectionRequest = async (req, res) => {
  const { token, connectionId } = req.body;

  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connectionUser = await User.findOne({ _id: connectionId });
    if (!connectionId) {
      return res.status(404).json({ message: "Connection user not found" });
    }
    const existingRequest = await ConnectionRequest.findOne({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    if (existingRequest) {
      return res.status(400).json({ message: "Request already send" });
    }

    const request = new ConnectionRequest({
      userId: user._id,
      connectionId: connectionUser._id,
    });
    await request.save();
    return res.json({ message: "Request Send" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get My connection requests
export const getMyConnectionRequest = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      userId: user._id,
    }).populate({
      path: "connectionId",
      select: "name email username profilePicture",
    });
    console.log("getMyConnectionRequest backend response:", connections);
    return res.json({connections});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const { token } = req.query;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connections = await ConnectionRequest.find({
      connectionId: user._id,
    }).populate({
      path: "userId", // change kia h connectionId ko
      select: "name email username profilePicture",
    });
    // console.log(connections)
    return res.json({connections});
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Accept connection request
export const acceptConnectionRequests = async (req, res) => {
  const { token, requestId, action_type } = req.body;
  try {
    const user = await User.findOne({ token });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const connection = await ConnectionRequest.findOne({ _id: requestId });
    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }
    if (action_type === "accept") {
      connection.status_accepted = true;
    } else {
      connection.status_accepted = false;
    }
    await connection.save();
    return res.json({message:"Request updated"})
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Comments Posts
export const commentPost = async (req, res) => {
  const { token, post_id, commentBody } = req.body;
  try {
    const user = await User.findOne({ token: token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = await Post({
      _id: post_id,
    });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = new Comment({
      userId: user._id,
      postId: post_id,
      body: commentBody,
    });
    await comment.save();
    return res.status(200).json({ message: "Comment Added" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// get User profile and user basedOn userName
export const getUserProfileAndUserBasedOnUsername = async(req,res)=>{
  const {username} = req.query

  try {
    const user = await User.findOne({username})
    if(!user){
      return res.status(404).json({message:"User not found"})
    }
    const userProfile = await Profile.findOne({userId: user._id})
    .populate({
      path: "userId",
      select: "name email username profilePicture",
    });
    return res.json({"profile": userProfile})
  } catch (error) {
    return res.status(500).json({message:error.message})
  }
}
