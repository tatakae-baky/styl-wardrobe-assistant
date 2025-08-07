import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import { HfInference } from "@huggingface/inference";
// import bcrypt from "bcryptjs";
// import axios from "axios";
// import { computeCosineSimilarity } from "compute-cosine-similarity";
// import dotenv from "dotenv";

// dotenv.config();

const app = express();
const port = 3000;
const JWT_SECRET = "";
app.use(cors());

app.use(express.json());
mongoose
  .connect("mongodb+srv://baky:baky@cluster0.o4mpmbd.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
