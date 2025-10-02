import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import postRouter from "./routes/posts.routes.js"
import userRoutes from './routes/user.routes.js'

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(postRouter);
app.use(userRoutes);
app.use(express.static("uploads"))

const PORT = process.env.PORT || 9090;

const MONGO_URL =  "mongodb+srv://firdoshalam7996_db_user:RY5X7eRfEVga88rt@socialmediaapp.gxxwc3x.mongodb.net/socialMediaDB"

const start = async () => {
  try {
    await mongoose.connect(
      MONGO_URL
    );
    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log("🚀 Server is running on port 9090");
    });
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};

start();
