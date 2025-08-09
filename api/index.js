import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import jwt from "jsonwebtoken";
import { audioToAudio, HfInference } from "@huggingface/inference";
import User from "./models/user.js";
import SavedOutfit from "./models/savedoutfit.js";
import Outfit from "./models/outfit.js";
import cosineSimilarity from "compute-cosine-similarity";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors({
  origin: process.env.CORS_ORIGIN || "*"
}));
app.use(express.json());

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
};

// Use MongoDB URI from environment variables
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log("Error connecting to MongoDb", err));

app.post("/register", async (req, res) => {
  try {
    const { email, password, username, gender, profileImage } = req.body;
    console.log("email", email);
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already exists" });
    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ error: "Username already exists" });
    const user = new User({
      email,
      password,
      username,
      gender,
      profileImage,
      outfits: [],
    });

    console.log("user", user);

    await user.save();
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("email", email);
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/save-outfit", authenticateToken, async (req, res) => {
  try {
    const { date, items, caption, occasion, visibility, isOotd } = req.body;
    const userId = req.user.id;

    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const itemsWithImages = items?.map((item) => {
      if (!item || typeof item !== "object") {
        console.warn("Invalid item skipped", item);
        return null;
      }
      let imageUrl = item?.image;
      if (!imageUrl || !imageUrl.match(/^https?:\/\/res\.cloudinary\.com/)) {
        console.warn("Invalid or non-Cloudinary image URL:", imageUrl);
        return null; // Skip invalid URLs
      }
      return {
        id: item.id !== undefined || "null",
        type: item.type || "Unknown",
        image: imageUrl,
        x: item.x !== undefined ? item?.x : 0,
        y: item.y !== undefined ? item?.y : 0,
      };
    });

    const validItems = itemsWithImages.filter((item) => item !== null);

    if (validItems.length == 0) {
      return res.status(400).json({ error: "No valid items provided" });
    }

    const newOutfit = new SavedOutfit({
      userId: user._id,
      date,
      items: validItems,
      caption: caption || "",
      occasion: occasion || "",
      visibilty: visibility || "Everyone",
      isOotd: isOotd || false,
    });

    await newOutfit.save();

    user.outfits.push(newOutfit._id);
    await user.save();

    res.status(201).json({ outfit: newOutfit });
  } catch (err) {
    console.log("Error in save-outfit", err.message);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

app.get("/save-outfit/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }
    const user = await User.findById(userId).populate("outfits");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user.outfits);
  } catch (error) {
    console.error("Error fetching outfits", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

const generateEmbedding = async (text) => {
  const response = await hf.featureExtraction({
    model: "sentence-transformers/all-MiniLM-L6-v2",
    inputs: text,
  });
  return response;
};
const seedData = async () => {
  try {
    // Clear existing outfits and reseed with embeddings
    await Outfit.deleteMany({});
    const count = await Outfit.countDocuments();
    if (count === 0) {
      const outfits = [
        {
          occasion: "date",
          style: "casual",
          items: ["White linen shirt", "Dark jeans", "Loafers"],
          image: "https://i.pinimg.com/736x/b2/6e/c7/b26ec7bc30ca9459b918ae8f7bf66305.jpg",
        },
        {
          occasion: "date",
          style: "elegant",
          items: ["White flared pants", "sandals", "sunglasses"],
          image: "https://i.pinimg.com/736x/8c/61/12/8c6112457ae46fa1e0aea8b8f5ed18ec.jpg",
        },
        {
          occasion: "coffee",
          style: "casual",
          items: ["cropped t-shirt", "wide-leg beige trousers", "Samba sneakers"],
          image: "https://i.pinimg.com/736x/d7/2d/26/d72d268ca4ff150db1db560b25afb843.jpg",
        },
        {
          occasion: "interview",
          style: "formal",
          items: ["Light blue shirt", "wide-leg jeans", "Silver wristwatch"],
          image: "https://i.pinimg.com/736x/1c/50/bc/1c50bcef1b46efe5db4008252ea8cfa5.jpg",
        },
        {
          occasion: "beach",
          style: "beach",
          items: ["brown T shirt", "beige shorts", "Sunglasses"],
          image: "https://i.pinimg.com/1200x/86/57/59/8657592bd659335ffd081fdab10b87a4.jpg",
        },
      ];

      for (const outfit of outfits) {
        const text = `${outfit.occasion} ${outfit.style} ${outfit.items.join(", ")}`;
        const embedding = await generateEmbedding(text);
        await new Outfit({ ...outfit, embedding }).save();
      }
      console.log("✅ Database seeded with", outfits.length, "outfits");
    } else {
      console.log("✅ Database already has", count, "outfits");
    }
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  }
}

seedData();

const normalizeQuery = (query) => {
  const synonyms = {
    "coffee date": "coffee date",
    "dinner date": "date",
    "job interview": "interview",
    work: "interview",
    casual: "casual",
    formal: "formal",
    outfit: "",
    "give me": "",
    a: "",
    an: "",
    for: "",
  };

  let normalized = query.toLowerCase();
  Object.keys(synonyms).forEach((key) => {
    normalized = normalized.replace(
      new RegExp(`\\b${key}\\b`, "gi"),
      synonyms[key]
    );
  });
  return [...new Set(normalized.trim().split(/\s+/).filter(Boolean))].join(" ");
};

app.get("/smart-search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "Query required" });

  try {
    const normalizedQuery = normalizeQuery(query);
    const queryEmbedding = await generateEmbedding(normalizedQuery);
    const outfits = await Outfit.find();

    const MIN_SIMILARITY = query.length > 20 ? 0.3 : 0.4;

    let scored = outfits
      .map((o) => {
        // Check if embedding exists before calculating similarity
        if (o.embedding && o.embedding.length > 0) {
          const score = cosineSimilarity(queryEmbedding, o.embedding);
          return { ...o.toObject(), score };
        } else {
          // Fallback to text matching if no embedding
          const text = `${o.occasion} ${o.style} ${o.items.join(" ")}`.toLowerCase();
          const normalizedQueryLower = normalizedQuery.toLowerCase();
          let score = 0;
          
          if (o.occasion.toLowerCase().includes(normalizedQueryLower)) score += 0.5;
          if (o.style.toLowerCase().includes(normalizedQueryLower)) score += 0.3;
          if (text.includes(normalizedQueryLower)) score += 0.2;
          
          return { ...o.toObject(), score };
        }
      })
      .filter((o) => o.score >= MIN_SIMILARITY)
      .sort((a, b) => b.score - a.score);

    if (scored.length === 0) {
      const queryTerms = normalizedQuery.split(" ");
      scored = outfits
        .filter((o) =>
          queryTerms.some(
            (term) =>
              o.occasion.toLowerCase().includes(term) ||
              o.style.toLowerCase().includes(term) ||
              o.items.some((item) => item.toLowerCase().includes(term))
          )
        )
        .map((o) => ({ ...o.toObject(), score: 0.1 }));
    }

    res.json(scored.slice(0, 5));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);

});